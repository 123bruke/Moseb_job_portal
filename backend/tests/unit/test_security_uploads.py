import time

import jwt
import pytest

from app.utils.uploads import safe_filename


def test_safe_filename_blocks_traversal():
    assert safe_filename("../../etc/passwd") == "passwd"
    assert safe_filename("my résumé (final).pdf") == "my_r_sum___final_.pdf"
    assert safe_filename("") == "file"


def test_sniff_by_magic_bytes_not_extension():
    from app.ml.pdf_reader.reader import sniff
    assert sniff(b"%PDF-1.7 ...") == "pdf"
    assert sniff(b"MZ\x90\x00\x03\x00\x00\x00") == "unknown"
    assert sniff(b"plain text resume") == "txt"


def test_verify_token_rejects_bad_and_expired():
    pytest.importorskip("fastapi")
    from app.core.errors import AppError
    from app.core.security import verify_token
    secret = "test-secret-test-secret-test-secret-123"
    good = jwt.encode({"sub": "u1", "aud": "authenticated", "exp": time.time() + 60}, secret, algorithm="HS256")
    assert verify_token(good)["sub"] == "u1"
    for bad in (jwt.encode({"sub": "u1", "aud": "authenticated", "exp": time.time() - 5}, secret, algorithm="HS256"),
                jwt.encode({"sub": "u1", "aud": "authenticated"}, "wrong", algorithm="HS256"), "garbage"):
        with pytest.raises(AppError):
            verify_token(bad)

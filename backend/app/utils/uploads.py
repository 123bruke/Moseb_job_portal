"""Upload hardening: size, MIME sniffing, page limit, filename sanitising, optional ClamAV scan."""
import re
import socket
import struct

from app.core.config import get_settings
from app.core.errors import bad_request
from app.ml.pdf_reader.reader import page_count, sniff

ALLOWED = {"pdf", "docx", "txt"}


def safe_filename(name: str) -> str:
    base = re.sub(r"[^A-Za-z0-9._-]", "_", (name or "file").split("/")[-1].split("\\")[-1])
    return base.lstrip(".")[:80] or "file"


def clamav_scan(data: bytes) -> bool:
    """INSTREAM scan. Returns True if clean or scanning is not configured."""
    host = get_settings().clamav_host
    if not host:
        return True
    with socket.create_connection((host, 3310), timeout=20) as s:
        s.sendall(b"zINSTREAM\0")
        for i in range(0, len(data), 8192):
            chunk = data[i:i + 8192]
            s.sendall(struct.pack("!I", len(chunk)) + chunk)
        s.sendall(struct.pack("!I", 0))
        return b"FOUND" not in s.recv(1024)


def validate_upload(data: bytes, filename: str, allowed: set[str] = ALLOWED) -> tuple[str, str]:
    """Returns (kind, safe_name) or raises 400."""
    st = get_settings()
    if not data:
        raise bad_request("Empty file", "empty_file")
    if len(data) > st.max_resume_mb * 1024 * 1024:
        raise bad_request(f"File larger than {st.max_resume_mb} MB", "file_too_large")
    kind = sniff(data)
    if kind not in allowed:
        raise bad_request("Unsupported file type (PDF, DOCX or TXT only)", "bad_file_type")
    try:
        if page_count(data, kind) > st.max_resume_pages:
            raise bad_request(f"Resume has more than {st.max_resume_pages} pages", "too_many_pages")
    except Exception as e:
        if hasattr(e, "status_code"):
            raise
        raise bad_request("File is corrupted or unreadable", "corrupt_file") from None
    if not clamav_scan(data):
        raise bad_request("File failed the malware scan", "malware")
    return kind, safe_filename(filename)

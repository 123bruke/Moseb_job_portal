"""Verify Supabase JWTs. Supabase handles sign-up/login; the API only verifies tokens."""
import jwt

from app.core.config import get_settings
from app.core.errors import AppError


def verify_token(token: str) -> dict:
    s = get_settings()
    if not s.supabase_jwt_secret:
        raise AppError(500, "misconfigured", "SUPABASE_JWT_SECRET not set")
    try:
        claims = jwt.decode(token, s.supabase_jwt_secret, algorithms=["HS256"], audience="authenticated")
    except jwt.ExpiredSignatureError:
        raise AppError(401, "token_expired", "Session expired") from None
    except jwt.PyJWTError:
        raise AppError(401, "invalid_token", "Invalid token") from None
    if not claims.get("sub"):
        raise AppError(401, "invalid_token", "Token has no subject")
    return claims

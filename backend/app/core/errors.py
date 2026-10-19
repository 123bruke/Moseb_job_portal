"""Standard error envelope: {"error": {"code", "message", "request_id"}}."""
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.logging import request_id_var


class AppError(HTTPException):
    def __init__(self, status: int, code: str, message: str):
        super().__init__(status_code=status, detail={"code": code, "message": message})


def not_found(what: str = "resource") -> AppError:
    return AppError(404, "not_found", f"{what} not found")


def forbidden(msg: str = "not allowed") -> AppError:
    return AppError(403, "forbidden", msg)


def bad_request(msg: str, code: str = "bad_request") -> AppError:
    return AppError(400, code, msg)


def _body(status: int, code: str, message: str) -> JSONResponse:
    return JSONResponse(status_code=status,
                        content={"error": {"code": code, "message": message, "request_id": request_id_var.get()}})


def install(app: FastAPI) -> None:
    @app.exception_handler(HTTPException)
    async def _http(_: Request, exc: HTTPException):
        d = exc.detail if isinstance(exc.detail, dict) else {"code": "http_error", "message": str(exc.detail)}
        return _body(exc.status_code, d["code"], d["message"])

    @app.exception_handler(RequestValidationError)
    async def _val(_: Request, exc: RequestValidationError):
        return _body(422, "validation_error", "; ".join(f"{'.'.join(map(str, e['loc']))}: {e['msg']}" for e in exc.errors()))

    @app.exception_handler(Exception)
    async def _any(_: Request, exc: Exception):
        import logging
        logging.getLogger("app").exception("unhandled error")
        return _body(500, "internal_error", "Something went wrong")

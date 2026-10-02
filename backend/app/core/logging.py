"""Structured logging with request ids. PII (names, emails, resume text) is never logged."""
import contextvars
import logging
import re
import sys

request_id_var: contextvars.ContextVar[str] = contextvars.ContextVar("request_id", default="-")
_EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")


class _Filter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get()
        record.msg = _EMAIL.sub("[email]", str(record.msg))
        return True


def setup_logging(level: str = "INFO") -> None:
    h = logging.StreamHandler(sys.stdout)
    h.setFormatter(logging.Formatter("%(asctime)s %(levelname)s [%(request_id)s] %(name)s: %(message)s"))
    h.addFilter(_Filter())
    root = logging.getLogger()
    root.handlers = [h]
    root.setLevel(level)

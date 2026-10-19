"""Tiny scheduler: (1) close + rank jobs whose deadline passed, (2) daily retention cleanup."""
import logging
import time

from app.core.logging import setup_logging
from app.repositories import pg
from app.workers import cleanup, rank_job

log = logging.getLogger("scheduler")


def tick() -> None:
    rows = pg.all_("update jobs set status='closed' where status='open' and deadline is not null and deadline < now() returning id")
    for r in rows:
        pg.audit(None, "auto_close", "job", str(r["id"]))
        rank_job.enqueue(str(r["id"]))
        log.info("deadline passed, ranking job %s", r["id"])


def main() -> None:
    setup_logging()
    last_cleanup = 0.0
    while True:
        try:
            tick()
            if time.time() - last_cleanup > 86400:
                cleanup.enqueue()
                last_cleanup = time.time()
        except Exception:
            log.exception("scheduler tick failed")
        time.sleep(60)


if __name__ == "__main__":
    main()

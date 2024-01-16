import logging

import structlog


def setup_logging():
    logging_format = (
        "%(asctime)s %(levelname)9s %(name)s:%(lineno)4s: %(message)s"
    )
    logging.basicConfig(
        level=logging.INFO, format=logging_format
    )
    structlog.configure(
        processors=[
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.contextvars.merge_contextvars,
            structlog.processors.KeyValueRenderer(
                key_order=["event", "view", "peer"]
            ),
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
    )

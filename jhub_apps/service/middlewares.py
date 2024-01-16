import uuid

from fastapi import Request, Response

import structlog


def create_middlewares(app):
    @app.middleware("http")
    async def logging_middleware(request: Request, call_next) -> Response:
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            request_id=str(uuid.uuid4()),
        )

        response: Response = await call_next(request)
        return response
    return app

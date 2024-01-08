import logging
import os
import typing
from datetime import timedelta, datetime

import jwt
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)


def create_access_token(data: dict, expires_delta: typing.Optional[timedelta] = None):
    logger.info("Creating access token")
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    secret_key = os.environ["JHUB_APP_JWT_SECRET_KEY"]
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm="HS256")
    return encoded_jwt


def get_jhub_token_from_jwt_token(token):
    logger.info("Trying to get JHub Apps token from JWT Token")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "msg": "Could not validate credentials"
        },
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, os.environ["JHUB_APP_JWT_SECRET_KEY"], algorithms=["HS256"])
        access_token_data: dict = payload.get("sub")
        if access_token_data is None:
            raise credentials_exception
    except jwt.PyJWTError as e:
        logger.warning("Authentication failed for token")
        logger.exception(e)
        raise credentials_exception
    logger.info("Fetched access token from JWT Token")
    return access_token_data["access_token"]

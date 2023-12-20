import os
import typing
from datetime import timedelta, datetime

import jwt
from fastapi import HTTPException, status


def create_access_token(data: dict, expires_delta: typing.Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    secret_key = os.environ["JWT_SECRET_KEY"]
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm="HS256")
    return encoded_jwt


def get_jhub_token_from_jwt_token(token):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET_KEY"], algorithms=["HS256"])
        access_token_data: dict = payload.get("sub")
        if access_token_data is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    return access_token_data["access_token"]

import logging
from typing import Generator, Dict, Any, Optional
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import psycopg

from backend.app.config import settings
from backend.app.database import get_connection_params
from backend.app.security import decode_access_token

logger = logging.getLogger(__name__)
security_scheme = HTTPBearer(auto_error=False)

def get_db_conn() -> Generator[psycopg.Connection, None, None]:
    """Yield an unauthenticated raw database connection."""
    conn = psycopg.connect(**get_connection_params())
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    conn: psycopg.Connection = Depends(get_db_conn)
) -> Dict[str, Any]:
    """
    Validate the Bearer token, look up the user record, and return the user dictionary.
    Raises 401 if token is missing or invalid.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    auth_id = payload["sub"]
    user_id = payload.get("user_id")

    with conn.cursor() as cur:
        if user_id:
            cur.execute("SELECT * FROM public.users WHERE id = %s AND is_active = true;", (user_id,))
        else:
            cur.execute("SELECT * FROM public.users WHERE auth_id = %s AND is_active = true;", (auth_id,))
        user = cur.fetchone()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account is deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return dict(user)

def get_tenant_db(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Generator[psycopg.Connection, None, None]:
    """
    Yields a connection that is activated with PostgreSQL Row-Level Security
    for the current user (SET LOCAL ROLE authenticated; SET LOCAL request.jwt.claim.sub = user.auth_id).
    """
    conn = psycopg.connect(**get_connection_params())
    try:
        auth_id = current_user.get("auth_id") or current_user["id"]
        with conn.cursor() as cur:
            cur.execute("SELECT set_config('role', 'authenticated', true);")
            cur.execute("SELECT set_config('request.jwt.claim.sub', %s, true);", (str(auth_id),))
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

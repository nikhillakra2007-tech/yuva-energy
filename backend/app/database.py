import logging
from contextlib import contextmanager
from typing import Generator, Optional
import psycopg
from psycopg.rows import dict_row

from backend.app.config import settings

logger = logging.getLogger(__name__)

def get_connection_params() -> dict:
    """Return connection parameters for psycopg."""
    params = {
        "host": settings.DATABASE_HOST,
        "port": settings.DATABASE_PORT,
        "dbname": settings.DATABASE_NAME,
        "user": settings.DATABASE_USER,
        "row_factory": dict_row,
    }
    if settings.DATABASE_PASSWORD:
        params["password"] = settings.DATABASE_PASSWORD
    return params

def test_connection() -> bool:
    """Quick check of database connectivity."""
    try:
        with psycopg.connect(**get_connection_params()) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                return cur.fetchone() is not None
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return False

@contextmanager
def get_db(auth_id: Optional[str] = None) -> Generator[psycopg.Connection, None, None]:
    """
    Context manager that yields a psycopg connection.
    If auth_id is supplied, activates PostgreSQL Row-Level Security for authenticated role
    by setting request.jwt.claim.sub and switching to authenticated role.
    """
    conn = psycopg.connect(**get_connection_params())
    try:
        if auth_id:
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

from fastapi import APIRouter, Depends, HTTPException, status
import psycopg

from backend.app.config import settings
from backend.app.dependencies import get_db_conn

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", summary="Application Health Check")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "environment": settings.ENVIRONMENT
    }

@router.get("/db", summary="Database Connection & PostGIS Verification")
def database_health(conn: psycopg.Connection = Depends(get_db_conn)):
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT version();")
            pg_version = cur.fetchone()["version"]
            cur.execute("SELECT postgis_full_version();")
            postgis_version = cur.fetchone()["postgis_full_version"]
            cur.execute("SELECT count(*) AS entity_count FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r';")
            entity_count = cur.fetchone()["entity_count"]
            return {
                "status": "healthy",
                "database": "connected",
                "postgresql_version": pg_version.split()[1] if pg_version else "unknown",
                "postgis_active": "POSTGIS" in postgis_version.upper(),
                "public_entities_count": entity_count
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database health check failed: {str(e)}"
        )

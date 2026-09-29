import logging
import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
import psycopg
from psycopg.rows import dict_row

from backend.app.dependencies import get_tenant_db, get_db_conn, get_current_user
from backend.app.ingestion.base import DataMode
from backend.app.ingestion.pipeline_service import IngestionPipelineService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ingestion", tags=["Data Ingestion & Pipelines"])
pipeline_service = IngestionPipelineService()

class SyncRequest(BaseModel):
    domains: Optional[List[str]] = ["WEATHER", "SOIL", "SATELLITE"]
    force_mode: Optional[DataMode] = None

class SyncResponse(BaseModel):
    field_id: str
    field_name: str
    timestamp: str
    domains_synced: List[str]
    summary: Dict[str, Any]

@router.post("/fields/{field_id}/sync", response_model=SyncResponse)
def trigger_field_sync(
    field_id: uuid.UUID,
    req: SyncRequest,
    tenant_conn: psycopg.Connection = Depends(get_tenant_db),
    system_conn: psycopg.Connection = Depends(get_db_conn),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Triggers automated ingestion across weather, soil, and satellite data providers for a field.
    Enforces RLS tenant ownership check, deduplication, raw payload archiving, and data provenance.
    """
    # 1. Verify tenant owns or can access field under RLS
    with tenant_conn.cursor() as cur:
        cur.execute("SELECT id FROM fields WHERE id = %s", (str(field_id),))
        if not cur.fetchone():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Field {field_id} not found or access denied")

    # 2. Execute pipeline write operations via elevated system connection
    try:
        result = pipeline_service.sync_field_data(
            conn=system_conn,
            field_id=str(field_id),
            domains=req.domains,
            force_mode=req.force_mode
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Sync error: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Sync execution failed: {str(e)}")

@router.get("/fields/{field_id}/freshness")
def get_field_freshness(
    field_id: uuid.UUID,
    conn: psycopg.Connection = Depends(get_tenant_db),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Returns data freshness metrics across weather, soil, and satellite observations for a field.
    """
    try:
        return pipeline_service.get_data_freshness(conn=conn, field_id=str(field_id))
    except Exception as e:
        logger.error(f"Freshness check error: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/runs")
def list_ingestion_runs(
    limit: int = Query(default=20, ge=1, le=100),
    conn: psycopg.Connection = Depends(get_db_conn),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Lists recent data ingestion runs with execution duration, records counts, and statuses.
    """
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            """
            SELECT 
                r.id,
                j.job_name,
                j.target_domain,
                r.started_at,
                r.completed_at,
                r.status,
                r.records_received,
                r.records_persisted,
                r.error_summary,
                r.http_status_code
            FROM ingestion_runs r
            JOIN ingestion_jobs j ON r.ingestion_job_id = j.id
            ORDER BY r.started_at DESC
            LIMIT %s
            """,
            (limit,)
        )
        runs = cur.fetchall()
        for r in runs:
            if r["started_at"] and r["completed_at"]:
                r["duration_ms"] = int((r["completed_at"] - r["started_at"]).total_seconds() * 1000)
            else:
                r["duration_ms"] = None
        return runs

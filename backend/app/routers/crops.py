from fastapi import APIRouter, Depends, Query, status
from typing import List, Dict, Any, Optional
from uuid import UUID
import psycopg

from backend.app.dependencies import get_tenant_db, get_current_user, get_db_conn
from backend.app.models.crop import (
    CropResponse, CropGrowthStageResponse, CropCycleCreate, CropCycleResponse
)
from backend.app.services.agronomy_service import AgronomyService

router = APIRouter(tags=["Crops & Agronomy"])

@router.get("/crops", response_model=List[CropResponse], summary="List Supported Crops Reference Catalog")
def list_crops(conn: psycopg.Connection = Depends(get_db_conn)):
    return AgronomyService.list_crops(conn)

@router.get("/crops/{crop_id}/growth-stages", response_model=List[CropGrowthStageResponse], summary="Get FAO-56 Growth Stages for Crop")
def get_growth_stages(crop_id: UUID, conn: psycopg.Connection = Depends(get_db_conn)):
    return AgronomyService.get_growth_stages(conn, crop_id)

@router.get("/crop-cycles", response_model=List[CropCycleResponse], summary="List Crop Cycles for a Field")
def list_crop_cycles(
    field_id: UUID = Query(..., description="Target field ID"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return AgronomyService.list_crop_cycles(conn, field_id, current_user["id"])

@router.post("/crop-cycles", response_model=CropCycleResponse, status_code=status.HTTP_201_CREATED, summary="Plant a New Seasonal Crop Cycle")
def create_crop_cycle(
    data: CropCycleCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return AgronomyService.create_crop_cycle(conn, current_user["id"], data)

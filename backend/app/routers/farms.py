from fastapi import APIRouter, Depends, status
from typing import List, Dict, Any
from uuid import UUID
import psycopg

from backend.app.dependencies import get_tenant_db, get_current_user
from backend.app.models.farm import FarmCreate, FarmUpdate, FarmResponse
from backend.app.services.farm_service import FarmService

router = APIRouter(prefix="/farms", tags=["Farms"])

@router.get("", response_model=List[FarmResponse], summary="List Farmer's Active Farms")
def list_farms(
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return FarmService.list_farms(conn, current_user["id"])

@router.post("", response_model=FarmResponse, status_code=status.HTTP_201_CREATED, summary="Create a Farm")
def create_farm(
    data: FarmCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return FarmService.create_farm(conn, current_user["id"], data)

@router.get("/{farm_id}", response_model=FarmResponse, summary="Get Farm by ID")
def get_farm(
    farm_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return FarmService.get_farm(conn, farm_id, current_user["id"])

@router.put("/{farm_id}", response_model=FarmResponse, summary="Update Farm Details")
def update_farm(
    farm_id: UUID,
    data: FarmUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return FarmService.update_farm(conn, farm_id, current_user["id"], data)

@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Deactivate/Delete Farm")
def delete_farm(
    farm_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    FarmService.delete_farm(conn, farm_id, current_user["id"])
    return None

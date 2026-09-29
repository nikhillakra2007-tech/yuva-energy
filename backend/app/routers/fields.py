from fastapi import APIRouter, Depends, Query, status
from typing import List, Dict, Any, Optional
from uuid import UUID
import psycopg

from backend.app.dependencies import get_tenant_db, get_current_user
from backend.app.models.field import (
    FieldCreate, FieldUpdate, FieldResponse, FieldZoneCreate, FieldZoneResponse
)
from backend.app.services.field_service import FieldService

router = APIRouter(prefix="/fields", tags=["Fields & Geospatial"])

@router.get("", response_model=List[FieldResponse], summary="List Farmer Fields")
def list_fields(
    farm_id: Optional[UUID] = Query(None, description="Optional farm ID filter"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return FieldService.list_fields(conn, current_user["id"], farm_id)

@router.post("", response_model=FieldResponse, status_code=status.HTTP_201_CREATED, summary="Create a Field with GeoJSON Boundary")
def create_field(
    data: FieldCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return FieldService.create_field(conn, current_user["id"], data)

@router.get("/{field_id}", response_model=FieldResponse, summary="Get Field Details & Geometry")
def get_field(
    field_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return FieldService.get_field(conn, field_id, current_user["id"])

@router.put("/{field_id}", response_model=FieldResponse, summary="Update Field Geometry or Attributes")
def update_field(
    field_id: UUID,
    data: FieldUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return FieldService.update_field(conn, field_id, current_user["id"], data)

@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Deactivate Field")
def delete_field(
    field_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    FieldService.delete_field(conn, field_id, current_user["id"])
    return None

@router.post("/{field_id}/zones", response_model=FieldZoneResponse, status_code=status.HTTP_201_CREATED, summary="Add Micro-Irrigation Zone to Field")
def add_zone(
    field_id: UUID,
    data: FieldZoneCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return FieldService.add_zone(conn, field_id, current_user["id"], data)

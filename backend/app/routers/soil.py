from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Dict, Any, Optional
from uuid import UUID
import psycopg

from backend.app.dependencies import get_tenant_db, get_current_user
from backend.app.models.soil import SoilObservationResponse, SoilMoistureObservationResponse
from backend.app.models.satellite import VegetationIndexResponse, SatelliteObservationResponse
from backend.app.services.agronomy_service import AgronomyService
from backend.app.repositories.soil_repo import SoilRepository
from backend.app.repositories.satellite_repo import SatelliteRepository
from backend.app.services.field_service import FieldService

soil_router = APIRouter(prefix="/soil", tags=["Soil & Moisture"])

@soil_router.get("/fields/{field_id}", response_model=Optional[SoilObservationResponse], summary="Get Latest Soil Profile for Field")
def get_field_soil(
    field_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return AgronomyService.get_soil_summary(conn, field_id, current_user["id"])

@soil_router.get("/fields/{field_id}/moisture", response_model=List[SoilMoistureObservationResponse], summary="Get Soil Moisture Telemetry")
def get_soil_moisture(
    field_id: UUID,
    limit: int = Query(50, ge=1, le=200),
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    FieldService.get_field(conn, field_id, current_user["id"])
    return SoilRepository.list_moisture_history(conn, field_id, limit)

satellite_router = APIRouter(prefix="/satellite", tags=["Satellite & Earth Observation"])

@satellite_router.get("/fields/{field_id}/indices", response_model=List[VegetationIndexResponse], summary="Get Latest NDVI/EVI Spectral Indices")
def get_canopy_indices(
    field_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return AgronomyService.get_satellite_indices(conn, field_id, current_user["id"])

@satellite_router.get("/fields/{field_id}/scenes", response_model=List[Dict[str, Any]], summary="Get Sentinel/Copernicus Granule Acquisitions")
def get_satellite_scenes(
    field_id: UUID,
    limit: int = Query(10, ge=1, le=50),
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    FieldService.get_field(conn, field_id, current_user["id"])
    return SatelliteRepository.get_latest_observations(conn, field_id, limit)

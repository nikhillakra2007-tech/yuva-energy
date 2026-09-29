from fastapi import APIRouter, Depends, Query
from typing import List, Dict, Any
from uuid import UUID
import psycopg

from backend.app.dependencies import get_tenant_db, get_current_user
from backend.app.models.weather import (
    WeatherObservationResponse, WeatherForecastResponse, WeatherCurrentSummary
)
from backend.app.services.agronomy_service import AgronomyService
from backend.app.repositories.weather_repo import WeatherRepository
from backend.app.services.field_service import FieldService

router = APIRouter(prefix="/weather", tags=["Weather Intelligence"])

@router.get("/fields/{field_id}/current", response_model=WeatherCurrentSummary, summary="Get Current Weather Summary for Field")
def get_current_weather(
    field_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return AgronomyService.get_weather_summary(conn, field_id, current_user["id"])

@router.get("/fields/{field_id}/history", response_model=List[WeatherObservationResponse], summary="Get Historical Weather Observations")
def get_weather_history(
    field_id: UUID,
    limit: int = Query(48, ge=1, le=168, description="Number of recent hourly records"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    FieldService.get_field(conn, field_id, current_user["id"])
    return WeatherRepository.list_recent_observations(conn, field_id, limit)

@router.get("/fields/{field_id}/forecast", response_model=List[Dict[str, Any]], summary="Get 7-Day Weather Forecast")
def get_weather_forecast(
    field_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    FieldService.get_field(conn, field_id, current_user["id"])
    return WeatherRepository.get_latest_forecast(conn, field_id)

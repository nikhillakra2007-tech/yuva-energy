from uuid import UUID
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
import psycopg

from backend.app.repositories.crop_repo import CropRepository
from backend.app.repositories.weather_repo import WeatherRepository
from backend.app.repositories.soil_repo import SoilRepository
from backend.app.repositories.satellite_repo import SatelliteRepository
from backend.app.services.field_service import FieldService
from backend.app.models.crop import CropCycleCreate

class AgronomyService:
    @staticmethod
    def list_crops(conn: psycopg.Connection) -> List[Dict[str, Any]]:
        return CropRepository.list_crops(conn)

    @staticmethod
    def get_crop(conn: psycopg.Connection, crop_id: UUID) -> Dict[str, Any]:
        crop = CropRepository.get_crop_by_id(conn, crop_id)
        if not crop:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")
        return crop

    @staticmethod
    def get_growth_stages(conn: psycopg.Connection, crop_id: UUID) -> List[Dict[str, Any]]:
        AgronomyService.get_crop(conn, crop_id)
        return CropRepository.get_growth_stages(conn, crop_id)

    @staticmethod
    def list_crop_cycles(conn: psycopg.Connection, field_id: UUID, user_id: UUID) -> List[Dict[str, Any]]:
        FieldService.get_field(conn, field_id, user_id)
        return CropRepository.list_cycles_by_field(conn, field_id)

    @staticmethod
    def create_crop_cycle(conn: psycopg.Connection, user_id: UUID, data: CropCycleCreate) -> Dict[str, Any]:
        FieldService.get_field(conn, data.field_id, user_id)
        AgronomyService.get_crop(conn, data.crop_id)
        return CropRepository.create_cycle(
            conn=conn,
            field_id=data.field_id,
            crop_id=data.crop_id,
            crop_variety_id=data.crop_variety_id,
            season=data.season,
            cycle_year=data.cycle_year,
            sowing_date=data.sowing_date,
            expected_harvest_date=data.expected_harvest_date
        )

    @staticmethod
    def get_weather_summary(conn: psycopg.Connection, field_id: UUID, user_id: UUID) -> Dict[str, Any]:
        FieldService.get_field(conn, field_id, user_id)
        obs = WeatherRepository.get_latest_observation(conn, field_id)
        if not obs:
            return {
                "field_id": field_id,
                "temperature_celsius": None,
                "relative_humidity_percentage": None,
                "precipitation_last_24h_mm": 0.0,
                "reference_et0_today_mm": None,
                "observed_at": None,
                "provenance": "NO_OBSERVATION"
            }
        return {
            "field_id": field_id,
            "temperature_celsius": float(obs["temperature_celsius"]) if obs.get("temperature_celsius") is not None else None,
            "relative_humidity_percentage": float(obs["relative_humidity_percentage"]) if obs.get("relative_humidity_percentage") is not None else None,
            "precipitation_last_24h_mm": float(obs.get("precipitation_mm", 0.0) or 0.0),
            "reference_et0_today_mm": float(obs["reference_et0_mm"]) if obs.get("reference_et0_mm") is not None else None,
            "observed_at": obs["observed_at"],
            "provenance": obs.get("provenance", "MEASURED")
        }

    @staticmethod
    def get_soil_summary(conn: psycopg.Connection, field_id: UUID, user_id: UUID) -> Optional[Dict[str, Any]]:
        FieldService.get_field(conn, field_id, user_id)
        return SoilRepository.get_latest_observation(conn, field_id)

    @staticmethod
    def get_satellite_indices(conn: psycopg.Connection, field_id: UUID, user_id: UUID) -> List[Dict[str, Any]]:
        FieldService.get_field(conn, field_id, user_id)
        return SatelliteRepository.get_latest_indices(conn, field_id)

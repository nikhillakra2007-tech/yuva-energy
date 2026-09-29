from uuid import UUID
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
import psycopg

from backend.app.repositories.farm_repo import FarmRepository
from backend.app.models.farm import FarmCreate, FarmUpdate

class FarmService:
    @staticmethod
    def list_farms(conn: psycopg.Connection, user_id: UUID) -> List[Dict[str, Any]]:
        return FarmRepository.list_by_user(conn, user_id)

    @staticmethod
    def get_farm(conn: psycopg.Connection, farm_id: UUID, user_id: UUID) -> Dict[str, Any]:
        farm = FarmRepository.get_by_id(conn, farm_id)
        if not farm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Farm with id '{farm_id}' was not found"
            )
        if farm["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this farm"
            )
        return farm

    @staticmethod
    def create_farm(conn: psycopg.Connection, user_id: UUID, data: FarmCreate) -> Dict[str, Any]:
        return FarmRepository.create(
            conn=conn,
            user_id=user_id,
            name=data.name,
            description=data.description,
            timezone=data.timezone,
            latitude=data.latitude,
            longitude=data.longitude,
            elevation_meters=data.elevation_meters,
            total_area_hectares=data.total_area_hectares,
            primary_water_source=data.primary_water_source,
            grid_connection_type=data.grid_connection_type
        )

    @staticmethod
    def update_farm(conn: psycopg.Connection, farm_id: UUID, user_id: UUID, data: FarmUpdate) -> Dict[str, Any]:
        # Validate existence & ownership
        FarmService.get_farm(conn, farm_id, user_id)
        updates = data.model_dump(exclude_unset=True)
        updated = FarmRepository.update(conn, farm_id, user_id, updates)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found")
        return updated

    @staticmethod
    def delete_farm(conn: psycopg.Connection, farm_id: UUID, user_id: UUID) -> None:
        FarmService.get_farm(conn, farm_id, user_id)
        success = FarmRepository.delete(conn, farm_id, user_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to delete farm")

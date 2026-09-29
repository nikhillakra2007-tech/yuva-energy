from uuid import UUID
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
import psycopg
from shapely.geometry import shape

from backend.app.repositories.field_repo import FieldRepository
from backend.app.repositories.farm_repo import FarmRepository
from backend.app.models.field import FieldCreate, FieldUpdate, FieldZoneCreate

class FieldService:
    @staticmethod
    def list_fields(conn: psycopg.Connection, user_id: UUID, farm_id: Optional[UUID] = None) -> List[Dict[str, Any]]:
        if farm_id:
            farm = FarmRepository.get_by_id(conn, farm_id)
            if not farm or farm["user_id"] != user_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this farm")
            return FieldRepository.list_by_farm(conn, farm_id)
        return FieldRepository.list_all_user_fields(conn, user_id)

    @staticmethod
    def get_field(conn: psycopg.Connection, field_id: UUID, user_id: UUID) -> Dict[str, Any]:
        field = FieldRepository.get_by_id(conn, field_id)
        if not field:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Field '{field_id}' was not found")
        if field["user_id"] != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to access this field")
        return field

    @staticmethod
    def create_field(conn: psycopg.Connection, user_id: UUID, data: FieldCreate) -> Dict[str, Any]:
        # Verify farm ownership
        farm = FarmRepository.get_by_id(conn, data.farm_id)
        if not farm:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found")
        if farm["user_id"] != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot add fields to a farm you do not own")

        boundary_dict = data.boundary.model_dump()
        
        # Verify topological validity using Shapely
        try:
            geom = shape(boundary_dict)
            if not geom.is_valid:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Invalid field boundary geometry: {geom.is_valid_reason()}"
                )
            if geom.is_empty:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Field boundary polygon cannot be empty"
                )
        except Exception as e:
            if isinstance(e, HTTPException):
                raise
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Malformed GeoJSON polygon: {str(e)}"
            )

        return FieldRepository.create(
            conn=conn,
            farm_id=data.farm_id,
            name=data.name,
            boundary_geojson=boundary_dict,
            soil_type=data.soil_type,
            slope_percentage=data.slope_percentage
        )

    @staticmethod
    def update_field(conn: psycopg.Connection, field_id: UUID, user_id: UUID, data: FieldUpdate) -> Dict[str, Any]:
        FieldService.get_field(conn, field_id, user_id)
        updates = data.model_dump(exclude_unset=True)
        if "boundary" in updates and updates["boundary"]:
            updates["boundary"] = updates["boundary"].model_dump()
        return FieldRepository.update(conn, field_id, updates)

    @staticmethod
    def delete_field(conn: psycopg.Connection, field_id: UUID, user_id: UUID) -> None:
        FieldService.get_field(conn, field_id, user_id)
        FieldRepository.delete(conn, field_id)

    @staticmethod
    def add_zone(conn: psycopg.Connection, field_id: UUID, user_id: UUID, data: FieldZoneCreate) -> Dict[str, Any]:
        FieldService.get_field(conn, field_id, user_id)
        boundary_dict = data.boundary.model_dump() if data.boundary else None
        return FieldRepository.create_zone(
            conn=conn,
            field_id=field_id,
            name=data.name,
            boundary_geojson=boundary_dict,
            soil_texture=data.soil_texture
        )

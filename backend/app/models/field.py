from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, List, Union
from datetime import datetime
from uuid import UUID

class GeoJSONPolygon(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]

    @field_validator("coordinates")
    @classmethod
    def validate_polygon_coords(cls, v):
        if not v or len(v) < 1:
            raise ValueError("Polygon must have at least one linear ring")
        ring = v[0]
        if len(ring) < 4:
            raise ValueError("Polygon ring must have at least 4 coordinates")
        # Check closed ring
        if ring[0] != ring[-1]:
            # Close ring automatically if last point is omitted
            ring.append(ring[0])
        # Validate coordinates ranges: [lon, lat]
        for pt in ring:
            if len(pt) < 2:
                raise ValueError("Coordinate point must have at least [longitude, latitude]")
            lon, lat = pt[0], pt[1]
            if not (-180.0 <= lon <= 180.0):
                raise ValueError(f"Longitude {lon} out of range [-180, 180]")
            if not (-90.0 <= lat <= 90.0):
                raise ValueError(f"Latitude {lat} out of range [-90, 90]")
        return v

class FieldCreate(BaseModel):
    farm_id: UUID
    name: str = Field(..., min_length=2, max_length=150, example="North Block - Wheat")
    boundary: GeoJSONPolygon
    soil_type: Optional[str] = Field(None, example="SANDY_LOAM")
    slope_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)

class FieldUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    boundary: Optional[GeoJSONPolygon] = None
    soil_type: Optional[str] = None
    slope_percentage: Optional[float] = None

class FieldZoneCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, example="Zone A - High Moisture")
    boundary: Optional[GeoJSONPolygon] = None
    soil_texture: Optional[str] = None

class FieldZoneResponse(BaseModel):
    id: UUID
    field_id: UUID
    name: str
    area_hectares: Optional[float] = None
    boundary_geojson: Optional[Dict[str, Any]] = None
    soil_texture: Optional[str] = None
    is_active: bool
    created_at: datetime

class FieldResponse(BaseModel):
    id: UUID
    farm_id: UUID
    name: str
    area_hectares: Optional[float]
    perimeter_meters: Optional[float]
    soil_type: Optional[str]
    slope_percentage: Optional[float]
    boundary_geojson: Optional[Dict[str, Any]]
    centroid_geojson: Optional[Dict[str, Any]]
    is_active: bool
    current_crop_name: Optional[str] = None
    current_crop_stage: Optional[str] = None
    current_ndvi: Optional[float] = None
    created_at: datetime
    updated_at: datetime

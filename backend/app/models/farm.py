from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class FarmCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, example="Surya Greenfield Farm")
    description: Optional[str] = Field(None, example="Solar-powered precision drip farm")
    timezone: str = Field(default="Asia/Kolkata", example="Asia/Kolkata")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, example=28.4595)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, example=77.0266)
    elevation_meters: Optional[float] = Field(None, ge=-500.0, example=220.0)
    total_area_hectares: Optional[float] = Field(None, ge=0.0, example=4.5)
    primary_water_source: Optional[str] = Field(None, example="BOREWELL_DEEP")
    grid_connection_type: Optional[str] = Field(default="3_PHASE_AGRICULTURAL", example="3_PHASE_AGRICULTURAL")

class FarmUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    description: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    elevation_meters: Optional[float] = Field(None, ge=-500.0)
    total_area_hectares: Optional[float] = Field(None, ge=0.0)
    primary_water_source: Optional[str] = None
    grid_connection_type: Optional[str] = None

class FarmResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    timezone: str
    latitude: Optional[float]
    longitude: Optional[float]
    elevation_meters: Optional[float]
    total_area_hectares: Optional[float]
    primary_water_source: Optional[str]
    grid_connection_type: Optional[str]
    is_active: bool
    fields_count: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

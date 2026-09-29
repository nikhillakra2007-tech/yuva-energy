from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class SoilObservationResponse(BaseModel):
    id: UUID
    field_id: UUID
    observed_at: datetime
    depth_top_cm: float
    depth_bottom_cm: float
    texture_class: Optional[str]
    clay_percentage: Optional[float]
    sand_percentage: Optional[float]
    organic_carbon_percentage: Optional[float]
    ph: Optional[float]
    bulk_density_g_cm3: Optional[float]
    field_capacity_vwc: Optional[float]
    wilting_point_vwc: Optional[float]
    saturation_vwc: Optional[float]
    provenance: str

class SoilMoistureObservationResponse(BaseModel):
    id: UUID
    field_id: UUID
    sensor_depth_cm: float
    volumetric_water_content_pct: float
    observed_at: datetime
    provenance: str

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class VegetationIndexResponse(BaseModel):
    id: UUID
    satellite_observation_id: UUID
    field_id: UUID
    index_code: str
    mean_value: float
    median_value: Optional[float]
    min_value: Optional[float]
    max_value: Optional[float]
    confidence_score: Optional[float]
    acquired_at: datetime

class SatelliteObservationResponse(BaseModel):
    id: UUID
    field_id: UUID
    acquired_at: datetime
    cloud_cover_field_percentage: Optional[float]
    valid_pixel_percentage: Optional[float]
    data_quality_status: str
    provenance: str
    indices: List[VegetationIndexResponse] = []

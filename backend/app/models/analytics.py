from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class FarmHealthCard(BaseModel):
    field_id: UUID
    field_name: str
    farm_id: UUID
    farm_name: str
    area_hectares: Optional[float]
    crop_name: Optional[str]
    growth_stage: Optional[str]
    current_ndvi: Optional[float]
    soil_moisture_status: Optional[str]
    water_stress_index: Optional[float]
    last_evaluated_at: Optional[datetime]
    has_active_recommendation: bool
    recommendation_urgency: Optional[str] = "NORMAL"

class DashboardSummaryResponse(BaseModel):
    total_farms: int
    total_fields: int
    total_area_hectares: float
    active_crop_cycles: int
    active_recommendations_count: int
    average_ndvi: Optional[float]
    fields: List[FarmHealthCard] = []

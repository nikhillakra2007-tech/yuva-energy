from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class RecommendationFeedbackCreate(BaseModel):
    action_taken: str = Field(..., example="APPLIED_FULL") # APPLIED_FULL, APPLIED_PARTIAL, DEFERRED, REJECTED, IGNORED
    actual_water_volume_litres: Optional[float] = Field(None, ge=0.0)
    farmer_notes: Optional[str] = None

class RecommendationFeedbackResponse(BaseModel):
    id: UUID
    recommendation_id: UUID
    user_id: UUID
    action_taken: str
    actual_water_volume_litres: Optional[float]
    farmer_notes: Optional[str]
    submitted_at: datetime

class RecommendationReasonResponse(BaseModel):
    id: UUID
    reason_code: str
    weight: Optional[float]
    description_vernacular: str

class RecommendationResponse(BaseModel):
    id: UUID
    field_id: UUID
    field_name: Optional[str] = None
    farm_name: Optional[str] = None
    action_type: str
    title: str
    message_vernacular: str
    recommended_water_volume_litres: Optional[float] = None
    recommended_water_depth_mm: Optional[float] = None
    recommended_energy_kwh: Optional[float] = None
    action_window_start: datetime
    action_window_end: datetime
    confidence_score: float
    drivers: List[str] = []
    limitations: List[str] = []
    reasons: List[RecommendationReasonResponse] = []
    status: str = "PENDING"
    created_at: datetime

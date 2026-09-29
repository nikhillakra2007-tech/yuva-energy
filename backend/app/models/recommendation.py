from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class RecommendationFeedbackCreate(BaseModel):
    action_taken: str = Field(..., json_schema_extra={"example": "FOLLOWED_EXACTLY"})
    actual_irrigation_duration_minutes: Optional[float] = Field(None, ge=0.0)
    farmer_comments: Optional[str] = None
    feedback_rating: Optional[int] = Field(None, ge=1, le=5)
    rejection_reason_code: Optional[str] = None

class RecommendationFeedbackResponse(BaseModel):
    id: UUID
    recommendation_id: UUID
    user_id: UUID
    action_taken: str
    actual_irrigation_duration_minutes: Optional[float] = None
    farmer_comments: Optional[str] = None
    feedback_rating: Optional[int] = None
    rejection_reason_code: Optional[str] = None
    recorded_at: datetime

class RecommendationReasonResponse(BaseModel):
    id: UUID
    category: str
    headline: str
    detail_text: str
    display_order: int

class RecommendationResponse(BaseModel):
    id: UUID
    field_id: UUID
    field_name: Optional[str] = None
    farm_name: Optional[str] = None
    action_type: str
    title: str
    message_vernacular: str
    recommended_volume_litres: Optional[float] = None
    recommended_duration_minutes: Optional[float] = None
    action_window_start: datetime
    action_window_end: datetime
    confidence_score: float
    drivers: List[str] = []
    limitations: List[str] = []
    reasons: List[RecommendationReasonResponse] = []
    status: str = "PENDING"
    created_at: datetime

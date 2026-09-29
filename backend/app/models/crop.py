from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, date
from uuid import UUID

class CropResponse(BaseModel):
    id: UUID
    code: str
    name: str
    botanical_name: Optional[str] = None
    crop_category: str
    default_season: Optional[str] = None
    water_demand_category: Optional[str] = None
    typical_duration_days: Optional[int] = None
    is_active: bool

class CropVarietyResponse(BaseModel):
    id: UUID
    crop_id: UUID
    code: str
    name: str
    maturity_duration_days_min: Optional[int]
    maturity_duration_days_max: Optional[int]
    is_active: bool

class CropGrowthStageResponse(BaseModel):
    id: UUID
    crop_id: UUID
    stage_code: str
    stage_name: str
    stage_order: int
    typical_duration_days: Optional[int]
    kc_coefficient: float
    rooting_depth_meters: Optional[float] = None

class CropCycleCreate(BaseModel):
    field_id: UUID
    crop_id: UUID
    crop_variety_id: Optional[UUID] = None
    season: str = Field(..., example="RABI")
    cycle_year: int = Field(..., ge=2020, le=2050, example=2026)
    sowing_date: date
    expected_harvest_date: Optional[date] = None

class CropCycleResponse(BaseModel):
    id: UUID
    field_id: UUID
    crop_id: UUID
    crop_name: Optional[str] = None
    crop_code: Optional[str] = None
    crop_variety_id: Optional[UUID] = None
    season: str
    cycle_year: int
    sowing_date: date
    expected_harvest_date: Optional[date]
    actual_harvest_date: Optional[date]
    status: str
    current_growth_stage: Optional[str] = None
    current_kc: Optional[float] = None
    created_at: datetime

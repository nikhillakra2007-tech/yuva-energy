from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class WeatherObservationResponse(BaseModel):
    id: UUID
    field_id: UUID
    observed_at: datetime
    temperature_celsius: Optional[float]
    relative_humidity_percentage: Optional[float]
    precipitation_mm: Optional[float]
    solar_radiation_mj_m2: Optional[float]
    wind_speed_m_s: Optional[float]
    reference_et0_mm: Optional[float]
    provenance: str
    data_quality_flag: str
    weather_source_name: Optional[str] = None

class WeatherForecastItem(BaseModel):
    forecast_datetime: datetime
    temperature_max_celsius: Optional[float]
    temperature_min_celsius: Optional[float]
    precipitation_sum_mm: Optional[float]
    precipitation_probability_pct: Optional[float]
    reference_et0_mm: Optional[float]
    solar_radiation_mj_m2: Optional[float]

class WeatherForecastResponse(BaseModel):
    field_id: UUID
    forecast_run_at: datetime
    provenance: str
    items: List[WeatherForecastItem]

class WeatherCurrentSummary(BaseModel):
    field_id: UUID
    temperature_celsius: Optional[float]
    relative_humidity_percentage: Optional[float]
    precipitation_last_24h_mm: Optional[float]
    reference_et0_today_mm: Optional[float]
    observed_at: Optional[datetime]
    provenance: str

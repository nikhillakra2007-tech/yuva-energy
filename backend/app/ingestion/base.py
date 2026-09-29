from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class DataMode(str, Enum):
    REAL_DATA = "REAL_DATA"
    TEST_FIXTURE = "TEST_FIXTURE"
    SIMULATION = "SIMULATION"

class ProvenanceInfo(BaseModel):
    source_code: str
    source_name: str
    retrieved_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    mode: DataMode = DataMode.REAL_DATA
    is_current: bool = True
    record_count: int = 0
    metadata: Dict[str, Any] = {}

class NormalizedWeatherRecord(BaseModel):
    observed_at: datetime
    temperature_celsius: Optional[float]
    relative_humidity_percentage: Optional[float]
    precipitation_mm: Optional[float]
    solar_radiation_mj_m2: Optional[float]
    wind_speed_m_s: Optional[float]
    reference_et0_mm: Optional[float]
    provenance: str
    data_quality_flag: str = "GOOD"

class NormalizedSoilRecord(BaseModel):
    observed_at: datetime
    profile_depth_top_cm: float
    profile_depth_bottom_cm: float
    soil_texture_class: str
    sand_percentage: float
    silt_percentage: float
    clay_percentage: float
    organic_carbon_percentage: float
    ph: float
    bulk_density_g_cm3: float
    field_capacity_vwc: float
    wilting_point_vwc: float
    saturation_vwc: float
    available_water_capacity_mm_per_m: float
    provenance: str

class NormalizedSatelliteRecord(BaseModel):
    provider_scene_id: str
    acquired_at: datetime
    cloud_cover_percentage: float
    valid_pixel_percentage: float
    ndvi_mean: float
    ndvi_median: Optional[float]
    ndvi_min: Optional[float]
    ndvi_max: Optional[float]
    evi_mean: Optional[float]
    ndre_mean: Optional[float]
    confidence_score: float
    provenance: str

class BaseIngestionProvider(ABC):
    @property
    @abstractmethod
    def provider_code(self) -> str:
        pass

    @abstractmethod
    def fetch_and_normalize(self, **kwargs) -> Any:
        pass

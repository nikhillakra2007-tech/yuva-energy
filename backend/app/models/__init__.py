from backend.app.models.auth import (
    UserRegisterRequest, UserLoginRequest, TokenResponse, UserProfileResponse, UserUpdateRequest
)
from backend.app.models.farm import FarmCreate, FarmUpdate, FarmResponse
from backend.app.models.field import (
    GeoJSONPolygon, FieldCreate, FieldUpdate, FieldResponse, FieldZoneCreate, FieldZoneResponse
)
from backend.app.models.crop import (
    CropResponse, CropVarietyResponse, CropGrowthStageResponse, CropCycleCreate, CropCycleResponse
)
from backend.app.models.weather import (
    WeatherObservationResponse, WeatherForecastItem, WeatherForecastResponse, WeatherCurrentSummary
)
from backend.app.models.soil import SoilObservationResponse, SoilMoistureObservationResponse
from backend.app.models.satellite import VegetationIndexResponse, SatelliteObservationResponse
from backend.app.models.recommendation import (
    RecommendationFeedbackCreate, RecommendationFeedbackResponse, RecommendationReasonResponse, RecommendationResponse
)
from backend.app.models.analytics import FarmHealthCard, DashboardSummaryResponse

__all__ = [
    "UserRegisterRequest", "UserLoginRequest", "TokenResponse", "UserProfileResponse", "UserUpdateRequest",
    "FarmCreate", "FarmUpdate", "FarmResponse",
    "GeoJSONPolygon", "FieldCreate", "FieldUpdate", "FieldResponse", "FieldZoneCreate", "FieldZoneResponse",
    "CropResponse", "CropVarietyResponse", "CropGrowthStageResponse", "CropCycleCreate", "CropCycleResponse",
    "WeatherObservationResponse", "WeatherForecastItem", "WeatherForecastResponse", "WeatherCurrentSummary",
    "SoilObservationResponse", "SoilMoistureObservationResponse",
    "VegetationIndexResponse", "SatelliteObservationResponse",
    "RecommendationFeedbackCreate", "RecommendationFeedbackResponse", "RecommendationReasonResponse", "RecommendationResponse",
    "FarmHealthCard", "DashboardSummaryResponse",
]

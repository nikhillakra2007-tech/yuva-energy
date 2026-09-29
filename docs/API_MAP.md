# API Map

STATUS: PHASE 2 IMPLEMENTED AND TESTED.

All endpoints are hosted by FastAPI with OpenAPI / Swagger UI documentation at `/api/v1/docs` and JSON schema at `/api/v1/openapi.json`.
Every authenticated route enforces multi-tenant identity via Bearer JWT and sets the PostgreSQL session context (`set_config('role', 'authenticated', true)` and `set_config('request.jwt.claim.sub', auth_id, true)`), strictly activating Row-Level Security on all 77 database entities.

## 1. System Health

| Method | Path | Auth | Input Schema | Output Schema | Target Tables | Error States |
|---|---|---|---|---|---|---|
| `GET` | `/api/v1/health` | Public | None | `{"status": "healthy", "service": "...", "version": "...", "environment": "..."}` | None | None |
| `GET` | `/api/v1/health/db` | Public | None | `{"status": "healthy", "database": "connected", "postgresql_version": "...", "postgis_active": true, "public_entities_count": 77}` | Catalog tables | 503 Service Unavailable |

## 2. Authentication & Farmer Profile

| Method | Path | Auth | Input Schema | Output Schema | Target Tables | Error States |
|---|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | `UserRegisterRequest` (full_name, email, password, phone, language) | `TokenResponse` (access_token, token_type, user_id, auth_id, email) | `public.users` | 409 Conflict (duplicate email), 422 Validation |
| `POST` | `/api/v1/auth/login` | Public | `UserLoginRequest` (email, password) | `TokenResponse` (access_token, user_id, auth_id) | `public.users` | 401 Unauthorized (bad credentials), 422 Validation |
| `GET` | `/api/v1/auth/me` | Bearer JWT | None | `UserProfileResponse` | `public.users` | 401 Unauthorized |
| `PUT` | `/api/v1/auth/me` | Bearer JWT | `UserUpdateRequest` | `UserProfileResponse` | `public.users` | 401 Unauthorized, 422 Validation |

## 3. Farms

| Method | Path | Auth | Input Schema | Output Schema | Target Tables | Error States |
|---|---|---|---|---|---|---|
| `GET` | `/api/v1/farms` | Bearer JWT | Query filters | `List[FarmResponse]` | `public.farms`, `public.fields` | 401 Unauthorized |
| `POST` | `/api/v1/farms` | Bearer JWT | `FarmCreate` (name, lat, lon, area, water_source, grid) | `FarmResponse` | `public.farms` | 401 Unauthorized, 422 Validation |
| `GET` | `/api/v1/farms/{id}` | Bearer JWT | Path UUID | `FarmResponse` | `public.farms` | 401 Unauthorized, 403 Forbidden, 404 Not Found |
| `PUT` | `/api/v1/farms/{id}` | Bearer JWT | `FarmUpdate` | `FarmResponse` | `public.farms` | 401 Unauthorized, 403 Forbidden, 404 Not Found |
| `DELETE` | `/api/v1/farms/{id}` | Bearer JWT | Path UUID | 204 No Content | `public.farms` | 401 Unauthorized, 403 Forbidden, 404 Not Found |

## 4. Fields & Geospatial

| Method | Path | Auth | Input Schema | Output Schema | Target Tables | Error States |
|---|---|---|---|---|---|---|
| `GET` | `/api/v1/fields` | Bearer JWT | Optional `farm_id` | `List[FieldResponse]` | `public.fields`, `public.farms` | 401 Unauthorized, 403 Forbidden |
| `POST` | `/api/v1/fields` | Bearer JWT | `FieldCreate` (farm_id, name, GeoJSON boundary) | `FieldResponse` | `public.fields` | 401 Unauthorized, 403 Forbidden (cross-farm), 422 Invalid Geometry |
| `GET` | `/api/v1/fields/{id}` | Bearer JWT | Path UUID | `FieldResponse` | `public.fields` | 401 Unauthorized, 403 Forbidden, 404 Not Found |
| `PUT` | `/api/v1/fields/{id}` | Bearer JWT | `FieldUpdate` | `FieldResponse` | `public.fields` | 401 Unauthorized, 403 Forbidden, 404 Not Found |
| `DELETE` | `/api/v1/fields/{id}` | Bearer JWT | Path UUID | 204 No Content | `public.fields` | 401 Unauthorized, 403 Forbidden, 404 Not Found |
| `POST` | `/api/v1/fields/{id}/zones` | Bearer JWT | `FieldZoneCreate` (name, boundary, soil_texture) | `FieldZoneResponse` | `public.field_zones` | 401 Unauthorized, 403 Forbidden |

## 5. Crops & Crop Cycles

| Method | Path | Auth | Input Schema | Output Schema | Target Tables | Error States |
|---|---|---|---|---|---|---|
| `GET` | `/api/v1/crops` | Public / Auth | None | `List[CropResponse]` | `public.crops` | None |
| `GET` | `/api/v1/crops/{id}/growth-stages` | Public / Auth | Path UUID | `List[CropGrowthStageResponse]` | `public.crop_growth_stages` | 404 Not Found |
| `GET` | `/api/v1/crop-cycles` | Bearer JWT | Query `field_id` | `List[CropCycleResponse]` | `public.crop_cycles`, `public.crops` | 401 Unauthorized, 403 Forbidden |
| `POST` | `/api/v1/crop-cycles` | Bearer JWT | `CropCycleCreate` (field_id, crop_id, season, year, sowing_date) | `CropCycleResponse` | `public.crop_cycles` | 401 Unauthorized, 403 Forbidden (unowned field) |

## 6. Weather & Telemetry

| Method | Path | Auth | Input Schema | Output Schema | Target Tables | Error States |
|---|---|---|---|---|---|---|
| `GET` | `/api/v1/weather/fields/{id}/current` | Bearer JWT | Path UUID | `WeatherCurrentSummary` | `public.weather_observations` | 401 Unauthorized, 403 Forbidden |
| `GET` | `/api/v1/weather/fields/{id}/history` | Bearer JWT | Query `limit` | `List[WeatherObservationResponse]` | `public.weather_observations` | 401 Unauthorized, 403 Forbidden |
| `GET` | `/api/v1/weather/fields/{id}/forecast` | Bearer JWT | Path UUID | `List[Dict]` | `public.weather_forecasts` | 401 Unauthorized, 403 Forbidden |

## 7. Soil & Satellite

| Method | Path | Auth | Input Schema | Output Schema | Target Tables | Error States |
|---|---|---|---|---|---|---|
| `GET` | `/api/v1/soil/fields/{id}` | Bearer JWT | Path UUID | `SoilObservationResponse` | `public.soil_observations` | 401 Unauthorized, 403 Forbidden |
| `GET` | `/api/v1/soil/fields/{id}/moisture` | Bearer JWT | Query `limit` | `List[SoilMoistureObservationResponse]` | `public.soil_moisture_observations` | 401 Unauthorized, 403 Forbidden |
| `GET` | `/api/v1/satellite/fields/{id}/indices` | Bearer JWT | Path UUID | `List[VegetationIndexResponse]` | `public.vegetation_indices` | 401 Unauthorized, 403 Forbidden |
| `GET` | `/api/v1/satellite/fields/{id}/scenes` | Bearer JWT | Query `limit` | `List[Dict]` | `public.satellite_observations` | 401 Unauthorized, 403 Forbidden |

## 8. Recommendations & Feedback

| Method | Path | Auth | Input Schema | Output Schema | Target Tables | Error States |
|---|---|---|---|---|---|---|
| `GET` | `/api/v1/recommendations` | Bearer JWT | None | `List[RecommendationResponse]` | `public.recommendations`, `public.recommendation_reasons` | 401 Unauthorized |
| `GET` | `/api/v1/recommendations/{id}` | Bearer JWT | Path UUID | `RecommendationResponse` | `public.recommendations` | 401 Unauthorized, 403 Forbidden, 404 Not Found |
| `POST` | `/api/v1/recommendations/{id}/feedback` | Bearer JWT | `RecommendationFeedbackCreate` | `RecommendationFeedbackResponse` | `public.recommendation_feedback` | 401 Unauthorized, 403 Forbidden, 422 Invalid Action |
| `GET` | `/api/v1/alerts` | Bearer JWT | None | `List[RecommendationResponse]` | `public.recommendations` | 401 Unauthorized |

## 9. Dashboard Analytics

| Method | Path | Auth | Input Schema | Output Schema | Target Tables | Error States |
|---|---|---|---|---|---|---|
| `GET` | `/api/v1/analytics/dashboard` | Bearer JWT | None | `DashboardSummaryResponse` | `public.farms`, `public.fields`, `public.recommendations`, `public.farm_states` | 401 Unauthorized |

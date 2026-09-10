-- Migration: 017_indexes.sql
-- Purpose: PostGIS spatial GiST indexing and composite time-series query optimization indexes.
-- Domain: Performance & Spatial Indexing

-- ============================================================================
-- 1. PostGIS Spatial Indexes (GiST)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_farms_location ON public.farms USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_fields_boundary ON public.fields USING GIST (boundary);
CREATE INDEX IF NOT EXISTS idx_fields_centroid ON public.fields USING GIST (centroid);
CREATE INDEX IF NOT EXISTS idx_field_zones_boundary ON public.field_zones USING GIST (boundary);
CREATE INDEX IF NOT EXISTS idx_weather_locations_point ON public.weather_locations USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_satellite_scenes_footprint ON public.satellite_scenes USING GIST (footprint);
CREATE INDEX IF NOT EXISTS idx_administrative_areas_boundary ON public.administrative_areas USING GIST (boundary);

-- ============================================================================
-- 2. Foreign Key & Entity Hierarchy B-Tree Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms (user_id);
CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON public.fields (farm_id);
CREATE INDEX IF NOT EXISTS idx_field_zones_field_id ON public.field_zones (field_id);
CREATE INDEX IF NOT EXISTS idx_crop_cycles_field_id ON public.crop_cycles (field_id);
CREATE INDEX IF NOT EXISTS idx_crop_cycles_crop_id ON public.crop_cycles (crop_id);
CREATE INDEX IF NOT EXISTS idx_crop_cycles_status ON public.crop_cycles (status);
CREATE INDEX IF NOT EXISTS idx_crop_varieties_crop_id ON public.crop_varieties (crop_id);
CREATE INDEX IF NOT EXISTS idx_crop_parameters_crop_id ON public.crop_parameters (crop_id);

-- ============================================================================
-- 3. High-Frequency Time-Series Composite Indexes
-- ============================================================================
-- Weather time-series lookup: Latest weather per field
CREATE INDEX IF NOT EXISTS idx_weather_obs_field_time ON public.weather_observations (field_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_forecasts_field_target ON public.weather_forecasts (field_id, forecast_target_at ASC);

-- Satellite observations & vegetation indices
CREATE INDEX IF NOT EXISTS idx_satellite_obs_field_time ON public.satellite_observations (field_id, acquired_at DESC);
CREATE INDEX IF NOT EXISTS idx_veg_indices_field_time ON public.vegetation_indices (field_id, acquired_at DESC);
CREATE INDEX IF NOT EXISTS idx_veg_indices_code ON public.vegetation_indices (index_code);

-- Soil moisture time-series
CREATE INDEX IF NOT EXISTS idx_soil_moisture_field_time ON public.soil_moisture_observations (field_id, observed_at DESC);

-- Irrigation events & measurements
CREATE INDEX IF NOT EXISTS idx_irrigation_events_field_time ON public.irrigation_events (field_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_water_measurements_field_time ON public.water_measurements (field_id, recorded_at DESC);

-- Energy observations & forecasts
CREATE INDEX IF NOT EXISTS idx_energy_obs_system_time ON public.energy_observations (energy_system_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_energy_obs_asset_time ON public.energy_observations (asset_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_energy_forecasts_system_target ON public.energy_forecasts (energy_system_id, forecast_target_at ASC);

-- ============================================================================
-- 4. ML & Intelligence Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_farm_states_field_evaluated ON public.farm_states (field_id, evaluated_at DESC);
CREATE INDEX IF NOT EXISTS idx_et_calc_field_date ON public.evapotranspiration_calculations (field_id, calculation_date DESC);
CREATE INDEX IF NOT EXISTS idx_soil_water_balance_field_date ON public.soil_water_balance (field_id, balance_date DESC);
CREATE INDEX IF NOT EXISTS idx_water_req_calc_field_date ON public.water_requirement_calculations (field_id, calculation_date DESC);
CREATE INDEX IF NOT EXISTS idx_water_stress_field_time ON public.water_stress_estimates (field_id, estimated_at DESC);

CREATE INDEX IF NOT EXISTS idx_feature_snapshots_field_time ON public.feature_snapshots (field_id, snapshot_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_field_time ON public.predictions (field_id, predicted_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_model_version ON public.predictions (model_version_id);

-- ============================================================================
-- 5. Recommendations & Notifications Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_recommendations_field_status ON public.recommendations (field_id, status, action_window_start DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_action_start ON public.recommendations (action_window_start);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON public.notifications (user_id, delivery_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_lineage_source ON public.data_lineage (source_table, source_id);
CREATE INDEX IF NOT EXISTS idx_data_lineage_derived ON public.data_lineage (derived_table, derived_id);

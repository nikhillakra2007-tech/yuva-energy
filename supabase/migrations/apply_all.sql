/* ============================================================================ */
/* FILE: 001_extensions.sql */
/* ============================================================================ */
-- Migration: 001_extensions.sql
-- Purpose: Enable core PostgreSQL and PostGIS extensions for spatial and cryptographic operations.
-- Domain: System Foundation

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Note on PostGIS:
-- postgis provides geometry, geography, ST_Area, ST_Centroid, ST_Intersects, ST_Contains, etc.




/* ============================================================================ */
/* FILE: 002_core_users_roles.sql */
/* ============================================================================ */
-- Migration: 002_core_users_roles.sql
-- Purpose: User identity reference, system roles, and user-role assignments.
-- Domain: Domain 1 â€” User & Access

-- Master Roles reference table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Application Users table
-- Links to Supabase auth.users(id) via UUID without hard FK to allow flexible deployment & testing
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- References auth.users(id) when authenticated through Supabase Auth
    full_name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT UNIQUE,
    preferred_language TEXT NOT NULL DEFAULT 'en',
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- User Roles Junction table (N:N relationship)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT uq_user_roles UNIQUE (user_id, role_id)
);




/* ============================================================================ */
/* FILE: 003_farms.sql */
/* ============================================================================ */
-- Migration: 003_farms.sql
-- Purpose: Farms entity representing agricultural landholdings owned or managed by users.
-- Domain: Domain 1 â€” User & Access / Geographic Anchor

CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    location GEOMETRY(Point, 4326), -- Farm center/entrance pin
    latitude DOUBLE PRECISION CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
    longitude DOUBLE PRECISION CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180)),
    elevation_meters NUMERIC(7, 2) CHECK (elevation_meters IS NULL OR elevation_meters >= -500),
    total_area_hectares NUMERIC(10, 4) CHECK (total_area_hectares IS NULL OR total_area_hectares >= 0),
    primary_water_source TEXT,
    grid_connection_type TEXT DEFAULT '3_PHASE_AGRICULTURAL',
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);




/* ============================================================================ */
/* FILE: 004_geography.sql */
/* ============================================================================ */
-- Migration: 004_geography.sql
-- Purpose: Spatial entities for administrative boundaries, fields, and field zones.
-- Domain: Domain 2 â€” Geography & Spatial Data

-- Administrative Hierarchy (Country -> State -> District -> Block/Tehsil -> Village)
CREATE TABLE IF NOT EXISTS public.administrative_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.administrative_areas(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    level_type TEXT NOT NULL CHECK (level_type IN ('COUNTRY', 'STATE', 'DISTRICT', 'SUB_DISTRICT', 'BLOCK', 'VILLAGE', 'OTHER')),
    iso_code TEXT,
    boundary GEOMETRY(MultiPolygon, 4326),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Fields: The core spatial and agronomic unit
CREATE TABLE IF NOT EXISTS public.fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE RESTRICT,
    administrative_area_id UUID REFERENCES public.administrative_areas(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    code TEXT,
    -- PostGIS Polygon boundary is the PRIMARY spatial representation
    boundary GEOMETRY(Polygon, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326),
    area_hectares NUMERIC(10, 4) CHECK (area_hectares IS NULL OR area_hectares > 0),
    perimeter_meters NUMERIC(10, 2) CHECK (perimeter_meters IS NULL OR perimeter_meters > 0),
    polygon_source TEXT NOT NULL DEFAULT 'USER_DRAWN_MAP' CHECK (polygon_source IN ('USER_DRAWN_MAP', 'GPS_DEVICE', 'SURVEY_IMPORT', 'SATELLITE_DIGITIZED')),
    location_accuracy_meters NUMERIC(6, 2),
    elevation_mean_meters NUMERIC(7, 2),
    slope_percentage NUMERIC(5, 2) CHECK (slope_percentage IS NULL OR (slope_percentage >= 0 AND slope_percentage <= 100)),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Field Zones: Sub-divisions of fields for precision management
CREATE TABLE IF NOT EXISTS public.field_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    zone_code TEXT,
    boundary GEOMETRY(Polygon, 4326),
    area_hectares NUMERIC(10, 4) CHECK (area_hectares IS NULL OR area_hectares > 0),
    soil_type TEXT,
    management_strategy TEXT DEFAULT 'STANDARD',
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);




/* ============================================================================ */
/* FILE: 005_crops.sql */
/* ============================================================================ */
-- Migration: 005_crops.sql
-- Purpose: Crop taxonomy, varieties, seasonal cycles, growth stages, FAO-56 parameters, and regional stats.
-- Domain: Domain 3 â€” Crop & Agronomy

-- Master Crop Catalog
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    botanical_name TEXT,
    crop_category TEXT NOT NULL CHECK (crop_category IN ('CEREAL', 'PULSE', 'OILSEED', 'VEGETABLE', 'FRUIT', 'CASH_CROP', 'FODDER', 'OTHER')),
    default_season TEXT CHECK (default_season IN ('KHARIF', 'RABI', 'ZAID', 'PERENNIAL', 'ALL_SEASON')),
    water_demand_category TEXT CHECK (water_demand_category IN ('VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH')),
    typical_duration_days INTEGER CHECK (typical_duration_days > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Crop Varieties (1 Crop -> N Varieties)
CREATE TABLE IF NOT EXISTS public.crop_varieties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    breeder_agency TEXT,
    maturity_duration_days INTEGER CHECK (maturity_duration_days > 0),
    drought_tolerance TEXT CHECK (drought_tolerance IN ('LOW', 'MODERATE', 'HIGH', 'VERY_HIGH')),
    potential_yield_kg_per_ha NUMERIC(10, 2) CHECK (potential_yield_kg_per_ha IS NULL OR potential_yield_kg_per_ha > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_crop_variety_code UNIQUE (crop_id, code)
);

-- Field Crop Cycles (1 Field -> Multiple Historical Planting Cycles)
CREATE TABLE IF NOT EXISTS public.crop_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
    crop_variety_id UUID REFERENCES public.crop_varieties(id) ON DELETE RESTRICT,
    season TEXT NOT NULL CHECK (season IN ('KHARIF', 'RABI', 'ZAID', 'ANNUAL', 'SPRING', 'AUTUMN', 'SUMMER', 'WINTER')),
    cycle_year INTEGER NOT NULL CHECK (cycle_year >= 1990 AND cycle_year <= 2100),
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    planted_area_hectares NUMERIC(10, 4) CHECK (planted_area_hectares IS NULL OR planted_area_hectares > 0),
    target_yield_kg_per_ha NUMERIC(10, 2),
    actual_yield_kg_per_ha NUMERIC(10, 2),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PLANNED', 'ACTIVE', 'HARVESTED', 'FAILED', 'TERMINATED')),
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_crop_cycle_dates CHECK (expected_harvest_date IS NULL OR expected_harvest_date >= sowing_date)
);

-- Master Crop Growth Stages
CREATE TABLE IF NOT EXISTS public.crop_growth_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
    stage_code TEXT NOT NULL CHECK (stage_code IN ('INITIAL', 'DEVELOPMENT', 'MID_SEASON', 'LATE_SEASON', 'HARVEST')),
    stage_name TEXT NOT NULL,
    stage_order INTEGER NOT NULL CHECK (stage_order >= 1 AND stage_order <= 10),
    typical_duration_days INTEGER CHECK (typical_duration_days > 0),
    kc_coefficient NUMERIC(4, 2) CHECK (kc_coefficient >= 0.1 AND kc_coefficient <= 2.5),
    rooting_depth_meters NUMERIC(4, 2) CHECK (rooting_depth_meters > 0 AND rooting_depth_meters <= 5.0),
    depletion_fraction_p NUMERIC(3, 2) CHECK (depletion_fraction_p > 0 AND depletion_fraction_p <= 1.0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_crop_growth_stage UNIQUE (crop_id, stage_code)
);

-- Crop Stage Observations per Cycle
CREATE TABLE IF NOT EXISTS public.crop_stage_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_cycle_id UUID NOT NULL REFERENCES public.crop_cycles(id) ON DELETE RESTRICT,
    growth_stage_id UUID NOT NULL REFERENCES public.crop_growth_stages(id) ON DELETE RESTRICT,
    observed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    provenance TEXT NOT NULL CHECK (provenance IN ('EXPECTED', 'FARMER_CONFIRMED', 'MODEL_INFERRED', 'REMOTE_SENSING_INFERRED')),
    confidence_score NUMERIC(4, 3) CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1.0)),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Crop Model Parameters (FAO-56 Baseline)
CREATE TABLE IF NOT EXISTS public.crop_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
    crop_variety_id UUID REFERENCES public.crop_varieties(id) ON DELETE RESTRICT,
    version_tag TEXT NOT NULL DEFAULT 'FAO-56-DEFAULT',
    kc_initial NUMERIC(4, 2) NOT NULL CHECK (kc_initial > 0),
    kc_mid NUMERIC(4, 2) NOT NULL CHECK (kc_mid > 0),
    kc_end NUMERIC(4, 2) NOT NULL CHECK (kc_end > 0),
    min_root_depth_meters NUMERIC(4, 2) NOT NULL CHECK (min_root_depth_meters > 0),
    max_root_depth_meters NUMERIC(4, 2) NOT NULL CHECK (max_root_depth_meters >= min_root_depth_meters),
    critical_depletion_fraction_p NUMERIC(3, 2) NOT NULL CHECK (critical_depletion_fraction_p > 0 AND critical_depletion_fraction_p <= 1.0),
    yield_response_factor_ky NUMERIC(4, 2) CHECK (yield_response_factor_ky >= 0),
    max_height_meters NUMERIC(4, 2) CHECK (max_height_meters > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_crop_parameters UNIQUE (crop_id, version_tag)
);

-- Regional Historical Statistics
CREATE TABLE IF NOT EXISTS public.crop_production_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE RESTRICT,
    administrative_area_id UUID REFERENCES public.administrative_areas(id) ON DELETE SET NULL,
    region_name TEXT NOT NULL,
    statistic_year INTEGER NOT NULL CHECK (statistic_year >= 1950 AND statistic_year <= 2100),
    season TEXT NOT NULL,
    area_sown_hectares NUMERIC(14, 2) CHECK (area_sown_hectares IS NULL OR area_sown_hectares >= 0),
    production_metric_tonnes NUMERIC(14, 2) CHECK (production_metric_tonnes IS NULL OR production_metric_tonnes >= 0),
    average_yield_kg_per_ha NUMERIC(10, 2) CHECK (average_yield_kg_per_ha IS NULL OR average_yield_kg_per_ha >= 0),
    source_agency TEXT NOT NULL DEFAULT 'GOVERNMENT_STATISTICS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);




/* ============================================================================ */
/* FILE: 006_weather.sql */
/* ============================================================================ */
-- Migration: 006_weather.sql
-- Purpose: Meteorological sources, spatial stations/grids, historical observations, and forecast runs.
-- Domain: Domain 4 â€” Weather

-- Master Weather Data Sources
CREATE TABLE IF NOT EXISTS public.weather_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('API', 'SATELLITE_REANALYSIS', 'GOVERNMENT_STATION', 'ON_FARM_IOT', 'HYBRID')),
    base_url TEXT,
    attribution TEXT,
    temporal_resolution TEXT DEFAULT 'HOURLY',
    spatial_resolution_km NUMERIC(6, 2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Weather Reference Locations (Stations or Gridded Reanalysis Points)
CREATE TABLE IF NOT EXISTS public.weather_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.weather_sources(id) ON DELETE RESTRICT,
    provider_location_id TEXT,
    name TEXT NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    elevation_meters NUMERIC(7, 2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Actual Historical / Current Weather Observations
CREATE TABLE IF NOT EXISTS public.weather_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID REFERENCES public.fields(id) ON DELETE RESTRICT,
    weather_location_id UUID REFERENCES public.weather_locations(id) ON DELETE SET NULL,
    weather_source_id UUID NOT NULL REFERENCES public.weather_sources(id) ON DELETE RESTRICT,
    observed_at TIMESTAMPTZ NOT NULL,
    temperature_celsius NUMERIC(5, 2),
    temperature_min_celsius NUMERIC(5, 2),
    temperature_max_celsius NUMERIC(5, 2),
    relative_humidity_percentage NUMERIC(5, 2) CHECK (relative_humidity_percentage IS NULL OR (relative_humidity_percentage >= 0 AND relative_humidity_percentage <= 100)),
    dew_point_celsius NUMERIC(5, 2),
    precipitation_mm NUMERIC(7, 2) CHECK (precipitation_mm IS NULL OR precipitation_mm >= 0),
    solar_radiation_mj_m2 NUMERIC(7, 3) CHECK (solar_radiation_mj_m2 IS NULL OR solar_radiation_mj_m2 >= 0),
    wind_speed_m_s NUMERIC(5, 2) CHECK (wind_speed_m_s IS NULL OR wind_speed_m_s >= 0),
    wind_direction_degrees NUMERIC(5, 1) CHECK (wind_direction_degrees IS NULL OR (wind_direction_degrees >= 0 AND wind_direction_degrees <= 360)),
    surface_pressure_hpa NUMERIC(6, 1) CHECK (surface_pressure_hpa IS NULL OR (surface_pressure_hpa >= 300 AND surface_pressure_hpa <= 1100)),
    reference_et0_mm NUMERIC(6, 2) CHECK (reference_et0_mm IS NULL OR reference_et0_mm >= 0),
    provenance TEXT NOT NULL DEFAULT 'EXTERNAL_RETRIEVED' CHECK (provenance IN ('EXTERNAL_RETRIEVED', 'OBSERVED', 'CALCULATED')),
    data_quality_flag TEXT NOT NULL DEFAULT 'GOOD' CHECK (data_quality_flag IN ('GOOD', 'SUSPECT', 'INTERPOLATED', 'MISSING')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Weather Forecast Model Runs
CREATE TABLE IF NOT EXISTS public.weather_forecast_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weather_source_id UUID NOT NULL REFERENCES public.weather_sources(id) ON DELETE RESTRICT,
    run_model_name TEXT NOT NULL,
    run_identifier TEXT,
    run_generated_at TIMESTAMPTZ NOT NULL,
    forecast_horizon_hours INTEGER NOT NULL CHECK (forecast_horizon_hours > 0),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Discretized Weather Forecast Values
CREATE TABLE IF NOT EXISTS public.weather_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_run_id UUID NOT NULL REFERENCES public.weather_forecast_runs(id) ON DELETE CASCADE,
    weather_location_id UUID REFERENCES public.weather_locations(id) ON DELETE SET NULL,
    field_id UUID REFERENCES public.fields(id) ON DELETE RESTRICT,
    forecast_target_at TIMESTAMPTZ NOT NULL,
    temperature_celsius NUMERIC(5, 2),
    relative_humidity_percentage NUMERIC(5, 2) CHECK (relative_humidity_percentage IS NULL OR (relative_humidity_percentage >= 0 AND relative_humidity_percentage <= 100)),
    precipitation_amount_mm NUMERIC(7, 2) CHECK (precipitation_amount_mm IS NULL OR precipitation_amount_mm >= 0),
    precipitation_probability_percentage NUMERIC(5, 2) CHECK (precipitation_probability_percentage IS NULL OR (precipitation_probability_percentage >= 0 AND precipitation_probability_percentage <= 100)),
    solar_radiation_mj_m2 NUMERIC(7, 3) CHECK (solar_radiation_mj_m2 IS NULL OR solar_radiation_mj_m2 >= 0),
    wind_speed_m_s NUMERIC(5, 2) CHECK (wind_speed_m_s IS NULL OR wind_speed_m_s >= 0),
    reference_et0_mm NUMERIC(6, 2) CHECK (reference_et0_mm IS NULL OR reference_et0_mm >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_forecast_target UNIQUE (forecast_run_id, field_id, forecast_target_at)
);




/* ============================================================================ */
/* FILE: 007_satellite.sql */
/* ============================================================================ */
-- Migration: 007_satellite.sql
-- Purpose: Satellite constellations, collections, scene granules, processing pipelines, canopy indices, and assets.
-- Domain: Domain 5 â€” Satellite & Earth Observation

-- Satellite Constellation / Providers
CREATE TABLE IF NOT EXISTS public.satellite_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    operator TEXT NOT NULL, -- e.g. ESA, NASA/USGS, Planet Labs
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Satellite Sensor Products / Collections
CREATE TABLE IF NOT EXISTS public.satellite_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.satellite_sources(id) ON DELETE RESTRICT,
    collection_code TEXT NOT NULL UNIQUE, -- e.g. SENTINEL-2-L2A-BOA, LANDSAT-9-C2L2
    name TEXT NOT NULL,
    spatial_resolution_meters NUMERIC(5, 2) NOT NULL,
    revisit_interval_days NUMERIC(4, 1),
    bands_available JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Satellite Acquisition Scenes / Granules
CREATE TABLE IF NOT EXISTS public.satellite_scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES public.satellite_collections(id) ON DELETE RESTRICT,
    provider_scene_id TEXT NOT NULL UNIQUE,
    acquired_at TIMESTAMPTZ NOT NULL,
    cloud_coverage_percentage NUMERIC(5, 2) CHECK (cloud_coverage_percentage >= 0 AND cloud_coverage_percentage <= 100),
    sun_elevation_angle NUMERIC(5, 2),
    sun_azimuth_angle NUMERIC(5, 2),
    footprint GEOMETRY(Polygon, 4326),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Processing Pipeline Executions
CREATE TABLE IF NOT EXISTS public.satellite_processing_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID NOT NULL REFERENCES public.satellite_scenes(id) ON DELETE RESTRICT,
    pipeline_name TEXT NOT NULL DEFAULT 'CROP_CANOPY_EXTRACTOR',
    pipeline_version TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Field-Level Satellite Observations (Discrete Acquisition Events)
CREATE TABLE IF NOT EXISTS public.satellite_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    scene_id UUID NOT NULL REFERENCES public.satellite_scenes(id) ON DELETE RESTRICT,
    processing_run_id UUID REFERENCES public.satellite_processing_runs(id) ON DELETE SET NULL,
    acquired_at TIMESTAMPTZ NOT NULL,
    cloud_cover_field_percentage NUMERIC(5, 2) CHECK (cloud_cover_field_percentage IS NULL OR (cloud_cover_field_percentage >= 0 AND cloud_cover_field_percentage <= 100)),
    valid_pixel_percentage NUMERIC(5, 2) CHECK (valid_pixel_percentage IS NULL OR (valid_pixel_percentage >= 0 AND valid_pixel_percentage <= 100)),
    data_quality_status TEXT NOT NULL DEFAULT 'VALID' CHECK (data_quality_status IN ('VALID', 'CLOUDY', 'SHADOW', 'PARTIAL_FILL', 'CORRUPTED')),
    provenance TEXT NOT NULL DEFAULT 'EXTERNAL_RETRIEVED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_field_scene UNIQUE (field_id, scene_id)
);

-- Calculated Spectral Vegetation & Canopy Indices
CREATE TABLE IF NOT EXISTS public.vegetation_indices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    satellite_observation_id UUID NOT NULL REFERENCES public.satellite_observations(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    index_code TEXT NOT NULL CHECK (index_code IN ('NDVI', 'EVI', 'NDRE', 'NDWI', 'SAVI')),
    mean_value NUMERIC(6, 4) NOT NULL CHECK (mean_value >= -1.0 AND mean_value <= 1.0),
    median_value NUMERIC(6, 4) CHECK (median_value >= -1.0 AND median_value <= 1.0),
    std_dev NUMERIC(6, 4) CHECK (std_dev >= 0),
    min_value NUMERIC(6, 4) CHECK (min_value >= -1.0 AND min_value <= 1.0),
    max_value NUMERIC(6, 4) CHECK (max_value >= -1.0 AND max_value <= 1.0),
    confidence_score NUMERIC(4, 3) CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1.0)),
    acquired_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_observation_index UNIQUE (satellite_observation_id, index_code)
);

-- References to Remote Sensing Assets in Object Storage (GeoTIFF, PNG preview)
CREATE TABLE IF NOT EXISTS public.satellite_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    satellite_observation_id UUID REFERENCES public.satellite_observations(id) ON DELETE CASCADE,
    scene_id UUID REFERENCES public.satellite_scenes(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.fields(id) ON DELETE RESTRICT,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('TRUE_COLOR_RGB', 'NDVI_MAP', 'FALSE_COLOR_IR', 'CLOUD_MASK', 'PREVIEW_PNG')),
    storage_bucket TEXT NOT NULL DEFAULT 'satellite-assets',
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'image/tiff',
    file_size_bytes BIGINT CHECK (file_size_bytes IS NULL OR file_size_bytes > 0),
    checksum TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);




/* ============================================================================ */
/* FILE: 008_soil.sql */
/* ============================================================================ */
-- Migration: 008_soil.sql
-- Purpose: Soil authorities, physical/hydraulic observations, laboratory samples, and dynamic soil moisture.
-- Domain: Domain 6 â€” Soil Intelligence

-- Master Soil Data Sources
CREATE TABLE IF NOT EXISTS public.soil_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('GLOBAL_DATABASE', 'GOVERNMENT_SURVEY', 'LABORATORY', 'FARMER_INPUT', 'IOT_SENSOR')),
    description TEXT,
    attribution TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Field Soil Physical & Hydraulic Properties
CREATE TABLE IF NOT EXISTS public.soil_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    soil_source_id UUID NOT NULL REFERENCES public.soil_sources(id) ON DELETE RESTRICT,
    observed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    soil_texture_class TEXT CHECK (soil_texture_class IN ('CLAY', 'SILTY_CLAY', 'SANDY_CLAY', 'CLAY_LOAM', 'SILTY_CLAY_LOAM', 'SANDY_CLAY_LOAM', 'LOAM', 'SILT_LOAM', 'SILT', 'SANDY_LOAM', 'LOAMY_SAND', 'SAND')),
    sand_percentage NUMERIC(5, 2) CHECK (sand_percentage IS NULL OR (sand_percentage >= 0 AND sand_percentage <= 100)),
    silt_percentage NUMERIC(5, 2) CHECK (silt_percentage IS NULL OR (silt_percentage >= 0 AND silt_percentage <= 100)),
    clay_percentage NUMERIC(5, 2) CHECK (clay_percentage IS NULL OR (clay_percentage >= 0 AND clay_percentage <= 100)),
    organic_carbon_percentage NUMERIC(5, 2) CHECK (organic_carbon_percentage IS NULL OR (organic_carbon_percentage >= 0 AND organic_carbon_percentage <= 20)),
    ph NUMERIC(4, 2) CHECK (ph IS NULL OR (ph >= 2.0 AND ph <= 12.0)),
    bulk_density_g_cm3 NUMERIC(4, 2) CHECK (bulk_density_g_cm3 IS NULL OR (bulk_density_g_cm3 >= 0.5 AND bulk_density_g_cm3 <= 2.5)),
    field_capacity_vwc NUMERIC(4, 3) CHECK (field_capacity_vwc IS NULL OR (field_capacity_vwc >= 0.05 AND field_capacity_vwc <= 0.60)),
    wilting_point_vwc NUMERIC(4, 3) CHECK (wilting_point_vwc IS NULL OR (wilting_point_vwc >= 0.01 AND wilting_point_vwc <= 0.40)),
    saturation_vwc NUMERIC(4, 3) CHECK (saturation_vwc IS NULL OR (saturation_vwc >= 0.20 AND saturation_vwc <= 0.70)),
    available_water_capacity_mm_per_m NUMERIC(6, 2) CHECK (available_water_capacity_mm_per_m IS NULL OR available_water_capacity_mm_per_m >= 0),
    profile_depth_top_cm NUMERIC(5, 1) DEFAULT 0 CHECK (profile_depth_top_cm >= 0),
    profile_depth_bottom_cm NUMERIC(5, 1) DEFAULT 30 CHECK (profile_depth_bottom_cm > profile_depth_top_cm),
    provenance TEXT NOT NULL DEFAULT 'EXTERNAL_RETRIEVED' CHECK (provenance IN ('EXTERNAL_RETRIEVED', 'USER_PROVIDED', 'LAB_TESTED', 'INFERRED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Actual Physical Laboratory Soil Samples
CREATE TABLE IF NOT EXISTS public.soil_samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    sample_code TEXT NOT NULL,
    collection_date DATE NOT NULL,
    sampling_depth_cm NUMERIC(5, 1) NOT NULL CHECK (sampling_depth_cm > 0),
    laboratory_name TEXT,
    report_identifier TEXT,
    electrical_conductivity_ds_m NUMERIC(5, 2),
    nitrogen_available_kg_ha NUMERIC(7, 2),
    phosphorus_available_kg_ha NUMERIC(7, 2),
    potassium_available_kg_ha NUMERIC(7, 2),
    micronutrients_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    lab_certificate_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Dynamic Soil Moisture Observations (Time-series)
CREATE TABLE IF NOT EXISTS public.soil_moisture_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    observed_at TIMESTAMPTZ NOT NULL,
    depth_cm NUMERIC(5, 1) NOT NULL DEFAULT 15 CHECK (depth_cm >= 0),
    volumetric_water_content_percentage NUMERIC(5, 2) NOT NULL CHECK (volumetric_water_content_percentage >= 0 AND volumetric_water_content_percentage <= 100),
    matric_potential_kpa NUMERIC(7, 2),
    soil_temperature_celsius NUMERIC(5, 2),
    provenance TEXT NOT NULL CHECK (provenance IN ('SENSOR_MEASURED', 'SATELLITE_DERIVED', 'REANALYSIS_DERIVED', 'MODEL_ESTIMATED')),
    data_quality_flag TEXT NOT NULL DEFAULT 'RELIABLE' CHECK (data_quality_flag IN ('RELIABLE', 'ESTIMATED', 'UNCERTAIN', 'SENSOR_FAULT')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);




/* ============================================================================ */
/* FILE: 009_irrigation.sql */
/* ============================================================================ */
-- Migration: 009_irrigation.sql
-- Purpose: Water sources, delivery methods, physical irrigation systems, pump hydraulics, events, and water measurements.
-- Domain: Domain 7 â€” Water & Irrigation

-- Master Water Sources
CREATE TABLE IF NOT EXISTS public.water_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('BOREWELL', 'OPEN_WELL', 'CANAL', 'FARM_POND', 'RIVER', 'MUNICIPAL', 'RECYCLED')),
    salinity_status TEXT CHECK (salinity_status IN ('FRESH', 'SLIGHTLY_SALINE', 'MODERATELY_SALINE', 'HIGHLY_SALINE')),
    reliability_tier TEXT DEFAULT 'HIGH' CHECK (reliability_tier IN ('VERY_HIGH', 'HIGH', 'SEASONAL', 'INTERMITTENT', 'DEPLETED')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Master Irrigation Methods (FAO-defined efficiencies)
CREATE TABLE IF NOT EXISTS public.irrigation_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('MICRO_IRRIGATION', 'PRESSURIZED_OVERHEAD', 'SURFACE_GRAVITY', 'SUBSURFACE')),
    typical_application_efficiency_pct NUMERIC(4, 1) NOT NULL CHECK (typical_application_efficiency_pct >= 20 AND typical_application_efficiency_pct <= 98),
    wetting_fraction_fw NUMERIC(3, 2) NOT NULL CHECK (wetting_fraction_fw > 0 AND wetting_fraction_fw <= 1.0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- On-Farm Irrigation Systems
CREATE TABLE IF NOT EXISTS public.irrigation_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE RESTRICT,
    field_id UUID REFERENCES public.fields(id) ON DELETE RESTRICT,
    irrigation_method_id UUID NOT NULL REFERENCES public.irrigation_methods(id) ON DELETE RESTRICT,
    water_source_id UUID NOT NULL REFERENCES public.water_sources(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    system_efficiency_pct NUMERIC(4, 1) CHECK (system_efficiency_pct >= 20 AND system_efficiency_pct <= 100),
    emitter_spacing_meters NUMERIC(4, 2),
    lateral_spacing_meters NUMERIC(4, 2),
    operating_pressure_bar NUMERIC(4, 2) CHECK (operating_pressure_bar IS NULL OR operating_pressure_bar > 0),
    automation_level TEXT NOT NULL DEFAULT 'MANUAL' CHECK (automation_level IN ('MANUAL', 'SEMI_AUTOMATED', 'FULLY_AUTOMATED_IOT')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Irrigation Zones
CREATE TABLE IF NOT EXISTS public.irrigation_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_zone_id UUID NOT NULL REFERENCES public.field_zones(id) ON DELETE RESTRICT,
    irrigation_system_id UUID NOT NULL REFERENCES public.irrigation_systems(id) ON DELETE RESTRICT,
    valve_identifier TEXT,
    design_flow_rate_l_min NUMERIC(8, 2) CHECK (design_flow_rate_l_min IS NULL OR design_flow_rate_l_min > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Pumps and Electric/Solar Motors
CREATE TABLE IF NOT EXISTS public.pumps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE RESTRICT,
    irrigation_system_id UUID REFERENCES public.irrigation_systems(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    pump_type TEXT NOT NULL CHECK (pump_type IN ('SUBMERSIBLE', 'SURFACE_MONOBLOCK', 'OPENWELL_SUBMERSIBLE', 'SOLAR_DC_PUMP', 'CENTRIFUGAL', 'DIESEL_ENGINE')),
    rated_power_kw NUMERIC(6, 2) CHECK (rated_power_kw IS NULL OR rated_power_kw > 0),
    rated_power_hp NUMERIC(6, 2) CHECK (rated_power_hp IS NULL OR rated_power_hp > 0),
    rated_flow_rate_l_min NUMERIC(8, 2) CHECK (rated_flow_rate_l_min IS NULL OR rated_flow_rate_l_min > 0),
    rated_head_meters NUMERIC(6, 2) CHECK (rated_head_meters IS NULL OR rated_head_meters > 0),
    overall_efficiency_pct NUMERIC(4, 1) CHECK (overall_efficiency_pct IS NULL OR (overall_efficiency_pct >= 10 AND overall_efficiency_pct <= 95)),
    energy_source_code TEXT DEFAULT 'GRID_3_PHASE',
    installation_year INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Historical & Executed Irrigation Events
CREATE TABLE IF NOT EXISTS public.irrigation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    irrigation_system_id UUID NOT NULL REFERENCES public.irrigation_systems(id) ON DELETE RESTRICT,
    pump_id UUID REFERENCES public.pumps(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_minutes NUMERIC(7, 2) CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
    target_depth_mm NUMERIC(6, 2) CHECK (target_depth_mm IS NULL OR target_depth_mm >= 0),
    actual_depth_applied_mm NUMERIC(6, 2) CHECK (actual_depth_applied_mm IS NULL OR actual_depth_applied_mm >= 0),
    total_volume_litres NUMERIC(12, 2) CHECK (total_volume_litres IS NULL OR total_volume_litres >= 0),
    execution_status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (execution_status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'PARTIALLY_EXECUTED', 'CANCELLED')),
    provenance TEXT NOT NULL DEFAULT 'ESTIMATED' CHECK (provenance IN ('MEASURED', 'ESTIMATED', 'FARMER_REPORTED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Water Volume Measurements
CREATE TABLE IF NOT EXISTS public.water_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    irrigation_event_id UUID NOT NULL REFERENCES public.irrigation_events(id) ON DELETE RESTRICT,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    measurement_type TEXT NOT NULL CHECK (measurement_type IN ('PHYSICAL_FLOW_METER', 'PUMP_RUNTIME_FLOW_CALCULATION', 'CANAL_CREST_GAUGE', 'RESERVOIR_DROP_INFERRED')),
    volume_cubic_meters NUMERIC(10, 3) NOT NULL CHECK (volume_cubic_meters >= 0),
    volume_litres NUMERIC(12, 2) NOT NULL CHECK (volume_litres >= 0),
    measured_flow_rate_l_min NUMERIC(8, 2),
    provenance TEXT NOT NULL CHECK (provenance IN ('MEASURED', 'ESTIMATED', 'CALCULATED')),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);




/* ============================================================================ */
/* FILE: 010_energy.sql */
/* ============================================================================ */
-- Migration: 010_energy.sql
-- Purpose: Energy sources, systems, electrical/solar assets, time-series telemetry, TOU tariffs, and solar forecasts.
-- Domain: Domain 8 â€” Energy & Power

-- Master Energy Sources
CREATE TABLE IF NOT EXISTS public.energy_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    source_category TEXT NOT NULL CHECK (source_category IN ('GRID_UTILITY', 'SOLAR_PHOTOVOLTAIC', 'BATTERY_STORAGE', 'DIESEL_GENERATOR', 'WIND', 'HYBRID')),
    emission_factor_kg_co2_per_kwh NUMERIC(6, 4) CHECK (emission_factor_kg_co2_per_kwh >= 0),
    is_renewable BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Farm Energy Infrastructure Systems
CREATE TABLE IF NOT EXISTS public.energy_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    primary_source_id UUID NOT NULL REFERENCES public.energy_sources(id) ON DELETE RESTRICT,
    grid_sanctioned_load_kw NUMERIC(6, 2) CHECK (grid_sanctioned_load_kw IS NULL OR grid_sanctioned_load_kw >= 0),
    solar_capacity_kwp NUMERIC(6, 2) CHECK (solar_capacity_kwp IS NULL OR solar_capacity_kwp >= 0),
    battery_capacity_kwh NUMERIC(7, 2) CHECK (battery_capacity_kwh IS NULL OR battery_capacity_kwh >= 0),
    has_net_metering BOOLEAN NOT NULL DEFAULT false,
    feeder_schedule_type TEXT DEFAULT 'ROSTERED_AGRICULTURAL' CHECK (feeder_schedule_type IN ('CONTINUOUS_24X7', 'ROSTERED_AGRICULTURAL', 'SOLAR_HOURS_ONLY', 'NIGHT_HOURS_ONLY')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Energy Assets (Inverters, Panels, Drives, Meters)
CREATE TABLE IF NOT EXISTS public.energy_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    energy_system_id UUID NOT NULL REFERENCES public.energy_systems(id) ON DELETE RESTRICT,
    pump_id UUID REFERENCES public.pumps(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('SOLAR_PV_ARRAY', 'SOLAR_PUMP_INVERTER', 'GRID_INTERACTIVE_INVERTER', 'VARIABLE_FREQUENCY_DRIVE', 'LITHIUM_BATTERY_BANK', 'SMART_BIDIRECTIONAL_METER', 'DIESEL_GENSET')),
    manufacturer TEXT,
    model_number TEXT,
    rated_capacity_kw NUMERIC(7, 2) CHECK (rated_capacity_kw IS NULL OR rated_capacity_kw > 0),
    efficiency_percentage NUMERIC(4, 1) CHECK (efficiency_percentage IS NULL OR (efficiency_percentage >= 50 AND efficiency_percentage <= 99.9)),
    installation_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Time-Series Electrical & Solar Measurements
CREATE TABLE IF NOT EXISTS public.energy_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    energy_system_id UUID NOT NULL REFERENCES public.energy_systems(id) ON DELETE RESTRICT,
    asset_id UUID REFERENCES public.energy_assets(id) ON DELETE SET NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    active_power_kw NUMERIC(8, 3) CHECK (active_power_kw IS NULL OR active_power_kw >= 0),
    energy_consumed_kwh NUMERIC(10, 3) CHECK (energy_consumed_kwh IS NULL OR energy_consumed_kwh >= 0),
    energy_generated_solar_kwh NUMERIC(10, 3) CHECK (energy_generated_solar_kwh IS NULL OR energy_generated_solar_kwh >= 0),
    line_voltage_volts NUMERIC(6, 2) CHECK (line_voltage_volts IS NULL OR line_voltage_volts >= 0),
    current_amperes NUMERIC(6, 2) CHECK (current_amperes IS NULL OR current_amperes >= 0),
    power_factor NUMERIC(3, 2) CHECK (power_factor IS NULL OR (power_factor >= -1.0 AND power_factor <= 1.0)),
    frequency_hertz NUMERIC(4, 2) CHECK (frequency_hertz IS NULL OR (frequency_hertz >= 40.0 AND frequency_hertz <= 70.0)),
    provenance TEXT NOT NULL DEFAULT 'MEASURED' CHECK (provenance IN ('MEASURED', 'INVERTER_LOGGED', 'CALCULATED', 'ESTIMATED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Electricity Pricing Tariffs (TOU / TOD / Subsidized)
CREATE TABLE IF NOT EXISTS public.energy_tariffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    energy_system_id UUID REFERENCES public.energy_systems(id) ON DELETE CASCADE,
    utility_provider_name TEXT NOT NULL,
    tariff_code TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    effective_from DATE NOT NULL,
    effective_to DATE,
    rate_standard_per_kwh NUMERIC(7, 3) NOT NULL CHECK (rate_standard_per_kwh >= 0),
    rate_peak_per_kwh NUMERIC(7, 3) NOT NULL CHECK (rate_peak_per_kwh >= 0),
    rate_off_peak_per_kwh NUMERIC(7, 3) NOT NULL CHECK (rate_off_peak_per_kwh >= 0),
    peak_window_start TIME NOT NULL DEFAULT '18:00:00',
    peak_window_end TIME NOT NULL DEFAULT '22:00:00',
    off_peak_window_start TIME NOT NULL DEFAULT '22:00:00',
    off_peak_window_end TIME NOT NULL DEFAULT '06:00:00',
    solar_feed_in_tariff_per_kwh NUMERIC(7, 3) DEFAULT 0 CHECK (solar_feed_in_tariff_per_kwh >= 0),
    is_agricultural_subsidized BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Day-Ahead Solar Generation & Energy Availability Forecasts
CREATE TABLE IF NOT EXISTS public.energy_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    energy_system_id UUID NOT NULL REFERENCES public.energy_systems(id) ON DELETE RESTRICT,
    forecast_generated_at TIMESTAMPTZ NOT NULL,
    forecast_target_at TIMESTAMPTZ NOT NULL,
    predicted_solar_generation_kw NUMERIC(7, 2) CHECK (predicted_solar_generation_kw IS NULL OR predicted_solar_generation_kw >= 0),
    expected_solar_energy_kwh NUMERIC(7, 2) CHECK (expected_solar_energy_kwh IS NULL OR expected_solar_energy_kwh >= 0),
    grid_availability_probability_pct NUMERIC(5, 2) CHECK (grid_availability_probability_pct >= 0 AND grid_availability_probability_pct <= 100),
    is_peak_tariff_window BOOLEAN NOT NULL DEFAULT false,
    forecast_model_name TEXT NOT NULL DEFAULT 'PV_CLEAR_SKY_SOLIS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_energy_forecast_target UNIQUE (energy_system_id, forecast_target_at)
);




/* ============================================================================ */
/* FILE: 011_agricultural_intelligence.sql */
/* ============================================================================ */
-- Migration: 011_agricultural_intelligence.sql
-- Purpose: Unified farm state synthesis, FAO-56 Penman-Monteith ET, soil water balance, and stress estimates.
-- Domain: Domain 9 â€” Agricultural Intelligence

-- Consolidated Point-in-Time Field / Farm State
CREATE TABLE IF NOT EXISTS public.farm_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
    growth_stage_id UUID REFERENCES public.crop_growth_stages(id) ON DELETE SET NULL,
    evaluated_at TIMESTAMPTZ NOT NULL,
    current_canopy_cover_pct NUMERIC(5, 2) CHECK (current_canopy_cover_pct IS NULL OR (current_canopy_cover_pct >= 0 AND current_canopy_cover_pct <= 100)),
    current_ndvi NUMERIC(5, 4) CHECK (current_ndvi IS NULL OR (current_ndvi >= -1.0 AND current_ndvi <= 1.0)),
    current_soil_moisture_vwc NUMERIC(4, 3) CHECK (current_soil_moisture_vwc IS NULL OR (current_soil_moisture_vwc >= 0 AND current_soil_moisture_vwc <= 1.0)),
    current_root_zone_depletion_mm NUMERIC(6, 2) CHECK (current_root_zone_depletion_mm IS NULL OR current_root_zone_depletion_mm >= 0),
    daily_etc_mm NUMERIC(6, 2) CHECK (daily_etc_mm IS NULL OR daily_etc_mm >= 0),
    water_stress_index_cwsi NUMERIC(4, 3) CHECK (water_stress_index_cwsi IS NULL OR (water_stress_index_cwsi >= 0 AND water_stress_index_cwsi <= 1.0)),
    data_completeness_score NUMERIC(4, 3) NOT NULL CHECK (data_completeness_score >= 0 AND data_completeness_score <= 1.0),
    overall_confidence_score NUMERIC(4, 3) NOT NULL CHECK (overall_confidence_score >= 0 AND overall_confidence_score <= 1.0),
    state_summary_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- FAO-56 Reference and Crop Evapotranspiration Calculations
CREATE TABLE IF NOT EXISTS public.evapotranspiration_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
    calculation_date DATE NOT NULL,
    calculation_method TEXT NOT NULL DEFAULT 'FAO56_PENMAN_MONTEITH' CHECK (calculation_method IN ('FAO56_PENMAN_MONTEITH', 'HARGREAVES_SAMANI', 'PRIESTLEY_TAYLOR')),
    reference_et0_mm NUMERIC(6, 2) NOT NULL CHECK (reference_et0_mm >= 0),
    crop_coefficient_kc NUMERIC(4, 2) NOT NULL CHECK (crop_coefficient_kc >= 0.1 AND crop_coefficient_kc <= 2.5),
    potential_etc_mm NUMERIC(6, 2) NOT NULL CHECK (potential_etc_mm >= 0),
    stress_reduction_factor_ks NUMERIC(4, 3) NOT NULL DEFAULT 1.0 CHECK (stress_reduction_factor_ks >= 0 AND stress_reduction_factor_ks <= 1.0),
    adjusted_etc_mm NUMERIC(6, 2) NOT NULL CHECK (adjusted_etc_mm >= 0),
    input_meteorological_ref JSONB NOT NULL DEFAULT '{}'::jsonb,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_field_et_date UNIQUE (field_id, calculation_date)
);

-- Daily Root-Zone Soil Water Balance Accounting (FAO-56 Chapter 8)
CREATE TABLE IF NOT EXISTS public.soil_water_balance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
    balance_date DATE NOT NULL,
    initial_depletion_mm NUMERIC(6, 2) NOT NULL CHECK (initial_depletion_mm >= 0),
    precipitation_mm NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (precipitation_mm >= 0),
    effective_precipitation_mm NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (effective_precipitation_mm >= 0),
    irrigation_applied_mm NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (irrigation_applied_mm >= 0),
    actual_etc_mm NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (actual_etc_mm >= 0),
    deep_percolation_loss_mm NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (deep_percolation_loss_mm >= 0),
    surface_runoff_loss_mm NUMERIC(6, 2) NOT NULL DEFAULT 0 CHECK (surface_runoff_loss_mm >= 0),
    final_depletion_mm NUMERIC(6, 2) NOT NULL CHECK (final_depletion_mm >= 0),
    total_available_water_taw_mm NUMERIC(6, 2) NOT NULL CHECK (total_available_water_taw_mm > 0),
    readily_available_water_raw_mm NUMERIC(6, 2) NOT NULL CHECK (readily_available_water_raw_mm > 0),
    is_water_stressed BOOLEAN NOT NULL DEFAULT false,
    provenance TEXT NOT NULL DEFAULT 'CALCULATED',
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_field_balance_date UNIQUE (field_id, balance_date)
);

-- Scientific Baseline Water Requirement Calculations (Prior to ML optimization)
CREATE TABLE IF NOT EXISTS public.water_requirement_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
    calculation_date DATE NOT NULL,
    net_irrigation_requirement_mm NUMERIC(6, 2) NOT NULL CHECK (net_irrigation_requirement_mm >= 0),
    application_efficiency_pct NUMERIC(4, 1) NOT NULL CHECK (application_efficiency_pct >= 20 AND application_efficiency_pct <= 100),
    gross_irrigation_requirement_mm NUMERIC(6, 2) NOT NULL CHECK (gross_irrigation_requirement_mm >= 0),
    gross_volume_litres NUMERIC(14, 2) NOT NULL CHECK (gross_volume_litres >= 0),
    gross_volume_m3 NUMERIC(10, 3) NOT NULL CHECK (gross_volume_m3 >= 0),
    leaching_requirement_mm NUMERIC(5, 2) DEFAULT 0 CHECK (leaching_requirement_mm >= 0),
    calculation_method TEXT NOT NULL DEFAULT 'FAO56_DAILY_DEPLETION',
    provenance TEXT NOT NULL DEFAULT 'CALCULATED',
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Crop Water Stress Estimates
CREATE TABLE IF NOT EXISTS public.water_stress_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
    estimated_at TIMESTAMPTZ NOT NULL,
    stress_index_value NUMERIC(4, 3) NOT NULL CHECK (stress_index_value >= 0 AND stress_index_value <= 1.0),
    stress_category TEXT NOT NULL CHECK (stress_category IN ('NONE', 'MILD', 'MODERATE', 'SEVERE', 'CRITICAL')),
    methodology TEXT NOT NULL DEFAULT 'ROOT_ZONE_DEPLETION_RATIO' CHECK (methodology IN ('ROOT_ZONE_DEPLETION_RATIO', 'CWSI_CANOPY_TEMPERATURE', 'NDVI_HISTORICAL_ANOMALY', 'MULTI_SIGNAL_FUSION')),
    provenance TEXT NOT NULL DEFAULT 'ESTIMATED',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);




/* ============================================================================ */
/* FILE: 012_ml.sql */
/* ============================================================================ */
-- Migration: 012_ml.sql
-- Purpose: Supervised ML feature store, reproducible feature snapshots, training datasets/targets, model registry, metrics, and predictions.
-- Domain: Domain 10 â€” Machine Learning

-- Feature Catalog & Definitions
CREATE TABLE IF NOT EXISTS public.feature_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_code TEXT NOT NULL UNIQUE,
    feature_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('WEATHER', 'SATELLITE', 'SOIL', 'CROP', 'WATER_BALANCE', 'ENERGY', 'HISTORICAL_TREND')),
    data_type TEXT NOT NULL CHECK (data_type IN ('FLOAT', 'INTEGER', 'BOOLEAN', 'CATEGORICAL')),
    unit TEXT,
    description TEXT,
    computation_expression TEXT,
    version_tag TEXT NOT NULL DEFAULT 'v1',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Immutable Point-in-Time Feature Snapshots
CREATE TABLE IF NOT EXISTS public.feature_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    crop_cycle_id UUID REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
    snapshot_at TIMESTAMPTZ NOT NULL,
    feature_values JSONB NOT NULL,
    data_completeness_ratio NUMERIC(4, 3) NOT NULL CHECK (data_completeness_ratio >= 0 AND data_completeness_ratio <= 1.0),
    provenance TEXT NOT NULL DEFAULT 'CALCULATED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Versioned Training Datasets
CREATE TABLE IF NOT EXISTS public.training_datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_name TEXT NOT NULL,
    version_tag TEXT NOT NULL UNIQUE,
    target_task TEXT NOT NULL CHECK (target_task IN ('WATER_REQUIREMENT_REGRESSION', 'IRRIGATION_NEED_CLASSIFICATION')),
    description TEXT,
    total_examples_count INTEGER NOT NULL DEFAULT 0 CHECK (total_examples_count >= 0),
    split_configuration JSONB NOT NULL DEFAULT '{"train": 0.7, "val": 0.15, "test": 0.15}'::jsonb,
    is_frozen BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Individual Training Example Rows
CREATE TABLE IF NOT EXISTS public.training_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_dataset_id UUID NOT NULL REFERENCES public.training_datasets(id) ON DELETE CASCADE,
    feature_snapshot_id UUID NOT NULL REFERENCES public.feature_snapshots(id) ON DELETE RESTRICT,
    dataset_split TEXT NOT NULL CHECK (dataset_split IN ('TRAIN', 'VALIDATION', 'TEST')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Supervised Training Targets (Ground Truth & Label Integrity)
CREATE TABLE IF NOT EXISTS public.training_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_example_id UUID NOT NULL REFERENCES public.training_examples(id) ON DELETE CASCADE,
    target_code TEXT NOT NULL, -- e.g. CROP_WATER_REQ_MM, IRRIGATION_TRIGGER_BINARY
    target_value_numeric NUMERIC(10, 3),
    target_value_class TEXT,
    target_unit TEXT,
    target_type TEXT NOT NULL CHECK (target_type IN ('OBSERVED', 'CALCULATED', 'REMOTE_SENSING_DERIVED', 'EXPERT_LABELLED', 'MODEL_DERIVED')),
    generation_methodology TEXT NOT NULL,
    target_timestamp TIMESTAMPTZ NOT NULL,
    provenance TEXT NOT NULL,
    is_ground_truth BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_target_ground_truth CHECK (NOT (is_ground_truth = true AND target_type = 'MODEL_DERIVED'))
);

-- Trained Model Versions Registry
CREATE TABLE IF NOT EXISTS public.model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL, -- e.g. MODEL_A_WATER_REGRESSION, MODEL_B_IRRIGATION_CLASSIFICATION
    task_type TEXT NOT NULL CHECK (task_type IN ('REGRESSION', 'BINARY_CLASSIFICATION', 'MULTI_CLASS_CLASSIFICATION')),
    version_tag TEXT NOT NULL,
    algorithm_family TEXT NOT NULL, -- e.g. LIGHTGBM, XGBOOST, RANDOM_FOREST, NEURAL_NET
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CANDIDATE', 'ACTIVE_PRODUCTION', 'ARCHIVED', 'REJECTED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_model_version UNIQUE (model_name, version_tag)
);

-- Model Training Executions
CREATE TABLE IF NOT EXISTS public.model_training_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_version_id UUID NOT NULL REFERENCES public.model_versions(id) ON DELETE RESTRICT,
    training_dataset_id UUID NOT NULL REFERENCES public.training_datasets(id) ON DELETE RESTRICT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
    hyperparameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_log TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Model Validation Metrics
CREATE TABLE IF NOT EXISTS public.model_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_run_id UUID NOT NULL REFERENCES public.model_training_runs(id) ON DELETE CASCADE,
    split_type TEXT NOT NULL CHECK (split_type IN ('TRAIN', 'VALIDATION', 'TEST')),
    metric_name TEXT NOT NULL, -- MAE, RMSE, R2, ACCURACY, PRECISION, RECALL, F1_SCORE, ROC_AUC
    metric_value NUMERIC(10, 5) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_run_split_metric UNIQUE (training_run_id, split_type, metric_name)
);

-- Serialized Model Artifacts in Object Storage
CREATE TABLE IF NOT EXISTS public.model_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_version_id UUID NOT NULL REFERENCES public.model_versions(id) ON DELETE CASCADE,
    artifact_type TEXT NOT NULL CHECK (artifact_type IN ('ONNX_MODEL', 'JOBLIB_SERIALIZED', 'TORCHSCRIPT', 'FEATURE_SCALER_TRANSFORMER', 'MODEL_CARD_MARKDOWN')),
    storage_bucket TEXT NOT NULL DEFAULT 'ml-artifacts',
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT CHECK (file_size_bytes > 0),
    checksum_sha256 TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Model Inference Predictions
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    model_version_id UUID NOT NULL REFERENCES public.model_versions(id) ON DELETE RESTRICT,
    feature_snapshot_id UUID NOT NULL REFERENCES public.feature_snapshots(id) ON DELETE RESTRICT,
    predicted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    target_task TEXT NOT NULL CHECK (target_task IN ('WATER_REQUIREMENT_REGRESSION', 'IRRIGATION_NEED_CLASSIFICATION')),
    predicted_numeric_value NUMERIC(10, 3),
    predicted_class_label TEXT,
    confidence_score NUMERIC(5, 4) CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1.0)),
    unit TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Prediction Explainability & SHAP Components
CREATE TABLE IF NOT EXISTS public.prediction_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID NOT NULL REFERENCES public.predictions(id) ON DELETE CASCADE,
    top_contributing_features JSONB NOT NULL,
    shap_values JSONB,
    explanation_summary_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);




/* ============================================================================ */
/* FILE: 013_optimization.sql */
/* ============================================================================ */
-- Migration: 013_optimization.sql
-- Purpose: Water and energy multi-objective optimization runs, operational constraints, and multi-zone irrigation schedules.
-- Domain: Domain 11 â€” Optimization & Scheduling

-- Multi-Objective Optimization Executions
CREATE TABLE IF NOT EXISTS public.optimization_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    prediction_id UUID REFERENCES public.predictions(id) ON DELETE SET NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    optimization_horizon_hours INTEGER NOT NULL DEFAULT 48 CHECK (optimization_horizon_hours > 0),
    primary_objective TEXT NOT NULL CHECK (primary_objective IN ('SOLAR_SELF_CONSUMPTION_MAX', 'GRID_COST_MIN', 'WATER_CONSERVATION', 'BALANCED_PARETO')),
    solver_name TEXT NOT NULL DEFAULT 'SCIPY_MIP_OPTIMIZER',
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('RUNNING', 'COMPLETED', 'INFEASIBLE', 'FAILED')),
    objective_score NUMERIC(10, 4),
    input_parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Operational & Hydraulic Constraints
CREATE TABLE IF NOT EXISTS public.optimization_constraints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    optimization_run_id UUID NOT NULL REFERENCES public.optimization_runs(id) ON DELETE CASCADE,
    constraint_type TEXT NOT NULL CHECK (constraint_type IN ('MAX_PUMP_RUNTIME_HOURS', 'PUMP_HYDRAULIC_CAPACITY', 'AVOID_PEAK_GRID_TARIFF', 'SOLAR_WINDOW_ALIGNMENT', 'RAIN_FORECAST_HOLD', 'SOIL_INFILTRATION_LIMIT')),
    is_hard_constraint BOOLEAN NOT NULL DEFAULT true,
    constraint_parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_satisfied BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Optimized Master Irrigation Schedules
CREATE TABLE IF NOT EXISTS public.irrigation_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    optimization_run_id UUID NOT NULL REFERENCES public.optimization_runs(id) ON DELETE RESTRICT,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    total_water_volume_litres NUMERIC(14, 2) NOT NULL CHECK (total_water_volume_litres >= 0),
    total_water_depth_mm NUMERIC(6, 2) NOT NULL CHECK (total_water_depth_mm >= 0),
    estimated_energy_kwh NUMERIC(8, 2) NOT NULL CHECK (estimated_energy_kwh >= 0),
    estimated_solar_energy_kwh NUMERIC(8, 2) NOT NULL DEFAULT 0 CHECK (estimated_solar_energy_kwh >= 0),
    estimated_grid_cost_inr NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (estimated_grid_cost_inr >= 0),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUPERSEDED', 'CANCELLED', 'EXECUTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_schedule_window CHECK (valid_to > valid_from)
);

-- Discrete Operational Items within Schedules (VFD/Pump/Zone windows)
CREATE TABLE IF NOT EXISTS public.irrigation_schedule_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    irrigation_schedule_id UUID NOT NULL REFERENCES public.irrigation_schedules(id) ON DELETE CASCADE,
    field_zone_id UUID REFERENCES public.field_zones(id) ON DELETE SET NULL,
    pump_id UUID REFERENCES public.pumps(id) ON DELETE SET NULL,
    planned_start_time TIMESTAMPTZ NOT NULL,
    planned_end_time TIMESTAMPTZ NOT NULL,
    planned_duration_minutes NUMERIC(6, 1) NOT NULL CHECK (planned_duration_minutes > 0),
    target_depth_mm NUMERIC(5, 2) NOT NULL CHECK (target_depth_mm >= 0),
    target_volume_litres NUMERIC(12, 2) NOT NULL CHECK (target_volume_litres >= 0),
    planned_energy_source TEXT NOT NULL CHECK (planned_energy_source IN ('SOLAR_PV', 'OFF_PEAK_GRID', 'STANDARD_GRID', 'BATTERY', 'HYBRID')),
    estimated_pump_load_kw NUMERIC(6, 2) CHECK (estimated_pump_load_kw >= 0),
    execution_status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (execution_status IN ('SCHEDULED', 'EXECUTING', 'COMPLETED', 'SKIPPED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_item_time_window CHECK (planned_end_time > planned_start_time)
);




/* ============================================================================ */
/* FILE: 014_recommendations.sql */
/* ============================================================================ */
-- Migration: 014_recommendations.sql
-- Purpose: Farmer-facing actionable recommendations, structured reasons, and farmer feedback loops.
-- Domain: Domain 11 â€” Recommendations & Farmer Interaction

-- Farmer Actionable Recommendations
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
    irrigation_schedule_id UUID REFERENCES public.irrigation_schedules(id) ON DELETE SET NULL,
    optimization_run_id UUID REFERENCES public.optimization_runs(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('SCHEDULE_IRRIGATION', 'IRRIGATE_IMMEDIATELY', 'HOLD_FOR_RAIN', 'SKIP_IRRIGATION', 'CHECK_SOIL_DRAINAGE', 'TARIFF_ALERT')),
    title TEXT NOT NULL,
    message_vernacular TEXT NOT NULL, -- Farmer-facing vernacular text (e.g. Hindi: "Paani kal subah 6 baje 45 minute ke liye chalayein")
    language_code TEXT NOT NULL DEFAULT 'hi',
    action_window_start TIMESTAMPTZ NOT NULL,
    action_window_end TIMESTAMPTZ NOT NULL,
    recommended_duration_minutes NUMERIC(6, 1) CHECK (recommended_duration_minutes IS NULL OR recommended_duration_minutes >= 0),
    recommended_volume_litres NUMERIC(12, 2) CHECK (recommended_volume_litres IS NULL OR recommended_volume_litres >= 0),
    estimated_solar_energy_pct NUMERIC(5, 2) CHECK (estimated_solar_energy_pct IS NULL OR (estimated_solar_energy_pct >= 0 AND estimated_solar_energy_pct <= 100)),
    estimated_cost_savings_inr NUMERIC(8, 2) CHECK (estimated_cost_savings_inr IS NULL OR estimated_cost_savings_inr >= 0),
    urgency_level TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (urgency_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 0.850 CHECK (confidence_score >= 0 AND confidence_score <= 1.0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_rec_window CHECK (action_window_end >= action_window_start)
);

-- Structured Explanatory Reasons for Recommendation
CREATE TABLE IF NOT EXISTS public.recommendation_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES public.recommendations(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('WEATHER_FORECAST', 'SOLAR_GENERATION_PEAK', 'SOIL_MOISTURE_DEFICIT', 'CROP_CRITICAL_STAGE', 'OFF_PEAK_TARIFF', 'HEAT_STRESS')),
    headline TEXT NOT NULL,
    detail_text TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Farmer Feedback & Compliance Logging
CREATE TABLE IF NOT EXISTS public.recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES public.recommendations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    action_taken TEXT NOT NULL CHECK (action_taken IN ('FOLLOWED_EXACTLY', 'FOLLOWED_PARTIALLY', 'DEFERRED', 'REJECTED_DISAGREED', 'REJECTED_INFRA_ISSUE')),
    feedback_rating INTEGER CHECK (feedback_rating IS NULL OR (feedback_rating >= 1 AND feedback_rating <= 5)),
    rejection_reason_code TEXT CHECK (rejection_reason_code IN ('PUMP_FAILURE', 'POWER_OUTAGE', 'UNEXPECTED_RAIN', 'CANAL_WATER_UNAVAILABLE', 'LABOUR_SHORTAGE', 'SOIL_STILL_WET', 'OTHER')),
    actual_irrigation_duration_minutes NUMERIC(6, 1),
    farmer_comments TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);




/* ============================================================================ */
/* FILE: 015_notifications.sql */
/* ============================================================================ */
-- Migration: 015_notifications.sql
-- Purpose: Multi-channel delivery, outbound notifications, and farmer vernacular preferences.
-- Domain: Domain 13 â€” Notifications & User Interaction

-- Notification Delivery Channels
CREATE TABLE IF NOT EXISTS public.notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE CHECK (code IN ('IN_APP', 'SMS', 'WHATSAPP', 'VOICE_IVR', 'EMAIL')),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Outbound Notifications Log
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE SET NULL,
    channel_id UUID NOT NULL REFERENCES public.notification_channels(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    message_content TEXT NOT NULL,
    delivery_status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (delivery_status IN ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED')),
    external_provider_message_id TEXT,
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Farmer Localization & Notification Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    preferred_language TEXT NOT NULL DEFAULT 'hi' CHECK (preferred_language IN ('hi', 'en', 'mr', 'te', 'pa', 'bn', 'ta', 'gu', 'kn')),
    preferred_channel_id UUID REFERENCES public.notification_channels(id) ON DELETE SET NULL,
    unit_system TEXT NOT NULL DEFAULT 'METRIC' CHECK (unit_system IN ('METRIC', 'CUSTOMARY')),
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '05:30:00',
    notify_irrigation_alerts BOOLEAN NOT NULL DEFAULT true,
    notify_solar_peak_opportunities BOOLEAN NOT NULL DEFAULT true,
    notify_weather_warnings BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);




/* ============================================================================ */
/* FILE: 016_data_pipeline.sql */
/* ============================================================================ */
-- Migration: 016_data_pipeline.sql
-- Purpose: Ingestion registry, automated jobs, raw payload records, data quality checks, and end-to-end lineage.
-- Domain: Domain 12 â€” Data Pipeline & Provenance

-- Master Registry of External and Internal Data Sources
CREATE TABLE IF NOT EXISTS public.data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    domain_category TEXT NOT NULL CHECK (domain_category IN ('WEATHER', 'SATELLITE', 'SOIL', 'ENERGY', 'MARKET', 'GOVERNMENT')),
    reliability_score NUMERIC(3, 2) DEFAULT 0.95 CHECK (reliability_score >= 0 AND reliability_score <= 1.0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Data Source Service Endpoints (Credentials KEPT OUT of database)
CREATE TABLE IF NOT EXISTS public.data_source_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source_id UUID NOT NULL REFERENCES public.data_sources(id) ON DELETE RESTRICT,
    endpoint_name TEXT NOT NULL,
    protocol TEXT NOT NULL DEFAULT 'REST_HTTPS' CHECK (protocol IN ('REST_HTTPS', 'GRAPHQL', 'S3_COG', 'FTP', 'MQTT_BROKER')),
    url_template TEXT NOT NULL,
    http_method TEXT NOT NULL DEFAULT 'GET',
    rate_limit_requests_per_minute INTEGER DEFAULT 60,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Automated Ingestion Job Definitions
CREATE TABLE IF NOT EXISTS public.ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source_id UUID NOT NULL REFERENCES public.data_sources(id) ON DELETE RESTRICT,
    job_name TEXT NOT NULL,
    target_domain TEXT NOT NULL CHECK (target_domain IN ('WEATHER_OBSERVATION', 'WEATHER_FORECAST', 'SATELLITE_SCENE', 'SOILGRIDS', 'SOLAR_FORECAST')),
    cron_schedule TEXT NOT NULL DEFAULT '0 */6 * * *',
    timeout_seconds INTEGER NOT NULL DEFAULT 300,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ingestion Execution Runs
CREATE TABLE IF NOT EXISTS public.ingestion_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingestion_job_id UUID NOT NULL REFERENCES public.ingestion_jobs(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'COMPLETED', 'PARTIALLY_COMPLETED', 'FAILED')),
    records_received INTEGER NOT NULL DEFAULT 0 CHECK (records_received >= 0),
    records_persisted INTEGER NOT NULL DEFAULT 0 CHECK (records_persisted >= 0),
    error_summary TEXT,
    http_status_code INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Raw Payload Staging Records (Immutable Archival with Hashes)
CREATE TABLE IF NOT EXISTS public.raw_data_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingestion_run_id UUID NOT NULL REFERENCES public.ingestion_runs(id) ON DELETE CASCADE,
    external_record_identifier TEXT,
    payload JSONB NOT NULL,
    checksum_sha256 TEXT NOT NULL,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ETL Normalization & Feature Processing Runs
CREATE TABLE IF NOT EXISTS public.processing_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingestion_run_id UUID REFERENCES public.ingestion_runs(id) ON DELETE SET NULL,
    pipeline_stage TEXT NOT NULL CHECK (pipeline_stage IN ('RAW_NORMALIZATION', 'GEOSPATIAL_INTERSECT', 'CANOPY_INDEX_CALCULATION', 'FEATURE_VECTOR_GENERATION')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED')),
    records_processed INTEGER NOT NULL DEFAULT 0,
    error_details TEXT
);

-- Data Quality Verification Checks
CREATE TABLE IF NOT EXISTS public.data_quality_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processing_run_id UUID REFERENCES public.processing_runs(id) ON DELETE CASCADE,
    target_table_name TEXT NOT NULL,
    check_name TEXT NOT NULL,
    check_type TEXT NOT NULL CHECK (check_type IN ('PHYSICAL_RANGE_BOUNDS', 'NULL_VALUATION', 'GEOMETRY_VALIDITY', 'TIME_SEQUENCE_MONOTONIC', 'DUPLICATE_RECORD')),
    passed BOOLEAN NOT NULL,
    flagged_records_count INTEGER NOT NULL DEFAULT 0,
    check_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- End-to-End Traceable Data Lineage Graph
CREATE TABLE IF NOT EXISTS public.data_lineage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_table TEXT NOT NULL,
    source_id UUID NOT NULL,
    derived_table TEXT NOT NULL,
    derived_id UUID NOT NULL,
    transformation_type TEXT NOT NULL CHECK (transformation_type IN ('INGESTION_PARSE', 'INTERPOLATION', 'SPATIAL_AGGREGATION', 'FAO56_CALCULATION', 'ML_FEATURE_EXTRACTION', 'ML_PREDICTION', 'SCHEDULE_OPTIMIZATION', 'RECOMMENDATION_SYNTHESIS')),
    processing_run_id UUID REFERENCES public.processing_runs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);




/* ============================================================================ */
/* FILE: 017_indexes.sql */
/* ============================================================================ */
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




/* ============================================================================ */
/* FILE: 018_functions.sql */
/* ============================================================================ */
-- Migration: 018_functions.sql
-- Purpose: Spatial geometry computations, automatic timestamps, and agronomic baseline helpers.
-- Domain: Database Functions

-- ============================================================================
-- 1. Automatic updated_at trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. Spatial Polygon Geodesic Area Calculation (Hectares)
-- Uses PostGIS geography casting to accurately compute ellipsoidal surface area
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_field_geodesic_area_hectares(geom GEOMETRY)
RETURNS NUMERIC AS $$
BEGIN
    IF geom IS NULL THEN
        RETURN NULL;
    END IF;
    -- 1 Hectare = 10,000 square meters
    RETURN ROUND((ST_Area(geom::geography) / 10000.0)::numeric, 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 3. Automatic Field Boundary Spatial Attributes Trigger Function
-- Automatically computes area in hectares and centroid from drawn polygon
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sync_field_spatial_attributes()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.boundary IS NOT NULL THEN
        -- Compute geodesic area in hectares
        NEW.area_hectares := public.calculate_field_geodesic_area_hectares(NEW.boundary);
        -- Compute geodesic perimeter in meters
        NEW.perimeter_meters := ROUND(ST_Perimeter(NEW.boundary::geography)::numeric, 2);
        -- Compute polygon centroid
        NEW.centroid := ST_Centroid(NEW.boundary);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. FAO-56 Hargreaves-Samani Reference ET0 Estimator Function
-- Fallback when full net radiation / wind / humidity data is incomplete
-- ET0 = 0.0023 * (Tmean + 17.8) * sqrt(Tmax - Tmin) * Ra
-- ============================================================================
CREATE OR REPLACE FUNCTION public.estimate_hargreaves_et0(
    t_mean_celsius NUMERIC,
    t_min_celsius NUMERIC,
    t_max_celsius NUMERIC,
    extraterrestrial_radiation_ra_mm NUMERIC
)
RETURNS NUMERIC AS $$
DECLARE
    temp_diff NUMERIC;
    calculated_et0 NUMERIC;
BEGIN
    IF t_mean_celsius IS NULL OR t_min_celsius IS NULL OR t_max_celsius IS NULL OR extraterrestrial_radiation_ra_mm IS NULL THEN
        RETURN NULL;
    END IF;

    temp_diff := t_max_celsius - t_min_celsius;
    IF temp_diff <= 0 THEN
        temp_diff := 0.1;
    END IF;

    calculated_et0 := 0.0023 * (t_mean_celsius + 17.8) * SQRT(temp_diff) * extraterrestrial_radiation_ra_mm;
    RETURN ROUND(GREATEST(0.0, calculated_et0)::numeric, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;




/* ============================================================================ */
/* FILE: 019_triggers.sql */
/* ============================================================================ */
-- Migration: 019_triggers.sql
-- Purpose: Spatial automation triggers and updated_at timestamp triggers.
-- Domain: Database Triggers

-- ============================================================================
-- 1. Spatial Boundary Auto-Computation Triggers
-- ============================================================================
DROP TRIGGER IF EXISTS trg_fields_spatial_sync ON public.fields;
CREATE TRIGGER trg_fields_spatial_sync
    BEFORE INSERT OR UPDATE OF boundary
    ON public.fields
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_field_spatial_attributes();

-- ============================================================================
-- 2. Timestamp (updated_at) Auto-Refresh Triggers
-- ============================================================================
DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_roles_updated_at ON public.roles;
CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_farms_updated_at ON public.farms;
CREATE TRIGGER trg_farms_updated_at
    BEFORE UPDATE ON public.farms
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_administrative_areas_updated_at ON public.administrative_areas;
CREATE TRIGGER trg_administrative_areas_updated_at
    BEFORE UPDATE ON public.administrative_areas
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_fields_updated_at ON public.fields;
CREATE TRIGGER trg_fields_updated_at
    BEFORE UPDATE ON public.fields
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_crops_updated_at ON public.crops;
CREATE TRIGGER trg_crops_updated_at
    BEFORE UPDATE ON public.crops
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_crop_varieties_updated_at ON public.crop_varieties;
CREATE TRIGGER trg_crop_varieties_updated_at
    BEFORE UPDATE ON public.crop_varieties
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_crop_cycles_updated_at ON public.crop_cycles;
CREATE TRIGGER trg_crop_cycles_updated_at
    BEFORE UPDATE ON public.crop_cycles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_irrigation_systems_updated_at ON public.irrigation_systems;
CREATE TRIGGER trg_irrigation_systems_updated_at
    BEFORE UPDATE ON public.irrigation_systems
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_energy_systems_updated_at ON public.energy_systems;
CREATE TRIGGER trg_energy_systems_updated_at
    BEFORE UPDATE ON public.energy_systems
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER trg_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_column();




/* ============================================================================ */
/* FILE: 020_rls.sql */
/* ============================================================================ */
-- Migration: 020_rls.sql
-- Purpose: Multi-tenant isolation and Row Level Security (RLS) policies.
-- Domain: Security & Access Control

-- ============================================================================
-- 1. Helper function to map Supabase auth.uid() to public.users(id)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS UUID AS $$
    SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- 2. Enable RLS on User Holdings & Operational Tables
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_stage_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Reference Tables: Enable RLS with Public Read
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_growth_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_definitions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. Reference Tables Read Policies (Public to authenticated & anon)
-- ============================================================================
CREATE POLICY "Public read for roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Public read for crops" ON public.crops FOR SELECT USING (true);
CREATE POLICY "Public read for crop_varieties" ON public.crop_varieties FOR SELECT USING (true);
CREATE POLICY "Public read for crop_growth_stages" ON public.crop_growth_stages FOR SELECT USING (true);
CREATE POLICY "Public read for crop_parameters" ON public.crop_parameters FOR SELECT USING (true);
CREATE POLICY "Public read for weather_sources" ON public.weather_sources FOR SELECT USING (true);
CREATE POLICY "Public read for satellite_sources" ON public.satellite_sources FOR SELECT USING (true);
CREATE POLICY "Public read for satellite_collections" ON public.satellite_collections FOR SELECT USING (true);
CREATE POLICY "Public read for soil_sources" ON public.soil_sources FOR SELECT USING (true);
CREATE POLICY "Public read for water_sources" ON public.water_sources FOR SELECT USING (true);
CREATE POLICY "Public read for irrigation_methods" ON public.irrigation_methods FOR SELECT USING (true);
CREATE POLICY "Public read for energy_sources" ON public.energy_sources FOR SELECT USING (true);
CREATE POLICY "Public read for notification_channels" ON public.notification_channels FOR SELECT USING (true);
CREATE POLICY "Public read for feature_definitions" ON public.feature_definitions FOR SELECT USING (true);

-- ============================================================================
-- 4. User Profile & Preferences Policies
-- ============================================================================
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth_id = auth.uid() OR id = public.current_app_user_id());

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth_id = auth.uid() OR id = public.current_app_user_id());

CREATE POLICY "Users can manage their preferences" ON public.user_preferences
    FOR ALL USING (user_id = public.current_app_user_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- ============================================================================
-- 5. Farm & Field Tenant Isolation Policies
-- ============================================================================
CREATE POLICY "Farmers can view own farms" ON public.farms
    FOR SELECT USING (user_id = public.current_app_user_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Farmers can insert own farms" ON public.farms
    FOR INSERT WITH CHECK (user_id = public.current_app_user_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Farmers can update own farms" ON public.farms
    FOR UPDATE USING (user_id = public.current_app_user_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Farmers can view own fields" ON public.fields
    FOR SELECT USING (farm_id IN (
        SELECT id FROM public.farms WHERE user_id = public.current_app_user_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    ));

CREATE POLICY "Farmers can manage own fields" ON public.fields
    FOR ALL USING (farm_id IN (
        SELECT id FROM public.farms WHERE user_id = public.current_app_user_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    ));

-- ============================================================================
-- 6. Recommendations & Feedback Isolation Policies
-- ============================================================================
CREATE POLICY "Farmers can view their field recommendations" ON public.recommendations
    FOR SELECT USING (field_id IN (
        SELECT f.id FROM public.fields f
        JOIN public.farms fm ON f.farm_id = fm.id
        WHERE fm.user_id = public.current_app_user_id() OR fm.user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    ));

CREATE POLICY "Farmers can update their recommendations" ON public.recommendations
    FOR UPDATE USING (field_id IN (
        SELECT f.id FROM public.fields f
        JOIN public.farms fm ON f.farm_id = fm.id
        WHERE fm.user_id = public.current_app_user_id() OR fm.user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    ));

CREATE POLICY "Farmers can submit recommendation feedback" ON public.recommendation_feedback
    FOR ALL USING (user_id = public.current_app_user_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Farmers can view their notifications" ON public.notifications
    FOR SELECT USING (user_id = public.current_app_user_id() OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));




/* ============================================================================ */
/* FILE: 021_seed_reference_data.sql */
/* ============================================================================ */
-- Migration: 021_seed_reference_data.sql
-- Purpose: Canonical reference data for agronomic taxonomies, FAO-56 stage parameters, irrigation methods, and energy types.
-- Domain: Reference Seed Data (NO FAKE TELEMETRY)

-- 1. Master System Roles
INSERT INTO public.roles (code, name, description) VALUES
('FARMER', 'Farmer / Cultivator', 'Primary agricultural landholder and irrigation decision maker'),
('AGRONOMIST', 'Agronomist / Extension Officer', 'Agricultural advisor providing crop and soil advisory'),
('ADMIN', 'System Administrator', 'Platform operator and infrastructure manager'),
('RESEARCHER', 'Agricultural Researcher / Data Scientist', 'ML engineer or researcher analyzing anonymized agronomic performance'),
('SYSTEM', 'System Service Account', 'Automated backend worker executing ingestion and optimization jobs')
ON CONFLICT (code) DO NOTHING;

-- 2. Master Water Sources
INSERT INTO public.water_sources (code, name, source_type, reliability_tier) VALUES
('BOREWELL_DEEP', 'Deep Aquifer Borewell', 'BOREWELL', 'HIGH'),
('OPEN_WELL', 'Dug Well / Open Well', 'OPEN_WELL', 'SEASONAL'),
('CANAL_GRAVITY', 'Irrigation Canal Gravity Feeder', 'CANAL', 'SEASONAL'),
('FARM_POND', 'On-Farm Rainwater Harvesting Pond', 'FARM_POND', 'SEASONAL'),
('RIVER_LIFT', 'River / Stream Lift Irrigation', 'RIVER', 'INTERMITTENT')
ON CONFLICT (code) DO NOTHING;

-- 3. Master Irrigation Methods with FAO standard efficiencies
INSERT INTO public.irrigation_methods (code, name, category, typical_application_efficiency_pct, wetting_fraction_fw, description) VALUES
('DRIP_SURFACE', 'Surface Drip Irrigation', 'MICRO_IRRIGATION', 90.0, 0.40, 'High-efficiency localized emitter tubing delivering water directly to root-zone'),
('MICRO_SPRINKLER', 'Micro Sprinkler System', 'MICRO_IRRIGATION', 85.0, 0.70, 'Low-pressure micro sprinklers with moderate canopy coverage'),
('PORTABLE_SPRINKLER', 'Overhead Portable Sprinkler', 'PRESSURIZED_OVERHEAD', 75.0, 1.00, 'Impact sprinkler nozzles pressurized via mainline pipeline'),
('FURROW_SURFACE', 'Furrow Irrigation', 'SURFACE_GRAVITY', 60.0, 0.80, 'Water conveyed through trenches between ridges'),
('FLOOD_BASIN', 'Check Basin / Flood Irrigation', 'SURFACE_GRAVITY', 50.0, 1.00, 'Traditional flood irrigation with high evaporative and conveyance loss')
ON CONFLICT (code) DO NOTHING;

-- 4. Master Energy Sources
INSERT INTO public.energy_sources (code, name, source_category, emission_factor_kg_co2_per_kwh, is_renewable) VALUES
('GRID_AGRICULTURAL', 'Utility Grid (Agricultural Feeder)', 'GRID_UTILITY', 0.8200, false),
('SOLAR_PV_OFFGRID', 'Off-Grid Solar PV Array', 'SOLAR_PHOTOVOLTAIC', 0.0000, true),
('SOLAR_PV_GRID_TIED', 'Grid-Interactive Solar PV Array', 'SOLAR_PHOTOVOLTAIC', 0.0000, true),
('BATTERY_BESS', 'Solar Battery Energy Storage System', 'BATTERY_STORAGE', 0.0500, true),
('DIESEL_GENSET', 'Diesel Engine / Genset', 'DIESEL_GENERATOR', 1.0500, false)
ON CONFLICT (code) DO NOTHING;

-- 5. Notification Channels
INSERT INTO public.notification_channels (code, name, description) VALUES
('IN_APP', 'In-App Dashboard Notification', 'Alert displayed directly within the web/mobile farmer interface'),
('WHATSAPP', 'WhatsApp Message', 'Vernacular notification sent via official WhatsApp Business API'),
('SMS', 'Direct SMS', 'Text message for basic feature-phone delivery'),
('VOICE_IVR', 'Automated Voice Call (IVR)', 'Automated voice call for low-literacy advisory delivery'),
('EMAIL', 'Email Report', 'Comprehensive seasonal summary or researcher audit export')
ON CONFLICT (code) DO NOTHING;

-- 6. Master Weather Data Sources
INSERT INTO public.weather_sources (code, name, provider_type, base_url, attribution) VALUES
('OPEN_METEO', 'Open-Meteo Weather API', 'API', 'https://api.open-meteo.com/v1', 'Weather data by Open-Meteo.com (CC BY 4.0)'),
('ERA5_LAND', 'ECMWF ERA5-Land Reanalysis', 'SATELLITE_REANALYSIS', 'https://cds.climate.copernicus.eu', 'Copernicus Climate Change Service'),
('IMD_AWS', 'India Meteorological Department (AWS)', 'GOVERNMENT_STATION', 'https://mausam.imd.gov.in', 'IMD Ministry of Earth Sciences, Govt of India')
ON CONFLICT (code) DO NOTHING;

-- 7. Master Satellite Constellations & Collections
INSERT INTO public.satellite_sources (code, name, operator, description) VALUES
('COPERNICUS_ESA', 'European Space Agency Copernicus', 'ESA', 'European Union Earth Observation Programme')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.satellite_collections (source_id, collection_code, name, spatial_resolution_meters, revisit_interval_days) VALUES
((SELECT id FROM public.satellite_sources WHERE code = 'COPERNICUS_ESA'), 'SENTINEL_2_L2A', 'Sentinel-2 MSI Level-2A Surface Reflectance', 10.0, 5.0)
ON CONFLICT (collection_code) DO NOTHING;

-- 8. Master Soil Sources
INSERT INTO public.soil_sources (code, name, source_type, attribution) VALUES
('SOILGRIDS_ISRIC', 'SoilGrids 250m Global Database', 'GLOBAL_DATABASE', 'ISRIC â€” World Soil Information (CC-BY 4.0)'),
('GOVT_SOIL_HEALTH_CARD', 'Soil Health Card Scheme', 'GOVERNMENT_SURVEY', 'Ministry of Agriculture and Farmers Welfare, Govt of India')
ON CONFLICT (code) DO NOTHING;

-- 9. Master Crops Catalog
INSERT INTO public.crops (code, name, botanical_name, crop_category, default_season, water_demand_category, typical_duration_days) VALUES
('WHEAT', 'Wheat', 'Triticum aestivum', 'CEREAL', 'RABI', 'MEDIUM', 125),
('RICE_PADDY', 'Rice (Paddy)', 'Oryza sativa', 'CEREAL', 'KHARIF', 'VERY_HIGH', 135),
('MAIZE', 'Maize (Corn)', 'Zea mays', 'CEREAL', 'ALL_SEASON', 'MEDIUM', 105),
('TOMATO', 'Tomato', 'Solanum lycopersicum', 'VEGETABLE', 'RABI', 'HIGH', 115),
('POTATO', 'Potato', 'Solanum tuberosum', 'VEGETABLE', 'RABI', 'MEDIUM', 95),
('COTTON', 'Cotton', 'Gossypium hirsutum', 'CASH_CROP', 'KHARIF', 'HIGH', 160)
ON CONFLICT (code) DO NOTHING;

-- 10. FAO-56 Crop Growth Stages & Parameters
-- Wheat
INSERT INTO public.crop_growth_stages (crop_id, stage_code, stage_name, stage_order, typical_duration_days, kc_coefficient, rooting_depth_meters, depletion_fraction_p) VALUES
((SELECT id FROM public.crops WHERE code = 'WHEAT'), 'INITIAL', 'Initial / Germination', 1, 20, 0.40, 0.30, 0.55),
((SELECT id FROM public.crops WHERE code = 'WHEAT'), 'DEVELOPMENT', 'Crop Development / Tillering', 2, 30, 0.80, 0.60, 0.55),
((SELECT id FROM public.crops WHERE code = 'WHEAT'), 'MID_SEASON', 'Mid-Season / Flowering & Heading', 3, 45, 1.15, 1.10, 0.55),
((SELECT id FROM public.crops WHERE code = 'WHEAT'), 'LATE_SEASON', 'Late Season / Ripening', 4, 30, 0.40, 1.10, 0.80)
ON CONFLICT (crop_id, stage_code) DO NOTHING;

-- Rice (Paddy)
INSERT INTO public.crop_growth_stages (crop_id, stage_code, stage_name, stage_order, typical_duration_days, kc_coefficient, rooting_depth_meters, depletion_fraction_p) VALUES
((SELECT id FROM public.crops WHERE code = 'RICE_PADDY'), 'INITIAL', 'Initial / Nursery & Transplanting', 1, 25, 1.05, 0.20, 0.20),
((SELECT id FROM public.crops WHERE code = 'RICE_PADDY'), 'DEVELOPMENT', 'Vegetative / Tillering', 2, 35, 1.10, 0.40, 0.20),
((SELECT id FROM public.crops WHERE code = 'RICE_PADDY'), 'MID_SEASON', 'Reproductive / Panicle & Flowering', 3, 50, 1.20, 0.60, 0.20),
((SELECT id FROM public.crops WHERE code = 'RICE_PADDY'), 'LATE_SEASON', 'Maturation / Grain Filling', 4, 25, 0.90, 0.60, 0.40)
ON CONFLICT (crop_id, stage_code) DO NOTHING;

-- Tomato
INSERT INTO public.crop_growth_stages (crop_id, stage_code, stage_name, stage_order, typical_duration_days, kc_coefficient, rooting_depth_meters, depletion_fraction_p) VALUES
((SELECT id FROM public.crops WHERE code = 'TOMATO'), 'INITIAL', 'Initial / Establishment', 1, 25, 0.60, 0.25, 0.40),
((SELECT id FROM public.crops WHERE code = 'TOMATO'), 'DEVELOPMENT', 'Vegetative Growth', 2, 35, 0.85, 0.50, 0.40),
((SELECT id FROM public.crops WHERE code = 'TOMATO'), 'MID_SEASON', 'Flowering & Fruit Set', 3, 40, 1.15, 0.80, 0.40),
((SELECT id FROM public.crops WHERE code = 'TOMATO'), 'LATE_SEASON', 'Late Season / Harvesting & Ripening', 4, 20, 0.80, 0.80, 0.50)
ON CONFLICT (crop_id, stage_code) DO NOTHING;

-- FAO-56 Base Parameters for Wheat and Rice
INSERT INTO public.crop_parameters (crop_id, version_tag, kc_initial, kc_mid, kc_end, min_root_depth_meters, max_root_depth_meters, critical_depletion_fraction_p, yield_response_factor_ky, max_height_meters) VALUES
((SELECT id FROM public.crops WHERE code = 'WHEAT'), 'FAO-56-DEFAULT', 0.40, 1.15, 0.40, 0.30, 1.20, 0.55, 1.05, 1.00),
((SELECT id FROM public.crops WHERE code = 'RICE_PADDY'), 'FAO-56-DEFAULT', 1.05, 1.20, 0.90, 0.20, 0.60, 0.20, 1.10, 1.00),
((SELECT id FROM public.crops WHERE code = 'MAIZE'), 'FAO-56-DEFAULT', 0.30, 1.20, 0.50, 0.30, 1.20, 0.55, 1.25, 2.00),
((SELECT id FROM public.crops WHERE code = 'TOMATO'), 'FAO-56-DEFAULT', 0.60, 1.15, 0.80, 0.25, 1.00, 0.40, 1.05, 0.80)
ON CONFLICT (crop_id, version_tag) DO NOTHING;




/* ============================================================================ */
/* FILE: 022_views.sql */
/* ============================================================================ */
-- Migration: 022_views.sql
-- Purpose: Read-heavy high performance operational views for farmer dashboard and mobile application.
-- Domain: Database Views

-- ============================================================================
-- 1. Field Operational Summary View (v_current_field_state)
-- Synthesizes field boundary, active crop cycle, latest stage, and water condition
-- ============================================================================
CREATE OR REPLACE VIEW public.v_current_field_state AS
SELECT
    f.id AS field_id,
    f.farm_id,
    fm.user_id,
    f.name AS field_name,
    f.area_hectares,
    f.polygon_source,
    cc.id AS active_crop_cycle_id,
    c.name AS crop_name,
    c.code AS crop_code,
    cv.name AS crop_variety_name,
    cc.season,
    cc.sowing_date,
    cgs.stage_code AS current_growth_stage,
    cgs.kc_coefficient AS current_kc,
    fs.current_ndvi,
    fs.current_soil_moisture_vwc,
    fs.water_stress_index_cwsi,
    fs.data_completeness_score,
    fs.overall_confidence_score,
    fs.evaluated_at AS state_evaluated_at
FROM public.fields f
JOIN public.farms fm ON f.farm_id = fm.id
LEFT JOIN public.crop_cycles cc ON f.id = cc.field_id AND cc.status = 'ACTIVE'
LEFT JOIN public.crops c ON cc.crop_id = c.id
LEFT JOIN public.crop_varieties cv ON cc.crop_variety_id = cv.id
LEFT JOIN LATERAL (
    SELECT growth_stage_id FROM public.crop_stage_observations
    WHERE crop_cycle_id = cc.id
    ORDER BY observed_at DESC LIMIT 1
) latest_stage ON true
LEFT JOIN public.crop_growth_stages cgs ON latest_stage.growth_stage_id = cgs.id
LEFT JOIN LATERAL (
    SELECT * FROM public.farm_states
    WHERE field_id = f.id
    ORDER BY evaluated_at DESC LIMIT 1
) fs ON true
WHERE f.is_active = true;

-- ============================================================================
-- 2. Latest Weather per Field (v_latest_weather)
-- ============================================================================
CREATE OR REPLACE VIEW public.v_latest_weather AS
SELECT DISTINCT ON (f.id)
    f.id AS field_id,
    f.name AS field_name,
    wo.observed_at,
    wo.temperature_celsius,
    wo.relative_humidity_percentage,
    wo.precipitation_mm,
    wo.solar_radiation_mj_m2,
    wo.wind_speed_m_s,
    wo.reference_et0_mm,
    wo.provenance,
    wo.data_quality_flag,
    ws.name AS weather_source_name
FROM public.fields f
JOIN public.weather_observations wo ON f.id = wo.field_id
JOIN public.weather_sources ws ON wo.weather_source_id = ws.id
ORDER BY f.id, wo.observed_at DESC;

-- ============================================================================
-- 3. Latest Satellite Canopy Indices per Field (v_latest_satellite_indices)
-- ============================================================================
CREATE OR REPLACE VIEW public.v_latest_satellite_indices AS
SELECT DISTINCT ON (f.id)
    f.id AS field_id,
    f.name AS field_name,
    so.acquired_at,
    so.cloud_cover_field_percentage,
    vi.mean_value AS latest_ndvi,
    vi.confidence_score AS ndvi_confidence,
    sc.collection_code AS satellite_product
FROM public.fields f
JOIN public.satellite_observations so ON f.id = so.field_id
JOIN public.vegetation_indices vi ON so.id = vi.satellite_observation_id AND vi.index_code = 'NDVI'
JOIN public.satellite_scenes ss ON so.scene_id = ss.id
JOIN public.satellite_collections sc ON ss.collection_id = sc.id
WHERE so.data_quality_status = 'VALID'
ORDER BY f.id, so.acquired_at DESC;

-- ============================================================================
-- 4. Active Actionable Farmer Recommendations (v_active_irrigation_recommendations)
-- ============================================================================
CREATE OR REPLACE VIEW public.v_active_irrigation_recommendations AS
SELECT
    r.id AS recommendation_id,
    r.field_id,
    f.name AS field_name,
    fm.id AS farm_id,
    fm.name AS farm_name,
    fm.user_id,
    r.action_type,
    r.title,
    r.message_vernacular,
    r.language_code,
    r.action_window_start,
    r.action_window_end,
    r.recommended_duration_minutes,
    r.recommended_volume_litres,
    r.estimated_solar_energy_pct,
    r.estimated_cost_savings_inr,
    r.urgency_level,
    r.status,
    r.confidence_score,
    r.created_at,
    p.name AS pump_name,
    p.rated_power_hp AS pump_hp
FROM public.recommendations r
JOIN public.fields f ON r.field_id = f.id
JOIN public.farms fm ON f.farm_id = fm.id
LEFT JOIN public.irrigation_schedules sch ON r.irrigation_schedule_id = sch.id
LEFT JOIN LATERAL (
    SELECT pump_id FROM public.irrigation_schedule_items
    WHERE irrigation_schedule_id = sch.id
    LIMIT 1
) item ON true
LEFT JOIN public.pumps p ON item.pump_id = p.id
WHERE r.status IN ('PENDING', 'VIEWED', 'ACCEPTED')
ORDER BY r.urgency_level DESC, r.action_window_start ASC;





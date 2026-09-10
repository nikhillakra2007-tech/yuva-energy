-- Migration: 006_weather.sql
-- Purpose: Meteorological sources, spatial stations/grids, historical observations, and forecast runs.
-- Domain: Domain 4 — Weather

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

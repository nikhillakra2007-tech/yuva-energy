-- Migration: 008_soil.sql
-- Purpose: Soil authorities, physical/hydraulic observations, laboratory samples, and dynamic soil moisture.
-- Domain: Domain 6 — Soil Intelligence

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

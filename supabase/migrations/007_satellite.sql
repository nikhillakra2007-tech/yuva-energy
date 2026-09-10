-- Migration: 007_satellite.sql
-- Purpose: Satellite constellations, collections, scene granules, processing pipelines, canopy indices, and assets.
-- Domain: Domain 5 — Satellite & Earth Observation

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

-- Migration: 004_geography.sql
-- Purpose: Spatial entities for administrative boundaries, fields, and field zones.
-- Domain: Domain 2 — Geography & Spatial Data

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

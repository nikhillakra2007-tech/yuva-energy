-- Migration: 003_farms.sql
-- Purpose: Farms entity representing agricultural landholdings owned or managed by users.
-- Domain: Domain 1 — User & Access / Geographic Anchor

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

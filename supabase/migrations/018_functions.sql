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

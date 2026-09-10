-- Migration: 001_extensions.sql
-- Purpose: Enable core PostgreSQL and PostGIS extensions for spatial and cryptographic operations.
-- Domain: System Foundation

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Note on PostGIS:
-- postgis provides geometry, geography, ST_Area, ST_Centroid, ST_Intersects, ST_Contains, etc.

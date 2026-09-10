-- Migration: 016_data_pipeline.sql
-- Purpose: Ingestion registry, automated jobs, raw payload records, data quality checks, and end-to-end lineage.
-- Domain: Domain 12 — Data Pipeline & Provenance

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

-- Migration: 012_ml.sql
-- Purpose: Supervised ML feature store, reproducible feature snapshots, training datasets/targets, model registry, metrics, and predictions.
-- Domain: Domain 10 — Machine Learning

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

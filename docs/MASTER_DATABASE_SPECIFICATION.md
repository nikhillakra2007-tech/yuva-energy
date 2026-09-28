# MASTER DATABASE ARCHITECTURE SPECIFICATION
## AI Farm Energy & Water Optimizer
### Schneider Electric Yuva Yodha Energy Tech Hackathon — Agriculture Challenge

---

## Executive Summary
This document serves as the formal architectural reference and operational manual for the **AI Farm Energy & Water Optimizer** master PostgreSQL / PostGIS / Supabase database. 

The architecture encompasses **77 entities** across **13 core domains**, built specifically for precision agriculture, solar-aligned irrigation scheduling, remote sensing analytics (Sentinel-2 NDVI/EVI), dynamic soil water balance modeling (FAO-56), and supervised machine learning.

---

## Section A: Master Table Catalog (77 Entities Across 13 Domains)

| Table Name | Domain | Purpose | Priority |
| :--- | :--- | :--- | :---: |
| `users` | 1. User & Access | Application user identities linked to Supabase Auth | P0 |
| `farms` | 1. User & Access | Agricultural landholdings owned or managed by farmers | P0 |
| `administrative_areas` | 2. Geography | Geospatial administrative hierarchy (Country to Village) | P1 |
| `fields` | 2. Geography | Primary management boundary storing PostGIS polygon geometry | P0 |
| `field_zones` | 2. Geography | Precision management sub-divisions within fields | P1 |
| `crops` | 3. Crop & Agronomy | Master taxonomy of cultivable crops | P0 |
| `crop_varieties` | 3. Crop & Agronomy | Specific agronomic cultivars with distinct durations & yields | P1 |
| `crop_cycles` | 3. Crop & Agronomy | Seasonal field plantings tracking sowing and harvest dates | P0 |
| `crop_growth_stages` | 3. Crop & Agronomy | Master phenological stages with baseline FAO-56 Kc values | P0 |
| `crop_stage_observations` | 3. Crop & Agronomy | Dynamic stage transitions observed, reported, or inferred | P0 |
| `crop_parameters` | 3. Crop & Agronomy | Calibrated FAO-56 agronomic parameters (Kc, Zr, p, Ky) | P0 |
| `crop_production_statistics` | 3. Crop & Agronomy | Regional historical crop statistics and yield benchmarks | P2 |
| `weather_sources` | 4. Weather | Registry of meteorological APIs and reanalysis datasets | P0 |
| `weather_locations` | 4. Weather | Gridded or station spatial reference points | P1 |
| `weather_observations` | 4. Weather | Historical hourly/daily surface observations (temp, rain, solar, wind) | P0 |
| `weather_forecast_runs` | 4. Weather | Numerical weather prediction model run tracking | P0 |
| `weather_forecasts` | 4. Weather | Discretized future meteorological forecasts for scheduling | P0 |
| `satellite_sources` | 5. Satellite | Constellation operators (ESA, USGS, Planet) | P0 |
| `satellite_collections` | 5. Satellite | Earth observation products (Sentinel-2 L2A BOA, etc.) | P0 |
| `satellite_scenes` | 5. Satellite | Acquisition tiles with footprint geometries and cloud coverage | P0 |
| `satellite_processing_runs` | 5. Satellite | Automated cloud masking and zonal statistics extraction runs | P1 |
| `satellite_observations` | 5. Satellite | Field-level discrete remote sensing observations | P0 |
| `vegetation_indices` | 5. Satellite | Canopy spectral indices (NDVI, EVI, NDRE, NDWI) | P0 |
| `satellite_assets` | 5. Satellite | References to GeoTIFF and preview assets in Supabase Storage | P1 |
| `soil_sources` | 6. Soil | Soil data providers (SoilGrids, Soil Health Cards, Labs) | P0 |
| `soil_observations` | 6. Soil | Field physical and hydraulic properties (sand, clay, bulk density) | P0 |
| `soil_samples` | 6. Soil | Physical lab test reports and nutrient assays | P1 |
| `soil_moisture_observations` | 6. Soil | Time-series volumetric water content with strict provenance | P0 |
| `water_sources` | 7. Water & Irrigation | Origins of irrigation water (Borewell, Canal, Pond, etc.) | P0 |
| `irrigation_methods` | 7. Water & Irrigation | Delivery mechanisms with standard application efficiencies | P0 |
| `irrigation_systems` | 7. Water & Irrigation | Farm/field irrigation physical configurations | P0 |
| `irrigation_zones` | 7. Water & Irrigation | Hydraulic valve sectors connected to field zones | P1 |
| `pumps` | 7. Water & Irrigation | Motor specifications (kW, HP, flow rate, efficiency, head) | P0 |
| `irrigation_events` | 7. Water & Irrigation | Executed irrigation events with duration and applied depth | P0 |
| `water_measurements` | 7. Water & Irrigation | Measured flowmeter logs or runtime calculations | P0 |
| `energy_sources` | 8. Energy & Power | Energy supply types (Utility Grid, Solar PV, Battery, Diesel) | P0 |
| `energy_systems` | 8. Energy & Power | Farm electrical topology, solar capacity, and feeder schedule | P0 |
| `energy_assets` | 8. Energy & Power | Solar panels, solar inverters, VFDs, smart bidirectional meters | P0 |
| `energy_observations` | 8. Energy & Power | Power (kW), energy (kWh), voltage, and power factor telemetry | P0 |
| `energy_tariffs` | 8. Energy & Power | Time-of-Use (TOU) tariffs and agricultural subsidies | P0 |
| `energy_forecasts` | 8. Energy & Power | Day-ahead solar generation forecasts and feeder schedules | P0 |
| `farm_states` | 9. Ag Intelligence | Point-in-time synthesis of canopy, soil, and water stress | P0 |
| `evapotranspiration_calculations`| 9. Ag Intelligence | FAO-56 Penman-Monteith reference ETo and crop ETc | P0 |
| `soil_water_balance` | 9. Ag Intelligence | Daily root-zone depletion accounting (RAW, TAW, losses) | P0 |
| `water_requirement_calculations` | 9. Ag Intelligence | Scientific baseline water demand prior to ML optimization | P0 |
| `water_stress_estimates` | 9. Ag Intelligence | CWSI and root-zone water stress index assessments | P0 |
| `feature_definitions` | 10. Machine Learning | Catalog of engineered features with data types and formulas | P0 |
| `feature_snapshots` | 10. Machine Learning | Immutable point-in-time feature vectors for inference | P0 |
| `training_datasets` | 10. Machine Learning | Versioned training sets for supervised ML | P1 |
| `training_examples` | 10. Machine Learning | Individual tabular training instances | P1 |
| `training_targets` | 10. Machine Learning | Supervised target labels with strict provenance | P1 |
| `model_versions` | 10. Machine Learning | Model registry (Model A: Regression, Model B: Classification) | P0 |
| `model_training_runs` | 10. Machine Learning | Training execution records with hyperparameter tracking | P1 |
| `model_metrics` | 10. Machine Learning | Model performance scores (MAE, RMSE, R², F1-Score) | P1 |
| `model_artifacts` | 10. Machine Learning | Serialized model files (ONNX, joblib) in Supabase Storage | P1 |
| `predictions` | 10. Machine Learning | Model inference predictions with confidence intervals | P0 |
| `prediction_explanations` | 10. Machine Learning | Explainability factors and SHAP values | P1 |
| `optimization_runs` | 11. Optimization | Multi-objective optimization solver executions | P0 |
| `optimization_constraints` | 11. Optimization | Hydraulic, energy, and meteorological constraints | P0 |
| `irrigation_schedules` | 11. Optimization | Master optimized irrigation plans | P0 |
| `irrigation_schedule_items` | 11. Optimization | Discrete operational windows for pump and valve automation | P0 |
| `recommendations` | 11. Recommendations | Farmer-facing actionable recommendations | P0 |
| `recommendation_reasons` | 11. Recommendations | Human-readable rationale components | P0 |
| `recommendation_feedback` | 11. Recommendations | Farmer compliance, deferrals, and operational feedback | P0 |
| `data_sources` | 12. Data Pipeline | Master registry of external data providers | P0 |
| `data_source_endpoints` | 12. Data Pipeline | REST / COG API endpoint definitions (credentials excluded) | P1 |
| `ingestion_jobs` | 12. Data Pipeline | Automated cron schedule configurations | P1 |
| `ingestion_runs` | 12. Data Pipeline | Ingestion job execution tracking and record tallies | P1 |
| `raw_data_records` | 12. Data Pipeline | Immutable raw JSON payload store with SHA-256 hashes | P1 |
| `processing_runs` | 12. Data Pipeline | Data transformation and normalization executions | P1 |
| `data_quality_checks` | 12. Data Pipeline | Automated quality tests (range bounds, missing, corrupt) | P1 |
| `data_lineage` | 12. Data Pipeline | Traceable lineage graph connecting raw data to advisory | P1 |
| `notification_channels` | 13. Notifications | Delivery channels (In-App, WhatsApp, SMS, IVR, Email) | P0 |
| `notifications` | 13. Notifications | Outbound alert log with delivery state tracking | P0 |
| `user_preferences` | 13. Notifications | Farmer language selection, units, and quiet hour schedules | P0 |
| `farmer_feedback` | 13. Farmer Interaction | General app/field feedback with submitting-user and field ownership checks | P0 |
| `audit_logs` | 12. Audit & Provenance | Server-written action metadata, excluding credentials and personal-data snapshots | P0 |

---

## Section B: PostGIS Spatial Architecture
- **Fields (`fields.boundary`):** Stored as `GEOMETRY(Polygon, 4326)`. Spatial index: `idx_fields_boundary` (GiST).
- **Field Centroid (`fields.centroid`):** Automatically computed by trigger `trg_fields_spatial_sync` using `ST_Centroid(boundary)`.
- **Field Area (`fields.area_hectares`):** Automatically calculated via ellipsoidal geography casting: `ROUND((ST_Area(boundary::geography) / 10000.0)::numeric, 4)`.
- **Farm Pin (`farms.location`):** Stored as `GEOMETRY(Point, 4326)`. Spatial index: `idx_farms_location` (GiST).
- **Satellite Footprints (`satellite_scenes.footprint`):** Stored as `GEOMETRY(Polygon, 4326)` for instant spatial intersection queries with farmer fields.

---

## Section C: Machine Learning & Agricultural Science Workflow
This section describes the planned application. It is not implemented by the table definitions. See IMPLEMENTATION_STATUS.md for verified progress.
1. **Physical Baseline (FAO-56):**
   - Reference Evapotranspiration: $ET_0$ calculated via Penman-Monteith (or Hargreaves-Samani fallback).
   - Crop Evapotranspiration: $ET_c = K_c \times ET_0 \times K_s$.
   - Root-Zone Soil Water Balance: $D_t = D_{t-1} - P_t - I_t + ET_{c,t} + DP_t$.
2. **Feature Engineering:** Features extracted into `feature_snapshots` (e.g. `ndvi_mean`, `soil_moisture_vwc`, `forecast_rain_48h`, `degree_days_accumulated`).
3. **Supervised ML Models:**
   - **Model A (Regression):** Predicts calibrated water requirement (mm).
   - **Model B (Classification):** Predicts categorical irrigation urgency (`IRRIGATE_NOW`, `DELAY_24H`, `HOLD_FOR_RAIN`).
4. **Multi-Objective Optimizer:**
   - Considers: Water need + Soil infiltration rate + Pump flow rate + Solar PV generation forecast + Grid TOU tariff window.
   - Solves for: Minimum energy cost + Maximum solar self-consumption.
5. **Farmer Recommendation:**
   - Vernacular output: *"Paani kal subah 6 baje 45 minute ke liye chalayein. Solar urja uplabdh rahegi."*

---

## Section D: Row Level Security (RLS) & Multi-Tenant Protection
- Forward migration `20260928131232_reconcile_entities_and_tenant_security.sql` reconciles the final approved 77 names. Historical migrations still create the retired role tables before the forward migration removes them. Nonempty memberships or custom roles stop the migration; original role reference definitions are archived in audit_logs.
- All 77 application tables enable RLS. Anonymous clients receive no application table/view grants. Signed-in farmers access holdings through ownership predicates; catalogs are readable by authenticated clients. Pipeline and training internals remain server-only.
- Core client writes cover farms, fields, zones, crop cycles, preferences and feedback. Profile updates are limited to selected display/contact columns. Irrigation/energy setup and derived outputs are currently read-only for clients; future backend endpoints must enforce ownership when writing them.
- The four dashboard views use security_invoker. The identity helper uses caller permissions, not SECURITY DEFINER. Service-role execution is reserved for trusted future backend workers; no worker is implemented yet.
- Local PostgreSQL/PostGIS tests verify the core two-farmer flow. Actual Supabase Auth/JWT/PostgREST validation and the remaining audit backlog are still pending; see DATABASE_VERIFICATION.md.

## Domain relationship constraints

The forward domain-integrity migration adds crop_id to crop_stage_observations (derived from its cycle), and field_id/farm_id to irrigation_schedule_items (derived from its schedule). Composite FKs validate their parents and prevent later parent reassignment from invalidating the relationship. Existing mismatched data aborts the transaction rather than being silently repaired. These are relational identifiers, not inferred measurements. Training targets must hold exactly one numeric/class value, and an example/target-code pair is unique; snapshots cannot appear twice in the same dataset's splits. See DATABASE_VERIFICATION.md for tested scope and remaining constraints.

============================================================
YUVA ENERGY — MASTER IMPLEMENTATION PROMPT
============================================================

PROJECT:
AI Farm Energy & Water Optimizer

REPOSITORY:
https://github.com/nikhillakra2007-tech/yuva-energy

BRANCH:
main

CHALLENGE:
Schneider Electric Yuva Yodha 2026
Agriculture — Energy, Water & Productivity

============================================================
MISSION
============================================================

Continue the project from its CURRENT REAL REPOSITORY STATE.

Do NOT assume the project is empty.

Do NOT assume the project is complete.

The repository currently contains a substantial database foundation and
the Stop-and-Save persistence protocol, but the actual application,
backend, ingestion pipelines, ML, optimization, and frontend are still
to be implemented.

Your responsibility is to transform the existing foundation into a
REAL, WORKING, END-TO-END AGRICULTURAL INTELLIGENCE SYSTEM.

The target system is:

FARMER
  ↓
FARM
  ↓
FIELD POLYGON
  ↓
CROP
  ↓
REAL WEATHER
  ↓
REAL SATELLITE DATA
  ↓
SOIL DATA
  ↓
AGRICULTURAL WATER BALANCE
  ↓
FEATURE ENGINEERING
  ↓
SUPERVISED ML
  ↓
IRRIGATION NEED
  ↓
ENERGY + WATER OPTIMIZATION
  ↓
IRRIGATION SCHEDULE
  ↓
FARMER RECOMMENDATION

============================================================
CURRENT VERIFIED REPOSITORY STATE
============================================================

Before doing anything else, inspect the current repository.

The repository currently contains:

- docs/
- supabase/migrations/
- AGENTS.md
- .gitignore

There are currently 3 commits on main.

The database foundation contains:
- 22 numbered migrations
- 77 CREATE TABLE declarations
- apply_all.sql
- PostgreSQL/PostGIS architecture
- agricultural intelligence schema
- ML schema
- optimization schema
- recommendation schema
- data ingestion schema
- RLS/functions/triggers/views/indexes/reference data

The repository also contains:

docs/STOP_AND_SAVE_PROTOCOL.md

and

docs/PROGRESS_REPORT.md

Read those FIRST.

AGENTS.md is mandatory instruction.

Do not bypass or weaken the Stop-and-Save Protocol.

============================================================
FIRST ACTION — FULL AUDIT
============================================================

DO NOT START IMPLEMENTATION IMMEDIATELY.

First perform a complete repository audit.

Inspect:

- Git history
- all docs
- every migration
- apply_all.sql
- functions
- triggers
- indexes
- views
- RLS
- seed/reference data
- current documentation
- .gitignore
- AGENTS.md
- Stop-and-Save protocol
- progress report

Determine:

1. What is genuinely implemented?
2. What is only schema?
3. What is only documentation?
4. What has been tested?
5. What has NOT been tested?
6. What external sources are only registered but not integrated?
7. What dependencies exist?
8. What schema inconsistencies exist?
9. What application components are missing?

Create/update:

docs/IMPLEMENTATION_AUDIT.md

Do not claim something is complete merely because its database table exists.

============================================================
MANDATORY 77-ENTITY RECONCILIATION
============================================================

The FINAL APPROVED architecture is exactly 77 entities.

The intended final entities are:

users
farms
fields
field_zones
administrative_areas
crops
crop_varieties
crop_cycles
crop_growth_stages
crop_stage_observations
crop_parameters
crop_production_statistics
weather_sources
weather_locations
weather_observations
weather_forecast_runs
weather_forecasts
satellite_sources
satellite_collections
satellite_scenes
satellite_processing_runs
satellite_observations
vegetation_indices
satellite_assets
soil_sources
soil_observations
soil_samples
soil_moisture_observations
water_sources
irrigation_methods
irrigation_systems
irrigation_zones
pumps
irrigation_events
water_measurements
energy_sources
energy_systems
energy_assets
energy_observations
energy_tariffs
energy_forecasts
farm_states
evapotranspiration_calculations
soil_water_balance
water_requirement_calculations
water_stress_estimates
feature_definitions
feature_snapshots
training_datasets
training_examples
training_targets
model_versions
model_training_runs
model_metrics
model_artifacts
predictions
prediction_explanations
optimization_runs
optimization_constraints
irrigation_schedules
irrigation_schedule_items
recommendations
recommendation_reasons
recommendation_feedback
data_sources
data_source_endpoints
ingestion_jobs
ingestion_runs
raw_data_records
processing_runs
data_quality_checks
data_lineage
notification_channels
notifications
user_preferences
farmer_feedback
audit_logs

The following were intentionally removed from the final architecture:

roles
user_roles
user_profiles
farm_members
locations
field_boundary_versions
geospatial_sources
weather_derived_features
satellite_band_observations
satellite_quality_metrics
soil_property_layers
solar_generation_observations
model_features
data_quality_results
notification_deliveries
system_events
error_logs
api_request_logs

IMPORTANT:

The CURRENT repository still contains roles and user_roles.

The current database specification also still lists them.

DO NOT blindly delete them.

Perform a dependency analysis first.

Determine:
- whether they are required
- whether RLS depends on them
- whether functions depend on them
- whether seeds depend on them
- whether views depend on them
- whether any application code will depend on them

Then safely reconcile the schema with the final approved architecture.

Document the decision.

============================================================
DATABASE VERIFICATION
============================================================

Before building application logic, verify the database.

Test:

- migrations
- clean migration sequence
- foreign keys
- constraints
- indexes
- PostGIS
- geometry
- triggers
- functions
- views
- RLS
- reference data

Verify:

farm
 ↓
field
 ↓
field boundary
 ↓
field zone
 ↓
crop cycle

Verify:

fields.boundary
= Polygon geometry

Verify:

farms.location
= Point geometry

Verify:
- field area calculation
- centroid calculation
- spatial indexes
- spatial queries

Test RLS using multiple hypothetical/authenticated users.

Ensure farmer A cannot access farmer B's holdings.

Do not declare database completion until runtime verification has occurred.

============================================================
PROJECT STRUCTURE
============================================================

Create a clean application architecture.

Target:

backend/
frontend/
ml/
scripts/
tests/
docs/
supabase/

Backend:

backend/
  app/
    main.py
    api/
    core/
    db/
    models/
    schemas/
    services/
    ingestion/
    agriculture/
    ml/
    optimization/
    recommendations/
    workers/
    tests/

Frontend:

frontend/
  app/
  components/
  hooks/
  lib/
  services/
  types/
  public/

ML:

ml/
  features/
  training/
  inference/
  evaluation/
  artifacts/

Do not create meaningless abstractions.

============================================================
REAL DATA — NO FAKE PRODUCTION DATA
============================================================

This project must use real data sources wherever practical.

Never fabricate production observations.

Never fabricate:
- weather
- satellite
- soil
- irrigation
- energy
- ML metrics
- savings
- field measurements

If a value is calculated/modelled/simulated, explicitly label it.

============================================================
WEATHER PIPELINE
============================================================

Implement a real weather ingestion service.

Support:

Historical:
- temperature
- precipitation
- humidity
- wind
- radiation where available
- ET0 where available

Forecast:
- temperature
- precipitation
- humidity
- wind
- solar/radiation where available
- ET0 where available

Keep:

observations

separate from:

forecast runs
forecast values

Use the existing tables:

weather_sources
weather_locations
weather_observations
weather_forecast_runs
weather_forecasts

Use the data pipeline tables:

data_sources
data_source_endpoints
ingestion_jobs
ingestion_runs
raw_data_records
processing_runs
data_quality_checks
data_lineage

Implement:
- retry
- timeout
- validation
- deduplication
- error logging
- provenance

============================================================
SATELLITE PIPELINE
============================================================

Implement Sentinel-2/Copernicus-compatible ingestion.

Required initial capability:

FIELD POLYGON
→ find usable observations
→ cloud filtering
→ retrieve/process imagery/statistics
→ calculate NDVI
→ calculate EVI
→ store field-level observation

NDVI:

(NIR - RED) / (NIR + RED)

Sentinel-2:

NIR = B8
RED = B4

EVI:

2.5 × (NIR - RED) /
(NIR + 6RED - 7.5BLUE + 1)

Sentinel-2:

NIR = B8
RED = B4
BLUE = B2

Do not claim continuous real-time satellite monitoring.

Use:
latest usable satellite observation

Store:
- source
- collection
- scene
- acquisition time
- cloud information
- processing run
- field observation
- vegetation indices
- asset references

Large imagery must not be stored as giant relational database rows.

============================================================
SOIL PIPELINE
============================================================

Implement a real soil data integration where practical.

Support:

- texture
- sand
- clay
- bulk density
- organic carbon
- pH
- hydraulic properties where available
- soil moisture where available

Also support farmer-provided soil values.

External source failure must not destroy the whole application.

Use provenance.

============================================================
CROP DATA
============================================================

Populate legitimate crop reference data.

Support:

- crops
- varieties
- crop cycles
- growth stages
- crop parameters

Document source/assumption for agronomic constants.

============================================================
AGRICULTURAL SCIENCE ENGINE
============================================================

Implement the scientific baseline BEFORE ML.

Core:

ETc = Kc × ET0 × Ks

Implement root-zone water balance.

Track:

- rainfall
- irrigation
- ETc
- depletion
- soil storage
- infiltration
- losses
- crop stage
- stress

Use:

farm_states
evapotranspiration_calculations
soil_water_balance
water_requirement_calculations
water_stress_estimates

Every value must carry provenance.

Possible statuses:

USER_PROVIDED
EXTERNAL_RETRIEVED
OBSERVED
MEASURED
CALCULATED
ESTIMATED
PREDICTED
OPTIMIZED
INFERRED

Never silently mix these.

============================================================
FEATURE ENGINEERING
============================================================

Create reproducible features.

Examples:

ndvi_mean
evi_mean
soil_moisture
temperature
rainfall
forecast_rain_48h
ET0
ETc
crop_stage
water_deficit
degree_days
solar_availability
energy_cost
pump_efficiency
irrigation_efficiency

Store:

feature_definitions
feature_snapshots

Every feature must be traceable to source data.

============================================================
SUPERVISED ML
============================================================

Build two models.

MODEL A:

Water Requirement Regression

Output:
water requirement in mm

MODEL B:

Irrigation Need Classification

Output:

IRRIGATE_NOW
DELAY_24H
HOLD_FOR_RAIN

or another explicitly documented scheme.

Inputs may include:

- weather
- ET0
- crop
- crop stage
- soil
- NDVI
- EVI
- soil moisture
- water balance
- rainfall forecast
- stress

Start with interpretable tabular models.

Possible:
- Random Forest
- Gradient Boosting
- HistGradientBoosting

Do not add deep learning merely to look impressive.

============================================================
CRITICAL ML LABEL RULE
============================================================

Supervised learning requires targets.

If actual measured irrigation labels are unavailable:

derive scientifically defensible targets from the agricultural baseline.

Mark them:

CALCULATED
or
MODEL_DERIVED

Do NOT call them:

GROUND TRUTH

Where measured field data becomes available, use it for validation.

Track:

training_datasets
training_examples
training_targets
model_versions
model_training_runs
model_metrics
model_artifacts
predictions
prediction_explanations

Never fabricate metrics.

Calculate real:

MAE
RMSE
R²
precision
recall
F1
confusion matrix
ROC-AUC where appropriate

============================================================
MODEL EXPLANATIONS
============================================================

For predictions, store understandable explanations.

Example:

Water requirement:
4.2 mm

Factors:
- high ET0
- low rainfall forecast
- crop stage demand
- estimated soil deficit

Clearly distinguish:
correlation
from
causation.

============================================================
ENERGY + WATER OPTIMIZATION
============================================================

This is a central differentiator.

Do not merely predict:

"crop needs water."

Determine:

WHEN should irrigation occur?

Consider:

- water requirement
- available water
- irrigation efficiency
- pump flow
- pump power
- solar forecast
- energy availability
- tariff
- irrigation windows
- operational constraints

Objectives:

MINIMIZE ENERGY COST

while:

SATISFYING WATER REQUIREMENT

and where applicable:

MAXIMIZING SOLAR SELF-CONSUMPTION

Use:

optimization_runs
optimization_constraints
irrigation_schedules
irrigation_schedule_items

The optimizer must respect constraints.

============================================================
RECOMMENDATION ENGINE
============================================================

Convert technical output into farmer action.

Example:

Technical:

water requirement = 4.2 mm
irrigation = required
rain forecast = low
solar availability = high at 06:00
energy cost = favorable

Farmer:

"Paani kal subah 6 baje dena hai."

Reason:

"Kal baarish ki sambhavna kam hai aur mitti mein paani ki kami hai."

Recommendations must be traceable.

Use:

recommendations
recommendation_reasons
recommendation_feedback

============================================================
BACKEND
============================================================

Build FastAPI backend.

Responsibilities:

- auth
- farms
- fields
- crop cycles
- geometry
- weather
- satellite
- soil
- agriculture
- features
- ML
- optimization
- recommendations
- audit

Use environment variables.

Never commit secrets.

Provide proper validation and error handling.

============================================================
FRONTEND
============================================================

Build the farmer-facing application.

Use React/Next.js + TypeScript.

Core screens:

1. Login
2. Farm onboarding
3. Location
4. Field map
5. Field polygon drawing
6. Crop setup
7. Dashboard
8. Water status
9. Crop health
10. Weather
11. Energy
12. Irrigation recommendation
13. History
14. Explanation
15. Settings

============================================================
LOCATION UX
============================================================

Do NOT require manual latitude/longitude entry.

Support:

1. browser geolocation
2. search
3. map navigation
4. polygon drawing

Location centers the map.

Polygon defines the field.

Do not treat one GPS point as the entire field.

============================================================
FARMER UX
============================================================

Farmer should not continuously enter technical data.

Initial setup:

location
→ field
→ crop
→ basic soil/system information

After setup:

weather = automatic
satellite = automatic
analysis = automatic
recommendation = automatic

Design for:
- low bandwidth
- mobile
- limited literacy
- vernacular communication

============================================================
NOTIFICATIONS
============================================================

Implement in-app notifications first.

Prepare architecture for:

WhatsApp
SMS
IVR

Do not claim those integrations exist unless actually implemented.

============================================================
API DOCUMENTATION
============================================================

Create:

docs/API_MAP.md

Document:

- endpoint
- method
- input
- output
- authentication
- database tables
- external services
- error behavior

============================================================
TESTING
============================================================

Build tests for:

DATABASE:
- migrations
- constraints
- RLS
- PostGIS

BACKEND:
- APIs
- services
- validation
- errors

DATA:
- weather
- satellite
- soil
- provenance
- deduplication

AGRICULTURE:
- ET0
- ETc
- water balance
- irrigation need

ML:
- feature generation
- training
- inference
- metrics

OPTIMIZATION:
- constraints
- schedule
- water requirement
- energy objective

FRONTEND:
- onboarding
- map
- field polygon
- dashboard
- recommendation

============================================================
END-TO-END TEST
============================================================

A complete test must eventually demonstrate:

USER
→ LOGIN
→ CREATE FARM
→ SELECT LOCATION
→ DRAW FIELD
→ SELECT CROP
→ GET REAL WEATHER
→ GET REAL SATELLITE OBSERVATION
→ GET SOIL DATA
→ CALCULATE WATER BALANCE
→ GENERATE FEATURES
→ RUN ML
→ DETERMINE IRRIGATION NEED
→ OPTIMIZE ENERGY/WATER
→ CREATE SCHEDULE
→ CREATE RECOMMENDATION
→ DISPLAY TO FARMER

============================================================
SECURITY
============================================================

Never commit:

API keys
passwords
tokens
service-role keys
credentials

Use:

.env
.env.example

Verify:

- authentication
- authorization
- RLS
- input validation
- SQL safety
- API safety

============================================================
OBSERVABILITY
============================================================

Use existing architecture for:

audit_logs
ingestion_runs
processing_runs
data_quality_checks
data_lineage

Major pipeline failures must be diagnosable.

============================================================
DOCUMENTATION
============================================================

Maintain:

docs/IMPLEMENTATION_AUDIT.md
docs/IMPLEMENTATION_STATUS.md
docs/PROGRESS_REPORT.md
docs/ARCHITECTURE_FILE_MAP.md
docs/DATA_SOURCES.md
docs/API_MAP.md
docs/ML_PIPELINE.md
docs/DEPLOYMENT.md

Update them continuously.

============================================================
FILE-BY-FILE ARCHITECTURE MAP
============================================================

Create:

docs/ARCHITECTURE_FILE_MAP.md

For EVERY important file:

PATH
PURPOSE
IMPORTS
CALLERS
CALLEES
DATABASE TABLES
EXTERNAL APIS
INPUTS
OUTPUTS
FAILURE MODES
DEPENDENCIES
WHAT BREAKS IF REMOVED

Also document:

DATABASE
↓
BACKEND
↓
DATA INGESTION
↓
AGRICULTURAL ENGINE
↓
FEATURE ENGINEERING
↓
ML
↓
OPTIMIZATION
↓
RECOMMENDATIONS
↓
FRONTEND

============================================================
SCHNEIDER ALIGNMENT
============================================================

The system should clearly demonstrate:

AGRICULTURAL INTELLIGENCE
+
WATER OPTIMIZATION
+
ENERGY OPTIMIZATION
+
AUTOMATION READINESS

The architecture should be capable of future connection to:

- smart pumps
- solar
- energy systems
- irrigation controllers
- IoT telemetry
- industrial automation

Do not falsely claim Schneider hardware integration.

Do not invent Schneider APIs.

============================================================
REAL VS MODELLED DATA
============================================================

Every important value must clearly indicate whether it is:

REAL / OBSERVED
MEASURED
EXTERNAL
USER PROVIDED
CALCULATED
ESTIMATED
PREDICTED
OPTIMIZED
SIMULATED

Never disguise calculated or simulated data as real telemetry.

============================================================
DEPLOYMENT
============================================================

Eventually provide:

- backend deployment instructions
- frontend deployment instructions
- Supabase configuration
- environment configuration
- data-source credentials setup
- migration deployment
- production checklist

============================================================
FINAL DEMO
============================================================

The final application must allow a judge to understand:

WHAT IS THE FIELD?
WHAT IS THE CROP?
WHAT IS THE CURRENT WATER STATE?
WHAT DOES WEATHER SAY?
WHAT DOES SATELLITE SAY?
WHAT DOES THE AGRICULTURAL MODEL SAY?
DOES THE CROP NEED IRRIGATION?
WHEN SHOULD THE PUMP RUN?
WHY THAT TIME?
WHAT ENERGY SOURCE IS PREFERRED?
WHAT WATER SAVINGS ARE CALCULATED?
WHAT ENERGY BENEFIT IS CALCULATED?

All claims must be traceable.

============================================================
NO FAKE COMPLETION
============================================================

Never say:

"implemented"

just because:

- a table exists
- a file exists
- an endpoint exists
- a placeholder exists
- a function compiles

Completion means:

IMPLEMENTED
+
TESTED
+
VERIFIED

If something is partial:

STATUS: PARTIALLY COMPLETE

Document exactly what remains.

============================================================
STOP-AND-SAVE PROTOCOL
============================================================

The repository already contains:

docs/STOP_AND_SAVE_PROTOCOL.md

and

AGENTS.md

READ THEM.

They are mandatory.

The exact sequence is:

SAVE FILES
→ VERIFY WORKING TREE
→ UPDATE ZIP
→ UPDATE PROGRESS REPORT
→ GIT ADD
→ GIT COMMIT
→ GIT PUSH
→ VERIFY REMOTE
→ CONTINUE

Trigger this whenever:

- usage is getting low
- task cannot be completed
- external dependency blocks progress
- meaningful unit is complete
- user asks to stop
- uncertainty exists about remaining session capacity

If usage is low:

DO NOT START ONE MORE FEATURE.

SAVE EVERYTHING.

============================================================
ZIP BACKUP
============================================================

Keep ZIP backups OUTSIDE the repository.

Use:

../backups/

Never put the ZIP inside the project repository.

Never recursively include the ZIP itself.

Keep the previous verified backup until the new backup is verified.

After writing PROGRESS_REPORT.md:

refresh the ZIP again so the report is included.

Never commit ZIP archives.

============================================================
GITHUB PERSISTENCE
============================================================

After every meaningful implementation unit:

commit

and

push

to main unless the project explicitly establishes another branch workflow.

Then verify:

local HEAD
=
remote main

Never claim remote persistence without verification.

Never force-push to hide divergence.

============================================================
INTERRUPTED TASK
============================================================

If a feature cannot be completed:

DO NOT DELETE IT.

Preserve the useful partial implementation.

Write:

STATUS: PARTIALLY COMPLETE

Document:

- what works
- what doesn't
- blocker
- files
- commands attempted
- tests
- exact next step

Then:

ZIP
→ COMMIT
→ PUSH
→ VERIFY

============================================================
DEVELOPMENT ORDER
============================================================

Follow this order unless the audit proves a dependency requires another order:

PHASE 0
Repository audit

PHASE 1
Database reconciliation + runtime verification

PHASE 2
Project/backend foundation

PHASE 3
Weather ingestion

PHASE 4
Satellite ingestion

PHASE 5
Soil/crop data

PHASE 6
Agricultural calculations

PHASE 7
Feature engineering

PHASE 8
ML training/inference

PHASE 9
Energy + water optimization

PHASE 10
Recommendation engine

PHASE 11
FastAPI integration

PHASE 12
Frontend

PHASE 13
End-to-end integration

PHASE 14
Testing

PHASE 15
Deployment

PHASE 16
Hackathon demo hardening

============================================================
DO NOT REBUILD THE DATABASE JUST BECAUSE IT EXISTS
============================================================

The current database is a major completed foundation.

Preserve good work.

Only modify it when:

- audit identifies a real inconsistency
- runtime verification identifies a defect
- application requirements require a documented change
- final architecture reconciliation requires it

============================================================
FINAL SUCCESS CONDITION
============================================================

The project is complete when a real user can go:

LOGIN
→ FARM
→ FIELD
→ CROP
→ REAL WEATHER
→ REAL SATELLITE
→ SOIL
→ WATER BALANCE
→ ML
→ IRRIGATION DECISION
→ ENERGY OPTIMIZATION
→ IRRIGATION SCHEDULE
→ FARMER RECOMMENDATION

through the actual application.

The project must be:

REAL
TRACEABLE
TESTED
REPRODUCIBLE
ENERGY-AWARE
WATER-AWARE
AGRICULTURE-AWARE
SCHNEIDER-RELEVANT
AND DEMONSTRABLE.

============================================================
START NOW
============================================================

FIRST:

1. Read AGENTS.md.
2. Read docs/STOP_AND_SAVE_PROTOCOL.md.
3. Read docs/PROGRESS_REPORT.md.
4. Inspect the entire current repository.
5. Produce/update docs/IMPLEMENTATION_AUDIT.md.
6. Reconcile the 77-entity architecture.
7. Verify the database before building application code.
8. Then proceed phase-by-phase.
9. Save and push after every meaningful unit.
10. Never leave valuable work only in the current session.
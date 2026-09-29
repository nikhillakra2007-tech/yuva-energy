# 🌱 YUVA ENERGY — Autonomous Agricultural Intelligence & Solar Irrigation Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite_8-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_18_+_PostGIS_3.6-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![FAO-56](https://img.shields.io/badge/Agronomy-FAO--56_Penman--Monteith-10B981)](https://www.fao.org/3/x0490e/x0490e00.htm)
[![Docker](https://img.shields.io/badge/Deployment-Docker_+_Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-Proprietary-amber)](#)

> **Yuva Energy** is a full-stack precision agriculture and renewable irrigation intelligence platform. It fuses real-time microclimate observations, pedotransfer soil hydraulics, and satellite canopy indices with deterministic **FAO-56 Penman-Monteith** evapotranspiration physics to synchronize solar-powered irrigation pumps—decoupling agricultural water pumping from grid electricity tariffs and diesel generators while preserving freshwater aquifers.

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph INGESTION["1. Ingestion Pipelines & Observability"]
        direction TB
        OM["Open-Meteo REST API<br/>(Temperature, Humidity, Wind, Radiation, ET₀)"]
        SG["ISRIC SoilGrids 250m<br/>(Sand, Silt, Clay, Bulk Density, SOC)"]
        S2["Copernicus Sentinel-2<br/>(Cloud Filtering, NDVI, EVI, NDRE)"]
        ORCH["Pipeline Orchestrator<br/>(SHA-256 Raw Archiving, Deduplication & Auditing)"]
        OM --> ORCH
        SG --> ORCH
        S2 --> ORCH
    end

    subgraph DATABASE["2. Persistence & Multi-Tenant Security (PostgreSQL 18 + PostGIS 3.6)"]
        direction TB
        ENT77["77 Approved Relational Entities & Spatial Geometries"]
        RLS["PostgreSQL Row-Level Security (RLS)<br/>(Tenant claim: request.jwt.claim.sub)"]
        TRIG["Cross-Asset & Event Integrity Triggers"]
        ORCH --> ENT77
        ENT77 --- RLS
        ENT77 --- TRIG
    end

    subgraph ENGINE["3. Agricultural & Solar Intelligence Engine"]
        direction TB
        PM["FAO-56 Penman-Monteith<br/>Net Radiation Rn, Vapor Deficit, Psychrometric Constant"]
        WB["Root Zone Water Balance Mass Model<br/>USDA-SCS Effective Rain, TAW, RAW, Depletion Dr, Ks"]
        SOLAR["Solar Photovoltaic Generation & Tariff Optimizer<br/>Synchronized Daytime Peak Pumping (10:30 AM - 3:45 PM)"]
        TRACE["Complete Traceability Chain Engine<br/>Input ➔ Calculation ➔ Assumption ➔ Output ➔ Confidence ➔ Limitations"]
        PM --> WB
        WB --> SOLAR
        SOLAR --> TRACE
    end

    subgraph API["4. FastAPI Modular Application Layer"]
        direction TB
        JWT["NIST PBKDF2 Auth & JWT Verification"]
        ROUTERS["10 Domain Routers (/api/v1)<br/>Health, Auth, Farms, Fields, Crops, Weather, Soil, Satellite, Ingestion, Recs"]
        JWT --> ROUTERS
    end

    subgraph FRONTEND["5. High-Aesthetics Modular Frontend (React 19 + Vite)"]
        direction TB
        NAV["sections/navigation/ (Navbar, Live Pulse, Field Selector, EN/HI Toggle)"]
        HERO["sections/hero/ (HeroRibbon, Microclimate Telemetry, Solar Window)"]
        MAP["sections/geospatial/ (Leaflet Polygon Boundary & Sentinel-2 NDVI Overlay)"]
        DIAG["sections/water-balance/ & sections/solar-energy/ (Depletion Bar, CWSI, Grid/Diesel ROI)"]
        RECS["sections/recommendations/ (Traceable Advisories, Web Speech Audio, Feedback)"]
        MODALS["sections/modals/ (AuthModal, FieldModal)"]
        FOOTER["sections/footer/ (Footer)"]
    end

    ENT77 <--> ROUTERS
    ROUTERS <--> ENGINE
    ROUTERS <--> FRONTEND
```

---

## ⚡ Mathematical & Physical Foundation

### 1. Reference Evapotranspiration ($ET_0$) — FAO-56 Penman-Monteith
The platform models grass reference evapotranspiration deterministically without empirical approximations:

$$ET_0 = \frac{0.408 \Delta (R_n - G) + \gamma \frac{900}{T + 273} u_2 (e_s - e_a)}{\Delta + \gamma (1 + 0.34 u_2)}$$

- $\Delta$: Slope of saturation vapor pressure curve ($kPa / ^\circ C$)
- $R_n$: Net radiation at the crop surface ($MJ / m^2 \cdot day$)
- $G$: Soil heat flux density ($MJ / m^2 \cdot day \approx 0$ daily)
- $T$: Mean daily air temperature at 2 m height ($^\circ C$)
- $u_2$: Wind speed at 2 m height ($m / s$)
- $e_s - e_a$: Vapor pressure deficit of the air ($kPa$)
- $\gamma$: Psychrometric constant scaled by atmospheric elevation pressure ($kPa / ^\circ C$)

### 2. Pedotransfer Hydraulics & Soil Moisture Boundaries
Raw soil texture components ($Sand\%, Clay\%$) from ISRIC SoilGrids 250m are transformed into physical water retention constants via Saxton-Rawls pedotransfer models:
- **Field Capacity ($\theta_{FC}$)**: Water content held at $-33\ kPa$ suction.
- **Wilting Point ($\theta_{WP}$)**: Lower extraction boundary at $-1500\ kPa$ suction.
- **Available Water Capacity ($AWC$)**: $\theta_{FC} - \theta_{WP}$.
- **Total Available Water ($TAW$)**: $1000 \cdot (\theta_{FC} - \theta_{WP}) \cdot Z_r$ ($mm$), where $Z_r$ is crop rooting depth.
- **Readily Available Water ($RAW$)**: $p \cdot TAW$ ($mm$), where $p$ is the depletion fraction without water stress.

### 3. Root Zone Water Balance & Stress Index ($CWSI$)
The daily depletion $D_{r,i}$ mass balance accounts for USDA-SCS effective precipitation ($P_{eff}$), capillary rise, and adjusted crop evapotranspiration ($ET_{c,adj}$):

$$D_{r,i} = D_{r,i-1} - P_{eff,i} - I_i + ET_{c,adj,i}$$

$$K_s = \begin{cases} 1.0 & \text{if } D_r \le RAW \\ \frac{TAW - D_r}{(1 - p) TAW} & \text{if } D_r > RAW \end{cases}$$

$$CWSI = 1 - \frac{ET_{c,adj}}{ET_c} = 1 - K_s$$

---

## 🗂️ Clean Modular Project Structure

```text
YUVA-ENERGY/
├── backend/
│   ├── app/
│   │   ├── agronomy/          # FAO-56 Penman-Monteith, water balance, intelligence service
│   │   ├── ingestion/         # Open-Meteo, SoilGrids, Sentinel-2 providers & orchestrator
│   │   ├── models/            # Pydantic domain models matching schema constraints
│   │   ├── repositories/      # Clean PostgreSQL data access layer
│   │   ├── routers/           # 10 REST API domains (health, auth, farms, ingestion, recs)
│   │   ├── services/          # Multi-tenant business logic
│   │   ├── config.py          # Environment settings
│   │   ├── database.py        # Connection manager with RLS session context
│   │   ├── dependencies.py    # FastAPI dependency injection & tenant security
│   │   ├── main.py            # API entrypoint with OpenAPI schemas
│   │   └── security.py        # NIST PBKDF2-HMAC-SHA256 & JWT issuance
│   ├── tests/                 # 15 automated integration and unit test suites
│   ├── Dockerfile             # Multi-stage Python 3.12-slim production container
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── sections/          # Modular component sections (1-2 files per section)
│   │   │   ├── navigation/    # Navbar.jsx
│   │   │   ├── hero/          # HeroRibbon.jsx
│   │   │   ├── geospatial/    # FieldMap.jsx (Leaflet + NDVI)
│   │   │   ├── water-balance/ # WaterBalanceCard.jsx (FAO-56 Depletion & CWSI)
│   │   │   ├── solar-energy/  # SolarEnergyCard.jsx (PV Output & ROI)
│   │   │   ├── recommendations/ # RecommendationsFeed.jsx & FeedbackModal.jsx
│   │   │   ├── modals/        # AuthModal.jsx & FieldModal.jsx
│   │   │   └── footer/        # Footer.jsx
│   │   ├── services/api.js    # Resilient API client with error handling
│   │   ├── App.jsx            # Master UI coordinator & auto-seeding bootstrapper
│   │   └── index.css          # Design system tokens, glassmorphism, Google Fonts
│   ├── Dockerfile             # Multi-stage Node 20 build + Nginx SPA reverse proxy
│   └── vite.config.js         # Vite configuration with 0.0.0.0 host and API proxy
├── supabase/migrations/       # 25 verified PostgreSQL & PostGIS migrations
├── scripts/                   # Migration bundler & database verification guards
├── docs/                      # API_MAP.md, PROGRESS_REPORT.md, IMPLEMENTATION_STATUS.md
├── docker-compose.yml         # Full-stack PostGIS + Backend + Frontend orchestration
└── .env.example               # Documented environment variables template
```

---

## 🚀 Quickstart & Local Operation

### Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL 16+ with PostGIS extension

### 1. Start the FastAPI Backend
```bash
# Set up Python virtual environment
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

# Launch FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Start the React Frontend
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Open **[http://localhost:5173/](http://localhost:5173/)** in your browser. The application will automatically authenticate a demo farmer session and initialize an interactive plot in Karnal, Haryana.

### 3. Run with Docker Compose
```bash
# Spin up PostGIS, Backend, and Nginx Frontend in one command
docker-compose up --build
```
- Frontend: `http://localhost:80`
- Backend API Docs: `http://localhost:8000/api/v1/docs`

---

## 🧪 Comprehensive Verification & Test Suite

All 15 test suites pass with a 100% pass rate:

```bash
python -m pytest backend/tests -v
```

```text
backend/tests/test_agronomy.py::test_fao56_penman_monteith_physics PASSED [  6%]
backend/tests/test_agronomy.py::test_effective_rainfall_usda_scs PASSED  [ 13%]
backend/tests/test_agronomy.py::test_root_zone_water_balance_stress_transitions PASSED [ 20%]
backend/tests/test_agronomy.py::test_end_to_end_intelligence_engine_evaluation PASSED [ 26%]
backend/tests/test_backend_api.py::test_health_endpoints PASSED          [ 33%]
backend/tests/test_backend_api.py::test_auth_workflow PASSED             [ 40%]
backend/tests/test_backend_api.py::test_farms_and_fields_flow PASSED     [ 46%]
backend/tests/test_backend_api.py::test_crop_catalog_and_cycle PASSED    [ 53%]
backend/tests/test_backend_api.py::test_multi_tenant_isolation PASSED    [ 60%]
backend/tests/test_backend_api.py::test_dashboard_analytics PASSED       [ 66%]
backend/tests/test_e2e_flow.py::test_full_farmer_end_to_end_journey PASSED [ 73%]
backend/tests/test_ingestion.py::test_weather_provider_normalization PASSED [ 80%]
backend/tests/test_ingestion.py::test_soil_provider_pedotransfer PASSED  [ 86%]
backend/tests/test_ingestion.py::test_satellite_provider_indices PASSED  [ 93%]
backend/tests/test_ingestion.py::test_end_to_end_pipeline_sync_and_deduplication PASSED [100%]
====================== 15 passed in 53s =======================
```

---

## 🔗 Live Links & Access Points

| Resource | Local URL | Description |
|:---|:---|:---|
| **Web Dashboard** | **[http://localhost:5173/](http://localhost:5173/)** | Real-time agro-solar intelligence platform |
| **API Documentation** | **[http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)** | Interactive Swagger / OpenAPI explorer |
| **Health Check** | **[http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)** | System health and PostGIS connectivity |
| **GitHub Repository** | **[https://github.com/nikhillakra2007-tech/yuva-energy](https://github.com/nikhillakra2007-tech/yuva-energy)** | Source repository and release branch |

---

## 🔒 Security & Data Governance
- **Zero Fabricated Telemetry**: Ingestion records explicitly declare data provenance (`EXTERNAL_RETRIEVED`, `OBSERVED`, or `CALCULATED`).
- **Cryptographic Audit Trail**: All raw JSON payloads from external APIs are hashed with SHA-256 and stored in `raw_data_records` before parsing.
- **Tenant Isolation**: Protected by PostgreSQL native Row-Level Security (`RLS`), preventing cross-tenant data leakage even in raw SQL queries.
- **Traceability Chains**: Every recommendation includes full inputs, equations, assumptions, outputs, confidence score, and physical limitations.

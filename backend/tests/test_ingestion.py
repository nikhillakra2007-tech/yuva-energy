import pytest
import uuid
import json
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.ingestion.weather_provider import OpenMeteoWeatherProvider
from backend.app.ingestion.soil_provider import SoilGridsProvider
from backend.app.ingestion.satellite_provider import Sentinel2SatelliteProvider
from backend.app.ingestion.pipeline_service import IngestionPipelineService
from backend.app.ingestion.base import DataMode

client = TestClient(app)

def test_weather_provider_normalization():
    """Verify Open-Meteo weather provider fetches or returns structured normalized hourly records."""
    provider = OpenMeteoWeatherProvider()
    records, forecast, prov = provider.fetch_and_normalize(latitude=28.6139, longitude=77.2090)
    assert len(records) > 0
    assert prov.source_code == "OPEN_METEO"
    assert prov.mode in [DataMode.REAL_DATA, DataMode.TEST_FIXTURE]
    first = records[0]
    assert first.temperature_celsius is not None
    assert first.relative_humidity_percentage is not None
    assert first.reference_et0_mm is not None
    assert "OPEN_METEO" in first.provenance

def test_soil_provider_pedotransfer():
    """Verify SoilGrids provider returns physical soil taxonomy and derived hydraulic capacities."""
    provider = SoilGridsProvider()
    record, prov = provider.fetch_and_normalize(latitude=28.6139, longitude=77.2090)
    assert prov.source_code == "SOILGRIDS_ISRIC"
    assert record.soil_texture_class in ["SAND", "LOAM", "CLAY", "SANDY_LOAM", "SILT_LOAM", "CLAY_LOAM"]
    assert 0.0 < record.wilting_point_vwc < record.field_capacity_vwc < record.saturation_vwc < 1.0
    assert record.available_water_capacity_mm_per_m > 0
    assert record.ph > 0
    assert record.bulk_density_g_cm3 > 0

def test_satellite_provider_indices():
    """Verify Sentinel-2 provider returns cloud-filtered granules and computed NDVI, EVI, NDRE."""
    provider = Sentinel2SatelliteProvider()
    polygon = {
        "type": "Polygon",
        "coordinates": [[[77.20, 28.60], [77.25, 28.60], [77.25, 28.65], [77.20, 28.65], [77.20, 28.60]]]
    }
    records, prov = provider.fetch_and_normalize(polygon, max_cloud_cover=30.0)
    assert prov.source_code == "COPERNICUS_ESA"
    assert len(records) > 0
    for rec in records:
        assert rec.cloud_cover_percentage <= 30.0
        assert -1.0 <= rec.ndvi_mean <= 1.0
        assert rec.confidence_score > 0.5

def test_end_to_end_pipeline_sync_and_deduplication():
    """
    Test end-to-end ingestion pipeline with real field:
    1. Register user & farm & field
    2. Run sync_field_data
    3. Verify ingestion_runs, raw_data_records, observations
    4. Run sync_field_data again and verify deduplication
    """
    # 1. Register and setup field
    email = f"pipelinetester_{uuid.uuid4().hex[:6]}@example.com"
    phone = f"+91987{uuid.uuid4().hex[:7]}"
    reg_resp = client.post("/api/v1/auth/register", json={
        "full_name": "Pipeline Tester",
        "email": email,
        "phone_number": phone,
        "password": "Password123!"
    })
    assert reg_resp.status_code == 201
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    farm_resp = client.post("/api/v1/farms", headers=headers, json={
        "name": "Pipeline Research Farm",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "elevation_meters": 216.0
    })
    assert farm_resp.status_code == 201
    farm_id = farm_resp.json()["id"]

    field_resp = client.post("/api/v1/fields", headers=headers, json={
        "farm_id": farm_id,
        "name": "Wheat Field Beta",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[[77.2090, 28.6139], [77.2150, 28.6139], [77.2150, 28.6190], [77.2090, 28.6190], [77.2090, 28.6139]]]
        }
    })
    assert field_resp.status_code == 201
    field_id = field_resp.json()["id"]

    # 2. Trigger sync endpoint
    sync_resp = client.post(
        f"/api/v1/ingestion/fields/{field_id}/sync",
        headers=headers,
        json={"domains": ["WEATHER", "SOIL", "SATELLITE"]}
    )
    assert sync_resp.status_code == 200, f"Sync error: {sync_resp.status_code} - {sync_resp.json()}"
    sync_data = sync_resp.json()
    assert sync_data["field_id"] == field_id
    assert sync_data["summary"]["weather"]["status"] == "COMPLETED"
    assert sync_data["summary"]["soil"]["status"] == "COMPLETED"
    assert sync_data["summary"]["satellite"]["status"] == "COMPLETED"

    first_persisted_weather = sync_data["summary"]["weather"]["persisted"]
    assert first_persisted_weather > 0

    # 3. Trigger sync again to verify deduplication
    sync_resp_2 = client.post(
        f"/api/v1/ingestion/fields/{field_id}/sync",
        headers=headers,
        json={"domains": ["WEATHER", "SOIL", "SATELLITE"]}
    )
    assert sync_resp_2.status_code == 200
    sync_data_2 = sync_resp_2.json()
    # Deduplication should mean 0 new weather records persisted on immediate rerun
    assert sync_data_2["summary"]["weather"]["persisted"] == 0

    # 4. Check data freshness endpoint
    fresh_resp = client.get(f"/api/v1/ingestion/fields/{field_id}/freshness", headers=headers)
    assert fresh_resp.status_code == 200
    fresh_data = fresh_resp.json()
    assert fresh_data["freshness"]["weather"]["last_observed_at"] is not None
    assert fresh_data["freshness"]["soil"]["last_observed_at"] is not None
    assert fresh_data["freshness"]["satellite"]["last_acquired_at"] is not None
    assert fresh_data["freshness"]["weather"]["is_stale"] is False

    # 5. Check ingestion runs list
    runs_resp = client.get("/api/v1/ingestion/runs", headers=headers)
    assert runs_resp.status_code == 200
    runs = runs_resp.json()
    assert len(runs) >= 3
    for r in runs[:3]:
        assert r["status"] == "COMPLETED"
        assert r["http_status_code"] == 200

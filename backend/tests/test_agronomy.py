import pytest
import uuid
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.agronomy.fao56 import calculate_penman_monteith_et0, calculate_hargreaves_et0
from backend.app.agronomy.water_balance import (
    calculate_effective_rainfall, calculate_root_zone_water_balance
)

client = TestClient(app)

def test_fao56_penman_monteith_physics():
    """Verify FAO-56 Penman-Monteith ET0 adheres to thermodynamic laws."""
    # Baseline condition: 30°C, 50% RH, 20 MJ/m2 solar radiation, 2 m/s wind
    base = calculate_penman_monteith_et0(
        temp_celsius=30.0,
        relative_humidity_percentage=50.0,
        solar_radiation_mj_m2=20.0,
        wind_speed_m_s=2.0
    )
    assert 4.0 <= base["et0_mm_day"] <= 8.0
    assert base["method"] == "FAO_56_PENMAN_MONTEITH"

    # Higher temperature -> Higher ET0
    hotter = calculate_penman_monteith_et0(
        temp_celsius=40.0,
        relative_humidity_percentage=50.0,
        solar_radiation_mj_m2=20.0,
        wind_speed_m_s=2.0
    )
    assert hotter["et0_mm_day"] > base["et0_mm_day"]

    # Higher humidity -> Lower ET0 (reduced vapor pressure deficit)
    humid = calculate_penman_monteith_et0(
        temp_celsius=30.0,
        relative_humidity_percentage=90.0,
        solar_radiation_mj_m2=20.0,
        wind_speed_m_s=2.0
    )
    assert humid["et0_mm_day"] < base["et0_mm_day"]

def test_effective_rainfall_usda_scs():
    """Verify USDA Soil Conservation Service effective precipitation."""
    # Under 8.3mm is lost to surface interception
    assert calculate_effective_rainfall(5.0) == 0.0
    assert calculate_effective_rainfall(0.0) == 0.0

    # Moderate precipitation
    p_med = calculate_effective_rainfall(30.0)
    assert 15.0 <= p_med <= 29.0

    # Heavy precipitation exhibits diminishing returns due to surface runoff
    p_heavy = calculate_effective_rainfall(100.0)
    assert p_heavy == 22.5  # 0.1 * 100 + 12.5

def test_root_zone_water_balance_stress_transitions():
    """Verify FAO-56 root zone moisture depletion and crop water stress index."""
    fc = 0.30  # Field capacity 30% VWC
    wp = 0.14  # Wilting point 14% VWC
    zr = 0.60  # Root depth 60cm
    p = 0.55   # Depletion fraction

    # Scenario 1: Depletion within RAW -> No stress
    res_nostress = calculate_root_zone_water_balance(
        field_capacity_vwc=fc,
        wilting_point_vwc=wp,
        rooting_depth_meters=zr,
        previous_depletion_mm=10.0,
        crop_et_etc_mm=4.0,
        effective_precipitation_mm=0.0,
        irrigation_applied_mm=0.0,
        depletion_fraction_p=p
    )
    assert res_nostress["is_water_stressed"] is False
    assert res_nostress["water_stress_coefficient_ks"] == 1.0
    assert res_nostress["crop_water_stress_index_cwsi"] == 0.0

    # Scenario 2: Severe depletion exceeding RAW -> Stress occurs
    res_stressed = calculate_root_zone_water_balance(
        field_capacity_vwc=fc,
        wilting_point_vwc=wp,
        rooting_depth_meters=zr,
        previous_depletion_mm=75.0,  # High prior depletion
        crop_et_etc_mm=5.0,
        effective_precipitation_mm=0.0,
        irrigation_applied_mm=0.0,
        depletion_fraction_p=p
    )
    assert res_stressed["is_water_stressed"] is True
    assert res_stressed["water_stress_coefficient_ks"] < 1.0
    assert res_stressed["crop_water_stress_index_cwsi"] > 0.0
    assert res_stressed["irrigation_deficit_mm"] > 0.0

def test_end_to_end_intelligence_engine_evaluation():
    """
    Test full agronomic intelligence workflow:
    1. Register user & farm & field
    2. Attach crop cycle
    3. Trigger data sync
    4. Call evaluate endpoint
    5. Assert recommendation, farm state, and traceability chain
    6. Verify feedback submission
    """
    # 1. Setup user & farm & field
    email = f"agronomist_{uuid.uuid4().hex[:6]}@yuvaenergy.in"
    phone = f"+91988{uuid.uuid4().hex[:7]}"
    reg = client.post("/api/v1/auth/register", json={
        "full_name": "Agronomy Researcher",
        "email": email,
        "phone_number": phone,
        "password": "SecurePassword123!",
        "preferred_language": "hi"
    })
    assert reg.status_code == 201
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    farm = client.post("/api/v1/farms", headers=headers, json={
        "name": "Karnal Agronomy Station",
        "latitude": 29.6857,
        "longitude": 76.9905,
        "elevation_meters": 250.0
    })
    assert farm.status_code == 201
    farm_id = farm.json()["id"]

    field = client.post("/api/v1/fields", headers=headers, json={
        "farm_id": farm_id,
        "name": "Field North - Mustard",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[[76.9905, 29.6857], [76.9950, 29.6857], [76.9950, 29.6900], [76.9905, 29.6900], [76.9905, 29.6857]]]
        }
    })
    assert field.status_code == 201
    field_id = field.json()["id"]

    # 2. Attach Crop Cycle (Mustard)
    crops_resp = client.get("/api/v1/crops", headers=headers)
    assert crops_resp.status_code == 200
    crops = crops_resp.json()
    assert len(crops) > 0
    crop_id = crops[0]["id"]

    cycle_resp = client.post("/api/v1/crop-cycles", headers=headers, json={
        "field_id": field_id,
        "crop_id": crop_id,
        "season": "RABI",
        "cycle_year": 2026,
        "sowing_date": "2026-10-15"
    })
    assert cycle_resp.status_code == 201

    # 3. Synchronize live observations
    sync_resp = client.post(
        f"/api/v1/ingestion/fields/{field_id}/sync",
        headers=headers,
        json={"domains": ["WEATHER", "SOIL", "SATELLITE"]}
    )
    assert sync_resp.status_code == 200

    # 4. Trigger Agricultural Intelligence Evaluation
    eval_resp = client.post(f"/api/v1/recommendations/fields/{field_id}/evaluate", headers=headers)
    assert eval_resp.status_code == 200
    rec_data = eval_resp.json()

    assert rec_data["field_id"] == field_id
    assert rec_data["action_type"] in ["SCHEDULE_IRRIGATION", "IRRIGATE_IMMEDIATELY", "HOLD_FOR_RAIN", "SKIP_IRRIGATION"]
    assert rec_data["urgency_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert rec_data["confidence_score"] >= 0.70

    # Check Complete Traceability Chain
    trace = rec_data["traceability"]
    assert "inputs" in trace
    assert "calculations" in trace
    assert "assumptions" in trace
    assert "outputs" in trace
    assert "confidence" in trace
    assert "limitations" in trace
    assert len(trace["limitations"]) >= 1

    # 5. Check Root Zone Water Balance endpoint
    wb_resp = client.get(f"/api/v1/recommendations/fields/{field_id}/water-balance", headers=headers)
    assert wb_resp.status_code == 200
    wb_data = wb_resp.json()
    assert wb_data["current_root_zone_depletion_mm"] is not None
    assert wb_data["water_stress_index_cwsi"] is not None
    assert wb_data["daily_etc_mm"] is not None

    # 6. Submit feedback on the recommendation
    rec_id = rec_data["recommendation_id"]
    fb_resp = client.post(f"/api/v1/recommendations/{rec_id}/feedback", headers=headers, json={
        "action_taken": "FOLLOWED_EXACTLY",
        "actual_irrigation_duration_minutes": 120.0,
        "farmer_comments": "Applied recommendation using 3HP solar pump between 10am and 12pm.",
        "feedback_rating": 5
    })
    assert fb_resp.status_code == 201
    assert fb_resp.json()["recommendation_id"] == rec_id

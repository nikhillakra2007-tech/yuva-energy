import pytest
from datetime import datetime, timezone
from backend.app.main import app



def test_full_farmer_end_to_end_journey(client, db_conn):
    """
    Comprehensive End-to-End Integration Test:
    1. Register & login farmer
    2. Create farm & field with GeoJSON polygon
    3. Plant crop cycle
    4. Run live data ingestion pipeline (weather, soil, satellite)
    5. Trigger agronomic intelligence evaluation
    6. Verify recommendation, structured reasons, and traceability chain
    7. Retrieve FAO-56 water balance
    8. Submit farmer feedback with actual irrigation duration
    9. Verify multi-tenant RLS isolation
    """
    timestamp = int(datetime.now(timezone.utc).timestamp())
    farmer_email = f"e2e_farmer_{timestamp}@yuvaenergy.org"
    password = "StrongPassword123!"

    # 1. Register & Authenticate
    reg_res = client.post("/api/v1/auth/register", json={
        "email": farmer_email,
        "password": password,
        "full_name": "Sardar Gurbir Singh",
        "phone_number": "+919876543210"
    })
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Farm & Field
    farm_res = client.post("/api/v1/farms", headers=headers, json={
        "name": "Karnal Model Agro-Solar Estate",
        "latitude": 29.6857,
        "longitude": 76.9905,
        "total_area_hectares": 5.0
    })
    assert farm_res.status_code == 201
    farm_id = farm_res.json()["id"]

    # Boundary GeoJSON for 2.5 ha plot
    field_geojson = {
        "type": "Polygon",
        "coordinates": [[
            [76.9900, 29.6850],
            [76.9920, 29.6850],
            [76.9920, 29.6870],
            [76.9900, 29.6870],
            [76.9900, 29.6850]
        ]]
    }
    field_res = client.post("/api/v1/fields", headers=headers, json={
        "farm_id": farm_id,
        "name": "Canal View Basmati Plot",
        "boundary": field_geojson,
        "soil_type": "CLAY_LOAM"
    })
    assert field_res.status_code == 201
    field_id = field_res.json()["id"]

    # 3. Create Crop Cycle
    crops_res = client.get("/api/v1/crops")
    assert crops_res.status_code == 200
    crop_list = crops_res.json()
    assert len(crop_list) > 0
    rice_crop = next((c for c in crop_list if c["code"] == "RICE" or "Rice" in c["name"]), crop_list[0])

    cycle_res = client.post("/api/v1/crop-cycles", headers=headers, json={
        "field_id": field_id,
        "crop_id": rice_crop["id"],
        "season": "KHARIF",
        "cycle_year": 2026,
        "sowing_date": "2026-06-15",
        "expected_harvest_date": "2026-10-30"
    })
    assert cycle_res.status_code == 201

    # 4. Trigger Live Ingestion Pipeline for field
    sync_res = client.post(f"/api/v1/ingestion/fields/{field_id}/sync", headers=headers, json={
        "domains": ["WEATHER", "SOIL", "SATELLITE"]
    })
    assert sync_res.status_code == 200
    sync_data = sync_res.json()
    assert sync_data["field_id"] == field_id
    assert len(sync_data["domains_synced"]) == 3
    assert "WEATHER" in sync_data["domains_synced"]
    assert "summary" in sync_data

    # Verify freshness summary
    freshness_res = client.get(f"/api/v1/ingestion/fields/{field_id}/freshness", headers=headers)
    assert freshness_res.status_code == 200
    freshness_body = freshness_res.json()
    assert freshness_body["field_id"] == field_id
    assert "weather" in freshness_body["freshness"]
    assert freshness_body["freshness"]["weather"]["last_observed_at"] is not None

    # 5. Trigger Agronomic Evaluation
    eval_res = client.post(f"/api/v1/recommendations/fields/{field_id}/evaluate", headers=headers)
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    rec_id = eval_data["recommendation_id"]
    assert eval_data["action_type"] in ("IRRIGATE_IMMEDIATELY", "SCHEDULE_IRRIGATION", "HOLD_FOR_RAIN", "SKIP_IRRIGATION")
    assert eval_data["recommended_volume_litres"] >= 0
    assert eval_data["recommended_duration_minutes"] >= 0
    assert eval_data["confidence_score"] > 0.5

    # Traceability chain in evaluation response
    tc = eval_data["traceability"]
    assert "inputs" in tc
    assert "calculations" in tc
    assert "assumptions" in tc
    assert "outputs" in tc
    assert "confidence" in tc
    assert "limitations" in tc

    # 6. Verify Recommendation Details & Reasons via API
    rec_res = client.get(f"/api/v1/recommendations/{rec_id}", headers=headers)
    assert rec_res.status_code == 200
    rec = rec_res.json()
    assert rec["id"] == rec_id
    assert rec["field_id"] == field_id
    assert len(rec.get("reasons", [])) >= 1

    # 7. Retrieve Latest Farm State Water Balance
    wb_res = client.get(f"/api/v1/recommendations/fields/{field_id}/water-balance", headers=headers)
    assert wb_res.status_code == 200
    wb = wb_res.json()
    assert wb["current_root_zone_depletion_mm"] is not None
    assert wb["water_stress_index_cwsi"] is not None
    assert 0.0 <= wb["water_stress_index_cwsi"] <= 1.0

    # 8. Submit Farmer Feedback
    feedback_res = client.post(f"/api/v1/recommendations/{rec_id}/feedback", headers=headers, json={
        "action_taken": "FOLLOWED_EXACTLY",
        "actual_irrigation_duration_minutes": rec["recommended_duration_minutes"],
        "feedback_rating": 5,
        "farmer_comments": "Irrigated during recommended solar hours; zero grid draw!"
    })
    assert feedback_res.status_code == 201
    feedback_data = feedback_res.json()
    assert feedback_data["action_taken"] == "FOLLOWED_EXACTLY"
    assert feedback_data["feedback_rating"] == 5

    # 9. Multi-Tenant Isolation: Another farmer cannot access this recommendation or field
    other_farmer = client.post("/api/v1/auth/register", json={
        "email": f"other_farmer_{timestamp}@yuvaenergy.org",
        "password": "OtherPassword123!",
        "full_name": "Deepak Verma"
    })
    other_token = other_farmer.json()["access_token"]
    other_headers = {"Authorization": f"Bearer {other_token}"}

    # Attempt to read recommendation
    other_rec_res = client.get(f"/api/v1/recommendations/{rec_id}", headers=other_headers)
    assert other_rec_res.status_code == 404

    # Attempt to submit feedback on another farmer's recommendation
    other_fb_res = client.post(f"/api/v1/recommendations/{rec_id}/feedback", headers=other_headers, json={
        "action_taken": "REJECTED_DISAGREED",
        "feedback_rating": 1
    })
    assert other_fb_res.status_code == 404

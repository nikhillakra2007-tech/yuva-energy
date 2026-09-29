import pytest
import uuid

def test_health_endpoints(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "Yuva Energy" in data["service"]

    db_res = client.get("/api/v1/health/db")
    assert db_res.status_code == 200
    db_data = db_res.json()
    assert db_data["status"] == "healthy"
    assert db_data["database"] == "connected"
    assert db_data["postgis_active"] is True
    assert db_data["public_entities_count"] >= 77

def test_auth_workflow(client):
    rand_email = f"farmer_{uuid.uuid4().hex[:8]}@example.com"
    reg_payload = {
        "full_name": "Devi Lal",
        "email": rand_email,
        "password": "StrongPassword123!",
        "phone_number": "+919876543210",
        "preferred_language": "hi"
    }
    # 1. Register
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    token_data = reg_res.json()
    assert "access_token" in token_data
    assert token_data["email"] == rand_email
    assert token_data["full_name"] == "Devi Lal"

    # 2. Duplicate registration fails with 409
    dup_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 409

    # 3. Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": rand_email,
        "password": "StrongPassword123!"
    })
    assert login_res.status_code == 200
    login_token = login_res.json()["access_token"]

    # 4. Bad password fails with 401
    bad_login = client.post("/api/v1/auth/login", json={
        "email": rand_email,
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

    # 5. Access profile with token
    headers = {"Authorization": f"Bearer {login_token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    profile = me_res.json()
    assert profile["email"] == rand_email
    assert profile["full_name"] == "Devi Lal"

def test_farms_and_fields_flow(client):
    rand_email = f"farmer_{uuid.uuid4().hex[:8]}@example.com"
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": "Kisan Singh",
        "email": rand_email,
        "password": "Password123!",
        "preferred_language": "en"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create Farm
    farm_payload = {
        "name": "Kisan Eco Farm",
        "description": "Solar irrigation farm",
        "timezone": "Asia/Kolkata",
        "latitude": 28.5000,
        "longitude": 77.1000,
        "total_area_hectares": 5.2,
        "primary_water_source": "BOREWELL_DEEP"
    }
    farm_res = client.post("/api/v1/farms", json=farm_payload, headers=headers)
    assert farm_res.status_code == 201
    farm = farm_res.json()
    farm_id = farm["id"]
    assert farm["name"] == "Kisan Eco Farm"
    assert farm["latitude"] == 28.5000

    # List Farms
    farms_list = client.get("/api/v1/farms", headers=headers)
    assert farms_list.status_code == 200
    assert len(farms_list.json()) >= 1

    # Create Field with Polygon
    field_payload = {
        "farm_id": farm_id,
        "name": "Wheat Field 1",
        "boundary": {
            "type": "Polygon",
            "coordinates": [
                [
                    [77.1000, 28.5000],
                    [77.1050, 28.5000],
                    [77.1050, 28.5050],
                    [77.1000, 28.5050],
                    [77.1000, 28.5000]
                ]
            ]
        },
        "soil_type": "LOAM",
        "slope_percentage": 1.2
    }
    field_res = client.post("/api/v1/fields", json=field_payload, headers=headers)
    assert field_res.status_code == 201
    field = field_res.json()
    field_id = field["id"]
    assert field["name"] == "Wheat Field 1"
    # Geodesic area computed automatically by PostGIS trigger
    assert field["area_hectares"] is not None
    assert field["area_hectares"] > 0
    assert field["perimeter_meters"] is not None
    assert field["centroid_geojson"] is not None

    # Get Field
    get_field_res = client.get(f"/api/v1/fields/{field_id}", headers=headers)
    assert get_field_res.status_code == 200
    assert get_field_res.json()["id"] == field_id

    # Add Zone
    zone_payload = {
        "name": "Zone Alpha",
        "soil_texture": "SANDY_LOAM"
    }
    zone_res = client.post(f"/api/v1/fields/{field_id}/zones", json=zone_payload, headers=headers)
    assert zone_res.status_code == 201
    assert zone_res.json()["name"] == "Zone Alpha"

def test_crop_catalog_and_cycle(client):
    # Public catalog
    crops_res = client.get("/api/v1/crops")
    assert crops_res.status_code == 200
    crops = crops_res.json()
    assert len(crops) >= 6
    wheat = next(c for c in crops if c["code"] == "WHEAT")
    
    # Growth stages
    stages_res = client.get(f"/api/v1/crops/{wheat['id']}/growth-stages")
    assert stages_res.status_code == 200
    stages = stages_res.json()
    assert len(stages) >= 2

    # Plant a crop cycle on a field
    rand_email = f"farmer_{uuid.uuid4().hex[:8]}@example.com"
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": "Ravi Kumar",
        "email": rand_email,
        "password": "Password123!"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    farm_res = client.post("/api/v1/farms", json={"name": "Ravi Farm"}, headers=headers)
    farm_id = farm_res.json()["id"]

    field_res = client.post("/api/v1/fields", json={
        "farm_id": farm_id,
        "name": "Rabi Field",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[[77.0, 28.0], [77.01, 28.0], [77.01, 28.01], [77.0, 28.01], [77.0, 28.0]]]
        }
    }, headers=headers)
    field_id = field_res.json()["id"]

    cycle_res = client.post("/api/v1/crop-cycles", json={
        "field_id": field_id,
        "crop_id": wheat["id"],
        "season": "RABI",
        "cycle_year": 2026,
        "sowing_date": "2026-10-15"
    }, headers=headers)
    assert cycle_res.status_code == 201
    assert cycle_res.json()["season"] == "RABI"

    # List cycles
    list_res = client.get(f"/api/v1/crop-cycles?field_id={field_id}", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

def test_multi_tenant_isolation(client):
    """
    STRICT SECURITY REQUIREMENT:
    USER A cannot view, modify, or delete USER B's resources:
    - User A cannot access User B's farm
    - User A cannot access User B's field
    - User A cannot add a field to User B's farm
    - User A cannot modify User B's recommendation feedback
    """
    # 1. Setup User A
    user_a_email = f"user_a_{uuid.uuid4().hex[:8]}@test.com"
    token_a = client.post("/api/v1/auth/register", json={
        "full_name": "User Alpha", "email": user_a_email, "password": "PasswordA123!"
    }).json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Setup User B
    user_b_email = f"user_b_{uuid.uuid4().hex[:8]}@test.com"
    token_b = client.post("/api/v1/auth/register", json={
        "full_name": "User Beta", "email": user_b_email, "password": "PasswordB123!"
    }).json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. User B creates a Farm and Field
    farm_b = client.post("/api/v1/farms", json={"name": "Farm Beta"}, headers=headers_b).json()
    farm_b_id = farm_b["id"]

    field_b = client.post("/api/v1/fields", json={
        "farm_id": farm_b_id,
        "name": "Field Beta",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[[78.0, 29.0], [78.01, 29.0], [78.01, 29.01], [78.0, 29.01], [78.0, 29.0]]]
        }
    }, headers=headers_b).json()
    field_b_id = field_b["id"]

    # 4. User A tries to get User B's Farm -> 403 Forbidden
    res = client.get(f"/api/v1/farms/{farm_b_id}", headers=headers_a)
    assert res.status_code in [403, 404]

    # 5. User A tries to update User B's Farm -> 403 Forbidden
    res = client.put(f"/api/v1/farms/{farm_b_id}", json={"name": "Hacked Farm"}, headers=headers_a)
    assert res.status_code in [403, 404]

    # 6. User A tries to delete User B's Farm -> 403 Forbidden
    res = client.delete(f"/api/v1/farms/{farm_b_id}", headers=headers_a)
    assert res.status_code in [403, 404]

    # 7. User A tries to view User B's Field -> 403 Forbidden
    res = client.get(f"/api/v1/fields/{field_b_id}", headers=headers_a)
    assert res.status_code in [403, 404]

    # 8. User A tries to add a field to User B's Farm -> 403 Forbidden
    res = client.post("/api/v1/fields", json={
        "farm_id": farm_b_id,
        "name": "Trojan Field",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[[78.0, 29.0], [78.01, 29.0], [78.01, 29.01], [78.0, 29.01], [78.0, 29.0]]]
        }
    }, headers=headers_a)
    assert res.status_code in [403, 404]

    # 9. User A tries to plant on User B's field -> 403 Forbidden
    crops = client.get("/api/v1/crops").json()
    wheat_id = crops[0]["id"]
    res = client.post("/api/v1/crop-cycles", json={
        "field_id": field_b_id,
        "crop_id": wheat_id,
        "season": "RABI",
        "cycle_year": 2026,
        "sowing_date": "2026-10-15"
    }, headers=headers_a)
    assert res.status_code in [403, 404]

def test_dashboard_analytics(client):
    rand_email = f"farmer_{uuid.uuid4().hex[:8]}@example.com"
    token = client.post("/api/v1/auth/register", json={
        "full_name": "Analytics Farmer",
        "email": rand_email,
        "password": "Password123!"
    }).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/analytics/dashboard", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_farms" in data
    assert "total_fields" in data
    assert "total_area_hectares" in data
    assert "fields" in data

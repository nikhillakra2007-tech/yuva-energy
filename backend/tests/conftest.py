import pytest
from fastapi.testclient import TestClient
import psycopg

from backend.app.main import app
from backend.app.config import settings
from backend.app.database import get_connection_params

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="session")
def db_conn():
    conn = psycopg.connect(**get_connection_params())
    yield conn
    conn.close()

@pytest.fixture
def auth_headers_user_a(client):
    """Registers and logs in a test User A, returning Authorization headers."""
    email = f"user_a_{pytest.__name__}@test.com"
    client.post("/api/v1/auth/register", json={
        "full_name": "Farmer Arjun",
        "email": email,
        "password": "Password123!",
        "preferred_language": "hi"
    })
    res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123!"
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def auth_headers_user_b(client):
    """Registers and logs in a test User B, returning Authorization headers."""
    email = f"user_b_{pytest.__name__}@test.com"
    client.post("/api/v1/auth/register", json={
        "full_name": "Farmer Balram",
        "email": email,
        "password": "Password123!",
        "preferred_language": "en"
    })
    res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123!"
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

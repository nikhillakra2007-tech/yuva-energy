from fastapi import APIRouter, Depends, status
from typing import List, Dict, Any
from uuid import UUID
import psycopg

from backend.app.dependencies import get_tenant_db, get_db_conn, get_current_user
from backend.app.models.recommendation import (
    RecommendationResponse, RecommendationFeedbackCreate, RecommendationFeedbackResponse
)
from backend.app.services.recommendation_service import RecommendationService
from backend.app.agronomy.intelligence_service import AgriculturalIntelligenceEngine
from fastapi import HTTPException

router = APIRouter(tags=["Recommendations & Actions"])

@router.get("/recommendations", response_model=List[RecommendationResponse], summary="List Active Actionable Recommendations")
def list_recommendations(
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return RecommendationService.list_recommendations(conn, current_user["id"])

@router.get("/recommendations/{recommendation_id}", response_model=RecommendationResponse, summary="Get Recommendation Details & Reasoning")
def get_recommendation(
    recommendation_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return RecommendationService.get_recommendation(conn, recommendation_id, current_user["id"])

@router.post("/recommendations/fields/{field_id}/evaluate", summary="Trigger Agronomic Intelligence Evaluation for Field")
def evaluate_field_agronomy(
    field_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    tenant_conn: psycopg.Connection = Depends(get_tenant_db),
    system_conn: psycopg.Connection = Depends(get_db_conn)
):
    """
    Executes deterministic FAO-56 Penman-Monteith ET0, crop ETc, root zone water balance,
    and formulates actionable irrigation recommendations with complete traceability.
    """
    # 1. Enforce tenant ownership of field
    with tenant_conn.cursor() as cur:
        cur.execute("SELECT id FROM fields WHERE id = %s", (str(field_id),))
        if not cur.fetchone():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Field not found or access denied")

    preferred_lang = current_user.get("preferred_language", "en")
    result = AgriculturalIntelligenceEngine.evaluate_field(
        conn=system_conn,
        field_id=str(field_id),
        farmer_preferred_language=preferred_lang
    )
    return result

@router.get("/recommendations/fields/{field_id}/water-balance", summary="Get Latest Root Zone Water Balance")
def get_field_water_balance(
    field_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    """
    Returns latest evaluated soil water balance (CWSI, TAW, RAW, depletion, and daily ETc).
    """
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM fields WHERE id = %s", (str(field_id),))
        if not cur.fetchone():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Field not found or access denied")

        cur.execute(
            """
            SELECT evaluated_at, current_canopy_cover_pct, current_ndvi,
                   current_soil_moisture_vwc, current_root_zone_depletion_mm,
                   daily_etc_mm, water_stress_index_cwsi, data_completeness_score,
                   overall_confidence_score, state_summary_text
            FROM farm_states
            WHERE field_id = %s
            ORDER BY evaluated_at DESC LIMIT 1
            """,
            (str(field_id),)
        )
        state = cur.fetchone()
        if not state:
            return {"field_id": str(field_id), "status": "NO_EVALUATION_YET"}
        return state

@router.post("/recommendations/{recommendation_id}/feedback", response_model=RecommendationFeedbackResponse, status_code=status.HTTP_201_CREATED, summary="Submit Farmer Action Feedback")
def submit_feedback(
    recommendation_id: UUID,
    data: RecommendationFeedbackCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    return RecommendationService.submit_feedback(conn, recommendation_id, current_user["id"], data)

@router.get("/alerts", response_model=List[RecommendationResponse], summary="Get Prioritized High-Urgency Alerts")
def get_alerts(
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    recs = RecommendationService.list_recommendations(conn, current_user["id"])
    return recs


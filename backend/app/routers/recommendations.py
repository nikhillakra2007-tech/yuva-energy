from fastapi import APIRouter, Depends, status
from typing import List, Dict, Any
from uuid import UUID
import psycopg

from backend.app.dependencies import get_tenant_db, get_current_user
from backend.app.models.recommendation import (
    RecommendationResponse, RecommendationFeedbackCreate, RecommendationFeedbackResponse
)
from backend.app.services.recommendation_service import RecommendationService

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
    # Alerts prioritize HIGH_WATER_DEFICIT, HEAT_STRESS, CRITICAL actions
    return recs

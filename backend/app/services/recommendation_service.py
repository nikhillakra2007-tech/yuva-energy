from uuid import UUID
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
import psycopg

from backend.app.repositories.recommendation_repo import RecommendationRepository
from backend.app.models.recommendation import RecommendationFeedbackCreate

class RecommendationService:
    @staticmethod
    def list_recommendations(conn: psycopg.Connection, user_id: UUID) -> List[Dict[str, Any]]:
        return RecommendationRepository.list_active_by_user(conn, user_id)

    @staticmethod
    def get_recommendation(conn: psycopg.Connection, rec_id: UUID, user_id: UUID) -> Dict[str, Any]:
        rec = RecommendationRepository.get_by_id(conn, rec_id)
        if not rec:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")
        if rec["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this recommendation"
            )
        return rec

    @staticmethod
    def submit_feedback(
        conn: psycopg.Connection,
        rec_id: UUID,
        user_id: UUID,
        data: RecommendationFeedbackCreate
    ) -> Dict[str, Any]:
        # Enforce that user owns this recommendation
        RecommendationService.get_recommendation(conn, rec_id, user_id)
        
        valid_actions = ["APPLIED_FULL", "APPLIED_PARTIAL", "DEFERRED", "REJECTED", "IGNORED"]
        if data.action_taken not in valid_actions:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid action_taken '{data.action_taken}'. Must be one of {valid_actions}"
            )
        
        return RecommendationRepository.add_feedback(
            conn=conn,
            recommendation_id=rec_id,
            user_id=user_id,
            action_taken=data.action_taken,
            actual_water_volume_litres=data.actual_water_volume_litres,
            farmer_notes=data.farmer_notes
        )

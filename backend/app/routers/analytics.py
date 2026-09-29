from fastapi import APIRouter, Depends
from typing import Dict, Any, List
import psycopg

from backend.app.dependencies import get_tenant_db, get_current_user
from backend.app.models.analytics import DashboardSummaryResponse, FarmHealthCard
from backend.app.repositories.farm_repo import FarmRepository
from backend.app.repositories.field_repo import FieldRepository
from backend.app.repositories.recommendation_repo import RecommendationRepository

router = APIRouter(prefix="/analytics", tags=["Farmer Analytics & Dashboard"])

@router.get("/dashboard", response_model=DashboardSummaryResponse, summary="Get Unified Farmer Overview Dashboard")
def get_dashboard_summary(
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_tenant_db)
):
    farms = FarmRepository.list_by_user(conn, current_user["id"])
    fields = FieldRepository.list_all_user_fields(conn, current_user["id"])
    recs = RecommendationRepository.list_active_by_user(conn, current_user["id"])
    
    total_area = sum(float(f.get("area_hectares") or 0.0) for f in fields)
    active_recs_count = len(recs)
    
    ndvis = [float(f["current_ndvi"]) for f in fields if f.get("current_ndvi") is not None]
    avg_ndvi = round(sum(ndvis) / len(ndvis), 3) if ndvis else None
    
    rec_field_ids = {r["field_id"] for r in recs}
    active_crop_cycles = sum(1 for f in fields if f.get("current_crop_name") is not None)
    
    field_cards = []
    for f in fields:
        has_rec = f["id"] in rec_field_ids
        field_cards.append(FarmHealthCard(
            field_id=f["id"],
            field_name=f["name"],
            farm_id=f["farm_id"],
            farm_name=f.get("farm_name", ""),
            area_hectares=f.get("area_hectares"),
            crop_name=f.get("current_crop_name"),
            growth_stage=f.get("current_crop_stage"),
            current_ndvi=f.get("current_ndvi"),
            soil_moisture_status="ADEQUATE",
            water_stress_index=0.15,
            last_evaluated_at=f.get("updated_at"),
            has_active_recommendation=has_rec,
            recommendation_urgency="URGENT" if has_rec else "NORMAL"
        ))
    
    return DashboardSummaryResponse(
        total_farms=len(farms),
        total_fields=len(fields),
        total_area_hectares=round(total_area, 2),
        active_crop_cycles=active_crop_cycles,
        active_recommendations_count=active_recs_count,
        average_ndvi=avg_ndvi,
        fields=field_cards
    )

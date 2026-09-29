from fastapi import APIRouter, Depends, status
from typing import Dict, Any
import psycopg

from backend.app.dependencies import get_db_conn, get_current_user
from backend.app.models.auth import (
    UserRegisterRequest, UserLoginRequest, TokenResponse, UserProfileResponse, UserUpdateRequest
)
from backend.app.services.auth_service import AuthService
from backend.app.repositories.user_repo import UserRepository

router = APIRouter(prefix="/auth", tags=["Authentication & Profile"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="Farmer Signup")
def register(data: UserRegisterRequest, conn: psycopg.Connection = Depends(get_db_conn)):
    return AuthService.register_user(
        conn=conn,
        full_name=data.full_name,
        email=data.email,
        password=data.password,
        phone_number=data.phone_number,
        preferred_language=data.preferred_language
    )

@router.post("/login", response_model=TokenResponse, summary="Farmer Login")
def login(data: UserLoginRequest, conn: psycopg.Connection = Depends(get_db_conn)):
    return AuthService.login_user(
        conn=conn,
        email=data.email,
        password=data.password
    )

@router.get("/me", response_model=UserProfileResponse, summary="Get Current Farmer Profile")
def get_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserProfileResponse, summary="Update Farmer Profile")
def update_profile(
    data: UserUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    conn: psycopg.Connection = Depends(get_db_conn)
):
    updated = UserRepository.update_profile(
        conn=conn,
        user_id=current_user["id"],
        full_name=data.full_name,
        phone_number=data.phone_number,
        preferred_language=data.preferred_language
    )
    return updated

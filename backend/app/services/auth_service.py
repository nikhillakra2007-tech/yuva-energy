import json
from uuid import UUID
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
import psycopg

from backend.app.repositories.user_repo import UserRepository
from backend.app.security import hash_password, verify_password, create_access_token

class AuthService:
    @staticmethod
    def register_user(
        conn: psycopg.Connection,
        full_name: str,
        email: str,
        password: str,
        phone_number: Optional[str] = None,
        preferred_language: str = "en"
    ) -> Dict[str, Any]:
        existing = UserRepository.get_by_email(conn, email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email address already exists"
            )
        
        hashed = hash_password(password)
        user = UserRepository.create_user(
            conn=conn,
            full_name=full_name,
            email=email,
            hashed_password=hashed,
            phone_number=phone_number,
            preferred_language=preferred_language
        )
        
        token = create_access_token({
            "sub": str(user["auth_id"]),
            "user_id": str(user["id"]),
            "email": user["email"],
            "name": user["full_name"]
        })
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user_id": user["id"],
            "auth_id": user["auth_id"],
            "full_name": user["full_name"],
            "email": user["email"]
        }

    @staticmethod
    def login_user(conn: psycopg.Connection, email: str, password: str) -> Dict[str, Any]:
        user = UserRepository.get_by_email(conn, email)
        if not user or not user.get("is_active"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        metadata = user.get("metadata", {})
        if isinstance(metadata, str):
            try:
                metadata = json.loads(metadata)
            except Exception:
                metadata = {}
        
        stored_hash = metadata.get("password_hash")
        if not stored_hash or not verify_password(password, stored_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token = create_access_token({
            "sub": str(user["auth_id"] or user["id"]),
            "user_id": str(user["id"]),
            "email": user["email"],
            "name": user["full_name"]
        })
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user_id": user["id"],
            "auth_id": user["auth_id"] or user["id"],
            "full_name": user["full_name"],
            "email": user["email"]
        }

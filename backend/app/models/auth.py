from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150, json_schema_extra={"example": "Ramesh Patel"})
    email: EmailStr = Field(..., json_schema_extra={"example": "ramesh@yuvaenergy.in"})
    password: str = Field(..., min_length=8, max_length=100, json_schema_extra={"example": "SecureFarmerPass2026!"})
    phone_number: Optional[str] = Field(None, json_schema_extra={"example": "+919876543210"})
    preferred_language: str = Field(default="en", json_schema_extra={"example": "hi"})

class UserLoginRequest(BaseModel):
    email: EmailStr = Field(..., json_schema_extra={"example": "ramesh@yuvaenergy.in"})
    password: str = Field(..., json_schema_extra={"example": "SecureFarmerPass2026!"})

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: UUID
    auth_id: UUID
    full_name: str
    email: str

class UserProfileResponse(BaseModel):
    id: UUID
    auth_id: Optional[UUID]
    full_name: str
    email: Optional[str]
    phone_number: Optional[str]
    preferred_language: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    phone_number: Optional[str] = None
    preferred_language: Optional[str] = None

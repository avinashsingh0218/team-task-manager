from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

# ── Request Schemas (what the client sends) ──────────────────────────────────

class SignupRequest(BaseModel):
    """Data required to create a new account"""
    name:     str
    email:    EmailStr   # pydantic validates email format automatically
    password: str

class LoginRequest(BaseModel):
    """Data required to log in"""
    email:    EmailStr
    password: str

class UpdateRoleRequest(BaseModel):
    """Admin-only: change a user's role"""
    role: UserRole

# ── Response Schemas (what the server sends back) ────────────────────────────

class UserResponse(BaseModel):
    """Safe user object — never includes the password"""
    id:         int
    name:       str
    email:      str
    role:       UserRole
    created_at: datetime

    class Config:
        from_attributes = True   # allows converting SQLAlchemy model → Pydantic schema

class TokenResponse(BaseModel):
    """JWT token returned after successful login"""
    access_token: str
    token_type:   str = "bearer"
    user:         UserResponse

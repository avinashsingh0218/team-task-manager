# Makes schemas/ a Python package
from app.schemas.user import (
    SignupRequest, LoginRequest, UpdateRoleRequest,
    UserResponse, TokenResponse
)
from app.schemas.project_task import (
    ProjectCreate, ProjectUpdate, ProjectResponse,
    TaskCreate, TaskUpdate, TaskStatusUpdate, TaskResponse
)

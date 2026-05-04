from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel
from app.models.task import TaskStatus, TaskPriority
from app.schemas.user import UserResponse

# ── Project Schemas ───────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name:        str
    description: Optional[str] = None

class ProjectUpdate(BaseModel):
    name:        Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id:          int
    name:        str
    description: Optional[str]
    created_by:  int
    created_at:  datetime
    task_count:  int = 0  # computed field, not in DB
    members:     List[UserResponse] = []

    class Config:
        from_attributes = True

class ProjectMemberAdd(BaseModel):
    user_id: int

# ── Task Schemas ──────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title:       str
    description: Optional[str] = None
    priority:    TaskPriority   = TaskPriority.medium
    due_date:    Optional[date] = None
    project_id:  int
    assigned_to: Optional[int] = None

class TaskUpdate(BaseModel):
    title:       Optional[str]          = None
    description: Optional[str]          = None
    priority:    Optional[TaskPriority] = None
    due_date:    Optional[date]         = None
    assigned_to: Optional[int]          = None

class TaskStatusUpdate(BaseModel):
    """Members use this to update only the status of their assigned tasks"""
    status: TaskStatus

class TaskResponse(BaseModel):
    id:          int
    title:       str
    description: Optional[str]
    status:      TaskStatus
    priority:    TaskPriority
    due_date:    Optional[date]
    project_id:  int
    assigned_to: Optional[int]
    created_by:  int
    created_at:  datetime
    updated_at:  Optional[datetime]
    # nested objects for richer responses
    assignee:    Optional[UserResponse] = None

    class Config:
        from_attributes = True

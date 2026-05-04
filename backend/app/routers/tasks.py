from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.task import Task, TaskStatus
from app.models.user import User, UserRole
from app.schemas.project_task import TaskCreate, TaskUpdate, TaskStatusUpdate, TaskResponse
from app.utils.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("/", response_model=List[TaskResponse])
def list_tasks(
    project_id: Optional[int] = Query(None, description="Filter by project"),
    status:     Optional[TaskStatus] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List tasks with optional filters.
    - Admins see ALL tasks.
    - Members see only tasks assigned to them.
    """
    query = db.query(Task)

    # Role-based filtering: members only see their own tasks
    if current_user.role == UserRole.member:
        query = query.filter(Task.assigned_to == current_user.id)

    if project_id:
        query = query.filter(Task.project_id == project_id)
    if status:
        query = query.filter(Task.status == status)

    return query.order_by(Task.created_at.desc()).all()

@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Admin only: create and assign a task to a project"""
    task = Task(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        due_date=payload.due_date,
        project_id=payload.project_id,
        assigned_to=payload.assigned_to,
        created_by=current_user.id
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single task. Members can only view their own tasks."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Members cannot view tasks not assigned to them
    if current_user.role == UserRole.member and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin)
):
    """Admin only: update any task field (except status)"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if payload.title       is not None: task.title       = payload.title
    if payload.description is not None: task.description = payload.description
    if payload.priority    is not None: task.priority    = payload.priority
    if payload.due_date    is not None: task.due_date    = payload.due_date
    if payload.assigned_to is not None: task.assigned_to = payload.assigned_to

    db.commit()
    db.refresh(task)
    return task

@router.patch("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    payload: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Any authenticated user can update task status.
    Members can only update their own assigned tasks.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role == UserRole.member and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own tasks")

    task.status = payload.status
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin)
):
    """Admin only: delete a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()

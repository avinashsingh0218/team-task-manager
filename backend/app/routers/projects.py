from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.project import Project
from app.models.task import Task
from app.schemas.project_task import ProjectCreate, ProjectUpdate, ProjectResponse
from app.utils.dependencies import get_current_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/api/projects", tags=["Projects"])

def _build_response(project: Project, db: Session) -> ProjectResponse:
    task_count = db.query(Task).filter(Task.project_id == project.id).count()
    data = ProjectResponse.model_validate(project)
    data.task_count = task_count
    return data

@router.get("/", response_model=List[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user)
):
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    return [_build_response(p, db) for p in projects]

@router.post("/", response_model=ProjectResponse, status_code=201)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    project = Project(
        name=payload.name,
        description=payload.description,
        created_by=current_user.id
    )
    project.members.append(current_user)
    db.add(project)
    db.commit()
    db.refresh(project)
    return _build_response(project, db)

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _build_response(project, db)

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload.name is not None:
        project.name = payload.name
    if payload.description is not None:
        project.description = payload.description

    db.commit()
    db.refresh(project)
    return _build_response(project, db)

@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()

from app.schemas.project_task import ProjectMemberAdd

@router.post("/{project_id}/members", status_code=201)
def add_member(
    project_id: int,
    payload: ProjectMemberAdd,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin)
):
    """Admin only: add a user to a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user in project.members:
        raise HTTPException(status_code=400, detail="User is already a member of this project")
        
    project.members.append(user)
    db.commit()
    return {"message": "User added to project successfully"}

@router.delete("/{project_id}/members/{user_id}", status_code=204)
def remove_member(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin)
):
    """Admin only: remove a user from a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user not in project.members:
        raise HTTPException(status_code=404, detail="User is not a member of this project")
        
    project.members.remove(user)
    db.commit()

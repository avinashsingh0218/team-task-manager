from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.task import Task, TaskStatus
from app.models.project import Project
from app.models.user import User
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns overview numbers for the dashboard page.
    Admins see global stats. Members see their personal stats.
    """
    today = date.today()

    if current_user.role == "admin":
        # Admin sees everything
        base_query = db.query(Task)
        total_projects = db.query(Project).count()
        total_users = db.query(User).count()
    else:
        # Member sees only their assigned tasks
        base_query = db.query(Task).filter(Task.assigned_to == current_user.id)
        total_projects = None
        total_users = None

    total_tasks    = base_query.count()
    todo_tasks     = base_query.filter(Task.status == TaskStatus.todo).count()
    inprogress     = base_query.filter(Task.status == TaskStatus.in_progress).count()
    done_tasks     = base_query.filter(Task.status == TaskStatus.done).count()
    overdue_tasks  = base_query.filter(
        Task.due_date < today,
        Task.status   != TaskStatus.done
    ).count()

    return {
        "total_tasks":    total_tasks,
        "todo":           todo_tasks,
        "in_progress":    inprogress,
        "done":           done_tasks,
        "overdue":        overdue_tasks,
        "total_projects": total_projects,
        "total_users":    total_users,
    }

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Date, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class TaskStatus(str, enum.Enum):
    todo        = "todo"
    in_progress = "in_progress"
    done        = "done"

class TaskPriority(str, enum.Enum):
    low    = "low"
    medium = "medium"
    high   = "high"

class Task(Base):
    __tablename__ = "tasks"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    status      = Column(Enum(TaskStatus),   default=TaskStatus.todo,        nullable=False)
    priority    = Column(Enum(TaskPriority), default=TaskPriority.medium,    nullable=False)
    due_date    = Column(Date, nullable=True)

    # Foreign keys linking to other tables
    project_id  = Column(Integer, ForeignKey("projects.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"),    nullable=True)   # can be unassigned
    created_by  = Column(Integer, ForeignKey("users.id"),    nullable=False)

    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project  = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="assigned_tasks", foreign_keys=[assigned_to])
    creator  = relationship("User", back_populates="created_tasks",  foreign_keys=[created_by])

    def __repr__(self):
        return f"<Task id={self.id} title={self.title} status={self.status}>"

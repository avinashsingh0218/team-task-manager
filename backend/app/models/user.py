from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    admin = "admin"
    member = "member"

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100), nullable=False)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role          = Column(Enum(UserRole), default=UserRole.member, nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    projects      = relationship("Project", back_populates="creator", foreign_keys="Project.created_by")
    assigned_tasks = relationship("Task", back_populates="assignee", foreign_keys="Task.assigned_to")
    created_tasks  = relationship("Task", back_populates="creator",  foreign_keys="Task.created_by")
    member_of_projects = relationship("Project", secondary="project_members", back_populates="members")

    def __repr__(self):
        return f"<User id={self.id} email={self.email} role={self.role}>"

# This file makes the models directory a Python package
# and provides a single import point for all models.
# Importing all models here ensures SQLAlchemy sees them
# when creating tables with Base.metadata.create_all()

from app.models.user import User, UserRole
from app.models.project import Project
from app.models.task import Task, TaskStatus, TaskPriority

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User

engine = create_engine("sqlite:///./team_task_manager.db")
Session = sessionmaker(bind=engine)
session = Session()

user = session.query(User).filter(User.id == 2).first()
print(f"User email: {user.email}")
print(f"Hashed password: {user.hashed_password}")

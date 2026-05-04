from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

# Create the SQLAlchemy engine (the connection to the database)
# connect_args is only needed for SQLite (allows multiple threads to share one connection)
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# SessionLocal is a factory — calling SessionLocal() gives us a database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all our models to inherit from
class Base(DeclarativeBase):
    pass

# Dependency: yields a DB session for each API request, then closes it
def get_db():
    db = SessionLocal()
    try:
        yield db          # the route handler gets this session
    finally:
        db.close()        # always close after the request is done

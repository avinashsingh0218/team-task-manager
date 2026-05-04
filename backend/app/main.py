from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base

# Import all models so SQLAlchemy can create their tables
import app.models  # noqa: F401

# Import all routers
from app.routers import auth, users, projects, tasks, dashboard

# ── Create all DB tables on startup ──────────────────────────────────────────
# This is fine for development. For production, use Alembic migrations instead.
Base.metadata.create_all(bind=engine)

# ── Initialize FastAPI App ────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description="A full-stack team task manager with role-based access control",
    version="1.0.0",
    docs_url="/docs",      # Swagger UI at /docs
    redoc_url="/redoc",    # ReDoc at /redoc
)

# ── CORS Middleware ───────────────────────────────────────────────────────────
# Allows the React frontend (running on a different port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ──────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)

@app.get("/", tags=["Health"])
def health_check():
    """Simple health check — confirms the API is running"""
    return {"status": "ok", "app": settings.APP_NAME}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base

# Import all models
import app.models  # noqa: F401

# Import routers
from app.routers import auth, users, projects, tasks, dashboard

# ── Create DB tables ─────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Initialize FastAPI App ───────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description="A full-stack team task manager with role-based access control",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── FINAL CORS CONFIG (WORKS FOR LOCAL + VERCEL) ─────────────
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*vercel\.app",  # ✅ allows ALL Vercel deployments
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],  # ✅ local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ─────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)

# ── Health Check ─────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
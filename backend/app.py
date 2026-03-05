"""
MindBridge Backend — FastAPI Entry Point
Run with: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from db.models import init_db
from api.auth import router as auth_router
from api.consultation import router as consultation_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting MindBridge backend...")
    init_db()
    print("✅ Database ready")
    yield
    print("👋 MindBridge shutting down")


app = FastAPI(
    title="MindBridge API",
    description="AI Mental Health Support Platform — Powered by Sarvam AI",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(consultation_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "MindBridge",
        "version": "1.0.0",
        "ai_provider": "Sarvam AI (sarvam-m)",
    }


@app.get("/")
def root():
    return {
        "message": "MindBridge API is running.",
        "docs": "/docs",
        "health": "/health",
    }
"""
AI Data Visualization Agent — FastAPI Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import analysis, health
from core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 Starting {settings.APP_NAME} v{settings.VERSION}")
    yield
    print("👋 Shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI-powered data visualization agent with sandboxed code execution",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])

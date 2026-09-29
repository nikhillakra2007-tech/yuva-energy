from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import psycopg
import logging

from backend.app.config import settings
from backend.app.routers.health import router as health_router
from backend.app.routers.auth import router as auth_router
from backend.app.routers.farms import router as farms_router
from backend.app.routers.fields import router as fields_router
from backend.app.routers.crops import router as crops_router
from backend.app.routers.weather import router as weather_router
from backend.app.routers.soil import soil_router, satellite_router
from backend.app.routers.recommendations import router as recommendations_router
from backend.app.routers.analytics import router as analytics_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("yuva-energy-backend")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Production-ready REST API for Yuva Energy Precision Agriculture & Soil/Energy Intelligence Platform",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global PostgreSQL error handler
@app.exception_handler(psycopg.Error)
async def psycopg_exception_handler(request: Request, exc: psycopg.Error):
    sqlstate = getattr(exc, "sqlstate", None)
    logger.error(f"Database error occurred: {exc} [SQLSTATE: {sqlstate}]")
    
    # 23505 = unique_violation
    if sqlstate == "23505":
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": "A duplicate record already exists with this unique identifier or code.", "sqlstate": sqlstate}
        )
    # 23503 = foreign_key_violation
    if sqlstate == "23503":
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Referenced entity does not exist or relational integrity constraint violated.", "sqlstate": sqlstate}
        )
    # 23514 = check_violation
    if sqlstate == "23514":
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": "Input values violate domain check constraints (e.g. invalid bounds, unphysical values).", "sqlstate": sqlstate}
        )
    # 42501 = insufficient_privilege (RLS access denial)
    if sqlstate == "42501":
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "Row-level security policy denied access to this resource.", "sqlstate": sqlstate}
        )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal database error occurred.", "sqlstate": sqlstate}
    )

# Include all sub-routers with API prefix
app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(farms_router, prefix=settings.API_PREFIX)
app.include_router(fields_router, prefix=settings.API_PREFIX)
app.include_router(crops_router, prefix=settings.API_PREFIX)
app.include_router(weather_router, prefix=settings.API_PREFIX)
app.include_router(soil_router, prefix=settings.API_PREFIX)
app.include_router(satellite_router, prefix=settings.API_PREFIX)
app.include_router(recommendations_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "docs": f"{settings.API_PREFIX}/docs",
        "health": f"{settings.API_PREFIX}/health"
    }

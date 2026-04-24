import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .database import engine, Base
from .routers import auth, measurements, medications, users
from .scheduler import start_scheduler, stop_scheduler

Base.metadata.create_all(bind=engine)


def _run_migrations():
    """Adiciona colunas novas sem apagar dados existentes."""
    migrations = [
        "ALTER TABLE users ADD COLUMN reminder_time VARCHAR",
        "ALTER TABLE users ADD COLUMN med_reminder_enabled BOOLEAN DEFAULT 1",
    ]
    with engine.connect() as conn:
        for stmt in migrations:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                pass  # Coluna já existe — ignora


@asynccontextmanager
async def lifespan(app: FastAPI):
    _run_migrations()
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(
    title="SobrePressão API",
    description="API para monitoramento de pressão arterial",
    version="1.1.0",
    lifespan=lifespan,
)

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [o.strip() for o in allowed_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(measurements.router)
app.include_router(medications.router)
app.include_router(users.router)


@app.get("/", tags=["Status"])
def root():
    return {"status": "ok", "message": "SobrePressão API funcionando"}

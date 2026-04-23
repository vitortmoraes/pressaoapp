import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import auth, measurements

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PressaoApp API",
    description="API para monitoramento de pressão arterial",
    version="1.0.0",
)

# Em produção, defina ALLOWED_ORIGINS no Railway com a URL do Vercel
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


@app.get("/", tags=["Status"])
def root():
    return {"status": "ok", "message": "PressaoApp API funcionando"}

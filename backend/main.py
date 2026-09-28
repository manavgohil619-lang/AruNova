import threading
import sys
import os

# Add parent directory to sys.path if executed from backend folder
sys.path.insert(0, os.path.dirname(__file__))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from simulation import run_simulation_loop
from routers import device, telemetry, alerts, crops, analytics, health

# Lifespan context to manage background simulation thread
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and start simulation thread
    init_db()
    sim_thread = threading.Thread(target=run_simulation_loop, daemon=True)
    sim_thread.start()
    print("AruNova ColdHub backend initialized. Simulation engine running.")
    yield
    # Shutdown
    print("AruNova ColdHub backend shutting down.")

app = FastAPI(
    title="AruNova Solar Smart ColdHub API",
    description="Industrial IoT Monitoring API for Solar-Powered Modular Mini Cold Storage System",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend Vite dev server & production builds
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all module routers
app.include_router(device.router)
app.include_router(telemetry.router)
app.include_router(alerts.router)
app.include_router(crops.router)
app.include_router(analytics.router)
app.include_router(health.router)

@app.get("/")
def root():
    return {
        "project": "AruNova Solar Smart ColdHub",
        "team": "AruNova (Team ID: 144009)",
        "problemStatement": "SIH26005 - Solar-Powered Smart Mini Cold Storage System for Fresh Vegetables in NER",
        "status": "OPERATIONAL",
        "docsUrl": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

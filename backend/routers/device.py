from fastapi import APIRouter, HTTPException
from schemas import (
    DeviceStatus, EnvironmentData, EnergyData,
    CoolingData, SafetyData, DeviceConfigUpdate,
    SimulationControlRequest
)
from database import get_db
from simulation import simulation_engine

router = APIRouter(prefix="/api", tags=["device"])

@router.get("/device", response_model=DeviceStatus)
def get_device():
    return simulation_engine.get_device_data()

@router.post("/device/config")
def update_device_config(config: DeviceConfigUpdate):
    conn = get_db()
    cursor = conn.cursor()
    
    updates = []
    params = []
    if config.name is not None:
        updates.append("name = ?")
        params.append(config.name)
    if config.location is not None:
        updates.append("location = ?")
        params.append(config.location)
    if config.activeCropId is not None:
        updates.append("active_crop_id = ?")
        params.append(config.activeCropId)
    if config.batteryLowThreshold is not None:
        updates.append("battery_low_threshold = ?")
        params.append(config.batteryLowThreshold)
    if config.doorThresholdSeconds is not None:
        updates.append("door_threshold_sec = ?")
        params.append(config.doorThresholdSeconds)
        simulation_engine.door_threshold_sec = config.doorThresholdSeconds
    if config.refreshRateSeconds is not None:
        updates.append("refresh_rate_sec = ?")
        params.append(config.refreshRateSeconds)

    if updates:
        params.append("COLDHUB-001")
        query = f"UPDATE device_config SET {', '.join(updates)} WHERE id = ?"
        cursor.execute(query, params)
        conn.commit()
    conn.close()

    if config.activeCropId is not None:
        simulation_engine.load_active_crop()

    return {"status": "success", "message": "Device configuration updated"}

@router.get("/environment", response_model=EnvironmentData)
def get_environment():
    return simulation_engine.get_environment_data()

@router.get("/energy", response_model=EnergyData)
def get_energy():
    return simulation_engine.get_energy_data()

@router.get("/cooling", response_model=CoolingData)
def get_cooling():
    return simulation_engine.get_cooling_data()

@router.get("/safety", response_model=SafetyData)
def get_safety():
    return simulation_engine.get_safety_data()

@router.post("/simulation/control")
def control_simulation(req: SimulationControlRequest):
    if req.action == "START":
        simulation_engine.is_running = True
        return {"status": "success", "message": "Simulation running"}
    elif req.action == "STOP":
        simulation_engine.is_running = False
        return {"status": "success", "message": "Simulation paused"}
    elif req.action == "RESET":
        simulation_engine.is_running = True
        simulation_engine.set_scenario("NORMAL")
        return {"status": "success", "message": "Simulation reset to NORMAL"}
    elif req.action == "SCENARIO" and req.scenario:
        simulation_engine.is_running = True
        simulation_engine.set_scenario(req.scenario)
        return {"status": "success", "message": f"Scenario set to {req.scenario}"}
    else:
        raise HTTPException(status_code=400, detail="Invalid simulation control request")

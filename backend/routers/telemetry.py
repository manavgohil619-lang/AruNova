from fastapi import APIRouter
from typing import List, Dict, Any
from schemas import TelemetryPayload, TelemetryPoint
from database import get_db
from simulation import simulation_engine
from datetime import datetime, timezone

router = APIRouter(prefix="/api/telemetry", tags=["telemetry"])

@router.get("/latest")
def get_latest_telemetry() -> Dict[str, Any]:
    device = simulation_engine.get_device_data()
    env = simulation_engine.get_environment_data()
    energy = simulation_engine.get_energy_data()
    cooling = simulation_engine.get_cooling_data()
    safety = simulation_engine.get_safety_data()
    
    return {
        "device": device,
        "environment": env,
        "energy": energy,
        "cooling": cooling,
        "safety": safety,
        "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S")
    }

@router.get("/history")
def get_telemetry_history(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT timestamp, temperature, humidity, solar_power, load_power, battery_soc, battery_voltage, door_status, compressor_status
    FROM telemetry_history
    ORDER BY id ASC
    LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    history = []
    for r in rows:
        history.append({
            "timestamp": r["timestamp"],
            "temperature": r["temperature"],
            "humidity": r["humidity"],
            "solarPower": r["solar_power"],
            "loadPower": r["load_power"],
            "batterySOC": r["battery_soc"],
            "batteryVoltage": r["battery_voltage"],
            "doorStatus": r["door_status"],
            "compressorStatus": r["compressor_status"]
        })
    return history

@router.post("")
def ingest_esp32_telemetry(payload: TelemetryPayload):
    """
    ESP32-Ready telemetry ingestion endpoint.
    Accepts incoming sensor packet from ESP32, updates system state,
    and sets data source to LIVE HARDWARE if real hardware transmits.
    """
    with simulation_engine.lock:
        if payload.temperature is not None:
            simulation_engine.temperature = payload.temperature
        if payload.humidity is not None:
            simulation_engine.humidity = payload.humidity
            
        if payload.battery_soc is not None:
            simulation_engine.battery_soc = payload.battery_soc
        if payload.battery_voltage is not None:
            simulation_engine.battery_voltage = payload.battery_voltage
        if payload.battery_current is not None:
            simulation_engine.battery_current = payload.battery_current
            
        if payload.solar_power is not None:
            # Handle Watts vs kW
            simulation_engine.solar_power = payload.solar_power / 1000.0 if payload.solar_power > 10 else payload.solar_power
        if payload.load_power is not None:
            simulation_engine.load_power = payload.load_power / 1000.0 if payload.load_power > 10 else payload.load_power
            
        if payload.door_status is not None:
            simulation_engine.door_status = payload.door_status.upper()
        if payload.compressor is not None:
            simulation_engine.compressor_status = payload.compressor.upper()
        if payload.evaporator_fan is not None:
            simulation_engine.evaporator_fan_status = payload.evaporator_fan.upper()

        # Update data source in DB to LIVE HARDWARE
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("UPDATE device_config SET data_source = 'LIVE HARDWARE' WHERE id = 'COLDHUB-001'")
            now_pt = datetime.now(timezone.utc).strftime("%H:%M")
            cursor.execute("""
            INSERT INTO telemetry_history (timestamp, temperature, humidity, solar_power, load_power, battery_soc, battery_voltage, door_status, compressor_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                now_pt,
                simulation_engine.temperature,
                simulation_engine.humidity,
                simulation_engine.solar_power,
                simulation_engine.load_power,
                simulation_engine.battery_soc,
                simulation_engine.battery_voltage,
                simulation_engine.door_status,
                simulation_engine.compressor_status
            ))
            conn.commit()
            conn.close()
        except Exception:
            pass

    return {
        "status": "success",
        "message": "ESP32 telemetry ingested successfully",
        "deviceId": payload.device_id
    }

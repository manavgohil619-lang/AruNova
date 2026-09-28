from fastapi import APIRouter, HTTPException
from typing import List
from schemas import CropProfile
from database import get_db
from simulation import simulation_engine

router = APIRouter(prefix="/api/crops", tags=["crops"])

@router.get("", response_model=List[CropProfile])
def get_crop_profiles():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM crop_profiles")
    rows = cursor.fetchall()
    conn.close()
    
    return [
        CropProfile(
            id=r["id"],
            cropName=r["crop_name"],
            targetTemperature=r["target_temp"],
            targetHumidity=r["target_humidity"],
            temperatureMin=r["temp_min"],
            temperatureMax=r["temp_max"],
            humidityMin=r["humidity_min"],
            humidityMax=r["humidity_max"],
            storageDurationDays=r["storage_days"],
            notes=r["notes"] or ""
        )
        for r in rows
    ]

@router.post("", response_model=CropProfile)
def create_or_update_crop_profile(crop: CropProfile):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT OR REPLACE INTO crop_profiles 
    (id, crop_name, target_temp, target_humidity, temp_min, temp_max, humidity_min, humidity_max, storage_days, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        crop.id, crop.cropName, crop.targetTemperature, crop.targetHumidity,
        crop.temperatureMin, crop.temperatureMax, crop.humidityMin, crop.humidityMax,
        crop.storageDurationDays, crop.notes
    ))
    conn.commit()
    conn.close()

    # If this is the active crop, reload into simulation engine
    device_data = simulation_engine.get_device_data()
    if device_data.get("activeCropId") == crop.id:
        simulation_engine.load_active_crop()

    return crop

@router.post("/select/{crop_id}")
def select_active_crop(crop_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM crop_profiles WHERE id = ?", (crop_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Crop profile not found")
        
    cursor.execute("UPDATE device_config SET active_crop_id = ? WHERE id = 'COLDHUB-001'", (crop_id,))
    conn.commit()
    conn.close()

    # Update simulation engine
    simulation_engine.load_active_crop()

    return {"status": "success", "message": f"Active crop set to {crop_id}"}

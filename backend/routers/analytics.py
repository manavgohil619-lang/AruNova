from fastapi import APIRouter
from typing import Dict, Any, List
from database import get_db
from simulation import simulation_engine

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("")
def get_analytics(timeframe: str = "daily") -> Dict[str, Any]:
    # Compute or provide realistic prototype simulation metrics
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT AVG(temperature) as avg_temp, AVG(humidity) as avg_hum,
           AVG(solar_power) as avg_solar, AVG(load_power) as avg_load
    FROM telemetry_history
    """)
    row = cursor.fetchone()
    conn.close()

    avg_temp = round(row["avg_temp"], 1) if row and row["avg_temp"] else 3.2
    avg_hum = round(row["avg_hum"], 1) if row and row["avg_hum"] else 89.2
    
    # Calculate realistic engineering ratios
    # Stored load = 320 kg
    load_kg = 320.0
    energy_today = simulation_engine.cooling_energy_today + simulation_engine.aux_energy_today
    energy_per_kg = round(energy_today / max(1.0, load_kg), 3)  # kWh/kg
    
    solar_gen = max(0.1, simulation_engine.solar_energy_today)
    solar_fraction = round(min(100.0, (solar_gen / max(0.1, energy_today)) * 100), 1)

    # Hourly mock data for 24h trends (Daily / Weekly / Monthly views)
    hourly_trend = []
    base_hours = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"]
    for i, h in enumerate(base_hours):
        # Solar rises between 06:00 and 18:00
        solar_p = round(0.95 * (1.0 - abs(i - 6) / 5.0), 2) if 3 <= i <= 9 else 0.02
        load_p = round(0.55 + (0.1 if 4 <= i <= 8 else 0.0), 2)
        hourly_trend.append({
            "hour": h,
            "solarPower": max(0.0, solar_p),
            "loadPower": load_p,
            "temperature": round(3.1 + (0.3 if i in [5, 6, 7] else -0.1), 1),
            "humidity": round(89.0 + (1.2 if i % 2 == 0 else -0.8), 1),
            "batterySOC": round(max(55.0, min(95.0, 75.0 + (i - 4) * 3)), 1)
        })

    return {
        "status": "PROTOTYPE SIMULATION",
        "timeframe": timeframe,
        "environment": {
            "averageTemperature": f"{avg_temp}°C",
            "temperatureStability": "±0.4°C (Optimal)",
            "averageHumidity": f"{avg_hum}% RH",
            "excursionCount": 1
        },
        "energy": {
            "energyConsumptionToday": f"{round(energy_today, 2)} kWh",
            "energyPerKgStored": f"{energy_per_kg} kWh/kg",
            "solarContribution": f"{solar_fraction}%",
            "batteryUtilization": f"{simulation_engine.battery_soc}% (Nominal)"
        },
        "cooling": {
            "coolingRuntime": f"{simulation_engine.compressor_runtime_minutes} min",
            "temperatureExcursions": 1,
            "doorEventsToday": 4,
            "dutyCycle": "46%"
        },
        "system": {
            "systemUptime": "99.8%",
            "lastReboot": "7 days ago",
            "firmware": "v1.4.2-esp32"
        },
        "trendData": hourly_trend
    }

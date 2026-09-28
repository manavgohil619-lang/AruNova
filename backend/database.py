import sqlite3
import json
import os
from datetime import datetime, timezone, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), "coldhub.db")

DEFAULT_CROPS = [
    {
        "id": "leafy_veg",
        "cropName": "Leafy Vegetables",
        "targetTemperature": 3.0,
        "targetHumidity": 90.0,
        "temperatureMin": 1.5,
        "temperatureMax": 4.5,
        "humidityMin": 85.0,
        "humidityMax": 95.0,
        "storageDurationDays": 7,
        "notes": "Includes spinach, mustard greens, lai shak commonly grown in NER."
    },
    {
        "id": "tomato",
        "cropName": "Tomato",
        "targetTemperature": 12.0,
        "targetHumidity": 90.0,
        "temperatureMin": 10.0,
        "temperatureMax": 15.0,
        "humidityMin": 85.0,
        "humidityMax": 95.0,
        "storageDurationDays": 14,
        "notes": "Chilling sensitive; requires higher target temperature."
    },
    {
        "id": "carrot",
        "cropName": "Carrot",
        "targetTemperature": 1.0,
        "targetHumidity": 95.0,
        "temperatureMin": 0.0,
        "temperatureMax": 3.0,
        "humidityMin": 90.0,
        "humidityMax": 98.0,
        "storageDurationDays": 30,
        "notes": "High moisture requirement to maintain crispness."
    },
    {
        "id": "cabbage",
        "cropName": "Cabbage",
        "targetTemperature": 2.0,
        "targetHumidity": 92.0,
        "temperatureMin": 0.5,
        "temperatureMax": 4.0,
        "humidityMin": 88.0,
        "humidityMax": 96.0,
        "storageDurationDays": 21,
        "notes": "Good cold tolerance; sensitive to dehydration."
    },
    {
        "id": "mixed_veg",
        "cropName": "Mixed Vegetables",
        "targetTemperature": 4.0,
        "targetHumidity": 88.0,
        "temperatureMin": 2.0,
        "temperatureMax": 6.0,
        "humidityMin": 80.0,
        "humidityMax": 92.0,
        "storageDurationDays": 10,
        "notes": "Balanced multi-commodity compromise profile."
    }
]

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Device configuration
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS device_config (
        id TEXT PRIMARY KEY,
        name TEXT,
        location TEXT,
        active_crop_id TEXT,
        capacity_kg REAL,
        current_load_kg REAL,
        battery_low_threshold REAL,
        door_threshold_sec INTEGER,
        refresh_rate_sec INTEGER,
        data_source TEXT
    )
    """)
    
    # Crops
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS crop_profiles (
        id TEXT PRIMARY KEY,
        crop_name TEXT,
        target_temp REAL,
        target_humidity REAL,
        temp_min REAL,
        temp_max REAL,
        humidity_min REAL,
        humidity_max REAL,
        storage_days INTEGER,
        notes TEXT
    )
    """)
    
    # Alerts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        timestamp TEXT,
        type TEXT,
        severity TEXT,
        parameter TEXT,
        current_value TEXT,
        threshold TEXT,
        status TEXT,
        message TEXT
    )
    """)
    
    # Telemetry history (rolling window)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS telemetry_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        temperature REAL,
        humidity REAL,
        solar_power REAL,
        load_power REAL,
        battery_soc REAL,
        battery_voltage REAL,
        door_status TEXT,
        compressor_status TEXT
    )
    """)
    
    # Seed device config if not present
    cursor.execute("SELECT id FROM device_config WHERE id = 'COLDHUB-001'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO device_config VALUES (
            'COLDHUB-001', 'AruNova ColdHub Unit 1', 'NER Pilot Unit',
            'leafy_veg', 500.0, 320.0, 20.0, 30, 2, 'DEMO SIMULATION'
        )
        """)
        
    # Seed crops if not present
    cursor.execute("SELECT count(*) as count FROM crop_profiles")
    if cursor.fetchone()["count"] == 0:
        for crop in DEFAULT_CROPS:
            cursor.execute("""
            INSERT INTO crop_profiles VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                crop["id"], crop["cropName"], crop["targetTemperature"],
                crop["targetHumidity"], crop["temperatureMin"], crop["temperatureMax"],
                crop["humidityMin"], crop["humidityMax"], crop["storageDurationDays"],
                crop["notes"]
            ))

    # Seed initial alerts if empty
    cursor.execute("SELECT count(*) as count FROM alerts")
    if cursor.fetchone()["count"] == 0:
        now = datetime.now(timezone.utc)
        t1 = (now - timedelta(minutes=42)).strftime("%H:%M")
        t2 = (now - timedelta(minutes=15)).strftime("%H:%M")
        cursor.execute("""
        INSERT INTO alerts VALUES 
        ('ALT-101', ?, 'DOOR OPEN', 'NORMAL', 'Door Sensor', 'CLOSED', '30 sec', 'RESOLVED', 'Chamber door closed normally.'),
        ('ALT-102', ?, 'HIGH TEMPERATURE', 'WARNING', 'Chamber Temperature', '5.2°C', '4.5°C', 'ACTIVE', 'Temperature slightly exceeded upper threshold due to ambient loading.')
        """, (t1, t2))
        
    # Seed some history points if empty so charts have data immediately
    cursor.execute("SELECT count(*) as count FROM telemetry_history")
    if cursor.fetchone()["count"] == 0:
        now = datetime.now(timezone.utc)
        # Generate last 24 points (last 2 hours, 5 min intervals)
        for i in range(24, 0, -1):
            pt_time = (now - timedelta(minutes=i * 5)).strftime("%H:%M")
            # Base temperature gently hovering near 3.2°C
            temp = round(3.2 + (0.3 if i % 4 == 0 else -0.2 if i % 3 == 0 else 0.1), 1)
            hum = round(89.0 + (1.0 if i % 2 == 0 else -1.0), 1)
            solar = round(max(0.0, 0.85 + (0.1 if i % 5 == 0 else -0.1)), 2)
            load = round(0.58 + (0.05 if i % 3 == 0 else -0.04), 2)
            soc = round(78.0 - (i * 0.1), 1)
            cursor.execute("""
            INSERT INTO telemetry_history (timestamp, temperature, humidity, solar_power, load_power, battery_soc, battery_voltage, door_status, compressor_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'CLOSED', 'ON')
            """, (pt_time, temp, hum, solar, load, soc, 13.2))

    conn.commit()
    conn.close()

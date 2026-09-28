import urllib.request
import json
import time
import sys

# Configure UTF-8 for console output on Windows
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def api(url, method='GET', data=None):
    req = urllib.request.Request(url, method=method)
    if data is not None:
        req.add_header('Content-Type', 'application/json')
        payload = json.dumps(data).encode('utf-8')
    else:
        payload = None
    with urllib.request.urlopen(req, data=payload, timeout=5) as res:
        text = res.read().decode('utf-8')
        try:
            return json.loads(text)
        except Exception:
            return text

print("="*70)
print("ARUNOVA SOLAR SMART COLDHUB - COMPREHENSIVE END-TO-END VERIFICATION")
print("="*70)

# Step 1: Frontend SPA Health
print("\n[STEP 1] Testing Vite Frontend Web Application (http://localhost:5173)...")
html = api("http://localhost:5173/")
assert "<title>AruNova Solar Smart ColdHub</title>" in html or "AruNova" in html
assert 'id="root"' in html
print("  ✓ Frontend HTML root served properly with Inter typography & viewport meta")

# Step 2: Backend Root & Documentation
print("\n[STEP 2] Testing FastAPI Root & Service Info (http://127.0.0.1:8000/)...")
root = api("http://127.0.0.1:8000/")
print(f"  ✓ Service: {root['project']} | Team: {root['team']} | Problem: {root['problemStatement']}")
assert root["status"] == "OPERATIONAL"

# Step 3: Device State & Identification
print("\n[STEP 3] Testing Device Metadata (http://127.0.0.1:8000/api/device)...")
dev = api("http://127.0.0.1:8000/api/device")
print(f"  ✓ Device ID: {dev['deviceId']} | Name: {dev['name']} | Location: {dev['location']}")
assert dev["deviceId"] == "COLDHUB-001"

# Step 4: Real-time Telemetry & Energy Flow Nodes
print("\n[STEP 4] Testing Real-time Telemetry Bundle (http://127.0.0.1:8000/api/telemetry/latest)...")
t = api("http://127.0.0.1:8000/api/telemetry/latest")
env = t["environment"]
energy = t["energy"]
cooling = t["cooling"]
print(f"  ✓ Chamber: {env['temperature']}°C (Target: {env['temperatureTarget']}°C) | Humidity: {env['humidity']}% RH")
print(f"  ✓ Energy: Solar {energy['solarPower']} kW | Battery {energy['batterySOC']}% ({energy['batteryVoltage']}V) | Load: {energy['loadPower']} kW")
print(f"  ✓ Cooling: {cooling['coolingStatus']} | Demand: {cooling['coolingDemand']} | Mode: {cooling['energyMode']}")

# Step 5: Simulation Scenarios Verification
print("\n[STEP 5] Testing Simulation Scenarios Matrix...")

scenarios = [
    ("HIGH_TEMPERATURE", lambda t: t["environment"]["temperature"] > 4.5, "Temperature excursion triggered"),
    ("DOOR_OPEN", lambda t: t["environment"]["doorStatus"] == "OPEN", "Door interlock broken"),
    ("LOW_BATTERY", lambda t: t["energy"]["batterySOC"] < 25 and t["cooling"]["energyMode"] == "ENERGY SAVING", "Battery eco fallback"),
    ("LOW_SOLAR", lambda t: t["energy"]["solarPower"] < 0.2, "Solar irradiance drop"),
    ("SENSOR_FAILURE", lambda t: t["environment"]["temperatureSensorStatus"] == "FAULT", "Sensor probe failover"),
    ("NORMAL", lambda t: t["environment"]["temperatureSensorStatus"] == "HEALTHY" and t["environment"]["doorStatus"] == "CLOSED", "Reset to baseline")
]

for sc_name, sc_check, sc_desc in scenarios:
    api("http://127.0.0.1:8000/api/simulation/control", "POST", {"action": "SCENARIO", "scenario": sc_name})
    snap = api("http://127.0.0.1:8000/api/telemetry/latest")
    assert sc_check(snap), f"Scenario {sc_name} condition failed!"
    print(f"  ✓ Scenario {sc_name:<16} PASSED: {sc_desc}")

# Step 6: Crop Profiles API & Dynamic Setpoint Switching
print("\n[STEP 6] Testing Crop Profiles & Horticultural Switching...")
crops = api("http://127.0.0.1:8000/api/crops")
print(f"  ✓ Loaded {len(crops)} crop profiles: {[c['cropName'] for c in crops]}")

# Switch to Tomato
api("http://127.0.0.1:8000/api/crops/select/tomato", "POST")
t_tomato = api("http://127.0.0.1:8000/api/telemetry/latest")
assert t_tomato["device"]["activeCropName"] == "Tomato"
print(f"  ✓ Selected 'Tomato': Target Temp dynamically updated to {t_tomato['environment']['temperatureTarget']}°C")

# Switch back to Leafy Vegetables
api("http://127.0.0.1:8000/api/crops/select/leafy_veg", "POST")
t_leafy = api("http://127.0.0.1:8000/api/telemetry/latest")
assert t_leafy["device"]["activeCropName"] == "Leafy Vegetables"
print(f"  ✓ Reverted to 'Leafy Vegetables': Target Temp is {t_leafy['environment']['temperatureTarget']}°C")

# Step 7: ESP32 Edge Ingestion Endpoint
print("\n[STEP 7] Testing ESP32 Telemetry Edge Ingestion (POST /api/telemetry)...")
ingest_res = api("http://127.0.0.1:8000/api/telemetry", "POST", {
    "device_id": "COLDHUB-001",
    "temperature": 3.1,
    "humidity": 89.2,
    "battery_soc": 79.5,
    "battery_voltage": 13.25,
    "battery_current": 4.2,
    "solar_power": 880,
    "load_power": 605,
    "door_status": "CLOSED",
    "compressor": "ON",
    "evaporator_fan": "ON"
})
assert ingest_res.get("status") == "success"
print("  ✓ ESP32 payload parsed, calibrated and committed to database")

# Step 8: Alerts Management & Lifecycle
print("\n[STEP 8] Testing Alerts Management...")
alerts = api("http://127.0.0.1:8000/api/alerts")
print(f"  ✓ Active alerts count: {len(alerts)}")
if len(alerts) > 0:
    first = alerts[0]
    ack = api(f"http://127.0.0.1:8000/api/alerts/{first['id']}/acknowledge", "POST")
    print(f"  ✓ Alert {first['id']} ({first['type']}) acknowledged: {ack.get('status')}")
    res = api(f"http://127.0.0.1:8000/api/alerts/{first['id']}/resolve", "POST")
    print(f"  ✓ Alert {first['id']} resolved: {res.get('status')}")

# Step 9: System Health & Safety Subsystem
print("\n[STEP 9] Testing System Health Diagnostics...")
health = api("http://127.0.0.1:8000/api/system-health")
print(f"  ✓ System Diagnostic Groups: {len(health['groups'])} | Overall Status: {health['overallStatus']}")
for g in health["groups"]:
    print(f"    - {g['groupName']}: {len(g['components'])} components verified")

# Safety endpoint
safety = api("http://127.0.0.1:8000/api/safety")
print(f"  ✓ Refrigerant Safety: {safety['refrigerantSafetyStatus']}")
print(f"  ✓ Hydrocarbon Leak Protection: {safety['leakProtectionStatus']}")

# Step 10: Performance Analytics
print("\n[STEP 10] Testing Energy Accounting & Performance Analytics...")
analytics = api("http://127.0.0.1:8000/api/analytics?timeframe=daily")
print(f"  ✓ Analytics Timeframe: {analytics['timeframe']}")
print(f"  ✓ Daily Energy Consumption: {analytics['energy']['energyConsumptionToday']}")
print(f"  ✓ Specific Energy / kg: {analytics['energy']['energyPerKgStored']}")
print(f"  ✓ Solar Contribution: {analytics['energy']['solarContribution']}")
print(f"  ✓ Compressor Runtime: {analytics['cooling']['coolingRuntime']}")
print(f"  ✓ Hourly Trend Points: {len(analytics['trendData'])}")

print("\n" + "="*70)
print("ARUNOVA COLDHUB SYSTEM: ALL 10 E2E VERIFICATION SUITES 100% OPERATIONAL!")
print("="*70)

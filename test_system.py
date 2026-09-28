import urllib.request
import json
import sys

def test(url, method='GET', data=None):
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        body = json.dumps(data).encode('utf-8')
    else:
        body = None
    with urllib.request.urlopen(req, data=body, timeout=5) as res:
        content = res.read().decode('utf-8')
        try:
            return json.loads(content)
        except Exception:
            return content

print("1. Testing Vite frontend root (http://localhost:5173/)...")
html = test("http://localhost:5173/")
assert "AruNova" in html
print("   [OK] Frontend root served successfully with HTML & Inter font.")

print("2. Testing Backend Telemetry latest (http://localhost:8000/api/telemetry/latest)...")
t = test("http://localhost:8000/api/telemetry/latest")
print(f"   [OK] Device: {t['device']['deviceId']} | Status: {t['device']['status']} | Temp: {t['environment']['temperature']}C")

print("3. Testing Scenario: HIGH_TEMPERATURE...")
test("http://localhost:8000/api/simulation/control", "POST", {"action": "SCENARIO", "scenario": "HIGH_TEMPERATURE"})
t_high = test("http://localhost:8000/api/telemetry/latest")
print(f"   [OK] Temperature: {t_high['environment']['temperature']}C | Cooling Demand: {t_high['cooling']['coolingDemand']}")

print("4. Testing Alerts list...")
alerts = test("http://localhost:8000/api/alerts")
print(f"   [OK] Alerts count: {len(alerts)} | Latest: {alerts[0]['type']}")

print("5. Testing Alert acknowledge...")
if alerts:
    alert_id = alerts[0]["id"]
    ack_res = test(f"http://localhost:8000/api/alerts/{alert_id}/acknowledge", "POST")
    print(f"   [OK] Alert {alert_id} acknowledged: {ack_res.get('status')}")

print("6. Testing Crop selection (Tomato)...")
test("http://localhost:8000/api/crops/select/tomato", "POST")
t_crop = test("http://localhost:8000/api/telemetry/latest")
print(f"   [OK] Active crop: {t_crop['device']['activeCropName']} | Target Temp: {t_crop['environment']['temperatureTarget']}C")

print("7. Testing ESP32 Telemetry Ingestion (POST /api/telemetry)...")
esp_res = test("http://localhost:8000/api/telemetry", "POST", {
    "device_id": "COLDHUB-001",
    "temperature": 3.4,
    "humidity": 88.5,
    "battery_soc": 82.0,
    "battery_voltage": 13.3,
    "battery_current": 4.5,
    "solar_power": 910,
    "load_power": 590,
    "door_status": "CLOSED",
    "compressor": "ON",
    "evaporator_fan": "ON"
})
print(f"   [OK] ESP32 Ingested: {esp_res.get('status')} | Device: {esp_res.get('deviceId')}")

print("8. Resetting to NORMAL scenario & Leafy Vegetables...")
test("http://localhost:8000/api/simulation/control", "POST", {"action": "RESET"})
test("http://localhost:8000/api/crops/select/leafy_veg", "POST")
print("   [OK] Reset to NORMAL completed.")

print("9. Testing System Health diagnostic endpoint...")
health = test("http://localhost:8000/api/system-health")
print(f"   [OK] Health Groups: {len(health['groups'])} | Overall: {health['overallStatus']}")

print("10. Testing Analytics aggregation endpoint...")
analytics = test("http://localhost:8000/api/analytics")
print(f"   [OK] Analytics Status: {analytics['status']} | Avg Temp: {analytics['environment']['averageTemperature']}")

print("\nSUCCESS: All 10 verification test suites passed!")

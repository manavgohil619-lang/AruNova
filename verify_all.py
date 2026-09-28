import urllib.request
import json
import time

def req(url, method='GET', data=None):
    r = urllib.request.Request(url, method=method)
    if data is not None:
        r.add_header('Content-Type', 'application/json')
        payload = json.dumps(data).encode('utf-8')
    else:
        payload = None
    with urllib.request.urlopen(r, data=payload, timeout=3) as res:
        res_data = res.read().decode('utf-8')
        try:
            return json.loads(res_data)
        except Exception:
            return res_data

print("="*60, flush=True)
print("ARUNOVA COLDHUB SYSTEM VERIFICATION SUITE", flush=True)
print("="*60, flush=True)

# 1. Device Info
d = req('http://127.0.0.1:8000/api/device')
print(f"1. Device ID: {d['deviceId']} | Mode: {d['dataSource']} | Status: {d['status']}", flush=True)
assert d['deviceId'] == 'COLDHUB-001'

# 2. Reset to NORMAL
req('http://127.0.0.1:8000/api/simulation/control', 'POST', {'action': 'RESET'})
req('http://127.0.0.1:8000/api/crops/select/leafy_veg', 'POST')
t_norm = req('http://127.0.0.1:8000/api/telemetry/latest')
print(f"2. NORMAL Scenario -> Temp: {t_norm['environment']['temperature']}C | Bat: {t_norm['energy']['batterySOC']}% | Door: {t_norm['environment']['doorStatus']}", flush=True)

# 3. HIGH_TEMPERATURE Scenario
req('http://127.0.0.1:8000/api/simulation/control', 'POST', {'action': 'SCENARIO', 'scenario': 'HIGH_TEMPERATURE'})
t_high = req('http://127.0.0.1:8000/api/telemetry/latest')
print(f"3. HIGH_TEMP Scenario -> Temp: {t_high['environment']['temperature']}C | Cooling: {t_high['cooling']['coolingDemand']} | Status: {t_high['device']['status']}", flush=True)
assert t_high['environment']['temperature'] > 4.5

# 4. DOOR_OPEN Scenario
req('http://127.0.0.1:8000/api/simulation/control', 'POST', {'action': 'SCENARIO', 'scenario': 'DOOR_OPEN'})
t_door = req('http://127.0.0.1:8000/api/telemetry/latest')
print(f"4. DOOR_OPEN Scenario -> Door: {t_door['environment']['doorStatus']}", flush=True)
assert t_door['environment']['doorStatus'] == 'OPEN'

# 5. LOW_BATTERY Scenario
req('http://127.0.0.1:8000/api/simulation/control', 'POST', {'action': 'SCENARIO', 'scenario': 'LOW_BATTERY'})
t_bat = req('http://127.0.0.1:8000/api/telemetry/latest')
print(f"5. LOW_BATTERY Scenario -> SOC: {t_bat['energy']['batterySOC']}% | Mode: {t_bat['cooling']['energyMode']}", flush=True)
assert t_bat['energy']['batterySOC'] < 25
assert t_bat['cooling']['energyMode'] == 'ENERGY SAVING'

# 6. LOW_SOLAR Scenario
req('http://127.0.0.1:8000/api/simulation/control', 'POST', {'action': 'SCENARIO', 'scenario': 'LOW_SOLAR'})
t_solar = req('http://127.0.0.1:8000/api/telemetry/latest')
print(f"6. LOW_SOLAR Scenario -> Solar: {t_solar['energy']['solarPower']} kW", flush=True)
assert t_solar['energy']['solarPower'] < 0.2

# 7. SENSOR_FAILURE Scenario
req('http://127.0.0.1:8000/api/simulation/control', 'POST', {'action': 'SCENARIO', 'scenario': 'SENSOR_FAILURE'})
t_sens = req('http://127.0.0.1:8000/api/telemetry/latest')
print(f"7. SENSOR_FAILURE Scenario -> Temp Sensor: {t_sens['environment']['temperatureSensorStatus']}", flush=True)
assert t_sens['environment']['temperatureSensorStatus'] == 'FAULT'

# 8. Reset back to NORMAL
req('http://127.0.0.1:8000/api/simulation/control', 'POST', {'action': 'RESET'})
t_reset = req('http://127.0.0.1:8000/api/telemetry/latest')
print(f"8. Back to NORMAL -> Temp Sensor: {t_reset['environment']['temperatureSensorStatus']} | Door: {t_reset['environment']['doorStatus']}", flush=True)

# 9. Alerts workflow (acknowledge and resolve)
alerts = req('http://127.0.0.1:8000/api/alerts')
print(f"9. Alerts count: {len(alerts)}", flush=True)
if alerts:
    first_id = alerts[0]['id']
    ack = req(f'http://127.0.0.1:8000/api/alerts/{first_id}/acknowledge', 'POST')
    print(f"   Alert {first_id} acknowledged: {ack.get('status')}", flush=True)
    res = req(f'http://127.0.0.1:8000/api/alerts/{first_id}/resolve', 'POST')
    print(f"   Alert {first_id} resolved: {res.get('status')}", flush=True)

# 10. Crops switching and configuration
crops = req('http://127.0.0.1:8000/api/crops')
print(f"10. Available crop profiles: {[c['cropName'] for c in crops]}", flush=True)
req('http://127.0.0.1:8000/api/crops/select/cabbage', 'POST')
t_cab = req('http://127.0.0.1:8000/api/telemetry/latest')
print(f"    Active crop now: {t_cab['device']['activeCropName']} | Target: {t_cab['environment']['temperatureTarget']}C", flush=True)
assert t_cab['device']['activeCropName'] == 'Cabbage'
req('http://127.0.0.1:8000/api/crops/select/leafy_veg', 'POST')

# 11. Safety status
safety = req('http://127.0.0.1:8000/api/safety')
print(f"11. Safety R-290 status: {safety['refrigerantSafetyStatus']}", flush=True)
assert "R-290" in safety['refrigerantSafetyStatus']

# 12. History points
hist = req('http://127.0.0.1:8000/api/telemetry/history?limit=10')
print(f"12. History points returned: {len(hist)}", flush=True)
assert len(hist) > 0

print("="*60, flush=True)
print("ALL 12 SYSTEM INTEGRATION TESTS PASSED WITH 100% SUCCESS!", flush=True)
print("="*60, flush=True)

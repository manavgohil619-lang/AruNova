from fastapi import APIRouter
from schemas import SystemHealthResponse, HealthGroup, HealthComponent
from simulation import simulation_engine

router = APIRouter(prefix="/api", tags=["health"])

@router.get("/health")
def basic_health():
    return {
        "status": "ok",
        "service": "AruNova Solar Smart ColdHub Backend",
        "systemStatus": simulation_engine.get_overall_status(),
        "dataSource": "DEMO SIMULATION"
    }

@router.get("/system-health", response_model=SystemHealthResponse)
def get_system_health():
    env = simulation_engine.get_environment_data()
    energy = simulation_engine.get_energy_data()
    cooling = simulation_engine.get_cooling_data()
    safety = simulation_engine.get_safety_data()
    overall = simulation_engine.get_overall_status()

    # Dynamic status evaluation based on current simulation state
    temp_sensor_stat = env["temperatureSensorStatus"]
    door_stat = "WARNING" if env["doorOpenDuration"] > env["doorThreshold"] else "HEALTHY"
    battery_stat = "WARNING" if energy["batterySOC"] < 20.0 else "HEALTHY"
    solar_stat = "WARNING" if energy["solarPower"] < 0.1 else "HEALTHY"

    groups = [
        HealthGroup(
            groupName="POWER SYSTEM",
            components=[
                HealthComponent(name="Solar PV (1.2 kWp array)", status=solar_stat, detail=f"Array output: {energy['solarPower']} kW"),
                HealthComponent(name="MPPT Charge Controller", status="HEALTHY", detail="98.2% conversion efficiency"),
                HealthComponent(name="LiFePO4 Battery Bank", status=battery_stat, detail=f"SOC: {energy['batterySOC']}%, {energy['batteryVoltage']}V"),
                HealthComponent(name="Battery Management System (BMS)", status="HEALTHY", detail="Cell balance active, no overtemp"),
                HealthComponent(name="DC Protection / Surge Suppressor", status="HEALTHY", detail="SPD type II armed, fuses intact")
            ]
        ),
        HealthGroup(
            groupName="REFRIGERATION SYSTEM",
            components=[
                HealthComponent(name="Hermetic Compressor (R-290)", status="HEALTHY", detail=f"Status: {cooling['compressorStatus']}, Demand: {cooling['coolingDemand']}"),
                HealthComponent(name="Air-Cooled Condenser", status="HEALTHY", detail="Clean airflow, heat rejection nominal"),
                HealthComponent(name="Condenser Fan", status="HEALTHY", detail=f"Status: {cooling['condenserFanStatus']}"),
                HealthComponent(name="Thermostatic Expansion Valve", status="HEALTHY", detail="Superheat regulation stable"),
                HealthComponent(name="Evaporator Coil", status="HEALTHY", detail="No frosting, drain line clear"),
                HealthComponent(name="Evaporator Fan", status="HEALTHY", detail=f"Status: {cooling['evaporatorFanStatus']}")
            ]
        ),
        HealthGroup(
            groupName="SENSORS",
            components=[
                HealthComponent(name="Chamber Temperature Sensor", status=temp_sensor_stat, detail="NTC thermistor / PT100 calibrated"),
                HealthComponent(name="Relative Humidity Sensor", status=env["humiditySensorStatus"], detail="Capacitive digital hygrometer"),
                HealthComponent(name="Refrigerant Pressure Transducer", status="HEALTHY", detail="Suction & discharge within envelope"),
                HealthComponent(name="DC Current Sensor (Hall-effect)", status="HEALTHY", detail=f"Reading: {energy['batteryCurrent']} A"),
                HealthComponent(name="DC Bus Voltage Sensor", status="HEALTHY", detail=f"Reading: {energy['batteryVoltage']} V"),
                HealthComponent(name="Magnetic Door Interlock Switch", status=door_stat, detail=f"Door: {env['doorStatus']} (Duration: {env['doorOpenDuration']}s)")
            ]
        ),
        HealthGroup(
            groupName="CONTROLLER",
            components=[
                HealthComponent(name="ESP32 Dual-Core Microcontroller", status="HEALTHY", detail="Running FreeRTOS control tasks"),
                HealthComponent(name="Firmware Build", status="HEALTHY", detail="v1.4.2-esp32 (OTA capable)"),
                HealthComponent(name="Telemetry Dispatch Rate", status="HEALTHY", detail="2.0s transmission interval"),
                HealthComponent(name="Local Non-Volatile Flash Logging", status="HEALTHY", detail="Offline buffer: 0 frames queued")
            ]
        ),
        HealthGroup(
            groupName="COMMUNICATION",
            components=[
                HealthComponent(name="Wi-Fi Interface (802.11 b/g/n)", status="HEALTHY", detail="RSSI: -62 dBm (Strong)"),
                HealthComponent(name="GSM / 4G Cellular Fallback", status="HEALTHY", detail="SIM800L standby armed (NER coverage)"),
                HealthComponent(name="REST API Link", status="HEALTHY", detail="Latency: 12ms to monitoring service")
            ]
        ),
        HealthGroup(
            groupName="SAFETY & PROTECTION",
            components=[
                HealthComponent(name="R-290 refrigerant — safety monitored", status="HEALTHY", detail="Hydrocarbon sensor active in enclosure"),
                HealthComponent(name="Leak protection status", status=safety["leakProtectionStatus"], detail="Zero refrigerant ppm detected"),
                HealthComponent(name="High Pressure Limit Switch", status=safety["highPressure"], detail="Trip threshold: 24 bar (Cut-in: 18 bar)"),
                HealthComponent(name="Low Pressure Limit Switch", status=safety["lowPressure"], detail="Trip threshold: 0.5 bar"),
                HealthComponent(name="Thermal Overload Relay", status=safety["thermalProtection"], detail="Compressor shell < 75°C"),
                HealthComponent(name="Emergency Manual Stop", status=safety["emergencyStop"], detail="Mechanical contact closed"),
                HealthComponent(name="Chassis Earth Grounding", status=safety["earthing"], detail="Earthing resistance < 4 Ohms verified")
            ]
        )
    ]

    return SystemHealthResponse(
        overallStatus=overall,
        groups=groups
    )

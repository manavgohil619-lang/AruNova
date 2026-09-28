from typing import List, Optional
from pydantic import BaseModel, Field


class DeviceStatus(BaseModel):
    deviceId: str = "COLDHUB-001"
    name: str = "AruNova ColdHub Unit 1"
    location: str = "NER Pilot Unit"
    status: str = "NORMAL"  # NORMAL, WARNING, CRITICAL, OFFLINE
    connectivity: str = "ONLINE"  # ONLINE, OFFLINE, DEGRADED
    firmwareVersion: str = "v1.4.2-esp32"
    dataSource: str = "DEMO SIMULATION"  # "DEMO SIMULATION" or "LIVE HARDWARE"
    lastUpdated: str = ""
    capacityKg: float = 500.0
    currentLoadKg: float = 320.0
    activeCropId: str = "leafy_veg"
    activeCropName: str = "Leafy Vegetables"


class EnvironmentData(BaseModel):
    temperature: Optional[float] = 3.2
    humidity: Optional[float] = 89.0
    doorStatus: str = "CLOSED"  # "OPEN" or "CLOSED"
    doorOpenDuration: int = 0  # seconds
    doorThreshold: int = 30  # seconds
    temperatureSensorStatus: str = "HEALTHY"  # "HEALTHY", "FAULT", "UNAVAILABLE"
    humiditySensorStatus: str = "HEALTHY"  # "HEALTHY", "FAULT", "UNAVAILABLE"
    temperatureTarget: float = 3.0
    temperatureMin: float = 1.5
    temperatureMax: float = 4.5
    humidityTarget: float = 90.0
    humidityMin: float = 85.0
    humidityMax: float = 95.0


class EnergyData(BaseModel):
    solarPower: float = 0.85  # kW
    solarEnergyToday: float = 4.82  # kWh
    batterySOC: float = 78.0  # %
    batteryVoltage: float = 13.2  # V
    batteryCurrent: float = 4.1  # A
    loadPower: float = 0.61  # kW
    chargingState: str = "CHARGING"  # "CHARGING", "DISCHARGING", "FLOAT", "IDLE"
    pvCapacity: float = 1.2  # kWp
    coolingEnergyToday: float = 3.10  # kWh
    auxEnergyToday: float = 0.72  # kWh
    estimatedBackupRuntimeHours: float = 14.5  # hrs


class CoolingData(BaseModel):
    coolingStatus: str = "ON"  # "ON", "OFF"
    compressorStatus: str = "ON"  # "ON", "OFF"
    evaporatorFanStatus: str = "ON"  # "ON", "OFF"
    condenserFanStatus: str = "ON"  # "ON", "OFF"
    coolingDemand: str = "MEDIUM"  # "LOW", "MEDIUM", "HIGH", "NONE"
    controlMode: str = "AUTO"  # "AUTO", "MANUAL"
    energyMode: str = "SOLAR PRIORITY"  # "SOLAR PRIORITY", "ENERGY SAVING", "GRID BACKUP"
    compressorRuntimeMinutes: int = 142


class SafetyData(BaseModel):
    refrigerantLeak: bool = False
    refrigerantSafetyStatus: str = "R-290 refrigerant — safety monitored"
    leakProtectionStatus: str = "NORMAL"  # "NORMAL", "WARNING", "TRIGGERED"
    highPressure: str = "NORMAL"  # "NORMAL", "WARNING", "TRIPPED"
    lowPressure: str = "NORMAL"  # "NORMAL", "WARNING", "TRIPPED"
    thermalProtection: str = "NORMAL"  # "NORMAL", "ACTIVE"
    emergencyStop: str = "DISENGAGED"  # "DISENGAGED", "ENGAGED"
    earthing: str = "VERIFIED"  # "VERIFIED", "UNVERIFIED"
    fuseMcbStatus: str = "OK"  # "OK", "TRIPPED"


class CropProfile(BaseModel):
    id: str
    cropName: str
    targetTemperature: float
    targetHumidity: float
    temperatureMin: float
    temperatureMax: float
    humidityMin: float
    humidityMax: float
    storageDurationDays: int
    notes: str = ""


class AlertItem(BaseModel):
    id: str
    timestamp: str
    type: str
    severity: str  # "CRITICAL", "WARNING", "NORMAL"
    parameter: str
    currentValue: str
    threshold: str
    status: str  # "ACTIVE", "ACKNOWLEDGED", "RESOLVED"
    message: str


class HealthComponent(BaseModel):
    name: str
    status: str  # "HEALTHY", "WARNING", "OFFLINE", "FAULT"
    detail: str


class HealthGroup(BaseModel):
    groupName: str
    components: List[HealthComponent]


class SystemHealthResponse(BaseModel):
    overallStatus: str
    groups: List[HealthGroup]


class TelemetryPoint(BaseModel):
    timestamp: str
    temperature: Optional[float]
    humidity: Optional[float]
    solarPower: float
    loadPower: float
    batterySOC: float
    batteryVoltage: float
    doorStatus: str
    compressorStatus: str


class TelemetryPayload(BaseModel):
    device_id: str = "COLDHUB-001"
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    battery_soc: Optional[float] = None
    battery_voltage: Optional[float] = None
    battery_current: Optional[float] = None
    solar_power: Optional[float] = None  # in Watts or kW
    load_power: Optional[float] = None  # in Watts or kW
    door_status: Optional[str] = None  # "OPEN" or "CLOSED"
    compressor: Optional[str] = None  # "ON" or "OFF"
    evaporator_fan: Optional[str] = None  # "ON" or "OFF"
    pressure_status: Optional[str] = None


class DeviceConfigUpdate(BaseModel):
    deviceId: Optional[str] = None
    name: Optional[str] = None
    location: Optional[str] = None
    activeCropId: Optional[str] = None
    refreshRateSeconds: Optional[int] = 2
    batteryLowThreshold: Optional[float] = 20.0
    doorThresholdSeconds: Optional[int] = 30


class SimulationControlRequest(BaseModel):
    action: str  # "START", "STOP", "RESET", "SCENARIO"
    scenario: Optional[str] = None  # "NORMAL", "LOW_SOLAR", "HIGH_TEMPERATURE", "DOOR_OPEN", "LOW_BATTERY", "SENSOR_FAILURE"

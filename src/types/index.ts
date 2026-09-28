export type OverallStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
export type ConnectivityStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED';
export type DataSource = 'DEMO SIMULATION' | 'LIVE HARDWARE';
export type SensorStatus = 'HEALTHY' | 'FAULT' | 'UNAVAILABLE';
export type DoorStatus = 'OPEN' | 'CLOSED';
export type SwitchStatus = 'ON' | 'OFF';
export type CoolingDemand = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
export type ChargingState = 'CHARGING' | 'DISCHARGING' | 'FLOAT' | 'IDLE';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'NORMAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface DeviceStatusModel {
  deviceId: string;
  name: string;
  location: string;
  status: OverallStatus;
  connectivity: ConnectivityStatus;
  firmwareVersion: string;
  dataSource: DataSource;
  lastUpdated: string;
  capacityKg: number;
  currentLoadKg: number;
  activeCropId: string;
  activeCropName: string;
}

export interface EnvironmentDataModel {
  temperature: number | null;
  humidity: number | null;
  doorStatus: DoorStatus;
  doorOpenDuration: number;
  doorThreshold: number;
  temperatureSensorStatus: SensorStatus;
  humiditySensorStatus: SensorStatus;
  temperatureTarget: number;
  temperatureMin: number;
  temperatureMax: number;
  humidityTarget: number;
  humidityMin: number;
  humidityMax: number;
}

export interface EnergyDataModel {
  solarPower: number; // kW
  solarEnergyToday: number; // kWh
  batterySOC: number; // %
  batteryVoltage: number; // V
  batteryCurrent: number; // A
  loadPower: number; // kW
  chargingState: ChargingState;
  pvCapacity: number; // kWp (1.2)
  coolingEnergyToday: number;
  auxEnergyToday: number;
  estimatedBackupRuntimeHours: number;
}

export interface CoolingDataModel {
  coolingStatus: SwitchStatus;
  compressorStatus: SwitchStatus;
  evaporatorFanStatus: SwitchStatus;
  condenserFanStatus: SwitchStatus;
  coolingDemand: CoolingDemand;
  controlMode: 'AUTO' | 'MANUAL';
  energyMode: 'SOLAR PRIORITY' | 'ENERGY SAVING' | 'GRID BACKUP';
  compressorRuntimeMinutes: number;
}

export interface SafetyDataModel {
  refrigerantLeak: boolean;
  refrigerantSafetyStatus: string;
  leakProtectionStatus: string;
  highPressure: string;
  lowPressure: string;
  thermalProtection: string;
  emergencyStop: string;
  earthing: string;
  fuseMcbStatus: string;
}

export interface CropProfileModel {
  id: string;
  cropName: string;
  targetTemperature: number;
  targetHumidity: number;
  temperatureMin: number;
  temperatureMax: number;
  humidityMin: number;
  humidityMax: number;
  storageDurationDays: number;
  notes: string;
}

export interface AlertItemModel {
  id: string;
  timestamp: string;
  type: string;
  severity: AlertSeverity;
  parameter: string;
  currentValue: string;
  threshold: string;
  status: AlertStatus;
  message: string;
}

export interface HealthComponent {
  name: string;
  status: 'HEALTHY' | 'NORMAL' | 'WARNING' | 'OFFLINE' | 'FAULT' | 'UNAVAILABLE' | string;
  detail: string;
}

export interface HealthGroup {
  groupName: string;
  components: HealthComponent[];
}

export interface SystemHealthModel {
  overallStatus: string;
  groups: HealthGroup[];
}

export interface TelemetryPointModel {
  timestamp: string;
  temperature: number | null;
  humidity: number | null;
  solarPower: number;
  loadPower: number;
  batterySOC: number;
  batteryVoltage: number;
  doorStatus: DoorStatus;
  compressorStatus: SwitchStatus;
}

export interface AnalyticsTrendItem {
  hour: string;
  solarPower: number;
  loadPower: number;
  temperature: number;
  humidity: number;
  batterySOC: number;
}

export interface AnalyticsModel {
  status: string;
  timeframe: string;
  environment: {
    averageTemperature: string;
    temperatureStability: string;
    averageHumidity: string;
    excursionCount: number;
  };
  energy: {
    energyConsumptionToday: string;
    energyPerKgStored: string;
    solarContribution: string;
    batteryUtilization: string;
  };
  cooling: {
    coolingRuntime: string;
    temperatureExcursions: number;
    doorEventsToday: number;
    dutyCycle: string;
  };
  system: {
    systemUptime: string;
    lastReboot: string;
    firmware: string;
  };
  trendData: AnalyticsTrendItem[];
}

import { 
  DeviceStatusModel, EnvironmentDataModel, EnergyDataModel, 
  CoolingDataModel, SafetyDataModel, AlertItemModel, TelemetryPointModel 
} from '../types';
import { INITIAL_CROPS, INITIAL_ALERTS } from '../data/mockData';

class ClientSimulationEngine {
  private isRunning: boolean = true;
  private scenario: string = 'NORMAL';
  private stepCounter: number = 0;

  // State variables
  private temperature: number | null = 3.2;
  private humidity: number | null = 89.0;
  private solarPower: number = 0.85;
  private solarEnergyToday: number = 4.82;
  private loadPower: number = 0.61;
  private coolingEnergyToday: number = 3.10;
  private auxEnergyToday: number = 0.72;
  private batterySOC: number = 78.0;
  private batteryVoltage: number = 13.2;
  private batteryCurrent: number = 4.1;
  private chargingState: 'CHARGING' | 'DISCHARGING' | 'FLOAT' | 'IDLE' = 'CHARGING';

  private compressorStatus: 'ON' | 'OFF' = 'ON';
  private evaporatorFanStatus: 'ON' | 'OFF' = 'ON';
  private condenserFanStatus: 'ON' | 'OFF' = 'ON';
  private coolingDemand: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
  private compressorTimer: number = 15;
  private compressorRuntimeMinutes: number = 142;

  private doorStatus: 'OPEN' | 'CLOSED' = 'CLOSED';
  private doorOpenDuration: number = 0;
  private doorThreshold: number = 30;

  private tempSensorStatus: 'HEALTHY' | 'FAULT' | 'UNAVAILABLE' = 'HEALTHY';
  private humSensorStatus: 'HEALTHY' | 'FAULT' | 'UNAVAILABLE' = 'HEALTHY';

  private activeCropId: string = 'leafy_veg';
  private activeCropName: string = 'Leafy Vegetables';
  private targetTemp: number = 3.0;
  private tempMin: number = 1.5;
  private tempMax: number = 4.5;
  private targetHum: number = 90.0;
  private humMin: number = 85.0;
  private humMax: number = 95.0;

  private alerts: AlertItemModel[] = [...INITIAL_ALERTS];
  private alertCooldowns: Record<string, number> = {};
  private history: TelemetryPointModel[] = [];

  constructor() {
    this.initHistory();
  }

  private initHistory() {
    const now = new Date();
    for (let i = 24; i > 0; i--) {
      const d = new Date(now.getTime() - i * 5 * 60000);
      const timeStr = d.toTimeString().substring(0, 5);
      const temp = Number((3.2 + (i % 4 === 0 ? 0.3 : i % 3 === 0 ? -0.2 : 0.1)).toFixed(1));
      const hum = Number((89.0 + (i % 2 === 0 ? 1.0 : -1.0)).toFixed(1));
      const solar = Number(Math.max(0.0, 0.85 + (i % 5 === 0 ? 0.1 : -0.1)).toFixed(2));
      const load = Number((0.58 + (i % 3 === 0 ? 0.05 : -0.04)).toFixed(2));
      const soc = Number((78.0 - i * 0.1).toFixed(1));
      this.history.push({
        timestamp: timeStr,
        temperature: temp,
        humidity: hum,
        solarPower: solar,
        loadPower: load,
        batterySOC: soc,
        batteryVoltage: 13.2,
        doorStatus: 'CLOSED',
        compressorStatus: 'ON'
      });
    }
  }

  public setScenario(scenario: string) {
    this.scenario = scenario;
    if (scenario === 'NORMAL') {
      this.tempSensorStatus = 'HEALTHY';
      this.humSensorStatus = 'HEALTHY';
      this.doorStatus = 'CLOSED';
      this.doorOpenDuration = 0;
      if (this.batterySOC < 30) this.batterySOC = 75.0;
    } else if (scenario === 'DOOR_OPEN') {
      this.doorStatus = 'OPEN';
      this.doorOpenDuration = 0;
    } else if (scenario === 'HIGH_TEMPERATURE') {
      this.temperature = Number((this.tempMax + 1.8).toFixed(1));
      this.triggerAlert('HIGH TEMPERATURE', 'WARNING', 'Chamber Temperature', `${this.temperature}°C`, `${this.tempMax}°C`, `Chamber temperature exceeded upper threshold (${this.tempMax}°C). Cooling demand increased.`);
    } else if (scenario === 'LOW_BATTERY') {
      this.batterySOC = 17.5;
      this.triggerAlert('LOW BATTERY', 'WARNING', 'Battery SOC', '17.5%', '20.0%', 'Battery SOC is below 20%. System switched to ENERGY SAVING mode.');
    } else if (scenario === 'LOW_SOLAR') {
      this.solarPower = 0.08;
      this.triggerAlert('LOW SOLAR', 'WARNING', 'Solar PV', '0.08 kW', '0.30 kW', 'Solar irradiance low. System drawing from LiFePO4 battery bank.');
    } else if (scenario === 'SENSOR_FAILURE') {
      this.tempSensorStatus = 'FAULT';
      this.triggerAlert('SENSOR FAILURE', 'CRITICAL', 'Temperature Sensor', 'FAULT', 'Operational', 'Chamber temperature sensor signal lost. Fallback cooling cycle initiated.');
    }
  }

  public setCrop(cropId: string) {
    const crop = INITIAL_CROPS.find(c => c.id === cropId);
    if (crop) {
      this.activeCropId = crop.id;
      this.activeCropName = crop.cropName;
      this.targetTemp = crop.targetTemperature;
      this.tempMin = crop.temperatureMin;
      this.tempMax = crop.temperatureMax;
      this.targetHum = crop.targetHumidity;
      this.humMin = crop.humidityMin;
      this.humMax = crop.humidityMax;
    }
  }

  public triggerAlert(alertType: string, severity: 'CRITICAL' | 'WARNING' | 'NORMAL', param: string, val: string, thresh: string, msg: string) {
    const now = Date.now();
    const last = this.alertCooldowns[alertType] || 0;
    if (now - last < 45000) return;

    this.alertCooldowns[alertType] = now;
    const timeStr = new Date().toTimeString().substring(0, 5);
    const newAlert: AlertItemModel = {
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: timeStr,
      type: alertType,
      severity,
      parameter: param,
      currentValue: val,
      threshold: thresh,
      status: 'ACTIVE',
      message: msg
    };
    this.alerts = [newAlert, ...this.alerts];
  }

  public acknowledgeAlert(id: string) {
    this.alerts = this.alerts.map(a => a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a);
  }

  public resolveAlert(id: string) {
    this.alerts = this.alerts.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a);
  }

  public getAlerts(): AlertItemModel[] {
    return this.alerts;
  }

  public tick() {
    if (!this.isRunning) return;
    this.stepCounter++;
    this.compressorTimer++;

    // 1. Door dynamics
    if (this.scenario === 'DOOR_OPEN') {
      this.doorStatus = 'OPEN';
      this.doorOpenDuration += 2;
      if (this.temperature !== null) {
        this.temperature = Number(Math.min(14.0, this.temperature + 0.15).toFixed(1));
      }
      if (this.humidity !== null) {
        this.humidity = Number(Math.max(60.0, this.humidity - 0.4).toFixed(1));
      }
      if (this.doorOpenDuration > this.doorThreshold) {
        this.triggerAlert('DOOR OPEN TOO LONG', 'WARNING', 'Door Sensor', `${this.doorOpenDuration}s`, `${this.doorThreshold}s`, `Door open for ${this.doorOpenDuration} seconds. Loss of thermal insulation detected.`);
      }
    } else {
      this.doorStatus = 'CLOSED';
      this.doorOpenDuration = 0;
    }

    // 2. Sensor failure
    if (this.scenario === 'SENSOR_FAILURE') {
      this.tempSensorStatus = 'FAULT';
    } else {
      this.tempSensorStatus = 'HEALTHY';
      this.humSensorStatus = 'HEALTHY';
    }

    // 3. Cooling control hysteresis
    const currTemp = (this.tempSensorStatus === 'HEALTHY' && this.temperature !== null) ? this.temperature : 4.0;
    let coolingNeeded = false;

    if (currTemp > this.tempMax) {
      coolingNeeded = true;
      this.coolingDemand = 'HIGH';
    } else if (currTemp > this.targetTemp + 0.3) {
      coolingNeeded = true;
      this.coolingDemand = 'MEDIUM';
    } else if (currTemp <= this.targetTemp - 0.2) {
      coolingNeeded = false;
      this.coolingDemand = 'NONE';
    } else {
      coolingNeeded = (this.compressorStatus === 'ON');
      this.coolingDemand = coolingNeeded ? 'LOW' : 'NONE';
    }

    if (coolingNeeded && this.compressorStatus === 'OFF' && this.compressorTimer >= 4) {
      this.compressorStatus = 'ON';
      this.evaporatorFanStatus = 'ON';
      this.condenserFanStatus = 'ON';
      this.compressorTimer = 0;
    } else if (!coolingNeeded && this.compressorStatus === 'ON' && this.compressorTimer >= 4) {
      this.compressorStatus = 'OFF';
      this.condenserFanStatus = 'OFF';
      this.compressorTimer = 0;
    }

    if (this.compressorStatus === 'ON') {
      this.compressorRuntimeMinutes++;
      if (this.temperature !== null && this.scenario !== 'DOOR_OPEN') {
        if (this.temperature > this.targetTemp) {
          const stepDown = this.coolingDemand === 'HIGH' ? 0.1 : 0.05;
          this.temperature = Number(Math.max(this.targetTemp - 0.2, this.temperature - stepDown).toFixed(1));
        }
      }
    } else {
      if (this.temperature !== null && this.scenario !== 'DOOR_OPEN') {
        if (this.temperature < this.targetTemp + 0.8) {
          this.temperature = Number((this.temperature + 0.02).toFixed(1));
        }
      }
    }

    if (this.humidity !== null && this.scenario !== 'DOOR_OPEN') {
      const drift = (Math.random() - 0.5) * 0.4;
      this.humidity = Number(Math.max(this.humMin - 2, Math.min(this.humMax + 2, this.humidity + (this.targetHum - this.humidity) * 0.05 + drift)).toFixed(1));
    }

    // 4. Solar generation
    if (this.scenario === 'LOW_SOLAR') {
      this.solarPower = Number(Math.max(0.04, 0.08 + (Math.random() - 0.5) * 0.03).toFixed(2));
    } else {
      const baseSolar = 0.85;
      const fluctuation = (Math.sin(this.stepCounter * 0.1) * 0.08) + ((Math.random() - 0.5) * 0.04);
      this.solarPower = Number(Math.max(0.0, Math.min(1.15, baseSolar + fluctuation)).toFixed(2));
    }
    this.solarEnergyToday = Number((this.solarEnergyToday + (this.solarPower * 2 / 3600)).toFixed(3));

    // 5. Load power
    let baseLoad = 0.08;
    if (this.compressorStatus === 'ON') baseLoad += 0.45;
    if (this.evaporatorFanStatus === 'ON') baseLoad += 0.05;
    if (this.condenserFanStatus === 'ON') baseLoad += 0.06;
    this.loadPower = Number((baseLoad + (Math.random() - 0.5) * 0.02).toFixed(2));
    this.coolingEnergyToday = Number((this.coolingEnergyToday + (this.compressorStatus === 'ON' ? 0.45 : 0) * (2 / 3600)).toFixed(3));
    this.auxEnergyToday = Number((this.auxEnergyToday + 0.11 * (2 / 3600)).toFixed(3));

    // 6. Battery dynamics
    const netPower = this.solarPower - this.loadPower;
    if (this.scenario === 'LOW_BATTERY') {
      this.batterySOC = Number(Math.max(10.0, this.batterySOC - 0.08).toFixed(1));
    } else {
      const deltaSoc = (netPower * 2 / 3600) / 1.28 * 100;
      this.batterySOC = Number(Math.max(12.0, Math.min(100.0, this.batterySOC + deltaSoc)).toFixed(1));
    }

    if (this.batterySOC > 90) {
      this.batteryVoltage = Number((13.4 + (this.batterySOC - 90) * 0.02).toFixed(2));
    } else if (this.batterySOC > 20) {
      this.batteryVoltage = Number((13.1 + (this.batterySOC - 20) * 0.003).toFixed(2));
    } else {
      this.batteryVoltage = Number((12.0 + (this.batterySOC / 20) * 1.0).toFixed(2));
    }

    this.batteryCurrent = Number(((netPower * 1000) / Math.max(10.0, this.batteryVoltage)).toFixed(1));
    if (netPower > 0.05) this.chargingState = 'CHARGING';
    else if (netPower < -0.05) this.chargingState = 'DISCHARGING';
    else this.chargingState = 'FLOAT';

    // Store history
    if (this.stepCounter % 5 === 0) {
      const timeStr = new Date().toTimeString().substring(0, 5);
      this.history.push({
        timestamp: timeStr,
        temperature: this.tempSensorStatus === 'HEALTHY' ? this.temperature : null,
        humidity: this.humSensorStatus === 'HEALTHY' ? this.humidity : null,
        solarPower: this.solarPower,
        loadPower: this.loadPower,
        batterySOC: this.batterySOC,
        batteryVoltage: this.batteryVoltage,
        doorStatus: this.doorStatus,
        compressorStatus: this.compressorStatus
      });
      if (this.history.length > 50) this.history.shift();
    }
  }

  public getOverallStatus(): 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE' {
    if (this.tempSensorStatus !== 'HEALTHY' || this.humSensorStatus !== 'HEALTHY') return 'WARNING';
    if (this.batterySOC < 20.0) return 'WARNING';
    if (this.doorOpenDuration > this.doorThreshold) return 'WARNING';
    if (this.temperature !== null && (this.temperature > this.tempMax + 1.0 || this.temperature < this.tempMin - 1.0)) return 'WARNING';
    return 'NORMAL';
  }

  public getSnapshot() {
    const backupHours = Number(((this.batterySOC / 100 * 1.28) / Math.max(0.05, this.loadPower)).toFixed(1));
    const energyMode = this.batterySOC < 20 ? 'ENERGY SAVING' : 'SOLAR PRIORITY';

    const device: DeviceStatusModel = {
      deviceId: 'COLDHUB-001',
      name: 'AruNova ColdHub Unit 1',
      location: 'NER Pilot Unit',
      status: this.getOverallStatus(),
      connectivity: 'ONLINE',
      firmwareVersion: 'v1.4.2-esp32',
      dataSource: 'DEMO SIMULATION',
      lastUpdated: new Date().toTimeString().substring(0, 8) + ' UTC',
      capacityKg: 500.0,
      currentLoadKg: 320.0,
      activeCropId: this.activeCropId,
      activeCropName: this.activeCropName
    };

    const environment: EnvironmentDataModel = {
      temperature: this.tempSensorStatus === 'HEALTHY' ? this.temperature : null,
      humidity: this.humSensorStatus === 'HEALTHY' ? this.humidity : null,
      doorStatus: this.doorStatus,
      doorOpenDuration: this.doorOpenDuration,
      doorThreshold: this.doorThreshold,
      temperatureSensorStatus: this.tempSensorStatus,
      humiditySensorStatus: this.humSensorStatus,
      temperatureTarget: this.targetTemp,
      temperatureMin: this.tempMin,
      temperatureMax: this.tempMax,
      humidityTarget: this.targetHum,
      humidityMin: this.humMin,
      humidityMax: this.humMax
    };

    const energy: EnergyDataModel = {
      solarPower: this.solarPower,
      solarEnergyToday: this.solarEnergyToday,
      batterySOC: this.batterySOC,
      batteryVoltage: this.batteryVoltage,
      batteryCurrent: this.batteryCurrent,
      loadPower: this.loadPower,
      chargingState: this.chargingState,
      pvCapacity: 1.2,
      coolingEnergyToday: this.coolingEnergyToday,
      auxEnergyToday: this.auxEnergyToday,
      estimatedBackupRuntimeHours: backupHours
    };

    const cooling: CoolingDataModel = {
      coolingStatus: this.compressorStatus,
      compressorStatus: this.compressorStatus,
      evaporatorFanStatus: this.evaporatorFanStatus,
      condenserFanStatus: this.condenserFanStatus,
      coolingDemand: this.coolingDemand,
      controlMode: 'AUTO',
      energyMode,
      compressorRuntimeMinutes: this.compressorRuntimeMinutes
    };

    const safety: SafetyDataModel = {
      refrigerantLeak: false,
      refrigerantSafetyStatus: 'R-290 refrigerant — safety monitored',
      leakProtectionStatus: 'NORMAL',
      highPressure: 'NORMAL',
      lowPressure: 'NORMAL',
      thermalProtection: 'NORMAL',
      emergencyStop: 'DISENGAGED',
      earthing: 'VERIFIED',
      fuseMcbStatus: 'OK'
    };

    return { device, environment, energy, cooling, safety, history: this.history, alerts: this.alerts };
  }
}

export const clientSimulation = new ClientSimulationEngine();

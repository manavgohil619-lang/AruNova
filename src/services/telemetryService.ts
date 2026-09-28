import { 
  DeviceStatusModel, EnvironmentDataModel, EnergyDataModel, 
  CoolingDataModel, SafetyDataModel, AlertItemModel, 
  CropProfileModel, SystemHealthModel, AnalyticsModel, TelemetryPointModel 
} from '../types';
import { clientSimulation } from '../simulation/clientSimulation';
import { INITIAL_CROPS, INITIAL_HEALTH } from '../data/mockData';

export interface TelemetryBundle {
  device: DeviceStatusModel;
  environment: EnvironmentDataModel;
  energy: EnergyDataModel;
  cooling: CoolingDataModel;
  safety: SafetyDataModel;
  timestamp: string;
  isBackendConnected: boolean;
}

class TelemetryService {
  private isBackendConnected: boolean = false;
  private cropsCache: CropProfileModel[] = [...INITIAL_CROPS];

  public getBackendStatus(): boolean {
    return this.isBackendConnected;
  }

  public async getLatest(): Promise<TelemetryBundle> {
    try {
      const res = await fetch('/api/telemetry/latest', { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        this.isBackendConnected = true;
        return {
          device: data.device,
          environment: data.environment,
          energy: data.energy,
          cooling: data.cooling,
          safety: data.safety,
          timestamp: data.timestamp || new Date().toTimeString().substring(0, 8),
          isBackendConnected: true
        };
      }
    } catch {
      // Backend not accessible, use client simulation
    }

    this.isBackendConnected = false;
    clientSimulation.tick();
    const snap = clientSimulation.getSnapshot();
    return {
      device: snap.device,
      environment: snap.environment,
      energy: snap.energy,
      cooling: snap.cooling,
      safety: snap.safety,
      timestamp: new Date().toTimeString().substring(0, 8),
      isBackendConnected: false
    };
  }

  public async getHistory(): Promise<TelemetryPointModel[]> {
    if (this.isBackendConnected) {
      try {
        const res = await fetch('/api/telemetry/history');
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback below
      }
    }
    return clientSimulation.getSnapshot().history;
  }

  public async getAlerts(status?: string, severity?: string): Promise<AlertItemModel[]> {
    if (this.isBackendConnected) {
      try {
        let url = '/api/alerts';
        const params = new URLSearchParams();
        if (status && status !== 'ALL') params.append('status', status);
        if (severity && severity !== 'ALL') params.append('severity', severity);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        if (res.ok) {
          return await res.json();
        }
      } catch {
        // Fallback below
      }
    }

    let list = clientSimulation.getAlerts();
    if (status && status !== 'ALL') {
      list = list.filter(a => a.status === status);
    }
    if (severity && severity !== 'ALL') {
      list = list.filter(a => a.severity === severity);
    }
    return list;
  }

  public async acknowledgeAlert(id: string): Promise<boolean> {
    if (this.isBackendConnected) {
      try {
        const res = await fetch(`/api/alerts/${id}/acknowledge`, { method: 'POST' });
        if (res.ok) return true;
      } catch {}
    }
    clientSimulation.acknowledgeAlert(id);
    return true;
  }

  public async resolveAlert(id: string): Promise<boolean> {
    if (this.isBackendConnected) {
      try {
        const res = await fetch(`/api/alerts/${id}/resolve`, { method: 'POST' });
        if (res.ok) return true;
      } catch {}
    }
    clientSimulation.resolveAlert(id);
    return true;
  }

  public async getCrops(): Promise<CropProfileModel[]> {
    if (this.isBackendConnected) {
      try {
        const res = await fetch('/api/crops');
        if (res.ok) {
          const list = await res.json();
          this.cropsCache = list;
          return list;
        }
      } catch {}
    }
    return this.cropsCache;
  }

  public async selectCrop(cropId: string): Promise<boolean> {
    clientSimulation.setCrop(cropId);
    if (this.isBackendConnected) {
      try {
        const res = await fetch(`/api/crops/select/${cropId}`, { method: 'POST' });
        return res.ok;
      } catch {}
    }
    return true;
  }

  public async saveCrop(crop: CropProfileModel): Promise<boolean> {
    const idx = this.cropsCache.findIndex(c => c.id === crop.id);
    if (idx >= 0) {
      this.cropsCache[idx] = crop;
    } else {
      this.cropsCache.push(crop);
    }
    clientSimulation.setCrop(crop.id);

    if (this.isBackendConnected) {
      try {
        const res = await fetch('/api/crops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(crop)
        });
        return res.ok;
      } catch {}
    }
    return true;
  }

  public async getSystemHealth(): Promise<SystemHealthModel> {
    if (this.isBackendConnected) {
      try {
        const res = await fetch('/api/system-health');
        if (res.ok) {
          return await res.json();
        }
      } catch {}
    }
    // Generate dynamic health based on client snapshot
    const snap = clientSimulation.getSnapshot();
    const env = snap.environment;
    const energy = snap.energy;
    const doorStat = env.doorOpenDuration > env.doorThreshold ? 'WARNING' : 'HEALTHY';
    const batteryStat = energy.batterySOC < 20 ? 'WARNING' : 'HEALTHY';
    const solarStat = energy.solarPower < 0.1 ? 'WARNING' : 'HEALTHY';

    return {
      overallStatus: snap.device.status,
      groups: [
        {
          groupName: "POWER SYSTEM",
          components: [
            { name: "Solar PV (1.2 kWp array)", status: solarStat, detail: `Array output: ${energy.solarPower} kW` },
            { name: "MPPT Charge Controller", status: "HEALTHY", detail: "98.2% conversion efficiency" },
            { name: "LiFePO4 Battery Bank", status: batteryStat, detail: `SOC: ${energy.batterySOC}%, ${energy.batteryVoltage}V` },
            { name: "Battery Management System (BMS)", status: "HEALTHY", detail: "Cell balance active, no overtemp" },
            { name: "DC Protection / Surge Suppressor", status: "HEALTHY", detail: "SPD type II armed, fuses intact" }
          ]
        },
        {
          groupName: "REFRIGERATION SYSTEM",
          components: [
            { name: "Hermetic Compressor (R-290)", status: "HEALTHY", detail: `Status: ${snap.cooling.compressorStatus}, Demand: ${snap.cooling.coolingDemand}` },
            { name: "Air-Cooled Condenser", status: "HEALTHY", detail: "Clean airflow, heat rejection nominal" },
            { name: "Condenser Fan", status: "HEALTHY", detail: `Status: ${snap.cooling.condenserFanStatus}` },
            { name: "Thermostatic Expansion Valve", status: "HEALTHY", detail: "Superheat regulation stable" },
            { name: "Evaporator Coil", status: "HEALTHY", detail: "No frosting, drain line clear" },
            { name: "Evaporator Fan", status: "HEALTHY", detail: `Status: ${snap.cooling.evaporatorFanStatus}` }
          ]
        },
        {
          groupName: "SENSORS",
          components: [
            { name: "Chamber Temperature Sensor", status: env.temperatureSensorStatus, detail: "NTC thermistor / PT100 calibrated" },
            { name: "Relative Humidity Sensor", status: env.humiditySensorStatus, detail: "Capacitive digital hygrometer" },
            { name: "Refrigerant Pressure Transducer", status: "HEALTHY", detail: "Suction & discharge within envelope" },
            { name: "DC Current Sensor (Hall-effect)", status: "HEALTHY", detail: `Reading: ${energy.batteryCurrent} A` },
            { name: "DC Bus Voltage Sensor", status: "HEALTHY", detail: `Reading: ${energy.batteryVoltage} V` },
            { name: "Magnetic Door Interlock Switch", status: doorStat, detail: `Door: ${env.doorStatus} (Duration: ${env.doorOpenDuration}s)` }
          ]
        },
        {
          groupName: "CONTROLLER",
          components: [
            { name: "ESP32 Dual-Core Microcontroller", status: "HEALTHY", detail: "Running FreeRTOS control tasks" },
            { name: "Firmware Build", status: "HEALTHY", detail: "v1.4.2-esp32 (OTA capable)" },
            { name: "Telemetry Dispatch Rate", status: "HEALTHY", detail: "2.0s transmission interval" },
            { name: "Local Non-Volatile Flash Logging", status: "HEALTHY", detail: "Offline buffer: 0 frames queued" }
          ]
        },
        {
          groupName: "COMMUNICATION",
          components: [
            { name: "Wi-Fi Interface (802.11 b/g/n)", status: "HEALTHY", detail: "RSSI: -62 dBm (Strong)" },
            { name: "GSM / 4G Cellular Fallback", status: "HEALTHY", detail: "SIM800L standby armed (NER coverage)" },
            { name: "REST API Link", status: "HEALTHY", detail: "Latency: 12ms to monitoring service" }
          ]
        },
        {
          groupName: "SAFETY & PROTECTION",
          components: [
            { name: "R-290 refrigerant — safety monitored", status: "HEALTHY", detail: "Hydrocarbon sensor active in enclosure" },
            { name: "Leak protection status", status: snap.safety.leakProtectionStatus, detail: "Zero refrigerant ppm detected" },
            { name: "High Pressure Limit Switch", status: "HEALTHY", detail: "Trip threshold: 24 bar (Cut-in: 18 bar)" },
            { name: "Low Pressure Limit Switch", status: "HEALTHY", detail: "Trip threshold: 0.5 bar" },
            { name: "Thermal Overload Relay", status: "HEALTHY", detail: "Compressor shell < 75°C" },
            { name: "Emergency Manual Stop", status: "HEALTHY", detail: "Mechanical contact closed" },
            { name: "Chassis Earth Grounding", status: "HEALTHY", detail: "Earthing resistance < 4 Ohms verified" }
          ]
        }
      ]
    };
  }

  public async getAnalytics(timeframe: string = 'daily'): Promise<AnalyticsModel> {
    if (this.isBackendConnected) {
      try {
        const res = await fetch(`/api/analytics?timeframe=${timeframe}`);
        if (res.ok) {
          return await res.json();
        }
      } catch {}
    }

    const snap = clientSimulation.getSnapshot();
    const energyToday = Number((snap.energy.coolingEnergyToday + snap.energy.auxEnergyToday).toFixed(2));
    const energyPerKg = Number((energyToday / snap.device.currentLoadKg).toFixed(3));
    const solarContrib = Number((Math.min(100, (snap.energy.solarEnergyToday / Math.max(0.1, energyToday)) * 100)).toFixed(1));

    const hourlyTrend = [];
    const baseHours = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
    for (let i = 0; i < baseHours.length; i++) {
      const solarP = (i >= 3 && i <= 9) ? Number((0.95 * (1.0 - Math.abs(i - 6) / 5.0)).toFixed(2)) : 0.02;
      const loadP = Number((0.55 + (i >= 4 && i <= 8 ? 0.1 : 0)).toFixed(2));
      hourlyTrend.push({
        hour: baseHours[i],
        solarPower: Math.max(0, solarP),
        loadPower: loadP,
        temperature: Number((3.1 + (i === 5 || i === 6 || i === 7 ? 0.3 : -0.1)).toFixed(1)),
        humidity: Number((89.0 + (i % 2 === 0 ? 1.2 : -0.8)).toFixed(1)),
        batterySOC: Number(Math.max(55, Math.min(95, 75 + (i - 4) * 3)).toFixed(1))
      });
    }

    return {
      status: "PROTOTYPE SIMULATION",
      timeframe,
      environment: {
        averageTemperature: `${snap.environment.temperature ?? 3.2}°C`,
        temperatureStability: "±0.4°C (Optimal)",
        averageHumidity: `${snap.environment.humidity ?? 89.0}% RH`,
        excursionCount: 1
      },
      energy: {
        energyConsumptionToday: `${energyToday} kWh`,
        energyPerKgStored: `${energyPerKg} kWh/kg`,
        solarContribution: `${solarContrib}%`,
        batteryUtilization: `${snap.energy.batterySOC}% (Nominal)`
      },
      cooling: {
        coolingRuntime: `${snap.cooling.compressorRuntimeMinutes} min`,
        temperatureExcursions: 1,
        doorEventsToday: 4,
        dutyCycle: "46%"
      },
      system: {
        systemUptime: "99.8%",
        lastReboot: "7 days ago",
        firmware: "v1.4.2-esp32"
      },
      trendData: hourlyTrend
    };
  }

  public async triggerScenario(scenario: string): Promise<void> {
    clientSimulation.setScenario(scenario);
    if (this.isBackendConnected) {
      try {
        await fetch('/api/simulation/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SCENARIO', scenario })
        });
      } catch {}
    }
  }

  public async updateDeviceConfig(cfg: any): Promise<void> {
    if (cfg.activeCropId) {
      clientSimulation.setCrop(cfg.activeCropId);
    }
    if (this.isBackendConnected) {
      try {
        await fetch('/api/device/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cfg)
        });
      } catch {}
    }
  }
}

export const telemetryService = new TelemetryService();

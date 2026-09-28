import { CropProfileModel, AlertItemModel, SystemHealthModel } from '../types';

export const INITIAL_CROPS: CropProfileModel[] = [
  {
    id: "leafy_veg",
    cropName: "Leafy Vegetables",
    targetTemperature: 3.0,
    targetHumidity: 90.0,
    temperatureMin: 1.5,
    temperatureMax: 4.5,
    humidityMin: 85.0,
    humidityMax: 95.0,
    storageDurationDays: 7,
    notes: "Includes spinach, mustard greens, lai shak commonly grown in NER."
  },
  {
    id: "tomato",
    cropName: "Tomato",
    targetTemperature: 12.0,
    targetHumidity: 90.0,
    temperatureMin: 10.0,
    temperatureMax: 15.0,
    humidityMin: 85.0,
    humidityMax: 95.0,
    storageDurationDays: 14,
    notes: "Chilling sensitive; requires higher target temperature."
  },
  {
    id: "carrot",
    cropName: "Carrot",
    targetTemperature: 1.0,
    targetHumidity: 95.0,
    temperatureMin: 0.0,
    temperatureMax: 3.0,
    humidityMin: 90.0,
    humidityMax: 98.0,
    storageDurationDays: 30,
    notes: "High moisture requirement to maintain crispness."
  },
  {
    id: "cabbage",
    cropName: "Cabbage",
    targetTemperature: 2.0,
    targetHumidity: 92.0,
    temperatureMin: 0.5,
    temperatureMax: 4.0,
    humidityMin: 88.0,
    humidityMax: 96.0,
    storageDurationDays: 21,
    notes: "Good cold tolerance; sensitive to dehydration."
  },
  {
    id: "mixed_veg",
    cropName: "Mixed Vegetables",
    targetTemperature: 4.0,
    targetHumidity: 88.0,
    temperatureMin: 2.0,
    temperatureMax: 6.0,
    humidityMin: 80.0,
    humidityMax: 92.0,
    storageDurationDays: 10,
    notes: "Balanced multi-commodity compromise profile."
  }
];

export const INITIAL_ALERTS: AlertItemModel[] = [
  {
    id: "ALT-101",
    timestamp: "14:29",
    type: "DOOR OPEN",
    severity: "NORMAL",
    parameter: "Door Sensor",
    currentValue: "CLOSED",
    threshold: "30 sec",
    status: "RESOLVED",
    message: "Chamber door closed normally."
  },
  {
    id: "ALT-102",
    timestamp: "14:32",
    type: "HIGH TEMPERATURE",
    severity: "WARNING",
    parameter: "Chamber Temperature",
    currentValue: "5.2°C",
    threshold: "4.5°C",
    status: "ACTIVE",
    message: "Temperature slightly exceeded upper threshold due to ambient loading."
  }
];

export const INITIAL_HEALTH: SystemHealthModel = {
  overallStatus: "NORMAL",
  groups: [
    {
      groupName: "POWER SYSTEM",
      components: [
        { name: "Solar PV (1.2 kWp array)", status: "HEALTHY", detail: "Array output: 0.85 kW" },
        { name: "MPPT Charge Controller", status: "HEALTHY", detail: "98.2% conversion efficiency" },
        { name: "LiFePO4 Battery Bank", status: "HEALTHY", detail: "SOC: 78%, 13.2V" },
        { name: "Battery Management System (BMS)", status: "HEALTHY", detail: "Cell balance active, no overtemp" },
        { name: "DC Protection / Surge Suppressor", status: "HEALTHY", detail: "SPD type II armed, fuses intact" }
      ]
    },
    {
      groupName: "REFRIGERATION SYSTEM",
      components: [
        { name: "Hermetic Compressor (R-290)", status: "HEALTHY", detail: "Status: ON, Demand: MEDIUM" },
        { name: "Air-Cooled Condenser", status: "HEALTHY", detail: "Clean airflow, heat rejection nominal" },
        { name: "Condenser Fan", status: "HEALTHY", detail: "Status: ON" },
        { name: "Thermostatic Expansion Valve", status: "HEALTHY", detail: "Superheat regulation stable" },
        { name: "Evaporator Coil", status: "HEALTHY", detail: "No frosting, drain line clear" },
        { name: "Evaporator Fan", status: "HEALTHY", detail: "Status: ON" }
      ]
    },
    {
      groupName: "SENSORS",
      components: [
        { name: "Chamber Temperature Sensor", status: "HEALTHY", detail: "NTC thermistor / PT100 calibrated" },
        { name: "Relative Humidity Sensor", status: "HEALTHY", detail: "Capacitive digital hygrometer" },
        { name: "Refrigerant Pressure Transducer", status: "HEALTHY", detail: "Suction & discharge within envelope" },
        { name: "DC Current Sensor (Hall-effect)", status: "HEALTHY", detail: "Reading: 4.1 A" },
        { name: "DC Bus Voltage Sensor", status: "HEALTHY", detail: "Reading: 13.2 V" },
        { name: "Magnetic Door Interlock Switch", status: "HEALTHY", detail: "Door: CLOSED (Duration: 0s)" }
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
        { name: "Leak protection status", status: "NORMAL", detail: "Zero refrigerant ppm detected" },
        { name: "High Pressure Limit Switch", status: "HEALTHY", detail: "Trip threshold: 24 bar (Cut-in: 18 bar)" },
        { name: "Low Pressure Limit Switch", status: "HEALTHY", detail: "Trip threshold: 0.5 bar" },
        { name: "Thermal Overload Relay", status: "HEALTHY", detail: "Compressor shell < 75°C" },
        { name: "Emergency Manual Stop", status: "HEALTHY", detail: "Mechanical contact closed" },
        { name: "Chassis Earth Grounding", status: "HEALTHY", detail: "Earthing resistance < 4 Ohms verified" }
      ]
    }
  ]
};

import time
import math
import random
import threading
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from database import get_db

class SimulationEngine:
    def __init__(self):
        self.lock = threading.Lock()
        self.is_running = True
        self.scenario = "NORMAL"  # NORMAL, LOW_SOLAR, HIGH_TEMPERATURE, DOOR_OPEN, LOW_BATTERY, SENSOR_FAILURE
        self.step_counter = 0

        # State variables
        self.temperature = 3.2
        self.humidity = 89.0
        self.solar_power = 0.85  # kW
        self.solar_energy_today = 4.82  # kWh
        self.load_power = 0.61  # kW
        self.cooling_energy_today = 3.10  # kWh
        self.aux_energy_today = 0.72  # kWh
        self.battery_soc = 78.0  # %
        self.battery_voltage = 13.2  # V
        self.battery_current = 4.1  # A
        
        # Cooling state
        self.compressor_status = "ON"
        self.evaporator_fan_status = "ON"
        self.condenser_fan_status = "ON"
        self.cooling_demand = "MEDIUM"
        self.compressor_timer = 15  # ticks active/inactive for hysteresis protection
        self.compressor_runtime_minutes = 142
        
        # Door state
        self.door_status = "CLOSED"
        self.door_open_duration = 0
        self.door_threshold_sec = 30
        
        # Sensors
        self.temp_sensor_status = "HEALTHY"
        self.hum_sensor_status = "HEALTHY"
        self.pressure_sensor_status = "HEALTHY"
        
        # Crop targets (from active crop, defaults to leafy_veg)
        self.target_temp = 3.0
        self.temp_min = 1.5
        self.temp_max = 4.5
        self.target_hum = 90.0
        self.hum_min = 85.0
        self.hum_max = 95.0
        
        # Alert cooldown tracker: {alert_type: last_timestamp_generated}
        self.alert_cooldowns: Dict[str, float] = {}

    def load_active_crop(self):
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT active_crop_id FROM device_config WHERE id = 'COLDHUB-001'")
            row = cursor.fetchone()
            crop_id = row["active_crop_id"] if row else "leafy_veg"
            
            cursor.execute("SELECT * FROM crop_profiles WHERE id = ?", (crop_id,))
            crop_row = cursor.fetchone()
            if crop_row:
                self.target_temp = crop_row["target_temp"]
                self.temp_min = crop_row["temp_min"]
                self.temp_max = crop_row["temp_max"]
                self.target_hum = crop_row["target_humidity"]
                self.hum_min = crop_row["humidity_min"]
                self.hum_max = crop_row["humidity_max"]
            conn.close()
        except Exception:
            pass

    def set_scenario(self, scenario: str):
        with self.lock:
            self.scenario = scenario
            if scenario == "NORMAL":
                self.temp_sensor_status = "HEALTHY"
                self.hum_sensor_status = "HEALTHY"
                self.door_status = "CLOSED"
                self.door_open_duration = 0
                if self.battery_soc < 30:
                    self.battery_soc = 75.0
            elif scenario == "DOOR_OPEN":
                self.door_status = "OPEN"
                self.door_open_duration = 0
            elif scenario == "HIGH_TEMPERATURE":
                self.temperature = round(self.temp_max + 1.8, 1)
                self.trigger_alert("HIGH TEMPERATURE", "WARNING", "Chamber Temperature", f"{self.temperature}°C", f"{self.temp_max}°C", f"Chamber temperature exceeded upper threshold ({self.temp_max}°C). Cooling demand increased.")
            elif scenario == "LOW_BATTERY":
                self.battery_soc = 17.5
                self.trigger_alert("LOW BATTERY", "WARNING", "Battery SOC", "17.5%", "20.0%", "Battery SOC is below 20%. System switched to ENERGY SAVING mode.")
            elif scenario == "LOW_SOLAR":
                self.solar_power = 0.08
                self.trigger_alert("LOW SOLAR", "WARNING", "Solar PV", "0.08 kW", "0.30 kW", "Solar irradiance low. System drawing from LiFePO4 battery bank.")
            elif scenario == "SENSOR_FAILURE":
                self.temp_sensor_status = "FAULT"
                self.trigger_alert("SENSOR FAILURE", "CRITICAL", "Temperature Sensor", "FAULT", "Operational", "Chamber temperature sensor signal lost. Fallback cooling cycle initiated.")

    def trigger_alert(self, alert_type: str, severity: str, param: str, val: str, thresh: str, msg: str):
        now_ts = time.time()
        last = self.alert_cooldowns.get(alert_type, 0)
        # Avoid generating duplicate active alerts within 45 seconds
        if now_ts - last < 45:
            return
        
        self.alert_cooldowns[alert_type] = now_ts
        now_str = datetime.now(timezone.utc).strftime("%H:%M")
        alert_id = f"ALT-{random.randint(1000, 9999)}"
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO alerts (id, timestamp, type, severity, parameter, current_value, threshold, status, message)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
            """, (alert_id, now_str, alert_type, severity, param, val, thresh, msg))
            conn.commit()
            conn.close()
        except Exception:
            pass

    def tick(self):
        with self.lock:
            self.step_counter += 1
            self.compressor_timer += 1
            
            # --- 1. Environment & Door Dynamics ---
            if self.scenario == "DOOR_OPEN":
                self.door_status = "OPEN"
                self.door_open_duration += 2
                # Gradually warm up chamber (ambient warm air entering)
                if self.temperature is not None:
                    self.temperature = round(min(14.0, self.temperature + 0.15), 1)
                if self.humidity is not None:
                    self.humidity = round(max(60.0, self.humidity - 0.4), 1)
                if self.door_open_duration > self.door_threshold_sec:
                    self.trigger_alert("DOOR OPEN TOO LONG", "WARNING", "Door Sensor", f"{self.door_open_duration}s", f"{self.door_threshold_sec}s", f"Door has been open for {self.door_open_duration} seconds. Loss of thermal insulation detected.")
            else:
                self.door_status = "CLOSED"
                self.door_open_duration = 0
                
            # --- 2. Sensor Failure Dynamics ---
            if self.scenario == "SENSOR_FAILURE":
                self.temp_sensor_status = "FAULT"
            else:
                self.temp_sensor_status = "HEALTHY"
                self.hum_sensor_status = "HEALTHY"

            # --- 3. Cooling Control Logic with Hysteresis ---
            curr_temp = self.temperature if (self.temp_sensor_status == "HEALTHY" and self.temperature is not None) else 4.0
            
            if curr_temp > self.temp_max:
                cooling_needed = True
                self.cooling_demand = "HIGH"
            elif curr_temp > self.target_temp + 0.3:
                cooling_needed = True
                self.cooling_demand = "MEDIUM"
            elif curr_temp <= self.target_temp - 0.2:
                cooling_needed = False
                self.cooling_demand = "NONE"
            else:
                # In between target and max: keep current compressor state (hysteresis)
                cooling_needed = (self.compressor_status == "ON")
                self.cooling_demand = "LOW" if cooling_needed else "NONE"

            # Minimum 4 ticks ON / OFF protection to prevent short cycling
            if cooling_needed and self.compressor_status == "OFF" and self.compressor_timer >= 4:
                self.compressor_status = "ON"
                self.evaporator_fan_status = "ON"
                self.condenser_fan_status = "ON"
                self.compressor_timer = 0
            elif not cooling_needed and self.compressor_status == "ON" and self.compressor_timer >= 4:
                self.compressor_status = "OFF"
                self.condenser_fan_status = "OFF"
                # Evaporator fan may circulate air for 2 more ticks
                self.compressor_timer = 0
                
            if self.compressor_status == "ON":
                self.compressor_runtime_minutes += 1
                # If cooling is ON, temperature decreases towards target
                if self.temperature is not None and self.scenario != "DOOR_OPEN":
                    if self.temperature > self.target_temp:
                        step_down = 0.1 if self.cooling_demand == "HIGH" else 0.05
                        self.temperature = round(max(self.target_temp - 0.2, self.temperature - step_down), 1)
            else:
                # If cooling is OFF and door is closed, very slow thermal infiltration
                if self.temperature is not None and self.scenario != "DOOR_OPEN":
                    if self.temperature < self.target_temp + 0.8:
                        self.temperature = round(self.temperature + 0.02, 1)

            # High temperature alert check
            if self.temperature is not None and self.temperature > self.temp_max:
                self.trigger_alert("HIGH TEMPERATURE", "WARNING", "Chamber Temperature", f"{self.temperature}°C", f"{self.temp_max}°C", f"Temperature ({self.temperature}°C) above safe profile ceiling ({self.temp_max}°C).")

            # Humidity slight natural drift around target
            if self.humidity is not None and self.scenario != "DOOR_OPEN":
                hum_target = self.target_hum
                drift = (random.random() - 0.5) * 0.4
                self.humidity = round(max(self.hum_min - 2, min(self.hum_max + 2, self.humidity + (hum_target - self.humidity) * 0.05 + drift)), 1)

            # --- 4. Solar Generation Logic (1.2 kWp Prototype) ---
            if self.scenario == "LOW_SOLAR":
                self.solar_power = round(max(0.04, 0.08 + (random.random() - 0.5) * 0.03), 2)
            else:
                # Diurnal simulation or daytime realistic hovering around 0.80 - 0.95 kW
                # Small realistic cloud variations
                base_solar = 0.85
                fluctuation = (math.sin(self.step_counter * 0.1) * 0.08) + ((random.random() - 0.5) * 0.04)
                self.solar_power = round(max(0.0, min(1.15, base_solar + fluctuation)), 2)

            self.solar_energy_today = round(self.solar_energy_today + (self.solar_power * 2 / 3600.0), 3)

            # --- 5. Power Load Logic ---
            # Compressor: ~450W, Evaporator fan: ~50W, Condenser fan: ~60W, ESP32 + IoT Sensors: ~15W
            base_load = 0.08  # IoT controller, BMS, sensors, indicators
            if self.compressor_status == "ON":
                base_load += 0.45
            if self.evaporator_fan_status == "ON":
                base_load += 0.05
            if self.condenser_fan_status == "ON":
                base_load += 0.06
                
            self.load_power = round(base_load + (random.random() - 0.5) * 0.02, 2)
            cooling_delta = (0.45 if self.compressor_status == "ON" else 0.0) * (2 / 3600.0)
            self.cooling_energy_today = round(self.cooling_energy_today + cooling_delta, 3)
            self.aux_energy_today = round(self.aux_energy_today + (0.11 * 2 / 3600.0), 3)

            # --- 6. LiFePO4 Battery Dynamics ---
            # Net power in kW
            net_power = self.solar_power - self.load_power
            
            if self.scenario == "LOW_BATTERY":
                # Force discharge or slow drain
                self.battery_soc = round(max(10.0, self.battery_soc - 0.08), 1)
            else:
                # 1 kWh ~ 83 Ah at 12V; 100Ah battery ~ 1.28 kWh capacity
                # In 2 seconds, delta_soc = (net_power * 2 / 3600) / 1.28 * 100
                delta_soc = (net_power * 2 / 3600.0) / 1.28 * 100
                self.battery_soc = round(max(12.0, min(100.0, self.battery_soc + delta_soc)), 1)

            # Voltage curve for 4S LiFePO4 (12.8V nominal, 13.6V charging, 12.0V depleted)
            if self.battery_soc > 90:
                self.battery_voltage = round(13.4 + (self.battery_soc - 90) * 0.02, 2)
            elif self.battery_soc > 20:
                self.battery_voltage = round(13.1 + (self.battery_soc - 20) * 0.003, 2)
            else:
                self.battery_voltage = round(12.0 + (self.battery_soc / 20.0) * 1.0, 2)

            # Current (A) = Net_Watts / Voltage
            self.battery_current = round((net_power * 1000.0) / max(10.0, self.battery_voltage), 1)

            if net_power > 0.05:
                self.charging_state = "CHARGING"
            elif net_power < -0.05:
                self.charging_state = "DISCHARGING"
            else:
                self.charging_state = "FLOAT"

            # Check low battery alert
            if self.battery_soc < 20.0:
                self.trigger_alert("LOW BATTERY", "WARNING", "Battery SOC", f"{self.battery_soc}%", "20.0%", f"Battery SOC is critically low ({self.battery_soc}%).")

            # Store periodic point in database every 10 ticks (~20s)
            if self.step_counter % 10 == 0:
                try:
                    conn = get_db()
                    cur = conn.cursor()
                    now_pt = datetime.now(timezone.utc).strftime("%H:%M")
                    cur.execute("""
                    INSERT INTO telemetry_history (timestamp, temperature, humidity, solar_power, load_power, battery_soc, battery_voltage, door_status, compressor_status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        now_pt,
                        self.temperature if self.temp_sensor_status == "HEALTHY" else None,
                        self.humidity if self.hum_sensor_status == "HEALTHY" else None,
                        self.solar_power,
                        self.load_power,
                        self.battery_soc,
                        self.battery_voltage,
                        self.door_status,
                        self.compressor_status
                    ))
                    # Prune history to last 100 points
                    cur.execute("""
                    DELETE FROM telemetry_history WHERE id NOT IN (
                        SELECT id FROM telemetry_history ORDER BY id DESC LIMIT 100
                    )
                    """)
                    conn.commit()
                    conn.close()
                except Exception:
                    pass

    def get_overall_status(self) -> str:
        if self.temp_sensor_status != "HEALTHY" or self.hum_sensor_status != "HEALTHY":
            return "WARNING"
        if self.battery_soc < 20.0:
            return "WARNING"
        if self.door_open_duration > self.door_threshold_sec:
            return "WARNING"
        if self.temperature is not None and (self.temperature > self.temp_max + 1.0 or self.temperature < self.temp_min - 1.0):
            return "WARNING"
        return "NORMAL"

    def get_device_data(self) -> Dict[str, Any]:
        with self.lock:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM device_config WHERE id = 'COLDHUB-001'")
            cfg = cursor.fetchone()
            crop_name = "Leafy Vegetables"
            if cfg and cfg["active_crop_id"]:
                cursor.execute("SELECT crop_name FROM crop_profiles WHERE id = ?", (cfg["active_crop_id"],))
                cr = cursor.fetchone()
                if cr:
                    crop_name = cr["crop_name"]
            conn.close()

            now_str = datetime.now(timezone.utc).strftime("%H:%M:%S UTC")
            return {
                "deviceId": cfg["id"] if cfg else "COLDHUB-001",
                "name": cfg["name"] if cfg else "AruNova ColdHub Unit 1",
                "location": cfg["location"] if cfg else "NER Pilot Unit",
                "status": self.get_overall_status(),
                "connectivity": "ONLINE",
                "firmwareVersion": "v1.4.2-esp32",
                "dataSource": cfg["data_source"] if cfg else "DEMO SIMULATION",
                "lastUpdated": now_str,
                "capacityKg": cfg["capacity_kg"] if cfg else 500.0,
                "currentLoadKg": cfg["current_load_kg"] if cfg else 320.0,
                "activeCropId": cfg["active_crop_id"] if cfg else "leafy_veg",
                "activeCropName": crop_name
            }

    def get_environment_data(self) -> Dict[str, Any]:
        with self.lock:
            return {
                "temperature": self.temperature if self.temp_sensor_status == "HEALTHY" else None,
                "humidity": self.humidity if self.hum_sensor_status == "HEALTHY" else None,
                "doorStatus": self.door_status,
                "doorOpenDuration": self.door_open_duration,
                "doorThreshold": self.door_threshold_sec,
                "temperatureSensorStatus": self.temp_sensor_status,
                "humiditySensorStatus": self.hum_sensor_status,
                "temperatureTarget": self.target_temp,
                "temperatureMin": self.temp_min,
                "temperatureMax": self.temp_max,
                "humidityTarget": self.target_hum,
                "humidityMin": self.hum_min,
                "humidityMax": self.hum_max
            }

    def get_energy_data(self) -> Dict[str, Any]:
        with self.lock:
            # Backup runtime estimate based on battery capacity & current load
            backup_hours = round((self.battery_soc / 100.0 * 1.28) / max(0.05, self.load_power), 1)
            return {
                "solarPower": self.solar_power,
                "solarEnergyToday": self.solar_energy_today,
                "batterySOC": self.battery_soc,
                "batteryVoltage": self.battery_voltage,
                "batteryCurrent": self.battery_current,
                "loadPower": self.load_power,
                "chargingState": self.charging_state,
                "pvCapacity": 1.2,
                "coolingEnergyToday": self.cooling_energy_today,
                "auxEnergyToday": self.aux_energy_today,
                "estimatedBackupRuntimeHours": backup_hours
            }

    def get_cooling_data(self) -> Dict[str, Any]:
        with self.lock:
            energy_mode = "ENERGY SAVING" if self.battery_soc < 20.0 else "SOLAR PRIORITY"
            return {
                "coolingStatus": self.compressor_status,
                "compressorStatus": self.compressor_status,
                "evaporatorFanStatus": self.evaporator_fan_status,
                "condenserFanStatus": self.condenser_fan_status,
                "coolingDemand": self.cooling_demand,
                "controlMode": "AUTO",
                "energyMode": energy_mode,
                "compressorRuntimeMinutes": self.compressor_runtime_minutes
            }

    def get_safety_data(self) -> Dict[str, Any]:
        with self.lock:
            return {
                "refrigerantLeak": False,
                "refrigerantSafetyStatus": "R-290 refrigerant — safety monitored",
                "leakProtectionStatus": "NORMAL",
                "highPressure": "NORMAL",
                "lowPressure": "NORMAL",
                "thermalProtection": "NORMAL",
                "emergencyStop": "DISENGAGED",
                "earthing": "VERIFIED",
                "fuseMcbStatus": "OK"
            }

# Global singleton
simulation_engine = SimulationEngine()

def run_simulation_loop():
    simulation_engine.load_active_crop()
    while True:
        if simulation_engine.is_running:
            try:
                simulation_engine.tick()
            except Exception as e:
                print(f"Simulation tick error: {e}")
        time.sleep(2.0)

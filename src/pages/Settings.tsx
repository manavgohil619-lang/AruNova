import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { telemetryService } from '../services/telemetryService';
import { useTelemetryContext } from '../context/TelemetryContext';
import { Settings as SettingsIcon, Save, RotateCcw, Play, Square, Check, AlertCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const { data, refresh, triggerScenario } = useTelemetryContext();

  const [deviceId, setDeviceId] = useState('COLDHUB-001');
  const [deviceName, setDeviceName] = useState('AruNova ColdHub Unit 1');
  const [location, setLocation] = useState('NER Pilot Unit');

  const [activeCropId, setActiveCropId] = useState('leafy_veg');
  const [batteryLowThreshold, setBatteryLowThreshold] = useState(20);
  const [doorThresholdSec, setDoorThresholdSec] = useState(30);
  const [refreshRateSec, setRefreshRateSec] = useState(2);

  const [tempTarget, setTempTarget] = useState(3.0);
  const [tempMin, setTempMin] = useState(1.5);
  const [tempMax, setTempMax] = useState(4.5);

  const [humTarget, setHumTarget] = useState(90);
  const [humMin, setHumMin] = useState(85);
  const [humMax, setHumMax] = useState(95);

  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setDeviceId(data.device.deviceId || 'COLDHUB-001');
      setDeviceName(data.device.name || 'AruNova ColdHub Unit 1');
      setLocation(data.device.location || 'NER Pilot Unit');
      setActiveCropId(data.device.activeCropId || 'leafy_veg');

      if (data.environment) {
        setDoorThresholdSec(data.environment.doorThreshold || 30);
        setTempTarget(data.environment.temperatureTarget || 3.0);
        setTempMin(data.environment.temperatureMin || 1.5);
        setTempMax(data.environment.temperatureMax || 4.5);
        setHumTarget(data.environment.humidityTarget || 90);
        setHumMin(data.environment.humidityMin || 85);
        setHumMax(data.environment.humidityMax || 95);
      }
    }
  }, [data]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await telemetryService.updateDeviceConfig({
      deviceId,
      name: deviceName,
      location,
      activeCropId,
      batteryLowThreshold,
      doorThresholdSeconds: doorThresholdSec,
      refreshRateSeconds: refreshRateSec
    });

    setSavedMessage('Configuration successfully saved and applied to controller.');
    setTimeout(() => setSavedMessage(null), 3000);
    refresh();
  };

  const handleResetDemoData = async () => {
    await triggerScenario('NORMAL');
    setSavedMessage('Simulation engine reset to baseline NORMAL parameters.');
    setTimeout(() => setSavedMessage(null), 3000);
    refresh();
  };

  const handleStartSimulation = async () => {
    try {
      await fetch('/api/simulation/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START' })
      });
    } catch {}
    setSavedMessage('Simulation engine continuous ticking active.');
    setTimeout(() => setSavedMessage(null), 3000);
    refresh();
  };

  const handleStopSimulation = async () => {
    try {
      await fetch('/api/simulation/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'STOP' })
      });
    } catch {}
    setSavedMessage('Simulation engine paused.');
    setTimeout(() => setSavedMessage(null), 3000);
    refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Configuration & Operational Parameters"
        subtitle="Manage device telemetry identifiers, environmental trip bounds and simulation runtime"
      />

      {savedMessage && (
        <div className="p-3.5 rounded-lg bg-[#ECFDF3] border border-[#ABEFC6] text-xs font-semibold text-[#027A48] flex items-center gap-2">
          <Check className="w-4 h-4 text-[#2E9B67]" />
          <span>{savedMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveConfig} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SECTION 1: DEVICE IDENTITY */}
          <SectionCard
            title="DEVICE & PILOT SITE IDENTIFICATION"
            subtitle="Hardware identifiers transmitted with each telemetry frame"
          >
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#344054] mb-1">
                  Device Hardware ID
                </label>
                <input
                  type="text"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md font-mono bg-[#F8F9FA] text-[#17212B]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#344054] mb-1">
                  Device Description Name
                </label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-[#17212B]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#344054] mb-1">
                  Field Installation Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D0D5DD] rounded-md text-[#17212B]"
                  required
                />
              </div>
            </div>
          </SectionCard>

          {/* SECTION 2: ENERGY & DOOR TIMERS */}
          <SectionCard
            title="ENERGY & INFILTRATION THRESHOLDS"
            subtitle="Cut-off parameters for automated protection routines"
          >
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#344054] mb-1">
                  LiFePO4 Low Battery Trip Threshold (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={10}
                    max={50}
                    value={batteryLowThreshold}
                    onChange={(e) => setBatteryLowThreshold(Number(e.target.value))}
                    className="w-32 px-3 py-2 border border-[#D0D5DD] rounded-md text-[#17212B]"
                    required
                  />
                  <span className="text-[#667085]">
                    Switches system into ENERGY SAVING mode below this reserve level.
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#344054] mb-1">
                  Chamber Door Open Alarm Duration (Seconds)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={10}
                    max={120}
                    value={doorThresholdSec}
                    onChange={(e) => setDoorThresholdSec(Number(e.target.value))}
                    className="w-32 px-3 py-2 border border-[#D0D5DD] rounded-md text-[#17212B]"
                    required
                  />
                  <span className="text-[#667085]">
                    Raises alert if magnetic door interlock is broken continuously.
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#344054] mb-1">
                  Telemetry Dispatch Rate (Seconds)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={refreshRateSec}
                    onChange={(e) => setRefreshRateSec(Number(e.target.value))}
                    className="w-32 px-3 py-2 border border-[#D0D5DD] rounded-md text-[#17212B]"
                    required
                  />
                  <span className="text-[#667085]">
                    ESP32 transmission / polling interval.
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* SECTION 3: SIMULATION RUNTIME CONTROLS */}
        <SectionCard
          title="SIMULATION RUNTIME & TEST CONTROLS"
          subtitle="Manage software demonstration state and reset persistent buffers"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1769AA] hover:bg-[#2F80C0] text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>SAVE CONFIGURATION</span>
              </button>

              <button
                type="button"
                onClick={handleResetDemoData}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-[#D0D5DD] hover:bg-[#F2F4F7] text-[#344054] text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-[#D99A22]" />
                <span>RESET DEMO DATA</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartSimulation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#ECFDF3] border border-[#ABEFC6] text-[#027A48] hover:bg-[#D1FADF] text-xs font-semibold"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>START SIMULATION</span>
              </button>

              <button
                type="button"
                onClick={handleStopSimulation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] hover:bg-[#FEE4E2] text-xs font-semibold"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>STOP SIMULATION</span>
              </button>
            </div>
          </div>
        </SectionCard>
      </form>
    </div>
  );
};

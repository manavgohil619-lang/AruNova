import React, { useState } from 'react';
import { Sliders, ChevronDown, ChevronUp, Play, Thermometer, Battery, DoorOpen, SunDim, Wrench, RotateCcw } from 'lucide-react';
import { useTelemetryContext } from '../../context/TelemetryContext';

export const DemoControls: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeScenario, setActiveScenario] = useState<string>('NORMAL');
  const { triggerScenario } = useTelemetryContext();

  const handleScenario = async (sc: string) => {
    setActiveScenario(sc);
    await triggerScenario(sc);
  };

  return (
    <div className="bg-white rounded-lg border border-[#E4E7EC] shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#F8F9FA] hover:bg-[#F2F4F7] transition-colors border-b border-[#E4E7EC]"
      >
        <div className="flex items-center gap-2.5">
          <Sliders className="w-4 h-4 text-[#1769AA]" />
          <span className="text-sm font-semibold tracking-wide text-[#17212B] uppercase">
            EVALUATION & DEMO CONTROLS
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#EBF4FA] text-[#1769AA] border border-[#1769AA]/20">
            SIH JURY SIMULATION ENGINE
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#667085]">
          <span>{isOpen ? 'Collapse Panel' : 'Expand Controls'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5">
          <p className="text-xs text-[#667085] mb-4">
            Trigger simulated operational disturbances to verify automated closed-loop cooling logic, LiFePO4 battery management, sensor fault failovers, and alert handling.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* 1. RUN LIVE DEMO / NORMAL */}
            <button
              onClick={() => handleScenario('NORMAL')}
              className={`flex flex-col items-center justify-center p-3 rounded-md border text-center transition-all ${
                activeScenario === 'NORMAL'
                  ? 'bg-[#ECFDF3] border-[#ABEFC6] text-[#027A48] ring-1 ring-[#027A48]'
                  : 'bg-white border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] hover:border-[#98A2B3]'
              }`}
            >
              <RotateCcw className="w-4 h-4 mb-1.5 text-[#027A48]" />
              <span className="text-xs font-bold leading-tight">RUN LIVE DEMO</span>
              <span className="text-[10px] text-[#667085] mt-0.5">Reset / Normal</span>
            </button>

            {/* 2. HIGH TEMPERATURE */}
            <button
              onClick={() => handleScenario('HIGH_TEMPERATURE')}
              className={`flex flex-col items-center justify-center p-3 rounded-md border text-center transition-all ${
                activeScenario === 'HIGH_TEMPERATURE'
                  ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318] ring-1 ring-[#B42318]'
                  : 'bg-white border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] hover:border-[#98A2B3]'
              }`}
            >
              <Thermometer className="w-4 h-4 mb-1.5 text-[#D64545]" />
              <span className="text-xs font-bold leading-tight">HIGH TEMP</span>
              <span className="text-[10px] text-[#667085] mt-0.5">Exceed 4.5°C</span>
            </button>

            {/* 3. LOW BATTERY */}
            <button
              onClick={() => handleScenario('LOW_BATTERY')}
              className={`flex flex-col items-center justify-center p-3 rounded-md border text-center transition-all ${
                activeScenario === 'LOW_BATTERY'
                  ? 'bg-[#FEF6EE] border-[#F9DBAF] text-[#B54708] ring-1 ring-[#B54708]'
                  : 'bg-white border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] hover:border-[#98A2B3]'
              }`}
            >
              <Battery className="w-4 h-4 mb-1.5 text-[#D99A22]" />
              <span className="text-xs font-bold leading-tight">LOW BATTERY</span>
              <span className="text-[10px] text-[#667085] mt-0.5">SOC &lt; 20% Eco</span>
            </button>

            {/* 4. DOOR OPEN */}
            <button
              onClick={() => handleScenario('DOOR_OPEN')}
              className={`flex flex-col items-center justify-center p-3 rounded-md border text-center transition-all ${
                activeScenario === 'DOOR_OPEN'
                  ? 'bg-[#FEF6EE] border-[#F9DBAF] text-[#B54708] ring-1 ring-[#B54708]'
                  : 'bg-white border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] hover:border-[#98A2B3]'
              }`}
            >
              <DoorOpen className="w-4 h-4 mb-1.5 text-[#B54708]" />
              <span className="text-xs font-bold leading-tight">DOOR OPEN</span>
              <span className="text-[10px] text-[#667085] mt-0.5">Timer & Infiltration</span>
            </button>

            {/* 5. LOW SOLAR */}
            <button
              onClick={() => handleScenario('LOW_SOLAR')}
              className={`flex flex-col items-center justify-center p-3 rounded-md border text-center transition-all ${
                activeScenario === 'LOW_SOLAR'
                  ? 'bg-[#FDF9EE] border-[#F9DBAF] text-[#B54708] ring-1 ring-[#B54708]'
                  : 'bg-white border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] hover:border-[#98A2B3]'
              }`}
            >
              <SunDim className="w-4 h-4 mb-1.5 text-[#E3A72F]" />
              <span className="text-xs font-bold leading-tight">LOW SOLAR</span>
              <span className="text-[10px] text-[#667085] mt-0.5">Cloud / Rain Drop</span>
            </button>

            {/* 6. SENSOR FAILURE */}
            <button
              onClick={() => handleScenario('SENSOR_FAILURE')}
              className={`flex flex-col items-center justify-center p-3 rounded-md border text-center transition-all ${
                activeScenario === 'SENSOR_FAILURE'
                  ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318] ring-1 ring-[#B42318]'
                  : 'bg-white border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB] hover:border-[#98A2B3]'
              }`}
            >
              <Wrench className="w-4 h-4 mb-1.5 text-[#D64545]" />
              <span className="text-xs font-bold leading-tight">SENSOR FAULT</span>
              <span className="text-[10px] text-[#667085] mt-0.5">PT100 Signal Lost</span>
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-[#F2F4F7] flex flex-wrap items-center justify-between text-[11px] text-[#667085]">
            <span className="flex items-center gap-1.5">
              <span>Current Simulation State:</span>
              <strong className="text-[#17212B] uppercase">{activeScenario}</strong>
            </span>
            <span>Deterministic state machine updates telemetry, charts, cooling, and alerts synchronously.</span>
          </div>
        </div>
      )}
    </div>
  );
};

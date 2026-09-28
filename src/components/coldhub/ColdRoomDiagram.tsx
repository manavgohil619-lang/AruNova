import React from 'react';
import { Thermometer, Droplets, Wind, DoorClosed, DoorOpen, Package } from 'lucide-react';
import { EnvironmentDataModel, CoolingDataModel, DeviceStatusModel } from '../../types';

interface ColdRoomDiagramProps {
  environment?: EnvironmentDataModel;
  cooling?: CoolingDataModel;
  device?: DeviceStatusModel;
}

export const ColdRoomDiagram: React.FC<ColdRoomDiagramProps> = ({
  environment,
  cooling,
  device,
}) => {
  const isCooling = cooling?.compressorStatus === 'ON';
  const isDoorOpen = environment?.doorStatus === 'OPEN';
  const temp = environment?.temperature;
  const hum = environment?.humidity;
  const loadKg = device?.currentLoadKg || 320;
  const capKg = device?.capacityKg || 500;
  const fillPct = Math.round((loadKg / capKg) * 100);

  return (
    <div className="bg-white rounded-lg border border-[#E4E7EC] p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#F2F4F7] pb-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-[#17212B] uppercase">
            CHAMBER SCHEMATIC & AIRFLOW
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Engineering layout of insulated compartment, sensors & thermal distribution
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#667085]">
            Load: <strong className="text-[#17212B]">{loadKg} kg</strong> / {capKg} kg ({fillPct}%)
          </span>
        </div>
      </div>

      {/* Schematic Box */}
      <div className="relative bg-[#FAFCFF] border-2 border-[#CBD5E1] rounded-lg p-5 schematic-grid overflow-hidden">
        {/* Top Header inside diagram */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 mb-4 bg-white/80 px-3 py-1.5 rounded">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#334155] uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#1769AA]" />
            <span>PIR Insulated Cold Storage Chamber (0.022 W/m·K)</span>
          </div>
          <div className="text-[11px] text-[#64748B] font-mono">
            AIRFLOW: {isCooling ? 'CIRCULATING (FORCED CONVECTION)' : 'STATIC BUFFER'}
          </div>
        </div>

        {/* Evaporator Unit at Top Ceiling */}
        <div className="mb-4 bg-white border border-[#CBD5E1] rounded-md p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded ${isCooling ? 'bg-[#EAF7FA] text-[#1597B8]' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
                <Wind className={`w-4 h-4 ${isCooling ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1E293B]">Ceiling Evaporator Coil</span>
                <span className="text-[11px] text-[#64748B] block">R-290 Direct Expansion Micro-channel</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                isCooling ? 'bg-[#EAF7FA] text-[#1597B8] border border-[#1597B8]/30' : 'bg-[#F1F5F9] text-[#64748B]'
              }`}>
                FAN: {cooling?.evaporatorFanStatus || 'ON'}
              </span>
            </div>
          </div>

          {/* Cooling Airflow Arrows */}
          <div className="mt-2 pt-2 border-t border-[#F1F5F9] flex items-center justify-around text-xs font-semibold text-[#1597B8]">
            <div className="flex flex-col items-center">
              <span className="text-[10px] tracking-tight">COOL AIR</span>
              <span className={`text-base font-bold transition-transform ${isCooling ? 'translate-y-0.5' : ''}`}>↓↓</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] tracking-tight">UNIFORM CHILLING</span>
              <span className={`text-base font-bold transition-transform ${isCooling ? 'translate-y-0.5' : ''}`}>↓↓</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] tracking-tight">COOL AIR</span>
              <span className={`text-base font-bold transition-transform ${isCooling ? 'translate-y-0.5' : ''}`}>↓↓</span>
            </div>
          </div>
        </div>

        {/* Mid Section: Vegetable Crates */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 my-4">
          {[
            { name: 'Crate 1-A', crop: device?.activeCropName || 'Greens', wt: '80 kg' },
            { name: 'Crate 1-B', crop: device?.activeCropName || 'Greens', wt: '80 kg' },
            { name: 'Crate 2-A', crop: device?.activeCropName || 'Greens', wt: '80 kg' },
            { name: 'Crate 2-B', crop: device?.activeCropName || 'Greens', wt: '80 kg' },
          ].map((crate, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#CBD5E1] rounded p-2.5 flex flex-col justify-between shadow-xs hover:border-[#1769AA]/40 transition-colors"
            >
              <div className="flex items-center justify-between text-[#64748B] text-[11px] mb-1">
                <span className="font-mono font-semibold">{crate.name}</span>
                <Package className="w-3.5 h-3.5 text-[#1769AA]" />
              </div>
              <div className="text-xs font-semibold text-[#0F172A] truncate">
                {crate.crop}
              </div>
              <div className="text-[10px] text-[#64748B] mt-1 pt-1 border-t border-[#F8FAFC]">
                Load: {crate.wt}
              </div>
            </div>
          ))}
        </div>

        {/* Lower Section: Telemetry Sensors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Temperature Sensor Box */}
          <div className="bg-white border border-[#CBD5E1] rounded p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-[#EBF4FA] text-[#1769AA]">
                <Thermometer className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] font-medium block">
                  Chamber Probe PT100
                </span>
                <span className="text-sm font-bold text-[#1E293B]">
                  {temp !== null && temp !== undefined ? `${temp} °C` : 'FAULT'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569]">
              SENSOR 1
            </span>
          </div>

          {/* Humidity Sensor Box */}
          <div className="bg-white border border-[#CBD5E1] rounded p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-[#EAF7FA] text-[#1597B8]">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-[#64748B] font-medium block">
                  Digital Hygrometer SHT30
                </span>
                <span className="text-sm font-bold text-[#1E293B]">
                  {hum !== null && hum !== undefined ? `${hum} % RH` : 'FAULT'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569]">
              SENSOR 2
            </span>
          </div>
        </div>

        {/* Bottom Section: Insulated Chamber Door Status */}
        <div className={`mt-2 rounded border p-3 flex items-center justify-between transition-colors ${
          isDoorOpen
            ? 'bg-[#FEF6EE] border-[#F9DBAF] text-[#B54708]'
            : 'bg-white border-[#CBD5E1] text-[#334155]'
        }`}>
          <div className="flex items-center gap-3">
            {isDoorOpen ? (
              <DoorOpen className="w-5 h-5 text-[#B54708] animate-bounce" />
            ) : (
              <DoorClosed className="w-5 h-5 text-[#2E9B67]" />
            )}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span>HEAVY INSULATED ACCESS DOOR</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  isDoorOpen ? 'bg-[#B54708] text-white' : 'bg-[#2E9B67] text-white'
                }`}>
                  {environment?.doorStatus || 'CLOSED'}
                </span>
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                Magnetic interlock gasket seal • Max allowable open: {environment?.doorThreshold || 30}s
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#64748B] block">Open Duration:</span>
            <span className={`text-xs font-mono font-bold ${
              (environment?.doorOpenDuration || 0) > 30 ? 'text-[#D64545]' : 'text-[#1E293B]'
            }`}>
              {environment?.doorOpenDuration || 0} seconds
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

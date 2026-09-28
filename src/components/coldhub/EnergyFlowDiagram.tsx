import React from 'react';
import { Sun, Cpu, BatteryCharging, Zap, ArrowRight, ArrowDown, ArrowUp, Snowflake, Battery } from 'lucide-react';
import { EnergyDataModel } from '../../types';

interface EnergyFlowDiagramProps {
  energy?: EnergyDataModel;
}

export const EnergyFlowDiagram: React.FC<EnergyFlowDiagramProps> = ({ energy }) => {
  const solarKw = energy?.solarPower ?? 0.85;
  const loadKw = energy?.loadPower ?? 0.61;
  const soc = energy?.batterySOC ?? 78;
  const isCharging = energy?.chargingState === 'CHARGING';
  const isDischarging = energy?.chargingState === 'DISCHARGING';

  // Dynamic power distribution calculations
  const directSolarToLoad = Math.min(solarKw, loadKw);
  const excessToBattery = Math.max(0, solarKw - loadKw);
  const batteryToLoad = Math.max(0, loadKw - solarKw);
  const solarCoveragePct = loadKw > 0 ? Math.min(100, Math.round((solarKw / loadKw) * 100)) : 100;

  return (
    <div className="bg-white rounded-lg border border-[#E4E7EC] p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F2F4F7] pb-3 mb-4 gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-[#17212B] uppercase">
            ENERGY FLOW ARCHITECTURE
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Decentralized solar PV generation, LiFePO4 storage & refrigeration load distribution
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded border ${
            isCharging
              ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]'
              : isDischarging
              ? 'bg-[#FEF6EE] text-[#B54708] border-[#F9DBAF]'
              : 'bg-[#F2F4F7] text-[#344054] border-[#D0D5DD]'
          }`}>
            BATTERY {energy?.chargingState || 'CHARGING'}
          </span>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded border bg-[#EBF4FA] text-[#1769AA] border-[#1769AA]/20">
            {solarCoveragePct}% SOLAR COVERAGE
          </span>
        </div>
      </div>

      {/* Energy Flow Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
        {/* Node 1: Solar PV Array */}
        <div className="bg-[#FDF9EE] border border-[#F9DBAF] rounded-lg p-3.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#B54708] text-xs font-bold mb-2">
            <span>SOLAR PV ARRAY</span>
            <Sun className="w-4 h-4 text-[#E3A72F]" />
          </div>
          <div className="text-2xl font-bold text-[#17212B]">
            {solarKw.toFixed(2)} <span className="text-xs font-normal text-[#667085]">kW</span>
          </div>
          <div className="text-[11px] text-[#667085] mt-2 pt-1 border-t border-[#F2F4F7] flex justify-between">
            <span>1.2 kWp Mono</span>
            <span className="text-[#B54708] font-medium">{solarKw > 0.1 ? 'Generating' : 'Low Sun'}</span>
          </div>
        </div>

        {/* Transition Arrow 1: Solar to MPPT */}
        <div className="hidden md:flex flex-col items-center justify-center text-[#98A2B3]">
          <span className="text-[10px] font-mono text-[#E3A72F] font-bold mb-0.5">
            {solarKw.toFixed(2)} kW
          </span>
          <ArrowRight className="w-5 h-5 text-[#E3A72F]" />
        </div>

        {/* Node 2: MPPT & Central BMS */}
        <div className="bg-white border border-[#E4E7EC] rounded-lg p-3.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#344054] text-xs font-bold mb-2">
            <span>MPPT & BMS</span>
            <Cpu className="w-4 h-4 text-[#1769AA]" />
          </div>
          <div className="text-xl font-bold text-[#17212B]">
            98.2% <span className="text-xs font-normal text-[#667085]">Efficiency</span>
          </div>
          <div className="text-[11px] text-[#667085] mt-2 pt-1 border-t border-[#F2F4F7] flex justify-between">
            <span>Peak Tracking</span>
            <span className="text-[#027A48] font-medium">Optimal</span>
          </div>
        </div>

        {/* Transition Arrow 2: MPPT to Battery */}
        <div className="hidden md:flex flex-col items-center justify-center text-[#98A2B3]">
          {isCharging ? (
            <>
              <span className="text-[10px] font-mono text-[#027A48] font-bold mb-0.5">
                +{excessToBattery.toFixed(2)} kW
              </span>
              <ArrowRight className="w-5 h-5 text-[#2E9B67]" />
            </>
          ) : isDischarging ? (
            <>
              <span className="text-[10px] font-mono text-[#B54708] font-bold mb-0.5">
                -{batteryToLoad.toFixed(2)} kW
              </span>
              <div className="flex items-center">
                <ArrowRight className="w-5 h-5 text-[#B54708] rotate-180" />
              </div>
            </>
          ) : (
            <>
              <span className="text-[10px] font-mono text-[#667085] mb-0.5">FLOAT</span>
              <ArrowRight className="w-5 h-5 text-[#98A2B3]" />
            </>
          )}
        </div>

        {/* Node 3: LiFePO4 Battery */}
        <div className="bg-[#ECFDF3] border border-[#ABEFC6] rounded-lg p-3.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#027A48] text-xs font-bold mb-2">
            <span>LiFePO4 BATTERY</span>
            <BatteryCharging className="w-4 h-4 text-[#2E9B67]" />
          </div>
          <div className="text-2xl font-bold text-[#17212B]">
            {soc}% <span className="text-xs font-normal text-[#667085]">SOC</span>
          </div>
          <div className="text-[11px] text-[#667085] mt-2 pt-1 border-t border-[#F2F4F7] flex justify-between">
            <span>{energy?.batteryVoltage ?? 13.2}V</span>
            <span>{energy?.batteryCurrent ?? 4.1}A</span>
          </div>
        </div>

        {/* Transition Arrow 3: Power to Load */}
        <div className="hidden md:flex flex-col items-center justify-center text-[#98A2B3]">
          <span className="text-[10px] font-mono text-[#1769AA] font-bold mb-0.5">
            {loadKw.toFixed(2)} kW
          </span>
          <ArrowRight className="w-5 h-5 text-[#1769AA]" />
        </div>

        {/* Node 4: Chamber Refrigeration Load */}
        <div className="bg-[#EBF4FA] border border-[#B9E6FE] rounded-lg p-3.5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#1769AA] text-xs font-bold mb-2">
            <span>CHAMBER LOAD</span>
            <Snowflake className="w-4 h-4 text-[#1769AA]" />
          </div>
          <div className="text-2xl font-bold text-[#17212B]">
            {loadKw.toFixed(2)} <span className="text-xs font-normal text-[#667085]">kW</span>
          </div>
          <div className="text-[11px] text-[#667085] mt-2 pt-1 border-t border-[#D0E2FF] flex justify-between">
            <span>R-290 Circuit</span>
            <span className="text-[#1769AA] font-medium">Cooling Active</span>
          </div>
        </div>
      </div>

      {/* Downward Row: Power Management Mode & Est. Backup Runtime */}
      <div className="mt-4 pt-4 border-t border-[#F2F4F7] grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Power Management Strategy */}
        <div className="bg-white border border-[#E4E7EC] rounded p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#EBF4FA] text-[#1769AA] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-[#667085] block font-medium">Power Allocation Strategy</span>
              <span className="text-sm font-bold text-[#17212B]">
                {solarKw >= loadKw ? 'Solar-First Priority (Direct PV Cooling)' : 'Hybrid Buffer (PV + LiFePO4 Support)'}
              </span>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-[#F2F4F7] text-[#344054] font-semibold shrink-0">
            AUTOMATIC
          </span>
        </div>

        {/* Backup Runtime & Consumption breakdown */}
        <div className="bg-white border border-[#E4E7EC] rounded p-3 flex items-center justify-between">
          <div>
            <span className="text-xs text-[#667085] block font-medium">Total Consumption Load</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-[#17212B]">{loadKw.toFixed(2)} kW</span>
              <span className="text-xs text-[#667085]">(Compressor, Fans, ESP32)</span>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="text-[#667085] block">Est. Backup:</span>
            <span className="font-bold text-[#17212B]">{energy?.estimatedBackupRuntimeHours ?? 14.5} hrs</span>
          </div>
        </div>
      </div>
    </div>
  );
};


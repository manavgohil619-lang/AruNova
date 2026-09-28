import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { ColdRoomDiagram } from '../components/coldhub/ColdRoomDiagram';
import { SectionCard } from '../components/common/SectionCard';
import { useTelemetryContext } from '../context/TelemetryContext';
import { Package, Wheat, Clock, ShieldAlert, Thermometer, Droplets } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export const ColdStorage: React.FC = () => {
  const { data } = useTelemetryContext();
  const env = data?.environment;
  const dev = data?.device;
  const cool = data?.cooling;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cold Storage Compartment"
        subtitle="Physical storage parameters, thermal loading and commodity shelf-life preservation"
        badges={
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#EBF4FA] text-[#1769AA] border border-[#1769AA]/30">
            DEMO / CONFIGURABLE PROFILE
          </span>
        }
      />

      {/* Top metrics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="STORAGE CAPACITY"
          value={dev?.capacityKg || 500}
          unit="kg"
          icon={Package}
          subtext="Modular NER Prototype"
        />

        <MetricCard
          title="CURRENT STORED LOAD"
          value={dev?.currentLoadKg || 320}
          unit="kg"
          icon={Package}
          subtext={`${Math.round(((dev?.currentLoadKg || 320) / (dev?.capacityKg || 500)) * 100)}% Chamber Volume`}
          status="Normal"
        />

        <MetricCard
          title="ACTIVE CROP COMMODITY"
          value={dev?.activeCropName || 'Leafy Vegetables'}
          unit=""
          icon={Wheat}
          subtext="Profile Loaded"
          status="Active"
        />

        <MetricCard
          title="STORAGE DURATION"
          value={2}
          unit="Days"
          icon={Clock}
          subtext="Batch Ingest: 26 Sept"
          status="Fresh"
        />
      </div>

      {/* Large Chamber Schematic */}
      <ColdRoomDiagram
        environment={env}
        cooling={cool}
        device={dev}
      />

      {/* Target Conditions & Profile Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="TARGET PRESERVATION CONDITIONS"
          subtitle="Governed dynamically by the active commodity profile"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded border border-[#E4E7EC] bg-[#F8F9FA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-[#EBF4FA] text-[#1769AA]">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#17212B] block">Temperature Target</span>
                  <span className="text-xs text-[#667085]">Set point: {env?.temperatureTarget}°C</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#17212B] block">{env?.temperatureMin}°C – {env?.temperatureMax}°C</span>
                <span className="text-[11px] text-[#667085]">Permissible band</span>
              </div>
            </div>

            <div className="p-3.5 rounded border border-[#E4E7EC] bg-[#F8F9FA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-[#EAF7FA] text-[#1597B8]">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#17212B] block">Relative Humidity Target</span>
                  <span className="text-xs text-[#667085]">Set point: {env?.humidityTarget}% RH</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#17212B] block">{env?.humidityMin}% – {env?.humidityMax}%</span>
                <span className="text-[11px] text-[#667085]">Permissible band</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded bg-[#FDF9EE] border border-[#F9DBAF] text-xs text-[#B54708]">
            <div className="font-semibold mb-0.5">Agronomic Note:</div>
            Storage conditions must be validated for the selected crop before real-world deployment. Different horticultural commodities require distinct psychrometric envelopes to prevent chilling injury or moisture loss.
          </div>
        </SectionCard>

        <SectionCard
          title="CHAMBER ENCLOSURE SPECIFICATIONS"
          subtitle="Engineering metrics of the modular solar cold room"
        >
          <div className="divide-y divide-[#F2F4F7] text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#667085]">Insulation Material:</span>
              <span className="font-semibold text-[#17212B]">100mm Polyisocyanurate (PIR) Sandwich Panels</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#667085]">Thermal Conductivity:</span>
              <span className="font-semibold text-[#17212B]">λ = 0.022 W/m·K</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#667085]">Door Gasket Interlock:</span>
              <span className="font-semibold text-[#2E9B67]">Dual EPDM Magnetic Seal</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#667085]">Refrigerant Charge:</span>
              <span className="font-semibold text-[#17212B]">R-290 (Propane) — Safety Monitored (&lt; 150g hermetic)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#667085]">Floor Load Rating:</span>
              <span className="font-semibold text-[#17212B]">Heavy reinforced checker plate (600 kg/m²)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-[#667085]">Modular Assembly:</span>
              <span className="font-semibold text-[#1769AA]">Cam-lock demountable NER field design</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

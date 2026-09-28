import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { SectionCard } from '../components/common/SectionCard';
import { EnergyFlowDiagram } from '../components/coldhub/EnergyFlowDiagram';
import { useTelemetryContext } from '../context/TelemetryContext';
import { Sun, BatteryCharging, Zap, Gauge, Clock, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';

export const Energy: React.FC = () => {
  const { data, history } = useTelemetryContext();
  const energy = data?.energy;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Energy & Solar Subsystem"
        subtitle="Solar PV power harvesting, LiFePO4 battery storage status, and refrigeration load monitoring"
        badges={
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#FDF9EE] text-[#B54708] border border-[#F9DBAF]">
            PROTOTYPE SIMULATION
          </span>
        }
      />

      {/* Top 4 primary electrical metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="SOLAR GENERATION"
          value={energy?.solarPower.toFixed(2) ?? 0.85}
          unit="kW"
          icon={Sun}
          subtext={`Today: ${energy?.solarEnergyToday ?? 4.82} kWh`}
          status={energy?.solarPower && energy.solarPower > 0.2 ? 'Active' : 'Low Solar'}
        />

        <MetricCard
          title="LiFePO4 BATTERY SOC"
          value={energy?.batterySOC ?? 78}
          unit="%"
          icon={BatteryCharging}
          subtext={`${energy?.batteryVoltage ?? 13.2}V • ${energy?.batteryCurrent ?? 4.1}A`}
          status={energy?.chargingState ?? 'Charging'}
        />

        <MetricCard
          title="CHAMBER POWER LOAD"
          value={energy?.loadPower.toFixed(2) ?? 0.61}
          unit="kW"
          icon={Zap}
          subtext={`Cooling: ${energy?.coolingEnergyToday ?? 3.10} kWh`}
        />

        <MetricCard
          title="ESTIMATED BACKUP RUNTIME"
          value={energy?.estimatedBackupRuntimeHours ?? 14.5}
          unit="Hours"
          icon={Clock}
          subtext="Without solar irradiance"
          status="Nominal"
        />
      </div>

      {/* Energy Flow Diagram */}
      <EnergyFlowDiagram energy={energy} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Solar vs Load */}
        <SectionCard
          title="POWER GENERATION VS CONSUMPTION (kW)"
          subtitle="Real-time balance between PV array yield and chamber cooling load"
        >
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history.slice(-20)} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E3A72F" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#E3A72F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 11, fill: '#667085' }} />
                <YAxis tick={{ fontSize: 11, fill: '#667085' }} domain={[0, 1.5]} unit="kW" />
                <Tooltip />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="solarPower" name="Solar PV (kW)" stroke="#E3A72F" strokeWidth={2} fillOpacity={1} fill="url(#solarGrad)" isAnimationActive={false} />
                <Line type="monotone" dataKey="loadPower" name="Chamber Load (kW)" stroke="#1769AA" strokeWidth={2} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Chart 2: Battery SOC Trend */}
        <SectionCard
          title="BATTERY STATE OF CHARGE (%)"
          subtitle="LiFePO4 chemical cell storage reserve buffer"
        >
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history.slice(-20)} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 11, fill: '#667085' }} />
                <YAxis tick={{ fontSize: 11, fill: '#667085' }} domain={[0, 100]} unit="%" />
                <Tooltip />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="batterySOC" name="Battery SOC (%)" stroke="#2E9B67" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Energy Breakdown Table */}
      <SectionCard
        title="DAILY ENERGY BALANCE LOG (PROTOTYPE VALUES)"
        subtitle="Simulated cumulative power accounting for 24-hour cycle"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded border border-[#E4E7EC] bg-[#F8F9FA]">
            <span className="text-[#667085] block mb-1">Solar Harvested Today:</span>
            <div className="text-xl font-bold text-[#17212B]">{energy?.solarEnergyToday ?? 4.82} kWh</div>
            <span className="text-[11px] text-[#2E9B67] font-semibold mt-1 block">100% Green Off-Grid Yield</span>
          </div>

          <div className="p-4 rounded border border-[#E4E7EC] bg-[#F8F9FA]">
            <span className="text-[#667085] block mb-1">Refrigeration Compressor Energy:</span>
            <div className="text-xl font-bold text-[#17212B]">{energy?.coolingEnergyToday ?? 3.10} kWh</div>
            <span className="text-[11px] text-[#667085] mt-1 block">Hysteresis-controlled runtime</span>
          </div>

          <div className="p-4 rounded border border-[#E4E7EC] bg-[#F8F9FA]">
            <span className="text-[#667085] block mb-1">Auxiliary & IoT Controller Energy:</span>
            <div className="text-xl font-bold text-[#17212B]">{energy?.auxEnergyToday ?? 0.72} kWh</div>
            <span className="text-[11px] text-[#667085] mt-1 block">Fans, ESP32, BMS telemetry</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

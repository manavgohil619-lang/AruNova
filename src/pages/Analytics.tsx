import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { AnalyticsModel } from '../types';
import { telemetryService } from '../services/telemetryService';
import { BarChart3, Sun, Snowflake, Cpu, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsModel | null>(null);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const data = await telemetryService.getAnalytics(timeframe);
    setAnalytics(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [timeframe]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Analytics & Energy Accounting"
        subtitle="Grouped thermodynamic stability, specific energy consumption per kg and operational duty cycles"
        badges={
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#FDF9EE] text-[#B54708] border border-[#F9DBAF]">
            PROTOTYPE SIMULATION
          </span>
        }
        actions={
          <div className="flex rounded-md border border-[#D0D5DD] p-0.5 bg-white shadow-xs">
            {(['daily', 'weekly', 'monthly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded text-xs font-semibold uppercase transition-colors ${
                  timeframe === t
                    ? 'bg-[#1769AA] text-white'
                    : 'text-[#667085] hover:text-[#17212B]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        }
      />

      {/* 4 Grouped Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Group 1: Environment */}
        <div className="bg-white rounded-lg border border-[#E4E7EC] p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F2F4F7] pb-2.5 mb-3">
            <span className="text-xs font-bold text-[#1769AA] uppercase tracking-wider">
              1. ENVIRONMENT
            </span>
            <Snowflake className="w-4 h-4 text-[#1769AA]" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#667085]">Avg Chamber Temp:</span>
              <span className="font-bold text-[#17212B]">{analytics?.environment.averageTemperature || '3.2°C'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Thermal Stability:</span>
              <span className="font-bold text-[#2E9B67]">{analytics?.environment.temperatureStability || '±0.4°C'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Avg Relative Humidity:</span>
              <span className="font-bold text-[#17212B]">{analytics?.environment.averageHumidity || '89% RH'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Thermal Excursions:</span>
              <span className="font-bold text-[#17212B]">{analytics?.environment.excursionCount || 1}</span>
            </div>
          </div>
        </div>

        {/* Group 2: Energy */}
        <div className="bg-white rounded-lg border border-[#E4E7EC] p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F2F4F7] pb-2.5 mb-3">
            <span className="text-xs font-bold text-[#E3A72F] uppercase tracking-wider">
              2. ENERGY
            </span>
            <Sun className="w-4 h-4 text-[#E3A72F]" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#667085]">Total Consumption:</span>
              <span className="font-bold text-[#17212B]">{analytics?.energy.energyConsumptionToday || '3.82 kWh'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Specific Energy / kg:</span>
              <span className="font-bold text-[#1769AA]">{analytics?.energy.energyPerKgStored || '0.012 kWh/kg'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Solar Contribution:</span>
              <span className="font-bold text-[#2E9B67]">{analytics?.energy.solarContribution || '100%'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Battery Utilization:</span>
              <span className="font-bold text-[#17212B]">{analytics?.energy.batteryUtilization || '78%'}</span>
            </div>
          </div>
        </div>

        {/* Group 3: Cooling */}
        <div className="bg-white rounded-lg border border-[#E4E7EC] p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F2F4F7] pb-2.5 mb-3">
            <span className="text-xs font-bold text-[#1597B8] uppercase tracking-wider">
              3. COOLING
            </span>
            <Snowflake className="w-4 h-4 text-[#1597B8]" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#667085]">Compressor Runtime:</span>
              <span className="font-bold text-[#17212B]">{analytics?.cooling.coolingRuntime || '142 min'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Duty Cycle:</span>
              <span className="font-bold text-[#17212B]">{analytics?.cooling.dutyCycle || '46%'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Door Events Today:</span>
              <span className="font-bold text-[#17212B]">{analytics?.cooling.doorEventsToday || 4}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Hysteresis Limit Trips:</span>
              <span className="font-bold text-[#2E9B67]">0 (Nominal)</span>
            </div>
          </div>
        </div>

        {/* Group 4: System */}
        <div className="bg-white rounded-lg border border-[#E4E7EC] p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#F2F4F7] pb-2.5 mb-3">
            <span className="text-xs font-bold text-[#344054] uppercase tracking-wider">
              4. SYSTEM
            </span>
            <Cpu className="w-4 h-4 text-[#344054]" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#667085]">Telemetry Uptime:</span>
              <span className="font-bold text-[#2E9B67]">{analytics?.system.systemUptime || '99.8%'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Last Controller Boot:</span>
              <span className="font-semibold text-[#17212B]">{analytics?.system.lastReboot || '7 days ago'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Controller Firmware:</span>
              <span className="font-mono text-[#17212B]">{analytics?.system.firmware || 'v1.4.2-esp32'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#667085]">Packet Loss Rate:</span>
              <span className="font-bold text-[#2E9B67]">&lt; 0.1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Aggregation Trend Bar Chart */}
      <SectionCard
        title={`ENERGY GENERATION VS LOAD PATTERN (${timeframe.toUpperCase()})`}
        subtitle="Simulated hourly profile across daytime insolation and cooling runtime"
      >
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.trendData || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#667085' }} />
              <YAxis tick={{ fontSize: 11, fill: '#667085' }} unit="kW" />
              <Tooltip />
              <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="solarPower" name="Solar PV Yield (kW)" fill="#E3A72F" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="loadPower" name="Chamber Load (kW)" fill="#1769AA" radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="p-3.5 rounded bg-white border border-[#E4E7EC] text-xs text-[#667085]">
        <strong className="text-[#17212B]">Engineering Disclosure:</strong> All displayed analytics reflect controlled simulation model calculations benchmarked against 1.2 kWp solar PV and 500 kg chamber volume specifications. Real-world deployment efficiency varies according to NER seasonal solar insolation and agricultural produce loading temperature.
      </div>
    </div>
  );
};

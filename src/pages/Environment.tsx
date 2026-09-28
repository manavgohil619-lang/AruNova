import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { SectionCard } from '../components/common/SectionCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useTelemetryContext } from '../context/TelemetryContext';
import { Thermometer, Droplets, DoorClosed, DoorOpen, ShieldCheck, Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea
} from 'recharts';

export const Environment: React.FC = () => {
  const { data, history } = useTelemetryContext();
  const [timeFilter, setTimeFilter] = useState<'1H' | '6H' | '24H' | '7D'>('1H');

  const env = data?.environment;
  const tMin = env?.temperatureMin ?? 1.5;
  const tMax = env?.temperatureMax ?? 4.5;
  const hMin = env?.humidityMin ?? 85;
  const hMax = env?.humidityMax ?? 95;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Environmental Chamber Monitoring"
        subtitle="Precision psychrometric logging, thermal stability envelopes and sensor integrity status"
        badges={
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#EBF4FA] text-[#1769AA] border border-[#1769AA]/30">
            ENVELOPE ACTIVE
          </span>
        }
      />

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CHAMBER TEMPERATURE"
          value={env?.temperature !== null && env?.temperature !== undefined ? env.temperature : null}
          unit="°C"
          icon={Thermometer}
          target={`${tMin}°C – ${tMax}°C`}
          status={env?.temperature !== null ? 'NORMAL' : 'FAULT'}
        />

        <MetricCard
          title="RELATIVE HUMIDITY"
          value={env?.humidity !== null && env?.humidity !== undefined ? env.humidity : null}
          unit="%"
          icon={Droplets}
          target={`${hMin}% – ${hMax}%`}
          status={env?.humidity !== null ? 'NORMAL' : 'FAULT'}
        />

        <MetricCard
          title="DOOR STATUS"
          value={env?.doorStatus || 'CLOSED'}
          unit=""
          icon={env?.doorStatus === 'OPEN' ? DoorOpen : DoorClosed}
          subtext={`Open: ${env?.doorOpenDuration || 0}s (Limit ${env?.doorThreshold || 30}s)`}
          status={env?.doorStatus === 'OPEN' ? 'WARNING' : 'NORMAL'}
        />

        <MetricCard
          title="SENSOR PROBE HEALTH"
          value="100%"
          unit=""
          icon={Activity}
          subtext="Dual redundancy calibrated"
          status={env?.temperatureSensorStatus || 'HEALTHY'}
        />
      </div>

      {/* Time filter buttons */}
      <div className="flex items-center justify-between bg-white border border-[#E4E7EC] p-3 rounded-lg shadow-sm">
        <span className="text-xs font-semibold text-[#344054] uppercase tracking-wider">
          Telemetry Historical Resolution
        </span>
        <div className="flex gap-1.5">
          {(['1H', '6H', '24H', '7D'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                timeFilter === tf
                  ? 'bg-[#1769AA] text-white'
                  : 'bg-[#F2F4F7] text-[#667085] hover:bg-[#E4E7EC] hover:text-[#17212B]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* 2 Focused Environmental Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature History Chart */}
        <SectionCard
          title="TEMPERATURE HISTORY & EXCURSION BOUNDS"
          subtitle={`Allowable safe envelope: ${tMin}°C to ${tMax}°C`}
        >
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history.slice(-24)} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 11, fill: '#667085' }} />
                <YAxis tick={{ fontSize: 11, fill: '#1769AA' }} unit="°C" domain={['auto', 'auto']} />
                <Tooltip />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <ReferenceArea y1={tMin} y2={tMax} fill="#1769AA" fillOpacity={0.08} />
                <Line type="monotone" dataKey="temperature" name="Chamber Temperature (°C)" stroke="#1769AA" strokeWidth={2.2} dot={{ r: 2 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Humidity History Chart */}
        <SectionCard
          title="RELATIVE HUMIDITY REGULATION"
          subtitle={`Target moisture retention envelope: ${hMin}% to ${hMax}%`}
        >
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history.slice(-24)} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 11, fill: '#667085' }} />
                <YAxis tick={{ fontSize: 11, fill: '#1597B8' }} unit="%" domain={[60, 100]} />
                <Tooltip />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <ReferenceArea y1={hMin} y2={hMax} fill="#1597B8" fillOpacity={0.08} />
                <Line type="monotone" dataKey="humidity" name="Relative Humidity (%)" stroke="#1597B8" strokeWidth={2.2} dot={{ r: 2 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Sensor Health and Calibration Verification Table */}
      <SectionCard
        title="CHAMBER SENSOR INTERFACES & CALIBRATION MATRIX"
        subtitle="Verification status of physical measurement transducers"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8F9FA] text-[#667085] uppercase border-b border-[#E4E7EC]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Sensor Interface</th>
                <th className="py-2.5 px-4 font-semibold">Hardware Type</th>
                <th className="py-2.5 px-4 font-semibold">Current Value</th>
                <th className="py-2.5 px-4 font-semibold">Configured Bounds</th>
                <th className="py-2.5 px-4 font-semibold">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F7]">
              <tr>
                <td className="py-3 px-4 font-semibold text-[#17212B]">Primary Temperature</td>
                <td className="py-3 px-4 text-[#667085]">Class-A PT100 RTD 4-Wire</td>
                <td className="py-3 px-4 font-bold text-[#17212B]">{env?.temperature !== null ? `${env?.temperature}°C` : 'FAULT'}</td>
                <td className="py-3 px-4 text-[#667085]">{tMin}°C to {tMax}°C</td>
                <td className="py-3 px-4"><StatusBadge status={env?.temperatureSensorStatus || 'HEALTHY'} size="sm" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#17212B]">Chamber Hygrometer</td>
                <td className="py-3 px-4 text-[#667085]">Sensirion SHT30 I2C</td>
                <td className="py-3 px-4 font-bold text-[#17212B]">{env?.humidity !== null ? `${env?.humidity}% RH` : 'FAULT'}</td>
                <td className="py-3 px-4 text-[#667085]">{hMin}% to {hMax}%</td>
                <td className="py-3 px-4"><StatusBadge status={env?.humiditySensorStatus || 'HEALTHY'} size="sm" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-[#17212B]">Door Interlock Reed</td>
                <td className="py-3 px-4 text-[#667085]">Hermetic Magnetic Contact</td>
                <td className="py-3 px-4 font-bold text-[#17212B]">{env?.doorStatus}</td>
                <td className="py-3 px-4 text-[#667085]">Max duration: {env?.doorThreshold}s</td>
                <td className="py-3 px-4"><StatusBadge status={env?.doorOpenDuration && env.doorOpenDuration > 30 ? 'WARNING' : 'HEALTHY'} size="sm" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

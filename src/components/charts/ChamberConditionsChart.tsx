import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  Legend
} from 'recharts';
import { TelemetryPointModel } from '../../types';

interface ChamberConditionsChartProps {
  data: TelemetryPointModel[];
  targetTemp?: number;
  tempMin?: number;
  tempMax?: number;
  targetHum?: number;
  humMin?: number;
  humMax?: number;
}

export const ChamberConditionsChart: React.FC<ChamberConditionsChartProps> = ({
  data,
  targetTemp = 3.0,
  tempMin = 1.5,
  tempMax = 4.5,
  targetHum = 90.0,
  humMin = 85.0,
  humMax = 95.0,
}) => {
  const [metricMode, setMetricMode] = useState<'both' | 'temp' | 'humidity'>('both');
  const [timeRange, setTimeRange] = useState<'1H' | '6H' | '24H' | '7D'>('1H');

  // Filter or sample data based on time range
  const chartPoints = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    let count = 12; // 1H
    if (timeRange === '6H') count = 24;
    else if (timeRange === '24H') count = 36;
    else if (timeRange === '7D') count = 48;

    return data.slice(-count);
  }, [data, timeRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-md border border-[#E4E7EC] shadow-md text-xs">
          <div className="font-semibold text-[#17212B] pb-1 mb-1 border-b border-[#F2F4F7]">
            Timestamp: {label}
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold text-[#17212B]">
                {entry.value !== null && entry.value !== undefined
                  ? `${entry.value} ${entry.name === 'Temperature' ? '°C' : '% RH'}`
                  : 'Sensor Fault'}
              </span>
            </div>
          ))}
          {metricMode !== 'humidity' && (
            <div className="text-[10px] text-[#667085] mt-1 pt-1 border-t border-[#F2F4F7]">
              Target Range: {tempMin}°C – {tempMax}°C
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-[#E4E7EC] p-4 sm:p-5 shadow-sm">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-[#17212B] uppercase">
            CHAMBER CONDITIONS
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Real-time telemetry showing thermal and hygrometric regulation inside chamber
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex rounded-md border border-[#D0D5DD] p-0.5 bg-[#F9FAFB] text-xs">
            <button
              onClick={() => setMetricMode('both')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                metricMode === 'both' ? 'bg-white shadow-xs text-[#1769AA]' : 'text-[#667085] hover:text-[#17212B]'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setMetricMode('temp')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                metricMode === 'temp' ? 'bg-white shadow-xs text-[#1769AA]' : 'text-[#667085] hover:text-[#17212B]'
              }`}
            >
              Temperature
            </button>
            <button
              onClick={() => setMetricMode('humidity')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                metricMode === 'humidity' ? 'bg-white shadow-xs text-[#1769AA]' : 'text-[#667085] hover:text-[#17212B]'
              }`}
            >
              Humidity
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex rounded-md border border-[#D0D5DD] p-0.5 bg-[#F9FAFB] text-xs">
            {(['1H', '6H', '24H', '7D'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  timeRange === r ? 'bg-white shadow-xs text-[#17212B]' : 'text-[#667085] hover:text-[#17212B]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartPoints} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 11, fill: '#667085' }}
              tickLine={false}
              axisLine={{ stroke: '#EAECF0' }}
            />

            {/* Left Y Axis for Temperature */}
            {(metricMode === 'both' || metricMode === 'temp') && (
              <YAxis
                yAxisId="temp"
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#1769AA' }}
                tickLine={false}
                axisLine={{ stroke: '#EAECF0' }}
                unit="°C"
              />
            )}

            {/* Right Y Axis for Humidity */}
            {(metricMode === 'both' || metricMode === 'humidity') && (
              <YAxis
                yAxisId="hum"
                orientation={metricMode === 'humidity' ? 'left' : 'right'}
                domain={[50, 100]}
                tick={{ fontSize: 11, fill: '#1597B8' }}
                tickLine={false}
                axisLine={{ stroke: '#EAECF0' }}
                unit="%"
              />
            )}

            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />

            {/* Target Temperature Safe Band */}
            {metricMode !== 'humidity' && (
              <>
                <ReferenceArea
                  yAxisId="temp"
                  y1={tempMin}
                  y2={tempMax}
                  fill="#1769AA"
                  fillOpacity={0.06}
                  strokeOpacity={0}
                />
                <ReferenceLine
                  yAxisId="temp"
                  y={targetTemp}
                  stroke="#1769AA"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: `Target: ${targetTemp}°C`, position: 'insideTopRight', fill: '#1769AA', fontSize: 10 }}
                />
              </>
            )}

            {/* Temperature Line */}
            {(metricMode === 'both' || metricMode === 'temp') && (
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="temperature"
                name="Temperature"
                stroke="#1769AA"
                strokeWidth={2}
                dot={{ r: 2, fill: '#1769AA' }}
                activeDot={{ r: 5, fill: '#1769AA', stroke: '#fff', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            )}

            {/* Humidity Line */}
            {(metricMode === 'both' || metricMode === 'humidity') && (
              <Line
                yAxisId="hum"
                type="monotone"
                dataKey="humidity"
                name="Relative Humidity"
                stroke="#1597B8"
                strokeWidth={1.8}
                dot={{ r: 2, fill: '#1597B8' }}
                activeDot={{ r: 5, fill: '#1597B8', stroke: '#fff', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Target range legend below */}
      <div className="mt-3 pt-3 border-t border-[#F2F4F7] flex flex-wrap items-center justify-between text-xs text-[#667085]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-[#1769AA]/10 border border-[#1769AA]/30" />
            <span>Target Envelope: {tempMin}°C – {tempMax}°C</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#1769AA] border-t border-dashed border-[#1769AA]" />
            <span>Set Point: {targetTemp}°C</span>
          </span>
        </div>
        <div className="text-[11px] text-[#98A2B3]">
          Calibrated PT100 & Digital Hygrometer
        </div>
      </div>
    </div>
  );
};

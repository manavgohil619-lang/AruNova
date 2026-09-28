import React from 'react';
import { Thermometer, Droplets, BatteryCharging, Zap } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricCard } from '../components/common/MetricCard';
import { SystemStatusBanner } from '../components/dashboard/SystemStatusBanner';
import { ChamberConditionsChart } from '../components/charts/ChamberConditionsChart';
import { ColdRoomDiagram } from '../components/coldhub/ColdRoomDiagram';
import { EnergyFlowDiagram } from '../components/coldhub/EnergyFlowDiagram';
import { CoolingStatusCard } from '../components/coldhub/CoolingStatusCard';
import { RecentAlertsCard } from '../components/alerts/RecentAlertsCard';
import { DemoControls } from '../components/dashboard/DemoControls';
import { useTelemetryContext } from '../context/TelemetryContext';

export const Dashboard: React.FC = () => {
  const { data, history } = useTelemetryContext();

  const env = data?.environment;
  const energy = data?.energy;
  const cooling = data?.cooling;
  const device = data?.device;

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="AruNova Solar Smart ColdHub"
        subtitle="Solar-Powered Smart Mini Cold Storage Monitoring System (SIH26005 NER Pilot)"
        badges={
          <div className="flex items-center gap-2">
            <StatusBadge status={device?.status || 'NORMAL'} size="md" />
            <StatusBadge status={device?.connectivity || 'ONLINE'} size="md" />
            <span className="text-xs font-semibold px-2.5 py-1 rounded border bg-[#FDF9EE] text-[#B54708] border-[#F9DBAF]">
              {device?.dataSource || 'DEMO SIMULATION'}
            </span>
          </div>
        }
      />

      {/* 2. System Status */}
      <SystemStatusBanner
        device={device}
        environment={env}
        cooling={cooling}
      />

      {/* 3. Primary Metrics (4 Cards Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Chamber Temperature */}
        <MetricCard
          title="CHAMBER TEMPERATURE"
          value={env?.temperature !== null && env?.temperature !== undefined ? env.temperature : null}
          unit="°C"
          icon={Thermometer}
          target={`${env?.temperatureMin ?? 1.5}–${env?.temperatureMax ?? 4.5} °C`}
          status={env?.temperature !== null ? 'Normal' : 'FAULT'}
        />

        {/* Card 2: Relative Humidity */}
        <MetricCard
          title="RELATIVE HUMIDITY"
          value={env?.humidity !== null && env?.humidity !== undefined ? env.humidity : null}
          unit="%"
          icon={Droplets}
          target={`${env?.humidityMin ?? 85}–${env?.humidityMax ?? 95} %`}
          status={env?.humidity !== null ? 'Normal' : 'FAULT'}
        />

        {/* Card 3: Battery */}
        <MetricCard
          title="BATTERY"
          value={energy?.batterySOC ?? 78}
          unit="%"
          icon={BatteryCharging}
          subtext="LiFePO4"
          status={energy?.chargingState ?? 'Charging'}
        />

        {/* Card 4: Energy */}
        <MetricCard
          title="ENERGY"
          value={null}
          unit=""
          icon={Zap}
          secondaryInfo={[
            { label: 'Solar Output', value: `${(energy?.solarPower ?? 0.85).toFixed(2)} kW` },
            { label: 'Chamber Load', value: `${(energy?.loadPower ?? 0.61).toFixed(2)} kW` },
          ]}
        />
      </div>

      {/* 4. Main Environmental Chart */}
      <ChamberConditionsChart
        data={history}
        targetTemp={env?.temperatureTarget}
        tempMin={env?.temperatureMin}
        tempMax={env?.temperatureMax}
        targetHum={env?.humidityTarget}
        humMin={env?.humidityMin}
        humMax={env?.humidityMax}
      />

      {/* 5. ColdHub Chamber Visualization */}
      <ColdRoomDiagram
        environment={env}
        cooling={cooling}
        device={device}
      />

      {/* 6. Energy Flow */}
      <EnergyFlowDiagram energy={energy} />

      {/* 7. Cooling Status & Door Status */}
      <CoolingStatusCard
        cooling={cooling}
        environment={env}
      />

      {/* 8. Recent Alerts */}
      <RecentAlertsCard />

      {/* 9. Demo Controls */}
      <DemoControls />
    </div>
  );
};

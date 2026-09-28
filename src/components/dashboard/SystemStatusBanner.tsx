import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, Shield } from 'lucide-react';
import { DeviceStatusModel, EnvironmentDataModel, CoolingDataModel } from '../../types';

interface SystemStatusBannerProps {
  device?: DeviceStatusModel;
  environment?: EnvironmentDataModel;
  cooling?: CoolingDataModel;
}

export const SystemStatusBanner: React.FC<SystemStatusBannerProps> = ({
  device,
  environment,
  cooling,
}) => {
  const status = device?.status || 'NORMAL';

  let config = {
    bg: 'bg-[#ECFDF3]',
    border: 'border-[#ABEFC6]',
    text: 'text-[#027A48]',
    title: 'SYSTEM NORMAL',
    desc: 'ColdHub is operating within configured environmental and electrical conditions.',
    icon: CheckCircle2,
  };

  if (status === 'WARNING') {
    config = {
      bg: 'bg-[#FEF6EE]',
      border: 'border-[#F9DBAF]',
      text: 'text-[#B54708]',
      title: 'SYSTEM ATTENTION REQUIRED',
      desc: 'One or more non-critical parameters are outside optimal limits. Automated protection active.',
      icon: AlertTriangle,
    };
  } else if (status === 'CRITICAL') {
    config = {
      bg: 'bg-[#FEF3F2]',
      border: 'border-[#FECDCA]',
      text: 'text-[#B42318]',
      title: 'SYSTEM CRITICAL ALERT',
      desc: 'Significant excursion or safety condition detected. Immediate operator inspection advised.',
      icon: AlertOctagon,
    };
  } else if (status === 'OFFLINE') {
    config = {
      bg: 'bg-[#F8F9FA]',
      border: 'border-[#E4E7EC]',
      text: 'text-[#667085]',
      title: 'SYSTEM OFFLINE',
      desc: 'Telemetry dispatch unavailable from the controller.',
      icon: HelpCircle,
    };
  }

  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-4 sm:p-5 ${config.bg} ${config.border} shadow-sm transition-all`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Status message & Icon */}
        <div className="flex items-start gap-3.5">
          <div className={`p-2 rounded-md bg-white border ${config.border} ${config.text} shrink-0 shadow-xs`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base font-bold tracking-tight ${config.text}`}>
                {config.title}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/80 border border-current">
                {device?.dataSource || 'DEMO SIMULATION'}
              </span>
            </div>
            <p className="text-xs text-[#344054] mt-0.5">
              {config.desc}
            </p>
          </div>
        </div>

        {/* Right: Quick telemetry summary pill */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-white/90 border border-[#E4E7EC] rounded-md px-3.5 py-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#667085]">Temperature:</span>
            <span className="font-bold text-[#17212B]">
              {environment?.temperature !== null && environment?.temperature !== undefined
                ? `${environment.temperature}°C`
                : 'FAULT'}
            </span>
          </div>

          <span className="text-[#D0D5DD]">•</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[#667085]">Humidity:</span>
            <span className="font-bold text-[#17212B]">
              {environment?.humidity !== null && environment?.humidity !== undefined
                ? `${environment.humidity}% RH`
                : 'FAULT'}
            </span>
          </div>

          <span className="text-[#D0D5DD]">•</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[#667085]">Cooling:</span>
            <span className={`font-semibold ${cooling?.coolingStatus === 'ON' ? 'text-[#1769AA]' : 'text-[#667085]'}`}>
              {cooling?.coolingStatus || 'ON'}
            </span>
          </div>

          <span className="text-[#D0D5DD]">•</span>

          <div className="flex items-center gap-1.5">
            <span className="text-[#667085]">Mode:</span>
            <span className="font-semibold text-[#17212B]">
              {cooling?.energyMode || 'SOLAR PRIORITY'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

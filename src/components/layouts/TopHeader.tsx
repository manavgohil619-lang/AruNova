import React from 'react';
import { Menu, Activity, RefreshCw } from 'lucide-react';
import { DeviceStatusModel } from '../../types';

interface TopHeaderProps {
  device?: DeviceStatusModel;
  onToggleMobileMenu?: () => void;
  onRefresh?: () => void;
  isBackendConnected?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  device,
  onToggleMobileMenu,
  onRefresh,
  isBackendConnected = false,
}) => {
  const isHardware = device?.dataSource === 'LIVE HARDWARE';

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[#E4E7EC] px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile trigger & System Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-1.5 rounded-md border border-[#E4E7EC] text-[#344054] hover:bg-[#F2F4F7] md:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-[#17212B] tracking-tight">
                AruNova Solar Smart ColdHub
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#EBF4FA] text-[#1769AA] border border-[#D0E4F5]">
                SIH26005
              </span>
            </div>
            <p className="text-xs text-[#667085] hidden sm:block">
              Solar-Powered Smart Mini Cold Storage Monitoring System
            </p>
          </div>
        </div>

        {/* Right: Operational Telemetry Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs">
          {/* Device and Location info (desktop) */}
          <div className="hidden lg:flex flex-col items-end border-r border-[#E4E7EC] pr-4">
            <div className="text-[#17212B] font-semibold flex items-center gap-1.5">
              <span className="text-[#667085] font-normal">Device:</span>
              <span>{device?.deviceId || 'COLDHUB-001'}</span>
            </div>
            <div className="text-[#667085] text-[11px]">
              {device?.location || 'NER Pilot Unit'}
            </div>
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F8F9FA] border border-[#E4E7EC]">
            <span className="w-2 h-2 rounded-full bg-[#2E9B67] animate-pulse" />
            <span className="font-semibold text-[#344054]">
              {device?.connectivity || 'ONLINE'}
            </span>
          </div>

          {/* Data source badge: DEMO SIMULATION vs LIVE HARDWARE */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-semibold text-[11px] ${
            isHardware
              ? 'bg-[#EBF4FA] text-[#1769AA] border-[#1769AA]'
              : 'bg-[#FDF9EE] text-[#B54708] border-[#F9DBAF]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isHardware ? 'bg-[#1769AA]' : 'bg-[#E3A72F]'}`} />
            <span>{isHardware ? 'LIVE HARDWARE' : 'DEMO SIMULATION'}</span>
          </div>

          {/* Backend API Link indicator */}
          <div className={`hidden md:flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border ${
            isBackendConnected
              ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]'
              : 'bg-[#FEF6EE] text-[#B54708] border-[#F9DBAF]'
          }`} title={isBackendConnected ? "Connected to FastAPI Backend" : "Running local simulation fallback"}>
            <Activity className="w-3 h-3" />
            <span>{isBackendConnected ? 'API OK' : 'LOCAL SIM'}</span>
          </div>

          {/* Last updated & refresh button */}
          <div className="flex items-center gap-1 text-[11px] text-[#667085]">
            <span className="hidden xl:inline">{device?.lastUpdated || 'Just now'}</span>
            {onRefresh && (
              <button
                onClick={onRefresh}
                title="Refresh Telemetry"
                className="p-1 rounded text-[#667085] hover:text-[#17212B] hover:bg-[#F2F4F7]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

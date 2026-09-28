import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Snowflake,
  SunMedium,
  Thermometer,
  BellRing,
  BarChart3,
  Wheat,
  Activity,
  Settings,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface SidebarProps {
  alertCount?: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  alertCount = 0,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const monitoringNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Cold Storage', path: '/cold-storage', icon: Snowflake },
    { name: 'Energy & Solar', path: '/energy', icon: SunMedium },
    { name: 'Environment', path: '/environment', icon: Thermometer },
    { name: 'Alerts & Events', path: '/alerts', icon: BellRing, badge: alertCount > 0 ? alertCount : undefined },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const configNav = [
    { name: 'Crop Profile', path: '/crop-profile', icon: Wheat },
    { name: 'System Health', path: '/system-health', icon: Activity },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#EBF4FA] text-[#1769AA] font-semibold'
        : 'text-[#344054] hover:bg-[#F2F4F7] hover:text-[#17212B]'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E4E7EC] w-[230px] select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#E4E7EC]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#1769AA] flex items-center justify-center text-white shadow-sm">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-[#17212B] leading-none">
              AruNova
            </div>
            <div className="text-[11px] font-medium text-[#667085] mt-1 tracking-tight">
              Solar Smart ColdHub
            </div>
          </div>
        </div>
        <div className="mt-3 text-[10px] uppercase font-semibold tracking-wider text-[#98A2B3] flex items-center justify-between">
          <span>SIH 2026 • 144009</span>
          <span className="text-[#1769AA]">NER UNIT</span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div>
          <div className="px-3 text-[11px] font-semibold tracking-wider text-[#98A2B3] uppercase mb-2">
            MONITORING
          </div>
          <div className="space-y-1">
            {monitoringNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onCloseMobile}
                  className={linkClass}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#D64545] text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-3 text-[11px] font-semibold tracking-wider text-[#98A2B3] uppercase mb-2">
            CONFIGURATION
          </div>
          <div className="space-y-1">
            {configNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={linkClass}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Safety Badge */}
      <div className="p-3.5 border-t border-[#E4E7EC] bg-[#FAFAFA]">
        <div className="flex items-center gap-2 text-xs text-[#344054]">
          <ShieldCheck className="w-4 h-4 text-[#2E9B67] shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="font-semibold block text-[#17212B]">R-290 Monitored</span>
            <span className="text-[#667085]">Zero-leak safety protocol</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-none"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-[230px] h-full shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

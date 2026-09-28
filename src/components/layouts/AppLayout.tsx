import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { useTelemetryContext } from '../../context/TelemetryContext';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data, refresh, isBackendConnected } = useTelemetryContext();

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-row">
      {/* Sidebar */}
      <Sidebar
        alertCount={data?.device.status === 'WARNING' || data?.device.status === 'CRITICAL' ? 1 : 0}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopHeader
          device={data?.device}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onRefresh={refresh}
          isBackendConnected={isBackendConnected}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="bg-white border-t border-[#E4E7EC] px-6 py-4 text-xs text-[#667085] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-[#17212B]">AruNova Solar Smart ColdHub</span> — SIH 2026 Team ID 144009
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Farm → ColdHub → Market</span>
            <span>•</span>
            <span>Solar-First Energy</span>
            <span>•</span>
            <span>Modular NER Unit</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

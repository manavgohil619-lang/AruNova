import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { SystemHealthModel } from '../types';
import { telemetryService } from '../services/telemetryService';
import { Activity, ShieldCheck, RefreshCw } from 'lucide-react';

export const SystemHealth: React.FC = () => {
  const [healthData, setHealthData] = useState<SystemHealthModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHealth = async () => {
    setLoading(true);
    const data = await telemetryService.getSystemHealth();
    setHealthData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hardware & Subsystem Health Diagnostic"
        subtitle="Component-level operational status, protection trip states, and telemetry bus verification"
        badges={
          <StatusBadge status={healthData?.overallStatus || 'NORMAL'} size="md" />
        }
        actions={
          <button
            onClick={fetchHealth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#D0D5DD] bg-white text-xs font-semibold text-[#344054] hover:bg-[#F9FAFB]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Poll Hardware</span>
          </button>
        }
      />

      {/* Grouped Health Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {healthData?.groups.map((group, idx) => (
          <SectionCard
            key={idx}
            title={group.groupName}
            subtitle={`Integrated audit verification (${group.components.length} components)`}
          >
            <div className="overflow-x-auto -mx-5 -mb-5">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8F9FA] text-[#667085] uppercase border-y border-[#E4E7EC]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Subsystem / Component</th>
                    <th className="py-2.5 px-4 font-semibold">Diagnostic Telemetry</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2F4F7]">
                  {group.components.map((comp, cIdx) => (
                    <tr key={cIdx} className="hover:bg-[#F9FAFB]">
                      <td className="py-2.5 px-4 font-semibold text-[#17212B]">
                        {comp.name}
                      </td>
                      <td className="py-2.5 px-4 text-[#667085] font-mono">
                        {comp.detail}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <StatusBadge status={comp.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        ))}
      </div>

      {/* Safety Compliance Statement */}
      <div className="p-4 rounded-lg bg-white border border-[#E4E7EC] shadow-sm flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#2E9B67] shrink-0 mt-0.5" />
        <div className="text-xs text-[#344054]">
          <div className="font-bold text-[#17212B] uppercase tracking-wide mb-0.5">
            Hazard Compliance & Hydrocarbon Safety Monitored
          </div>
          <div>
            The refrigeration circuit utilizes <strong>R-290 refrigerant — safety monitored</strong> with hermetic charge below 150g in compliance with ISO 5149 / EN 378 safety envelopes. Dual hydrocarbon vapor sensor continuously supervises electrical enclosure space with immediate auto-isolation solenoid interlocking.
          </div>
        </div>
      </div>
    </div>
  );
};

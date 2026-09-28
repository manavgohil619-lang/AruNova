import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { AlertItemModel } from '../types';
import { telemetryService } from '../services/telemetryService';
import { Search, CheckCircle2, ShieldAlert, Filter, RefreshCw, Check, CheckCheck } from 'lucide-react';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItemModel[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAlerts = async () => {
    setLoading(true);
    const list = await telemetryService.getAlerts(
      filterStatus === 'ALL' ? undefined : filterStatus,
      filterSeverity === 'ALL' ? undefined : filterSeverity
    );
    setAlerts(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, [filterStatus, filterSeverity]);

  const handleAcknowledge = async (id: string) => {
    await telemetryService.acknowledgeAlert(id);
    fetchAlerts();
  };

  const handleResolve = async (id: string) => {
    await telemetryService.resolveAlert(id);
    fetchAlerts();
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (filterStatus === 'RESOLVED' && a.status !== 'RESOLVED') return false;
      if (filterStatus === 'ACTIVE' && a.status === 'RESOLVED') return false;
      if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          a.type.toLowerCase().includes(term) ||
          a.parameter.toLowerCase().includes(term) ||
          a.message.toLowerCase().includes(term) ||
          a.id.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [alerts, filterStatus, filterSeverity, searchTerm]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts & Incident Log"
        subtitle="Operational threshold alarms, refrigeration protection trips and audit trail"
        actions={
          <button
            onClick={fetchAlerts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#D0D5DD] bg-white text-xs font-semibold text-[#344054] hover:bg-[#F9FAFB]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Log</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E4E7EC] rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#98A2B3] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by alert name, parameter or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#D0D5DD] rounded-md text-xs text-[#17212B] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#1769AA] focus:ring-1 focus:ring-[#1769AA]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 mr-2 text-[#667085]">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <div className="flex rounded-md border border-[#D0D5DD] p-0.5 bg-[#F9FAFB]">
            {(['ALL', 'CRITICAL', 'WARNING'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filterSeverity === sev
                    ? 'bg-white shadow-xs text-[#17212B]'
                    : 'text-[#667085] hover:text-[#17212B]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex rounded-md border border-[#D0D5DD] p-0.5 bg-[#F9FAFB]">
            {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filterStatus === st
                    ? 'bg-white shadow-xs text-[#17212B]'
                    : 'text-[#667085] hover:text-[#17212B]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Alerts Table */}
      <SectionCard
        title="INCIDENT LOG TABLE"
        subtitle={`Showing ${filteredAlerts.length} matching events`}
      >
        <div className="overflow-x-auto -mx-5 -mb-5">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8F9FA] text-[#667085] uppercase border-y border-[#E4E7EC]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Time</th>
                <th className="py-2.5 px-4 font-semibold">Severity</th>
                <th className="py-2.5 px-4 font-semibold">Alert Type</th>
                <th className="py-2.5 px-4 font-semibold">Monitored Parameter</th>
                <th className="py-2.5 px-4 font-semibold">Reading</th>
                <th className="py-2.5 px-4 font-semibold">Threshold</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F7]">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#667085]">
                    No alert events matching current search and filter settings.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-4 font-mono text-[#667085]">{alert.timestamp}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={alert.severity} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#17212B]">{alert.type}</div>
                      <div className="text-[11px] text-[#667085] max-w-xs truncate" title={alert.message}>
                        {alert.message}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#344054]">{alert.parameter}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#17212B]">{alert.currentValue}</td>
                    <td className="py-3 px-4 font-mono text-[#667085]">{alert.threshold}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        alert.status === 'RESOLVED'
                          ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]'
                          : alert.status === 'ACKNOWLEDGED'
                          ? 'bg-[#FEF6EE] text-[#B54708] border-[#F9DBAF]'
                          : 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {alert.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="px-2 py-1 rounded bg-white border border-[#D0D5DD] hover:bg-[#F2F4F7] text-[11px] font-semibold text-[#344054]"
                            title="Acknowledge Alert"
                          >
                            Ack
                          </button>
                        )}
                        {alert.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleResolve(alert.id)}
                            className="px-2 py-1 rounded bg-[#1769AA] hover:bg-[#2F80C0] text-white text-[11px] font-semibold"
                            title="Mark as Resolved"
                          >
                            Resolve
                          </button>
                        )}
                        {alert.status === 'RESOLVED' && (
                          <span className="text-[11px] text-[#98A2B3] flex items-center gap-1 justify-end">
                            <CheckCheck className="w-3.5 h-3.5 text-[#2E9B67]" />
                            <span>Closed</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
};

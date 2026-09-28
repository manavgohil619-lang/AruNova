import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, ArrowRight, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { AlertItemModel } from '../../types';
import { telemetryService } from '../../services/telemetryService';
import { StatusBadge } from '../common/StatusBadge';

export const RecentAlertsCard: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItemModel[]>([]);

  useEffect(() => {
    const load = async () => {
      const list = await telemetryService.getAlerts();
      setAlerts(list.slice(0, 3));
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg border border-[#E4E7EC] p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#F2F4F7] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-[#1769AA]" />
          <h2 className="text-sm font-semibold tracking-wide text-[#17212B] uppercase">
            RECENT SYSTEM ALERTS
          </h2>
        </div>
        <Link
          to="/alerts"
          className="text-xs font-semibold text-[#1769AA] hover:text-[#2F80C0] flex items-center gap-1 transition-colors"
        >
          <span>View all alerts</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-6 text-xs text-[#667085]">
          No active or recent alerts recorded. All parameters nominal.
        </div>
      ) : (
        <div className="divide-y divide-[#F2F4F7]">
          {alerts.map((alert) => (
            <div key={alert.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <StatusBadge status={alert.severity} size="sm" />
                <div>
                  <div className="font-semibold text-[#17212B]">
                    {alert.type}
                  </div>
                  <div className="text-[#667085] text-[11px]">
                    {alert.parameter}: <strong>{alert.currentValue}</strong> (Limit: {alert.threshold})
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] text-[#667085] shrink-0 font-mono">
                {alert.timestamp}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

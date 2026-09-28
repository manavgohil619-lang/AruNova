import React from 'react';
import { LucideIcon } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface MetricCardProps {
  title: string;
  value: string | number | null;
  unit?: string;
  icon?: LucideIcon;
  target?: string;
  status?: string;
  subtext?: string;
  secondaryInfo?: { label: string; value: string }[];
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  target,
  status,
  subtext,
  secondaryInfo,
  highlight = false,
}) => {
  return (
    <div className={`bg-white rounded-lg border border-[#E4E7EC] p-5 shadow-sm transition-all hover:border-[#D0D5DD] ${highlight ? 'ring-1 ring-[#1769AA]/20' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold tracking-wider text-[#667085] uppercase">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded bg-[#F5F7FA] border border-[#E4E7EC] flex items-center justify-center text-[#1769AA]">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 my-2">
        {value === null || value === undefined ? (
          <span className="text-2xl font-bold text-[#D64545]">--</span>
        ) : (
          <span className="text-3xl font-bold tracking-tight text-[#17212B]">
            {value}
          </span>
        )}
        {unit && <span className="text-base font-medium text-[#667085]">{unit}</span>}
      </div>

      {secondaryInfo && secondaryInfo.length > 0 ? (
        <div className="mt-3 pt-3 border-t border-[#F2F4F7] grid grid-cols-2 gap-2 text-xs">
          {secondaryInfo.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[#667085]">{item.label}</span>
              <span className="font-semibold text-[#17212B]">{item.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-[#F2F4F7] flex items-center justify-between text-xs">
          {target && (
            <div className="text-[#667085]">
              Target: <span className="font-medium text-[#17212B]">{target}</span>
            </div>
          )}
          {subtext && <span className="text-[#667085] font-medium">{subtext}</span>}
          {status && <StatusBadge status={status} size="sm" />}
        </div>
      )}
    </div>
  );
};

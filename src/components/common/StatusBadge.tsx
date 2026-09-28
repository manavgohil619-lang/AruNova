import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, CircleDot } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  showDotOnly?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showDotOnly = false }) => {
  const norm = (status || '').toUpperCase();

  let bgClass = 'bg-[#F2F4F7] text-[#344054] border-[#D0D5DD]';
  let icon = <CircleDot className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />;

  if (['NORMAL', 'HEALTHY', 'ONLINE', 'CLOSED', 'OK', 'RESOLVED', 'VERIFIED'].includes(norm)) {
    bgClass = 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]';
    icon = <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />;
  } else if (['WARNING', 'DEGRADED', 'MEDIUM', 'OPEN', 'ACKNOWLEDGED'].includes(norm)) {
    bgClass = 'bg-[#FEF6EE] text-[#B54708] border-[#F9DBAF]';
    icon = <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />;
  } else if (['CRITICAL', 'FAULT', 'TRIPPED', 'TRIGGERED', 'ACTIVE'].includes(norm)) {
    bgClass = 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]';
    icon = <AlertOctagon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />;
  } else if (['OFFLINE', 'UNAVAILABLE', 'DISENGAGED'].includes(norm)) {
    bgClass = 'bg-[#F8F9FA] text-[#667085] border-[#E4E7EC]';
    icon = <HelpCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />;
  }

  if (showDotOnly) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-xs">
        <span className={`w-2 h-2 rounded-full ${
          ['NORMAL', 'HEALTHY', 'ONLINE'].includes(norm) ? 'bg-[#2E9B67]' :
          ['WARNING'].includes(norm) ? 'bg-[#D99A22]' :
          ['CRITICAL', 'FAULT'].includes(norm) ? 'bg-[#D64545]' : 'bg-[#98A2B3]'
        }`} />
        <span className="text-[#344054]">{norm}</span>
      </span>
    );
  }

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded border ${paddingClass} ${bgClass}`}>
      {icon}
      <span>{norm}</span>
    </span>
  );
};

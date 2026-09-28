import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badges,
  actions,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-[#E4E7EC] mb-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#17212B]">
            {title}
          </h1>
          {badges && <div className="flex items-center gap-2">{badges}</div>}
        </div>
        {subtitle && (
          <p className="text-sm text-[#667085] mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 self-start md:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

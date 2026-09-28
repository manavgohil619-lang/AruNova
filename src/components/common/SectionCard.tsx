import React from 'react';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  compact = false,
}) => {
  return (
    <div className={`bg-white rounded-lg border border-[#E4E7EC] shadow-sm ${className}`}>
      {(title || action) && (
        <div className={`flex items-center justify-between border-b border-[#F2F4F7] ${compact ? 'px-4 py-3' : 'px-5 py-4'}`}>
          <div>
            {title && (
              <h2 className="text-sm font-semibold tracking-wide text-[#17212B] uppercase">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-[#667085] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={compact ? 'p-4' : 'p-5'}>{children}</div>
    </div>
  );
};

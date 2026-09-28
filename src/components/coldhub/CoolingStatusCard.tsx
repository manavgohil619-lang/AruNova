import React from 'react';
import { CoolingDataModel, EnvironmentDataModel } from '../../types';
import { Snowflake, DoorClosed, DoorOpen, ShieldCheck, Fan, Cpu } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface CoolingStatusCardProps {
  cooling?: CoolingDataModel;
  environment?: EnvironmentDataModel;
}

export const CoolingStatusCard: React.FC<CoolingStatusCardProps> = ({
  cooling,
  environment,
}) => {
  const isDoorOpen = environment?.doorStatus === 'OPEN';
  const openDuration = environment?.doorOpenDuration || 0;
  const doorExceeded = openDuration > (environment?.doorThreshold || 30);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Refrigeration Control Status */}
      <div className="bg-white rounded-lg border border-[#E4E7EC] p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#F2F4F7] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-[#1597B8]" />
            <h2 className="text-sm font-semibold tracking-wide text-[#17212B] uppercase">
              REFRIGERATION CONTROLS
            </h2>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#EAF7FA] text-[#1597B8] border border-[#1597B8]/30">
            AUTO REGULATION
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded bg-[#F8F9FA] border border-[#E4E7EC]">
            <span className="text-[#667085] block mb-1">Cooling Circuit</span>
            <div className="flex items-center gap-1.5 font-bold text-[#17212B]">
              <span className={`w-2 h-2 rounded-full ${cooling?.coolingStatus === 'ON' ? 'bg-[#2E9B67]' : 'bg-[#98A2B3]'}`} />
              <span>{cooling?.coolingStatus || 'ON'}</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#F8F9FA] border border-[#E4E7EC]">
            <span className="text-[#667085] block mb-1">Compressor (R-290)</span>
            <div className="flex items-center gap-1.5 font-bold text-[#17212B]">
              <span className={`w-2 h-2 rounded-full ${cooling?.compressorStatus === 'ON' ? 'bg-[#2E9B67]' : 'bg-[#98A2B3]'}`} />
              <span>{cooling?.compressorStatus || 'ON'}</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#F8F9FA] border border-[#E4E7EC]">
            <span className="text-[#667085] block mb-1">Cooling Demand</span>
            <span className="font-bold text-[#1769AA]">
              {cooling?.coolingDemand || 'MEDIUM'}
            </span>
          </div>

          <div className="p-2.5 rounded bg-[#F8F9FA] border border-[#E4E7EC]">
            <span className="text-[#667085] block mb-1">Evaporator Fan</span>
            <span className="font-semibold text-[#17212B]">
              {cooling?.evaporatorFanStatus || 'ON'}
            </span>
          </div>

          <div className="p-2.5 rounded bg-[#F8F9FA] border border-[#E4E7EC]">
            <span className="text-[#667085] block mb-1">Condenser Fan</span>
            <span className="font-semibold text-[#17212B]">
              {cooling?.condenserFanStatus || 'ON'}
            </span>
          </div>

          <div className="p-2.5 rounded bg-[#F8F9FA] border border-[#E4E7EC]">
            <span className="text-[#667085] block mb-1">Energy Mode</span>
            <span className="font-semibold text-[#17212B]">
              {cooling?.energyMode || 'SOLAR PRIORITY'}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#F2F4F7] flex items-center justify-between text-[11px] text-[#667085]">
          <span>Compressor Run Time Today: <strong>{cooling?.compressorRuntimeMinutes || 142} min</strong></span>
          <span>Anti-Short Cycle Protection: <strong>ACTIVE</strong></span>
        </div>
      </div>

      {/* 2. Door Interlock & Infiltration */}
      <div className="bg-white rounded-lg border border-[#E4E7EC] p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#F2F4F7] pb-3 mb-4">
          <div className="flex items-center gap-2">
            {isDoorOpen ? (
              <DoorOpen className="w-4 h-4 text-[#B54708]" />
            ) : (
              <DoorClosed className="w-4 h-4 text-[#2E9B67]" />
            )}
            <h2 className="text-sm font-semibold tracking-wide text-[#17212B] uppercase">
              CHAMBER ACCESS & DOOR INTERLOCK
            </h2>
          </div>
          <StatusBadge status={doorExceeded ? 'WARNING' : isDoorOpen ? 'WARNING' : 'NORMAL'} size="sm" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded bg-[#F8F9FA] border border-[#E4E7EC]">
            <span className="text-[#667085] block mb-1">Door Status</span>
            <span className={`font-bold ${isDoorOpen ? 'text-[#B54708]' : 'text-[#2E9B67]'}`}>
              {environment?.doorStatus || 'CLOSED'}
            </span>
          </div>

          <div className="p-2.5 rounded bg-[#F8F9FA] border border-[#E4E7EC]">
            <span className="text-[#667085] block mb-1">Open Duration</span>
            <span className={`font-bold font-mono ${doorExceeded ? 'text-[#D64545]' : 'text-[#17212B]'}`}>
              {openDuration} sec
            </span>
          </div>

          <div className="p-2.5 rounded bg-[#F8F9FA] border border-[#E4E7EC]">
            <span className="text-[#667085] block mb-1">Threshold Limit</span>
            <span className="font-semibold text-[#17212B]">
              {environment?.doorThreshold || 30} sec
            </span>
          </div>
        </div>

        {doorExceeded && (
          <div className="mt-3 p-2.5 rounded bg-[#FEF3F2] border border-[#FECDCA] text-xs text-[#B42318] flex items-center gap-2">
            <span className="font-bold">WARNING:</span>
            <span>Chamber door open beyond safety threshold. Rapid cooling loss in progress.</span>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-[#F2F4F7] flex items-center justify-between text-[11px] text-[#667085]">
          <span>Gasket Seal Pressure: <strong>Nominal</strong></span>
          <span>Last Infiltration Event: <strong>14:29 UTC</strong></span>
        </div>
      </div>
    </div>
  );
};

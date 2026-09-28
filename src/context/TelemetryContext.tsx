import React, { createContext, useContext } from 'react';
import { useTelemetry } from '../hooks/useTelemetry';
import { TelemetryBundle } from '../services/telemetryService';
import { TelemetryPointModel } from '../types';

interface TelemetryContextType {
  data: TelemetryBundle | null;
  history: TelemetryPointModel[];
  loading: boolean;
  refresh: () => void;
  triggerScenario: (scenario: string) => Promise<void>;
  isBackendConnected: boolean;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const telemetry = useTelemetry(2000);

  return (
    <TelemetryContext.Provider value={telemetry}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetryContext = () => {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetryContext must be used within a TelemetryProvider');
  }
  return context;
};

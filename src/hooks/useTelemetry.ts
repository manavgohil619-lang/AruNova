import { useState, useEffect, useCallback, useRef } from 'react';
import { TelemetryBundle, telemetryService } from '../services/telemetryService';
import { TelemetryPointModel } from '../types';

export function useTelemetry(refreshIntervalMs: number = 2000) {
  const [data, setData] = useState<TelemetryBundle | null>(null);
  const [history, setHistory] = useState<TelemetryPointModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const isMountedRef = useRef<boolean>(true);

  const fetchData = useCallback(async () => {
    try {
      const bundle = await telemetryService.getLatest();
      const hist = await telemetryService.getHistory();
      if (isMountedRef.current) {
        setData(bundle);
        setHistory(hist);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching telemetry:', err);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, refreshIntervalMs);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchData, refreshIntervalMs]);

  const triggerScenario = useCallback(async (scenario: string) => {
    await telemetryService.triggerScenario(scenario);
    // Immediate refresh
    fetchData();
  }, [fetchData]);

  return {
    data,
    history,
    loading,
    refresh: fetchData,
    triggerScenario,
    isBackendConnected: data?.isBackendConnected ?? false
  };
}

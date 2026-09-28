import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TelemetryProvider } from './context/TelemetryContext';
import { AppLayout } from './components/layouts/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { ColdStorage } from './pages/ColdStorage';
import { Energy } from './pages/Energy';
import { Environment } from './pages/Environment';
import { Alerts } from './pages/Alerts';
import { Analytics } from './pages/Analytics';
import { CropProfile } from './pages/CropProfile';
import { SystemHealth } from './pages/SystemHealth';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <TelemetryProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/cold-storage" element={<ColdStorage />} />
            <Route path="/energy" element={<Energy />} />
            <Route path="/environment" element={<Environment />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/crop-profile" element={<CropProfile />} />
            <Route path="/system-health" element={<SystemHealth />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TelemetryProvider>
  );
};

export default App;

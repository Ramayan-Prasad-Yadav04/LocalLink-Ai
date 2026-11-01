import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { SensorProvider } from './context/SensorContext';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveSensorsPage } from './pages/LiveSensorsPage';
import { PredictionPage } from './pages/PredictionPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { EvacuationPage } from './pages/EvacuationPage';
import { AlertsPage } from './pages/AlertsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PublicCitizenPage } from './pages/PublicCitizenPage';
import { LoginPage } from './pages/LoginPage';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <SensorProvider>
          <Routes>
            {/* 1. Landing Page (Public Hero & System Overview) */}
            <Route path="/" element={<LandingPage />} />

            {/* 2. Main Monitoring Dashboard (Overview) */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* 3. Dedicated Live Sensor Monitoring & Kalman Fusion */}
            <Route path="/sensors" element={<LiveSensorsPage />} />

            {/* 4. Dedicated AI Flood Prediction Intelligence (Monte Carlo) */}
            <Route path="/prediction" element={<PredictionPage />} />
            <Route path="/analytics" element={<PredictionPage />} />

            {/* 5. Dedicated Risk Analysis & Classification Matrix */}
            <Route path="/risk" element={<RiskAnalysisPage />} />

            {/* 6. Dedicated Live Geospatial Flood Monitoring Map */}
            <Route path="/map" element={<LiveMapPage />} />

            {/* 7. Dijkstra Evacuation Routing Guidance */}
            <Route path="/evacuation" element={<EvacuationPage />} />

            {/* 8. Automated Multi-Channel Emergency Alerts Feed */}
            <Route path="/alerts" element={<AlertsPage />} />

            {/* 9. Settings & Hydrological Simulation Studio */}
            <Route path="/settings" element={<SettingsPage />} />

            {/* 10. Public Citizen Emergency Portal */}
            <Route path="/citizen" element={<PublicCitizenPage />} />

            {/* 11. Operator Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SensorProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

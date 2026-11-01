import React, { useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { AlertBanner } from '../components/AlertBanner';
import { KpiCards } from '../components/KpiCards';
import { PredictionChart } from '../components/PredictionChart';
import { SensorGraphs } from '../components/SensorGraphs';
import { RiskPanel } from '../components/RiskPanel';
import { FloodMap } from '../components/FloodMap';
import { EvacuationPanel } from '../components/EvacuationPanel';
import { AlertHistory } from '../components/AlertHistory';
import { EmergencyAlertModal } from '../components/EmergencyAlertModal';
import { useSensorData } from '../hooks/useSensorData';
import { api } from '../services/api';

export function DashboardPage() {
  const {
    systemStatus,
    secondsSinceUpdate,
    liveSensor,
    history,
    prediction,
    risk,
    sensors,
    shelters,
    evacuationRoute,
    alerts,
    currentScenario,
    isScenarioLoading,
    newEmergencyModal,
    dismissModal,
    handleScenarioChange,
    handleResetSimulation,
    refetch
  } = useSensorData(2000); // 2-second real-time update loop

  const evacuationRef = useRef(null);
  const mapRef = useRef(null);

  const handleScrollToEvacuation = () => {
    evacuationRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFocusMap = () => {
    mapRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await api.acknowledgeAlert(alertId);
      refetch();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-600 selection:text-white">
      
      {/* Control Room Top Navigation */}
      <Navbar
        systemStatus={systemStatus}
        secondsSinceUpdate={secondsSinceUpdate}
        currentScenario={currentScenario}
        onScenarioChange={handleScenarioChange}
        onResetSimulation={handleResetSimulation}
        isScenarioLoading={isScenarioLoading}
      />

      {/* Dynamic Emergency Alert Banner (Shown during HIGH or CRITICAL risk) */}
      <AlertBanner
        risk={risk}
        onScrollToEvacuation={handleScrollToEvacuation}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 py-5 space-y-5">
        
        {/* TOP KPI CARDS */}
        <KpiCards
          liveSensor={liveSensor}
          prediction={prediction}
          risk={risk}
        />

        {/* SECTION 1: PREDICTION & RISK PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 30-Minute Water-Level Forecast Chart (7 cols) */}
          <div className="lg:col-span-7">
            <PredictionChart
              prediction={prediction}
              currentWaterLevel={liveSensor?.water_level}
            />
          </div>

          {/* Flash Flood Risk Diagnostics (5 cols) */}
          <div className="lg:col-span-5">
            <RiskPanel
              risk={risk}
              onFocusEvacuation={handleScrollToEvacuation}
            />
          </div>
        </div>

        {/* SECTION 2: LIVE SENSOR TELEMETRY & EVACUATION ROUTE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch" ref={evacuationRef}>
          {/* Live Sensor Fusion & Multi-graphs (7 cols) */}
          <div className="lg:col-span-7">
            <SensorGraphs
              history={history}
            />
          </div>

          {/* NetworkX & Dijkstra Evacuation Guidance (5 cols) */}
          <div className="lg:col-span-5">
            <EvacuationPanel
              evacuationRoute={evacuationRoute}
              risk={risk}
              onTriggerMapSimulation={handleFocusMap}
            />
          </div>
        </div>

        {/* SECTION 3: GEOSPATIAL MAP & ALERT HISTORY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch" ref={mapRef}>
          {/* Leaflet Disaster Map (8 cols) */}
          <div className="lg:col-span-8 min-h-[460px]">
            <FloodMap
              sensors={sensors}
              shelters={shelters}
              evacuationRoute={evacuationRoute}
              risk={risk}
              liveSensor={liveSensor}
            />
          </div>

          {/* Emergency Alert History (4 cols) */}
          <div className="lg:col-span-4 min-h-[460px]">
            <AlertHistory
              alerts={alerts}
              onAcknowledge={handleAcknowledgeAlert}
            />
          </div>
        </div>

      </main>

      {/* Emergency Popup Modal (auto-triggered on HIGH/CRITICAL) */}
      <EmergencyAlertModal
        modalData={newEmergencyModal}
        onDismiss={dismissModal}
        onScrollToEvacuation={handleScrollToEvacuation}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060911] py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400 font-semibold">FloodWatch AI • Early Warning & Disaster Resilience Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Kalman Filter v1.2</span>
            <span>•</span>
            <span>200 Monte-Carlo Scenarios</span>
            <span>•</span>
            <span>NetworkX Dijkstra Router</span>
            <span>•</span>
            <span>SIH 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

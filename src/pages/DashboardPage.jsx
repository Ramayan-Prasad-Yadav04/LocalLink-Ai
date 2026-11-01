import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { CommandCenterLayout } from '../components/CommandCenterLayout';
import { AlertBanner } from '../components/AlertBanner';
import { KpiCards } from '../components/KpiCards';
import { PredictionChart } from '../components/PredictionChart';
import { SensorGraphs } from '../components/SensorGraphs';
import { RiskPanel } from '../components/RiskPanel';
import { FloodMap } from '../components/FloodMap';
import { EvacuationPanel } from '../components/EvacuationPanel';
import { AlertHistory } from '../components/AlertHistory';
import { useSensorData } from '../context/SensorContext';
import { 
  Map, 
  TrendingUp, 
  Navigation, 
  Bell, 
  Activity,
  Radio,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

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
    handleAcknowledgeAlert,
    activeWarningCount,
    monitoredLocationsCount,
    selectedRegion
  } = useSensorData();

  const evacuationRef = useRef(null);
  const mapRef = useRef(null);

  const handleScrollToEvacuation = () => {
    evacuationRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFocusMap = () => {
    mapRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <CommandCenterLayout>
      <div className="space-y-6">
        
        {/* Dynamic Emergency Alert Banner (Shown during HIGH or CRITICAL risk) */}
        <AlertBanner
          risk={risk}
          onScrollToEvacuation={handleScrollToEvacuation}
        />

        {/* Quick Action Command Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#101D2E] border border-[#1E2D42] shadow-xl">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">
              <Activity className="w-4 h-4 animate-pulse" />
            </span>
            <div className="text-xs">
              <span className="font-bold text-white uppercase tracking-wider block">
                Command Center Intelligence:
              </span>
              <span className="text-[11px] text-slate-400">
                Active basin: <strong className="text-white">{selectedRegion.name}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link
              to="/sensors"
              className="px-3 py-1.5 rounded-xl bg-[#07111F] hover:bg-[#16273e] text-slate-200 font-semibold border border-[#1E2D42] flex items-center gap-1.5 transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span>Live Sensor Telemetry</span>
            </Link>

            <Link
              to="/prediction"
              className="px-3 py-1.5 rounded-xl bg-[#07111F] hover:bg-[#16273e] text-slate-200 font-semibold border border-[#1E2D42] flex items-center gap-1.5 transition-all"
            >
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Prediction Intelligence</span>
            </Link>

            <Link
              to="/risk"
              className="px-3 py-1.5 rounded-xl bg-[#07111F] hover:bg-[#16273e] text-slate-200 font-semibold border border-[#1E2D42] flex items-center gap-1.5 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF9F43]" />
              <span>Risk Analysis</span>
            </Link>

            <Link
              to="/map"
              className="px-3 py-1.5 rounded-xl bg-[#07111F] hover:bg-[#16273e] text-slate-200 font-semibold border border-[#1E2D42] flex items-center gap-1.5 transition-all"
            >
              <Map className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span>Full-Screen Live Map</span>
            </Link>

            <Link
              to="/evacuation"
              className="px-3 py-1.5 rounded-xl bg-[#07111F] hover:bg-[#16273e] text-slate-200 font-semibold border border-[#1E2D42] flex items-center gap-1.5 transition-all"
            >
              <Navigation className="w-3.5 h-3.5 text-[#20D69A]" />
              <span>Dijkstra Evacuation Routing</span>
            </Link>
          </div>
        </div>

        {/* TOP KPI CARDS (THE 6 MANDATORY CARDS + STATUS STRIP) */}
        <KpiCards
          liveSensor={liveSensor}
          prediction={prediction}
          risk={risk}
          activeWarningCount={activeWarningCount}
          monitoredLocationsCount={monitoredLocationsCount}
          secondsSinceUpdate={secondsSinceUpdate}
          systemStatus={systemStatus}
        />

        {/* SECTION 1: PREDICTION CHART & RISK PANEL */}
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

        {/* SECTION 2: LIVE SENSOR TELEMETRY & EVACUATION GUIDANCE */}
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

      </div>
    </CommandCenterLayout>
  );
}

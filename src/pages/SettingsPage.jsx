import React, { useState } from 'react';
import { 
  Settings, 
  Radio, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  CloudRain, 
  Flame, 
  CheckCircle2, 
  Cpu, 
  Sliders, 
  ShieldAlert, 
  Mountain, 
  Clock, 
  Save, 
  BatteryCharging, 
  Wifi, 
  Sun,
  Moon,
  Activity,
  Globe,
  Bell,
  SlidersHorizontal,
  Droplets,
  Gauge
} from 'lucide-react';
import { CommandCenterLayout } from '../components/CommandCenterLayout';
import { useSensorData, MONITORING_REGIONS } from '../context/SensorContext';

export function SettingsPage() {
  const {
    currentScenario,
    isScenarioLoading,
    handleScenarioChange,
    handleResetSimulation,
    pollingIntervalMs,
    setPollingIntervalMs,
    selectedRegion,
    setSelectedRegion,
    customOverrides,
    updateCustomOverrides,
    kalmanParams,
    setKalmanParams,
    isMuted,
    isSirenTesting,
    toggleMute,
    testSiren,
    systemStatus
  } = useSensorData();

  // Local state for settings form
  const [dangerThreshold, setDangerThreshold] = useState(selectedRegion.dangerLevel || 3.5);
  const [warningThreshold, setWarningThreshold] = useState(2.8);
  const [soilSaturationThreshold, setSoilSaturationThreshold] = useState(80);
  const [displayTheme, setDisplayTheme] = useState('navy'); // 'navy' | 'tactical'
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // 'en' | 'hi' | 'gar'
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [autoSirenOnCritical, setAutoSirenOnCritical] = useState(true);
  const [saveFeedback, setSaveFeedback] = useState(false);

  // Manual Slider values
  const [sliderRain, setSliderRain] = useState(customOverrides.rainfall || 5.4);
  const [sliderWater, setSliderWater] = useState(customOverrides.water_level || 1.34);
  const [sliderSoil, setSliderSoil] = useState(customOverrides.soil_moisture || 38.2);

  const handleApplySliders = () => {
    updateCustomOverrides({
      rainfall: Number(sliderRain),
      water_level: Number(sliderWater),
      soil_moisture: Number(sliderSoil)
    });
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  return (
    <CommandCenterLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#101D2E] border border-[#1E2D42]">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">
              <Settings className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-black text-white tracking-wide">
                Command Center Settings & Simulation Studio
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure live telemetry thresholds, manual hydrological override sliders, Kalman filter parameters, and regional baselines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetSimulation}
              disabled={isScenarioLoading}
              className="px-4 py-2 rounded-xl bg-[#07111F] hover:bg-[#16273e] text-slate-200 border border-[#1E2D42] text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScenarioLoading ? 'animate-spin text-[#00D4FF]' : ''}`} />
              <span>Reset Simulation Baseline</span>
            </button>
          </div>
        </div>

        {/* 1. MONITORING REGION SELECTION & PRESETS */}
        <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl space-y-4">
          <div className="border-b border-[#1E2D42] pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Mountain className="w-4 h-4 text-[#00D4FF]" />
                Monitoring Region Selection
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose the geographical river basin for digital elevation modeling and sensor telemetry
              </p>
            </div>
            <span className="text-[10px] font-mono text-[#00D4FF] bg-cyan-500/10 px-2 py-0.5 rounded border border-[#00D4FF]/20">
              Active: {selectedRegion.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MONITORING_REGIONS.map((reg) => (
              <button
                key={reg.id}
                onClick={() => setSelectedRegion(reg)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedRegion.id === reg.id
                    ? 'bg-[#00D4FF]/15 border-[#00D4FF] text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-[#07111F] border-[#1E2D42] text-slate-300 hover:bg-[#16273e]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{reg.name}</span>
                  {selectedRegion.id === reg.id && <CheckCircle2 className="w-4 h-4 text-[#00D4FF]" />}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{reg.state}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-2">
                  Breach Threshold: {reg.dangerLevel}m • Lat {reg.lat}°
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. LIVE SENSOR SIMULATION CONTROLS & MANUAL SLIDERS */}
        <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl space-y-6">
          <div className="border-b border-[#1E2D42] pb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#00D4FF]" />
                Hydrological Simulation Controls & Live Telemetry Injection
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manually drag sliders or activate scenario presets to test real-time Kalman filtering, Monte Carlo predictions, and Dijkstra rerouting
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                customOverrides.enabled ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-cyan-500/10 text-[#00D4FF]'
              }`}>
                {customOverrides.enabled ? 'Manual Injection Active' : `Preset: ${currentScenario.toUpperCase()}`}
              </span>
            </div>
          </div>

          {/* Quick Scenario Preset Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Preset Hydrological Scenarios:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => {
                  handleScenarioChange('normal');
                  setSliderRain(5.4);
                  setSliderWater(1.34);
                  setSliderSoil(38.2);
                }}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  currentScenario === 'normal' && !customOverrides.enabled
                    ? 'bg-[#20D69A]/20 border-[#20D69A] text-[#20D69A]'
                    : 'bg-[#07111F] border-[#1E2D42] text-slate-300 hover:bg-[#16273e]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Normal Flow (Low Risk)</span>
              </button>

              <button
                onClick={() => {
                  handleScenarioChange('heavy');
                  setSliderRain(48.0);
                  setSliderWater(2.65);
                  setSliderSoil(74.0);
                }}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  currentScenario === 'heavy' && !customOverrides.enabled
                    ? 'bg-[#FF9F43]/20 border-[#FF9F43] text-[#FF9F43]'
                    : 'bg-[#07111F] border-[#1E2D42] text-slate-300 hover:bg-[#16273e]'
                }`}
              >
                <CloudRain className="w-4 h-4" />
                <span>Monsoon Downpour (High Risk)</span>
              </button>

              <button
                onClick={() => {
                  handleScenarioChange('extreme');
                  setSliderRain(115.0);
                  setSliderWater(3.78);
                  setSliderSoil(92.0);
                }}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  currentScenario === 'extreme' && !customOverrides.enabled
                    ? 'bg-[#FF3B45] text-white shadow-lg shadow-rose-600/40 animate-pulse'
                    : 'bg-[#07111F] border-rose-900/40 text-rose-400 hover:bg-rose-950/20'
                }`}
              >
                <Flame className="w-4 h-4 fill-current" />
                <span>Cloudburst Surge (Critical)</span>
              </button>

              <button
                onClick={() => {
                  handleScenarioChange('flash_breach');
                  setSliderRain(145.0);
                  setSliderWater(4.35);
                  setSliderSoil(98.0);
                }}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  currentScenario === 'flash_breach' && !customOverrides.enabled
                    ? 'bg-[#FF3B45] text-white shadow-lg shadow-rose-600/40 animate-pulse'
                    : 'bg-[#07111F] border-rose-900/40 text-rose-300 hover:bg-rose-950/20'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Dam / Gorge Breach (Max Flood)</span>
              </button>
            </div>
          </div>

          {/* Real-time Manual Telemetry Override Sliders */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00D4FF]" />
                2. Live Telemetry Injection Sliders:
              </label>
              <button
                onClick={handleApplySliders}
                className="px-3 py-1 rounded-xl bg-[#00D4FF] hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all"
              >
                {saveFeedback ? 'Applied!' : 'Apply Sliders in Real Time'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Rainfall Slider */}
              <div className="p-4 rounded-2xl bg-[#07111F] border border-[#1E2D42] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Rainfall Intensity</span>
                  <span className="font-mono font-bold text-[#00D4FF]">{sliderRain} mm/h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  step="1"
                  value={sliderRain}
                  onChange={(e) => {
                    setSliderRain(e.target.value);
                    updateCustomOverrides({ rainfall: Number(e.target.value) });
                  }}
                  className="w-full accent-[#00D4FF] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 mm/h (Dry)</span>
                  <span>150 mm/h (Cloudburst)</span>
                </div>
              </div>

              {/* Water Level Slider */}
              <div className="p-4 rounded-2xl bg-[#07111F] border border-[#1E2D42] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">River Stage (Water Level)</span>
                  <span className="font-mono font-bold text-[#00D4FF]">{sliderWater} m</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.05"
                  value={sliderWater}
                  onChange={(e) => {
                    setSliderWater(e.target.value);
                    updateCustomOverrides({ water_level: Number(e.target.value) });
                  }}
                  className="w-full accent-[#00D4FF] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.5m (Low)</span>
                  <span>Danger: {selectedRegion.dangerLevel}m</span>
                  <span>5.0m (Flooded)</span>
                </div>
              </div>

              {/* Soil Moisture Slider */}
              <div className="p-4 rounded-2xl bg-[#07111F] border border-[#1E2D42] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Soil Moisture Saturation</span>
                  <span className="font-mono font-bold text-[#20D69A]">{sliderSoil}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={sliderSoil}
                  onChange={(e) => {
                    setSliderSoil(e.target.value);
                    updateCustomOverrides({ soil_moisture: Number(e.target.value) });
                  }}
                  className="w-full accent-[#20D69A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>10% (Dry)</span>
                  <span>80% Saturation</span>
                  <span>100% (Runoff Peak)</span>
                </div>
              </div>

            </div>
          </div>

          {/* Telemetry Polling Rate Slider */}
          <div className="pt-2 border-t border-[#1E2D42] flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-white block">Telemetry Refresh Tick Rate</span>
              <span className="text-[11px] text-slate-400">Controls polling loop frequency (currently {pollingIntervalMs}ms)</span>
            </div>
            <div className="flex items-center gap-2">
              {[1000, 2000, 3000, 5000].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPollingIntervalMs(rate)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                    pollingIntervalMs === rate
                      ? 'bg-[#00D4FF] text-slate-950 font-black'
                      : 'bg-[#07111F] text-slate-300 border border-[#1E2D42]'
                  }`}
                >
                  {rate / 1000}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. ALERT THRESHOLD SETTINGS & DISPLAY PREFERENCES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Threshold Configurations */}
          <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#FF9F43]" />
              Hydrological Threshold Calibration
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Critical Danger Water Level Threshold (m):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={dangerThreshold}
                  onChange={(e) => setDangerThreshold(Number(e.target.value))}
                  className="w-full bg-[#07111F] text-white font-mono font-bold rounded-xl px-3 py-2 border border-[#1E2D42] focus:border-[#00D4FF] outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  High Risk Warning Water Level Threshold (m):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={warningThreshold}
                  onChange={(e) => setWarningThreshold(Number(e.target.value))}
                  className="w-full bg-[#07111F] text-white font-mono font-bold rounded-xl px-3 py-2 border border-[#1E2D42] focus:border-[#00D4FF] outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Soil Moisture Saturation Warning Threshold (%):
                </label>
                <input
                  type="number"
                  value={soilSaturationThreshold}
                  onChange={(e) => setSoilSaturationThreshold(Number(e.target.value))}
                  className="w-full bg-[#07111F] text-white font-mono font-bold rounded-xl px-3 py-2 border border-[#1E2D42] focus:border-[#00D4FF] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Display & Language Preferences */}
          <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#00D4FF]" />
              Interface Language & Notification Preferences
            </h3>

            <div className="space-y-4 text-xs">
              {/* Language Selector */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  System Language:
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-[#07111F] text-white font-bold rounded-xl px-3 py-2 border border-[#1E2D42] focus:border-[#00D4FF] outline-none cursor-pointer"
                >
                  <option value="en">English (Default Command Center)</option>
                  <option value="hi">Hindi - हिंदी (नागरिक अलर्ट)</option>
                  <option value="gar">Garhwali / Regional Himalayan Dialect</option>
                </select>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Audible Public Siren on Critical Alerts:</span>
                  <input
                    type="checkbox"
                    checked={autoSirenOnCritical}
                    onChange={(e) => setAutoSirenOnCritical(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00D4FF] bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Simulate Emergency Pop-up Modal on High/Critical:</span>
                  <input
                    type="checkbox"
                    checked={browserNotifications}
                    onChange={(e) => setBrowserNotifications(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00D4FF] bg-slate-900 border-slate-700"
                  />
                </label>
              </div>

              {/* Display Mode Toggle */}
              <div className="pt-2 border-t border-[#1E2D42] flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Theme Mode:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDisplayTheme('navy')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      displayTheme === 'navy' ? 'bg-[#00D4FF] text-slate-950' : 'bg-[#07111F] text-slate-300'
                    }`}
                  >
                    Dark Navy
                  </button>
                  <button
                    onClick={() => setDisplayTheme('tactical')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      displayTheme === 'tactical' ? 'bg-[#00D4FF] text-slate-950' : 'bg-[#07111F] text-slate-300'
                    }`}
                  >
                    Tactical Night
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </CommandCenterLayout>
  );
}

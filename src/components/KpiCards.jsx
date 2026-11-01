import React, { useEffect, useState } from 'react';
import { 
  Droplets, 
  CloudRain, 
  Gauge, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  Activity, 
  Radio, 
  Sparkles,
  Timer
} from 'lucide-react';
import { 
  formatWaterLevel, 
  formatRainfall, 
  formatSoilMoisture, 
  formatPercent,
  getRiskDetails 
} from '../utils/formatters';

// Smooth animated number component that pulses or transitions on updates
function AnimatedValue({ value, formatFn, className = '' }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsPulsing(true);
      setDisplayValue(value);
      const timer = setTimeout(() => setIsPulsing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <span className={`transition-all duration-300 ${isPulsing ? 'text-cyan-300 scale-105' : ''} ${className}`}>
      {formatFn ? formatFn(displayValue) : displayValue}
    </span>
  );
}

export function KpiCards({ liveSensor, prediction, risk, activeWarningCount = 0, monitoredLocationsCount = 4, secondsSinceUpdate = 0, systemStatus = 'ONLINE' }) {
  const currentRisk = risk?.risk_level || 'LOW';
  const riskDetails = getRiskDetails(currentRisk);

  const waterLevel = liveSensor?.water_level ?? 1.34;
  const rawWaterLevel = liveSensor?.raw_water_level ?? 1.38;
  const rainfall = liveSensor?.rainfall ?? 5.4;
  const soilMoisture = liveSensor?.soil_moisture ?? 38.2;
  const floodProb = risk?.flood_probability ?? prediction?.flood_probability ?? 0.0;
  const predicted30m = prediction?.mean_water_level ?? 1.40;

  // Rainfall intensity category
  let rainCategory = 'Light Rain';
  if (rainfall > 100) rainCategory = 'Cloudburst Event (>100mm/h)';
  else if (rainfall > 50) rainCategory = 'Heavy Downpour';
  else if (rainfall > 20) rainCategory = 'Moderate Showers';

  // Soil saturation
  let soilStatus = 'Good Infiltration';
  if (soilMoisture > 85) soilStatus = '100% Saturated (Max Runoff)';
  else if (soilMoisture > 65) soilStatus = 'High Moisture Level';

  return (
    <div className="space-y-4">
      
      {/* Real-time Status Indicator Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md text-xs">
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Live Sensor Status */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${systemStatus === 'ONLINE' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${systemStatus === 'ONLINE' ? 'bg-emerald-500' : 'bg-rose-600'}`} />
            </span>
            <span className="text-slate-400">Sensor Status:</span>
            <span className={`font-bold ${systemStatus === 'ONLINE' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {systemStatus === 'ONLINE' ? 'REALTIME SYNC (Active)' : 'OFFLINE SIMULATION'}
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline">•</span>

          {/* Last Updated Timestamp */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Last Telemetry Ping:</span>
            <span className="font-mono text-white font-semibold">
              {liveSensor?.timestamp || 'Just now'} ({secondsSinceUpdate}s ago)
            </span>
          </div>

        </div>

        <div className="flex flex-wrap items-center gap-4">
          
          {/* Monitored Locations Count */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Monitored Locations:</span>
            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
              {monitoredLocationsCount} Valley Nodes
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline">•</span>

          {/* Active Warnings Count */}
          <div className="flex items-center gap-1.5">
            <ShieldAlert className={`w-3.5 h-3.5 ${activeWarningCount > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
            <span className="text-slate-400">Active Warnings:</span>
            <span className={`px-2 py-0.5 rounded-md font-bold ${
              activeWarningCount > 0 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {activeWarningCount} Active
            </span>
          </div>

        </div>
      </div>

      {/* THE 6 MANDATORY DASHBOARD CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        {/* 1. CURRENT RAINFALL (mm/hr) */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800/90 p-4 shadow-xl hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Rainfall</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
              <CloudRain className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              <AnimatedValue value={rainfall} formatFn={formatRainfall} />
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${
              rainfall > 80 ? 'bg-rose-500 animate-ping' : (rainfall > 30 ? 'bg-amber-400' : 'bg-emerald-400')
            }`} />
            <span className="font-semibold text-slate-300 truncate">{rainCategory}</span>
          </div>

          <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Ridge Station</span>
            <span className="text-indigo-400 font-medium">Tipping Bucket</span>
          </div>
        </div>

        {/* 2. RIVER / STREAM WATER LEVEL (meters) */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800/90 p-4 shadow-xl hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">River Water Level</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <Droplets className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              <AnimatedValue value={waterLevel} formatFn={formatWaterLevel} />
            </span>
            <span className="text-[10px] text-slate-400">/ 3.5m danger</span>
          </div>

          {/* Progress bar towards 3.5m danger threshold */}
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                waterLevel >= 3.5 ? 'bg-rose-500' : (waterLevel >= 2.8 ? 'bg-amber-500' : 'bg-cyan-500')
              }`}
              style={{ width: `${Math.min(100, (waterLevel / 3.5) * 100)}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>Raw: {formatWaterLevel(rawWaterLevel)}</span>
            <span className="text-cyan-400 font-medium">Kalman Filtered</span>
          </div>
        </div>

        {/* 3. SOIL MOISTURE (%) */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800/90 p-4 shadow-xl hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Soil Moisture</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:scale-105 transition-transform">
              <Gauge className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              <AnimatedValue value={soilMoisture} formatFn={formatSoilMoisture} />
            </span>
          </div>

          {/* Progress bar for soil saturation */}
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                soilMoisture >= 85 ? 'bg-rose-500' : (soilMoisture >= 60 ? 'bg-amber-400' : 'bg-teal-500')
              }`}
              style={{ width: `${Math.min(100, soilMoisture)}%` }}
            />
          </div>

          <div className="mt-2 text-[10px] text-slate-400 truncate">
            {soilStatus}
          </div>
        </div>

        {/* 4. FLOOD PROBABILITY (%) */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800/90 p-4 shadow-xl hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Flood Probability</span>
            <div className={`p-2 rounded-xl ${floodProb >= 50 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'} group-hover:scale-105 transition-transform`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <span className={`text-2xl font-black font-mono tracking-tight ${
              floodProb >= 75 ? 'text-rose-400' : (floodProb >= 40 ? 'text-amber-400' : 'text-emerald-400')
            }`}>
              <AnimatedValue value={floodProb} formatFn={formatPercent} />
            </span>
          </div>

          {/* Probability bar */}
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                floodProb >= 75 ? 'bg-rose-500' : (floodProb >= 40 ? 'bg-amber-400' : 'bg-emerald-400')
              }`}
              style={{ width: `${Math.min(100, floodProb)}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>200 Scenarios</span>
            <span className="text-purple-400 font-semibold">Monte Carlo</span>
          </div>
        </div>

        {/* 5. CURRENT RISK LEVEL */}
        <div className={`relative overflow-hidden rounded-2xl bg-slate-900/85 backdrop-blur-md border p-4 shadow-xl transition-all group ${riskDetails.border}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Risk Level</span>
            <div className={`p-2 rounded-xl ${riskDetails.bg} ${riskDetails.text} group-hover:scale-105 transition-transform`}>
              {currentRisk === 'CRITICAL' || currentRisk === 'HIGH' ? (
                <ShieldAlert className="w-4 h-4 animate-bounce" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
            </div>
          </div>

          <div className="mt-2.5">
            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black tracking-wide ${riskDetails.badge}`}>
              {currentRisk}
            </span>
          </div>

          <div className="mt-3 text-[11px] font-semibold text-slate-200 truncate">
            {currentRisk === 'CRITICAL' ? 'Mandatory Evacuate' : (currentRisk === 'HIGH' ? 'Prepare Relocation' : 'Routine Monitoring')}
          </div>

          <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${risk.hysteresis_active ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
            <span>Hysteresis {risk.hysteresis_active ? 'Active' : 'Locked'}</span>
          </div>
        </div>

        {/* 6. PREDICTION TIME (30 MINUTES) */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800/90 p-4 shadow-xl hover:border-slate-700 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Prediction Lead Time</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
              <Timer className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-2xl font-black text-purple-300 font-mono tracking-tight">
              30
            </span>
            <span className="text-xs font-bold text-slate-400">Minutes</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-300 bg-slate-800/50 px-2 py-1 rounded-lg">
            <span>Forecast 30m:</span>
            <span className="font-mono text-cyan-300 font-semibold">{formatWaterLevel(predicted30m)}</span>
          </div>

          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Kinematic Wave Model</span>
          </div>
        </div>

      </div>

    </div>
  );
}

import React from 'react';
import { 
  Droplets, 
  CloudRain, 
  Gauge, 
  AlertCircle, 
  TrendingUp, 
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  formatWaterLevel, 
  formatRainfall, 
  formatSoilMoisture, 
  formatPercent,
  getRiskDetails 
} from '../utils/formatters';

export function KpiCards({ liveSensor, prediction, risk }) {
  const currentRisk = risk?.risk_level || 'LOW';
  const riskDetails = getRiskDetails(currentRisk);

  const waterLevel = liveSensor?.water_level || 1.35;
  const rawWaterLevel = liveSensor?.raw_water_level || 1.37;
  const rateOfRise = liveSensor?.rate_of_rise || 0.001;
  const rainfall = liveSensor?.rainfall || 5.0;
  const soilMoisture = liveSensor?.soil_moisture || 38.0;

  const predicted30m = prediction?.mean_water_level || 1.40;
  const floodProb = risk?.flood_probability ?? prediction?.flood_probability ?? 0.0;
  const ciLower = prediction?.confidence_interval?.lower ?? 1.25;
  const ciUpper = prediction?.confidence_interval?.upper ?? 1.55;

  // Determine rainfall category
  let rainCategory = 'Light Rain';
  if (rainfall > 100) rainCategory = 'Cloudburst Event';
  else if (rainfall > 50) rainCategory = 'Heavy Downpour';
  else if (rainfall > 20) rainCategory = 'Moderate Showers';

  // Determine soil saturation status
  let soilStatus = 'High Absorption';
  if (soilMoisture > 85) soilStatus = 'Fully Saturated (0% Infiltration)';
  else if (soilMoisture > 65) soilStatus = 'Moderately Saturated';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
      
      {/* 1. CURRENT WATER LEVEL */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 p-4 shadow-lg hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Water Level</span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-cyan-400 border border-cyan-500/20">
            <Droplets className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-white tracking-tight">
            {formatWaterLevel(waterLevel)}
          </span>
          <span className="text-[10px] text-slate-400">/ 3.50m danger</span>
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

      {/* 2. RAINFALL RATE */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 p-4 shadow-lg hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rainfall Rate</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CloudRain className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2.5">
          <span className="text-2xl font-black text-white tracking-tight">
            {formatRainfall(rainfall)}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[11px]">
          <span className={`w-2 h-2 rounded-full ${
            rainfall > 80 ? 'bg-rose-500 animate-ping' : (rainfall > 30 ? 'bg-amber-400' : 'bg-emerald-400')
          }`} />
          <span className="font-semibold text-slate-300 truncate">{rainCategory}</span>
        </div>

        <div className="mt-1 text-[10px] text-slate-400">
          Ridge Radar Station
        </div>
      </div>

      {/* 3. SOIL MOISTURE */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 p-4 shadow-lg hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Soil Moisture</span>
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Gauge className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2.5">
          <span className="text-2xl font-black text-white tracking-tight">
            {formatSoilMoisture(soilMoisture)}
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

      {/* 4. PREDICTED 30-MIN WATER LEVEL */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 p-4 shadow-lg hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">30-Min Forecast</span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className={`text-2xl font-black tracking-tight ${predicted30m >= 3.5 ? 'text-rose-400' : 'text-white'}`}>
            {formatWaterLevel(predicted30m)}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-300 bg-slate-800/50 px-2 py-1 rounded-lg">
          <span>95% CI:</span>
          <span className="font-mono text-cyan-300 font-semibold">[{ciLower.toFixed(2)} - {ciUpper.toFixed(2)}m]</span>
        </div>

        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>200 Monte-Carlo Runs</span>
        </div>
      </div>

      {/* 5. FLOOD PROBABILITY */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 p-4 shadow-lg hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Flood Probability</span>
          <div className={`p-2 rounded-xl ${floodProb >= 50 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2.5">
          <span className={`text-2xl font-black tracking-tight ${
            floodProb >= 75 ? 'text-rose-400' : (floodProb >= 40 ? 'text-amber-400' : 'text-emerald-400')
          }`}>
            {formatPercent(floodProb)}
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

        <div className="mt-2 text-[10px] text-slate-400">
          {floodProb >= 50 ? 'Threshold breach imminent' : 'Breach risk nominal'}
        </div>
      </div>

      {/* 6. CURRENT RISK STATUS */}
      <div className={`relative overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur-md border p-4 shadow-lg transition-all ${riskDetails.border}`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Risk Assessment</span>
          <div className={`p-2 rounded-xl ${riskDetails.bg} ${riskDetails.text}`}>
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
          {currentRisk === 'CRITICAL' ? 'Mandatory Evacuation' : (currentRisk === 'HIGH' ? 'Prepare Relocation' : 'Status Monitoring')}
        </div>

        <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${risk.hysteresis_active ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
          <span>Hysteresis {risk.hysteresis_active ? 'Filtering Jitter' : 'Calibrated'}</span>
        </div>
      </div>

    </div>
  );
}

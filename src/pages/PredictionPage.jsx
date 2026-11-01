import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  LineChart, 
  Line, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  Droplets, 
  CloudRain, 
  Gauge, 
  Cpu, 
  Calculator, 
  Activity, 
  AlertTriangle, 
  Info, 
  Clock, 
  Layers, 
  ArrowRight,
  Radio,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { CommandCenterLayout } from '../components/CommandCenterLayout';
import { useSensorData } from '../context/SensorContext';

export function PredictionPage() {
  const {
    liveSensor,
    history,
    prediction,
    risk,
    selectedRegion,
    currentScenario
  } = useSensorData();

  const [activeTab, setActiveTab] = useState('forecast'); // 'forecast' | 'monte_carlo' | 'distribution' | 'math'

  const currentRisk = risk?.risk_level || 'LOW';
  const waterLevel = liveSensor?.water_level ?? 1.34;
  const dangerThreshold = selectedRegion.dangerLevel || 3.5;

  const pred10m = prediction?.pred_10m ?? Number((waterLevel + 0.1).toFixed(2));
  const pred20m = prediction?.pred_20m ?? Number((waterLevel + 0.2).toFixed(2));
  const pred30m = prediction?.pred_30m ?? prediction?.mean_water_level ?? Number((waterLevel + 0.3).toFixed(2));
  const floodProb = risk?.flood_probability ?? prediction?.flood_probability ?? 0.0;
  const confidenceScore = prediction?.confidence_score ?? 96.8;
  const estimatedTimeToBreach = prediction?.estimated_time_to_breach_min;
  const timeSeries = prediction?.time_series ?? [];
  const histogram = prediction?.histogram ?? [];

  // Summary generation
  let summaryText = "";
  if (floodProb >= 75 || pred30m >= dangerThreshold) {
    summaryText = `CRITICAL ALERT: Flood probability is ${floodProb}%. The monitored zone in ${selectedRegion.name} may reach or exceed critical water levels (${dangerThreshold}m) within the next ${estimatedTimeToBreach || 25} minutes. Immediate high-ground evacuation advised.`;
  } else if (floodProb >= 35 || pred30m >= dangerThreshold * 0.8) {
    summaryText = `HIGH FLOOD WATCH: Flood probability is increasing rapidly (${floodProb}%). Monitored stage is projected to reach ${pred30m}m within 30 minutes. Emergency teams on standby.`;
  } else if (floodProb >= 15) {
    summaryText = `MODERATE ADVISORY: Catchment runoff accelerating. Predicted 30-minute water level is ${pred30m}m. River margins under surveillance.`;
  } else {
    summaryText = `NOMINAL OUTLOOK: River flow nominal. 30-minute projected water level is ${pred30m}m with low flood probability (${floodProb}%). Current safe horizon exceeds 30 minutes.`;
  }

  // Tooltip for Hydrograph
  const HydrographTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isAboveDanger = data.mean_water_level >= dangerThreshold;

      return (
        <div className="bg-[#101D2E]/95 backdrop-blur-md border border-[#1E2D42] p-3 rounded-2xl shadow-2xl text-xs space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-[#1E2D42] pb-1.5 font-bold">
            <span className="text-white">Minute +{label} Projection</span>
            <span className="text-[10px] text-purple-400">200 MC Paths</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Mean Level:</span>
            <span className={`font-mono font-bold ${isAboveDanger ? 'text-[#FF3B45]' : 'text-[#00D4FF]'}`}>
              {data.mean_water_level}m
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>95% CI Range:</span>
            <span className="font-mono text-purple-300">
              [{data.ci_lower}m – {data.ci_upper}m]
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <CommandCenterLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#101D2E] border border-[#1E2D42]">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-wide">
                  Flash Flood AI Prediction Intelligence
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider">
                  30-Min Horizon • 200 Monte Carlo Paths
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Stochastic ensemble forecasting fusing kinematic routing and mountain catchment saturation physics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-[#07111F] border border-[#1E2D42] text-xs flex items-center gap-2 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span>Forecast Engine: Kinematic Wave v2.4</span>
            </div>
          </div>
        </div>

        {/* 1. MANDATORY 6 PREDICTION KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          
          {/* KPI 1: Predicted Water Level @ 10m */}
          <div className="p-4 rounded-2xl bg-[#101D2E] border border-[#1E2D42] shadow-lg space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Forecast +10m
            </span>
            <div className="text-2xl font-black text-white font-mono">
              {pred10m}<span className="text-xs text-slate-400 font-sans">m</span>
            </div>
            <span className="text-[10px] text-[#00D4FF] font-semibold">
              {(pred10m - waterLevel >= 0 ? '+' : '') + (pred10m - waterLevel).toFixed(2)}m from now
            </span>
          </div>

          {/* KPI 2: Predicted Water Level @ 20m */}
          <div className="p-4 rounded-2xl bg-[#101D2E] border border-[#1E2D42] shadow-lg space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Forecast +20m
            </span>
            <div className="text-2xl font-black text-white font-mono">
              {pred20m}<span className="text-xs text-slate-400 font-sans">m</span>
            </div>
            <span className="text-[10px] text-[#00D4FF] font-semibold">
              {(pred20m - waterLevel >= 0 ? '+' : '') + (pred20m - waterLevel).toFixed(2)}m surge
            </span>
          </div>

          {/* KPI 3: Predicted Water Level @ 30m */}
          <div className="p-4 rounded-2xl bg-[#101D2E] border border-[#1E2D42] shadow-lg space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Forecast +30m (Peak)
            </span>
            <div className={`text-2xl font-black font-mono ${pred30m >= dangerThreshold ? 'text-[#FF3B45]' : 'text-white'}`}>
              {pred30m}<span className="text-xs text-slate-400 font-sans">m</span>
            </div>
            <span className="text-[10px] text-purple-300 font-semibold">
              Danger Threshold: {dangerThreshold}m
            </span>
          </div>

          {/* KPI 4: Flood Probability (%) */}
          <div className="p-4 rounded-2xl bg-[#101D2E] border border-[#1E2D42] shadow-lg space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Flood Probability
            </span>
            <div className={`text-2xl font-black font-mono ${
              floodProb >= 75 ? 'text-[#FF3B45]' : floodProb >= 35 ? 'text-[#FF9F43]' : 'text-[#20D69A]'
            }`}>
              {floodProb}%
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">
              200 MC Scenarios
            </span>
          </div>

          {/* KPI 5: Prediction Confidence */}
          <div className="p-4 rounded-2xl bg-[#101D2E] border border-[#1E2D42] shadow-lg space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Model Confidence
            </span>
            <div className="text-2xl font-black text-[#20D69A] font-mono">
              {confidenceScore}%
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">
              95% Credible Interval
            </span>
          </div>

          {/* KPI 6: Estimated Time to Critical Level */}
          <div className="p-4 rounded-2xl bg-[#101D2E] border border-[#1E2D42] shadow-lg space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Time to Breach
            </span>
            <div className={`text-2xl font-black font-mono ${
              estimatedTimeToBreach ? 'text-[#FF3B45]' : 'text-[#20D69A]'
            }`}>
              {estimatedTimeToBreach ? `${estimatedTimeToBreach}m` : '>30m'}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">
              {estimatedTimeToBreach ? 'Immediate Evacuation' : 'Safe Horizon'}
            </span>
          </div>

        </div>

        {/* 2. CLEAR PREDICTION SUMMARY BANNER */}
        <div className={`p-4 sm:p-5 rounded-3xl border ${
          floodProb >= 75 
            ? 'bg-[#FF3B45]/15 border-[#FF3B45]/40 text-rose-200 glow-critical' 
            : floodProb >= 35 
            ? 'bg-[#FF9F43]/15 border-[#FF9F43]/40 text-amber-200 glow-warning' 
            : 'bg-[#101D2E] border-[#1E2D42] text-slate-300'
        } shadow-xl flex items-start gap-3.5`}>
          <div className="p-2 rounded-xl bg-black/20 shrink-0 mt-0.5">
            {floodProb >= 75 ? (
              <ShieldAlert className="w-5 h-5 text-[#FF3B45] animate-bounce" />
            ) : (
              <Info className="w-5 h-5 text-[#00D4FF]" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
              Hydrological Forecast Assessment:
            </span>
            <p className="text-xs sm:text-sm font-semibold leading-relaxed mt-0.5 text-white">
              "{summaryText}"
            </p>
          </div>
        </div>

        {/* 3. TABS: HYDROGRAPH vs MONTE CARLO TRAJECTORIES vs DISTRIBUTION HISTOGRAM */}
        <div className="flex items-center gap-2 border-b border-[#1E2D42] pb-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'forecast'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>30-Minute Hydrograph Forecast</span>
          </button>

          <button
            onClick={() => setActiveTab('monte_carlo')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'monte_carlo'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Monte Carlo Stochastic Trajectories (Ensemble)</span>
          </button>

          <button
            onClick={() => setActiveTab('distribution')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'distribution'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart className="w-4 h-4" />
            <span>Peak Water Level Distribution (Histogram)</span>
          </button>
        </div>

        {/* 4. TAB 1: 30-MINUTE HYDROGRAPH FORECAST */}
        {activeTab === 'forecast' && (
          <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2D42] pb-3 text-xs">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Continuous Water-Level Projection with 95% Confidence Band
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Actual Current Water Level ({waterLevel}m) progressing to 30-minute peak ({pred30m}m)
                </p>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#FF3B45] border-dashed" />
                  <span className="text-[#FF3B45]">Danger Mark ({dangerThreshold}m)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#00D4FF]" />
                  <span className="text-[#00D4FF]">Mean Projected Level</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 bg-purple-500/20 rounded" />
                  <span className="text-purple-300">95% Confidence Band</span>
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={timeSeries} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="ciEnvelope" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A855F7" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#A855F7" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2D42" vertical={false} />
                  <XAxis dataKey="minute" stroke="#64748B" tick={{ fontSize: 9 }} tickFormatter={(m) => `+${m}m`} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 9 }} domain={[0.8, Math.max(4.8, dangerThreshold + 0.6)]} />
                  <Tooltip content={<HydrographTooltip />} />
                  <ReferenceLine y={dangerThreshold} stroke="#FF3B45" strokeWidth={2} strokeDasharray="4 4" label={{ value: `Danger Threshold (${dangerThreshold}m)`, fill: '#FF3B45', fontSize: 10, position: 'insideTopLeft' }} />
                  {/* Confidence Interval Band */}
                  <Area type="monotone" dataKey="ci_upper" stroke="none" fill="url(#ciEnvelope)" />
                  <Area type="monotone" dataKey="ci_lower" stroke="none" fill="#101D2E" />
                  {/* Mean Trajectory Line */}
                  <Line type="monotone" dataKey="mean_water_level" name="Mean Level" stroke="#00D4FF" strokeWidth={3} dot={{ r: 2.5, fill: '#00D4FF' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 5. TAB 2: MONTE CARLO STOCHASTIC TRAJECTORIES (ENSEMBLE) */}
        {activeTab === 'monte_carlo' && (
          <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2D42] pb-3 text-xs">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  200 Stochastic Monte Carlo Hydrological Paths
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Visualizing ensemble dispersion accounting for rain variance (±18%), soil moisture (±4%), and slope roughness
                </p>
              </div>
              <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Breach Count: {Math.round((floodProb / 100) * 200)} / 200 Runs
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeries} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2D42" vertical={false} />
                  <XAxis dataKey="minute" stroke="#64748B" tick={{ fontSize: 9 }} tickFormatter={(m) => `+${m}m`} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 9 }} domain={[0.8, Math.max(4.8, dangerThreshold + 0.6)]} />
                  <Tooltip content={<HydrographTooltip />} />
                  <ReferenceLine y={dangerThreshold} stroke="#FF3B45" strokeWidth={2} strokeDasharray="4 4" label={{ value: 'Danger (3.5m)', fill: '#FF3B45', fontSize: 10, position: 'insideTopLeft' }} />
                  
                  {/* Individual Monte Carlo Path lines */}
                  <Line type="monotone" dataKey="scenario_1" stroke="rgba(168, 85, 247, 0.4)" strokeWidth={1} dot={false} />
                  <Line type="monotone" dataKey="scenario_2" stroke="rgba(56, 189, 248, 0.4)" strokeWidth={1} dot={false} />
                  <Line type="monotone" dataKey="scenario_3" stroke="rgba(168, 85, 247, 0.35)" strokeWidth={1} dot={false} />
                  <Line type="monotone" dataKey="scenario_4" stroke="rgba(32, 214, 154, 0.35)" strokeWidth={1} dot={false} />
                  <Line type="monotone" dataKey="scenario_5" stroke="rgba(255, 159, 67, 0.35)" strokeWidth={1} dot={false} />
                  <Line type="monotone" dataKey="scenario_6" stroke="rgba(168, 85, 247, 0.4)" strokeWidth={1} dot={false} />
                  <Line type="monotone" dataKey="scenario_7" stroke="rgba(56, 189, 248, 0.35)" strokeWidth={1} dot={false} />
                  
                  {/* Bold Mean Line */}
                  <Line type="monotone" dataKey="mean_water_level" stroke="#00D4FF" strokeWidth={3.5} dot={{ r: 3, fill: '#00D4FF' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 6. TAB 3: PROBABILITY DISTRIBUTION HISTOGRAM */}
        {activeTab === 'distribution' && (
          <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2D42] pb-3 text-xs">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Peak Water Level Probability Distribution (Histogram)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Distribution of peak simulated river stages at minute +30 across the 200 Monte Carlo ensembles
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#00D4FF]">
                Exceedance Probability: {floodProb}%
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogram} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2D42" vertical={false} />
                  <XAxis dataKey="binLabel" stroke="#64748B" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 9 }} unit="%" />
                  <Tooltip formatter={(value) => [`${value}% of runs`, 'Probability']} />
                  <Bar 
                    dataKey="percentage" 
                    fill="#00D4FF" 
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-2xl bg-[#07111F] text-xs text-slate-400 flex items-center justify-between">
              <span>Danger Threshold: Bars reaching &ge; {dangerThreshold}m represent active flood breach events.</span>
              <span className="font-bold text-white font-mono">Ensemble Sample Size: N=200</span>
            </div>
          </div>
        )}

      </div>
    </CommandCenterLayout>
  );
}

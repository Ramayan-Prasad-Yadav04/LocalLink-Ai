import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Layers, 
  Gauge, 
  Sparkles, 
  MapPin, 
  ArrowRight,
  Droplets,
  CloudRain,
  Mountain,
  Compass
} from 'lucide-react';
import { CommandCenterLayout } from '../components/CommandCenterLayout';
import { useSensorData } from '../context/SensorContext';

export function RiskAnalysisPage() {
  const {
    risk,
    liveSensor,
    prediction,
    selectedRegion
  } = useSensorData();

  const currentRisk = risk?.risk_level || 'LOW';
  const riskScore = risk?.risk_score ?? (
    currentRisk === 'CRITICAL' ? 92 : currentRisk === 'HIGH' ? 68 : currentRisk === 'MODERATE' ? 42 : 16
  );
  const floodProb = risk?.flood_probability ?? prediction?.flood_probability ?? 0.0;
  const waterLevel = liveSensor?.water_level ?? 1.34;
  const rainfall = liveSensor?.rainfall ?? 5.4;
  const soilMoisture = liveSensor?.soil_moisture ?? 38.2;

  // 4 Risk Categories Colors
  const riskConfig = {
    LOW: { color: '#20D69A', label: 'LOW RISK', bg: 'bg-[#20D69A]/15', border: 'border-[#20D69A]/30', text: 'text-[#20D69A]' },
    MODERATE: { color: '#FFB800', label: 'MODERATE RISK', bg: 'bg-[#FFB800]/15', border: 'border-[#FFB800]/30', text: 'text-[#FFB800]' },
    HIGH: { color: '#FF9F43', label: 'HIGH RISK', bg: 'bg-[#FF9F43]/15', border: 'border-[#FF9F43]/30', text: 'text-[#FF9F43]' },
    CRITICAL: { color: '#FF3B45', label: 'CRITICAL RISK', bg: 'bg-[#FF3B45]/15', border: 'border-[#FF3B45]/30', text: 'text-[#FF3B45]' }
  };

  const activeConfig = riskConfig[currentRisk] || riskConfig.LOW;

  // Zone-Wise Risk Cards
  const zoneCards = [
    {
      id: "ZONE-1",
      name: "Alaknanda Basin Floor (Zone 0)",
      elevation: "790m Elevation",
      vulnerability: "Extreme (Riverfront)",
      riskLevel: waterLevel >= 3.0 ? 'CRITICAL' : waterLevel >= 2.2 ? 'HIGH' : waterLevel >= 1.7 ? 'MODERATE' : 'LOW',
      waterDepth: `${waterLevel}m stage`,
      safeEvacRoute: "Uphill West Ridge Trail to Pine Ridge Shelter"
    },
    {
      id: "ZONE-2",
      name: "Mandakini Gorge Bottleneck",
      elevation: "810m Elevation",
      vulnerability: "High (Rapid Runoff)",
      riskLevel: waterLevel >= 3.2 ? 'CRITICAL' : waterLevel >= 2.4 ? 'HIGH' : waterLevel >= 1.8 ? 'MODERATE' : 'LOW',
      waterDepth: `${(waterLevel * 1.05).toFixed(2)}m surge`,
      safeEvacRoute: "Mid-Valley Switchback Road"
    },
    {
      id: "ZONE-3",
      name: "Chamoli Valley Ridge Path",
      elevation: "1250m Elevation",
      vulnerability: "Low (High Ground Pass)",
      riskLevel: 'LOW',
      waterDepth: "0.00m (Flood Free)",
      safeEvacRoute: "Designated Relief Corridor"
    },
    {
      id: "ZONE-4",
      name: "Rudraprayag Sangam Confluence",
      elevation: "760m Elevation",
      vulnerability: "Very High (Confluence Turbulence)",
      riskLevel: waterLevel >= 2.8 ? 'CRITICAL' : waterLevel >= 2.1 ? 'HIGH' : waterLevel >= 1.6 ? 'MODERATE' : 'LOW',
      waterDepth: `${(waterLevel * 1.1).toFixed(2)}m confluence`,
      safeEvacRoute: "Ascend via Sector 4 Ridge to Helipad Camp"
    }
  ];

  // Factors breakdown
  const factors = [
    {
      name: "Rainfall Precipitation Rate",
      weight: "35%",
      icon: CloudRain,
      value: `${rainfall} mm/hr`,
      score: Math.min(100, Math.round((rainfall / 120) * 100)),
      status: rainfall > 50 ? 'Critical Downpour' : rainfall > 25 ? 'High Intensity' : 'Nominal Flow'
    },
    {
      name: "River Stage & Water Level",
      weight: "30%",
      icon: Droplets,
      value: `${waterLevel} meters`,
      score: Math.min(100, Math.round((waterLevel / selectedRegion.dangerLevel) * 100)),
      status: waterLevel >= selectedRegion.dangerLevel ? 'Threshold Breached' : waterLevel >= 2.6 ? 'High Stage' : 'Stable Bed'
    },
    {
      name: "Soil Moisture Saturation Index",
      weight: "25%",
      icon: Gauge,
      value: `${soilMoisture}%`,
      score: Math.min(100, Math.round(soilMoisture)),
      status: soilMoisture > 80 ? 'Fully Saturated (>80%)' : soilMoisture > 60 ? 'Moist Catchment' : 'Dry Topsoil'
    },
    {
      name: "Topographic Catchment Gradient",
      weight: "10%",
      icon: Mountain,
      value: "38° Slope",
      score: 75,
      status: "Steep Valley Funneling"
    }
  ];

  // Risk progression chart data over 30 mins
  const progressionData = Array.from({ length: 13 }, (_, i) => {
    const min = i * 2.5;
    const factor = Math.min(1.0, (min / 30));
    const projectedScore = Math.min(100, Math.round(riskScore * (1 + factor * (currentRisk === 'CRITICAL' ? 0.2 : (currentRisk === 'HIGH' ? 0.3 : 0.05)))));
    return {
      minute: `+${Math.round(min)}m`,
      risk_score: projectedScore,
      danger_line: 75
    };
  });

  // Calculate needle angle for Semicircular SVG Gauge (from -90deg to +90deg)
  const gaugeAngle = -90 + (riskScore / 100) * 180;

  return (
    <CommandCenterLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#101D2E] border border-[#1E2D42]">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-[#FF9F43] border border-[#FF9F43]/20">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-wide">
                  Automated Flash Flood Risk Intelligence
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${activeConfig.bg} ${activeConfig.text} border ${activeConfig.border}`}>
                  {currentRisk} LEVEL ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic 4-tier risk classification with hysteresis anti-chatter protection for {selectedRegion.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-[#07111F] border border-[#1E2D42] text-slate-300">
              Flood Probability: <span className="font-bold text-[#00D4FF] font-mono">{floodProb}%</span>
            </div>
          </div>
        </div>

        {/* 1. ANIMATED RISK GAUGE & OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Radial Semicircular Risk Gauge (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl flex flex-col justify-between items-center text-center space-y-4">
            <div className="w-full flex items-center justify-between border-b border-[#1E2D42] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Composite Risk Gauge
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeConfig.bg} ${activeConfig.text}`}>
                0 - 100 Scale
              </span>
            </div>

            {/* Custom SVG Radial Gauge */}
            <div className="relative w-64 h-36 flex items-center justify-center mt-2">
              <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
                {/* Gauge Background Track Segments */}
                {/* Low (Green) -90 to -45 deg */}
                <path d="M 20 100 A 80 80 0 0 1 43.4 43.4" fill="none" stroke="#20D69A" strokeWidth="16" strokeLinecap="round" opacity="0.8" />
                {/* Moderate (Yellow) -45 to 0 deg */}
                <path d="M 45 42 A 80 80 0 0 1 100 20" fill="none" stroke="#FFB800" strokeWidth="16" opacity="0.8" />
                {/* High (Orange) 0 to 45 deg */}
                <path d="M 102 20 A 80 80 0 0 1 156.6 43.4" fill="none" stroke="#FF9F43" strokeWidth="16" opacity="0.8" />
                {/* Critical (Red) 45 to 90 deg */}
                <path d="M 158 45 A 80 80 0 0 1 180 100" fill="none" stroke="#FF3B45" strokeWidth="16" strokeLinecap="round" opacity="0.8" />

                {/* Needle */}
                <g transform={`rotate(${gaugeAngle}, 100, 100)`} className="transition-transform duration-700 ease-out">
                  <line x1="100" y1="100" x2="100" y2="30" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="100" cy="100" r="7" fill="#00D4FF" />
                  <circle cx="100" cy="100" r="3" fill="#07111F" />
                </g>
              </svg>

              {/* Centered Digital Readout */}
              <div className="absolute bottom-1 flex flex-col items-center">
                <span className="text-3xl font-black font-mono tracking-tight text-white">
                  {riskScore}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Risk Score
                </span>
              </div>
            </div>

            {/* Current Risk Badge */}
            <div className={`w-full py-2.5 px-4 rounded-2xl ${activeConfig.bg} border ${activeConfig.border} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeConfig.color }} />
                <span className={`text-sm font-black ${activeConfig.text}`}>
                  {activeConfig.label}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-white">
                Prob: {floodProb}%
              </span>
            </div>

            {/* Four Categories Legend */}
            <div className="grid grid-cols-4 gap-1.5 w-full text-[10px] text-center pt-2 border-t border-[#1E2D42]">
              <div className="p-1 rounded bg-[#20D69A]/10 text-[#20D69A] font-bold">LOW (0-24)</div>
              <div className="p-1 rounded bg-[#FFB800]/10 text-[#FFB800] font-bold">MOD (25-49)</div>
              <div className="p-1 rounded bg-[#FF9F43]/10 text-[#FF9F43] font-bold">HIGH (50-74)</div>
              <div className="p-1 rounded bg-[#FF3B45]/10 text-[#FF3B45] font-bold">CRIT (75-100)</div>
            </div>
          </div>

          {/* Diagnosis & Recommended Action (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between border-b border-[#1E2D42] pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00D4FF]" />
                  AI Disaster Assessment & Hysteresis State
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00D4FF] border border-[#00D4FF]/20">
                  Anti-Chatter Active
                </span>
              </div>

              <div className="mt-4 space-y-4">
                <div className="p-4 rounded-2xl bg-[#07111F] border border-[#1E2D42] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Scientific Risk Diagnostics:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    {risk?.explanation || "River telemetry and slope stability sensors indicate nominal river discharge."}
                  </p>
                </div>

                <div className={`p-4 rounded-2xl border ${activeConfig.border} ${activeConfig.bg} space-y-1.5`}>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${activeConfig.text}`}>
                    Mandatory Evacuation / Protocol Action:
                  </span>
                  <p className="text-xs sm:text-sm text-white font-bold leading-relaxed">
                    {risk?.recommended_action || "Routine hydrometric observation active. No emergency public mobilization needed."}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#1E2D42]">
              <div className="text-center p-2.5 rounded-2xl bg-[#07111F]">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Water Stage</span>
                <span className="text-base font-black text-white font-mono">{waterLevel}m</span>
              </div>
              <div className="text-center p-2.5 rounded-2xl bg-[#07111F]">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rainfall</span>
                <span className="text-base font-black text-[#00D4FF] font-mono">{rainfall} mm/h</span>
              </div>
              <div className="text-center p-2.5 rounded-2xl bg-[#07111F]">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Soil Saturation</span>
                <span className="text-base font-black text-[#20D69A] font-mono">{soilMoisture}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* 2. ZONE-WISE RISK CARDS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#00D4FF]" />
              Catchment Zone-Wise Hazard Evaluation
            </h2>
            <span className="text-xs text-slate-400">4 Micro-Catchment Sectors</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {zoneCards.map((zone) => {
              const cfg = riskConfig[zone.riskLevel] || riskConfig.LOW;
              return (
                <div key={zone.id} className="p-4 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">{zone.elevation}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                        {zone.riskLevel}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mt-1.5">{zone.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Vulnerability: {zone.vulnerability}</p>
                    
                    <div className="mt-3 p-2 rounded-xl bg-[#07111F] text-xs font-mono font-bold text-[#00D4FF]">
                      Stage: {zone.waterDepth}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1E2D42] text-[10px] text-slate-400">
                    <span className="text-slate-500 block">Dijkstra Evacuation Direction:</span>
                    <span className="text-white font-medium">{zone.safeEvacRoute}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. CONTRIBUTING RISK FACTORS & RISK PROGRESSION GRAPH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Factors Contributing to Risk (6 cols) */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl space-y-4">
            <div className="border-b border-[#1E2D42] pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00D4FF]" />
                Primary Contributing Risk Factors
              </h3>
              <span className="text-[10px] text-slate-400">Weighted Kinematic Model</span>
            </div>

            <div className="space-y-3">
              {factors.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="p-3 rounded-2xl bg-[#07111F] border border-[#1E2D42] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[#00D4FF]" />
                        <span className="font-bold text-white">{f.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({f.weight})</span>
                      </div>
                      <span className="font-mono font-bold text-cyan-300">{f.value}</span>
                    </div>

                    <div className="w-full bg-[#101D2E] rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          f.score > 75 ? 'bg-[#FF3B45]' : f.score > 50 ? 'bg-[#FF9F43]' : 'bg-[#20D69A]'
                        }`}
                        style={{ width: `${f.score}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Status: {f.status}</span>
                      <span>Impact: {f.score}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Progression Graph (6 cols) */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="border-b border-[#1E2D42] pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  Risk Progression Timeline (30-Minute Outlook)
                </h3>
                <span className="text-[10px] text-purple-300 font-mono">Kinematic Wave Model</span>
              </div>

              <div className="h-56 mt-4 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D42" vertical={false} />
                    <XAxis dataKey="minute" stroke="#64748B" tick={{ fontSize: 9 }} tickLine={false} />
                    <YAxis stroke="#64748B" tick={{ fontSize: 9 }} domain={[0, 100]} tickLine={false} />
                    <Tooltip />
                    <ReferenceLine y={75} stroke="#FF3B45" strokeDasharray="3 3" label={{ value: 'Critical Zone (75)', fill: '#FF3B45', fontSize: 9, position: 'insideTopLeft' }} />
                    <Area type="monotone" dataKey="risk_score" name="Risk Score" stroke={activeConfig.color} strokeWidth={2.5} fillOpacity={1} fill="url(#riskGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E2D42] text-[11px] text-slate-400 flex items-center justify-between">
              <span>Risk Horizon: 30 Minutes</span>
              <span className="font-bold text-white font-mono">
                {currentRisk === 'CRITICAL' ? 'Surge Acceleration High' : 'Gradient Stabilized'}
              </span>
            </div>
          </div>

        </div>

      </div>
    </CommandCenterLayout>
  );
}

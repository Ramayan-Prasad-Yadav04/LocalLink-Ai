import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Waves, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  MapPin, 
  TrendingUp, 
  Compass, 
  CloudRain, 
  Droplets, 
  Radio, 
  AlertTriangle, 
  Cpu, 
  CheckCircle2, 
  Share2, 
  PhoneCall, 
  Flame, 
  ArrowUpRight,
  Sparkles,
  Zap,
  Mountain,
  Navigation,
  Layers,
  Clock,
  Gauge
} from 'lucide-react';
import { useSensorData } from '../context/SensorContext';
import { MountainLandscapeAnimation } from '../components/MountainLandscapeAnimation';
import { formatWaterLevel, formatRainfall, formatSoilMoisture, getRiskDetails } from '../utils/formatters';

export function LandingPage() {
  const { liveSensor, prediction, risk, currentScenario, handleScenarioChange, selectedRegion } = useSensorData();
  const riskDetails = getRiskDetails(risk?.risk_level);

  const keyStatistics = [
    {
      value: "30-Min",
      label: "Prediction Horizon",
      desc: "Advance early warning before flash flood crest reaches valley settlements",
      icon: Clock,
      color: "text-[#00D4FF]",
      border: "border-[#00D4FF]/30",
      bg: "bg-[#00D4FF]/10"
    },
    {
      value: "3 Sensor",
      label: "Environmental Types",
      desc: "Rainfall intensity (mm/h), ultrasonic stage (m), and capacitive soil moisture (%)",
      icon: Gauge,
      color: "text-[#20D69A]",
      border: "border-[#20D69A]/30",
      bg: "bg-[#20D69A]/10"
    },
    {
      value: "4 Levels",
      label: "Flood Risk Matrix",
      desc: "LOW, MODERATE, HIGH, and CRITICAL stateful hysteresis classification",
      icon: ShieldAlert,
      color: "text-[#FF9F43]",
      border: "border-[#FF9F43]/30",
      bg: "bg-[#FF9F43]/10"
    },
    {
      value: "Dijkstra",
      label: "Intelligent Evacuation",
      desc: "Dynamic shortest safe path routing actively avoiding flooded roads and bridges",
      icon: Navigation,
      color: "text-purple-400",
      border: "border-purple-500/30",
      bg: "bg-purple-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 selection:bg-[#00D4FF] selection:text-slate-950 flex flex-col font-sans">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#07111F]/90 backdrop-blur-md border-b border-[#1E2D42] px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D4FF] via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-[#00D4FF]/40 group-hover:scale-105 transition-transform">
              <Waves className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">
                  FLOODWATCH <span className="bg-gradient-to-r from-[#00D4FF] to-blue-400 bg-clip-text text-transparent">AI</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00D4FF] border border-[#00D4FF]/25">
                  SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Better Future, Secure You.</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#landscape" className="hover:text-[#00D4FF] transition-colors">Live Simulation</a>
            <a href="#features" className="hover:text-[#00D4FF] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#00D4FF] transition-colors">How It Works</a>
            <a href="#technology" className="hover:text-[#00D4FF] transition-colors">Technology</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Activity className="w-4 h-4 text-slate-950" />
              <span>Launch Live Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-20 px-4 overflow-hidden">
        {/* Ambient Top Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/15 to-indigo-700/10 rounded-full blur-[110px] pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto text-center space-y-6">
          
          {/* SIH Hackathon & Live Status Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-[#101D2E] border border-[#1E2D42] text-xs shadow-xl">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20D69A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#20D69A]" />
            </span>
            <span className="font-bold text-white tracking-wide">Smart India Hackathon 2026</span>
            <span className="text-slate-500">•</span>
            <span className="text-[#00D4FF] font-semibold flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5" /> Flash Flood Prediction System for Hilly Regions
            </span>
          </div>

          {/* Hero Heading: Exact user requested string */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08]">
              Predict Before It Happens.{' '}
              <span className="bg-gradient-to-r from-[#00D4FF] via-sky-300 to-blue-500 bg-clip-text text-transparent">
                Evacuate Before It's Too Late.
              </span>
            </h1>

            {/* Subtitle explaining 30-minute flash flood prediction */}
            <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              FloodWatch AI provides high-precision <strong className="text-white">30-minute advance flash flood prediction</strong> and intelligent Dijkstra evacuation management for hilly river basins by fusing IoT hydrometric telemetry with kinematic wave hydrology and Monte Carlo probabilistic models.
            </p>
          </div>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#00D4FF] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-cyan-500/25 flex items-center gap-2 group transition-all transform hover:-translate-y-0.5"
            >
              <Activity className="w-4 h-4 text-slate-950" />
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/prediction"
              className="px-7 py-3.5 rounded-2xl bg-[#101D2E] hover:bg-[#16273e] text-white font-bold text-sm border border-[#1E2D42] shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Explore Flood Intelligence</span>
            </Link>

            <Link
              to="/map"
              className="px-7 py-3.5 rounded-2xl bg-[#101D2E] hover:bg-[#16273e] text-white font-bold text-sm border border-[#1E2D42] shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Compass className="w-4 h-4 text-[#00D4FF]" />
              <span>Interactive Live Map</span>
            </Link>
          </div>

          {/* Quick Scenario Preset Toggles */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Test Hydrological Scenarios:
            </span>
            <button
              onClick={() => handleScenarioChange('normal')}
              className={`px-3 py-1 rounded-xl border font-semibold transition-all ${
                currentScenario === 'normal'
                  ? 'bg-[#20D69A]/20 border-[#20D69A]/40 text-[#20D69A] shadow-sm'
                  : 'bg-[#101D2E] border-[#1E2D42] text-slate-400 hover:text-white'
              }`}
            >
              Normal Stream Flow
            </button>
            <button
              onClick={() => handleScenarioChange('heavy')}
              className={`px-3 py-1 rounded-xl border font-semibold transition-all ${
                currentScenario === 'heavy'
                  ? 'bg-[#FF9F43]/20 border-[#FF9F43]/40 text-[#FF9F43] shadow-sm'
                  : 'bg-[#101D2E] border-[#1E2D42] text-slate-400 hover:text-white'
              }`}
            >
              Heavy Downpour (Watch)
            </button>
            <button
              onClick={() => handleScenarioChange('extreme')}
              className={`px-3 py-1 rounded-xl border font-bold transition-all ${
                currentScenario === 'extreme' || currentScenario === 'flash_breach'
                  ? 'bg-[#FF3B45] border-rose-400 text-white animate-pulse shadow-lg shadow-rose-600/40'
                  : 'bg-[#101D2E] border-rose-900/40 text-[#FF3B45] hover:bg-[#FF3B45]/15'
              }`}
            >
              Cloudburst Breach (Critical)
            </button>
          </div>

          {/* 3. ANIMATED MOUNTAIN LANDSCAPE WITH RAINFALL AND FLOWING WATER */}
          <div id="landscape" className="max-w-5xl mx-auto pt-6 text-left">
            <MountainLandscapeAnimation />
          </div>

        </div>
      </section>

      {/* 4. KEY STATISTICS SECTION */}
      <section className="py-12 px-4 bg-[#0A1422] border-t border-b border-[#1E2D42]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {keyStatistics.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={i} 
                  className={`p-6 rounded-3xl bg-[#101D2E] border ${stat.border} shadow-xl space-y-2 hover:border-[#00D4FF]/40 transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-3xl font-black font-mono tracking-tight ${stat.color}`}>
                      {stat.value}
                    </span>
                    <div className={`p-2.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {stat.label}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {stat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-16 px-4 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00D4FF]">
              Distributed Early Warning Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              How FloodWatch AI Works
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              A comprehensive disaster management lifecycle connecting real-time IoT sensors to probabilistic predictive AI and life-saving evacuation routing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] hover:border-[#00D4FF]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/25 flex items-center justify-center font-black text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#00D4FF]" /> Kalman Sensor Fusion
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fuses ultrasonic river stage gauges, tipping bucket rain meters, and soil probes. A 2D Kalman filter state vector [h, v]^T removes turbulent splashing noise and calculates precise rate-of-rise.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] hover:border-purple-500/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/25 flex items-center justify-center font-black text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Monte Carlo Simulation
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulates 200 stochastic ensemble runs perturbing rainfall variance, soil saturation, and channel roughness to forecast peak water levels and calculate 95% confidence intervals 30 minutes in advance.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] hover:border-amber-500/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF9F43]/10 text-[#FF9F43] border border-[#FF9F43]/25 flex items-center justify-center font-black text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#FF9F43]" /> Risk Classification
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Classifies risk into LOW, MODERATE, HIGH, and CRITICAL using stateful anti-chatter hysteresis. Eliminates sensor jitter and false alarms while ensuring rapid escalation during sudden cloudburst surges.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] hover:border-[#20D69A]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#20D69A]/10 text-[#20D69A] border border-[#20D69A]/25 flex items-center justify-center font-black text-sm">
                04
              </div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#20D69A]" /> Dijkstra Safe Routing
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates the valley road graph. Flooded river causeways and vulnerable bridges are dynamically blocked, calculating the safest and shortest uphill routes to designated emergency shelters.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. TECHNOLOGY & FEATURES SECTION */}
      <section id="technology" className="py-16 px-4 bg-[#0A1422] border-t border-[#1E2D42]">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00D4FF]">
              Scientific Foundations & Algorithms
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Production-Grade Disaster Intelligence Stack
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Engineered for the rigorous operational requirements of Himalayan and Western Ghats disaster authorities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] space-y-3">
              <div className="p-2.5 rounded-2xl bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 w-fit">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Kalman Filter Telemetry Matrix</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                2D state vector accounting for river velocity. Eliminates sensor errors from turbulent waves and floating debris, maintaining a 98.4% data confidence score.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] space-y-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Monte Carlo Ensemble Modeling</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stochastic 200-scenario ensemble modeling outputs peak water-level probability distributions, uncertainty envelopes, and time-to-breach metrics.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] space-y-3">
              <div className="p-2.5 rounded-2xl bg-[#20D69A]/10 text-[#20D69A] border border-[#20D69A]/20 w-fit">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">ITU CAP v1.2 Compliant Alerts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dispatches automated Common Alerting Protocol broadcasts across web sirens, SMS, and WhatsApp to notify both citizens and emergency responders.
              </p>
            </div>

          </div>

          {/* Hilly Region Pilot Callout Banner */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#101D2E] via-blue-950/40 to-[#101D2E] border border-[#00D4FF]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-[#00D4FF] border border-[#00D4FF]/20 text-[10px] font-bold uppercase tracking-wider">
                Pilot Implementation
              </div>
              <h4 className="text-lg font-bold text-white">
                Piloted for Uttarakhand Himalayan Basins (Chamoli & Kedarnath)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calibrated against digital elevation models of the Alaknanda and Mandakini River channels to safeguard mountain pilgrim corridors, riverside villages, and vital bridge crossings.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-2xl bg-[#00D4FF] hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <span>Open Command Center</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="mt-auto border-t border-[#1E2D42] bg-[#050B14] py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2D42] pb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-[#00D4FF]/30 flex items-center justify-center text-[#00D4FF] font-bold">
                <Waves className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">FLOODWATCH AI</span>
                <p className="text-[11px] text-slate-400">Better Future, Secure You.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" /> NDRF: 1078
              </span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">SDRF: 1070</span>
              <span>•</span>
              <span className="text-[#00D4FF] font-semibold">Emergency: 112</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>
              Smart India Hackathon 2026 Innovation • Flash Flood Prediction and Evacuation Management Platform.
            </p>
            <div className="flex items-center gap-3">
              <span>Kalman Fusion</span>
              <span>•</span>
              <span>Monte Carlo AI</span>
              <span>•</span>
              <span>Dijkstra Routing</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

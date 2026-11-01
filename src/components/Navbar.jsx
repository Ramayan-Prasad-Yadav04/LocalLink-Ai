import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  Waves, 
  LayoutDashboard, 
  Map, 
  TrendingUp, 
  Navigation, 
  Bell, 
  Settings, 
  Volume2, 
  VolumeX, 
  Radio, 
  CloudRain, 
  Flame, 
  CheckCircle2, 
  RefreshCw, 
  ShieldAlert, 
  Clock, 
  Menu, 
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useSensorData } from '../context/SensorContext';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const {
    systemStatus,
    secondsSinceUpdate,
    currentScenario,
    isScenarioLoading,
    handleScenarioChange,
    handleResetSimulation,
    isMuted,
    isSirenTesting,
    toggleMute,
    testSiren,
    activeWarningCount,
    risk
  } = useSensorData();

  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isCritical = risk?.risk_level === 'CRITICAL';
  const isHigh = risk?.risk_level === 'HIGH';

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/map', label: 'Live Map', icon: Map },
    { to: '/analytics', label: 'AI Prediction', icon: TrendingUp },
    { to: '/evacuation', label: 'Evacuation', icon: Navigation },
    { 
      to: '/alerts', 
      label: 'Alerts', 
      icon: Bell,
      badge: activeWarningCount > 0 ? activeWarningCount : null,
      badgeColor: isCritical ? 'bg-rose-500 animate-pulse text-white' : 'bg-amber-500 text-slate-950 font-bold'
    },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#070b14]/95 backdrop-blur-md border-b border-slate-800/80 transition-all selection:bg-cyan-600 selection:text-white">
      {/* Top Banner if Emergency Active */}
      {(isCritical || isHigh) && (
        <div className={`px-4 py-1 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${
          isCritical 
            ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-900/50' 
            : 'bg-amber-500 text-slate-950'
        }`}>
          <ShieldAlert className="w-4 h-4 animate-bounce" />
          <span>EMERGENCY DISASTER ADVISORY: {risk.risk_level} RISK IN ALAKNANDA-MANDAKINI BASIN</span>
          <Link to="/evacuation" className="underline font-black hover:opacity-80 text-[11px] ml-2">
            View Safe Evacuation Path &rarr;
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Telemetry Status */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 shadow-lg shadow-blue-500/25 border border-cyan-400/30 group-hover:scale-105 transition-transform">
              <Waves className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${systemStatus === 'ONLINE' ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${systemStatus === 'ONLINE' ? 'bg-emerald-500' : 'bg-rose-600'}`} />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white flex items-center gap-1">
                  FloodWatch <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">AI</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-cyan-400 border border-cyan-500/20">
                  SIH 2026
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className={`flex items-center gap-1 font-semibold ${systemStatus === 'ONLINE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${systemStatus === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  {systemStatus}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {secondsSinceUpdate}s ago
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop Main Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to === '/analytics' && location.pathname === '/prediction');
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Demo Scenario Switcher & Controls */}
        <div className="hidden sm:flex items-center gap-2">
          {/* SIH Scenario Controller */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-inner">
            <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span className="hidden xl:inline">Scenario:</span>
            </div>

            <button
              onClick={() => handleScenarioChange('normal')}
              disabled={isScenarioLoading}
              title="Normal Dry/Monsoon Baseline"
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                currentScenario === 'normal'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Normal</span>
            </button>

            <button
              onClick={() => handleScenarioChange('heavy')}
              disabled={isScenarioLoading}
              title="Heavy Valley Downpour (High Warning)"
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                currentScenario === 'heavy'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CloudRain className="w-3 h-3" />
              <span>Heavy</span>
            </button>

            <button
              onClick={() => handleScenarioChange('extreme')}
              disabled={isScenarioLoading}
              title="Trigger Sudden Extreme Cloudburst & Flash Flood"
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                currentScenario === 'extreme'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 border border-rose-400 animate-pulse'
                  : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40'
              }`}
            >
              <Flame className="w-3 h-3 fill-current" />
              <span>Cloudburst</span>
            </button>

            <button
              onClick={handleResetSimulation}
              disabled={isScenarioLoading}
              title="Reset hydrological telemetry"
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-0.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScenarioLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>

          {/* Audio Siren Control */}
          <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800/80 rounded-xl p-1">
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute Emergency Siren' : 'Mute Emergency Siren'}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                isMuted ? 'text-slate-500 hover:text-slate-300' : 'text-cyan-400 hover:text-cyan-300'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={() => testSiren(2.5)}
              disabled={isSirenTesting}
              title="Test Web Audio Flood Siren"
              className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all flex items-center gap-1 ${
                isSirenTesting 
                  ? 'bg-rose-600 text-white animate-pulse' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span className="hidden md:inline">{isSirenTesting ? 'Testing...' : 'Siren'}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#070b14]/98 px-4 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                    isActive 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                      : 'bg-slate-900 text-slate-300 border border-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Scenario Selector */}
          <div className="pt-2 border-t border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Simulation Scenario:
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { handleScenarioChange('normal'); setMobileMenuOpen(false); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                  currentScenario === 'normal' 
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => { handleScenarioChange('heavy'); setMobileMenuOpen(false); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                  currentScenario === 'heavy' 
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Heavy Rain
              </button>
              <button
                onClick={() => { handleScenarioChange('extreme'); setMobileMenuOpen(false); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                  currentScenario === 'extreme' 
                    ? 'bg-rose-600 border-rose-500 text-white animate-pulse' 
                    : 'bg-slate-900 border-rose-900/40 text-rose-400'
                }`}
              >
                Cloudburst
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

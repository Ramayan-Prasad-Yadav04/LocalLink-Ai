import React, { useState } from 'react';
import { 
  Waves, 
  Activity, 
  Volume2, 
  VolumeX, 
  Radio, 
  LogOut, 
  ShieldAlert, 
  RefreshCw, 
  CloudRain, 
  AlertTriangle, 
  Flame,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { audioService } from '../services/audioService';
import { useAuth } from '../hooks/useAuth';

export function Navbar({ 
  systemStatus, 
  secondsSinceUpdate, 
  currentScenario, 
  onScenarioChange, 
  onResetSimulation,
  isScenarioLoading 
}) {
  const { user, logout } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isSirenTesting, setIsSirenTesting] = useState(false);

  const toggleMute = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  const handleTestSiren = () => {
    setIsSirenTesting(true);
    audioService.testSiren(2.5);
    setTimeout(() => setIsSirenTesting(false), 2600);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070b14]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & System Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 shadow-lg shadow-blue-500/25 border border-cyan-400/30">
            <Waves className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${systemStatus === 'ONLINE' ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${systemStatus === 'ONLINE' ? 'bg-emerald-500' : 'bg-rose-600'}`}></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                FloodWatch <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">AI</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-cyan-400 border border-cyan-500/20">
                SIH 2026
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className={`flex items-center gap-1 font-medium ${systemStatus === 'ONLINE' ? 'text-emerald-400' : 'text-rose-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${systemStatus === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                {systemStatus}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3 text-slate-500" />
                Updated {secondsSinceUpdate}s ago
              </span>
            </div>
          </div>
        </div>

        {/* SIH DEMO MODE SWITCHER */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-inner">
          <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">Demo Mode:</span>
          </div>

          <button
            onClick={() => onScenarioChange('normal')}
            disabled={isScenarioLoading}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              currentScenario === 'normal'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Normal
          </button>

          <button
            onClick={() => onScenarioChange('heavy')}
            disabled={isScenarioLoading}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              currentScenario === 'heavy'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CloudRain className="w-3 h-3" />
            Heavy Rain
          </button>

          <button
            onClick={() => onScenarioChange('extreme')}
            disabled={isScenarioLoading}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              currentScenario === 'extreme'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 border border-rose-400 animate-pulse'
                : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Extreme (Cloudburst)
          </button>

          <button
            onClick={onResetSimulation}
            disabled={isScenarioLoading}
            title="Reset telemetry baseline"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScenarioLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Audio Controls & User Menu */}
        <div className="flex items-center gap-2">
          {/* Audio siren toggle */}
          <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800/80 rounded-xl p-1">
            <button
              onClick={toggleMute}
              title={isMuted ? 'Unmute Emergency Siren' : 'Mute Emergency Siren'}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                isMuted ? 'text-slate-500 hover:text-slate-300' : 'text-cyan-400 hover:text-cyan-300'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={handleTestSiren}
              disabled={isSirenTesting}
              title="Test Emergency Siren Audio Synthesis"
              className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-all flex items-center gap-1 ${
                isSirenTesting 
                  ? 'bg-rose-600 text-white animate-pulse' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span className="hidden md:inline">{isSirenTesting ? 'Playing...' : 'Test Siren'}</span>
            </button>
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-200 leading-none">{user?.full_name || 'Emergency Operator'}</p>
              <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">{user?.role || 'Field Operator'}</p>
            </div>
            
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}

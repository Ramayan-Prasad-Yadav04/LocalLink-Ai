import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Waves, 
  Bell, 
  Clock, 
  MapPin, 
  ChevronDown, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Radio, 
  CheckCircle2, 
  User, 
  Activity, 
  AlertTriangle, 
  Flame, 
  CloudRain, 
  RefreshCw,
  Users,
  Eye,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { useSensorData, MONITORING_REGIONS } from '../context/SensorContext';

export function TopNavbar() {
  const {
    systemStatus,
    secondsSinceUpdate,
    currentTime,
    selectedRegion,
    setSelectedRegion,
    experienceMode,
    setExperienceMode,
    isMuted,
    isSirenTesting,
    toggleMute,
    testSiren,
    activeWarningCount,
    alerts,
    handleAcknowledgeAlert,
    currentScenario,
    isScenarioLoading,
    handleScenarioChange,
    handleResetSimulation,
    risk
  } = useSensorData();

  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isCritical = risk?.risk_level === 'CRITICAL';
  const isHigh = risk?.risk_level === 'HIGH';

  // Format current date & time
  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <header className="sticky top-0 z-40 bg-[#07111F]/95 backdrop-blur-md border-b border-[#1E2D42] text-slate-100 transition-all select-none">
      
      {/* 1. CRITICAL OR HIGH ADVISORY BANNER */}
      {(isCritical || isHigh) && (
        <div className={`px-4 py-1.5 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${
          isCritical 
            ? 'bg-[#FF3B45] text-white animate-pulse shadow-lg shadow-[#FF3B45]/40' 
            : 'bg-[#FF9F43] text-slate-950 shadow-md shadow-[#FF9F43]/30'
        }`}>
          <ShieldAlert className="w-4 h-4 animate-bounce" />
          <span>
            {isCritical ? 'CRITICAL DISASTER EMERGENCY:' : 'HIGH FLOOD RISK ADVISORY:'} FLASH FLOOD ALERT IN {selectedRegion.name.toUpperCase()}
          </span>
          <Link to="/evacuation" className="underline font-black hover:opacity-85 text-[11px] ml-2">
            View Safest Evacuation Route &rarr;
          </Link>
        </div>
      )}

      {/* 2. MAIN HEADER BAR */}
      <div className="w-full px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Tagline */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D4FF] via-blue-600 to-indigo-700 shadow-lg shadow-cyan-500/20 border border-[#00D4FF]/40 group-hover:scale-105 transition-transform">
              <Waves className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${systemStatus === 'ONLINE' ? 'bg-[#20D69A]' : 'bg-[#00D4FF]'}`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${systemStatus === 'ONLINE' ? 'bg-[#20D69A]' : 'bg-[#00D4FF]'}`} />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white flex items-center gap-1">
                  FLOODWATCH <span className="bg-gradient-to-r from-[#00D4FF] to-blue-400 bg-clip-text text-transparent">AI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00D4FF] border border-[#00D4FF]/25">
                  SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Better Future, Secure You.
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Live Monitoring Indicator, Date/Time & Region Selector */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Live Monitoring Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101D2E] border border-[#1E2D42] text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20D69A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#20D69A]" />
            </span>
            <span className="font-bold text-white text-[11px] tracking-wide">LIVE MONITORING</span>
            <span className="text-slate-500">•</span>
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#00D4FF]" />
              {secondsSinceUpdate}s
            </span>
          </div>

          {/* Current Date & Time Clock */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101D2E] border border-[#1E2D42] text-xs font-mono text-slate-300">
            <span className="text-slate-400 font-sans">{formattedDate}</span>
            <span className="text-slate-600">|</span>
            <span className="text-[#00D4FF] font-bold">{formattedTime} IST</span>
          </div>

          {/* Selected Monitoring Region Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101D2E] hover:bg-[#16273e] border border-[#1E2D42] text-xs text-white font-medium transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span className="font-semibold">{selectedRegion.name.split('–')[0].trim()}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {regionDropdownOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseLeave={() => setRegionDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#1E2D42]/60">
                  Select Hilly River Basin:
                </div>
                <div className="space-y-1 pt-1.5">
                  {MONITORING_REGIONS.map((reg) => (
                    <button
                      key={reg.id}
                      onClick={() => {
                        setSelectedRegion(reg);
                        setRegionDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                        selectedRegion.id === reg.id
                          ? 'bg-[#00D4FF]/15 text-[#00D4FF] font-bold border border-[#00D4FF]/30'
                          : 'text-slate-300 hover:bg-[#16273e]'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{reg.name}</div>
                        <div className="text-[10px] text-slate-500">{reg.state} • Breach: {reg.dangerLevel}m</div>
                      </div>
                      {selectedRegion.id === reg.id && <CheckCircle2 className="w-4 h-4 text-[#00D4FF]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right: Quick Controls, Mode Switcher, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Experience Mode Switcher (Public vs Command Center) */}
          <div className="hidden xl:flex items-center bg-[#101D2E] p-1 rounded-xl border border-[#1E2D42] text-xs">
            <button
              onClick={() => setExperienceMode('command_center')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                experienceMode === 'command_center'
                  ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full operator intelligence dashboard"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Command Center</span>
            </button>

            <button
              onClick={() => setExperienceMode('public_citizen')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                experienceMode === 'public_citizen'
                  ? 'bg-[#20D69A]/20 text-[#20D69A] border border-[#20D69A]/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Simplified citizen view"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Citizen Portal</span>
            </button>
          </div>

          {/* Quick SIH Scenario Presets */}
          <div className="hidden sm:flex items-center gap-1 bg-[#101D2E] border border-[#1E2D42] rounded-xl p-1">
            <button
              onClick={() => handleScenarioChange('normal')}
              disabled={isScenarioLoading}
              title="Simulate Normal Flow"
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                currentScenario === 'normal'
                  ? 'bg-[#20D69A]/20 text-[#20D69A] border border-[#20D69A]/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Normal</span>
            </button>

            <button
              onClick={() => handleScenarioChange('heavy')}
              disabled={isScenarioLoading}
              title="Simulate Heavy Downpour"
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                currentScenario === 'heavy'
                  ? 'bg-[#FF9F43]/20 text-[#FF9F43] border border-[#FF9F43]/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CloudRain className="w-3 h-3" />
              <span>Heavy</span>
            </button>

            <button
              onClick={() => handleScenarioChange('extreme')}
              disabled={isScenarioLoading}
              title="Simulate Extreme Cloudburst"
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                currentScenario === 'extreme' || currentScenario === 'flash_breach'
                  ? 'bg-[#FF3B45] text-white shadow-lg shadow-[#FF3B45]/40 animate-pulse'
                  : 'text-[#FF3B45] hover:bg-[#FF3B45]/15'
              }`}
            >
              <Flame className="w-3 h-3 fill-current" />
              <span>Cloudburst</span>
            </button>
          </div>

          {/* Audio Siren Toggle & Test */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleMute}
              title={isMuted ? "Unmute Emergency Sirens" : "Mute Sirens"}
              className={`p-2 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-rose-950/40 text-rose-400 border-rose-900/60'
                  : 'bg-[#101D2E] text-slate-300 hover:text-white border-[#1E2D42]'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#00D4FF]" />}
            </button>
          </div>

          {/* Notification Bell with Badge & Popover */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 rounded-xl bg-[#101D2E] hover:bg-[#16273e] border border-[#1E2D42] text-slate-300 hover:text-white transition-all"
              title="Emergency Notifications"
            >
              <Bell className="w-4 h-4" />
              {activeWarningCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#FF3B45] text-[10px] font-black text-white animate-pulse">
                  {activeWarningCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div 
                className="absolute top-full right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl p-3 z-50"
                onMouseLeave={() => setNotificationOpen(false)}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#1E2D42]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#00D4FF]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Emergency Alert Feed
                    </span>
                  </div>
                  <Link 
                    to="/alerts" 
                    onClick={() => setNotificationOpen(false)}
                    className="text-[11px] text-[#00D4FF] hover:underline font-semibold"
                  >
                    View All &rarr;
                  </Link>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pt-2 pr-1">
                  {alerts.slice(0, 4).map((al) => (
                    <div 
                      key={al.id}
                      className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                        al.risk_level === 'CRITICAL'
                          ? 'bg-[#FF3B45]/10 border-[#FF3B45]/40 text-slate-200'
                          : al.risk_level === 'HIGH'
                          ? 'bg-[#FF9F43]/10 border-[#FF9F43]/40 text-slate-200'
                          : 'bg-[#16273e] border-[#1E2D42] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            al.risk_level === 'CRITICAL' ? 'bg-[#FF3B45]' : al.risk_level === 'HIGH' ? 'bg-[#FF9F43]' : 'bg-[#20D69A]'
                          }`} />
                          {al.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{al.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2">{al.message}</p>
                      {!al.acknowledged && (
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => handleAcknowledgeAlert(al.id)}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-[#00D4FF] border border-[#00D4FF]/30"
                          >
                            Acknowledge
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-[#101D2E] hover:bg-[#16273e] border border-[#1E2D42] text-xs transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00D4FF] to-blue-600 flex items-center justify-center font-bold text-slate-950 text-xs">
                OP
              </div>
              <span className="hidden sm:inline font-semibold text-slate-200 text-xs">Operator</span>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
            </button>

            {profileOpen && (
              <div 
                className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl p-3 z-50 text-xs"
                onMouseLeave={() => setProfileOpen(false)}
              >
                <div className="pb-2 border-b border-[#1E2D42]">
                  <div className="font-bold text-white">Emergency Field Operator</div>
                  <div className="text-[11px] text-slate-400">operator@floodwatch.ai</div>
                  <div className="mt-1 inline-block px-2 py-0.5 rounded-full bg-[#20D69A]/15 text-[#20D69A] text-[10px] font-bold border border-[#20D69A]/30">
                    Active Authority Session
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <button
                    onClick={() => {
                      setExperienceMode(experienceMode === 'command_center' ? 'public_citizen' : 'command_center');
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:bg-[#16273e] flex items-center justify-between"
                  >
                    <span>Switch to {experienceMode === 'command_center' ? 'Citizen Mode' : 'Command Center'}</span>
                    <Users className="w-3.5 h-3.5 text-[#00D4FF]" />
                  </button>

                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="block px-3 py-2 rounded-xl text-slate-300 hover:bg-[#16273e]"
                  >
                    Control Room Settings
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </header>
  );
}

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  Map, 
  Navigation, 
  Bell, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  Radio,
  Layers,
  Sparkles
} from 'lucide-react';
import { useSensorData } from '../context/SensorContext';

export function Sidebar({ collapsed, setCollapsed }) {
  const { activeWarningCount, risk, liveSensor } = useSensorData();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();

  const isCritical = risk?.risk_level === 'CRITICAL';
  const isHigh = risk?.risk_level === 'HIGH';

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { 
      to: '/sensors', 
      label: 'Live Sensors', 
      icon: Activity, 
      pulse: true, 
      telemetry: `${liveSensor?.water_level || 1.34}m` 
    },
    { to: '/prediction', label: 'Flood Prediction', icon: TrendingUp },
    { 
      to: '/risk', 
      label: 'Risk Analysis', 
      icon: ShieldAlert,
      riskLevel: risk?.risk_level || 'LOW'
    },
    { to: '/map', label: 'Live Map', icon: Map },
    { to: '/evacuation', label: 'Evacuation Routes', icon: Navigation },
    { 
      to: '/alerts', 
      label: 'Alert Center', 
      icon: Bell, 
      badge: activeWarningCount > 0 ? activeWarningCount : null,
      badgeColor: isCritical ? 'bg-[#FF3B45] text-white animate-pulse' : 'bg-[#FF9F43] text-slate-950 font-bold'
    },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const getRiskColor = (lvl) => {
    switch (lvl) {
      case 'CRITICAL': return '#FF3B45';
      case 'HIGH': return '#FF9F43';
      case 'MODERATE': return '#FFB800';
      default: return '#20D69A';
    }
  };

  return (
    <>
      {/* Mobile Hamburger Toggle Button (sticky at bottom or top of viewport on mobile) */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="p-3.5 rounded-full bg-[#00D4FF] text-slate-950 shadow-2xl shadow-cyan-500/50 flex items-center justify-center font-bold"
          title="Toggle Navigation Menu"
        >
          {mobileDrawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div 
            className="w-72 h-full bg-[#101D2E] border-r border-[#1E2D42] p-4 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E2D42] pb-3">
                <span className="font-bold text-white text-sm tracking-wide">COMMAND CENTER</span>
                <button 
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-[#16273e] text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to || (item.to === '/prediction' && location.pathname === '/analytics');
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30'
                          : 'text-slate-300 hover:bg-[#16273e]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#00D4FF]' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                      {item.riskLevel && (
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: getRiskColor(item.riskLevel) }}
                        />
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-[#1E2D42] pt-3 text-[11px] text-slate-500">
              FloodWatch AI • SIH 2026
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col justify-between shrink-0 bg-[#0A1422] border-r border-[#1E2D42] transition-all duration-300 select-none ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-3 space-y-4">
          
          {/* Collapse/Expand Toggle Header */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2 py-1`}>
            {!collapsed && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Navigation Modules
              </span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-xl bg-[#101D2E] hover:bg-[#16273e] text-slate-400 hover:text-white border border-[#1E2D42] transition-all"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to === '/prediction' && location.pathname === '/analytics');
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`group relative flex items-center ${
                    collapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                  } rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00D4FF]/20 to-blue-600/10 text-white border border-[#00D4FF]/40 shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-[#101D2E]'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#00D4FF]' : 'text-slate-400'
                      }`} />
                      {item.pulse && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00D4FF] animate-ping" />
                      )}
                    </div>
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {!collapsed && item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}

                  {!collapsed && item.riskLevel && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700/60"
                      style={{ 
                        color: getRiskColor(item.riskLevel),
                        backgroundColor: `${getRiskColor(item.riskLevel)}15`
                      }}
                    >
                      <span 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: getRiskColor(item.riskLevel) }}
                      />
                      <span>{item.riskLevel}</span>
                    </div>
                  )}

                  {!collapsed && item.telemetry && (
                    <span className="text-[10px] font-mono text-[#00D4FF] bg-[#00D4FF]/10 px-1.5 py-0.5 rounded border border-[#00D4FF]/20">
                      {item.telemetry}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer telemetry indicator */}
        <div className="p-3 border-t border-[#1E2D42]/70 bg-[#07111F]/60">
          {!collapsed ? (
            <div className="p-2.5 rounded-2xl bg-[#101D2E]/80 border border-[#1E2D42] space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Telemetry Link</span>
                <span className="flex items-center gap-1 text-[#20D69A] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20D69A] animate-pulse" />
                  98.4%
                </span>
              </div>
              <div className="w-full bg-[#07111F] rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-[#00D4FF] to-[#20D69A] h-full rounded-full w-[98%]" />
              </div>
              <div className="text-[10px] text-slate-500 font-mono text-center">
                4G IoT • LoRaWAN Mesh
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="Telemetry Mesh Active 98.4%">
              <span className="w-2.5 h-2.5 rounded-full bg-[#20D69A] animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

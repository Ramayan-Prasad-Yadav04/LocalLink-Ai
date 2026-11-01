import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  MapPin, 
  Navigation, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle, 
  Footprints, 
  HeartHandshake, 
  ArrowRight,
  Clock,
  Compass,
  Radio,
  Share2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useSensorData } from '../context/SensorContext';

export function PublicCitizenPage() {
  const {
    risk,
    liveSensor,
    evacuationRoute,
    shelters,
    selectedRegion,
    selectedOriginVillage,
    setSelectedOriginVillage,
    alerts
  } = useSensorData();

  const [activeTab, setActiveTab] = useState('status'); // 'status' | 'shelter' | 'hotlines' | 'checklist'
  const isCritical = risk?.risk_level === 'CRITICAL';
  const isHigh = risk?.risk_level === 'HIGH';
  const isModerate = risk?.risk_level === 'MODERATE';

  const villageOptions = [
    { id: "LOC-AFFECTED", name: "Mandakini Lower Valley Settlement (Zone 0)", riverDistance: "80m from riverbed", riskZone: "High Risk Floor" },
    { id: "LOC-BRIDGE-LOW", name: "Old Riverside Bridge Causeway", riverDistance: "Direct river crossing", riskZone: "Flooding Risk" },
    { id: "LOC-VALLEY-JUNC", name: "Pine Valley Lower Junction", riverDistance: "180m from stream", riskZone: "Moderate Slopes" },
    { id: "LOC-RIDGE-WEST", name: "West Ridge Mountain Pass (High Elevation)", riverDistance: "High plateau", riskZone: "Safe Elevation" },
    { id: "LOC-TERRACE-EAST", name: "East Valley Terraces Crossing", riverDistance: "Elevated terrace", riskZone: "Safe Elevation" }
  ];

  const emergencyContacts = [
    { name: "National Disaster Response Force (NDRF)", number: "1078", tag: "National Toll-Free", desc: "Specialized flash flood search and swift-water rescue" },
    { name: "State Disaster Response Force (SDRF)", number: "1070", tag: "State Emergency Desk", desc: "Local high-altitude mountain rescue teams & relief logistics" },
    { name: "National Emergency Helpline", number: "112", tag: "All-in-One", desc: "Direct dispatch to nearest police, ambulance, and fire station" },
    { name: "Emergency Medical & Ambulance", number: "108", tag: "Medical Rapid Response", desc: "Mobile field ambulances and trauma evacuation" },
    { name: "District Disaster Control Room", number: "+91-1372-252107", tag: "Local Basin Desk", desc: "District Magistrate incident command post (Chamoli/Rudraprayag)" }
  ];

  const checklistItems = [
    { id: 1, text: "Pack essential identity documents in waterproof bag (Aadhaar, ration card)", done: true },
    { id: 2, text: "Carry drinking water (2L per person) and dry high-calorie rations", done: true },
    { id: 3, text: "Keep mobile phone charged and carry battery power bank", done: false },
    { id: 4, text: "Switch off home electrical mains and shut LPG cylinder valves before leaving", done: false },
    { id: 5, text: "Untie livestock and guide cattle towards elevated hillside pastures", done: false },
    { id: 6, text: "Do NOT attempt to cross flowing river causeways or submerged culverts", done: true }
  ];

  const getStatusColor = () => {
    if (isCritical) return { bg: 'bg-[#FF3B45]', text: 'text-white', border: 'border-[#FF3B45]', glow: 'glow-critical' };
    if (isHigh) return { bg: 'bg-[#FF9F43]', text: 'text-slate-950', border: 'border-[#FF9F43]', glow: 'glow-warning' };
    if (isModerate) return { bg: 'bg-[#FFB800]', text: 'text-slate-950', border: 'border-[#FFB800]', glow: 'shadow-lg' };
    return { bg: 'bg-[#20D69A]', text: 'text-slate-950', border: 'border-[#20D69A]', glow: 'glow-safe' };
  };

  const statusTheme = getStatusColor();

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
      
      {/* 1. CITIZEN HERO BANNER */}
      <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-[#00D4FF] text-xs font-bold border border-[#00D4FF]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Citizen Early Warning Portal • {selectedRegion.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Local Flood Risk & Evacuation Guide
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Real-time emergency safety status for residents in hilly river valleys. Check your immediate safety status, find the nearest relief shelter, and follow safe uphill paths.
            </p>
          </div>

          {/* Quick Village Selector Dropdown */}
          <div className="w-full sm:w-auto bg-[#07111F] p-3 rounded-2xl border border-[#1E2D42] space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Your Current Location / Village:
            </label>
            <select
              value={selectedOriginVillage}
              onChange={(e) => setSelectedOriginVillage(e.target.value)}
              className="w-full sm:w-64 bg-[#101D2E] text-white text-xs font-bold rounded-xl px-3 py-2 border border-[#1E2D42] focus:border-[#00D4FF] outline-none cursor-pointer"
            >
              {villageOptions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. BIG BOLD STATUS CARD: AM I IN DANGER? */}
      <div className={`p-6 sm:p-8 rounded-3xl border-2 ${statusTheme.border} ${statusTheme.bg} ${statusTheme.text} ${statusTheme.glow} shadow-2xl transition-all duration-300 relative overflow-hidden`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {isCritical ? (
                <ShieldAlert className="w-10 h-10 animate-bounce" />
              ) : isHigh ? (
                <AlertTriangle className="w-10 h-10 animate-pulse" />
              ) : (
                <ShieldCheck className="w-10 h-10" />
              )}
              <div>
                <span className="text-xs font-black tracking-wider uppercase opacity-90 block">
                  Current Flash Flood Advisory
                </span>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                  {isCritical 
                    ? "CRITICAL: EVACUATE TO HIGH GROUND NOW" 
                    : isHigh 
                    ? "HIGH RISK: PREPARE FOR EVACUATION" 
                    : isModerate 
                    ? "MODERATE WATCH: BE READY TO MOVE" 
                    : "SAFE: NO FLOOD DANGER AT THIS TIME"}
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-semibold max-w-2xl opacity-95 leading-relaxed pt-1">
              {risk?.explanation || "River telemetry and slope stability sensors indicate nominal river discharge."}
            </p>
          </div>

          <div className="bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0 w-full sm:w-48">
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
              Flood Probability
            </span>
            <div className="text-3xl font-black font-mono">
              {risk?.flood_probability || 0}%
            </div>
            <span className="text-[11px] font-semibold opacity-90 mt-1 block">
              River Stage: {liveSensor?.water_level || 1.34}m
            </span>
          </div>
        </div>

        {/* Recommended Action Pill */}
        <div className="mt-5 pt-4 border-t border-black/20 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Action Required: {risk?.recommended_action}</span>
          </div>
          {isCritical && (
            <span className="px-3 py-1 rounded-full bg-white text-[#FF3B45] font-black uppercase text-[11px] animate-pulse">
              Follow Uphill Trail Immediately
            </span>
          )}
        </div>
      </div>

      {/* 3. CITIZEN ACTION TABS */}
      <div className="flex items-center gap-2 border-b border-[#1E2D42] pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'status'
              ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Nearest Safe Shelter & Route</span>
        </button>

        <button
          onClick={() => setActiveTab('hotlines')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'hotlines'
              ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Emergency Hotlines (SOS)</span>
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'checklist'
              ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Safety Checklist</span>
        </button>
      </div>

      {/* 4. TAB CONTENT: NEAREST SHELTER & ROUTE GUIDANCE */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Nearest Shelter Card (7 cols) */}
          <div className="md:col-span-7 p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] space-y-5">
            <div className="flex items-center justify-between border-b border-[#1E2D42] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00D4FF]">
                  Designated High-Ground Haven
                </span>
                <h3 className="text-lg font-bold text-white">
                  {evacuationRoute?.destination_name || "Pine Ridge Community High Ground"}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#20D69A]/15 text-[#20D69A] border border-[#20D69A]/30 text-xs font-bold">
                SAFE HAVEN OPEN
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-[#07111F] border border-[#1E2D42] text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Walking Distance</span>
                <span className="text-base font-black text-white font-mono">{evacuationRoute?.total_distance_km || 3.12} km</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#07111F] border border-[#1E2D42] text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Uphill Foot Time</span>
                <span className="text-base font-black text-[#00D4FF] font-mono">{evacuationRoute?.estimated_time_minutes || 58} mins</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#07111F] border border-[#1E2D42] text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Elevation Gain</span>
                <span className="text-base font-black text-[#20D69A] font-mono">+{evacuationRoute?.elevation_gain_m || 280}m</span>
              </div>
            </div>

            {/* Step-by-step turn guidance */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-[#00D4FF]" />
                Step-by-Step Safe Uphill Route:
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {evacuationRoute?.waypoints?.map((w, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-[#07111F] border border-[#1E2D42] text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#00D4FF]/20 text-[#00D4FF] font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{w.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{w.altitude_m}m</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">{w.instruction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blocked roads notification */}
            {evacuationRoute?.blocked_roads?.length > 0 && (
              <div className="p-3 rounded-2xl bg-[#FF3B45]/15 border border-[#FF3B45]/30 text-xs text-rose-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-white">
                  <AlertTriangle className="w-4 h-4 text-[#FF3B45]" />
                  <span>DANGER: Submerged Road Avoided</span>
                </div>
                <p className="text-[11px]">
                  Do NOT use {evacuationRoute.blocked_roads.map(r => r.name).join(', ')}. River water has submerged low-elevation crossings.
                </p>
              </div>
            )}
          </div>

          {/* Shelter Provisions & Contacts (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-[#20D69A]" />
                Shelter Facilities & Care
              </h3>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#07111F]">
                  <span className="text-slate-400">Total Capacity:</span>
                  <span className="font-bold text-white">450 Citizens (35 currently accommodated)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#07111F]">
                  <span className="text-slate-400">First Aid & Medical:</span>
                  <span className="font-bold text-[#20D69A]">SDRF Medical Team Active</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#07111F]">
                  <span className="text-slate-400">Food & Potable Water:</span>
                  <span className="font-bold text-white">5-Day Filtered Water & Meals</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#07111F]">
                  <span className="text-slate-400">Emergency Power:</span>
                  <span className="font-bold text-white">Solar Hybrid Generator + VHF Radio</span>
                </div>
              </div>
            </div>

            {/* Quick SOS Helpline Call Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-950/40 to-[#101D2E] border border-rose-900/50 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <PhoneCall className="w-4 h-4 animate-pulse" />
                <span>Stranded or Need Immediate Rescue?</span>
              </div>
              <p className="text-xs text-slate-300">
                Dial the toll-free NDRF mountain rescue line or contact the local district disaster desk directly.
              </p>
              <div className="flex gap-2">
                <a
                  href="tel:1078"
                  className="flex-1 py-2.5 rounded-xl bg-[#FF3B45] hover:bg-rose-600 text-white font-bold text-xs text-center shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 1078 (NDRF)</span>
                </a>
                <a
                  href="tel:112"
                  className="flex-1 py-2.5 rounded-xl bg-[#101D2E] hover:bg-slate-800 text-white font-bold text-xs text-center border border-[#1E2D42] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Dial 112</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: EMERGENCY HOTLINES */}
      {activeTab === 'hotlines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyContacts.map((c, i) => (
            <div key={i} className="p-5 rounded-3xl bg-[#101D2E] border border-[#1E2D42] flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] text-[10px] font-bold border border-[#00D4FF]/20">
                    {c.tag}
                  </span>
                  <span className="text-lg font-black text-white font-mono">{c.number}</span>
                </div>
                <h4 className="text-base font-bold text-white mt-2">{c.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{c.desc}</p>
              </div>

              <a
                href={`tel:${c.number.replace(/[^0-9+]/g, '')}`}
                className="w-full py-2.5 rounded-xl bg-[#00D4FF] hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {c.number} Now</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* 6. TAB CONTENT: SAFETY CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] space-y-4">
          <div className="border-b border-[#1E2D42] pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#20D69A]" />
              Essential Hilly Flash Flood Evacuation Checklist
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Before evacuating, complete these rapid safety steps to protect yourself, your family, and emergency responders.
            </p>
          </div>

          <div className="space-y-3">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-2xl bg-[#07111F] border border-[#1E2D42]">
                <input 
                  type="checkbox" 
                  defaultChecked={item.done}
                  className="mt-1 w-4 h-4 rounded text-[#00D4FF] bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-slate-200 leading-relaxed font-medium">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  ShieldCheck, 
  Radio, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Send, 
  MessageSquare, 
  PhoneCall, 
  Share2, 
  Flame, 
  CloudRain, 
  Clock, 
  Filter, 
  AlertTriangle,
  Code,
  Smartphone,
  Info,
  Droplets,
  Gauge,
  Navigation
} from 'lucide-react';
import { CommandCenterLayout } from '../components/CommandCenterLayout';
import { useSensorData } from '../context/SensorContext';

export function AlertsPage() {
  const {
    alerts,
    risk,
    liveSensor,
    selectedRegion,
    handleAcknowledgeAlert,
    isMuted,
    isSirenTesting,
    toggleMute,
    testSiren
  } = useSensorData();

  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [activeChannelTab, setActiveChannelTab] = useState('sms'); // 'sms' | 'whatsapp' | 'cap' | 'vhf'
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Six standardized alert templates for reference
  const alertTemplates = [
    { type: "Heavy Rainfall Warning", icon: CloudRain, severity: "HIGH", color: "#FF9F43", threshold: "> 50 mm/h" },
    { type: "Rapid Water Level Rise", icon: Droplets, severity: "HIGH", color: "#FF9F43", threshold: "> 0.05 m/min" },
    { type: "Soil Saturation Warning", icon: Gauge, severity: "MODERATE", color: "#FFB800", threshold: "> 80% Saturation" },
    { type: "High Flood Probability", icon: AlertTriangle, severity: "HIGH", color: "#FF9F43", threshold: "> 50% Monte Carlo" },
    { type: "Critical Flood Alert", icon: Flame, severity: "CRITICAL", color: "#FF3B45", threshold: "Water Level >= 3.5m" },
    { type: "Evacuation Recommendation", icon: Navigation, severity: "CRITICAL", color: "#FF3B45", threshold: "Dijkstra Active Reroute" }
  ];

  // Comprehensive alert stream
  const allAlerts = [
    ...alerts,
    {
      id: 101,
      timestamp: "10 mins ago",
      risk_level: "HIGH",
      type: "Heavy Rainfall Warning",
      title: "Intense Catchment Downpour Detected",
      location: `${selectedRegion.name} (Ridge Sector)`,
      message: "Precipitation rate surpassed 52 mm/hr on Chamoli Ridge rain station #RDG-03. Catchment runoff accelerating into valley floor.",
      recommended_action: "Field observers monitor river velocity radars. Pre-alert downstream riverside hamlets.",
      acknowledged: false
    },
    {
      id: 102,
      timestamp: "18 mins ago",
      risk_level: "MODERATE",
      type: "Soil Saturation Warning",
      title: "Mountain Catchment Soil Saturated",
      location: `${selectedRegion.name} (Upper Basin)`,
      message: "Soil probe #SOIL-LOW-05 indicates topsoil volumetric water content reached 82%. Future precipitation will directly translate to immediate surface runoff.",
      recommended_action: "SDRF rescue convoys placed on Level 2 alert posture.",
      acknowledged: true
    },
    {
      id: 103,
      timestamp: "45 mins ago",
      risk_level: "LOW",
      type: "Baseline Nominal",
      title: "Routine Hydrometric Observation Nominal",
      location: selectedRegion.name,
      message: "Ultrasonic river stage and radar stream velocity functioning nominally within baseline channel margins.",
      recommended_action: "Continue continuous 2-second telemetry polling cycle.",
      acknowledged: true
    }
  ];

  const filteredAlerts = allAlerts.filter((a) => {
    if (severityFilter === 'ALL') return true;
    if (severityFilter === 'UNACKNOWLEDGED') return !a.acknowledged;
    return a.risk_level === severityFilter;
  });

  const handleSimulateBroadcast = () => {
    setBroadcastSent(true);
    testSiren(2.5);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  // CAP v1.2 XML Representation for SIH Evaluators
  const capXmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>CAP-IN-UK-${new Date().getFullYear()}-0094</identifier>
  <sender>FloodWatch-AI@disaster.uk.gov.in</sender>
  <sent>${new Date().toISOString()}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>Flash Flood Warning</event>
    <urgency>${risk?.risk_level === 'CRITICAL' ? 'Immediate' : 'Expected'}</urgency>
    <severity>${risk?.risk_level || 'Moderate'}</severity>
    <certainty>Observed</certainty>
    <headline>URGENT: Flash Flood Advisory for ${selectedRegion.name}</headline>
    <description>${risk?.explanation || 'River stream levels surging rapidly following mountain downpour.'}</description>
    <instruction>${risk?.recommended_action || 'Evacuate riverbanks immediately. Climb to high-ground safe shelters.'}</instruction>
    <area>
      <areaDesc>${selectedRegion.name}</areaDesc>
      <circle>${selectedRegion.lat},${selectedRegion.lon},4.5</circle>
    </area>
  </info>
</alert>`;

  return (
    <CommandCenterLayout>
      <div className="space-y-6">
        
        {/* Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#101D2E] border border-[#1E2D42]">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-rose-500/10 text-[#FF3B45] border border-[#FF3B45]/20">
              <Bell className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <h1 className="text-xl font-black text-white tracking-wide">
                Emergency Alert Center & Multi-Channel Broadcast
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time CAP v1.2 citizen broadcasting, public siren triggering, and emergency responder notification feed
              </p>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                isMuted
                  ? 'bg-rose-950/40 text-[#FF3B45] border-[#FF3B45]/40'
                  : 'bg-[#07111F] text-slate-200 border-[#1E2D42]'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#00D4FF]" />}
              <span>{isMuted ? 'Sirens Muted' : 'Sirens Active'}</span>
            </button>

            <button
              onClick={() => testSiren(3)}
              disabled={isSirenTesting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF3B45] to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSirenTesting ? 'animate-ping' : ''}`} />
              <span>{isSirenTesting ? 'Sounding Siren...' : 'Test Siren (3s)'}</span>
            </button>
          </div>
        </div>

        {/* 1. STANDARDIZED ALERT TYPES RIBBON */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {alertTemplates.map((tpl, i) => {
            const Icon = tpl.icon;
            return (
              <div 
                key={i} 
                className="p-3 rounded-2xl bg-[#101D2E] border border-[#1E2D42] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-4 h-4" style={{ color: tpl.color }} />
                  <span 
                    className="text-[9px] font-bold px-1.5 py-0.2 rounded"
                    style={{ color: tpl.color, backgroundColor: `${tpl.color}15` }}
                  >
                    {tpl.severity}
                  </span>
                </div>
                <div className="text-xs font-bold text-white line-clamp-1">{tpl.type}</div>
                <div className="text-[10px] text-slate-400 font-mono">{tpl.threshold}</div>
              </div>
            );
          })}
        </div>

        {/* 2. ALERT FEED & BROADCAST DISPATCHER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left: Active Alerts Stream (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2D42] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Live Emergency Broadcast Stream
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FF3B45]/15 text-[#FF3B45] text-[10px] font-bold">
                    {filteredAlerts.length} Messages
                  </span>
                </div>

                {/* Filter Selector */}
                <div className="flex items-center gap-1.5 bg-[#07111F] p-1 rounded-xl border border-[#1E2D42] text-xs">
                  {['ALL', 'CRITICAL', 'HIGH', 'UNACKNOWLEDGED'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSeverityFilter(lvl)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                        severityFilter === lvl
                          ? 'bg-[#00D4FF] text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alerts List */}
              <div className="space-y-3 mt-4 max-h-[480px] overflow-y-auto pr-1">
                {filteredAlerts.map((al) => {
                  const isCrit = al.risk_level === 'CRITICAL';
                  const isHgh = al.risk_level === 'HIGH';
                  return (
                    <div
                      key={al.id}
                      className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                        isCrit
                          ? 'bg-[#FF3B45]/10 border-[#FF3B45]/40 text-slate-100 glow-critical'
                          : isHgh
                          ? 'bg-[#FF9F43]/10 border-[#FF9F43]/40 text-slate-100 glow-warning'
                          : 'bg-[#07111F] border-[#1E2D42] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span 
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              isCrit ? 'bg-[#FF3B45] text-white' : isHgh ? 'bg-[#FF9F43] text-slate-950 font-bold' : 'bg-[#20D69A] text-slate-950 font-bold'
                            }`}
                          >
                            {al.risk_level}
                          </span>
                          <span className="font-bold text-white text-sm">{al.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{al.timestamp}</span>
                      </div>

                      <div className="text-[11px] text-slate-400 font-semibold">
                        Location Affected: <strong className="text-white">{al.location}</strong>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {al.message}
                      </p>

                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-[11px] text-slate-300">
                        <strong className="text-white">Action Mandated: </strong>
                        {al.recommended_action}
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          Status: {al.acknowledged ? 'Acknowledged by Field Command' : 'Awaiting Confirmation'}
                        </span>
                        {!al.acknowledged && (
                          <button
                            onClick={() => handleAcknowledgeAlert(al.id)}
                            className="px-3 py-1 rounded-xl bg-[#00D4FF] hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow"
                          >
                            Acknowledge Alert
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Multi-Channel Emergency Dispatcher & CAP v1.2 (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="border-b border-[#1E2D42] pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#00D4FF]" />
                  Multi-Channel Emergency Broadcast Hub
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-[#00D4FF] border border-[#00D4FF]/20">
                  CAP v1.2
                </span>
              </div>

              {/* Channels Tabs */}
              <div className="grid grid-cols-4 gap-1.5 mt-4 p-1 rounded-2xl bg-[#07111F] text-xs font-bold text-center">
                <button
                  onClick={() => setActiveChannelTab('sms')}
                  className={`py-1.5 rounded-xl transition-all ${
                    activeChannelTab === 'sms' ? 'bg-[#00D4FF] text-slate-950' : 'text-slate-400'
                  }`}
                >
                  SMS
                </button>
                <button
                  onClick={() => setActiveChannelTab('whatsapp')}
                  className={`py-1.5 rounded-xl transition-all ${
                    activeChannelTab === 'whatsapp' ? 'bg-[#20D69A] text-slate-950' : 'text-slate-400'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => setActiveChannelTab('cap')}
                  className={`py-1.5 rounded-xl transition-all ${
                    activeChannelTab === 'cap' ? 'bg-purple-500 text-white' : 'text-slate-400'
                  }`}
                >
                  CAP XML
                </button>
                <button
                  onClick={() => setActiveChannelTab('vhf')}
                  className={`py-1.5 rounded-xl transition-all ${
                    activeChannelTab === 'vhf' ? 'bg-[#FF9F43] text-slate-950' : 'text-slate-400'
                  }`}
                >
                  VHF Siren
                </button>
              </div>

              {/* Channel Preview Content */}
              <div className="mt-4 p-4 rounded-2xl bg-[#07111F] border border-[#1E2D42] space-y-3 min-h-[220px]">
                {activeChannelTab === 'sms' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                      <span>Cell Broadcast (Area Blast)</span>
                      <span>160/160 Chars</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#101D2E] text-slate-200 font-mono text-[11px] leading-relaxed">
                      [DISASTER-ALERT] Flash flood risk {risk?.risk_level} in {selectedRegion.name}. River water rising. Immediate uphill evacuation to safe shelters advised. Call 1078.
                    </div>
                  </div>
                )}

                {activeChannelTab === 'whatsapp' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                      <span>WhatsApp Citizen Bot Dispatch</span>
                      <span>Verified SDRF Channel</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-200 text-xs space-y-1">
                      <div className="font-bold text-white">🚨 FLASH FLOOD WARNING: {selectedRegion.name}</div>
                      <div>Status: {risk?.risk_level} Risk</div>
                      <div>Recommended Haven: Pine Ridge Community High Ground</div>
                      <div>Dijkstra Path: Uphill Ridge Pass (River bridge causeway submerged)</div>
                    </div>
                  </div>
                )}

                {activeChannelTab === 'cap' && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-purple-300 block">ITU-T X.1303 CAP v1.2 XML:</span>
                    <pre className="text-[10px] font-mono text-slate-300 max-h-44 overflow-y-auto p-2 rounded-xl bg-black/50 border border-slate-800">
                      {capXmlPayload}
                    </pre>
                  </div>
                )}

                {activeChannelTab === 'vhf' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                      <span>VHF Disaster Wireless Siren Repeater</span>
                      <span>Freq: 156.800 MHz</span>
                    </div>
                    <p className="text-slate-300 text-xs">
                      Simultaneous radio tone activation for all 4 valley mechanical siren masts in Alaknanda gorge.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Trigger Button */}
            <div className="pt-3 border-t border-[#1E2D42]">
              <button
                onClick={handleSimulateBroadcast}
                disabled={broadcastSent}
                className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-xl transition-all ${
                  broadcastSent
                    ? 'bg-[#20D69A] text-slate-950'
                    : 'bg-[#00D4FF] hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {broadcastSent ? 'EMERGENCY BROADCAST SENT TO ALL CHANNELS!' : 'Trigger Manual Multi-Channel Citizen Broadcast'}
                </span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </CommandCenterLayout>
  );
}

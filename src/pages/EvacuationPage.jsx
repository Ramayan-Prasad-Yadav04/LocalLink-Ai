import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Navigation, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  Mountain, 
  Clock, 
  Footprints, 
  PhoneCall, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  FileText, 
  Users, 
  HeartHandshake, 
  Car, 
  Download, 
  Share2,
  ExternalLink,
  Ban,
  Info,
  Sparkles
} from 'lucide-react';
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
import { CommandCenterLayout } from '../components/CommandCenterLayout';
import { useSensorData } from '../context/SensorContext';

export function EvacuationPage() {
  const {
    evacuationRoute,
    shelters,
    risk,
    liveSensor,
    selectedRegion,
    selectedOriginVillage,
    setSelectedOriginVillage
  } = useSensorData();

  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeRouteTab, setActiveRouteTab] = useState('recommended'); // 'recommended' | 'alternatives' | 'blocked'

  const currentRisk = risk?.risk_level || 'LOW';
  const waterLevel = liveSensor?.water_level ?? 1.34;

  const villageOptions = [
    { id: "LOC-AFFECTED", name: "Mandakini Lower Valley Settlement (Zone 0)", elev: 1140, riskZone: "Extreme Riverfront" },
    { id: "LOC-BRIDGE-LOW", name: "Old Riverside Bridge Causeway", elev: 1143, riskZone: "Direct River Crossing" },
    { id: "LOC-VALLEY-JUNC", name: "Pine Valley Lower Junction", elev: 1195, riskZone: "Moderate Slopes" },
    { id: "LOC-RIDGE-WEST", name: "West Ridge Mountain Pass (High Elevation)", elev: 1310, riskZone: "High Plateau" },
    { id: "LOC-TERRACE-EAST", name: "East Valley Terraces Crossing", elev: 1320, riskZone: "Safe Elevation" }
  ];

  const waypoints = evacuationRoute?.waypoints || [
    { name: "Zone 0 Valley Floor", altitude_m: 1140, instruction: "Evacuate river bank immediately. Proceed towards Sector 4 trail.", hazard_free: true },
    { name: "Old Bridge Crossing", altitude_m: 1143, instruction: "DO NOT cross river bridge (submerged). Turn right onto elevated ridge trail.", hazard_free: true },
    { name: "Pine Forest Ridge Checkpoint", altitude_m: 1250, instruction: "Follow SDRF glowing evacuation beacons along ridge pass.", hazard_free: true },
    { name: "Upper Escarpment Pass", altitude_m: 1340, instruction: "Ascend away from natural drainage ravine towards high plateau.", hazard_free: true },
    { name: "High Ground Shelter Perimeter", altitude_m: 1390, instruction: "Check-in at First Response Registration Counter Gate 1.", hazard_free: true },
    { name: "Pine Ridge Safe Shelter", altitude_m: 1420, instruction: "Final safe high-ground destination reached. Report to relief coordinator.", hazard_free: true }
  ];

  // Elevation Profile Chart Data
  const elevationData = waypoints.map((w, index) => ({
    name: w.name.split(' ')[0] || `Point ${index + 1}`,
    distance_km: (index * 0.62).toFixed(2),
    altitude_m: w.altitude_m,
    fullName: w.name,
    instruction: w.instruction
  }));

  // Alternative Routes Comparison
  const alternativeRoutes = [
    {
      id: "PRIMARY-RIDGE",
      name: "Primary Safe High-Ground Route (West Ridge Pass)",
      destination: evacuationRoute?.destination_name || "Pine Ridge Community High Ground",
      distance_km: evacuationRoute?.total_distance_km || 3.12,
      time_minutes: evacuationRoute?.estimated_time_minutes || 58,
      safety_score: 96,
      status: "RECOMMENDED",
      color: "#20D69A",
      type: "High-Elevation Ridge Trail",
      hazardAvoided: "Bypasses all riverbed lowlands"
    },
    {
      id: "ALT-SWITCHBACK",
      name: "Alternative Secondary Trail (Mid-Valley Switchbacks)",
      destination: "Govt Intermediate College Heights",
      distance_km: 3.65,
      time_minutes: 68,
      safety_score: 84,
      status: "VIABLE",
      color: "#FF9F43",
      type: "Terraced Switchback Trail",
      hazardAvoided: "Higher elevation gain (+380m)"
    },
    {
      id: "BLOCKED-GORGE",
      name: "River Gorge Road & Causeway (SUBMERGED)",
      destination: "Lowland River Bridge",
      distance_km: 1.85,
      time_minutes: 25,
      safety_score: 12,
      status: "IMPASSABLE / BLOCKED",
      color: "#FF3B45",
      type: "Flooded Embankment Road",
      hazardAvoided: "Submerged under torrential surge"
    }
  ];

  const handleDownloadPlan = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <CommandCenterLayout>
      <div className="space-y-6">
        
        {/* 1. DISCLAIMER BANNER (IMPORTANT USER REQUIREMENT) */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>SIMULATION DISCLAIMER:</strong> This route is generated using a demonstration Dijkstra shortest-path algorithm with synthetic flood weighting. Never rely on simulated routes as verified real-world emergency guidance. Always follow official SDRF and DDMA field mandates.
            </span>
          </div>
          <span className="hidden sm:inline font-mono font-bold uppercase text-[10px] bg-amber-500/20 px-2 py-0.5 rounded">
            DEMO ROUTER v2.4
          </span>
        </div>

        {/* 2. HEADER BAR WITH ORIGIN VILLAGE SELECTOR */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#101D2E] border border-[#1E2D42]">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#20D69A]/10 text-[#20D69A] border border-[#20D69A]/20">
              <Navigation className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-black text-white tracking-wide">
                Dijkstra Dynamic Evacuation Guidance & Shelter Router
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Topographic graph-weighted pathfinding avoiding flooded road segments and gorge bottlenecks
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Origin Village Selector */}
            <div className="flex items-center gap-2 bg-[#07111F] px-3 py-1.5 rounded-xl border border-[#1E2D42]">
              <MapPin className="w-3.5 h-3.5 text-[#00D4FF]" />
              <label className="text-xs text-slate-400 font-semibold">Start Location:</label>
              <select
                value={selectedOriginVillage}
                onChange={(e) => setSelectedOriginVillage(e.target.value)}
                className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer"
              >
                {villageOptions.map((v) => (
                  <option key={v.id} value={v.id} className="bg-[#101D2E]">
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <Link
              to="/map"
              className="px-4 py-2 rounded-xl bg-[#00D4FF] hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Inspect on Live Map</span>
            </Link>
          </div>
        </div>

        {/* 3. KEY ROUTE METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Distance */}
          <div className="p-5 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Safe Route Distance
            </span>
            <div className="text-3xl font-black text-white font-mono">
              {evacuationRoute?.total_distance_km || 3.12} km
            </div>
            <div className="text-[11px] text-[#20D69A] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Shortest Safe Dijkstra Path</span>
            </div>
          </div>

          {/* Travel Time */}
          <div className="p-5 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Estimated Travel Time
            </span>
            <div className="text-3xl font-black text-[#00D4FF] font-mono">
              {evacuationRoute?.estimated_time_minutes || 58} mins
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5" />
              <span>Uphill pace: ~3.2 km/h</span>
            </div>
          </div>

          {/* Safety Score */}
          <div className="p-5 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Route Safety Clearance
            </span>
            <div className="text-3xl font-black text-[#20D69A] font-mono">
              {evacuationRoute?.safety_score || 96}%
            </div>
            <div className="text-[11px] text-[#20D69A] font-semibold">
              Hazard Clearance Verified
            </div>
          </div>

          {/* Recommended Destination Shelter */}
          <div className="p-5 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Recommended Haven
            </span>
            <div className="text-base font-bold text-white truncate">
              {evacuationRoute?.destination_name || "Pine Ridge Safe Haven"}
            </div>
            <div className="text-[11px] text-[#00D4FF] font-mono">
              Elevation: +{evacuationRoute?.destination_shelter?.elevation_m || 1420}m MSL
            </div>
          </div>

        </div>

        {/* 4. BLOCKED ROADS ALERT (IF ANY) */}
        {evacuationRoute?.blocked_roads?.length > 0 && (
          <div className="p-5 rounded-3xl bg-[#FF3B45]/15 border border-[#FF3B45]/40 text-rose-200 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-[#FF3B45]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Blocked Road Segments (Dijkstra Active Avoidance)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF3B45] text-white text-[10px] font-black uppercase">
                {evacuationRoute.blocked_roads.length} Segments Closed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {evacuationRoute.blocked_roads.map((b, i) => (
                <div key={i} className="p-3 rounded-2xl bg-[#07111F]/80 border border-[#FF3B45]/30 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">{b.name}</span>
                    <span className="text-[11px] text-slate-400">{b.from} &rarr; {b.to}</span>
                  </div>
                  <span className="text-[10px] text-[#FF3B45] font-bold bg-[#FF3B45]/15 px-2 py-1 rounded-lg">
                    {b.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. ALTERNATIVE EVACUATION ROUTES COMPARISON */}
        <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E2D42] pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#00D4FF]" />
              Alternative Evacuation Routes & Terrain Comparison
            </h3>
            <span className="text-xs text-slate-400 font-mono">Dijkstra Multi-Path</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alternativeRoutes.map((rt) => (
              <div 
                key={rt.id} 
                className="p-4 rounded-2xl bg-[#07111F] border border-[#1E2D42] flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                      style={{ 
                        color: rt.color, 
                        backgroundColor: `${rt.color}20`,
                        border: `1px solid ${rt.color}40`
                      }}
                    >
                      {rt.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Safety: {rt.safety_score}%
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-2">{rt.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Dest: {rt.destination}</p>
                </div>

                <div className="pt-2 border-t border-[#1E2D42] flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">{rt.distance_km} km</span>
                  <span className="text-[#00D4FF] font-bold">{rt.time_minutes} mins</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. ELEVATION PROFILE CHART & STEP-BY-STEP WAYPOINTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Elevation Profile Chart (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-[#1E2D42] pb-3 text-xs">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Mountain className="w-4 h-4 text-[#20D69A]" />
                  Topographic Route Elevation Profile
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Total Ascent: +{evacuationRoute?.elevation_gain_m || 280}m</span>
              </div>

              <div className="h-56 mt-4 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={elevationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#20D69A" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#20D69A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D42" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 9 }} />
                    <YAxis stroke="#64748B" tick={{ fontSize: 9 }} domain={['dataMin - 50', 'dataMax + 50']} unit="m" />
                    <Tooltip formatter={(value) => [`${value} meters MSL`, 'Altitude']} />
                    <Area type="monotone" dataKey="altitude_m" name="Altitude" stroke="#20D69A" strokeWidth={2.5} fillOpacity={1} fill="url(#elevGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E2D42] text-[11px] text-slate-400 flex items-center justify-between">
              <span>Origin: {elevationData[0]?.altitude_m}m</span>
              <span className="font-bold text-[#20D69A]">Destination Shelter: {elevationData[elevationData.length - 1]?.altitude_m}m MSL (Safe from flood)</span>
            </div>
          </div>

          {/* Turn-by-Turn Waypoints (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl flex flex-col justify-between space-y-4">
            <div className="border-b border-[#1E2D42] pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Footprints className="w-4 h-4 text-[#00D4FF]" />
                Turn-by-Turn Waypoint Instructions
              </h3>
              <span className="text-[10px] text-slate-400">{waypoints.length} Checkpoints</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {waypoints.map((w, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-[#07111F] border border-[#1E2D42] text-xs flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#00D4FF]/20 text-[#00D4FF] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{w.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{w.altitude_m}m</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      {w.instruction}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#1E2D42] flex justify-end">
              <button
                onClick={handleDownloadPlan}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-[#00D4FF]" />
                <span>{downloadSuccess ? 'Downloaded!' : 'Download Offline Plan (PDF)'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </CommandCenterLayout>
  );
}

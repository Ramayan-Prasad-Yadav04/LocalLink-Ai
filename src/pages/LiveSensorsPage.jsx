import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { 
  CloudRain, 
  Droplets, 
  Activity, 
  Cpu, 
  Wifi, 
  BatteryCharging, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  SlidersHorizontal,
  RefreshCw,
  Gauge
} from 'lucide-react';
import { CommandCenterLayout } from '../components/CommandCenterLayout';
import { useSensorData } from '../context/SensorContext';

export function LiveSensorsPage() {
  const {
    liveSensor,
    history,
    selectedRegion,
    currentScenario,
    kalmanParams,
    setKalmanParams,
    sensors
  } = useSensorData();

  const [activeTelemetryTab, setActiveTelemetryTab] = useState('all'); // 'all' | 'water' | 'rain' | 'soil'

  const dangerThreshold = selectedRegion.dangerLevel || 3.5;
  const waterLevel = liveSensor?.water_level ?? 1.34;
  const rawWaterLevel = liveSensor?.raw_water_level ?? 1.39;
  const rainfall = liveSensor?.rainfall ?? 5.4;
  const rawRainfall = liveSensor?.raw_rainfall ?? 5.8;
  const soilMoisture = liveSensor?.soil_moisture ?? 38.2;
  const rawSoilMoisture = liveSensor?.raw_soil_moisture ?? 39.1;

  // Sensor stations list
  const stationsList = sensors.length > 0 ? sensors : [
    { id: "SENS-UPSTREAM-01", name: "Alaknanda Basin Upstream Gauge", type: "Ultrasonic River Gauge", lat: 30.155, lon: 78.790, battery: 96, rssi: -64, status: "HEALTHY", value: `${waterLevel}m` },
    { id: "SENS-MAND-02", name: "Mandakini Gorge Velocity Radar", type: "Surface Doppler Radar", lat: 30.142, lon: 78.805, battery: 92, rssi: -68, status: "HEALTHY", value: `${(waterLevel * 1.05).toFixed(2)}m` },
    { id: "SENS-RDG-03", name: "Chamoli Ridge Cloudburst Station", type: "Tipping Bucket Rain Gauge", lat: 30.165, lon: 78.820, battery: 98, rssi: -58, status: "HEALTHY", value: `${rainfall} mm/h` },
    { id: "SENS-CONF-04", name: "Rudraprayag Sangam Confluence Probe", type: "Ultrasonic Stage Recorder", lat: 30.135, lon: 78.815, battery: 89, rssi: -72, status: "HEALTHY", value: `${(waterLevel * 1.1).toFixed(2)}m` },
    { id: "SENS-LOW-05", name: "Mandakini Lowland Valley Soil Probe", type: "FDR Soil Moisture Sensor", lat: 30.140, lon: 78.798, battery: 94, rssi: -62, status: "HEALTHY", value: `${soilMoisture}%` }
  ];

  // Custom Chart Tooltips
  const CustomTooltip = ({ active, payload, label, unit }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#101D2E]/95 border border-[#1E2D42] p-2.5 rounded-xl shadow-xl text-xs space-y-1">
          <div className="font-mono text-slate-400 border-b border-[#1E2D42] pb-1">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 font-mono">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-bold text-white">{entry.value} {unit}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <CommandCenterLayout>
      <div className="space-y-6">
        
        {/* 1. HEADER TITLE WITH SIMULATION BADGE */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#101D2E] border border-[#1E2D42]">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">
              <Activity className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-wide">
                  Live Sensor Telemetry & Kalman Data Fusion
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30 text-[10px] font-black uppercase tracking-wider">
                  DEMO / SIMULATED DATA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Continuously updating hydrometric readings from catchment gauges across {selectedRegion.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-[#07111F] border border-[#1E2D42] text-xs flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#20D69A] animate-ping" />
              <span className="font-semibold">Telemetry Polling Active (2s tick)</span>
            </div>
          </div>
        </div>

        {/* 2. THE THREE DETAILED SENSOR CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* SENSOR 1: RAINFALL SENSOR */}
          <div className="p-5 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-blue-500/10 text-[#00D4FF] border border-[#00D4FF]/20">
                    <CloudRain className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Rainfall Precipitation Sensor</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Tipping Bucket Rain Gauge #RDG-03</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#20D69A] px-2 py-0.5 rounded-full bg-[#20D69A]/10 border border-[#20D69A]/20">
                  <Wifi className="w-3 h-3" /> Connected
                </span>
              </div>

              {/* Big Reading Display */}
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-black text-white font-mono tracking-tight">
                    {rainfall} <span className="text-sm font-bold text-slate-400 font-sans">mm/hr</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Raw Measurement: <span className="font-mono text-[#00D4FF]">{rawRainfall} mm/hr</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Status</span>
                  <span className={`text-xs font-bold ${rainfall > 50 ? 'text-[#FF3B45]' : rainfall > 20 ? 'text-[#FF9F43]' : 'text-[#20D69A]'}`}>
                    {rainfall > 50 ? 'Torrential Cloudburst' : rainfall > 20 ? 'Heavy Downpour' : 'Moderate / Normal'}
                  </span>
                </div>
              </div>

              {/* Historical Trend Line Chart */}
              <div className="h-32 mt-4 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D42" vertical={false} />
                    <XAxis dataKey="timestamp" stroke="#64748B" tick={{ fontSize: 9 }} tickLine={false} />
                    <YAxis stroke="#64748B" tick={{ fontSize: 9 }} domain={[0, 'auto']} tickLine={false} />
                    <Tooltip content={<CustomTooltip unit="mm/hr" />} />
                    <Area type="monotone" dataKey="rainfall" name="Rainfall" stroke="#00D4FF" strokeWidth={2} fillOpacity={1} fill="url(#rainGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Connectivity Metadata */}
            <div className="pt-3 border-t border-[#1E2D42] grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#20D69A]" />
                <span>4G Gateway • 14ms Latency</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <BatteryCharging className="w-3.5 h-3.5 text-[#20D69A]" />
                <span>Solar Battery 98%</span>
              </div>
            </div>
          </div>

          {/* SENSOR 2: WATER LEVEL SENSOR */}
          <div className="p-5 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-cyan-500/10 text-[#00D4FF] border border-[#00D4FF]/20">
                    <Droplets className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">River Water Level Sensor</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Ultrasonic Hydro Gauge #GAUGE-01</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#20D69A] px-2 py-0.5 rounded-full bg-[#20D69A]/10 border border-[#20D69A]/20">
                  <Wifi className="w-3 h-3" /> Connected
                </span>
              </div>

              {/* Big Reading Display */}
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-black text-white font-mono tracking-tight">
                    {waterLevel} <span className="text-sm font-bold text-slate-400 font-sans">meters</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Raw Measurement: <span className="font-mono text-cyan-300">{rawWaterLevel}m</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Danger Mark</span>
                  <span className="text-xs font-mono font-bold text-[#FF3B45]">
                    {dangerThreshold}0 meters
                  </span>
                </div>
              </div>

              {/* Historical Trend Line Chart with Danger Line */}
              <div className="h-32 mt-4 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D42" vertical={false} />
                    <XAxis dataKey="timestamp" stroke="#64748B" tick={{ fontSize: 9 }} tickLine={false} />
                    <YAxis stroke="#64748B" tick={{ fontSize: 9 }} domain={[0.8, Math.max(4.5, dangerThreshold + 0.5)]} tickLine={false} />
                    <Tooltip content={<CustomTooltip unit="m" />} />
                    <ReferenceLine y={dangerThreshold} stroke="#FF3B45" strokeDasharray="4 4" label={{ value: 'Danger', fill: '#FF3B45', fontSize: 10, position: 'insideTopLeft' }} />
                    <Line type="monotone" dataKey="raw_water_level" name="Raw Sensor" stroke="#64748B" strokeWidth={1} strokeDasharray="2 2" dot={false} />
                    <Line type="monotone" dataKey="water_level" name="Kalman Filtered" stroke="#00D4FF" strokeWidth={2.5} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Danger Indicator Meter */}
            <div className="pt-3 border-t border-[#1E2D42] space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Headroom to Breach:</span>
                <span className={`font-mono font-bold ${
                  waterLevel >= dangerThreshold ? 'text-[#FF3B45]' : (dangerThreshold - waterLevel) < 0.8 ? 'text-[#FF9F43]' : 'text-[#20D69A]'
                }`}>
                  {waterLevel >= dangerThreshold ? 'BREACHED (+0.00m)' : `+${(dangerThreshold - waterLevel).toFixed(2)}m margin`}
                </span>
              </div>
              <div className="w-full bg-[#07111F] rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    waterLevel >= dangerThreshold ? 'bg-[#FF3B45]' : (waterLevel / dangerThreshold) > 0.75 ? 'bg-[#FF9F43]' : 'bg-[#20D69A]'
                  }`}
                  style={{ width: `${Math.min(100, (waterLevel / dangerThreshold) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* SENSOR 3: SOIL MOISTURE SENSOR */}
          <div className="p-5 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-500/10 text-[#20D69A] border border-[#20D69A]/20">
                    <Gauge className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Soil Moisture Saturation Sensor</h3>
                    <span className="text-[10px] text-slate-400 font-mono">FDR Soil Probe #SOIL-LOW-05</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#20D69A] px-2 py-0.5 rounded-full bg-[#20D69A]/10 border border-[#20D69A]/20">
                  <Wifi className="w-3 h-3" /> Connected
                </span>
              </div>

              {/* Big Reading Display */}
              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-black text-white font-mono tracking-tight">
                    {soilMoisture}% <span className="text-sm font-bold text-slate-400 font-sans">moisture</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Raw Measurement: <span className="font-mono text-[#20D69A]">{rawSoilMoisture}%</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Saturation Warning</span>
                  <span className={`text-xs font-bold ${soilMoisture > 80 ? 'text-[#FF3B45]' : soilMoisture > 65 ? 'text-[#FF9F43]' : 'text-[#20D69A]'}`}>
                    {soilMoisture > 80 ? 'CRITICAL SATURATION' : soilMoisture > 65 ? 'HIGH SATURATION' : 'NORMAL ABSORPTION'}
                  </span>
                </div>
              </div>

              {/* Historical Trend Line Chart */}
              <div className="h-32 mt-4 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#20D69A" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#20D69A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D42" vertical={false} />
                    <XAxis dataKey="timestamp" stroke="#64748B" tick={{ fontSize: 9 }} tickLine={false} />
                    <YAxis stroke="#64748B" tick={{ fontSize: 9 }} domain={[20, 100]} tickLine={false} />
                    <Tooltip content={<CustomTooltip unit="%" />} />
                    <Area type="monotone" dataKey="soil_moisture" name="Soil Moisture" stroke="#20D69A" strokeWidth={2} fillOpacity={1} fill="url(#soilGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Infiltration warning */}
            <div className="pt-3 border-t border-[#1E2D42] text-[11px] text-slate-400 flex items-center justify-between">
              <span>Catchment Runoff Index:</span>
              <span className="font-bold text-white">
                {soilMoisture > 80 ? 'Rapid Surface Runoff 92%' : 'Infiltration Active 45%'}
              </span>
            </div>
          </div>

        </div>

        {/* 3. SENSOR FUSION SECTION (RAW VS KALMAN FILTERED) */}
        <div className="p-6 rounded-3xl bg-[#101D2E] border border-[#1E2D42] shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2D42] pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Cpu className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">
                  Kalman Filter Sensor Data Fusion Engine
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time State Estimation removing acoustic splashing bounce and ultrasonic turbulent noise: [h, v]^T
                </p>
              </div>
            </div>

            {/* Data Confidence Score Pill */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-[#07111F] border border-[#1E2D42] text-xs flex items-center gap-2">
                <span className="text-slate-400">Data Confidence:</span>
                <span className="font-bold text-[#20D69A] font-mono">{liveSensor?.data_confidence || 98.4}%</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#07111F] border border-[#1E2D42] text-xs flex items-center gap-2">
                <span className="text-slate-400">Innovation Residual:</span>
                <span className="font-bold text-[#00D4FF] font-mono">
                  {(rawWaterLevel - waterLevel >= 0 ? '+' : '') + (rawWaterLevel - waterLevel).toFixed(3)}m
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Comparison Chart: Raw Sensor vs Kalman-Filtered Value */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-300">Live Waveform: Raw Ultrasonic Sensor (Grey Dotted) vs Kalman State Estimate (Cyan Solid)</span>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-slate-500 border-dashed" />
                  <span>Raw Noisy Measurement</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#00D4FF]" />
                  <span className="text-[#00D4FF] font-bold">Kalman Filtered Signal</span>
                </span>
              </div>
            </div>

            <div className="h-56 w-full bg-[#07111F] p-3 rounded-2xl border border-[#1E2D42]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2D42" vertical={false} />
                  <XAxis dataKey="timestamp" stroke="#64748B" tick={{ fontSize: 9 }} tickLine={false} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 9 }} domain={['dataMin - 0.2', 'dataMax + 0.2']} tickLine={false} />
                  <Tooltip content={<CustomTooltip unit="m" />} />
                  <Line 
                    type="monotone" 
                    dataKey="raw_water_level" 
                    name="Raw Ultrasonic" 
                    stroke="#64748B" 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4" 
                    dot={{ r: 2, fill: '#64748B' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="water_level" 
                    name="Kalman State" 
                    stroke="#00D4FF" 
                    strokeWidth={3} 
                    dot={{ r: 3, fill: '#00D4FF' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sensor Health Status Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#20D69A]" />
              Telemetry Station Health Matrix (All Monitored Nodes)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#1E2D42] rounded-2xl overflow-hidden">
                <thead className="bg-[#07111F] text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-[#1E2D42]">
                  <tr>
                    <th className="py-2.5 px-4">Station ID & Name</th>
                    <th className="py-2.5 px-4">Sensor Instrument</th>
                    <th className="py-2.5 px-4">Latest Value</th>
                    <th className="py-2.5 px-4">Signal RSSI</th>
                    <th className="py-2.5 px-4">Battery</th>
                    <th className="py-2.5 px-4">Health Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2D42] text-slate-200">
                  {stationsList.map((st) => (
                    <tr key={st.id} className="hover:bg-[#16273e]/50 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-white">
                        <div>{st.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{st.id} • Lat: {st.lat}, Lon: {st.lon}</div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">{st.type}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-[#00D4FF]">{st.value}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-400">{st.rssi} dBm</td>
                      <td className="py-2.5 px-4">
                        <span className="flex items-center gap-1 font-mono text-[#20D69A]">
                          <BatteryCharging className="w-3.5 h-3.5" /> {st.battery}%
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#20D69A]/15 text-[#20D69A] border border-[#20D69A]/30 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#20D69A] animate-pulse" />
                          OPERATIONAL
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </CommandCenterLayout>
  );
}

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Activity, Droplets, CloudRain, Gauge, Table, LineChart as ChartIcon } from 'lucide-react';
import { formatWaterLevel, formatRainfall, formatSoilMoisture } from '../utils/formatters';

export function SensorGraphs({ history }) {
  const [activeTab, setActiveTab] = useState('water'); // 'water' | 'rainfall' | 'soil' | 'table'

  const formattedHistory = (history || []).map((item) => ({
    ...item,
    time: item.timestamp?.slice(0, 8) || '00:00:00'
  }));

  return (
    <div className="rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 p-4 lg:p-5 shadow-lg flex flex-col h-full">
      
      {/* Header with Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Live Sensor Telemetry & Kalman Sensor Fusion
            </h2>
            <p className="text-xs text-slate-400">
              High-frequency updates every 2 seconds • Ultrasonic river gauge, rain radar & soil array
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('water')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'water'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Water Level (Kalman)</span>
          </button>

          <button
            onClick={() => setActiveTab('rainfall')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'rainfall'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rainfall</span>
          </button>

          <button
            onClick={() => setActiveTab('soil')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'soil'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Soil Moisture</span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'table'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Log Table</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-[260px]">
        {activeTab === 'water' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full" />
                <strong className="text-cyan-400 font-semibold">Kalman Filtered Level:</strong> Smooth state estimation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 border-t border-dashed border-amber-400" />
                <strong className="text-amber-400 font-semibold">Raw Ultrasonic Sensor:</strong> Mountain stream turbulence noise
              </span>
            </div>

            <div className="flex-1 w-full min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedHistory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${v.toFixed(1)}m`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(val, name) => [
                      formatWaterLevel(val), 
                      name === 'water_level' ? 'Kalman Filtered' : 'Raw Sensor'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="raw_water_level" 
                    stroke="#f59e0b" 
                    strokeWidth={1.5} 
                    strokeDasharray="3 3" 
                    dot={false}
                    name="raw_water_level"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="water_level" 
                    stroke="#06b6d4" 
                    strokeWidth={2.5} 
                    dot={false}
                    activeDot={{ r: 4, fill: '#06b6d4' }}
                    name="water_level"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'rainfall' && (
          <div className="h-full flex flex-col">
            <div className="text-[11px] text-slate-400 mb-2 px-1">
              Live precipitation intensity (mm/h) recorded by ridge-top radar rain gauge
            </div>
            <div className="flex-1 w-full min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedHistory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${v.toFixed(0)}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(val) => [formatRainfall(val), 'Precipitation Rate']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rainfall" 
                    stroke="#818cf8" 
                    strokeWidth={2} 
                    fill="url(#rainGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'soil' && (
          <div className="h-full flex flex-col">
            <div className="text-[11px] text-slate-400 mb-2 px-1">
              Volumetric Soil Moisture Saturation (% saturation) across catchment slopes
            </div>
            <div className="flex-1 w-full min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedHistory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(val) => [formatSoilMoisture(val), 'Soil Saturation']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="soil_moisture" 
                    stroke="#2dd4bf" 
                    strokeWidth={2} 
                    fill="url(#soilGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'table' && (
          <div className="h-full overflow-y-auto max-h-[240px] rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Raw Level</th>
                  <th className="py-2 px-3 text-cyan-400">Kalman Level</th>
                  <th className="py-2 px-3">Rainfall</th>
                  <th className="py-2 px-3">Soil Moisture</th>
                  <th className="py-2 px-3">Rate of Rise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {formattedHistory.slice().reverse().map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-1.5 px-3 text-slate-400">{r.timestamp}</td>
                    <td className="py-1.5 px-3 text-amber-300">{formatWaterLevel(r.raw_water_level)}</td>
                    <td className="py-1.5 px-3 text-cyan-300 font-bold">{formatWaterLevel(r.water_level)}</td>
                    <td className="py-1.5 px-3 text-indigo-300">{formatRainfall(r.rainfall)}</td>
                    <td className="py-1.5 px-3 text-teal-300">{formatSoilMoisture(r.soil_moisture)}</td>
                    <td className="py-1.5 px-3 text-slate-400">{Number(r.rate_of_rise).toFixed(4)} m/m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

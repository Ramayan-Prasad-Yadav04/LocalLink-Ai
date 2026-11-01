import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { TrendingUp, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatWaterLevel } from '../utils/formatters';

export function PredictionChart({ prediction, currentWaterLevel }) {
  const timeSeries = prediction?.time_series || [];
  const meanPredicted30m = prediction?.mean_water_level || 1.40;
  const floodProb = prediction?.flood_probability || 0.0;
  const dangerThreshold = prediction?.danger_threshold || 3.5;
  const estimatedTimeToBreach = prediction?.estimated_time_to_breach_min;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isAboveDanger = data.mean_water_level >= dangerThreshold;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-white">Minute +{label} Forecast</span>
            <span className="text-[10px] text-slate-400">Monte-Carlo Mean</span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-slate-300">Mean Water Level:</span>
            <span className={`font-mono font-bold text-sm ${isAboveDanger ? 'text-rose-400' : 'text-cyan-400'}`}>
              {formatWaterLevel(data.mean_water_level)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>95% CI Range:</span>
            <span className="font-mono text-purple-300">
              [{Number(data.ci_lower).toFixed(2)}m - {Number(data.ci_upper).toFixed(2)}m]
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
            <span className="text-slate-400">Danger Margin:</span>
            <span className={`font-semibold ${
              data.mean_water_level >= dangerThreshold ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {data.mean_water_level >= dangerThreshold 
                ? `+${(data.mean_water_level - dangerThreshold).toFixed(2)}m BREACH` 
                : `${(dangerThreshold - data.mean_water_level).toFixed(2)}m safe buffer`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 p-4 lg:p-5 shadow-lg flex flex-col h-full">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              30-Minute Water-Level Forecast & Uncertainty Band
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Rainfall-Runoff Kinematic Model with 200 Monte-Carlo stochastic scenarios
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 text-purple-300 border border-purple-500/30 text-[11px] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>200 Scenarios Ensembled</span>
          </div>

          {estimatedTimeToBreach ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Breach Expected in ~{estimatedTimeToBreach} mins</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>No Threshold Breach Projected</span>
            </div>
          )}
        </div>
      </div>

      {/* Legend & Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-cyan-400 rounded-full" />
          <span className="text-slate-300">Mean Prediction:</span>
          <span className="font-mono font-bold text-white">{formatWaterLevel(meanPredicted30m)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-1 bg-purple-500/50 rounded-sm" />
          <span className="text-slate-300">95% Confidence Band</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-500" />
          <span className="text-rose-400 font-semibold">Danger Threshold:</span>
          <span className="font-mono text-rose-300 font-bold">3.50 m</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Flood Probability:</span>
          <span className={`font-mono font-bold ${floodProb >= 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {Number(floodProb).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Recharts Visualization */}
      <div className="flex-1 w-full min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={timeSeries}
            margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
          >
            <defs>
              {/* Shaded confidence interval gradient */}
              <linearGradient id="ciGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

            <XAxis 
              dataKey="minute" 
              tickFormatter={(v) => `+${v}m`}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
            />

            <YAxis 
              domain={[0.5, (dataMax) => Math.max(4.2, Math.ceil(dataMax * 1.15))]}
              tickFormatter={(v) => `${v.toFixed(1)}m`}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* 3.5 m Danger Threshold Reference Line */}
            <ReferenceLine 
              y={3.5} 
              stroke="#ef4444" 
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{ 
                value: 'DANGER THRESHOLD (3.50 m)', 
                position: 'top', 
                fill: '#f87171', 
                fontSize: 10,
                fontWeight: 700 
              }} 
            />

            {/* Current Water Level Reference */}
            {currentWaterLevel && (
              <ReferenceLine 
                y={currentWaterLevel} 
                stroke="#06b6d4" 
                strokeDasharray="2 2"
                strokeOpacity={0.6}
                label={{ 
                  value: `Current: ${Number(currentWaterLevel).toFixed(2)}m`, 
                  position: 'insideBottomRight', 
                  fill: '#22d3ee', 
                  fontSize: 10 
                }} 
              />
            )}

            {/* Shaded Confidence Interval Upper Bound */}
            <Area
              type="monotone"
              dataKey="ci_upper"
              stroke="#a855f7"
              strokeWidth={1}
              strokeDasharray="3 3"
              fillOpacity={1}
              fill="url(#ciGradient)"
              name="95% CI Upper"
            />

            {/* Shaded Confidence Interval Lower Bound */}
            <Line
              type="monotone"
              dataKey="ci_lower"
              stroke="#a855f7"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              name="95% CI Lower"
            />

            {/* Mean Water Level Line */}
            <Line
              type="monotone"
              dataKey="mean_water_level"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ r: 2.5, fill: '#38bdf8' }}
              activeDot={{ r: 5, fill: '#ffffff', stroke: '#0284c7', strokeWidth: 2 }}
              name="Mean Water Level"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

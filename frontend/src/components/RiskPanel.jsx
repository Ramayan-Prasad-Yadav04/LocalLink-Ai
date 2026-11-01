import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  Layers, 
  Flame,
  Info,
  Clock,
  Compass
} from 'lucide-react';
import { getRiskDetails, formatWaterLevel, formatPercent } from '../utils/formatters';

export function RiskPanel({ risk, onFocusEvacuation }) {
  const currentRisk = risk?.risk_level || 'LOW';
  const riskDetails = getRiskDetails(currentRisk);
  const floodProb = risk?.flood_probability ?? 0.0;
  const predLevel = risk?.predicted_water_level_30m ?? 1.40;
  const ciLower = risk?.confidence_interval?.lower ?? 1.25;
  const ciUpper = risk?.confidence_interval?.upper ?? 1.55;

  return (
    <div className={`rounded-2xl bg-slate-900/80 backdrop-blur-md border p-4 lg:p-5 shadow-lg flex flex-col justify-between transition-all ${riskDetails.border}`}>
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${riskDetails.bg} ${riskDetails.text}`}>
              {currentRisk === 'CRITICAL' || currentRisk === 'HIGH' ? (
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Flash Flood Risk Engine
              </h2>
              <p className="text-[11px] text-slate-400">
                Hydrological Classification with Multi-Cycle Hysteresis Filtering
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${riskDetails.badge}`}>
            {currentRisk}
          </span>
        </div>

        {/* Diagnostic Metrics Matrix */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Flood Probability</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-black ${
                floodProb >= 50 ? 'text-rose-400' : (floodProb >= 20 ? 'text-amber-400' : 'text-emerald-400')
              }`}>
                {formatPercent(floodProb)}
              </span>
              <span className="text-[10px] text-slate-400">at 3.5m</span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">30m Predicted Level</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-white">
                {formatWaterLevel(predLevel)}
              </span>
            </div>
          </div>
        </div>

        {/* Confidence Interval Info */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mb-3 text-xs flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            95% Ensemble Confidence Interval:
          </span>
          <span className="font-mono text-purple-300 font-bold">
            [{ciLower.toFixed(2)}m — {ciUpper.toFixed(2)}m]
          </span>
        </div>

        {/* Risk Explanation */}
        <div className="mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Hydrological Analysis & Diagnostics
          </span>
          <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
            currentRisk === 'CRITICAL' 
              ? 'bg-rose-950/30 border-rose-800/50 text-rose-200' 
              : (currentRisk === 'HIGH' 
                  ? 'bg-orange-950/30 border-orange-800/50 text-orange-200' 
                  : (currentRisk === 'MODERATE' 
                      ? 'bg-amber-950/30 border-amber-800/50 text-amber-200' 
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'))
          }`}>
            {risk.explanation || 'River discharge and soil moisture absorption within safe regulatory baseline.'}
          </div>
        </div>

        {/* Recommended Action */}
        <div className="mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Mandatory Protocol / Recommended Action
          </span>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-white font-medium flex items-start gap-2">
            <Compass className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            <span>{risk.recommended_action || 'Routine hydrometric observation active. No emergency dispatch required.'}</span>
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>Last Evaluated: {risk.last_evaluated ? new Date(risk.last_evaluated).toLocaleTimeString() : 'Live'}</span>
        </div>

        {(currentRisk === 'HIGH' || currentRisk === 'CRITICAL') && onFocusEvacuation && (
          <button
            onClick={onFocusEvacuation}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center gap-1"
          >
            <span>Evacuation Map</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
}

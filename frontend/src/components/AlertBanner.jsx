import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight, BellRing } from 'lucide-react';
import { getRiskDetails } from '../utils/formatters';

export function AlertBanner({ risk, onScrollToEvacuation }) {
  const riskLevel = risk?.risk_level || 'LOW';
  
  // Only show high-priority banner for HIGH or CRITICAL
  if (riskLevel !== 'HIGH' && riskLevel !== 'CRITICAL') {
    return null;
  }

  const isCritical = riskLevel === 'CRITICAL';
  const riskDetails = getRiskDetails(riskLevel);

  return (
    <div className={`w-full py-3 px-4 border-b ${
      isCritical 
        ? 'bg-gradient-to-r from-rose-950/90 via-red-900/90 to-rose-950/90 border-rose-500/80 shadow-lg shadow-rose-950/50' 
        : 'bg-gradient-to-r from-orange-950/90 via-amber-900/80 to-orange-950/90 border-orange-500/80 shadow-lg shadow-orange-950/50'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl flex items-center justify-center ${
            isCritical ? 'bg-rose-600 text-white animate-bounce' : 'bg-orange-500 text-slate-950'
          }`}>
            <BellRing className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider ${riskDetails.badge}`}>
                {riskLevel} WARNING
              </span>
              <span className="text-xs font-bold text-white tracking-wide">
                {isCritical 
                  ? 'IMMEDIATE FLASH FLOOD INUNDATION PROTOCOL ACTIVATED' 
                  : 'RAPID RUNOFF ELEVATION — PREPARE EVACUATION CORRIDORS'}
              </span>
            </div>

            <p className="text-xs text-slate-200 mt-0.5 font-medium">
              {risk.explanation || 'Water level rapidly approaching critical danger threshold.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onScrollToEvacuation && (
            <button
              onClick={onScrollToEvacuation}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md ${
                isCritical
                  ? 'bg-white text-rose-700 hover:bg-slate-100 hover:shadow-rose-500/40 animate-pulse'
                  : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
              }`}
            >
              <span>View Evacuation Route</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

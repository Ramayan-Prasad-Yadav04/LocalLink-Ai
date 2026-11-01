import React from 'react';
import { ShieldAlert, AlertTriangle, X, Volume2, ArrowRight } from 'lucide-react';
import { getRiskDetails } from '../utils/formatters';

export function EmergencyAlertModal({ modalData, onDismiss, onScrollToEvacuation }) {
  if (!modalData) return null;

  const riskLevel = modalData.risk_level || 'CRITICAL';
  const riskDetails = getRiskDetails(riskLevel);
  const isCritical = riskLevel === 'CRITICAL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg rounded-2xl bg-[#0b1120] border-2 shadow-2xl p-6 text-slate-100 ${
        isCritical ? 'border-rose-500 shadow-rose-600/30' : 'border-orange-500 shadow-orange-600/30'
      }`}>
        
        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Icon & Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-2xl flex items-center justify-center ${
            isCritical ? 'bg-rose-600 text-white animate-bounce' : 'bg-orange-500 text-slate-950'
          }`}>
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div>
            <span className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider ${riskDetails.badge}`}>
              {riskLevel} EMERGENCY WARNING
            </span>
            <h3 className="text-lg font-black text-white mt-1 leading-snug">
              {modalData.title}
            </h3>
          </div>
        </div>

        {/* Message body */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed mb-4">
          <p>{modalData.message}</p>
        </div>

        {/* Action Required */}
        <div className="bg-rose-950/40 border border-rose-800/60 p-3.5 rounded-xl mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 block mb-1">
            Mandatory Operator Action:
          </span>
          <p className="text-xs text-rose-100 font-bold leading-normal">
            {modalData.action}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700"
          >
            Acknowledge & Close
          </button>

          {onScrollToEvacuation && (
            <button
              onClick={() => {
                onDismiss();
                onScrollToEvacuation();
              }}
              className="px-4 py-2 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-600/40"
            >
              <span>Follow Evacuation Route</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

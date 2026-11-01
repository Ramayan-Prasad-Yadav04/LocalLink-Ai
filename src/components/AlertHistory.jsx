import React from 'react';
import { BellRing, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { getRiskDetails } from '../utils/formatters';

export function AlertHistory({ alerts = [], onAcknowledge }) {
  return (
    <div className="rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 p-4 lg:p-5 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Emergency Broadcast & Alert History Log
            </h2>
            <p className="text-[11px] text-slate-400">
              Chronological audit log of automated and operator acknowledgments
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
          {alerts.length} Total Alerts
        </span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2.5 pr-1">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No emergency alerts logged in this session.
          </div>
        ) : (
          alerts.map((alert) => {
            const riskDetails = getRiskDetails(alert.risk_level);
            return (
              <div 
                key={alert.id}
                className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90 text-xs transition-colors hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${riskDetails.badge}`}>
                      {alert.risk_level}
                    </span>
                    <span className="font-bold text-white text-xs">{alert.title}</span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {alert.timestamp?.slice(11, 19) || alert.timestamp}
                  </span>
                </div>

                <p className="text-slate-300 text-xs mb-2 leading-relaxed">
                  {alert.message}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px]">
                  <span className="text-slate-400 truncate max-w-[70%]">
                    <strong>Action:</strong> {alert.action_required}
                  </span>

                  {alert.acknowledged ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => onAcknowledge && onAcknowledge(alert.id)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

export const CompareDock: React.FC = () => {
  const { comparedProviders, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (comparedProviders.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl p-3 shadow-2xl shadow-blue-950/40 animate-slideUp">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Summary & Selected Providers Avatars */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Scale className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {comparedProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-xl text-xs text-white shrink-0"
              >
                <span className="font-semibold truncate max-w-[110px]">{provider.name}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded">
                  {provider.trustScore.overall}
                </span>
                <button
                  onClick={() => removeFromCompare(provider.id)}
                  className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-700"
                  title="Remove from comparison"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
          >
            Clear
          </button>

          <button
            onClick={() => navigate('/compare')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 flex items-center gap-1.5 transition-all"
          >
            <span>Compare Matrix ({comparedProviders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

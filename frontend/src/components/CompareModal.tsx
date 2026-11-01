import React from 'react';
import { 
  X, 
  Scale, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Phone, 
  Zap, 
  Check, 
  Navigation,
  Sparkles
} from 'lucide-react';
import { Provider } from '../data/mockData';

interface CompareModalProps {
  providers: Provider[];
  onRemoveFromCompare: (providerId: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  onBookWithOtp: (provider: Provider) => void;
  onNavigate: (provider: Provider) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  providers,
  onRemoveFromCompare,
  onClearAll,
  onClose,
  onBookWithOtp,
  onNavigate,
}) => {
  if (providers.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
        <Scale className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <h3 className="text-base font-semibold text-white mb-1">No Providers Selected for Comparison</h3>
        <p className="text-xs text-slate-400 mb-4">
          Select "Add to Compare" on any provider cards in the discovery view to compare them side-by-side.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
        >
          Return to Discovery
        </button>
      </div>
    );
  }

  // Find best values for comparison highlighting
  const highestTrust = Math.max(...providers.map(p => p.trustScore.overall));
  const shortestDistance = Math.min(...providers.map(p => p.distanceKm));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Compare Providers Side-by-Side</h2>
            <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full border border-blue-500/30">
              {providers.length} Selected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Slide 2: "Converts Search &rarr; Compare &rarr; Act. Shows the most relevant option according to need."
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearAll}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto mt-4">
        <div className={`grid gap-4 min-w-[700px]`} style={{ gridTemplateColumns: `repeat(${providers.length}, minmax(240px, 1fr))` }}>
          {providers.map((p) => {
            const isTopTrust = p.trustScore.overall === highestTrust;
            const isClosest = p.distanceKm === shortestDistance;

            return (
              <div 
                key={p.id}
                className={`bg-slate-950/80 rounded-2xl border p-4 flex flex-col justify-between ${
                  isTopTrust 
                    ? 'border-emerald-500/60 shadow-lg shadow-emerald-950/20' 
                    : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Card top */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      {p.categoryLabel}
                    </span>
                    <button
                      onClick={() => onRemoveFromCompare(p.id)}
                      className="text-slate-500 hover:text-rose-400 p-0.5"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">{p.name}</h3>

                  {isTopTrust && (
                    <div className="mb-3 px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      Highest Trust Match ({p.trustScore.overall} pts)
                    </div>
                  )}

                  {/* TrustScore Metric */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 mb-3 text-center">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">TrustScore</span>
                    <span className={`text-2xl font-black ${isTopTrust ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {p.trustScore.overall}<span className="text-xs text-slate-500">/100</span>
                    </span>
                    <div className="flex justify-center gap-2 text-[10px] text-slate-400 mt-1">
                      <span>Verif: {p.trustScore.verification}%</span>
                      <span>Rel: {p.trustScore.reliability}%</span>
                    </div>
                  </div>

                  {/* Attribute Rows */}
                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" /> Distance:
                      </span>
                      <span className={`font-semibold ${isClosest ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {p.distanceKm} km {isClosest ? '(Closest)' : ''}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Arrival ETA:
                      </span>
                      <span className="font-semibold text-white">~{p.estimatedTimeMin} mins</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Pricing / Rates:</span>
                      <span className="font-medium text-slate-200 text-right truncate max-w-[140px]">{p.startingPrice}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Live Status:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Available Now
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Urgency SOS:</span>
                      <span className={`font-medium ${p.urgencySupported ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {p.urgencySupported ? 'Supported (24/7)' : 'Standard Hours'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-slate-400 text-[11px]">Accreditation:</span>
                      <span className="text-[11px] text-slate-300 font-medium bg-slate-900 p-1.5 rounded border border-slate-800">
                        {p.trustScore.verificationSource}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                  <button
                    onClick={() => onBookWithOtp(p)}
                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1 shadow-md"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Instant Request (OTP)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${p.phoneNumber}`}
                      className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs rounded-xl flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>Call</span>
                    </a>
                    <button
                      onClick={() => onNavigate(p)}
                      className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs rounded-xl flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3 h-3 text-blue-400" />
                      <span>Route</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

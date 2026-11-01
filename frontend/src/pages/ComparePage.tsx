import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Scale, 
  X, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Star, 
  Phone, 
  Navigation, 
  Zap, 
  ArrowLeft, 
  CheckCircle2, 
  Plus, 
  Sparkles,
  Award
} from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { INITIAL_PROVIDERS } from '../data/mockData';
import { Provider } from '../types';
import { CallModal } from '../components/CallModal';
import { BookingOtpModal } from '../components/BookingOtpModal';

export const ComparePage: React.FC = () => {
  const { comparedProviders, removeFromCompare, clearCompare, addToCompare } = useCompare();
  const navigate = useNavigate();

  const [callingProvider, setCallingProvider] = useState<Provider | null>(null);
  const [bookingProvider, setBookingProvider] = useState<Provider | null>(null);

  // Available providers not yet in compare
  const availableToAdd = INITIAL_PROVIDERS.filter(
    (p) => !comparedProviders.some((cp) => cp.id === p.id)
  );

  // Determine winners
  const highestTrust = comparedProviders.length > 0 
    ? Math.max(...comparedProviders.map(p => p.trustScore.overall)) 
    : 0;

  const shortestDistance = comparedProviders.length > 0
    ? Math.min(...comparedProviders.map(p => p.distanceKm))
    : 0;

  const highestRating = comparedProviders.length > 0
    ? Math.max(...comparedProviders.map(p => p.rating))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Scale className="w-7 h-7 text-blue-400" />
            <span>Hyperlocal Provider Comparison</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Side-by-side evaluation of TrustScore, proximity, pricing, and certified services
          </p>
        </div>

        {comparedProviders.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Clear Comparison
            </button>
            <button
              onClick={() => navigate('/search')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
            >
              Find More Providers
            </button>
          </div>
        )}
      </div>

      {/* Comparison Matrix */}
      {comparedProviders.length > 0 ? (
        <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-4 md:p-6 shadow-2xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            {/* Header: Provider Cards */}
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-4 px-4 w-48 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  Comparison Factors
                </th>
                {comparedProviders.map((p) => (
                  <th key={p.id} className="py-4 px-4 align-top min-w-[220px]">
                    <div className="relative p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800"
                        title="Remove from compare"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                        {p.categoryLabel}
                      </span>
                      <h3 className="font-bold text-sm text-white line-clamp-1 pr-6">{p.name}</h3>

                      <div className="pt-2 flex flex-col gap-2">
                        <Link
                          to={`/provider/${p.id}`}
                          className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-center font-bold text-xs rounded-xl transition-all shadow-sm"
                        >
                          View Details
                        </Link>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => setCallingProvider(p)}
                            className="py-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 border border-slate-700"
                          >
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>Call</span>
                          </button>
                          <button
                            onClick={() => setBookingProvider(p)}
                            className="py-1 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                          >
                            <Zap className="w-3 h-3 text-amber-300" />
                            <span>Book</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {/* TrustScore */}
              <tr>
                <td className="py-4 px-4 font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>TrustScore (0-100)</span>
                </td>
                {comparedProviders.map((p) => {
                  const isTop = p.trustScore.overall === highestTrust;
                  return (
                    <td key={p.id} className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-black ${isTop ? 'text-emerald-400 font-mono' : 'text-slate-200'}`}>
                          {p.trustScore.overall}/100
                        </span>
                        {isTop && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30 flex items-center gap-1">
                            <Award className="w-3 h-3" /> Best Trust
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Verification: {p.trustScore.verification}% • Reliability: {p.trustScore.reliability}%
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Distance & Arrival ETA */}
              <tr>
                <td className="py-4 px-4 font-bold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Proximity & ETA</span>
                </td>
                {comparedProviders.map((p) => {
                  const isClosest = p.distanceKm === shortestDistance;
                  return (
                    <td key={p.id} className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isClosest ? 'text-blue-400' : 'text-slate-300'}`}>
                          {p.distanceKm} km
                        </span>
                        {isClosest && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                            Closest
                          </span>
                        )}
                      </div>
                      <span className="text-emerald-400 font-medium text-[11px] block mt-0.5">
                        ETA: ~{p.estimatedTimeMin} mins
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Availability / Open Status */}
              <tr>
                <td className="py-4 px-4 font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Availability Status</span>
                </td>
                {comparedProviders.map((p) => (
                  <td key={p.id} className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${p.isAvailableNow ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                      <span className={`font-semibold ${p.isAvailableNow ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {p.isAvailableNow ? 'Open Now' : 'Closed'}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px] block mt-0.5">{p.openingHours}</span>
                  </td>
                ))}
              </tr>

              {/* Rating & Reviews */}
              <tr>
                <td className="py-4 px-4 font-bold text-slate-300 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Rating & Reviews</span>
                </td>
                {comparedProviders.map((p) => (
                  <td key={p.id} className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <span>{p.rating} ★</span>
                      <span className="text-slate-400 font-normal">({p.reviewCount} reviews)</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Pricing Level */}
              <tr>
                <td className="py-4 px-4 font-bold text-slate-300">Pricing & Starting Rate</td>
                {comparedProviders.map((p) => (
                  <td key={p.id} className="py-4 px-4">
                    <span className="font-bold text-white text-sm">{p.priceLevel}</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">{p.startingPrice}</span>
                  </td>
                ))}
              </tr>

              {/* Certified Services List */}
              <tr>
                <td className="py-4 px-4 font-bold text-slate-300 align-top">Available Services</td>
                {comparedProviders.map((p) => (
                  <td key={p.id} className="py-4 px-4 align-top space-y-1.5">
                    {p.services.slice(0, 3).map((s) => (
                      <div key={s.id} className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
                        <div className="font-semibold text-white truncate">{s.name}</div>
                        <div className="flex justify-between text-slate-400 text-[10px] mt-0.5">
                          <span className="text-emerald-400 font-mono">{s.price}</span>
                          <span>{s.estimatedDuration}</span>
                        </div>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>

              {/* Regulatory Verification Source */}
              <tr>
                <td className="py-4 px-4 font-bold text-slate-300">Audit Source</td>
                {comparedProviders.map((p) => (
                  <td key={p.id} className="py-4 px-4 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1.5 text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{p.trustScore.verificationSource}</span>
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4 max-w-lg mx-auto">
          <Scale className="w-12 h-12 text-blue-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">No Providers Selected for Comparison</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Select up to 4 providers from search results to compare TrustScore, distance, pricing, and certified services side-by-side.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                addToCompare(INITIAL_PROVIDERS[0]);
                addToCompare(INITIAL_PROVIDERS[1]);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700"
            >
              Load Sample Comparison
            </button>
            <button
              onClick={() => navigate('/search')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25"
            >
              Browse Nearby Providers
            </button>
          </div>
        </div>
      )}

      {/* Quick Add More Section */}
      {comparedProviders.length > 0 && comparedProviders.length < 4 && availableToAdd.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Add More Providers to Comparison ({comparedProviders.length}/4)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableToAdd.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-white truncate max-w-[170px]">{p.name}</h4>
                  <p className="text-[11px] text-slate-400">{p.categoryLabel} • {p.distanceKm} km</p>
                </div>
                <button
                  onClick={() => addToCompare(p)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-semibold border border-blue-500/30 text-xs shrink-0"
                >
                  + Compare
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {callingProvider && (
        <CallModal
          provider={callingProvider}
          onClose={() => setCallingProvider(null)}
        />
      )}

      {bookingProvider && (
        <BookingOtpModal
          provider={bookingProvider}
          onClose={() => setBookingProvider(null)}
        />
      )}
    </div>
  );
};

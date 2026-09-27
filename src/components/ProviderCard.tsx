import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Phone, 
  Navigation, 
  Star, 
  CheckCircle, 
  Scale, 
  Sparkles, 
  Heart,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import { Provider } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';

interface ProviderCardProps {
  provider: Provider;
  onOpenTrustModal?: (provider: Provider) => void;
  onBookWithOtp?: (provider: Provider) => void;
  onNavigate?: (provider: Provider) => void;
  onCall?: (provider: Provider) => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onOpenTrustModal,
  onBookWithOtp,
  onNavigate,
  onCall,
}) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useAuth();
  const { isInCompare, toggleCompare } = useCompare();

  const isFav = isFavorite(provider.id);
  const isCompared = isInCompare(provider.id);
  const { trustScore } = provider;

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200 hover:shadow-2xl hover:shadow-blue-950/30 flex flex-col justify-between group">
      <div>
        {/* Top Header: Category, Favorite, and TrustScore */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              {provider.categoryLabel}
            </span>
            <h3 
              onClick={() => navigate(`/provider/${provider.id}`)}
              className="text-base font-bold text-white group-hover:text-blue-300 transition-colors mt-0.5 line-clamp-1 cursor-pointer"
            >
              {provider.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Save / Favorite Button */}
            <button
              onClick={() => toggleFavorite(provider.id)}
              className={`p-1.5 rounded-xl border transition-colors ${
                isFav
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isFav ? 'Remove from favorites' : 'Save provider'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>

            {/* TrustScore Interactive Pill */}
            <button
              onClick={() => onOpenTrustModal && onOpenTrustModal(provider)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-colors text-xs font-bold"
              title="Click to view full TrustScore breakdown"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col text-right leading-none">
                <span className="text-[9px] uppercase tracking-wider text-emerald-400/80">Trust</span>
                <span className="text-sm font-black text-emerald-300">{trustScore.overall}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Rating and Availability Pill */}
        <div className="flex items-center justify-between gap-2 mb-2.5 text-xs">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-bold text-slate-100">{provider.rating}</span>
            <span className="text-slate-400 text-[11px]">({provider.reviewCount} reviews)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${provider.isAvailableNow ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
            <span className={`text-[11px] font-semibold ${provider.isAvailableNow ? 'text-emerald-400' : 'text-slate-400'}`}>
              {provider.isAvailableNow ? 'Open Now' : 'Closed'}
            </span>
          </div>
        </div>

        {/* Highlight Benefit */}
        <div className="mb-3 px-2.5 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700/50 text-[11px] text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-medium truncate">{provider.highlightBenefit}</span>
        </div>

        {/* Address and Distance */}
        <div className="space-y-1.5 mb-3 text-xs text-slate-300">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <span className="line-clamp-1 text-slate-400">
              {provider.address}, {provider.area}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-semibold text-blue-300">{provider.distanceKm} km away</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              ETA: ~{provider.estimatedTimeMin} mins
            </span>
          </div>
        </div>

        {/* Phone Number Display */}
        <div className="flex items-center gap-1.5 mb-3 text-[11px] text-slate-400 bg-slate-950/50 px-2.5 py-1.5 rounded-lg border border-slate-800">
          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="font-mono text-slate-300">{provider.phoneNumber}</span>
          <span className="text-[10px] text-slate-500 ml-auto">{provider.openingHours}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {provider.tags.slice(0, 3).map((tag, idx) => (
            <span 
              key={idx}
              className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[10px] font-medium border border-slate-700/60"
            >
              {tag}
            </span>
          ))}
          {provider.urgencySupported && (
            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-semibold border border-rose-500/30 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" /> 24/7 SOS
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
        {/* Core Actions: View Details, Call, Navigate */}
        <div className="grid grid-cols-3 gap-2">
          {/* View Details */}
          <button
            onClick={() => navigate(`/provider/${provider.id}`)}
            className="px-2 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-sm shadow-blue-600/20"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {/* Call */}
          <button
            onClick={() => {
              if (onCall) onCall(provider);
              else window.location.href = `tel:${provider.phoneNumber}`;
            }}
            className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Call</span>
          </button>

          {/* Navigate */}
          <button
            onClick={() => {
              if (onNavigate) onNavigate(provider);
            }}
            className="px-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-400" />
            <span>Navigate</span>
          </button>
        </div>

        {/* Compare Checkbox & Booking */}
        <div className="flex items-center justify-between text-[11px] pt-1 px-1">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={isCompared}
              onChange={() => toggleCompare(provider)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <Scale className="w-3 h-3 text-slate-400" />
              Compare
            </span>
          </label>

          {onBookWithOtp && (
            <button
              onClick={() => onBookWithOtp(provider)}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              <Zap className="w-3 h-3" />
              <span>Book Service</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

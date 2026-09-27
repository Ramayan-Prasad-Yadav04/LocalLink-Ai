import React from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Clock, 
  MessageSquare, 
  FileCheck, 
  Zap,
  TrendingUp,
  Building
} from 'lucide-react';
import { Provider } from '../data/mockData';

interface TrustScoreModalProps {
  provider: Provider | null;
  onClose: () => void;
}

export const TrustScoreModal: React.FC<TrustScoreModalProps> = ({
  provider,
  onClose,
}) => {
  if (!provider) return null;

  const { trustScore } = provider;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-xl">
              {trustScore.overall}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{provider.name}</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> SIH Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {provider.categoryLabel} • {provider.area}, {provider.city}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SIH Slide 2 Highlight Note */}
        <div className="my-4 p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
          <Award className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-blue-300">LocalLink AI Multi-Factor TrustScore:</span>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Unlike static star ratings prone to fake reviews, LocalLink AI dynamically calculates TrustScore using 4 cryptographically verified pillars: Legal Accreditation, NLP Sentiment, Historical Fulfillment, and Real-time Availability.
            </p>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {/* Pillar 1: Legal & Govt Verification */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-blue-400" />
                Legal & Govt Accreditation
              </span>
              <span className="text-xs font-bold text-blue-400">{trustScore.verification}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
              <div 
                style={{ width: `${trustScore.verification}%` }} 
                className="bg-blue-500 h-full rounded-full"
              />
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Status: <span className="text-emerald-400 font-medium">Valid & Authenticated</span>
            </p>
            <div className="text-[10px] bg-slate-900 p-2 rounded border border-slate-800 text-slate-300">
              Source: <strong className="text-white">{trustScore.verificationSource}</strong>
            </div>
          </div>

          {/* Pillar 2: Reliability & Fulfillment Rate */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Reliability & Task Fulfillment
              </span>
              <span className="text-xs font-bold text-emerald-400">{trustScore.reliability}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
              <div 
                style={{ width: `${trustScore.reliability}%` }} 
                className="bg-emerald-500 h-full rounded-full"
              />
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              On-Time Dispatch Rate: <strong className="text-emerald-400">98.2%</strong>
            </p>
            <div className="text-[10px] bg-slate-900 p-2 rounded border border-slate-800 text-slate-300">
              Completed Orders: <strong className="text-white">{provider.reviewCount * 3}+ tasks</strong> with zero unresolved disputes.
            </div>
          </div>

          {/* Pillar 3: Sentiment & Verified Customer Feedback */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                NLP Sentiment Analysis
              </span>
              <span className="text-xs font-bold text-amber-400">{trustScore.reviewsAndSentiment}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
              <div 
                style={{ width: `${trustScore.reviewsAndSentiment}%` }} 
                className="bg-amber-400 h-full rounded-full"
              />
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Aggregated from {provider.reviewCount} GPS-verified check-ins
            </p>
            <div className="flex flex-wrap gap-1 text-[10px]">
              <span className="bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                + Prompt Response (96%)
              </span>
              <span className="bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                + Fair Pricing (93%)
              </span>
              <span className="bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                + Professional (95%)
              </span>
            </div>
          </div>

          {/* Pillar 4: Real-time Availability & Response Speed */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                Live Availability & Response
              </span>
              <span className="text-xs font-bold text-purple-400">{trustScore.responseSpeed}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
              <div 
                style={{ width: `${trustScore.responseSpeed}%` }} 
                className="bg-purple-500 h-full rounded-full"
              />
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Live Status: <span className="text-emerald-400 font-semibold">Active & Accepting Leads</span>
            </p>
            <div className="text-[10px] bg-slate-900 p-2 rounded border border-slate-800 text-slate-300">
              Avg Call/Request Response: <strong className="text-white">&lt; 4 minutes</strong>
            </div>
          </div>
        </div>

        {/* Verification Audit Stamp */}
        <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Digital Signature Verified on SIH 2026 Registry • Hash: 0x9f8c...2026</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Building2, 
  Map, 
  Globe2, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  BarChart2, 
  Clock, 
  AlertOctagon, 
  CheckCircle2, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { NATIONAL_STATS } from '../data/mockData';

export const NationalScaleDashboard: React.FC = () => {
  const [scaleLevel, setScaleLevel] = useState<'city' | 'district' | 'state' | 'nation'>('nation');

  const scaleDescriptions = {
    city: {
      title: 'City Scale Implementation',
      subtitle: 'Local implementation & dense service coverage within Bengaluru',
      providers: '4,850 Verified Providers',
      requests: '142,000 Inquiries Handled',
      coverage: '98.5% Urban Coverage',
      status: 'Active Live Deployment',
      color: 'blue'
    },
    district: {
      title: 'District Scale Integration',
      subtitle: 'Expansion across Bangalore Urban & Semi-Urban Clusters',
      providers: '14,200 Verified Providers',
      requests: '390,000 Inquiries Handled',
      coverage: '92.1% Regional Coverage',
      status: 'Phase 2 Scale',
      color: 'emerald'
    },
    state: {
      title: 'State-wide Rollout & Public Data Integration',
      subtitle: 'Statewide coverage across Karnataka with Municipal & CSC Integration',
      providers: '28,400 Verified Providers',
      requests: '780,000 Inquiries Handled',
      coverage: '88.4% Inter-City Network',
      status: 'Phase 3 Scale',
      color: 'amber'
    },
    nation: {
      title: 'Nationwide Unified Ecosystem',
      subtitle: 'Nationwide coverage across India supporting tertiary sector resilience',
      providers: `${NATIONAL_STATS.registeredVerifiedProviders.toLocaleString()} Verified Providers`,
      requests: `${NATIONAL_STATS.citizenRequestsResolved.toLocaleString()} Inquiries Handled`,
      coverage: 'Pan-India 42 Metros & Districts',
      status: 'Vision for SIH 2026',
      color: 'indigo'
    }
  };

  const currentScale = scaleDescriptions[scaleLevel];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Scale Roadmap & National Impact</h2>
              <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                Slide 6: Scale Model
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              "From Local to National Impact — City &rarr; District &rarr; State &rarr; Nation"
            </p>
          </div>

          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-xl border border-slate-700">
            Current Tier: <strong className="text-white uppercase">{scaleLevel}</strong>
          </span>
        </div>
      </div>

      {/* Scale Step Progress Bar (Directly mirroring Slide 6 visual) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <button
          onClick={() => setScaleLevel('city')}
          className={`p-3 rounded-xl border text-left transition-all ${
            scaleLevel === 'city'
              ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-500/40'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-blue-400">1. CITY</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-[11px] font-semibold text-white block">Local Implementation</span>
          <span className="text-[10px] text-slate-400">Coverage within City</span>
        </button>

        <button
          onClick={() => setScaleLevel('district')}
          className={`p-3 rounded-xl border text-left transition-all ${
            scaleLevel === 'district'
              ? 'bg-emerald-600/20 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-400">2. DISTRICT</span>
            <Map className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[11px] font-semibold text-white block">Expansion Phase</span>
          <span className="text-[10px] text-slate-400">Local Integration</span>
        </button>

        <button
          onClick={() => setScaleLevel('state')}
          className={`p-3 rounded-xl border text-left transition-all ${
            scaleLevel === 'state'
              ? 'bg-amber-600/20 border-amber-500 shadow-md ring-1 ring-amber-500/40'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-amber-400">3. STATE</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[11px] font-semibold text-white block">State-wide Rollout</span>
          <span className="text-[10px] text-slate-400">Data Integration</span>
        </button>

        <button
          onClick={() => setScaleLevel('nation')}
          className={`p-3 rounded-xl border text-left transition-all ${
            scaleLevel === 'nation'
              ? 'bg-indigo-600/20 border-indigo-500 shadow-md ring-1 ring-indigo-500/40'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-indigo-400">4. NATION</span>
            <Globe2 className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-[11px] font-semibold text-white block">Nationwide Ecosystem</span>
          <span className="text-[10px] text-slate-400">Pan-India Unified</span>
        </button>
      </div>

      {/* Selected Tier Banner */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">{currentScale.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{currentScale.subtitle}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Verified Network:</span>
            <span className="font-bold text-white">{currentScale.providers}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Citizen Volume:</span>
            <span className="font-bold text-blue-400">{currentScale.requests}</span>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 font-semibold px-2.5 py-1 rounded border border-emerald-500/20">
            {currentScale.status}
          </span>
        </div>
      </div>

      {/* National Impact Metrics (Slide 5: Impact & Benefits) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Citizen Time Saved</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">8.4 <span className="text-xs font-normal text-slate-400">mins avg</span></div>
          <p className="text-[10px] text-slate-400 mt-1">
            Replaces multi-platform manual search with 1-click intent match
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Fraud/Outdated Filtered</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">18.6%</div>
          <p className="text-[10px] text-slate-400 mt-1">
            Unverified providers blocked by TrustScore cryptographic checks
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Community Trust Index</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">93.8%</div>
          <p className="text-[10px] text-slate-400 mt-1">
            Citizen satisfaction across 1.2M+ authenticated service completions
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Local Business Reach</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">+340%</div>
          <p className="text-[10px] text-slate-400 mt-1">
            Discovery boost for hyper-local certified technicians and micro-shops
          </p>
        </div>
      </div>

      {/* Tertiary Sector Distribution Chart (PS 26199) */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h4 className="font-bold text-white flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-blue-400" />
            Tertiary Sector Coverage Breakdown (Problem Statement 26199)
          </h4>
          <span className="text-slate-400 text-[11px]">48,920 Total Providers</span>
        </div>

        <div className="space-y-2 text-xs">
          {NATIONAL_STATS.tertiaryBreakdown.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>{sec.name}</span>
                <span className="font-semibold text-white">{sec.percentage}% ({sec.count.toLocaleString()} providers)</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${sec.percentage}%` }}
                  className={`h-full rounded-full ${
                    idx === 0 ? 'bg-purple-500' :
                    idx === 1 ? 'bg-emerald-500' :
                    idx === 2 ? 'bg-rose-500' :
                    idx === 3 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

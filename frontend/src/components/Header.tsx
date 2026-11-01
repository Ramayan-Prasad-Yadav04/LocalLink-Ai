import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Store, 
  BarChart3, 
  Cpu, 
  Scale,
  Navigation
} from 'lucide-react';
import { CITIES } from '../data/mockData';

interface HeaderProps {
  currentCity: string;
  onCityChange: (cityId: string) => void;
  activeTab: 'discovery' | 'compare' | 'provider' | 'national' | 'architecture';
  onTabChange: (tab: 'discovery' | 'compare' | 'provider' | 'national' | 'architecture') => void;
  urgentMode: boolean;
  onToggleUrgentMode: () => void;
  comparedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onCityChange,
  activeTab,
  onTabChange,
  urgentMode,
  onToggleUrgentMode,
  comparedCount,
}) => {
  const selectedCityObj = CITIES.find(c => c.id === currentCity) || CITIES[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* SIH Hackathon Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 text-xs py-1.5 px-4 text-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase">
              SIH 2026
            </span>
            <span>Problem Statement ID: 26199 • Tertiary Sectors (Hospitality, Financial Services, Retail, Entertainment)</span>
          </div>
          <div className="flex items-center gap-3 text-slate-100 text-[11px]">
            <span>Team: <strong>Innovatrix - VI</strong> (ID: 129610)</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              PostGIS Geospatial + LLM Ranking Engine
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                LocalLink <span className="bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent">AI</span>
              </span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                v2.6
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Nearby Discovery & Verified TrustScore Platform
            </p>
          </div>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 shadow-sm">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] leading-tight">Your Location:</span>
            <select
              value={currentCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              {CITIES.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.area}, {c.name}
                </option>
              ))}
            </select>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>

        {/* SOS Urgent Mode Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleUrgentMode}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all duration-200 shadow-md ${
              urgentMode
                ? 'bg-rose-600 text-white ring-2 ring-rose-400 shadow-rose-600/30 animate-pulse'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
            title="Slide 2: Filter for immediate response & verified emergency providers"
          >
            <AlertTriangle className={`w-4 h-4 ${urgentMode ? 'text-white' : 'text-amber-400'}`} />
            <span>{urgentMode ? 'Urgent Mode: ACTIVE' : 'Urgent SOS Mode'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 border-t border-slate-800/80 flex overflow-x-auto gap-1 py-1 text-xs">
        <button
          onClick={() => onTabChange('discovery')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'discovery'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Citizen Discovery</span>
        </button>

        <button
          onClick={() => onTabChange('compare')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'compare'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Compare Matrix</span>
          {comparedCount > 0 && (
            <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {comparedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('provider')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'provider'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Provider Portal (Local Businesses)</span>
        </button>

        <button
          onClick={() => onTabChange('national')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'national'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>National Scale & Impact (Slide 6)</span>
        </button>

        <button
          onClick={() => onTabChange('architecture')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'architecture'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Architecture Flow (Slide 3)</span>
        </button>
      </div>
    </header>
  );
};

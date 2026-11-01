import React, { useState } from 'react';
import { 
  Search, 
  Mic, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Compass, 
  ShieldCheck, 
  Clock, 
  SlidersHorizontal,
  ChevronDown,
  X
} from 'lucide-react';
import { SAMPLE_QUERIES } from '../data/mockData';

interface AISearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectSampleQuery: (sample: typeof SAMPLE_QUERIES[0]) => void;
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  minTrustScore: number;
  onMinTrustScoreChange: (score: number) => void;
  detectedIntent: {
    service: string;
    urgency: string;
    complexity: string;
    sector: string;
    extractedKeywords: string[];
    radiusExpansionTriggered: boolean;
  } | null;
}

export const AISearchBar: React.FC<AISearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onSelectSampleQuery,
  radiusKm,
  onRadiusChange,
  minTrustScore,
  onMinTrustScoreChange,
  detectedIntent,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleVoiceClick = () => {
    setIsListening(true);
    setTimeout(() => {
      onSearchChange("Need 24/7 urgent pharmacy with oxygen cylinder delivery near me");
      setIsListening(false);
    }, 1800);
  };

  return (
    <div className="w-full">
      {/* Search Input Box */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition duration-300"></div>
        <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center gap-2">
          
          {/* AI Sparkle indicator */}
          <div className="hidden md:flex items-center justify-center pl-3 pr-1 text-blue-400">
            <Sparkles className="w-5 h-5 animate-pulse text-blue-400" />
          </div>

          {/* Input field */}
          <div className="flex-1 flex items-center gap-2 pl-2 md:pl-0">
            <Search className="w-4 h-4 text-slate-400 md:hidden" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Describe your need in natural language: e.g. 'Emergency plumber right now' or 'Quiet cafe with WiFi'..."
              className="w-full bg-transparent text-white placeholder-slate-400 text-sm md:text-base focus:outline-none py-1.5"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
            {/* Voice Search Simulation */}
            <button
              onClick={handleVoiceClick}
              className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
              title="Voice search simulation"
            >
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice AI'}</span>
            </button>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
                showFilters
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Spatial & Trust Filters</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Spatial & Trust Score Controls */}
      {showFilters && (
        <div className="mt-3 p-4 bg-slate-900/90 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-in fade-in duration-200">
          <div>
            <div className="flex justify-between items-center mb-1 text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                Geospatial Search Radius:
              </span>
              <span className="font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {radiusKm} km
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={radiusKm}
              onChange={(e) => onRadiusChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0.5 km (Walking)</span>
              <span>5 km (Local Hub)</span>
              <span>15 km (District Wide)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Minimum TrustScore Threshold (Slide 3):
              </span>
              <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                &ge; {minTrustScore}%
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="95"
              step="5"
              value={minTrustScore}
              onChange={(e) => onMinTrustScoreChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>60% (All Options)</span>
              <span>80% (High Trust)</span>
              <span>95% (SIH Verified Elite)</span>
            </div>
          </div>
        </div>
      )}

      {/* Sample Query Prompts */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 whitespace-nowrap text-[11px] flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" /> Try AI Prompts:
        </span>
        {SAMPLE_QUERIES.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSampleQuery(sample)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-[11px] flex items-center gap-1"
          >
            <span>{sample.text}</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-60" />
          </button>
        ))}
      </div>

      {/* AI Intent & Natural Language Extraction Visualizer (Slide 2 & 3) */}
      {detectedIntent && (
        <div className="mt-3 p-3 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-blue-900/40 rounded-xl text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="font-semibold text-blue-300">
                AI Intent Engine (NLP + Geospatial Parser)
              </span>
            </div>
            <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] border border-indigo-500/30">
              {detectedIntent.complexity}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Detected Need:</span>
              <span className="text-white font-medium">{detectedIntent.service}</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Urgency Rating:</span>
              <span className={`font-semibold ${
                detectedIntent.urgency.toLowerCase().includes('immediate') 
                  ? 'text-rose-400' 
                  : 'text-amber-400'
              }`}>
                {detectedIntent.urgency}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Sector Classification:</span>
              <span className="text-emerald-400 font-medium">{detectedIntent.sector}</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Feedback Loop Status:</span>
              <span className="text-blue-300 font-medium">
                {detectedIntent.radiusExpansionTriggered 
                  ? 'Radius Auto-Expanded (+1.5km)' 
                  : 'Trust Threshold Met'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

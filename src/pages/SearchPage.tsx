import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  SlidersHorizontal, 
  Compass, 
  Map as MapIcon, 
  List, 
  Columns, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  X,
  Clock,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { Provider, SearchFilters, AIIntentResult } from '../types';
import { CATEGORIES, SAMPLE_QUERIES } from '../data/mockData';
import { useLocation } from '../context/LocationContext';
import { ProviderCard } from '../components/ProviderCard';
import { InteractiveMap } from '../components/Map/InteractiveMap';
import { TrustScoreModal } from '../components/TrustScoreModal';
import { CallModal } from '../components/CallModal';
import { BookingOtpModal } from '../components/BookingOtpModal';
import { NavigationDrawer } from '../components/NavigationDrawer';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentCity, userCoords } = useLocation();

  // URL Query Parameters
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';

  // Search & Filter State
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [minTrustScore, setMinTrustScore] = useState<number>(80);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);
  const [urgentOnly, setUrgentOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SearchFilters['sortBy']>('ai_match');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // View Mode: 'list' | 'map' | 'split'
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('split');

  // API Results & AI Intent
  const [providers, setProviders] = useState<Provider[]>([]);
  const [intent, setIntent] = useState<AIIntentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiStep, setAiStep] = useState<string>('Analyzing query...');
  const [error, setError] = useState<string | null>(null);

  // Modals & Selected Provider
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [trustModalProvider, setTrustModalProvider] = useState<Provider | null>(null);
  const [callingProvider, setCallingProvider] = useState<Provider | null>(null);
  const [bookingProvider, setBookingProvider] = useState<Provider | null>(null);
  const [navigatingProvider, setNavigatingProvider] = useState<Provider | null>(null);

  // Synchronize when URL params change
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || 'all';
    setQuery(q);
    setCategory(cat);
  }, [searchParams]);

  // Execute Search via REST API
  const performSearch = async () => {
    setLoading(true);
    setError(null);
    setAiStep('Parsing natural language intent with LLM Engine...');

    try {
      // Step simulation for visual AI transparency
      setTimeout(() => setAiStep('Calculating PostGIS geospatial proximity...'), 180);
      setTimeout(() => setAiStep('Filtering verified TrustScores & real-time SLA...'), 320);

      const res = await api.searchServices({
        query,
        category,
        radiusKm,
        minTrustScore,
        openNowOnly,
        urgentOnly,
        sortBy,
      });

      setProviders(res.providers);
      setIntent(res.intent);
      if (res.providers.length > 0 && !selectedProvider) {
        setSelectedProvider(res.providers[0]);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Unable to fetch services. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [query, category, radiusKm, minTrustScore, openNowOnly, urgentOnly, sortBy, currentCity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query, category });
    performSearch();
  };

  const handleResetFilters = () => {
    setQuery('');
    setCategory('all');
    setRadiusKm(8);
    setMinTrustScore(70);
    setOpenNowOnly(false);
    setUrgentOnly(false);
    setSortBy('ai_match');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 rounded-2xl blur-md opacity-30 group-hover:opacity-60 transition duration-300"></div>
          
          <div className="relative bg-slate-900 border border-slate-700/80 rounded-2xl p-2 sm:p-2.5 shadow-xl flex flex-col md:flex-row items-stretch md:items-center gap-2">
            <div className="flex items-center gap-2 pl-3 flex-1">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your need in natural language: e.g. 'I need a pharmacy open now near me'..."
                className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none py-1.5"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSearchParams({ category });
                  }}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  showFilters || openNowOnly || urgentOnly || minTrustScore > 80 || radiusKm !== 5
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {(openNowOnly || urgentOnly || minTrustScore > 80 || radiusKm !== 5) && (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </form>

        {/* Collapsible Filter Tray */}
        {showFilters && (
          <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Distance Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold text-slate-300">
                  <span>Search Radius</span>
                  <span className="text-blue-400 font-bold">{radiusKm} km</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={0.5}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 km</span>
                  <span>10 km</span>
                  <span>20 km</span>
                </div>
              </div>

              {/* Minimum TrustScore Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold text-slate-300">
                  <span>Min TrustScore</span>
                  <span className="text-emerald-400 font-bold">&ge; {minTrustScore}/100</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={95}
                  step={5}
                  value={minTrustScore}
                  onChange={(e) => setMinTrustScore(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>60 (Standard)</span>
                  <span>80 (Recommended)</span>
                  <span>95 (Elite)</span>
                </div>
              </div>

              {/* Availability Toggles */}
              <div className="flex flex-col justify-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={openNowOnly}
                    onChange={(e) => setOpenNowOnly(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer w-4 h-4"
                  />
                  <span className="font-semibold text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Open Now Only
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={urgentOnly}
                    onChange={(e) => setUrgentOnly(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer w-4 h-4"
                  />
                  <span className="font-semibold text-xs flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-rose-400" />
                    24/7 Emergency SOS Ready
                  </span>
                </label>
              </div>

              {/* Reset action */}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                setSearchParams({ q: query, category: cat.id });
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                category === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-1 ring-blue-400'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Intent Breakdown Card */}
      {intent && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/25 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{intent.service}</span>
                <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  {intent.confidenceScore}% Confidence
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sector: <strong className="text-slate-200">{intent.sector}</strong> • Urgency: <strong className="text-amber-300">{intent.urgency}</strong>
              </p>
            </div>
          </div>

          {intent.suggestedAction && (
            <div className="text-[11px] text-blue-300 bg-blue-900/30 px-3 py-1.5 rounded-xl border border-blue-800/40 font-medium">
              💡 {intent.suggestedAction}
            </div>
          )}
        </div>
      )}

      {/* Results Header: Count, Sort, and View Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-sm text-white">Hyperlocal Discoveries</h2>
          <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
            {providers.length} Verified in Radius
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="ai_match">AI Composite Match</option>
              <option value="trust">Highest TrustScore (&ge;90)</option>
              <option value="distance">Closest Distance (km)</option>
              <option value="rating">Customer Rating</option>
              <option value="price">Lowest Starting Price</option>
            </select>
          </div>

          {/* View Mode Toggle: List / Split / Map */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-lg transition-colors hidden md:block ${
                viewMode === 'split' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Split View (Cards + Map)"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Full Map View"
            >
              <MapIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State with AI Steps */}
      {loading && (
        <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-white flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Processing Hyperlocal AI Request</span>
            </p>
            <p className="text-xs text-blue-400 font-medium animate-pulse">{aiStep}</p>
          </div>
        </div>
      )}

      {/* Main Content Area based on View Mode */}
      {!loading && providers.length > 0 && (
        <div>
          {/* 1. SPLIT VIEW (Desktop: Cards Left, Sticky Map Right) */}
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Cards Column */}
              <div className="lg:col-span-6 xl:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {providers.map((p) => (
                    <div
                      key={p.id}
                      onMouseEnter={() => setSelectedProvider(p)}
                      className={selectedProvider?.id === p.id ? 'ring-2 ring-blue-500 rounded-2xl' : ''}
                    >
                      <ProviderCard
                        provider={p}
                        onOpenTrustModal={(prov) => setTrustModalProvider(prov)}
                        onCall={(prov) => setCallingProvider(prov)}
                        onBookWithOtp={(prov) => setBookingProvider(prov)}
                        onNavigate={(prov) => {
                          setSelectedProvider(prov);
                          setNavigatingProvider(prov);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Map Column */}
              <div className="lg:col-span-6 xl:col-span-5 sticky top-24">
                <InteractiveMap
                  providers={providers}
                  selectedProvider={selectedProvider}
                  onSelectProvider={(p) => setSelectedProvider(p)}
                  navigatingTo={navigatingProvider}
                  radiusKm={radiusKm}
                  height="600px"
                />
              </div>
            </div>
          )}

          {/* 2. LIST VIEW */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  onOpenTrustModal={(prov) => setTrustModalProvider(prov)}
                  onCall={(prov) => setCallingProvider(prov)}
                  onBookWithOtp={(prov) => setBookingProvider(prov)}
                  onNavigate={(prov) => {
                    setSelectedProvider(prov);
                    setNavigatingProvider(prov);
                  }}
                />
              ))}
            </div>
          )}

          {/* 3. FULL MAP VIEW */}
          {viewMode === 'map' && (
            <div className="space-y-4">
              <InteractiveMap
                providers={providers}
                selectedProvider={selectedProvider}
                onSelectProvider={(p) => setSelectedProvider(p)}
                navigatingTo={navigatingProvider}
                radiusKm={radiusKm}
                height="640px"
              />
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && providers.length === 0 && (
        <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-4 max-w-lg mx-auto">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Verified Providers In Current Radius</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No service providers met your threshold of {radiusKm} km and &ge;{minTrustScore} TrustScore. Try expanding your search radius or resetting filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/25"
          >
            Expand Radius & Reset Filters
          </button>
        </div>
      )}

      {/* MODALS */}
      {trustModalProvider && (
        <TrustScoreModal
          provider={trustModalProvider}
          onClose={() => setTrustModalProvider(null)}
        />
      )}

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

      {navigatingProvider && (
        <NavigationDrawer
          provider={navigatingProvider}
          onClose={() => setNavigatingProvider(null)}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  MapPin, 
  Navigation, 
  Mic, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Clock, 
  Award, 
  Users, 
  CheckCircle2, 
  TrendingUp,
  Star,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { CATEGORIES, SAMPLE_QUERIES, INITIAL_PROVIDERS } from '../data/mockData';
import { ProviderCard } from '../components/ProviderCard';
import { TrustScoreModal } from '../components/TrustScoreModal';
import { CallModal } from '../components/CallModal';
import { BookingOtpModal } from '../components/BookingOtpModal';
import { NavigationDrawer } from '../components/NavigationDrawer';
import { Provider } from '../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentCity, selectCity, requestCurrentLocation, isLocating, locationLabel } = useLocation();

  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Modals state
  const [trustModalProvider, setTrustModalProvider] = useState<Provider | null>(null);
  const [callingProvider, setCallingProvider] = useState<Provider | null>(null);
  const [bookingProvider, setBookingProvider] = useState<Provider | null>(null);
  const [navigatingProvider, setNavigatingProvider] = useState<Provider | null>(null);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      const voiceQuery = "I need a pharmacy open now near me";
      setQuery(voiceQuery);
      setIsListening(false);
      navigate(`/search?q=${encodeURIComponent(voiceQuery)}`);
    }, 1800);
  };

  const topProviders = INITIAL_PROVIDERS.slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 pb-12 px-4 overflow-hidden text-center">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/20 to-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Trust Badge Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-lg text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">AI-Powered Hyperlocal Discovery</span>
            <span className="text-slate-500">•</span>
            <span className="text-blue-400 font-medium">PostGIS Geospatial Grid</span>
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
              Find the right local service.{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent">
                Fast. Trusted. Nearby.
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Describe what you need in plain English. LocalLink AI matches verified nearby providers based on real-time availability, distance, and fraud-resistant TrustScore.
            </p>
          </div>

          {/* Location Selector Bar */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 text-slate-300">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Current City:</span>
              <strong className="text-white">{currentCity.name} ({currentCity.area})</strong>
            </div>

            <button
              onClick={requestCurrentLocation}
              disabled={isLocating}
              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl font-semibold flex items-center gap-1.5 transition-all"
            >
              {isLocating ? (
                <div className="w-3.5 h-3.5 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>
              ) : (
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span>{isLocating ? 'Detecting GPS...' : 'Use Current Location'}</span>
            </button>
          </div>

          {/* Large AI Search Box */}
          <div className="relative group max-w-3xl mx-auto pt-2">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500"></div>
            
            <form
              onSubmit={handleSearchSubmit}
              className="relative bg-slate-900 border border-slate-700/80 rounded-2xl p-2 sm:p-3 shadow-2xl flex flex-col md:flex-row items-center gap-2"
            >
              {/* Sparkle icon */}
              <div className="hidden md:flex items-center justify-center pl-3 pr-1 text-blue-400">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>

              {/* Natural Language Input */}
              <div className="flex-1 w-full flex items-center gap-2 px-2">
                <Search className="w-5 h-5 text-slate-400 md:hidden" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe your need: e.g. 'I need a pharmacy open now near me' or 'Electrician within 5 km'..."
                  className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none py-2"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                {/* Voice button */}
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                  title="Voice search simulation"
                >
                  <Mic className="w-4 h-4" />
                  <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice'}</span>
                </button>

                {/* AI Search Submit Button */}
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Discover Now</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sample Query Chips */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Try Asking:
            </span>
            {SAMPLE_QUERIES.slice(0, 4).map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(sample.text);
                  navigate(`/search?q=${encodeURIComponent(sample.text)}`);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white transition-all text-[11px]"
              >
                "{sample.text}"
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. POPULAR SERVICE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Popular Service Categories</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Geofenced and verified service providers in {currentCity.name}
            </p>
          </div>

          <button
            onClick={() => navigate('/search')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/search?category=${cat.id}`)}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer group shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-emerald-400 font-semibold">Verified Providers</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TRUSTSCORE EXPLANATION BANNER */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 p-6 md:p-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Proprietary LocalLink AI TrustEngine</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Beyond Fake Star Reviews: How TrustScore Works
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Traditional platforms suffer from fake bot reviews, paid promotions, and unresponsive listings. LocalLink AI calculates an immutable 0–100 TrustScore using multi-dimensional verification:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Government ID & License Audit</h4>
                    <p className="text-[11px] text-slate-400">Trade licenses, GSTIN, BESCOM/Govt permits verified via DigiLocker.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">On-Time Arrival & Response</h4>
                    <p className="text-[11px] text-slate-400">Real-time GPS SLA monitoring with penalty for ghost cancellations.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <Users className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">OTP-Verified Citizen Sentiment</h4>
                    <p className="text-[11px] text-slate-400">Only customers who actually completed OTP booking can leave ratings.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <Award className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Anti-Fraud Penalty Loop</h4>
                    <p className="text-[11px] text-slate-400">Automated demotion of inactive or overcharging merchants.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scorecard Visual Showcase */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Sample Provider Audit</span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs">
                  96/100 Grade A
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Govt Regulatory Verification</span>
                    <span className="text-emerald-400 font-bold">99%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[99%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>On-Time Arrival SLA</span>
                    <span className="text-blue-400 font-bold">98%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[98%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>OTP Verified Review Sentiment</span>
                    <span className="text-amber-400 font-bold">95%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full w-[95%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Average Dispatch Speed</span>
                    <span className="text-purple-400 font-bold">7.2 mins</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full w-[92%]"></div>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setTrustModalProvider(INITIAL_PROVIDERS[0])}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-xl font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <span>Inspect Full Algorithm Breakdown</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED VERIFIED LOCAL SERVICES */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Top Trusted Services in {currentCity.name}</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                &ge;90 TrustScore
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Instantly book, call, or navigate to verified providers
            </p>
          </div>

          <button
            onClick={() => navigate('/search')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>Explore All on Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {topProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onOpenTrustModal={(p) => setTrustModalProvider(p)}
              onCall={(p) => setCallingProvider(p)}
              onBookWithOtp={(p) => setBookingProvider(p)}
              onNavigate={(p) => setNavigatingProvider(p)}
            />
          ))}
        </div>
      </section>

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

import React, { useState } from 'react';
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  Navigation, 
  Scale, 
  User as UserIcon, 
  Store, 
  LogOut, 
  Bookmark, 
  History, 
  Menu, 
  X,
  Compass,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useCompare } from '../context/CompareContext';
import { CITIES } from '../data/mockData';

export const Navbar: React.FC = () => {
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { currentCity, selectCity, requestCurrentLocation, isLocating, locationLabel, locationError } = useLocation();
  const { comparedIds } = useCompare();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => routerLocation.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 transition-all">
      {/* SIH Hackathon Top Ticker */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-amber-600 text-xs py-1 px-4 text-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider">
              LocalLink AI
            </span>
            <span className="text-[11px] font-medium hidden sm:inline">
              Hyperlocal AI Service Discovery & Verified TrustScore Platform
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-100">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Geofenced PostGIS
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Tagline: "Find the right local service. Fast. Trusted. Nearby."</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400 group-hover:text-amber-400 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white">
                LocalLink <span className="bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent">AI</span>
              </span>
              <span className="text-[9px] bg-blue-500/20 text-blue-300 font-extrabold px-1.5 py-0.5 rounded-full border border-blue-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block -mt-0.5">
              Fast • Trusted • Nearby
            </p>
          </div>
        </Link>

        {/* Location Selector & GPS Trigger */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl px-3 py-1.5 shadow-inner">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-medium leading-none">Hyperlocal Area</span>
            <select
              value={currentCity.id}
              onChange={(e) => selectCity(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer pr-4"
            >
              {CITIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.area}, {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Current Location GPS Button */}
          <button
            onClick={requestCurrentLocation}
            disabled={isLocating}
            className="ml-2 px-2.5 py-1 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
            title="Locate via device GPS"
          >
            {isLocating ? (
              <div className="w-3 h-3 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>
            ) : (
              <Navigation className="w-3 h-3 text-blue-400" />
            )}
            <span className="text-[11px]">{isLocating ? 'Locating...' : 'Near Me'}</span>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          <Link
            to="/search"
            className={`px-3.5 py-2 rounded-xl transition-all ${
              isActive('/search')
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            AI Search & Map
          </Link>

          <Link
            to="/compare"
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              isActive('/compare')
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Compare</span>
            {comparedIds.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                {comparedIds.length}
              </span>
            )}
          </Link>

          <Link
            to="/provider-dashboard"
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              isActive('/provider-dashboard')
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>Provider Portal</span>
          </Link>
        </nav>

        {/* Right Side: Auth & User Profile */}
        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-white transition-all cursor-pointer"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-xl object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-semibold hidden sm:inline max-w-[100px] truncate">
                  {user.name}
                </span>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl z-50 text-xs text-slate-200">
                  <div className="p-2 border-b border-slate-800">
                    <p className="font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.phone}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-blue-400" />
                      <span>My Profile & Bookings</span>
                    </Link>

                    <Link
                      to="/profile?tab=favorites"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-rose-400" />
                      <span>Saved Providers ({user.favorites?.length || 0})</span>
                    </Link>

                    <Link
                      to="/profile?tab=history"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <History className="w-4 h-4 text-amber-400" />
                      <span>Search History</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In / OTP</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-3">
          {/* Mobile Location Selector */}
          <div className="flex items-center justify-between gap-2 p-2 bg-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <select
                value={currentCity.id}
                onChange={(e) => {
                  selectCity(e.target.value);
                  setIsMobileMenuOpen(false);
                }}
                className="bg-transparent text-white font-medium text-xs focus:outline-none"
              >
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.area}, {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                requestCurrentLocation();
                setIsMobileMenuOpen(false);
              }}
              className="text-xs text-blue-400 font-semibold"
            >
              Near Me
            </button>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <Link
              to="/search"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200"
            >
              AI Search & Map
            </Link>
            <Link
              to="/compare"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200 flex items-center justify-between"
            >
              <span>Compare Providers</span>
              {comparedIds.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px]">
                  {comparedIds.length}
                </span>
              )}
            </Link>
            <Link
              to="/provider-dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200"
            >
              Provider Portal & Onboarding
            </Link>
            {isAuthenticated && (
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-800 text-slate-200"
              >
                Citizen Profile & Search History
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

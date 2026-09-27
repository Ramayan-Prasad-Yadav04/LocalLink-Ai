import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  Bookmark, 
  History, 
  Calendar, 
  Phone, 
  Mail, 
  Edit3, 
  Trash2, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Zap, 
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_PROVIDERS } from '../data/mockData';
import { Provider } from '../types';

export const UserProfilePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuthModal, logout, toggleFavorite, clearSearchHistory, updateProfile } = useAuth();

  const tabParam = searchParams.get('tab') as 'favorites' | 'history' | 'bookings' | 'settings' | null;
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'bookings' | 'settings'>(
    tabParam || 'favorites'
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
    }
  }, [user]);

  const handleTabChange = (tab: 'favorites' | 'history' | 'bookings' | 'settings') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name: editName, email: editEmail });
    setIsEditing(false);
  };

  if (!isAuthenticated && (!user || user.name === 'Guest User')) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Citizen Account Access</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Sign in via instant OTP to view your saved providers, recent booking requests, and personalized search history.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/25 transition-all"
        >
          Sign In with Mobile OTP
        </button>
      </div>
    );
  }

  // Favorite providers list
  const favoriteProviders = INITIAL_PROVIDERS.filter((p) => user?.favorites?.includes(p.id));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Profile Header Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500/40 shadow-xl" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-xl">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white">{user?.name}</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> OTP Verified
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                {user?.phone || '+91 98765 43210'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                {user?.email || 'aditya.verma@example.com'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-semibold border border-rose-500/30 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Profile Edit Form */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-4 text-xs animate-fadeIn">
          <h3 className="text-sm font-bold text-white">Update Citizen Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md shadow-blue-600/20"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => handleTabChange('favorites')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'favorites'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4 text-rose-400" />
          <span>Saved Providers ({user?.favorites?.length || 0})</span>
        </button>

        <button
          onClick={() => handleTabChange('history')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4 text-amber-400" />
          <span>Search History</span>
        </button>

        <button
          onClick={() => handleTabChange('bookings')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Recent Bookings ({user?.bookings?.length || 0})</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: SAVED PROVIDERS */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          {favoriteProviders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteProviders.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                        {p.categoryLabel}
                      </span>
                      <button
                        onClick={() => toggleFavorite(p.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="font-bold text-sm text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-300 mt-3 pt-2 border-t border-slate-800">
                      <span>{p.distanceKm} km • {p.area}</span>
                      <span className="text-emerald-400 font-bold">Trust: {p.trustScore.overall}/100</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                    <Link
                      to={`/provider/${p.id}`}
                      className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-center text-xs font-semibold"
                    >
                      View Details
                    </Link>
                    <a
                      href={`tel:${p.phoneNumber}`}
                      className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>Call</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3 max-w-md mx-auto">
              <Bookmark className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Saved Providers Yet</h3>
              <p className="text-xs text-slate-400">
                Click the heart icon on any provider card to bookmark them for immediate access.
              </p>
              <button
                onClick={() => navigate('/search')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                Browse Providers
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SEARCH HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <span className="text-slate-400">Recent natural language queries</span>
            {user?.searchHistory && user.searchHistory.length > 0 && (
              <button
                onClick={clearSearchHistory}
                className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {user?.searchHistory && user.searchHistory.length > 0 ? (
            <div className="space-y-2">
              {user.searchHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(item.query)}`)}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3 cursor-pointer group text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    <div>
                      <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                        "{item.query}"
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.timestamp} • {item.resultsCount} providers discovered • {item.city}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3 max-w-md mx-auto">
              <History className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Search History Found</h3>
              <p className="text-xs text-slate-400">Your recent AI discovery searches will be remembered here.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {user?.bookings && user.bookings.length > 0 ? (
            <div className="space-y-3">
              {user.bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{b.serviceName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        {b.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-400">
                      Provider: <strong className="text-slate-200">{b.providerName}</strong> ({b.categoryLabel})
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Scheduled: {b.date} • {b.timeSlot} • {b.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 block uppercase">OTP Confirmation Code</span>
                      <span className="font-mono font-bold text-emerald-400 text-base tracking-widest">{b.otpCode}</span>
                    </div>

                    <Link
                      to={`/provider/${b.providerId}`}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-colors shrink-0"
                    >
                      View Provider
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3 max-w-md mx-auto">
              <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Active Bookings</h3>
              <p className="text-xs text-slate-400">Services booked with instant OTP verification will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

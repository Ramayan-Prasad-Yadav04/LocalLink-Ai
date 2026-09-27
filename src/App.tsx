import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CompareProvider } from './context/CompareContext';
import { Navbar } from './components/Navbar';
import { CompareDock } from './components/CompareDock';
import { AuthModal } from './components/AuthModal';

import { LandingPage } from './pages/LandingPage';
import { SearchPage } from './pages/SearchPage';
import { ProviderDetailPage } from './pages/ProviderDetailPage';
import { ComparePage } from './pages/ComparePage';
import { UserProfilePage } from './pages/UserProfilePage';
import { ProviderDashboardPage } from './pages/ProviderDashboardPage';

import { Sparkles, Heart, ShieldCheck } from 'lucide-react';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <LocationProvider>
          <CompareProvider>
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans antialiased">
              {/* Sticky Modern Navbar */}
              <Navbar />

              {/* Main Routing Container */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/provider/:id" element={<ProviderDetailPage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/profile" element={<UserProfilePage />} />
                  <Route path="/provider-dashboard" element={<ProviderDashboardPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Persistent Floating Compare Dock */}
              <CompareDock />

              {/* OTP Authentication Modal */}
              <AuthModal />

              {/* Modern AI Footer */}
              <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-10 text-xs text-slate-400">
                <div className="max-w-7xl mx-auto px-4 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-black text-white text-sm">LocalLink AI</span>
                        <p className="text-[11px] text-slate-500">Hyperlocal Service Discovery & TrustScore Platform</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
                      <a href="#privacy" className="hover:text-white transition-colors">Privacy & Data Governance</a>
                      <a href="#terms" className="hover:text-white transition-colors">Terms of Verification</a>
                      <a href="#api" className="hover:text-white transition-colors">PostGIS API Docs</a>
                      <a href="#sih" className="hover:text-white transition-colors">Problem Statement 26199</a>
                    </div>
                  </div>

                  <div className="border-t border-slate-900 pt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <p>© 2026 LocalLink AI. Built for Smart India Hackathon (Team Innovatrix - VI).</p>
                    <p className="flex items-center gap-1">
                      <span>Powered by OpenStreetMap, PostGIS & LLM NLP Intent Engine</span>
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          </CompareProvider>
        </LocationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

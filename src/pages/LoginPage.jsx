import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Waves, 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  ShieldAlert, 
  Radio,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [username, setUsername] = useState('operator');
  const [password, setPassword] = useState('Flood@2026');
  const [errorMessage, setErrorMessage] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    const res = await login(username, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(res.error || 'Invalid credentials');
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-cyan-600 selection:text-white">
      
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-600/10 via-blue-600/10 to-indigo-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 shadow-xl shadow-blue-500/30 border border-cyan-400/40 mb-4 animate-pulse">
            <Waves className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            FloodWatch <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">AI</span>
          </h1>

          <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
            Intelligent Flash Flood Prediction and Early Warning System for Hilly Regions
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/30 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Smart India Hackathon 2026
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 p-7 shadow-2xl shadow-black/80">
          
          <div className="border-b border-slate-800 pb-3 mb-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Control Room Authentication
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure JWT access to real-time hydrological telemetry
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username or Official Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="operator@floodwatch.ai"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Enter Disaster Control Room'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Autofill Section */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5 text-center">
              Quick Demo Credentials (SIH 2026 Jury):
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('operator', 'Flood@2026')}
                className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition-all"
              >
                <div className="text-[10px] font-bold text-cyan-400">Operator</div>
                <div className="text-[9px] text-slate-400 font-mono">operator</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'Admin@123')}
                className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition-all"
              >
                <div className="text-[10px] font-bold text-indigo-400">Commander</div>
                <div className="text-[9px] text-slate-400 font-mono">admin</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('sih_judge', 'Judge@2026')}
                className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition-all"
              >
                <div className="text-[10px] font-bold text-amber-400">SIH Judge</div>
                <div className="text-[9px] text-slate-400 font-mono">sih_judge</div>
              </button>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-slate-500">
          <p>© 2026 FloodWatch AI • Disaster Management Division</p>
          <p className="text-[10px] text-slate-600 mt-1">
            200 Monte-Carlo Scenarios • Kalman Fusion • Dijkstra Evacuation
          </p>
        </div>

      </div>

    </div>
  );
}

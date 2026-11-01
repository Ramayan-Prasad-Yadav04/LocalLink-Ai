import React, { useState } from 'react';
import { X, ShieldCheck, Phone, KeyRound, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, requestOtp, loginWithOtp } = useAuth();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await requestOtp(phoneNumber);
      setDemoCode(res.demoOtp);
      setStep('otp');
      setResendTimer(30);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await loginWithOtp(phoneNumber, otp);
      closeAuthModal();
      setStep('phone');
      setOtp('');
      setDemoCode(null);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check code.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    if (demoCode) {
      setOtp(demoCode);
    } else {
      setOtp('123456');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Citizen Authentication
            </h3>
            <p className="text-xs text-slate-400">
              One-Time Password (OTP) Secured Login
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Phone Input */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1.5 text-slate-400 text-sm font-medium border-r border-slate-700 pr-2">
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-16 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-medium text-sm"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                We'll generate an instant 6-digit verification code. No password required.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.length < 10}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Request Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Pre-fill */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setPhoneNumber('9876543210')}
                className="text-[11px] text-blue-400 hover:text-blue-300 underline"
              >
                Use demo number: +91 98765 43210
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: OTP Input */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Enter 6-Digit OTP
                </label>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  Change {phoneNumber}
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl font-bold tracking-[0.5em] text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  autoFocus
                />
              </div>

              {/* Demo Helper Banner */}
              {demoCode && (
                <div className="mt-2 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between text-xs text-blue-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Demo OTP: <strong className="text-white text-sm font-mono">{demoCode}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-semibold"
                  >
                    Auto-fill
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Access Account</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Encrypted with 256-bit TLS</span>
          <span>Zero SPAM Guarantee</span>
        </div>
      </div>
    </div>
  );
};

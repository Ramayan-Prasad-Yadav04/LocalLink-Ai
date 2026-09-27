import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Provider } from '../data/mockData';

interface BookingOtpModalProps {
  provider: Provider | null;
  onClose: () => void;
}

export const BookingOtpModal: React.FC<BookingOtpModalProps> = ({
  provider,
  onClose,
}) => {
  const [step, setStep] = useState<'form' | 'otp_sent' | 'verified'>('form');
  const [userPhone, setUserPhone] = useState('98765 43210');
  const [notes, setNotes] = useState('');
  const [urgencyChoice, setUrgencyChoice] = useState<'immediate' | '1hour' | 'scheduled'>('immediate');
  const [generatedOtp, setGeneratedOtp] = useState('482915');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState(false);

  if (!provider) return null;

  const handleRequestService = (e: React.FormEvent) => {
    e.preventDefault();
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setStep('otp_sent');
  };

  const handleVerifyOtp = () => {
    if (enteredOtp.trim() === generatedOtp || enteredOtp.trim() === '123456') {
      setStep('verified');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      setOtpError(true);
      setTimeout(() => setOtpError(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              {step === 'verified' ? 'Service Confirmed' : 'OTP-Authenticated Service Dispatch'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Brief */}
        <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white">{provider.name}</h4>
            <p className="text-[11px] text-slate-400">{provider.area} • {provider.distanceKm} km away</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              TrustScore {provider.trustScore.overall}
            </span>
          </div>
        </div>

        {/* STEP 1: Details Form */}
        {step === 'form' && (
          <form onSubmit={handleRequestService} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Your Contact Number (For OTP Verification):
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                <span className="text-slate-500">+91</span>
                <input
                  type="text"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  required
                  className="bg-transparent focus:outline-none w-full text-white"
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Urgency Dispatch Priority:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setUrgencyChoice('immediate')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    urgencyChoice === 'immediate'
                      ? 'bg-rose-600/30 border-rose-500 text-rose-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-[11px]">Immediate SOS</span>
                  <span className="text-[10px] text-slate-400">&lt; 15 mins</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgencyChoice('1hour')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    urgencyChoice === '1hour'
                      ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-[11px]">Within 1 Hour</span>
                  <span className="text-[10px] text-slate-400">Scheduled</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgencyChoice('scheduled')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    urgencyChoice === 'scheduled'
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-[11px]">Later Today</span>
                  <span className="text-[10px] text-slate-400">Convenience</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Specific requirement or landmark notes:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 2nd floor, buzzer 204, urgent leak under kitchen sink..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none h-20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 mt-4"
            >
              <span>Dispatch Request with Secure OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification Display */}
        {step === 'otp_sent' && (
          <div className="mt-4 text-xs space-y-4">
            <div className="p-4 bg-blue-950/40 border border-blue-800/40 rounded-xl text-center">
              <span className="text-slate-300 text-[11px] block">
                Your Security Handoff OTP (Share with provider upon arrival):
              </span>
              <div className="text-3xl font-mono font-extrabold tracking-widest text-amber-400 my-2">
                {generatedOtp}
              </div>
              <p className="text-[10px] text-slate-400">
                Slide 3: OTP guarantees verified fulfillment and protects both citizen & provider.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Simulate Provider Arrival & Handshake:</span>
                <button
                  onClick={() => setEnteredOtp(generatedOtp)}
                  className="text-blue-400 hover:underline text-[10px]"
                >
                  Auto-fill OTP
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500"
              />
              {otpError && (
                <p className="text-rose-400 text-[11px] text-center">
                  Invalid OTP. Please check the 6-digit code above.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-1/3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="w-2/3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Complete</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Verified Confirmation */}
        {step === 'verified' && (
          <div className="mt-4 text-center py-4 space-y-3">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h4 className="text-lg font-bold text-white">Service Authenticated & Confirmed!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your task with <strong className="text-white">{provider.name}</strong> has been authenticated via OTP. The provider has received confirmation and live GPS coordinates.
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-left text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Order Reference:</span>
                <span className="font-mono text-white">#LL-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Arrival:</span>
                <span className="text-emerald-400 font-bold">~{provider.estimatedTimeMin} Minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Direct Helpline:</span>
                <span className="text-white">{provider.phoneNumber}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

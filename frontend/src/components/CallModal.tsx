import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { Provider } from '../data/mockData';

interface CallModalProps {
  provider: Provider | null;
  onClose: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ provider, onClose }) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected'>('connecting');

  useEffect(() => {
    if (!provider) return;

    const connectTimer = setTimeout(() => {
      setCallStatus('connected');
    }, 1200);

    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(interval);
    };
  }, [provider]);

  if (!provider) return null;

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center flex flex-col items-center justify-between min-h-[380px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Info */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Call
          </span>
          <button onClick={onClose} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center avatar & status */}
        <div className="my-auto space-y-3">
          <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
            <Phone className="w-8 h-8 animate-bounce" />
            <span className="absolute -inset-1 rounded-full border-2 border-blue-400/40 animate-ping"></span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">{provider.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{provider.phoneNumber}</p>
          </div>

          <div className="text-xs">
            {callStatus === 'connecting' ? (
              <span className="text-amber-400 font-medium animate-pulse">Connecting via LocalLink AI...</span>
            ) : (
              <span className="text-emerald-400 font-mono text-sm font-bold">
                {formatSeconds(callDuration)}
              </span>
            )}
          </div>
        </div>

        {/* Call Controls */}
        <div className="w-full pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-full border text-xs transition-colors ${
                isMuted 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={onClose}
              className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            <a
              href={`tel:${provider.phoneNumber}`}
              className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white"
              title="Open Device Native Dialer"
            >
              <Volume2 className="w-5 h-5" />
            </a>
          </div>

          <p className="text-[10px] text-slate-500">
            Slide 3: Direct verified citizen-to-provider telephony integration.
          </p>
        </div>
      </div>
    </div>
  );
};

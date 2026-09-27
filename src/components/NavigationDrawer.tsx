import React, { useState, useEffect } from 'react';
import { 
  X, 
  Navigation, 
  MapPin, 
  CornerUpRight, 
  ArrowUp, 
  Phone, 
  CheckCircle, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { Provider } from '../data/mockData';

interface NavigationDrawerProps {
  provider: Provider | null;
  onClose: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  provider,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!provider) return null;

  const steps = [
    { instruction: `Start from your current location in ${provider.area}`, distance: '250 m', icon: ArrowUp },
    { instruction: 'Turn right at the junction towards 80 Feet Main Road', distance: '400 m', icon: CornerUpRight },
    { instruction: `Continue straight past landmark near ${provider.address}`, distance: '300 m', icon: ArrowUp },
    { instruction: `Arrive at ${provider.name} on the left`, distance: '50 m', icon: MapPin },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900 border-t border-slate-700 shadow-2xl p-4 md:p-5 max-w-4xl mx-auto rounded-t-2xl animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Live Route to {provider.name}</h3>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Fastest Route
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {provider.distanceKm} km • Approx {provider.estimatedTimeMin} mins (Normal traffic)
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Turn-by-Turn Instruction Card */}
      <div className="my-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
            {React.createElement(steps[currentStep].icon, { className: 'w-5 h-5' })}
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Step {currentStep + 1} of {steps.length} • Next turn in {steps[currentStep].distance}
            </span>
            <p className="text-xs md:text-sm font-bold text-white mt-0.5">
              {steps[currentStep].instruction}
            </p>
          </div>
        </div>

        {/* Quick Dial / Assistance */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">Need Help Finding?</span>
            <span className="text-xs font-semibold text-white">{provider.phoneNumber}</span>
          </div>
          <a
            href={`tel:${provider.phoneNumber}`}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
        </div>
      </div>

      {/* Steps Navigation Controls */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentStep ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:text-white"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
            disabled={currentStep === steps.length - 1}
            className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 font-semibold"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
};

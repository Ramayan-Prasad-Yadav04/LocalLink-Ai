import React, { useState } from 'react';
import { 
  Cpu, 
  ArrowDown, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  Play, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  KeyRound, 
  MapPin,
  Bot
} from 'lucide-react';

export const AIFlowchartSimulator: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [queryType, setQueryType] = useState<'complex' | 'simple'>('complex');
  const [simulateThresholdPass, setSimulateThresholdPass] = useState<boolean>(true);

  const startSimulation = (type: 'complex' | 'simple', passThreshold: boolean = true) => {
    setQueryType(type);
    setSimulateThresholdPass(passThreshold);
    setIsSimulating(true);
    setActiveStep(1);

    setTimeout(() => setActiveStep(2), 700); // User Query Received
    setTimeout(() => setActiveStep(3), 1400); // Query Complexity Check

    if (type === 'simple') {
      setTimeout(() => setActiveStep(4), 2100); // Rule-Based Filtering
      setTimeout(() => {
        setActiveStep(8); // Verified Recommendations
        setIsSimulating(false);
      }, 2900);
    } else {
      setTimeout(() => setActiveStep(5), 2100); // AI Ranking & TrustScore
      setTimeout(() => {
        setActiveStep(6); // TrustScore Threshold check
        if (!passThreshold) {
          setTimeout(() => setActiveStep(7), 2900); // Expand Radius / Feedback Loop
          setTimeout(() => {
            setActiveStep(5); // Re-rank
            setTimeout(() => {
              setActiveStep(6);
              setTimeout(() => {
                setActiveStep(8); // Delivered
                setIsSimulating(false);
              }, 1200);
            }, 1000);
          }, 1200);
        } else {
          setTimeout(() => {
            setActiveStep(8); // Delivered
            setIsSimulating(false);
          }, 2900);
        }
      }, 2800);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Interactive Technical Approach Flowchart</h2>
            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-semibold">
              Slide 3 Architecture
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Live simulation of NLP Intent Detection, Geospatial Query branching, TrustScore Threshold, and Feedback Loop.
          </p>
        </div>

        {/* Simulator Preset Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => startSimulation('complex', true)}
            disabled={isSimulating}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate Complex Query (AI Branch)</span>
          </button>

          <button
            onClick={() => startSimulation('complex', false)}
            disabled={isSimulating}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-amber-600/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Trigger Feedback Loop (Radius Expansion)</span>
          </button>

          <button
            onClick={() => startSimulation('simple', true)}
            disabled={isSimulating}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <span>Simple Query</span>
          </button>
        </div>
      </div>

      {/* Visual Flowchart Canvas matching Slide 3 */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center relative overflow-hidden">
        {/* Step 1: Start */}
        <div className={`px-5 py-2 rounded-full border text-xs font-bold transition-all ${
          activeStep >= 1 
            ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30' 
            : 'bg-slate-900 border-slate-700 text-slate-400'
        }`}>
          ▶ Start
        </div>

        <ArrowDown className={`w-4 h-4 my-1 transition-colors ${activeStep >= 2 ? 'text-blue-400' : 'text-slate-700'}`} />

        {/* Step 2: User Query Received */}
        <div className={`w-full max-w-md p-3 rounded-xl border text-center transition-all ${
          activeStep === 2 
            ? 'bg-blue-900/40 border-blue-400 text-white ring-2 ring-blue-500 shadow-xl' 
            : activeStep > 2
              ? 'bg-slate-900 border-slate-700 text-slate-200'
              : 'bg-slate-900/60 border-slate-800 text-slate-500'
        }`}>
          <div className="text-xs font-bold">User Query Received (Natural-Language Input)</div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            "Urgent 24/7 medicine delivery near me with oxygen check"
          </p>
        </div>

        <ArrowDown className={`w-4 h-4 my-1 transition-colors ${activeStep >= 3 ? 'text-blue-400' : 'text-slate-700'}`} />

        {/* Step 3: Decision Diamond - Query Complexity */}
        <div className={`px-6 py-3 rounded-2xl border text-center text-xs font-bold transition-all ${
          activeStep === 3
            ? 'bg-purple-900/50 border-purple-400 text-purple-200 ring-2 ring-purple-500 shadow-xl'
            : activeStep > 3
              ? 'bg-slate-900 border-slate-700 text-purple-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-500'
        }`}>
          Query Complexity? (NLP Intent Classifier)
        </div>

        {/* Branching Lines */}
        <div className="w-full max-w-2xl grid grid-cols-2 gap-8 my-3">
          {/* Simple Branch */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-semibold text-slate-400 mb-1">Simple (Keyword / Direct)</span>
            <ArrowDown className={`w-4 h-4 mb-1 ${activeStep === 4 ? 'text-blue-400' : 'text-slate-700'}`} />
            <div className={`w-full p-3 rounded-xl border text-center transition-all ${
              activeStep === 4
                ? 'bg-blue-900/50 border-blue-400 text-white ring-2 ring-blue-500'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <span className="text-xs font-bold block">Rule-Based Filtering</span>
              <span className="text-[10px] text-slate-400">Predefined category logic</span>
            </div>
          </div>

          {/* Complex Branch */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-semibold text-indigo-400 mb-1">Complex (Multi-Constraint)</span>
            <ArrowDown className={`w-4 h-4 mb-1 ${activeStep === 5 ? 'text-indigo-400' : 'text-slate-700'}`} />
            <div className={`w-full p-3 rounded-xl border text-center transition-all ${
              activeStep === 5
                ? 'bg-indigo-900/50 border-indigo-400 text-white ring-2 ring-indigo-500 shadow-xl'
                : activeStep > 5
                  ? 'bg-slate-900 border-slate-700 text-slate-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <span className="text-xs font-bold block text-indigo-300">AI Ranking & TrustScore Engine</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                NLP + Geospatial (Intent • Distance • Availability • Trust)
              </span>
            </div>

            <ArrowDown className={`w-4 h-4 my-1 ${activeStep >= 6 ? 'text-indigo-400' : 'text-slate-700'}`} />

            {/* Decision Diamond: TrustScore >= Threshold? */}
            <div className={`w-full p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
              activeStep === 6
                ? 'bg-amber-900/40 border-amber-400 text-amber-200 ring-2 ring-amber-500'
                : activeStep > 6
                  ? 'bg-slate-900 border-slate-700 text-slate-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              TrustScore &ge; Threshold? (Min 80%)
            </div>

            {/* Feedback loop indicator */}
            {activeStep === 7 && (
              <div className="mt-2 p-2 rounded-lg bg-rose-950/60 border border-rose-500 text-[10px] text-rose-300 animate-pulse text-center w-full">
                No &rarr; Expand Radius (+1.5 km) / Re-Rank (AI Learning Feedback Loop)
              </div>
            )}
          </div>
        </div>

        <ArrowDown className={`w-4 h-4 my-2 ${activeStep >= 8 ? 'text-emerald-400' : 'text-slate-700'}`} />

        {/* Step 8: Verified Recommendations Delivered */}
        <div className={`w-full max-w-md p-3.5 rounded-xl border text-center transition-all ${
          activeStep === 8
            ? 'bg-emerald-950/60 border-emerald-400 text-white ring-2 ring-emerald-500 shadow-xl shadow-emerald-950/30'
            : 'bg-slate-900 border-slate-800 text-slate-500'
        }`}>
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified Recommendations Delivered to User</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Slide 3 Action: "User can view details, compare options and directly navigate/call selected provider"
          </p>
        </div>
      </div>

      {/* Technology Stack Grid from Slide 3 */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Technology Stack (Directly from Slide 3 Architecture)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">Frontend</span>
            <span className="font-bold text-blue-400 text-xs">React Web / Vite</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Flutter / React Native</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">Backend</span>
            <span className="font-bold text-emerald-400 text-xs">FastAPI / Node.js</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">REST + WebSockets</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">Database</span>
            <span className="font-bold text-cyan-400 text-xs">PostGIS + PostgreSQL</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Spatial Indexing</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">AI & NLP</span>
            <span className="font-bold text-purple-400 text-xs">LLM + Ranking Engine</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Intent + Sentiment</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">Maps & Geospatial</span>
            <span className="font-bold text-amber-400 text-xs">Geolocation APIs</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Radar & Radius Math</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">Authentication</span>
            <span className="font-bold text-rose-400 text-xs">OTP-based Auth</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Cryptographic Handoff</span>
          </div>
        </div>
      </div>
    </div>
  );
};

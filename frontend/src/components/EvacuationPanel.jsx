import React from 'react';
import { 
  Navigation, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Footprints, 
  Car, 
  AlertTriangle, 
  ArrowRight, 
  PhoneCall, 
  CheckCircle2,
  Mountain
} from 'lucide-react';
import { formatWaterLevel } from '../utils/formatters';

export function EvacuationPanel({ evacuationRoute, risk, onTriggerMapSimulation }) {
  const shelter = evacuationRoute?.destination_shelter;
  const steps = evacuationRoute?.steps || [];
  const totalKm = evacuationRoute?.total_distance_km || 0;
  const footMins = evacuationRoute?.estimated_time_minutes_foot || 0;
  const vehicleMins = evacuationRoute?.estimated_time_minutes_vehicle || 0;
  const riskLevel = risk?.risk_level || 'LOW';

  return (
    <div className="rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 p-4 lg:p-5 shadow-lg flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Safe Evacuation Guidance & Shelter Navigation
            </h2>
            <p className="text-[11px] text-slate-400">
              NetworkX Dijkstra shortest safe path avoiding submerged low-lying roads
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
          High Ground Route
        </span>
      </div>

      {/* Origin -> Destination Card */}
      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 mb-4 space-y-3">
        
        {/* Origin */}
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded-md bg-rose-500/20 text-rose-400 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Affected Lowland Origin
            </div>
            <div className="text-xs font-bold text-slate-100">
              {evacuationRoute?.origin_name || 'Mandakini Lower Valley Settlement (Zone 0)'}
            </div>
            <div className="text-[11px] text-slate-400">Elevation: 1,140 m (River Level: {formatWaterLevel(risk?.current_water_level)})</div>
          </div>
        </div>

        {/* Arrow connector */}
        <div className="pl-3">
          <div className="w-0.5 h-4 bg-slate-800 ml-1.5" />
        </div>

        {/* Destination Shelter */}
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <span>Optimal Safe Haven (High Ground)</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-xs font-extrabold text-white">
              {shelter?.name || 'Pine Ridge Community High Ground'}
            </div>
            <div className="text-[11px] text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
              <span className="flex items-center gap-1 text-emerald-400">
                <Mountain className="w-3 h-3" />
                Elev: {shelter?.elevation_m || 1420} m (+280m safe altitude)
              </span>
              <span>Available Space: <strong>{shelter?.available_space || 388} persons</strong></span>
              <span className="text-slate-400 flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-slate-500" />
                {shelter?.contact_phone || '+91 94120 11001'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Transit Statistics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Total Distance</span>
          <span className="text-base font-black text-white">{totalKm} km</span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1 flex items-center justify-center gap-1">
            <Footprints className="w-3 h-3 text-cyan-400" />
            By Foot
          </span>
          <span className="text-base font-black text-cyan-400">~{footMins} mins</span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1 flex items-center justify-center gap-1">
            <Car className="w-3 h-3 text-indigo-400" />
            Emergency Convoy
          </span>
          <span className="text-base font-black text-indigo-400">~{vehicleMins} mins</span>
        </div>
      </div>

      {/* Step by Step Turn-by-Turn Navigation */}
      <div className="flex-1 flex flex-col min-h-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Turn-by-Turn Evacuation Instructions ({steps.length} Segments)
        </span>

        <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2 pr-1">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {step.step_number}
                </span>
                <div className="flex-1">
                  <p className="text-slate-200 font-medium leading-relaxed">{step.instruction}</p>
                  {step.danger_note && (
                    <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-1 font-semibold">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      {step.danger_note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action button */}
      <div className="pt-3 mt-3 border-t border-slate-800">
        <button
          onClick={onTriggerMapSimulation}
          className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
            riskLevel === 'CRITICAL'
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Execute Mandatory Evacuation Routing</span>
        </button>
      </div>

    </div>
  );
}

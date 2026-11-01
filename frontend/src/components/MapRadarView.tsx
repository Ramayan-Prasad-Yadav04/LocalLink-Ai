import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  Phone, 
  Compass, 
  Maximize2, 
  Layers, 
  Sparkles,
  Info
} from 'lucide-react';
import { Provider } from '../data/mockData';

interface MapRadarViewProps {
  providers: Provider[];
  selectedProvider: Provider | null;
  onSelectProvider: (provider: Provider) => void;
  radiusKm: number;
  navigatingTo: Provider | null;
  currentArea: string;
}

export const MapRadarView: React.FC<MapRadarViewProps> = ({
  providers,
  selectedProvider,
  onSelectProvider,
  radiusKm,
  navigatingTo,
  currentArea,
}) => {
  const [mapStyle, setMapStyle] = useState<'satellite' | 'dark' | 'vector'>('dark');

  // Convert offset (-100 to 100) to map coordinate % (center at 50%, 50%)
  const getCoordinates = (latOffset: number, lngOffset: number) => {
    // scale down if radius is large
    const scaleFactor = Math.min(1.2, 5 / Math.max(radiusKm, 1));
    const x = 50 + (lngOffset * 0.42 * scaleFactor);
    const y = 50 + (latOffset * 0.42 * scaleFactor);
    return {
      x: Math.max(6, Math.min(94, x)),
      y: Math.max(8, Math.min(92, y)),
    };
  };

  const activeProvider = navigatingTo || selectedProvider;
  const activeCoords = activeProvider ? getCoordinates(activeProvider.latOffset, activeProvider.lngOffset) : null;

  return (
    <div className="relative w-full h-[360px] md:h-[440px] rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl flex flex-col justify-between">
      {/* Map Background Grid & Stylized Canvas */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        {/* Subtle grid */}
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle, #334155 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
        {/* Simulated Road Lines */}
        <svg className="absolute inset-0 w-full h-full stroke-slate-700/60" strokeWidth="2" fill="none">
          <path d="M 0,140 Q 250,180 500,120 T 1000,160" />
          <path d="M 120,0 Q 180,240 240,500" strokeWidth="3" className="stroke-slate-600/70" />
          <path d="M 0,310 C 300,290 600,340 1000,280" />
          <path d="M 680,0 Q 640,260 720,500" strokeWidth="2.5" className="stroke-slate-600/50" />
          <circle cx="50%" cy="50%" r="35" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="50%" cy="50%" r="85" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
          <circle cx="50%" cy="50%" r="140" stroke="#3b82f6" strokeWidth="1" strokeDasharray="6 6" opacity="0.25" />
        </svg>

        {/* Live Route Polyline if navigating */}
        {activeCoords && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1="50%"
              y1="50%"
              x2={`${activeCoords.x}%`}
              y2={`${activeCoords.y}%`}
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
          </svg>
        )}
      </div>

      {/* Map Control Overlay Header */}
      <div className="relative z-10 p-3 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-white">
          <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '15s' }} />
          <span>PostGIS Geospatial Grid: <strong>{currentArea}</strong></span>
          <span className="text-slate-400">({radiusKm} km radius)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700 text-[11px] text-slate-300 flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> High Trust (&ge;90)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span> Verified
            </span>
          </div>
        </div>
      </div>

      {/* Center Radar / User Location Marker */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none"
      >
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 animate-radar absolute"></div>
          <div className="w-6 h-6 rounded-full bg-blue-500/40 animate-ping-slow absolute"></div>
          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg relative z-10 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
        </div>
        <span className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-semibold border border-blue-500/40 shadow-sm whitespace-nowrap">
          You are here
        </span>
      </div>

      {/* Provider Map Pins */}
      {providers.map((p) => {
        const coords = getCoordinates(p.latOffset, p.lngOffset);
        const isSelected = selectedProvider?.id === p.id;
        const isNav = navigatingTo?.id === p.id;

        return (
          <div
            key={p.id}
            style={{
              left: `${coords.x}%`,
              top: `${coords.y}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto cursor-pointer group"
            onClick={() => onSelectProvider(p)}
          >
            <div className={`relative flex items-center justify-center transition-all duration-200 ${
              isSelected || isNav ? 'scale-125 z-40' : 'hover:scale-110'
            }`}>
              {/* Outer ring */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 ${
                p.trustScore.overall >= 93
                  ? 'bg-emerald-600/90 border-emerald-300 text-white'
                  : 'bg-blue-600/90 border-blue-300 text-white'
              } ${isSelected ? 'ring-4 ring-amber-400' : ''}`}>
                <span className="text-[10px] font-black">{p.trustScore.overall}</span>
              </div>

              {/* Status pulse if available */}
              {p.isAvailableNow && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900"></span>
              )}
            </div>

            {/* Hover / Active Tooltip */}
            <div className={`absolute bottom-9 left-1/2 -translate-x-1/2 w-48 bg-slate-900/95 backdrop-blur-md p-2 rounded-xl border border-slate-700 shadow-xl text-left transition-all ${
              isSelected ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-semibold text-white mb-0.5">
                <span className="truncate pr-1">{p.name}</span>
                <span className="text-amber-400 font-bold shrink-0">{p.trustScore.overall}★</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1">{p.categoryLabel}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1 border-t border-slate-800 pt-1">
                <span>{p.distanceKm} km away</span>
                <span className="text-emerald-400 font-medium">~{p.estimatedTimeMin} mins</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Selected Provider Bottom Action Drawer inside Map */}
      <div className="relative z-10 p-3 pointer-events-auto">
        {selectedProvider ? (
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm">
                {selectedProvider.trustScore.overall}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">{selectedProvider.name}</h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {selectedProvider.distanceKm} km • {selectedProvider.estimatedTimeMin} mins arrival • {selectedProvider.priceLevel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${selectedProvider.phoneNumber}`}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call</span>
              </a>
              <button
                onClick={() => onSelectProvider(selectedProvider)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1 shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Route Details</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl px-3 py-2 text-center text-xs text-slate-400">
            Click on any TrustScore map pin to view instant route, verified credentials, and call provider.
          </div>
        )}
      </div>
    </div>
  );
};

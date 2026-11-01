import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  Circle, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  ShieldCheck, 
  Droplets, 
  Radio, 
  Navigation, 
  Play, 
  RotateCcw, 
  Maximize2, 
  AlertTriangle 
} from 'lucide-react';
import { formatWaterLevel, formatRainfall, getRiskDetails } from '../utils/formatters';

// Custom modern SVG DivIcons to ensure crisp rendering with zero broken PNG paths
const createDivIcon = (svgHtml, className = '', iconSize = [32, 32]) => {
  return L.divIcon({
    html: svgHtml,
    className: `custom-leaflet-icon ${className}`,
    iconSize: iconSize,
    iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
    popupAnchor: [0, -iconSize[1] / 2]
  });
};

const sensorIcon = createDivIcon(`
  <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-cyan-950/90 border-2 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-500/50">
    <div class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute"></div>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  </div>
`);

const shelterIcon = createDivIcon(`
  <div class="relative flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-950/90 border-2 border-emerald-400 text-emerald-400 shadow-lg shadow-emerald-500/50">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  </div>
`, '', [36, 36]);

const originIcon = createDivIcon(`
  <div class="relative flex items-center justify-center w-9 h-9 rounded-full bg-rose-950/90 border-2 border-rose-500 text-rose-400 shadow-xl shadow-rose-600/60 animate-bounce">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  </div>
`, '', [36, 36]);

const convoyIcon = createDivIcon(`
  <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black shadow-xl shadow-amber-500/80 border-2 border-white animate-pulse">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7h2c0 1.7 1.3 3 3 3s3-1.3 3-3h6c0 1.7 1.3 3 3 3z"/>
    </svg>
  </div>
`);

// Helper component to auto-pan when needed
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export function FloodMap({ 
  sensors = [], 
  shelters = [], 
  evacuationRoute, 
  risk, 
  liveSensor 
}) {
  const defaultCenter = [30.147, 78.802];
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(13);

  // Evacuation simulation convoy state
  const [isSimulatingEvacuation, setIsSimulatingEvacuation] = useState(false);
  const [convoyPosition, setConvoyPosition] = useState(null);
  const [convoyProgressStep, setConvoyProgressStep] = useState(0);

  const polylineCoords = evacuationRoute?.route_polyline || [];
  const riskLevel = risk?.risk_level || 'LOW';
  const riskDetails = getRiskDetails(riskLevel);

  // Determine dynamic risk zone radius & color
  let riskRadius = 400; // meters
  let riskZoneColor = '#10B981';
  if (riskLevel === 'CRITICAL') {
    riskRadius = 1200;
    riskZoneColor = '#EF4444';
  } else if (riskLevel === 'HIGH') {
    riskRadius = 850;
    riskZoneColor = '#F97316';
  } else if (riskLevel === 'MODERATE') {
    riskRadius = 600;
    riskZoneColor = '#F59E0B';
  }

  // Interactive evacuation convoy animation
  const handleStartSimulation = () => {
    if (!polylineCoords || polylineCoords.length < 2) return;
    setIsSimulatingEvacuation(true);
    setConvoyProgressStep(0);
    setConvoyPosition(polylineCoords[0]);
  };

  const handleResetSimulation = () => {
    setIsSimulatingEvacuation(false);
    setConvoyPosition(null);
    setConvoyProgressStep(0);
  };

  useEffect(() => {
    let timer;
    if (isSimulatingEvacuation && polylineCoords.length > 0) {
      if (convoyProgressStep < polylineCoords.length - 1) {
        timer = setTimeout(() => {
          const nextStep = convoyProgressStep + 1;
          setConvoyProgressStep(nextStep);
          setConvoyPosition(polylineCoords[nextStep]);
        }, 1200); // 1.2s per waypoint
      } else {
        // Reached destination shelter!
        timer = setTimeout(() => {
          setIsSimulatingEvacuation(false);
        }, 2000);
      }
    }
    return () => clearTimeout(timer);
  }, [isSimulatingEvacuation, convoyProgressStep, polylineCoords]);

  return (
    <div className="rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 p-4 lg:p-5 shadow-lg flex flex-col h-full">
      
      {/* Map Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-cyan-400 border border-cyan-500/20">
              <Navigation className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Geospatial Disaster Map & Dijkstra Evacuation Network
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            OpenStreetMap valley topography • Live sensor nodes • Dijkstra optimal safe shelters
          </p>
        </div>

        {/* Evacuation simulation controller */}
        <div className="flex items-center gap-2">
          {!isSimulatingEvacuation ? (
            <button
              onClick={handleStartSimulation}
              disabled={polylineCoords.length === 0}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                riskLevel === 'CRITICAL' || riskLevel === 'HIGH'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Evacuation Simulation</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1 animate-pulse">
                <Navigation className="w-3.5 h-3.5" />
                Convoy in Transit (Waypoint {convoyProgressStep + 1}/{polylineCoords.length})
              </span>
              <button
                onClick={handleResetSimulation}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Stop Simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-950/70 px-3 py-2 rounded-xl border border-slate-800 mb-3 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-slate-300">Affected Lowland Zone (Zone 0)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="text-slate-300">Live Hydrometric Sensors</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-slate-300">High-Ground Shelters</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-rose-500" />
          <span className="text-rose-400 font-semibold">Dijkstra Safe Evacuation Path</span>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <div className="flex-1 w-full min-h-[380px] rounded-xl overflow-hidden border border-slate-800 relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
        >
          <MapController center={mapCenter} zoom={mapZoom} />

          {/* CartoDB Dark Matter tiles for professional command-room aesthetics */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap &copy; CARTO"
          />

          {/* Affected Zone Dynamic Flood Inundation Buffer Circle */}
          {evacuationRoute?.origin_coords && (
            <Circle
              center={evacuationRoute.origin_coords}
              radius={riskRadius}
              pathOptions={{
                color: riskZoneColor,
                fillColor: riskZoneColor,
                fillOpacity: riskLevel === 'CRITICAL' ? 0.35 : 0.18,
                weight: 2,
                dashArray: '5 5'
              }}
            />
          )}

          {/* Affected Location Pinpoint (Zone 0) */}
          {evacuationRoute?.origin_coords && (
            <Marker position={evacuationRoute.origin_coords} icon={originIcon}>
              <Popup>
                <div className="text-xs p-1">
                  <strong className="text-rose-600 block text-sm font-bold">
                    {evacuationRoute.origin_name || 'Affected Lowland Zone'}
                  </strong>
                  <p className="text-slate-600 mt-1">
                    Elevation: 1,140m • Status: <span className="font-bold text-rose-600">{riskLevel} RISK</span>
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Water Level: {formatWaterLevel(liveSensor?.water_level)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Dijkstra Evacuation Route Polyline */}
          {polylineCoords.length > 0 && (
            <Polyline
              positions={polylineCoords}
              pathOptions={{
                color: riskLevel === 'CRITICAL' ? '#ef4444' : '#f97316',
                weight: 4.5,
                opacity: 0.95,
                dashArray: riskLevel === 'CRITICAL' ? '8 6' : undefined
              }}
            />
          )}

          {/* Convoy simulation marker */}
          {isSimulatingEvacuation && convoyPosition && (
            <Marker position={convoyPosition} icon={convoyIcon}>
              <Popup>
                <div className="text-xs p-1 font-bold text-amber-700">
                  Evacuation Convoy in Transit • Step {convoyProgressStep + 1}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Sensors */}
          {sensors.map((s) => (
            <Marker key={s.id} position={[s.lat, s.lon]} icon={sensorIcon}>
              <Popup>
                <div className="text-xs p-1">
                  <span className="font-bold text-cyan-600 text-sm block">{s.name}</span>
                  <span className="text-slate-500 text-[11px] block">
                    Type: {s.type.replace('_', ' ')} • Elev: {s.elevation_m}m
                  </span>
                  <div className="mt-1 pt-1 border-t border-slate-200 text-slate-700 text-[11px]">
                    <div>Water Level: <strong>{formatWaterLevel(liveSensor?.water_level)}</strong></div>
                    <div>Rainfall: <strong>{formatRainfall(liveSensor?.rainfall)}</strong></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Shelters */}
          {shelters.map((sh) => (
            <Marker key={sh.id} position={[sh.lat, sh.lon]} icon={shelterIcon}>
              <Popup>
                <div className="text-xs p-1">
                  <span className="font-bold text-emerald-600 text-sm block">{sh.name}</span>
                  <span className="text-slate-500 text-[11px] block">
                    High Elevation: {sh.elevation_m}m Safe Zone
                  </span>
                  <div className="mt-1 pt-1 border-t border-slate-200 text-slate-700 text-[11px]">
                    <div>Capacity: <strong>{sh.capacity} persons</strong></div>
                    <div>Occupancy: {sh.current_occupancy} ({sh.available_space} available)</div>
                    <div className="text-blue-600 font-semibold mt-0.5">Emergency Contact: {sh.contact_phone}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        </MapContainer>
      </div>

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  Polygon, 
  Circle, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { CommandCenterLayout } from '../components/CommandCenterLayout';
import { useSensorData } from '../context/SensorContext';
import { 
  Navigation, 
  Layers, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  Droplets, 
  CloudRain, 
  Gauge, 
  TrendingUp, 
  Compass, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Crosshair, 
  Mountain, 
  Info,
  X,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { formatWaterLevel, formatRainfall, formatSoilMoisture, getRiskDetails } from '../utils/formatters';

// Custom SVG DivIcons to ensure zero broken image URLs
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

const userLocationIcon = createDivIcon(`
  <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/80 border-2 border-white">
    <div class="w-3 h-3 rounded-full bg-cyan-300 animate-ping absolute"></div>
    <div class="w-3 h-3 rounded-full bg-white relative"></div>
  </div>
`);

const convoyIcon = createDivIcon(`
  <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black shadow-xl shadow-amber-500/80 border-2 border-white animate-pulse">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7h2c0 1.7 1.3 3 3 3s3-1.3 3-3h6c0 1.7 1.3 3 3 3z"/>
    </svg>
  </div>
`);

// Auto-pan helper component
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// Topographic River Streams Polylines (Alaknanda & Mandakini River channels)
const RIVER_SYSTEMS = [
  {
    id: "RIVER-ALAKNANDA",
    name: "Alaknanda Main Channel",
    color: "#00b4d8",
    weight: 4,
    coords: [
      [30.175, 78.780],
      [30.165, 78.786],
      [30.155, 78.790],
      [30.148, 78.797],
      [30.142, 78.805],
      [30.138, 78.812],
      [30.135, 78.815],
      [30.128, 78.825]
    ]
  },
  {
    id: "RIVER-MANDAKINI",
    name: "Mandakini Tributary",
    color: "#0077b6",
    weight: 3.5,
    coords: [
      [30.160, 78.835],
      [30.152, 78.827],
      [30.145, 78.820],
      [30.138, 78.816],
      [30.135, 78.815]
    ]
  },
  {
    id: "STREAM-RAVINE",
    name: "Pine Ridge Ravine Drainage",
    color: "#48cae4",
    weight: 2,
    dashArray: "4 4",
    coords: [
      [30.168, 78.815],
      [30.160, 78.812],
      [30.155, 78.805],
      [30.148, 78.797]
    ]
  }
];

// Color-coded flood risk polygon zones (Green: Low, Yellow: Moderate, Orange: High, Red: Critical)
const FLOOD_RISK_ZONES = [
  {
    id: "ZONE-RED-CRITICAL",
    name: "Zone 0: Lowland River Gorge Basin",
    level: "CRITICAL",
    color: "#EF4444",
    fillColor: "#EF4444",
    fillOpacity: 0.28,
    description: "Active flood corridor. Inundation risk > 90% during cloudburst events. Immediate evacuation required.",
    coords: [
      [30.144, 78.792],
      [30.152, 78.798],
      [30.146, 78.808],
      [30.138, 78.804]
    ]
  },
  {
    id: "ZONE-ORANGE-HIGH",
    name: "Zone 1: Lower Valley Settlement Plains",
    level: "HIGH",
    color: "#F97316",
    fillColor: "#F97316",
    fillOpacity: 0.22,
    description: "Vulnerable flood plains. Water overflow occurs when stream gauge exceeds 2.80m.",
    coords: [
      [30.153, 78.798],
      [30.160, 78.804],
      [30.152, 78.815],
      [30.146, 78.808]
    ]
  },
  {
    id: "ZONE-YELLOW-MODERATE",
    name: "Zone 2: Terraced Agricultural Bank",
    level: "MODERATE",
    color: "#F59E0B",
    fillColor: "#F59E0B",
    fillOpacity: 0.18,
    description: "Moderate terrace elevation. Saturated topsoil generates fast surface runoff.",
    coords: [
      [30.160, 78.804],
      [30.167, 78.812],
      [30.159, 78.822],
      [30.152, 78.815]
    ]
  },
  {
    id: "ZONE-GREEN-LOW",
    name: "Zone 3: Elevated Highland Plateau",
    level: "LOW",
    color: "#10B981",
    fillColor: "#10B981",
    fillOpacity: 0.15,
    description: "Safe elevated high-ground. Minimal flash flood risk. Location of emergency community shelters.",
    coords: [
      [30.158, 78.819],
      [30.172, 78.818],
      [30.168, 78.834],
      [30.156, 78.832]
    ]
  }
];

export function LiveMapPage() {
  const {
    sensors,
    shelters,
    evacuationRoute,
    risk,
    liveSensor,
    prediction,
    selectedSensor,
    setSelectedSensor
  } = useSensorData();

  const defaultCenter = [30.147, 78.802];
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(13);

  // User Geolocation State
  const [userLocation, setUserLocation] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Layer Visibility Toggles
  const [layers, setLayers] = useState({
    sensors: true,
    rivers: true,
    zones: true,
    shelters: true,
    evacuationPath: true,
    riskRadius: true
  });

  // Evacuation Convoy Simulation State
  const [isSimulatingEvacuation, setIsSimulatingEvacuation] = useState(false);
  const [convoyPosition, setConvoyPosition] = useState(null);
  const [convoyProgressStep, setConvoyProgressStep] = useState(0);

  const polylineCoords = evacuationRoute?.route_polyline || [];
  const riskLevel = risk?.risk_level || 'LOW';
  const riskDetails = getRiskDetails(riskLevel);

  // Active risk circle calculation
  let riskRadius = 400;
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

  // Handle browser Geolocation
  const handleRequestUserLocation = () => {
    setLocatingUser(true);
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLocatingUser(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setMapCenter(coords);
        setMapZoom(14);
        setLocatingUser(false);
      },
      (err) => {
        // Fallback: place user in the valley settlement
        const fallbackCoords = [30.141, 78.800];
        setUserLocation(fallbackCoords);
        setMapCenter(fallbackCoords);
        setLocationError('Permission denied / GPS unavailable. Set demo user location in valley.');
        setLocatingUser(false);
      },
      { timeout: 7000 }
    );
  };

  // Evacuation convoy animation
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
        }, 1200);
      } else {
        timer = setTimeout(() => {
          setIsSimulatingEvacuation(false);
        }, 2000);
      }
    }
    return () => clearTimeout(timer);
  }, [isSimulatingEvacuation, convoyProgressStep, polylineCoords]);

  // Handle marker click inspection
  const handleSelectStation = (sensor) => {
    setSelectedSensor(sensor);
  };

  return (
    <CommandCenterLayout>
      <div className="flex-1 flex flex-col space-y-3">
        
        {/* Top Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
          
          {/* Valley Basin Title */}
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Compass className="w-4 h-4" />
              </span>
              <h1 className="text-sm font-bold text-white tracking-wide">
                Live Geospatial Flood Monitoring & Evacuation Network
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Alaknanda & Mandakini River Basins • OpenStreetMap CartoDB Topography • Real-time IoT Sensor Overlays
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            
            {/* Locate Me Button */}
            <button
              onClick={handleRequestUserLocation}
              disabled={locatingUser}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
              title="Locate Current Position via Browser Geolocation"
            >
              <Crosshair className={`w-3.5 h-3.5 text-cyan-400 ${locatingUser ? 'animate-spin' : ''}`} />
              <span>{locatingUser ? 'Locating...' : 'Locate Me'}</span>
            </button>

            {/* Evacuation simulation controller */}
            {!isSimulatingEvacuation ? (
              <button
                onClick={handleStartSimulation}
                disabled={polylineCoords.length === 0}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-md ${
                  riskLevel === 'CRITICAL' || riskLevel === 'HIGH'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Evacuation Convoy</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 animate-pulse">
                  <Navigation className="w-3.5 h-3.5" />
                  Convoy in Transit (Step {convoyProgressStep + 1}/{polylineCoords.length})
                </span>
                <button
                  onClick={handleResetSimulation}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Stop Simulation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Reset View Button */}
            <button
              onClick={() => { setMapCenter(defaultCenter); setMapZoom(13); }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Reset Map Center to Valley Overview"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Layer Toggles & Color-Coded Risk Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs">
          
          {/* Layer toggles */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Layers:
            </span>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={layers.sensors}
                onChange={(e) => setLayers({ ...layers, sensors: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Sensors</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={layers.rivers}
                onChange={(e) => setLayers({ ...layers, rivers: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Rivers & Streams</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={layers.zones}
                onChange={(e) => setLayers({ ...layers, zones: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Flood Risk Zones</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={layers.shelters}
                onChange={(e) => setLayers({ ...layers, shelters: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Safe Shelters</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={layers.evacuationPath}
                onChange={(e) => setLayers({ ...layers, evacuationPath: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Dijkstra Safe Route</span>
            </label>
          </div>

          {/* Color-Coded Risk Zones Legend (Green: Low, Yellow: Moderate, Orange: High, Red: Critical) */}
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Green: Low</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-300">Yellow: Moderate</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span className="text-slate-300">Orange: High</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-rose-400 font-bold">Red: Critical</span>
            </div>
          </div>

        </div>

        {locationError && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{locationError}</span>
            </div>
            <button onClick={() => setLocationError('')} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Map Layout & Slide-out Inspection Card */}
        <div className="relative flex-1 w-full min-h-[640px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          
          <MapContainer
            center={defaultCenter}
            zoom={13}
            style={{ width: '100%', height: '100%', minHeight: '640px' }}
            attributionControl={false}
          >
            <MapController center={mapCenter} zoom={mapZoom} />

            {/* CartoDB Voyager tiles */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap &copy; CARTO"
            />

            {/* 1. RIVERS AND STREAMS LAYER */}
            {layers.rivers && RIVER_SYSTEMS.map((river) => (
              <Polyline
                key={river.id}
                positions={river.coords}
                pathOptions={{
                  color: river.color,
                  weight: river.weight,
                  dashArray: river.dashArray || null,
                  opacity: 0.9
                }}
              >
                <Popup>
                  <div className="p-1 text-slate-900 text-xs">
                    <strong className="block text-blue-700">{river.name}</strong>
                    <span>Hydrological river channel monitoring stream</span>
                  </div>
                </Popup>
              </Polyline>
            ))}

            {/* 2. COLOR-CODED FLOOD-PRONE ZONES POLYGONS */}
            {layers.zones && FLOOD_RISK_ZONES.map((zone) => (
              <Polygon
                key={zone.id}
                positions={zone.coords}
                pathOptions={{
                  color: zone.color,
                  fillColor: zone.fillColor,
                  fillOpacity: zone.fillOpacity,
                  weight: 2
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedSensor({
                      name: zone.name,
                      type: 'Flood Inundation Hazard Polygon',
                      elevation_m: zone.level === 'CRITICAL' ? 790 : (zone.level === 'HIGH' ? 840 : 920),
                      status: zone.level,
                      description: zone.description,
                      last_reading: {
                        water_level: liveSensor?.water_level,
                        rainfall: liveSensor?.rainfall,
                        soil_moisture: liveSensor?.soil_moisture
                      }
                    });
                  }
                }}
              >
                <Popup>
                  <div className="p-1 text-slate-900 text-xs space-y-1">
                    <strong className="block font-bold text-rose-700">{zone.name}</strong>
                    <p className="text-[11px] text-slate-600">{zone.description}</p>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200">
                      Risk Level: {zone.level}
                    </span>
                  </div>
                </Popup>
              </Polygon>
            ))}

            {/* 3. DYNAMIC RISK INUNDATION BUFFER CIRCLE */}
            {layers.riskRadius && evacuationRoute?.origin_coords && (
              <Circle
                center={evacuationRoute.origin_coords}
                radius={riskRadius}
                pathOptions={{
                  color: riskZoneColor,
                  fillColor: riskZoneColor,
                  fillOpacity: riskLevel === 'CRITICAL' ? 0.35 : 0.16,
                  weight: 2,
                  dashArray: '5 5'
                }}
              />
            )}

            {/* 4. DIJKSTRA SAFE EVACUATION ROUTE PATH */}
            {layers.evacuationPath && polylineCoords.length > 0 && (
              <Polyline
                positions={polylineCoords}
                pathOptions={{
                  color: riskLevel === 'CRITICAL' ? '#EF4444' : '#10B981',
                  weight: 5,
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              >
                <Popup>
                  <div className="p-1 text-slate-900 text-xs">
                    <strong className="block text-emerald-700">Dijkstra Safe Evacuation Path</strong>
                    <span>Distance: {evacuationRoute?.total_distance_km} km</span>
                    <br />
                    <span>Est. Foot Travel: {evacuationRoute?.estimated_time_minutes} mins</span>
                  </div>
                </Popup>
              </Polyline>
            )}

            {/* 5. MONITORED SENSORS MARKERS */}
            {layers.sensors && sensors.map((s) => (
              <Marker
                key={s.id}
                position={[s.lat, s.lon]}
                icon={sensorIcon}
                eventHandlers={{
                  click: () => handleSelectStation(s)
                }}
              >
                <Popup>
                  <div className="p-1 text-slate-900 text-xs space-y-1 min-w-[190px]">
                    <div className="font-bold text-cyan-800 border-b pb-1 flex items-center justify-between">
                      <span>{s.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <div>Type: {s.type}</div>
                      <div>Elevation: {s.elevation_m}m ASL</div>
                      <div>Status: <span className="font-bold text-emerald-600 uppercase">{s.status}</span></div>
                    </div>
                    <div className="pt-1 border-t text-[11px] text-slate-700">
                      <div>Current Water: <strong>{formatWaterLevel(liveSensor?.water_level)}</strong></div>
                      <div>Rainfall: <strong>{formatRainfall(liveSensor?.rainfall)}</strong></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 6. SAFE SHELTERS MARKERS */}
            {layers.shelters && shelters.map((sh) => (
              <Marker
                key={sh.id}
                position={[sh.lat, sh.lon]}
                icon={shelterIcon}
              >
                <Popup>
                  <div className="p-1 text-slate-900 text-xs space-y-1 min-w-[200px]">
                    <div className="font-bold text-emerald-800 border-b pb-1">
                      {sh.name}
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div>Altitude: <strong>{sh.elevation_m}m ASL (High-Ground)</strong></div>
                      <div>Capacity: <strong>{sh.capacity} persons</strong></div>
                      <div>Current Occupancy: <strong>{sh.current_occupancy}</strong></div>
                      <div>Medical Aid: <span className="text-emerald-700 font-bold">{sh.medical_aid ? 'Available' : 'Pending'}</span></div>
                      <div>Supplies: {sh.food_supplies}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 7. CURRENT USER LOCATION */}
            {userLocation && (
              <Marker position={userLocation} icon={userLocationIcon}>
                <Popup>
                  <div className="p-1 text-slate-900 text-xs">
                    <strong className="block text-blue-700">Your Current Location</strong>
                    <span>GPS Location established</span>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* 8. MOVING CONVOY ANIMATION */}
            {isSimulatingEvacuation && convoyPosition && (
              <Marker position={convoyPosition} icon={convoyIcon}>
                <Popup>
                  <div className="p-1 text-slate-900 text-xs">
                    <strong>Active Evacuation Convoy</strong>
                    <div>Advancing uphill to safe shelter</div>
                  </div>
                </Popup>
              </Marker>
            )}

          </MapContainer>

          {/* SLIDE-OUT / BOTTOM INSPECTION CARD (When user clicks any sensor or zone) */}
          {selectedSensor && (
            <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 z-[1000] rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-5 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-5">
              
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold uppercase tracking-wider">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Monitored Node Inspection</span>
                  </div>
                  <h3 className="text-sm font-black text-white mt-0.5">
                    {selectedSensor.name}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedSensor(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Node Specifications */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Elevation</span>
                  <span className="text-white font-mono font-bold">{selectedSensor.elevation_m || 820}m ASL</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Node Status</span>
                  <span className="text-emerald-400 font-bold uppercase">{selectedSensor.status || 'Active Sync'}</span>
                </div>
              </div>

              {/* Environmental Telemetry */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Water Level:
                  </span>
                  <span className="font-mono font-bold text-white">
                    {formatWaterLevel(liveSensor?.water_level)} (Raw: {formatWaterLevel(liveSensor?.raw_water_level)})
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-indigo-400" /> Rainfall Rate:
                  </span>
                  <span className="font-mono font-bold text-white">
                    {formatRainfall(liveSensor?.rainfall)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" /> Soil Saturation:
                  </span>
                  <span className="font-mono font-bold text-white">
                    {formatSoilMoisture(liveSensor?.soil_moisture)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> 30m Forecast:
                  </span>
                  <span className="font-mono font-bold text-purple-300">
                    {formatWaterLevel(prediction?.mean_water_level)}
                  </span>
                </div>
              </div>

              {/* Safety Recommendation */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-slate-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  {risk?.recommended_action || 'Continuous observation active. Inundation buffer verified safe.'}
                </span>
              </div>

            </div>
          )}

        </div>

      </div>
    </CommandCenterLayout>
  );
}

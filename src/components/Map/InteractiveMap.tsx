import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Provider } from '../../types';
import { useLocation } from '../../context/LocationContext';
import { useNavigate } from 'react-router-dom';

interface InteractiveMapProps {
  providers: Provider[];
  selectedProvider?: Provider | null;
  onSelectProvider?: (provider: Provider) => void;
  height?: string;
  className?: string;
  showControls?: boolean;
  navigatingTo?: Provider | null;
  radiusKm?: number;
  center?: [number, number];
  zoom?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  providers,
  selectedProvider,
  onSelectProvider,
  height = '480px',
  className = '',
  navigatingTo,
  radiusKm = 5,
  center,
  zoom = 14,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const { userCoords, currentCity } = useLocation();
  const navigate = useNavigate();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Avoid double initialization
    if (!mapInstanceRef.current) {
      const initialLat = center ? center[0] : (userCoords?.lat || currentCity.lat);
      const initialLng = center ? center[1] : (userCoords?.lng || currentCity.lng);

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: zoom,
        zoomControl: false,
      });

      // Add Zoom Control to top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // CartoDB Dark Matter Tiles (Modern AI Dark theme)
      const tileProvider = import.meta.env.VITE_MAP_PROVIDER || 'osm';
      const tileUrl = tileProvider === 'osm_light'
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when userCoords or city changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const targetLat = center ? center[0] : (userCoords?.lat || currentCity.lat);
    const targetLng = center ? center[1] : (userCoords?.lng || currentCity.lng);
    mapInstanceRef.current.panTo([targetLat, targetLng], { animate: true });
  }, [userCoords, currentCity, center]);

  // Update Markers, Radius Circle, and Navigation Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const uLat = userCoords?.lat || currentCity.lat;
    const uLng = userCoords?.lng || currentCity.lng;

    // 1. User Location Pulse Marker
    const userIconHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
        <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
        </div>
      </div>
    `;

    const userMarkerIcon = L.divIcon({
      html: userIconHtml,
      className: 'custom-user-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([uLat, uLng], { icon: userMarkerIcon })
      .bindPopup(`
        <div class="p-2 text-slate-900 font-sans text-xs">
          <div class="font-bold text-sm text-blue-600">Your Location</div>
          <div class="text-slate-600">${currentCity.area}, ${currentCity.name}</div>
        </div>
      `)
      .addTo(markersLayer);

    // 2. Search Radius Circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
    }
    radiusCircleRef.current = L.circle([uLat, uLng], {
      radius: radiusKm * 1000,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.06,
      weight: 1.5,
      dashArray: '4 4',
    }).addTo(map);

    // 3. Provider Markers
    providers.forEach((provider) => {
      const isSelected = selectedProvider?.id === provider.id;
      const isNav = navigatingTo?.id === provider.id;
      const trustScore = provider.trustScore.overall;

      const bgColor = trustScore >= 93 ? 'bg-emerald-600 border-emerald-300' : 'bg-blue-600 border-blue-300';
      const ringStyle = isSelected || isNav ? 'ring-4 ring-amber-400 scale-125' : '';

      const markerHtml = `
        <div class="relative group cursor-pointer transition-all duration-200 ${ringStyle}">
          <div class="w-8 h-8 rounded-full ${bgColor} border-2 flex items-center justify-center shadow-lg text-white font-black text-[11px]">
            ${trustScore}
          </div>
          ${provider.isAvailableNow ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900"></span>' : ''}
        </div>
      `;

      const providerIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-provider-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([provider.lat, provider.lng], { icon: providerIcon }).addTo(markersLayer);

      // Popup Content
      const popupHtml = `
        <div class="p-2.5 text-slate-900 font-sans text-xs min-w-[200px]">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[10px] font-bold uppercase text-blue-600">${provider.categoryLabel}</span>
            <span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-[10px]">
              ${provider.trustScore.overall}/100 Trust
            </span>
          </div>
          <h4 class="font-bold text-sm text-slate-900 leading-snug mb-1">${provider.name}</h4>
          <p class="text-[11px] text-slate-500 mb-2">${provider.address}</p>
          <div class="flex items-center justify-between text-[11px] text-slate-700 font-medium mb-3 pb-2 border-b border-slate-100">
            <span>${provider.distanceKm} km away</span>
            <span class="text-emerald-700">${provider.isAvailableNow ? 'Open Now' : 'Closed'}</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button id="view-prov-${provider.id}" class="w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-center font-semibold text-[11px]">
              View Details
            </button>
            <a href="tel:${provider.phoneNumber}" class="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-center font-semibold text-[11px]">
              Call
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectProvider) onSelectProvider(provider);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-prov-${provider.id}`);
        if (btn) {
          btn.onclick = () => {
            navigate(`/provider/${provider.id}`);
          };
        }
      });
    });

    // 4. Navigation Polyline
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (navigatingTo) {
      const latlngs: [number, number][] = [
        [uLat, uLng],
        [navigatingTo.lat, navigatingTo.lng],
      ];
      routeLayerRef.current = L.polyline(latlngs, {
        color: '#0284c7',
        weight: 4,
        dashArray: '8 6',
        opacity: 0.9,
      }).addTo(map);

      map.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
    }
  }, [providers, selectedProvider, navigatingTo, radiusKm, userCoords, currentCity]);

  const handleCenterOnUser = () => {
    if (!mapInstanceRef.current) return;
    const uLat = userCoords?.lat || currentCity.lat;
    const uLng = userCoords?.lng || currentCity.lng;
    mapInstanceRef.current.setView([uLat, uLng], 14, { animate: true });
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl ${className}`} style={{ height }}>
      {/* Map DOM node */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Center User Button */}
      <button
        onClick={handleCenterOnUser}
        className="absolute bottom-4 right-4 z-[400] bg-slate-900/90 hover:bg-slate-800 text-white p-2.5 rounded-xl border border-slate-700 shadow-xl backdrop-blur-md flex items-center gap-1.5 text-xs font-semibold transition-all hover:scale-105"
        title="Center map on your location"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
        <span>My Location</span>
      </button>

      {/* Map Legend */}
      <div className="absolute top-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 text-xs shadow-xl hidden sm:flex items-center gap-3 text-slate-300">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-[11px] font-medium">TrustScore &ge; 93</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-[11px] font-medium">Verified &ge; 88</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-[11px] font-medium text-emerald-300">Open Now</span>
        </div>
      </div>
    </div>
  );
};

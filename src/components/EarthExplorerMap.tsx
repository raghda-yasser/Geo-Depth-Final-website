import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import {
  Layers,
  Search,
  X,
  MapPin,
  Navigation,
  Sliders,
  Eye,
  EyeOff,
  Radio,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { EarthquakeFeature, InSARCaseStudy } from '../types/earthquake.ts';
import { INSAR_CASE_STUDIES } from '../data/insarStudies.ts';

export type BaseMapStyle = 'street' | 'satellite' | 'terrain';

interface EarthExplorerMapProps {
  earthquakes: EarthquakeFeature[];
  totalLoadedCount: number;
  isLoading: boolean;
  onSelectEarthquake: (eq: EarthquakeFeature) => void;
  selectedEarthquake: EarthquakeFeature | null;
}

interface GeocodingResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
}

// Verified Legitimate Tile Providers
const TILE_PROVIDERS: Record<
  BaseMapStyle,
  {
    name: string;
    url: string;
    attribution: string;
    maxZoom: number;
    fallbackUrl?: string;
  }
> = {
  street: {
    name: 'OpenStreetMap Standard',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    fallbackUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    name: 'Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  terrain: {
    name: 'Esri World Topographic',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    maxZoom: 18,
  },
};

export const EarthExplorerMap: React.FC<EarthExplorerMapProps> = ({
  earthquakes,
  totalLoadedCount,
  isLoading,
  onSelectEarthquake,
  selectedEarthquake,
}) => {
  // Map Container Ref
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const earthquakeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const insarLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userLocationLayerRef = useRef<L.LayerGroup | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);

  // Base Map & Layer State
  const [baseMap, setBaseMap] = useState<BaseMapStyle>('street');
  const [showEarthquakes, setShowEarthquakes] = useState(true);
  const [showInSAR, setShowInSAR] = useState(true);
  const [minMag, setMinMag] = useState<number>(0);
  const [selectedInSAR, setSelectedInSAR] = useState<InSARCaseStudy | null>(null);

  // UI Panels State
  const [layersPanelOpen, setLayersPanelOpen] = useState(false);
  const [tileErrorNotice, setTileErrorNotice] = useState<string | null>(null);

  // Search Location State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeSearchedPlace, setActiveSearchedPlace] = useState<string | null>(null);

  // Geolocation State
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  // Filtered Earthquakes based on min magnitude
  const visibleEarthquakes = useMemo(() => {
    if (!showEarthquakes) return [];
    return earthquakes.filter((eq) => (eq.properties.mag ?? 0) >= minMag);
  }, [earthquakes, minMag, showEarthquakes]);

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Create Leaflet Map with Canvas renderer for supreme marker performance
    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false, // We render clean custom zoom controls
      renderer: L.canvas({ padding: 0.5 }),
    });

    // Layer groups for clean management
    const eqGroup = L.layerGroup().addTo(map);
    const insarGroup = L.layerGroup().addTo(map);
    const locGroup = L.layerGroup().addTo(map);

    earthquakeLayerGroupRef.current = eqGroup;
    insarLayerGroupRef.current = insarGroup;
    userLocationLayerRef.current = locGroup;
    mapInstanceRef.current = map;

    // Load Initial Base Map
    switchBaseMapLayer(map, 'street');

    // Invalidate size on mount to prevent gray or distorted tiles
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Switch Tile Layer dynamically
  const switchBaseMapLayer = useCallback((map: L.Map, style: BaseMapStyle) => {
    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const provider = TILE_PROVIDERS[style];
    setTileErrorNotice(null);

    const tileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
      subdomains: style === 'street' ? 'abc' : 'abcd',
    });

    tileLayer.on('tileerror', (error) => {
      console.warn(`Tile loading error for ${provider.name}:`, error);
      setTileErrorNotice(
        `Notice: Some tiles from ${provider.name} experienced network delay. Retrying or switching styles is supported.`
      );
    });

    tileLayer.addTo(map);
    currentTileLayerRef.current = tileLayer;
  }, []);

  // When baseMap changes in state, update layer
  useEffect(() => {
    if (mapInstanceRef.current) {
      switchBaseMapLayer(mapInstanceRef.current, baseMap);
    }
  }, [baseMap, switchBaseMapLayer]);

  // 3. Render Earthquakes on Leaflet Map
  useEffect(() => {
    const eqGroup = earthquakeLayerGroupRef.current;
    if (!eqGroup) return;

    eqGroup.clearLayers();

    if (!showEarthquakes) return;

    visibleEarthquakes.forEach((eq) => {
      const [lng, lat, depth] = eq.geometry.coordinates;
      const mag = eq.properties.mag ?? 0;

      // Calculate radius and color based on magnitude
      const radius = Math.max(4, Math.min(22, (mag - 1.5) * 3.2 + 4));

      let fillColor = '#38bdf8'; // Cyan < 3.0
      let strokeColor = '#0284c7';
      if (mag >= 7.0) {
        fillColor = '#f43f5e'; // Red
        strokeColor = '#881337';
      } else if (mag >= 6.0) {
        fillColor = '#fb923c'; // Orange
        strokeColor = '#9a3412';
      } else if (mag >= 4.5) {
        fillColor = '#facc15'; // Yellow
        strokeColor = '#a16207';
      } else if (mag >= 3.0) {
        fillColor = '#34d399'; // Emerald
        strokeColor = '#065f46';
      }

      const isSelected = selectedEarthquake?.id === eq.id;

      const circle = L.circleMarker([lat, lng], {
        radius: isSelected ? radius + 4 : radius,
        fillColor: fillColor,
        color: isSelected ? '#ffffff' : strokeColor,
        weight: isSelected ? 3 : 1.5,
        opacity: 0.9,
        fillOpacity: isSelected ? 0.95 : 0.75,
      });

      // Interactive Tooltip
      const timeStr = new Date(eq.properties.time).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      const tooltipContent = `
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; color: #0f172a;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 3px;">
            <strong style="color: ${strokeColor}; font-family: monospace; font-size: 13px;">M ${mag.toFixed(1)}</strong>
            <span style="font-family: monospace; color: #64748b; font-size: 11px;">${depth.toFixed(1)} km depth</span>
          </div>
          <div style="font-weight: 600; color: #1e293b; max-width: 200px;">${eq.properties.place || 'Unknown'}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 3px;">${timeStr}</div>
          <div style="font-size: 10px; color: #0284c7; margin-top: 4px; font-weight: 500;">Click to open full scientific report</div>
        </div>
      `;

      circle.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -radius],
        className: 'geo-depth-tooltip',
      });

      circle.on('click', () => {
        onSelectEarthquake(eq);
      });

      eqGroup.addLayer(circle);
    });
  }, [visibleEarthquakes, showEarthquakes, selectedEarthquake, onSelectEarthquake]);

  // 4. Render InSAR Case Study Overlays
  useEffect(() => {
    const insarGroup = insarLayerGroupRef.current;
    if (!insarGroup) return;

    insarGroup.clearLayers();

    if (!showInSAR) return;

    INSAR_CASE_STUDIES.forEach((study) => {
      // 1. Radar Aperture Sweep Ring
      const circleArea = L.circle([study.coordinates.lat, study.coordinates.lng], {
        radius: 45000, // 45km observation radius
        color: '#06b6d4',
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#06b6d4',
        fillOpacity: 0.12,
      });

      // 2. Center Focal Marker
      const centerMarker = L.circleMarker([study.coordinates.lat, study.coordinates.lng], {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: '#06b6d4',
        fillOpacity: 1,
      });

      const tooltipContent = `
        <div style="font-family: monospace; font-size: 11px; padding: 2px;">
          <strong style="color: #0891b2;">InSAR Case Study:</strong><br/>
          ${study.name}<br/>
          <span style="color: #64748b;">${study.satellite} (${study.sensor})</span>
        </div>
      `;

      centerMarker.bindTooltip(tooltipContent, { direction: 'top' });

      centerMarker.on('click', () => {
        setSelectedInSAR(study);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([study.coordinates.lat, study.coordinates.lng], 8, {
            duration: 1.2,
          });
        }
      });

      circleArea.on('click', () => {
        setSelectedInSAR(study);
      });

      insarGroup.addLayer(circleArea);
      insarGroup.addLayer(centerMarker);
    });
  }, [showInSAR]);

  // 5. Handle Location Search (Nominatim OSM Geocoding)
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      // Respect Nominatim usage policy: format=json, limit=5, standard headers
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&addressdetails=1`
      );

      if (!res.ok) {
        throw new Error(`Geocoding service returned status ${res.status}`);
      }

      const data: GeocodingResult[] = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setSearchError(`No locations found matching "${query}". Try a city or country name.`);
      } else {
        setSearchResults(data);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setSearchError('Search request could not be completed. Please check network connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: GeocodingResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    if (isNaN(lat) || isNaN(lon)) return;

    setSearchResults([]);
    setActiveSearchedPlace(result.display_name);

    if (mapInstanceRef.current) {
      const map = mapInstanceRef.current;

      // Fly to location
      map.flyTo([lat, lon], 9, { duration: 1.5 });

      // Add temporary search pin
      if (searchMarkerRef.current) {
        map.removeLayer(searchMarkerRef.current);
      }

      const customPin = L.circleMarker([lat, lon], {
        radius: 9,
        color: '#ffffff',
        weight: 3,
        fillColor: '#8b5cf6',
        fillOpacity: 1,
      }).addTo(map);

      customPin
        .bindPopup(
          `<div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 2px;">
            <strong style="color: #6d28d9;">Searched Location:</strong><br/>
            ${result.display_name}
          </div>`
        )
        .openPopup();

      searchMarkerRef.current = customPin as any;
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
    setActiveSearchedPlace(null);
    if (searchMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }
  };

  // 6. Handle My Location Geolocation
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported by your browser.');
      setTimeout(() => setLocationMessage(null), 4000);
      return;
    }

    setIsLocating(true);
    setLocationMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;

        if (mapInstanceRef.current && userLocationLayerRef.current) {
          const map = mapInstanceRef.current;
          const locGroup = userLocationLayerRef.current;
          locGroup.clearLayers();

          map.flyTo([latitude, longitude], 9, { duration: 1.5 });

          // Accuracy radius
          const accCircle = L.circle([latitude, longitude], {
            radius: Math.max(500, accuracy),
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            weight: 1,
          });

          // User dot
          const userDot = L.circleMarker([latitude, longitude], {
            radius: 7,
            color: '#ffffff',
            fillColor: '#2563eb',
            fillOpacity: 1,
            weight: 2,
          });

          userDot
            .bindPopup(
              `<div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
                <strong style="color: #1d4ed8;">Your Approximate Location</strong><br/>
                Lat: ${latitude.toFixed(4)}°, Lng: ${longitude.toFixed(4)}°
              </div>`
            )
            .openPopup();

          locGroup.addLayer(accCircle);
          locGroup.addLayer(userDot);

          setLocationMessage('Map centered on your current location.');
          setTimeout(() => setLocationMessage(null), 4000);
        }
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Unable to retrieve location.';
        if (err.code === 1) {
          msg = 'Location permission was denied. Please allow location access in your browser settings.';
        } else if (err.code === 2) {
          msg = 'Location position unavailable. Check GPS/network.';
        } else if (err.code === 3) {
          msg = 'Location request timed out.';
        }
        setLocationMessage(msg);
        setTimeout(() => setLocationMessage(null), 5000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Zoom Controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetGlobalView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([20, 0], 2, { duration: 1.2 });
      setMinMag(0);
      handleClearSearch();
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-[#07090e] overflow-hidden select-none flex flex-col">
      {/* Search Location Bar (Top Center) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-lg">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center bg-[#0b0e17]/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden focus-within:border-cyan-400 transition-colors"
        >
          <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
          <input
            type="text"
            placeholder="Search city, country, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2.5 bg-transparent text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="p-1.5 text-slate-400 hover:text-white mr-1"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            disabled={isSearching}
            className="px-3.5 py-2.5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 disabled:opacity-50 text-slate-950 font-semibold text-xs transition-colors shrink-0 font-mono"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-1.5 w-full bg-[#0b0e17] border border-slate-800 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-800/80 max-h-60 overflow-y-auto">
            {searchResults.map((item) => (
              <button
                key={item.place_id}
                onClick={() => handleSelectSearchResult(item)}
                className="w-full px-4 py-2.5 text-left text-xs hover:bg-slate-800/60 transition-colors flex items-start gap-2.5 group"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-slate-200 font-medium group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {item.display_name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 capitalize">
                    {item.type.replace('_', ' ')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Search Error Notice */}
        {searchError && (
          <div className="mt-1.5 p-2.5 bg-rose-950/90 border border-rose-800/80 text-rose-200 text-xs rounded-lg shadow-lg flex items-center justify-between">
            <span>{searchError}</span>
            <button onClick={() => setSearchError(null)} className="text-rose-400 hover:text-white ml-2">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Active Searched Location Tag */}
        {activeSearchedPlace && (
          <div className="mt-1.5 px-3 py-1 bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-[11px] rounded-lg shadow-lg flex items-center justify-between font-mono">
            <span className="truncate">Active view: {activeSearchedPlace}</span>
            <button
              onClick={() => setActiveSearchedPlace(null)}
              className="text-cyan-400 hover:text-white ml-2"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Top Left Bar: Layers Toggle & Counter */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setLayersPanelOpen(!layersPanelOpen)}
          className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-2 shadow-lg backdrop-blur-md ${
            layersPanelOpen
              ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
              : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Map Layers & Filter</span>
        </button>

        {/* Earthquake Counter Display */}
        <div className="px-3 py-2 rounded-lg bg-slate-950/85 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2 shadow-lg backdrop-blur-sm">
          <span className="text-slate-400">Earthquakes:</span>
          <span className="text-cyan-400 font-bold">{visibleEarthquakes.length}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-300">{totalLoadedCount}</span>
          {minMag > 0 && (
            <span className="text-amber-400 text-[11px] ml-1">(M ≥ {minMag.toFixed(1)})</span>
          )}
          {isLoading && (
            <span className="text-[11px] text-cyan-400 animate-pulse ml-1">Loading...</span>
          )}
        </div>
      </div>

      {/* Floating Action Controls (Top Right: My Location, Zoom In, Zoom Out, Reset View) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 shadow-xl">
        {/* My Location Button */}
        <button
          onClick={handleMyLocation}
          disabled={isLocating}
          className="p-2.5 bg-slate-900/95 hover:bg-slate-800 text-cyan-400 border border-slate-700 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
          title="My Location (Center on your position)"
          aria-label="My Location"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="p-2.5 bg-slate-900/95 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          title="Zoom In"
          aria-label="Zoom In"
        >
          +
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="p-2.5 bg-slate-900/95 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition-colors font-bold"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          −
        </button>

        {/* Reset Global View */}
        <button
          onClick={handleResetGlobalView}
          className="p-2.5 bg-slate-900/95 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          title="Reset Global View"
          aria-label="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Location Toast Message */}
      {locationMessage && (
        <div className="absolute top-20 right-4 z-30 max-w-xs p-3 bg-slate-900/95 border border-cyan-500/50 text-cyan-200 text-xs rounded-xl shadow-2xl backdrop-blur-md">
          {locationMessage}
        </div>
      )}

      {/* Tile Loading Error Notice */}
      {tileErrorNotice && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 max-w-lg p-2.5 bg-amber-950/90 border border-amber-800 text-amber-200 text-xs rounded-lg shadow-xl flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="flex-1 text-[11px]">{tileErrorNotice}</span>
          <button
            onClick={() => setTileErrorNotice(null)}
            className="text-amber-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Map Container (Leaflet Mount) */}
      <div
        ref={mapContainerRef}
        className="w-full h-full flex-1 z-0 bg-slate-950"
        style={{ minHeight: '400px' }}
      />

      {/* Layers and Filter Control Panel (Left Overlay) */}
      {layersPanelOpen && (
        <div className="absolute top-16 left-4 z-20 w-80 bg-[#0b0e17]/95 border border-slate-800 rounded-xl p-4 shadow-2xl backdrop-blur-md space-y-5 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Map Layers & Controls
            </h3>
            <button
              onClick={() => setLayersPanelOpen(false)}
              className="text-slate-400 hover:text-white text-xs font-mono"
            >
              Hide
            </button>
          </div>

          {/* FEATURE 3: Base Map Type Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              Base Map Type
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
              {(
                [
                  { id: 'street', label: 'Street Map' },
                  { id: 'satellite', label: 'Satellite' },
                  { id: 'terrain', label: 'Terrain' },
                ] as const
              ).map((style) => (
                <button
                  key={style.id}
                  onClick={() => setBaseMap(style.id)}
                  className={`px-2 py-1.5 text-xs font-medium rounded transition-colors text-center ${
                    baseMap === style.id
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Provider: {TILE_PROVIDERS[baseMap].name}
            </div>
          </div>

          {/* Earthquake Layer Toggle */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
                Earthquake Layer
              </span>
              <button
                onClick={() => setShowEarthquakes(!showEarthquakes)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {showEarthquakes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showEarthquakes ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Real USGS global seismicity feed. Colored by magnitude, clickable for details.
            </p>
          </div>

          {/* Min Magnitude Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono">
              <label className="text-slate-400 uppercase tracking-wider text-[11px]">
                Min Magnitude Filter
              </label>
              <span className="text-cyan-400 font-bold">
                {minMag === 0 ? 'All Events' : `M ≥ ${minMag.toFixed(1)}`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="7.0"
              step="0.5"
              value={minMag}
              onChange={(e) => setMinMag(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>All (0.0)</span>
              <span>M 2.5</span>
              <span>M 4.5</span>
              <span>M 7.0+</span>
            </div>
            {minMag > 0 && (
              <button
                onClick={() => setMinMag(0)}
                className="w-full py-1 text-xs text-center text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors font-mono"
              >
                Reset Filter (Show All)
              </button>
            )}
          </div>

          {/* InSAR Case Study Layer */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                InSAR Case Study Layer
              </span>
              <button
                onClick={() => setShowInSAR(!showInSAR)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {showInSAR ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showInSAR ? 'Active' : 'Muted'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Verified radar deformation tracks from Copernicus Sentinel-1 and NASA JPL.
            </p>
            <div className="space-y-1 pt-1">
              {INSAR_CASE_STUDIES.map((study) => (
                <button
                  key={study.id}
                  onClick={() => {
                    setSelectedInSAR(study);
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo(
                        [study.coordinates.lat, study.coordinates.lng],
                        8,
                        { duration: 1.2 }
                      );
                    }
                  }}
                  className="w-full text-left px-2 py-1.5 text-[11px] rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 flex items-center justify-between border border-slate-800"
                >
                  <span className="truncate">{study.name}</span>
                  <ChevronRight className="w-3 h-3 text-cyan-400 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Magnitude Color Legend */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] font-mono text-slate-400">
            <div className="text-[10px] uppercase text-slate-400">Magnitude Legend</div>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> M 7.0+ Major
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> M 6.0 - 6.9 Strong
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> M 4.5 - 5.9 Mod
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> M 3.0 - 4.4 Light
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected InSAR Case Study Details Drawer (Overlay) */}
      {selectedInSAR && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-30 sm:w-96 bg-[#0b0e17] border border-cyan-500/40 rounded-xl p-4 shadow-2xl space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider">
                Verified InSAR Observation
              </span>
              <h4 className="text-sm font-bold text-slate-100">{selectedInSAR.name}</h4>
            </div>
            <button
              onClick={() => setSelectedInSAR(null)}
              className="text-slate-400 hover:text-white p-1"
              aria-label="Close study card"
            >
              ✕
            </button>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed space-y-2">
            <p>{selectedInSAR.summary}</p>
            <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800 font-mono text-[11px] space-y-1">
              <div>Satellite: {selectedInSAR.satellite} ({selectedInSAR.band})</div>
              <div>Surface Rupture: {selectedInSAR.surfaceRuptureKm} km</div>
              <div>Max Horizontal Slip: {selectedInSAR.verifiedDisplacement.horizontalFaultSlipMeters} m</div>
            </div>
            <div className="text-[11px] text-cyan-200">
              {selectedInSAR.verifiedDisplacement.notes}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{selectedInSAR.dataProviders[0]}</span>
            <a
              href={selectedInSAR.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              Copernicus Portal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

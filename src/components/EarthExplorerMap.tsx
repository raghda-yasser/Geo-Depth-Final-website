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
  AlertTriangle
} from 'lucide-react';
import { EarthquakeFeature, InSARCaseStudy } from '../types/earthquake.ts';
import { INSAR_CASE_STUDIES } from '../data/insarStudies.ts';

export type BaseMapStyle = 'street' | 'satellite' | 'terrain';

interface EarthExplorerMapProps {
  earthquakes: EarthquakeFeature[];
  totalLoadedCount: number;
  isLoading: boolean;
  onOpenAnalysis: (eq: EarthquakeFeature) => void;
  focusedEarthquake: EarthquakeFeature | null;
  onFocusEarthquake: (eq: EarthquakeFeature) => void;
  onClearFocusedEarthquake: () => void;
  focusedEarthquakeError?: string | null;
  onDismissFocusedError?: () => void;
}

interface GeocodingResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
}

interface MagnitudeCircleOptions extends L.CircleMarkerOptions {
  magLabel?: string;
  labelColor?: string;
  labelFontSize?: number;
  isHighlighted?: boolean;
}

// Custom Leaflet Canvas Renderer that draws crisp magnitude labels inside every CircleMarker
class MagnitudeCanvasRenderer extends L.Canvas {
  _updateCircle(layer: L.CircleMarker) {
    // @ts-expect-error invoke parent Leaflet Canvas circle drawing
    super._updateCircle(layer);

    // @ts-expect-error internal Leaflet Canvas state
    if (!this._drawing || layer._empty()) return;

    const opts = layer.options as MagnitudeCircleOptions;
    if (!opts.magLabel) return;

    // @ts-expect-error internal Leaflet screen point
    const p: L.Point = layer._point;
    // @ts-expect-error internal Leaflet canvas 2D context
    const ctx: CanvasRenderingContext2D = this._ctx;
    // @ts-expect-error internal Leaflet pixel radius
    const r: number = Math.max(Math.round(layer._radius), 1);

    ctx.save();

    // Draw distinct double highlight ring for the focused/selected earthquake
    if (opts.isHighlighted) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 9, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    const fontSize = opts.labelFontSize || 10;
    ctx.font = `700 ${fontSize}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 1;

    if (opts.labelColor === '#ffffff') {
      ctx.strokeStyle = 'rgba(7, 9, 14, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.strokeText(opts.magLabel, p.x, p.y + 0.5);
    }

    ctx.fillStyle = opts.labelColor || '#07090e';
    ctx.fillText(opts.magLabel, p.x, p.y + 0.5);
    ctx.restore();
  }
}

// Consistent Magnitude Color Scale Helper
function getMagnitudeStyle(mag: number): {
  fillColor: string;
  strokeColor: string;
  labelColor: string;
  radius: number;
  labelFontSize: number;
} {
  const isNegative = mag < 0;
  if (mag >= 6.0) {
    return {
      fillColor: '#E63946',
      strokeColor: '#881337',
      labelColor: '#ffffff',
      radius: 20,
      labelFontSize: 12,
    };
  }
  if (mag >= 5.0) {
    return {
      fillColor: '#F3722C',
      strokeColor: '#7c2d12',
      labelColor: '#ffffff',
      radius: 17,
      labelFontSize: 11,
    };
  }
  if (mag >= 4.0) {
    return {
      fillColor: '#F8961E',
      strokeColor: '#9a3412',
      labelColor: '#07090e',
      radius: 15,
      labelFontSize: 10.5,
    };
  }
  if (mag >= 3.0) {
    return {
      fillColor: '#F9C74F',
      strokeColor: '#b45309',
      labelColor: '#07090e',
      radius: 13.5,
      labelFontSize: 10,
    };
  }
  if (mag >= 2.0) {
    return {
      fillColor: '#2EC4B6',
      strokeColor: '#0f766e',
      labelColor: '#07090e',
      radius: 12,
      labelFontSize: 9.5,
    };
  }
  return {
    fillColor: '#4CC9F0',
    strokeColor: '#0369a1',
    labelColor: '#07090e',
    radius: isNegative ? 11.5 : 10.5,
    labelFontSize: isNegative ? 8 : 8.5,
  };
}

// Safe DOM Builder for Leaflet Popup Content
function buildEarthquakePopupElement(
  eq: EarthquakeFeature,
  onOpenAnalysis: (eq: EarthquakeFeature) => void
): HTMLElement {
  const [lng, lat, depth] = eq.geometry.coordinates;
  const mag = eq.properties.mag ?? 0;
  const style = getMagnitudeStyle(mag);
  const dateObj = new Date(eq.properties.time);
  const dateTimeStr = dateObj.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const container = document.createElement('div');
  container.style.fontFamily = '"Plus Jakarta Sans", system-ui, sans-serif';
  container.style.color = '#f1f5f9';
  container.style.minWidth = '230px';

  // Top Header Row: Mag Badge + Depth
  const topRow = document.createElement('div');
  topRow.style.display = 'flex';
  topRow.style.alignItems = 'center';
  topRow.style.justifyContent = 'space-between';
  topRow.style.gap = '10px';
  topRow.style.marginBottom = '8px';

  const magBadge = document.createElement('span');
  magBadge.textContent = `M ${mag.toFixed(1)}${eq.properties.magType ? ' ' + eq.properties.magType : ''}`;
  magBadge.style.backgroundColor = style.fillColor;
  magBadge.style.color = style.labelColor;
  magBadge.style.fontFamily = '"JetBrains Mono", monospace';
  magBadge.style.fontWeight = '700';
  magBadge.style.fontSize = '12px';
  magBadge.style.padding = '2px 8px';
  magBadge.style.borderRadius = '6px';

  const depthSpan = document.createElement('span');
  depthSpan.textContent = `${depth.toFixed(1)} km depth`;
  depthSpan.style.fontFamily = '"JetBrains Mono", monospace';
  depthSpan.style.fontSize = '11px';
  depthSpan.style.color = '#94a3b8';

  topRow.appendChild(magBadge);
  topRow.appendChild(depthSpan);
  container.appendChild(topRow);

  // Place Title
  const placeEl = document.createElement('div');
  placeEl.textContent = eq.properties.place || 'Unknown Location';
  placeEl.style.fontWeight = '700';
  placeEl.style.fontSize = '13px';
  placeEl.style.lineHeight = '1.35';
  placeEl.style.color = '#f8fafc';
  placeEl.style.marginBottom = '8px';
  container.appendChild(placeEl);

  // Metadata List (Date/Time & Coordinates)
  const metaBox = document.createElement('div');
  metaBox.style.fontSize = '11px';
  metaBox.style.fontFamily = '"JetBrains Mono", monospace';
  metaBox.style.color = '#cbd5e1';
  metaBox.style.backgroundColor = '#111827';
  metaBox.style.border = '1px solid #1e293b';
  metaBox.style.borderRadius = '6px';
  metaBox.style.padding = '6px 8px';
  metaBox.style.marginBottom = '10px';
  metaBox.style.lineHeight = '1.5';

  const timeRow = document.createElement('div');
  timeRow.textContent = `Time: ${dateTimeStr}`;
  const coordsRow = document.createElement('div');
  coordsRow.textContent = `Coords: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;

  metaBox.appendChild(timeRow);
  metaBox.appendChild(coordsRow);
  container.appendChild(metaBox);

  // Action Buttons Row
  const actionsRow = document.createElement('div');
  actionsRow.style.display = 'flex';
  actionsRow.style.alignItems = 'center';
  actionsRow.style.justifyContent = 'space-between';
  actionsRow.style.gap = '8px';

  const analysisBtn = document.createElement('button');
  analysisBtn.type = 'button';
  analysisBtn.textContent = 'Full Analysis';
  analysisBtn.style.backgroundColor = '#06b6d4';
  analysisBtn.style.color = '#07090e';
  analysisBtn.style.fontWeight = '700';
  analysisBtn.style.fontSize = '11px';
  analysisBtn.style.padding = '5px 10px';
  analysisBtn.style.borderRadius = '6px';
  analysisBtn.style.border = 'none';
  analysisBtn.style.cursor = 'pointer';
  analysisBtn.onclick = () => onOpenAnalysis(eq);
  actionsRow.appendChild(analysisBtn);

  if (eq.properties.url) {
    const usgsLink = document.createElement('a');
    usgsLink.href = eq.properties.url;
    usgsLink.target = '_blank';
    usgsLink.rel = 'noopener noreferrer';
    usgsLink.textContent = 'USGS Event ↗';
    usgsLink.style.color = '#38bdf8';
    usgsLink.style.fontSize = '11px';
    usgsLink.style.fontFamily = '"JetBrains Mono", monospace';
    usgsLink.style.textDecoration = 'none';
    actionsRow.appendChild(usgsLink);
  }

  container.appendChild(actionsRow);
  return container;
}

// Verified Legitimate Tile Providers
const TILE_PROVIDERS: Record<
  BaseMapStyle,
  {
    name: string;
    url: string;
    attribution: string;
    maxZoom: number;
  }
> = {
  street: {
    name: 'OpenStreetMap Standard',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    name: 'Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  terrain: {
    name: 'Esri World Topographic',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    maxZoom: 18,
  },
};

export const EarthExplorerMap: React.FC<EarthExplorerMapProps> = ({
  earthquakes,
  totalLoadedCount,
  isLoading,
  onOpenAnalysis,
  focusedEarthquake,
  onFocusEarthquake,
  onClearFocusedEarthquake,
  focusedEarthquakeError,
  onDismissFocusedError,
}) => {
  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const canvasRendererRef = useRef<MagnitudeCanvasRenderer | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const earthquakeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const insarLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const userLocationLayerRef = useRef<L.LayerGroup | null>(null);
  const searchMarkerRef = useRef<L.CircleMarker | null>(null);
  const markersByIdRef = useRef<Record<string, L.CircleMarker>>({});
  const lastFlownIdRef = useRef<string | null>(null);

  const [mapReady, setMapReady] = useState(false);

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

  // Ensure a focused earthquake is not accidentally filtered out by an active minMag filter
  useEffect(() => {
    if (focusedEarthquake) {
      const eqMag = focusedEarthquake.properties.mag ?? 0;
      if (minMag > 0 && eqMag < minMag) {
        setMinMag(0);
      }
      if (!showEarthquakes) {
        setShowEarthquakes(true);
      }
    }
  }, [focusedEarthquake, minMag, showEarthquakes]);

  // Filtered Earthquakes:
  // When minMag === 0, show all available events with valid magnitude data.
  // When minMag > 0, show only events with mag >= minMag.
  // Also preserve focusedEarthquake if it came from sessionStorage and isn't in the current feed.
  const visibleEarthquakes = useMemo(() => {
    if (!showEarthquakes) return [];

    const filtered = earthquakes.filter((eq) => {
      const mag = eq.properties.mag;
      if (typeof mag !== 'number' || Number.isNaN(mag)) return false;
      if (minMag === 0) return true;
      return mag >= minMag;
    });

    if (focusedEarthquake && !filtered.some((e) => e.id === focusedEarthquake.id)) {
      const fMag = focusedEarthquake.properties.mag;
      if (typeof fMag === 'number' && !Number.isNaN(fMag) && (minMag === 0 || fMag >= minMag)) {
        filtered.push(focusedEarthquake);
      }
    }

    // Sort ascending by magnitude so larger earthquakes render cleanly on top
    return [...filtered].sort((a, b) => (a.properties.mag ?? 0) - (b.properties.mag ?? 0));
  }, [earthquakes, minMag, showEarthquakes, focusedEarthquake]);

  // 1. Switch Tile Layer dynamically
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

  // 2. Initialize Leaflet Map Instance Once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const renderer = new MagnitudeCanvasRenderer({ padding: 0.5 });
    canvasRendererRef.current = renderer;

    const initialCenter: [number, number] = focusedEarthquake
      ? [focusedEarthquake.geometry.coordinates[1], focusedEarthquake.geometry.coordinates[0]]
      : [20, 0];
    const initialZoom = focusedEarthquake ? 7 : 2;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      renderer,
    });

    const eqGroup = L.layerGroup().addTo(map);
    const insarGroup = L.layerGroup().addTo(map);
    const locGroup = L.layerGroup().addTo(map);

    earthquakeLayerGroupRef.current = eqGroup;
    insarLayerGroupRef.current = insarGroup;
    userLocationLayerRef.current = locGroup;
    mapInstanceRef.current = map;

    switchBaseMapLayer(map, 'street');

    map.whenReady(() => {
      map.invalidateSize();
      setMapReady(true);
    });

    return () => {
      setMapReady(false);
      map.remove();
      mapInstanceRef.current = null;
      canvasRendererRef.current = null;
      earthquakeLayerGroupRef.current = null;
      insarLayerGroupRef.current = null;
      userLocationLayerRef.current = null;
      markersByIdRef.current = {};
      lastFlownIdRef.current = null;
    };
  }, [switchBaseMapLayer]);

  // Update Tile Layer when baseMap style changes
  useEffect(() => {
    if (mapInstanceRef.current && mapReady) {
      switchBaseMapLayer(mapInstanceRef.current, baseMap);
    }
  }, [baseMap, mapReady, switchBaseMapLayer]);

  // 3. Render Earthquakes with Permanent Magnitude Labels & Click Popups
  useEffect(() => {
    const eqGroup = earthquakeLayerGroupRef.current;
    const renderer = canvasRendererRef.current;
    if (!eqGroup || !mapReady) return;

    eqGroup.clearLayers();
    markersByIdRef.current = {};

    if (!showEarthquakes) return;

    // Ensure focused earthquake renders on top as the last drawn circle
    const orderedEqs = focusedEarthquake
      ? [
          ...visibleEarthquakes.filter((e) => e.id !== focusedEarthquake.id),
          ...visibleEarthquakes.filter((e) => e.id === focusedEarthquake.id),
        ]
      : visibleEarthquakes;

    orderedEqs.forEach((eq) => {
      const [lng, lat, depth] = eq.geometry.coordinates;
      const mag = eq.properties.mag ?? 0;
      const style = getMagnitudeStyle(mag);
      const isFocused = focusedEarthquake?.id === eq.id;

      const markerOptions: MagnitudeCircleOptions = {
        renderer: renderer || undefined,
        radius: isFocused ? style.radius + 3 : style.radius,
        fillColor: style.fillColor,
        color: isFocused ? '#ffffff' : style.strokeColor,
        weight: isFocused ? 3 : 1.5,
        opacity: 0.95,
        fillOpacity: isFocused ? 1 : 0.92,
        magLabel: mag.toFixed(1),
        labelColor: style.labelColor,
        labelFontSize: isFocused ? style.labelFontSize + 1 : style.labelFontSize,
        isHighlighted: isFocused,
      };

      const circle = L.circleMarker([lat, lng], markerOptions);

      // Hover Tooltip (quick glance)
      const timeStr = new Date(eq.properties.time).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      const tooltipContent = `
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; color: #0f172a;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 3px;">
            <strong style="color: ${style.strokeColor}; font-family: monospace; font-size: 13px;">M ${mag.toFixed(1)}</strong>
            <span style="font-family: monospace; color: #64748b; font-size: 11px;">${depth.toFixed(1)} km depth</span>
          </div>
          <div style="font-weight: 600; color: #1e293b; max-width: 210px;">${eq.properties.place || 'Unknown'}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 3px;">${timeStr}</div>
        </div>
      `;
      circle.bindTooltip(tooltipContent, {
        direction: 'top',
        offset: [0, -style.radius],
        className: 'geo-depth-tooltip',
      });

      // Click Popup with Magnitude, Location, Depth, Date/Time, Coords, USGS Link & Full Analysis
      circle.bindPopup(() => buildEarthquakePopupElement(eq, onOpenAnalysis), {
        className: 'geo-depth-popup',
        maxWidth: 300,
      });

      circle.on('click', () => {
        onFocusEarthquake(eq);
        lastFlownIdRef.current = eq.id; // User clicked marker directly on map, no need to fly away
      });

      markersByIdRef.current[eq.id] = circle;
      eqGroup.addLayer(circle);
    });
  }, [
    visibleEarthquakes,
    showEarthquakes,
    focusedEarthquake,
    mapReady,
    onOpenAnalysis,
    onFocusEarthquake,
  ]);

  // 4. Synchronize "View on Earth Explorer" Navigation -> Fly to Coordinates, Highlight, and Open Popup
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady || !focusedEarthquake) {
      if (!focusedEarthquake) {
        lastFlownIdRef.current = null;
      }
      return;
    }

    const marker = markersByIdRef.current[focusedEarthquake.id];
    if (!marker) return;

    marker.bringToFront();

    if (lastFlownIdRef.current !== focusedEarthquake.id) {
      lastFlownIdRef.current = focusedEarthquake.id;
      const [lng, lat] = focusedEarthquake.geometry.coordinates;
      const targetZoom = Math.max(map.getZoom(), 7);

      const openMarkerPopup = () => {
        const currentMarker = markersByIdRef.current[focusedEarthquake.id];
        if (currentMarker && mapInstanceRef.current) {
          currentMarker.openPopup();
        }
      };

      const dist = map.getCenter().distanceTo(L.latLng(lat, lng));
      if (dist < 1000 && map.getZoom() >= 6) {
        openMarkerPopup();
      } else {
        map.once('moveend', openMarkerPopup);
        map.flyTo([lat, lng], targetZoom, { duration: 1.1 });
        // Safety fallback in case flyTo completes without triggering moveend
        const fallbackTimer = window.setTimeout(openMarkerPopup, 1250);
        return () => {
          window.clearTimeout(fallbackTimer);
          map.off('moveend', openMarkerPopup);
        };
      }
    }
  }, [focusedEarthquake, mapReady, visibleEarthquakes]);

  // 5. Render InSAR Case Study Overlays
  useEffect(() => {
    const insarGroup = insarLayerGroupRef.current;
    if (!insarGroup || !mapReady) return;

    insarGroup.clearLayers();
    if (!showInSAR) return;

    INSAR_CASE_STUDIES.forEach((study) => {
      const circleArea = L.circle([study.coordinates.lat, study.coordinates.lng], {
        radius: 45000,
        color: '#06b6d4',
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#06b6d4',
        fillOpacity: 0.12,
      });

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
  }, [showInSAR, mapReady]);

  // 6. Handle Location Search (Nominatim OSM Geocoding)
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
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
      map.flyTo([lat, lon], 9, { duration: 1.5 });

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
          `<div style="font-family: sans-serif; font-size: 12px; color: #f8fafc; padding: 2px;">
            <strong style="color: #c4b5fd;">Searched Location:</strong><br/>
            ${result.display_name}
          </div>`,
          { className: 'geo-depth-popup' }
        )
        .openPopup();

      searchMarkerRef.current = customPin;
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

  // 7. Handle My Location Geolocation
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

          const accCircle = L.circle([latitude, longitude], {
            radius: Math.max(500, accuracy),
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.15,
            weight: 1,
          });

          const userDot = L.circleMarker([latitude, longitude], {
            radius: 7,
            color: '#ffffff',
            fillColor: '#2563eb',
            fillOpacity: 1,
            weight: 2,
          });

          userDot
            .bindPopup(
              `<div style="font-family: sans-serif; font-size: 12px; color: #f8fafc;">
                <strong style="color: #60a5fa;">Your Approximate Location</strong><br/>
                Lat: ${latitude.toFixed(4)}°, Lng: ${longitude.toFixed(4)}°
              </div>`,
              { className: 'geo-depth-popup' }
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
      mapInstanceRef.current.closePopup();
      mapInstanceRef.current.flyTo([20, 0], 2, { duration: 1.2 });
      setMinMag(0);
      handleClearSearch();
      onClearFocusedEarthquake();
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

        {/* Focused Earthquake Error Notice (e.g. if URL ?eq=ID not found) */}
        {focusedEarthquakeError && (
          <div className="mt-1.5 p-2.5 bg-rose-950/95 border border-rose-700 text-rose-200 text-xs rounded-lg shadow-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{focusedEarthquakeError}</span>
            </div>
            {onDismissFocusedError && (
              <button onClick={onDismissFocusedError} className="text-rose-300 hover:text-white shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
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
      <div className="absolute top-16 sm:top-4 left-4 z-20 flex flex-wrap items-center gap-2">
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
            <span className="text-[11px] text-cyan-400 ml-1">Loading...</span>
          )}
        </div>
      </div>

      {/* Floating Action Controls (Top Right: My Location, Zoom In, Zoom Out, Reset View) */}
      <div className="absolute top-16 sm:top-4 right-4 z-20 flex flex-col gap-1.5 shadow-xl">
        <button
          onClick={handleMyLocation}
          disabled={isLocating}
          className="p-2.5 bg-slate-900/95 hover:bg-slate-800 text-cyan-400 border border-slate-700 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
          title="My Location (Center on your position)"
          aria-label="My Location"
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={handleZoomIn}
          className="p-2.5 bg-slate-900/95 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          title="Zoom In"
          aria-label="Zoom In"
        >
          +
        </button>

        <button
          onClick={handleZoomOut}
          className="p-2.5 bg-slate-900/95 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition-colors font-bold"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          −
        </button>

        <button
          onClick={handleResetGlobalView}
          className="p-2.5 bg-slate-900/95 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          title="Reset Global View"
          aria-label="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Focused Earthquake Indicator Strip (Bottom Left) */}
      {focusedEarthquake && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm bg-[#0b0e17]/95 border border-cyan-500/60 rounded-xl p-3 shadow-2xl backdrop-blur-md space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Selected Earthquake
              </div>
              <div className="text-xs font-bold text-slate-100 line-clamp-1">
                M {(focusedEarthquake.properties.mag ?? 0).toFixed(1)} ·{' '}
                {focusedEarthquake.properties.place || 'Unknown'}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {focusedEarthquake.geometry.coordinates[1].toFixed(3)}°,{' '}
                {focusedEarthquake.geometry.coordinates[0].toFixed(3)}° ·{' '}
                {focusedEarthquake.geometry.coordinates[2].toFixed(1)} km depth
              </div>
            </div>
            <button
              onClick={onClearFocusedEarthquake}
              className="text-slate-400 hover:text-white p-1"
              title="Clear selected earthquake"
              aria-label="Clear selected earthquake"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <button
              onClick={() => onOpenAnalysis(focusedEarthquake)}
              className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-[11px] rounded transition-colors"
            >
              Open Full Analysis
            </button>
            <button
              onClick={() => {
                const map = mapInstanceRef.current;
                const marker = markersByIdRef.current[focusedEarthquake.id];
                if (map) {
                  const [lng, lat] = focusedEarthquake.geometry.coordinates;
                  map.flyTo([lat, lng], Math.max(map.getZoom(), 7), { duration: 0.9 });
                }
                if (marker) {
                  marker.openPopup();
                }
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] rounded transition-colors"
            >
              Re-Center
            </button>
          </div>
        </div>
      )}

      {/* Location Toast Message */}
      {locationMessage && (
        <div className="absolute top-32 sm:top-20 right-16 z-30 max-w-xs p-3 bg-slate-900/95 border border-cyan-500/50 text-cyan-200 text-xs rounded-xl shadow-2xl backdrop-blur-md">
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
        <div className="absolute top-28 sm:top-16 left-4 z-20 w-80 bg-[#0b0e17]/95 border border-slate-800 rounded-xl p-4 shadow-2xl backdrop-blur-md space-y-5 max-h-[calc(100vh-8rem)] overflow-y-auto">
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

          {/* Base Map Type Selector */}
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
                <span className="w-2.5 h-2.5 rounded-full bg-[#4CC9F0] inline-block" />
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
              Real USGS global seismicity feed. Every visible marker displays its magnitude and opens full event details on click.
            </p>
          </div>

          {/* Min Magnitude Filter */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono">
              <label htmlFor="min-mag-slider" className="text-slate-400 uppercase tracking-wider text-[11px]">
                Min Magnitude Filter
              </label>
              <span className="text-cyan-400 font-bold">
                {minMag === 0 ? 'All Events (0)' : `M ≥ ${minMag.toFixed(1)}`}
              </span>
            </div>
            <input
              id="min-mag-slider"
              type="range"
              min="0"
              max="7.0"
              step="0.5"
              value={minMag}
              onChange={(e) => setMinMag(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            {/* Quick Magnitude Presets */}
            <div className="grid grid-cols-5 gap-1 font-mono text-[10px]">
              {[0, 3, 4, 5, 6].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMinMag(val)}
                  className={`py-1 rounded border transition-colors ${
                    minMag === val
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {val === 0 ? 'All' : `M ${val}+`}
                </button>
              ))}
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

          {/* Magnitude Color Legend (Exact 6-Tier Scale) */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] font-mono text-slate-300">
            <div className="text-[10px] uppercase text-slate-400">Magnitude Color Scale</div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#4CC9F0' }} />
                <span>M &lt; 2.0</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#2EC4B6' }} />
                <span>M 2.0 – 2.9</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#F9C74F' }} />
                <span>M 3.0 – 3.9</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#F8961E' }} />
                <span>M 4.0 – 4.9</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#F3722C' }} />
                <span>M 5.0 – 5.9</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#E63946' }} />
                <span>M 6.0+</span>
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

import React, { useState, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import {
  Activity,
  Satellite,
  Layers,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  SlidersHorizontal,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  CheckCircle2,
  HelpCircle,
  Search,
  ChevronDown,
  Compass,
  HeartPulse,
  ShieldCheck,
  X,
} from 'lucide-react';
import { EarthquakeFeature } from '../types/earthquake.ts';
import {
  fetchEarthImpactForEvent,
  EarthImpactReport,
  SatelliteObservation,
  ObservationMission,
  EpistemicImageCategory,
} from '../services/earthImpactService.ts';

interface EarthImpactViewProps {
  earthquakes: EarthquakeFeature[];
  isLoadingFeed: boolean;
  selectedEarthquake: EarthquakeFeature | null;
  onSelectEarthquake: (eq: EarthquakeFeature) => void;
  onOpenInMap?: (eq: EarthquakeFeature) => void;
  onOpenHumanImpact?: (eq: EarthquakeFeature) => void;
}

const MISSION_BADGE_STYLES: Record<ObservationMission, string> = {
  NISAR: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
  'OPERA-S1 / ARIA': 'bg-sky-950/80 text-sky-300 border-sky-500/50',
  USGS: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
  'NASA Worldview (VIIRS)': 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
};

const TIMING_BADGE_STYLES: Record<SatelliteObservation['timing'], string> = {
  'co-seismic': 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60',
  'post-event': 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60',
  'event-response': 'bg-amber-500/20 text-amber-300 border-amber-400/60',
  'pre-event': 'bg-slate-800 text-slate-300 border-slate-700',
};

const CATEGORY_BADGE_STYLES: Record<EpistemicImageCategory, string> = {
  'Scientific Measurement': 'bg-cyan-500/20 text-cyan-200 border-cyan-400/60',
  'Satellite Observation': 'bg-emerald-500/15 text-emerald-200 border-emerald-500/50',
  'Model Indicator': 'bg-amber-500/20 text-amber-200 border-amber-400/60',
};

export const EarthImpactView: React.FC<EarthImpactViewProps> = ({
  earthquakes,
  isLoadingFeed,
  selectedEarthquake,
  onSelectEarthquake,
  onOpenInMap,
  onOpenHumanImpact,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [impactReport, setImpactReport] = useState<EarthImpactReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [shakemapLayer, setShakemapLayer] = useState<'intensity' | 'pga' | 'pgv'>('intensity');

  // Interactive observation filters & inspection state
  const [missionFilter, setMissionFilter] = useState<'ALL' | ObservationMission>('ALL');
  const [selectedObsId, setSelectedObsId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Zoom & Pan Modal Inspector state
  const [zoomedObservation, setZoomedObservation] = useState<SatelliteObservation | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Geospatial Footprint Map Overlay controls
  const footprintMapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const footprintLayerRef = useRef<L.LayerGroup | null>(null);
  const footprintTileRef = useRef<L.TileLayer | null>(null);
  const [footprintBaseMap, setFootprintBaseMap] = useState<'satellite' | 'street' | 'terrain'>('satellite');
  const [showNisarLayer, setShowNisarLayer] = useState(true);
  const [showOperaLayer, setShowOperaLayer] = useState(true);
  const [showUsgsLayer, setShowUsgsLayer] = useState(true);
  const [showEpicenterLayer, setShowEpicenterLayer] = useState(true);

  // Sort earthquakes cleanly for dropdown selection (prioritizing significant/recent M>=4.5 first, then rest)
  const dropdownEarthquakes = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    const list = earthquakes.filter((eq) => {
      if (!q) return true;
      const place = (eq.properties.place || '').toLowerCase();
      const id = eq.id.toLowerCase();
      return place.includes(q) || id.includes(q);
    });
    return [...list].sort((a, b) => {
      const sigDiff = (b.properties.sig ?? 0) - (a.properties.sig ?? 0);
      if (sigDiff !== 0) return sigDiff;
      return (b.properties.mag ?? 0) - (a.properties.mag ?? 0);
    });
  }, [earthquakes, searchFilter]);

  // Quick highlight events directly from shared dataset (events with ground-failure/shakemap or highest magnitude)
  const notableSharedEvents = useMemo(() => {
    const ranked = [...earthquakes].sort((a, b) => {
      const aHasGf = (a.properties.types || '').includes('ground-failure') ? 1000 : 0;
      const bHasGf = (b.properties.types || '').includes('ground-failure') ? 1000 : 0;
      const aHasSm = (a.properties.types || '').includes('shakemap') ? 300 : 0;
      const bHasSm = (b.properties.types || '').includes('shakemap') ? 300 : 0;
      const aScore = aHasGf + aHasSm + (a.properties.mag ?? 0) * 50;
      const bScore = bHasGf + bHasSm + (b.properties.mag ?? 0) * 50;
      return bScore - aScore;
    });
    return ranked.slice(0, 4);
  }, [earthquakes]);

  // Never silently auto-select a different earthquake on mount; wait for explicit user choice or shared selection

  // Fetch real USGS + NASA CMR + Worldview data whenever selectedEarthquake changes
  useEffect(() => {
    if (!selectedEarthquake) {
      setImpactReport(null);
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    async function loadImpact() {
      setIsLoadingReport(true);
      setReportError(null);
      setMissionFilter('ALL');
      setSelectedObsId(null);
      setShakemapLayer('intensity');
      setFailedImages({});

      try {
        const report = await fetchEarthImpactForEvent(selectedEarthquake!, controller.signal);
        if (isActive) {
          setImpactReport(report);
          if (report.observations.length > 0) {
            setSelectedObsId(report.observations[0].id);
          }
        }
      } catch (err) {
        if (isActive && !(err instanceof DOMException && err.name === 'AbortError')) {
          console.error('Failed to load Earth Impact report:', err);
          setReportError('Unable to reach NASA Earthdata or USGS detail servers. Please verify connectivity.');
        }
      } finally {
        if (isActive) {
          setIsLoadingReport(false);
        }
      }
    }

    loadImpact();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [selectedEarthquake]);

  // Visible observations after Mission Filter & Date sorting
  const filteredObservations = useMemo(() => {
    if (!impactReport) return [];
    if (missionFilter === 'ALL') return impactReport.observations;
    return impactReport.observations.filter((o) => o.mission === missionFilter);
  }, [impactReport, missionFilter]);

  const activeObservation = useMemo(() => {
    if (!filteredObservations.length) return null;
    return filteredObservations.find((o) => o.id === selectedObsId) || filteredObservations[0];
  }, [filteredObservations, selectedObsId]);

  // Initialize Leaflet Footprint Overlay Map (scoped exclusively to satellite footprints of selected earthquake)
  useEffect(() => {
    if (!footprintMapRef.current || !selectedEarthquake) return;
    if (leafletMapRef.current) return;

    const [lng, lat] = selectedEarthquake.geometry.coordinates;
    const map = L.map(footprintMapRef.current, {
      center: [lat, lng],
      zoom: 8,
      minZoom: 3,
      maxZoom: 16,
      zoomControl: true,
    });

    const group = L.layerGroup().addTo(map);
    leafletMapRef.current = map;
    footprintLayerRef.current = group;

    return () => {
      map.remove();
      leafletMapRef.current = null;
      footprintLayerRef.current = null;
      footprintTileRef.current = null;
    };
  }, [selectedEarthquake?.id]);

  // Update tile provider on Footprint Overlay Map
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (footprintTileRef.current) {
      map.removeLayer(footprintTileRef.current);
    }

    const tileConfigs = {
      satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri World Imagery',
      },
      street: {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
      },
      terrain: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri Topographic',
      },
    };

    const cfg = tileConfigs[footprintBaseMap];
    const layer = L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: 18 }).addTo(map);
    footprintTileRef.current = layer;
  }, [footprintBaseMap, selectedEarthquake?.id]);

  // Render footprints and epicenter onto Footprint Overlay Map
  useEffect(() => {
    const map = leafletMapRef.current;
    const group = footprintLayerRef.current;
    if (!map || !group || !selectedEarthquake) return;

    group.clearLayers();
    const [lng, lat] = selectedEarthquake.geometry.coordinates;

    // 1. NISAR Swath Footprints
    if (showNisarLayer && impactReport) {
      impactReport.observations
        .filter((o) => o.mission === 'NISAR')
        .forEach((obs) => {
          const boundsOrPoly = obs.polygon
            ? L.polygon(obs.polygon, {
                color: '#22d3ee',
                weight: 2,
                fillColor: '#06b6d4',
                fillOpacity: obs.id === activeObservation?.id ? 0.2 : 0.07,
                dashArray: obs.isInterferometric ? undefined : '5 4',
              })
            : L.rectangle(
                [
                  [obs.bbox[0], obs.bbox[1]],
                  [obs.bbox[2], obs.bbox[3]],
                ],
                {
                  color: '#22d3ee',
                  weight: 2,
                  fillColor: '#06b6d4',
                  fillOpacity: 0.08,
                }
              );
          boundsOrPoly.bindTooltip(
            `<div style="font-family:monospace;font-size:11px;"><strong>NASA-ISRO NISAR</strong><br/>${obs.collectionShortName}<br/>${obs.acquisitionStart.slice(
              0,
              10
            )}</div>`
          );
          boundsOrPoly.on('click', () => setSelectedObsId(obs.id));
          group.addLayer(boundsOrPoly);
        });
    }

    // 2. OPERA / ARIA Sentinel-1 Bursts
    if (showOperaLayer && impactReport) {
      impactReport.observations
        .filter((o) => o.mission === 'OPERA-S1 / ARIA')
        .forEach((obs) => {
          const poly = obs.polygon
            ? L.polygon(obs.polygon, {
                color: '#38bdf8',
                weight: 1.5,
                fillColor: '#0284c7',
                fillOpacity: obs.id === activeObservation?.id ? 0.18 : 0.05,
              })
            : L.rectangle(
                [
                  [obs.bbox[0], obs.bbox[1]],
                  [obs.bbox[2], obs.bbox[3]],
                ],
                { color: '#38bdf8', weight: 1.5, fillOpacity: 0.05 }
              );
          poly.bindTooltip(
            `<div style="font-family:monospace;font-size:11px;"><strong>OPERA Sentinel-1</strong><br/>${obs.trackOrBurstKey || obs.collectionShortName}<br/>${obs.acquisitionStart.slice(
              0,
              10
            )}</div>`
          );
          poly.on('click', () => setSelectedObsId(obs.id));
          group.addLayer(poly);
        });
    }

    // 3. USGS ShakeMap / Ground-Failure Extents
    if (showUsgsLayer && impactReport) {
      const gfBox = impactReport.usgsProducts.groundFailure?.landslideBbox;
      const smBox = impactReport.usgsProducts.shakemap?.bbox;
      if (smBox) {
        const rect = L.rectangle(
          [
            [smBox[0], smBox[1]],
            [smBox[2], smBox[3]],
          ],
          {
            color: '#f59e0b',
            weight: 1.8,
            dashArray: '6 4',
            fillColor: '#f59e0b',
            fillOpacity: 0.04,
          }
        );
        rect.bindTooltip('<div style="font-family:monospace;font-size:11px;">USGS ShakeMap Extent</div>');
        group.addLayer(rect);
      }
      if (gfBox) {
        const rect = L.rectangle(
          [
            [gfBox[0], gfBox[1]],
            [gfBox[2], gfBox[3]],
          ],
          {
            color: '#ef4444',
            weight: 1.8,
            dashArray: '3 4',
            fillColor: '#ef4444',
            fillOpacity: 0.05,
          }
        );
        rect.bindTooltip(
          '<div style="font-family:monospace;font-size:11px;">USGS Ground-Failure Model Extent</div>'
        );
        group.addLayer(rect);
      }
    }

    // 4. Selected Earthquake Epicenter Marker
    if (showEpicenterLayer) {
      const epicenter = L.circleMarker([lat, lng], {
        radius: 8,
        color: '#ffffff',
        weight: 2.5,
        fillColor: '#e63946',
        fillOpacity: 1,
      });
      epicenter.bindTooltip(
        `<div style="font-family:monospace;font-size:11px;"><strong>Epicenter (${selectedEarthquake.id})</strong><br/>M ${(
          selectedEarthquake.properties.mag ?? 0
        ).toFixed(1)} · ${selectedEarthquake.geometry.coordinates[2].toFixed(1)} km depth</div>`
      );
      group.addLayer(epicenter);
    }

    map.setView([lat, lng], 8, { animate: false });
    map.invalidateSize();
  }, [
    selectedEarthquake,
    impactReport,
    activeObservation?.id,
    showNisarLayer,
    showOperaLayer,
    showUsgsLayer,
    showEpicenterLayer,
  ]);

  const handleOpenZoomModal = (obs: SatelliteObservation) => {
    setZoomedObservation(obs);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            <Satellite className="w-3.5 h-3.5" />
            <span>Orbital Geodesy · NISAR · Sentinel-1 OPERA/ARIA · USGS Scientific Products</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Earth Impact
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium">
            Discover how earthquakes transform Earth's surface.
          </p>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Explore verified satellite radar (NISAR L-band, Copernicus Sentinel-1 OPERA/ARIA C-band),
            NASA optical reflectance imagery, and USGS ground-failure assessments linked directly to
            real earthquakes from the shared USGS dataset.
          </p>
        </div>

        {selectedEarthquake && (onOpenInMap || onOpenHumanImpact) && (
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
            {onOpenHumanImpact && (
              <button
                type="button"
                onClick={() => onOpenHumanImpact(selectedEarthquake)}
                className="px-3.5 py-2 text-xs font-mono font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/70 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>View Human Impact</span>
              </button>
            )}
            {onOpenInMap && (
              <button
                type="button"
                onClick={() => onOpenInMap(selectedEarthquake)}
                className="px-3.5 py-2 text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-700/70 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Locate on Earth Explorer</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Shared Dataset Earthquake Selection Bar */}
      <section className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              Select Earthquake from Shared USGS Dataset
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Populated directly from GEO DEPTH’s live USGS catalog ({earthquakes.length} events loaded).
              Every record uses its authentic USGS Event ID.
            </p>
          </div>

          {notableSharedEvents.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 mr-1">
                Notable Events:
              </span>
              {notableSharedEvents.map((eq) => {
                const isSelected = selectedEarthquake?.id === eq.id;
                return (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => onSelectEarthquake(eq)}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-500/50 hover:text-white'
                    }`}
                  >
                    M {(eq.properties.mag ?? 0).toFixed(1)} · {(eq.properties.place || eq.id).split(',').pop()?.trim()}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Quick filter input */}
          <div className="md:col-span-4 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter dropdown by region or USGS ID..."
              aria-label="Filter earthquake dropdown"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Primary Shared-Dataset Dropdown */}
          <div className="md:col-span-8 relative">
            <select
              aria-label="Select earthquake for Earth Impact analysis"
              value={selectedEarthquake?.id || ''}
              onChange={(e) => {
                const match = earthquakes.find((item) => item.id === e.target.value);
                if (match) onSelectEarthquake(match);
              }}
              className="w-full px-3.5 py-2.5 pr-9 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer"
            >
              {dropdownEarthquakes.length === 0 ? (
                <option value="">
                  {isLoadingFeed ? 'Loading USGS earthquake catalog...' : 'No matching earthquakes in catalog'}
                </option>
              ) : (
                <>
                  <option value="" disabled>
                    -- Select an earthquake from USGS dataset ({dropdownEarthquakes.length} events) --
                  </option>
                  {dropdownEarthquakes.map((eq) => {
                    const dateShort = new Date(eq.properties.time).toISOString().slice(0, 10);
                    return (
                      <option key={eq.id} value={eq.id}>
                        {`M ${(eq.properties.mag ?? 0).toFixed(1)} · ${eq.properties.place || 'Unknown'} (${dateShort}) [${eq.id}]`}
                      </option>
                    );
                  })}
                </>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </section>

      {!selectedEarthquake && (
        <section className="bg-[#0b0e17] border border-slate-800 rounded-xl p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 mx-auto">
            <Satellite className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 max-w-xl mx-auto">
            <h2 className="text-lg font-bold text-slate-100">
              Select an Earthquake to Inspect Earth Impact
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose any earthquake from the shared USGS dropdown above, click a Notable Event pill, or select an event from Earth Explorer or Human Impact to load verified satellite imagery, USGS ShakeMaps, and surface deformation products.
            </p>
          </div>
          {notableSharedEvents.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {notableSharedEvents.map((eq) => (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => onSelectEarthquake(eq)}
                  className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-900 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-500/50 text-cyan-300 transition-colors"
                >
                  Inspect M {(eq.properties.mag ?? 0).toFixed(1)} · {eq.properties.place || eq.id}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {selectedEarthquake && (
        <>
          {/* SECTION A: SELECTED EARTHQUAKE */}
          <section className="bg-[#0b0e17] border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  Section A · Selected Earthquake
                </div>
                <h2 className="text-xl font-bold text-slate-100 mt-1">
                  {selectedEarthquake.properties.place || 'Unknown Location'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-md bg-cyan-950/70 border border-cyan-500/40 text-xs font-mono text-cyan-300 font-bold">
                  USGS ID: {selectedEarthquake.id}
                </span>
                {selectedEarthquake.properties.url && (
                  <a
                    href={selectedEarthquake.properties.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-cyan-400 hover:underline inline-flex items-center gap-1"
                  >
                    USGS Event <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 bg-[#101524] border border-slate-800 rounded-lg">
                <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-400" /> Magnitude
                </span>
                <div className="text-lg font-extrabold font-mono text-white mt-1">
                  M {(selectedEarthquake.properties.mag ?? 0).toFixed(1)}{' '}
                  <span className="text-[11px] font-normal text-cyan-400">
                    {selectedEarthquake.properties.magType || 'Mw'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-[#101524] border border-slate-800 rounded-lg">
                <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400" /> Focal Depth
                </span>
                <div className="text-lg font-extrabold font-mono text-cyan-300 mt-1">
                  {selectedEarthquake.geometry.coordinates[2].toFixed(1)}{' '}
                  <span className="text-xs font-normal text-slate-400">km</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#101524] border border-slate-800 rounded-lg">
                <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-400" /> Event Date
                </span>
                <div className="text-xs font-bold font-mono text-slate-200 mt-1.5">
                  {new Date(selectedEarthquake.properties.time).toISOString().slice(0, 10)}
                </div>
              </div>

              <div className="p-3.5 bg-[#101524] border border-slate-800 rounded-lg">
                <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" /> Origin Time (UTC)
                </span>
                <div className="text-xs font-bold font-mono text-slate-200 mt-1.5">
                  {new Date(selectedEarthquake.properties.time).toISOString().slice(11, 19)} UTC
                </div>
              </div>

              <div className="p-3.5 bg-[#101524] border border-slate-800 rounded-lg">
                <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" /> Coordinates
                </span>
                <div className="text-xs font-bold font-mono text-slate-200 mt-1.5">
                  {selectedEarthquake.geometry.coordinates[1].toFixed(4)}°,{' '}
                  {selectedEarthquake.geometry.coordinates[0].toFixed(4)}°
                </div>
              </div>

              <div className="p-3.5 bg-[#101524] border border-slate-800 rounded-lg">
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  USGS Event ID
                </span>
                <div className="text-xs font-bold font-mono text-cyan-300 mt-1.5 truncate">
                  {selectedEarthquake.id}
                </div>
              </div>
            </div>
          </section>

          {/* LOADING OR ERROR STATE */}
          {isLoadingReport && (
            <div className="bg-[#0b0e17] border border-cyan-500/30 rounded-xl p-10 text-center space-y-3">
              <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs animate-pulse">
                <Satellite className="w-4 h-4" />
                <span>
                  Querying NASA Earthdata CMR (NISAR &amp; OPERA/ARIA Sentinel-1), NASA GIBS, and
                  USGS Event Products for {selectedEarthquake.id}...
                </span>
              </div>
            </div>
          )}

          {reportError && !isLoadingReport && (
            <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{reportError}</span>
            </div>
          )}

          {impactReport && !isLoadingReport && (
            <>
              {/* SECTION B: SATELLITE OBSERVATIONS */}
              <section className="bg-[#0b0e17] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                      Section B · Verified Orbital &amp; Geophysical Data
                    </div>
                    <h2 className="text-xl font-bold text-slate-100 mt-1">
                      Satellite Observations
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Real granules intersecting the epicenter footprint (Prioritizing NASA-ISRO NISAR,
                      OPERA/ARIA Sentinel-1, NASA Worldview, and USGS products).
                    </p>
                  </div>

                  {/* Mission Filter Controls */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      ['ALL', 'NISAR', 'OPERA-S1 / ARIA', 'USGS', 'NASA Worldview (VIIRS)'] as const
                    ).map((m) => {
                      const count =
                        m === 'ALL'
                          ? impactReport.observations.length
                          : impactReport.observations.filter((o) => o.mission === m).length;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMissionFilter(m)}
                          className={`px-2.5 py-1.5 text-[11px] font-mono rounded-md border transition-colors ${
                            missionFilter === m
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {m === 'ALL' ? 'All Sources' : m} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live API Coverage Summary Strip */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                  {impactReport.apisQueried.map((api) => (
                    <span
                      key={api.name}
                      className={`px-2.5 py-1 rounded border ${
                        api.count > 0
                          ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {api.name}: {api.count} found
                    </span>
                  ))}
                </div>

                {/* Primary Scientific Measurements Audit Cards: USGS ShakeMap & Co-Seismic InSAR */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Card 1: Real USGS ShakeMap Verification */}
                  <div className="bg-[#0d121d] border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border bg-cyan-500/20 text-cyan-200 border-cyan-400/60 uppercase">
                          Scientific Measurement · USGS ShakeMap
                        </span>
                        {impactReport.shakemapObservation ? (
                          <span className="text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Published for {selectedEarthquake.id}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">Unavailable</span>
                        )}
                      </div>

                      {impactReport.shakemapObservation && impactReport.usgsProducts.shakemap ? (
                        <>
                          {(() => {
                            const sm = impactReport.usgsProducts.shakemap!;
                            const smUrl =
                              shakemapLayer === 'pga' && sm.pgaImageUrl
                                ? sm.pgaImageUrl
                                : shakemapLayer === 'pgv' && sm.pgvImageUrl
                                ? sm.pgvImageUrl
                                : sm.intensityImageUrl || impactReport.shakemapObservation!.imageUrl;
                            return (
                              <>
                                <div className="w-full h-52 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                                  <img
                                    src={smUrl}
                                    alt={`USGS ShakeMap ${shakemapLayer.toUpperCase()} for ${selectedEarthquake.id}`}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                                  <div className="flex items-center gap-1">
                                    {sm.intensityImageUrl && (
                                      <button
                                        type="button"
                                        onClick={() => setShakemapLayer('intensity')}
                                        className={`px-2 py-0.5 rounded border ${
                                          shakemapLayer === 'intensity'
                                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                                            : 'bg-slate-900 text-slate-300 border-slate-800'
                                        }`}
                                      >
                                        Intensity (MMI)
                                      </button>
                                    )}
                                    {sm.pgaImageUrl && (
                                      <button
                                        type="button"
                                        onClick={() => setShakemapLayer('pga')}
                                        className={`px-2 py-0.5 rounded border ${
                                          shakemapLayer === 'pga'
                                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                                            : 'bg-slate-900 text-slate-300 border-slate-800'
                                        }`}
                                      >
                                        PGA (%g)
                                      </button>
                                    )}
                                    {sm.pgvImageUrl && (
                                      <button
                                        type="button"
                                        onClick={() => setShakemapLayer('pgv')}
                                        className={`px-2 py-0.5 rounded border ${
                                          shakemapLayer === 'pgv'
                                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                                            : 'bg-slate-900 text-slate-300 border-slate-800'
                                        }`}
                                      >
                                        PGV (cm/s)
                                      </button>
                                    )}
                                  </div>
                                  <span className="text-cyan-300">
                                    Max MMI: {sm.maxMmi?.toFixed(1) ?? 'N/A'} · PGA: {sm.maxPgaPctG?.toFixed(2) ?? 'N/A'}% g
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                        </>
                      ) : (
                        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-lg text-xs text-slate-400 space-y-1.5">
                          <div className="text-slate-200 font-semibold">
                            No USGS ShakeMap Issued for {selectedEarthquake.id}
                          </div>
                          <p className="leading-relaxed">
                            USGS ShakeMap ground-shaking rasters are typically generated for M ≥ 3.5+ onshore earthquakes or well-instrumented networks. No simulated shaking map is substituted.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Co-Seismic / Post-Event Sentinel-1 & NISAR InSAR Verification */}
                  <div className="bg-[#0d121d] border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded border bg-cyan-500/20 text-cyan-200 border-cyan-400/60 uppercase">
                          Scientific Measurement · Co-Seismic InSAR
                        </span>
                        {impactReport.insarDeformationObservation ? (
                          <span className="text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Event-Spanning Dataset
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">Unavailable</span>
                        )}
                      </div>

                      {impactReport.insarDeformationObservation ? (
                        <>
                          <div className="w-full h-52 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                            <img
                              src={impactReport.insarDeformationObservation.imageUrl}
                              alt={impactReport.insarDeformationObservation.title}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                            <span className="text-cyan-300 truncate max-w-[70%]">
                              {impactReport.insarDeformationObservation.productType}
                            </span>
                            <a
                              href={impactReport.insarDeformationObservation.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                            >
                              ASF Granule <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-lg text-xs text-slate-400 space-y-1.5">
                          <div className="text-slate-200 font-semibold">
                            No Co-Seismic InSAR Deformation Dataset Available
                          </div>
                          <p className="leading-relaxed">
                            No co-seismic or post-event NISAR GUNW or Sentinel-1 OPERA DISP-S1 interferogram covering {selectedEarthquake.geometry.coordinates[1].toFixed(2)}°, {selectedEarthquake.geometry.coordinates[0].toFixed(2)}° on or after {new Date(selectedEarthquake.properties.time).toISOString().slice(0, 10)} is currently published.
                          </p>
                          {impactReport.archivedPreEventInsarCount > 0 && (
                            <p className="text-[11px] text-amber-300/90 font-mono pt-1">
                              Audit Note: {impactReport.archivedPreEventInsarCount} archived pre-event interferogram(s) from prior dates were excluded so historical acquisitions are never mistaken for earthquake deformation.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Observation Empty Handling OR Grid + Selector */}
                {impactReport.observations.length === 0 ? (
                  <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
                    <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>No verified satellite observations are currently available for this earthquake.</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-400 list-disc pl-5">
                      {impactReport.missingDataNotes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                ) : filteredObservations.length === 0 ? (
                  <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300">
                    No observations returned for <strong className="font-mono text-cyan-300">{missionFilter}</strong> over this footprint. Switch filter back to <strong>All Sources</strong> to view available datasets.
                  </div>
                ) : (
                  <>
                    {/* Satellite Observation Date / Product Selector */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 p-3 rounded-lg">
                      <label
                        htmlFor="obs-date-select"
                        className="text-xs font-mono text-slate-300 flex items-center gap-2 shrink-0"
                      >
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Observation Date &amp; Product Selector:</span>
                      </label>
                      <select
                        id="obs-date-select"
                        value={activeObservation?.id || ''}
                        onChange={(e) => setSelectedObsId(e.target.value)}
                        className="w-full sm:w-auto flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-400"
                      >
                        {filteredObservations.map((obs) => (
                          <option key={obs.id} value={obs.id}>
                            {`${obs.acquisitionStart.slice(0, 10)} · [${obs.mission}] · ${obs.productType} (${obs.timingLabel})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Active Spotlight Observation Card */}
                    {activeObservation && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0d121d] border border-cyan-500/30 rounded-xl p-5">
                        {/* Image Panel */}
                        <div className="lg:col-span-6 space-y-3">
                          <div className="relative w-full aspect-[4/3] bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                            {failedImages[activeObservation.id] ? (
                              <div className="p-6 text-center space-y-2 text-xs text-slate-400">
                                <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto" />
                                <p>
                                  Browse preview image could not be loaded directly in-browser from{' '}
                                  {activeObservation.sourceName}.
                                </p>
                                <a
                                  href={activeObservation.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-mono"
                                >
                                  Open Original Product at Source <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            ) : (
                              <img
                                src={activeObservation.imageUrl}
                                alt={`${activeObservation.satellite} - ${activeObservation.productType}`}
                                className="w-full h-full object-contain"
                                onError={() =>
                                  setFailedImages((prev) => ({
                                    ...prev,
                                    [activeObservation.id]: true,
                                  }))
                                }
                              />
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenZoomModal(activeObservation)}
                              className="px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/50 text-cyan-300 text-xs font-mono rounded-md transition-colors inline-flex items-center gap-1.5"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                              <span>Interactive Zoom &amp; Pan</span>
                            </button>

                            <a
                              href={activeObservation.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-mono text-cyan-400 hover:underline inline-flex items-center gap-1"
                            >
                              Direct Source Link <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        {/* Metadata & Provenance Table */}
                        <div className="lg:col-span-6 space-y-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                                MISSION_BADGE_STYLES[activeObservation.mission]
                              }`}
                            >
                              {activeObservation.mission}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                                CATEGORY_BADGE_STYLES[activeObservation.category]
                              }`}
                            >
                              {activeObservation.category}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded border ${
                                TIMING_BADGE_STYLES[activeObservation.timing]
                              }`}
                            >
                              {activeObservation.timingLabel}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-base font-bold text-slate-100 break-all">
                              {activeObservation.title}
                            </h3>
                            <p className="text-xs text-cyan-300 font-mono mt-0.5">
                              {activeObservation.productType}
                            </p>
                          </div>

                          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded">
                              <dt className="text-[10px] font-mono text-slate-400 uppercase">
                                Satellite &amp; Instrument
                              </dt>
                              <dd className="text-slate-200 font-medium mt-0.5">
                                {activeObservation.satellite} · {activeObservation.instrument}
                              </dd>
                            </div>

                            <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded">
                              <dt className="text-[10px] font-mono text-slate-400 uppercase">
                                Acquisition Date
                              </dt>
                              <dd className="text-slate-200 font-mono mt-0.5">
                                {activeObservation.acquisitionStart.slice(0, 19).replace('T', ' ')} UTC
                                {activeObservation.acquisitionEnd &&
                                  activeObservation.acquisitionEnd !== activeObservation.acquisitionStart &&
                                  ` → ${activeObservation.acquisitionEnd.slice(0, 10)}`}
                              </dd>
                            </div>

                            <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded">
                              <dt className="text-[10px] font-mono text-slate-400 uppercase">
                                Geographic Coverage
                              </dt>
                              <dd className="text-slate-200 font-mono text-[11px] mt-0.5">
                                {activeObservation.geographicCoverage}
                              </dd>
                            </div>

                            <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded">
                              <dt className="text-[10px] font-mono text-slate-400 uppercase">
                                Original Data Source
                              </dt>
                              <dd className="text-slate-200 mt-0.5">
                                {activeObservation.sourceName}
                              </dd>
                            </div>
                          </dl>

                          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed">
                            <strong className="font-mono text-cyan-400 text-[11px] block mb-1 uppercase">
                              Measurement Methodology
                            </strong>
                            {activeObservation.methodology}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* All Available Observation Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredObservations.map((obs) => {
                        const isSelected = activeObservation?.id === obs.id;
                        return (
                          <div
                            key={obs.id}
                            onClick={() => setSelectedObsId(obs.id)}
                            className={`rounded-xl border p-3.5 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                              isSelected
                                ? 'bg-slate-900/90 border-cyan-400/70 shadow-lg'
                                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="space-y-2.5">
                              <div className="flex flex-wrap items-center justify-between gap-1.5">
                                <div className="flex flex-wrap items-center gap-1">
                                  <span
                                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                                      MISSION_BADGE_STYLES[obs.mission]
                                    }`}
                                  >
                                    {obs.mission}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded border ${
                                      CATEGORY_BADGE_STYLES[obs.category]
                                    }`}
                                  >
                                    {obs.category}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {obs.acquisitionStart.slice(0, 10)}
                                </span>
                              </div>

                              <div className="w-full h-36 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                                {failedImages[obs.id] ? (
                                  <span className="text-[11px] font-mono text-slate-500 px-3 text-center">
                                    Preview unavailable in-frame · See direct source
                                  </span>
                                ) : (
                                  <img
                                    src={obs.imageUrl}
                                    alt={obs.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                    onError={() =>
                                      setFailedImages((prev) => ({ ...prev, [obs.id]: true }))
                                    }
                                  />
                                )}
                              </div>

                              <div>
                                <div className="text-xs font-bold text-slate-100 line-clamp-1">
                                  {obs.productType}
                                </div>
                                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                  {obs.satellite} · {obs.timingLabel}
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                              <span className="text-cyan-400">
                                {isSelected ? 'Active View' : 'Select Scene'}
                              </span>
                              <a
                                href={obs.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-400 hover:text-cyan-300 inline-flex items-center gap-1"
                              >
                                Source <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Geospatial Satellite Footprint & Layer Visibility Overlay */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                        <span>Geospatial Satellite Footprint &amp; Layer Overlay</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Verify that NASA NISAR swaths, Sentinel-1 OPERA bursts, and USGS ShakeMap /
                        Ground-Failure bounds geometrically overlap the selected epicenter.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                      {(['satellite', 'street', 'terrain'] as const).map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setFootprintBaseMap(style)}
                          className={`px-2.5 py-1 rounded border capitalize ${
                            footprintBaseMap === style
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Layer Visibility Controls + Scientific Legend */}
                    <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-4">
                      <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                        Layer Visibility Controls
                      </div>

                      <div className="space-y-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setShowNisarLayer((v) => !v)}
                          className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-cyan-500/40"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm bg-cyan-400/50 border border-cyan-400" />
                            <span>NASA-ISRO NISAR Swaths</span>
                          </span>
                          {showNisarLayer ? (
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowOperaLayer((v) => !v)}
                          className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-sky-500/40"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm bg-sky-400/40 border border-sky-400" />
                            <span>OPERA / ARIA Sentinel-1 Bursts</span>
                          </span>
                          {showOperaLayer ? (
                            <Eye className="w-3.5 h-3.5 text-sky-400" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowUsgsLayer((v) => !v)}
                          className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-amber-500/40"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm border border-dashed border-amber-400" />
                            <span>USGS ShakeMap &amp; Ground Failure</span>
                          </span>
                          {showUsgsLayer ? (
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowEpicenterLayer((v) => !v)}
                          className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-rose-500/40"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#e63946] border border-white" />
                            <span>Event Epicenter ({selectedEarthquake.id})</span>
                          </span>
                          {showEpicenterLayer ? (
                            <Eye className="w-3.5 h-3.5 text-rose-400" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                      </div>

                      {/* Scientific Map Legend */}
                      <div className="pt-3 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-400">
                        <div className="font-mono uppercase text-[10px] text-slate-300 font-semibold">
                          Scientific Legend
                        </div>
                        <p>· Solid cyan polygon: NISAR L-band GUNW interferogram swath.</p>
                        <p>· Dashed cyan polygon: NISAR L2 GCOV polarimetric backscatter.</p>
                        <p>· Sky blue polygon: OPERA / Sentinel-1 burst extent.</p>
                        <p>· Amber / Red dashed box: USGS ShakeMap &amp; Landslide hazard model extent.</p>
                      </div>
                    </div>

                    {/* Leaflet Swath Map */}
                    <div
                      ref={footprintMapRef}
                      className="lg:col-span-8 h-80 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden z-0"
                    />
                  </div>
                </div>
              </section>

              {/* SECTION C: EARTH SURFACE IMPACT */}
              <section className="bg-[#0b0e17] border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
                <div className="border-b border-slate-800 pb-4">
                  <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                    Section C · Physical Ground Effects
                  </div>
                  <h2 className="text-xl font-bold text-slate-100 mt-1">
                    Earth Surface Impact
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Metrics are strictly grounded in published NASA CMR and USGS products for{' '}
                    <span className="font-mono text-slate-200">{selectedEarthquake.id}</span>.
                    Unavailable measurements are explicitly marked.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {impactReport.surfaceImpacts.map((metric) => {
                    const statusStyle =
                      metric.status === 'measured'
                        ? 'border-cyan-500/40 bg-cyan-950/15'
                        : metric.status === 'indicator'
                        ? 'border-amber-500/40 bg-amber-950/15'
                        : 'border-slate-800 bg-slate-900/40';
                    const badgeStyle =
                      metric.status === 'measured'
                        ? 'text-cyan-300 bg-cyan-950/80 border-cyan-600/50'
                        : metric.status === 'indicator'
                        ? 'text-amber-300 bg-amber-950/80 border-amber-600/50'
                        : 'text-slate-400 bg-slate-900 border-slate-700';

                    return (
                      <div
                        key={metric.key}
                        className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${statusStyle}`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-bold text-slate-100">{metric.title}</h3>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded border ${badgeStyle}`}
                            >
                              {metric.status === 'measured'
                                ? 'Direct Data'
                                : metric.status === 'indicator'
                                ? 'Model Indicator'
                                : 'Unavailable'}
                            </span>
                          </div>

                          <div className="text-sm font-mono font-bold text-white">
                            {metric.summaryValue}
                          </div>
                          {metric.unit && (
                            <div className="text-[11px] font-mono text-cyan-400">
                              Unit: {metric.unit}
                            </div>
                          )}
                          <p className="text-xs text-slate-300 leading-relaxed">{metric.details}</p>
                        </div>

                        <div className="pt-2.5 border-t border-slate-800/80 text-[11px] space-y-1 text-slate-400">
                          <div>
                            <strong className="text-slate-300">Methodology:</strong> {metric.methodology}
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1 font-mono">
                            <span>
                              {metric.source}
                              {metric.observationDate ? ` · ${metric.observationDate}` : ''}
                            </span>
                            {metric.sourceUrl && (
                              <a
                                href={metric.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-400 hover:underline inline-flex items-center gap-1 shrink-0"
                              >
                                Source <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* SECTION D: SCIENTIFIC EXPLANATION & DATA PROCESSING */}
              <section className="bg-[#0b0e17] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                    Section D · Epistemic Honesty &amp; SAR Physics
                  </div>
                  <h2 className="text-xl font-bold text-slate-100 mt-1">
                    Scientific Explanation
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Clear separation of direct measurements, satellite-derived indicators, physical
                    interpretations, and missing evidence. Correlation is never presented as causation.
                  </p>
                </div>

                {/* Four-Quadrant Epistemic Distinction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-900/70 border border-cyan-500/30 rounded-xl space-y-2">
                    <div className="font-mono text-cyan-300 font-bold uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Direct Measurements</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-300 list-disc pl-4">
                      {impactReport.scientificExplanation.directMeasurements.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-900/70 border border-amber-500/30 rounded-xl space-y-2">
                    <div className="font-mono text-amber-300 font-bold uppercase flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Satellite-Derived Indicators (Not Confirmed Damage)</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-300 list-disc pl-4">
                      {impactReport.scientificExplanation.satelliteIndicators.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
                    <div className="font-mono text-slate-200 font-bold uppercase flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-cyan-400" />
                      <span>Scientific Interpretations</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-300 list-disc pl-4">
                      {impactReport.scientificExplanation.interpretations.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2">
                    <div className="font-mono text-rose-300 font-bold uppercase flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>Unknown or Unavailable Information</span>
                    </div>
                    {impactReport.scientificExplanation.unknowns.length === 0 ? (
                      <p className="text-slate-300">
                        All primary USGS and post-event satellite observation windows are populated.
                      </p>
                    ) : (
                      <ul className="space-y-1.5 text-slate-300 list-disc pl-4">
                        {impactReport.scientificExplanation.unknowns.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Data Processing & Methodology Taxonomy (Requirement 6) */}
                <div className="p-4 bg-[#0e1320] border border-slate-800 rounded-xl space-y-3 text-xs">
                  <div className="font-mono text-xs text-cyan-400 uppercase font-bold">
                    Understanding SAR Imagery vs. InSAR Displacement vs. Damage Proxy Maps
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
                      <strong className="text-slate-100 block font-mono">1. SAR Imagery (GCOV / RTC)</strong>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Measures microwave radar backscatter brightness. Reveals surface roughness and
                        land-cover structure regardless of clouds or darkness, but amplitude pixels alone
                        cannot directly measure centimeter-level ground displacement.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
                      <strong className="text-slate-100 block font-mono">2. InSAR Measurements (GUNW / DISP)</strong>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Computes microwave phase differences between compatible Single Look Complex (SLC)
                        orbits calibrated with a DEM. Geo Depth uses analysis-ready NASA/JPL OPERA &amp;
                        NISAR GUNW products rather than inventing raw pixel calculations.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
                      <strong className="text-slate-100 block font-mono">3. Damage Proxy Maps (Coherence Loss)</strong>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Measures drops in radar wave coherence before and after an event. Coherence loss
                        highlights likely building collapse, landslides, or flooding — always treated as an
                        indicator until field-verified.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </>
      )}

      {/* Interactive Zoom & Pan Inspection Modal */}
      {zoomedObservation && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-[#0b0e17] border border-slate-700 rounded-xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-cyan-400 uppercase">
                  {zoomedObservation.mission} · {zoomedObservation.acquisitionStart.slice(0, 10)}
                </div>
                <h3 className="text-sm font-bold text-slate-100 truncate">
                  {zoomedObservation.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(1, +(z - 0.5).toFixed(1)))}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                  aria-label="Zoom out image"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-cyan-300 w-12 text-center">
                  {zoomLevel.toFixed(1)}x
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(5, +(z + 0.5).toFixed(1)))}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                  aria-label="Zoom in image"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoomLevel(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200"
                  aria-label="Reset zoom and pan"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomedObservation(null)}
                  className="p-1.5 bg-slate-800 hover:bg-rose-900 rounded text-slate-200 ml-2"
                  aria-label="Close zoom inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className="relative flex-1 min-h-[420px] bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center"
              onMouseDown={(e) => {
                setIsDraggingPan(true);
                dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
              }}
              onMouseMove={(e) => {
                if (!isDraggingPan) return;
                setPanOffset({
                  x: e.clientX - dragStartRef.current.x,
                  y: e.clientY - dragStartRef.current.y,
                });
              }}
              onMouseUp={() => setIsDraggingPan(false)}
              onMouseLeave={() => setIsDraggingPan(false)}
            >
              <img
                src={zoomedObservation.imageUrl}
                alt={zoomedObservation.title}
                draggable={false}
                className="max-w-full max-h-[70vh] object-contain transition-transform duration-75"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                }}
              />
            </div>

            <div className="p-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
              <span>Drag to pan when zoomed · Coverage: {zoomedObservation.geographicCoverage}</span>
              <a
                href={zoomedObservation.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline inline-flex items-center gap-1"
              >
                {zoomedObservation.sourceName} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

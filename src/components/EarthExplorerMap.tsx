import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sliders,
  Radio,
  Eye,
  EyeOff,
  MapPin,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  Clock,
  Compass
} from 'lucide-react';
import { EarthquakeFeature, InSARCaseStudy } from '../types/earthquake.ts';
import { INSAR_CASE_STUDIES } from '../data/insarStudies.ts';

export type BaseMapStyle = 'dark' | 'satellite' | 'topo' | 'streets';

interface EarthExplorerMapProps {
  earthquakes: EarthquakeFeature[];
  totalLoadedCount: number;
  isLoading: boolean;
  onSelectEarthquake: (eq: EarthquakeFeature) => void;
  selectedEarthquake: EarthquakeFeature | null;
}

export const EarthExplorerMap: React.FC<EarthExplorerMapProps> = ({
  earthquakes,
  totalLoadedCount,
  isLoading,
  onSelectEarthquake,
  selectedEarthquake
}) => {
  // Map State
  const [baseMap, setBaseMap] = useState<BaseMapStyle>('dark');
  const [showEarthquakes, setShowEarthquakes] = useState(true);
  const [showInSAR, setShowInSAR] = useState(true);
  const [minMag, setMinMag] = useState<number>(0);
  const [selectedInSAR, setSelectedInSAR] = useState<InSARCaseStudy | null>(null);

  // Viewport State: center (lat, lng), zoom level
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 20, lng: 0 });
  const [zoom, setZoom] = useState<number>(2.0);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [hoveredEq, setHoveredEq] = useState<EarthquakeFeature | null>(null);

  // Panel Collapsing
  const [layersPanelOpen, setLayersPanelOpen] = useState(true);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; lat: number; lng: number }>({
    x: 0,
    y: 0,
    lat: 0,
    lng: 0,
  });

  // Filtered Earthquakes
  const visibleEarthquakes = useMemo(() => {
    if (!showEarthquakes) return [];
    return earthquakes.filter((eq) => (eq.properties.mag ?? 0) >= minMag);
  }, [earthquakes, minMag, showEarthquakes]);

  // Coordinate Conversion (Web Mercator projection to canvas pixels)
  const project = useCallback(
    (lat: number, lng: number, width: number, height: number) => {
      // Clamp lat to Web Mercator limits (-85 to 85)
      const clampedLat = Math.max(-85, Math.min(85, lat));
      const latRad = (clampedLat * Math.PI) / 180;
      const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));

      const centerClampedLat = Math.max(-85, Math.min(85, center.lat));
      const centerLatRad = (centerClampedLat * Math.PI) / 180;
      const centerMercN = Math.log(Math.tan(Math.PI / 4 + centerLatRad / 2));

      // Scaling based on zoom
      const scale = (256 * Math.pow(2, zoom)) / (2 * Math.PI);

      let dLng = lng - center.lng;
      // Handle date line wrapping
      while (dLng > 180) dLng -= 360;
      while (dLng < -180) dLng += 360;

      const x = width / 2 + dLng * (Math.PI / 180) * scale;
      const y = height / 2 - (mercN - centerMercN) * scale;

      return { x, y };
    },
    [center, zoom]
  );

  const unproject = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const scale = (256 * Math.pow(2, zoom)) / (2 * Math.PI);
      const centerClampedLat = Math.max(-85, Math.min(85, center.lat));
      const centerLatRad = (centerClampedLat * Math.PI) / 180;
      const centerMercN = Math.log(Math.tan(Math.PI / 4 + centerLatRad / 2));

      const dLngRad = (x - width / 2) / scale;
      let lng = center.lng + (dLngRad * 180) / Math.PI;
      while (lng > 180) lng -= 360;
      while (lng < -180) lng += 360;

      const mercN = centerMercN - (y - height / 2) / scale;
      const latRad = 2 * (Math.atan(Math.exp(mercN)) - Math.PI / 4);
      const lat = (latRad * 180) / Math.PI;

      return {
        lat: Math.max(-85, Math.min(85, lat)),
        lng,
      };
    },
    [center, zoom]
  );

  // Render Loop on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Background based on Base Map Type
      if (baseMap === 'dark') {
        ctx.fillStyle = '#07090e';
        ctx.fillRect(0, 0, width, height);

        // Grid lines (Parallels and Meridians)
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
        ctx.lineWidth = 1;
        for (let lat = -80; lat <= 80; lat += 20) {
          const p1 = project(lat, -180, width, height);
          const p2 = project(lat, 180, width, height);
          ctx.beginPath();
          ctx.moveTo(0, p1.y);
          ctx.lineTo(width, p1.y);
          ctx.stroke();
        }
        for (let lng = -180; lng <= 180; lng += 30) {
          const p = project(0, lng, width, height);
          ctx.beginPath();
          ctx.moveTo(p.x, 0);
          ctx.lineTo(p.x, height);
          ctx.stroke();
        }
      } else if (baseMap === 'satellite') {
        // Deep space oceanic satellite tones
        ctx.fillStyle = '#050c18';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(14, 165, 233, 0.15)';
        ctx.lineWidth = 1;
        for (let lat = -80; lat <= 80; lat += 30) {
          const p = project(lat, 0, width, height);
          ctx.beginPath();
          ctx.moveTo(0, p.y);
          ctx.lineTo(width, p.y);
          ctx.stroke();
        }
      } else if (baseMap === 'topo') {
        ctx.fillStyle = '#0a1017';
        ctx.fillRect(0, 0, width, height);
        // Topo elevation contour simulation
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
        ctx.lineWidth = 1;
        for (let lat = -70; lat <= 70; lat += 15) {
          const p = project(lat, 0, width, height);
          ctx.beginPath();
          ctx.moveTo(0, p.y);
          ctx.lineTo(width, p.y);
          ctx.stroke();
        }
      } else {
        // Street
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
      }

      // Draw Continents Silhouette for global orientation
      drawContinentalOutlines(ctx, width, height, project, baseMap);

      // 2. Draw InSAR Case Study Areas if enabled
      if (showInSAR) {
        INSAR_CASE_STUDIES.forEach((study) => {
          const { x, y } = project(study.coordinates.lat, study.coordinates.lng, width, height);

          // Outer radar aperture radar sweep ring
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, 22, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();

          // Core radar focal point
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = '#06b6d4';
          ctx.fill();

          // Label
          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillText(`InSAR: ${study.name.split(' ')[1] || 'Study'}`, x + 10, y - 8);
          ctx.restore();
        });
      }

      // 3. Draw Earthquakes Layer
      if (showEarthquakes && visibleEarthquakes.length > 0) {
        visibleEarthquakes.forEach((eq) => {
          const [lng, lat] = eq.geometry.coordinates;
          const { x, y } = project(lat, lng, width, height);

          // Skip if off canvas bounds
          if (x < -20 || x > width + 20 || y < -20 || y > height + 20) return;

          const mag = eq.properties.mag ?? 0;
          // Radius based on magnitude
          const radius = Math.max(3, Math.min(18, (mag - 1.5) * 2.8 + 3));

          // Color based on magnitude
          let fill = 'rgba(56, 189, 248, 0.7)'; // Cyan < 3.0
          let stroke = 'rgba(56, 189, 248, 0.9)';
          if (mag >= 7.0) {
            fill = 'rgba(244, 63, 94, 0.85)'; // Red M7.0+
            stroke = '#fda4af';
          } else if (mag >= 6.0) {
            fill = 'rgba(251, 146, 60, 0.8)'; // Orange M6.0+
            stroke = '#fed7aa';
          } else if (mag >= 4.5) {
            fill = 'rgba(250, 204, 21, 0.75)'; // Yellow M4.5+
            stroke = '#fef08a';
          } else if (mag >= 3.0) {
            fill = 'rgba(52, 211, 153, 0.7)'; // Emerald M3.0+
            stroke = '#a7f3d0';
          }

          const isSelected = selectedEarthquake?.id === eq.id;
          const isHovered = hoveredEq?.id === eq.id;

          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = fill;
          ctx.fill();
          ctx.strokeStyle = isSelected ? '#ffffff' : stroke;
          ctx.lineWidth = isSelected ? 3 : isHovered ? 2 : 1;
          ctx.stroke();

          if (isSelected || isHovered) {
            // Pulse ring
            ctx.beginPath();
            ctx.arc(x, y, radius + 5, 0, 2 * Math.PI);
            ctx.strokeStyle = isSelected ? 'rgba(255, 255, 255, 0.8)' : 'rgba(6, 182, 212, 0.8)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          ctx.restore();
        });
      }
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    baseMap,
    center,
    zoom,
    showEarthquakes,
    showInSAR,
    visibleEarthquakes,
    project,
    selectedEarthquake,
    hoveredEq,
  ]);

  // Resize canvas to container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Interactions (Pan & Zoom)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // only left click
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      lat: center.lat,
      lng: center.lng,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update coordinate readout
    const geo = unproject(x, y, canvas.width, canvas.height);
    setMouseCoords(geo);

    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const scale = (256 * Math.pow(2, zoom)) / (2 * Math.PI);

      const dLng = -(dx / scale) * (180 / Math.PI);
      const dLat = (dy / scale) * (180 / Math.PI);

      setCenter({
        lat: Math.max(-85, Math.min(85, dragStartRef.current.lat + dLat)),
        lng: (dragStartRef.current.lng + dLng + 180) % 360 - 180,
      });
    } else {
      // Check hover on markers
      let found: EarthquakeFeature | null = null;
      for (const eq of visibleEarthquakes) {
        const [eLng, eLat] = eq.geometry.coordinates;
        const p = project(eLat, eLng, canvas.width, canvas.height);
        const dist = Math.hypot(p.x - x, p.y - y);
        const mag = eq.properties.mag ?? 0;
        const radius = Math.max(4, Math.min(18, (mag - 1.5) * 2.8 + 3));
        if (dist <= radius + 3) {
          found = eq;
          break;
        }
      }
      setHoveredEq(found);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = Math.abs(e.clientX - dragStartRef.current.x);
    const dy = Math.abs(e.clientY - dragStartRef.current.y);

    isDraggingRef.current = false;

    // If small movement, treat as click
    if (dx < 4 && dy < 4) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check click on InSAR case study
      let insarFound: InSARCaseStudy | null = null;
      for (const study of INSAR_CASE_STUDIES) {
        const p = project(study.coordinates.lat, study.coordinates.lng, canvas.width, canvas.height);
        if (Math.hypot(p.x - x, p.y - y) <= 24) {
          insarFound = study;
          break;
        }
      }

      if (insarFound) {
        setSelectedInSAR(insarFound);
        return;
      }

      // Check click on Earthquake
      let clickedEq: EarthquakeFeature | null = null;
      for (const eq of visibleEarthquakes) {
        const [eLng, eLat] = eq.geometry.coordinates;
        const p = project(eLat, eLng, canvas.width, canvas.height);
        const mag = eq.properties.mag ?? 0;
        const radius = Math.max(4, Math.min(18, (mag - 1.5) * 2.8 + 3));
        if (Math.hypot(p.x - x, p.y - y) <= radius + 5) {
          clickedEq = eq;
          break;
        }
      }

      if (clickedEq) {
        onSelectEarthquake(clickedEq);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    setZoom((prev) => Math.max(1.0, Math.min(8.0, prev + delta)));
  };

  const handleResetView = () => {
    setCenter({ lat: 20, lng: 0 });
    setZoom(2.0);
    setMinMag(0);
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-[#07090e] overflow-hidden select-none flex flex-col">
      {/* Map Stage */}
      <div ref={containerRef} className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="absolute inset-0 w-full h-full block"
        />

        {/* Top Control Bar: Layer & Filter Trigger + Quick Status */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setLayersPanelOpen(!layersPanelOpen)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-2 shadow-lg ${
              layersPanelOpen
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Map Layers & Filter</span>
          </button>

          {/* Quick Counter Display */}
          <div className="px-3 py-2 rounded-lg bg-slate-950/85 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2 shadow-lg backdrop-blur-sm">
            <span className="text-slate-400">Earthquakes:</span>
            <span className="text-cyan-400 font-bold">{visibleEarthquakes.length}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-300">{totalLoadedCount}</span>
            {minMag > 0 && (
              <span className="text-amber-400 text-[11px] ml-1">
                (M ≥ {minMag.toFixed(1)})
              </span>
            )}
            {isLoading && (
              <span className="text-[11px] text-cyan-400 animate-pulse ml-1">Loading...</span>
            )}
          </div>
        </div>

        {/* Floating Zoom & Pan Reset Controls (Top Right) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 shadow-lg">
          <button
            onClick={() => setZoom((z) => Math.min(8.0, z + 0.5))}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-md transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(1.0, z - 0.5))}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-md transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-md transition-colors"
            title="Reset Global View"
            aria-label="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Hover Tooltip */}
        {hoveredEq && !isDraggingRef.current && (
          <div
            className="absolute z-30 pointer-events-none p-3 bg-slate-950/95 border border-slate-700 rounded-lg shadow-xl text-xs space-y-1 font-mono max-w-xs"
            style={{
              left: `${project(hoveredEq.geometry.coordinates[1], hoveredEq.geometry.coordinates[0], canvasRef.current?.width || 0, canvasRef.current?.height || 0).x + 15}px`,
              top: `${project(hoveredEq.geometry.coordinates[1], hoveredEq.geometry.coordinates[0], canvasRef.current?.width || 0, canvasRef.current?.height || 0).y - 20}px`,
            }}
          >
            <div className="flex items-center justify-between gap-3 text-cyan-400 font-bold">
              <span>M {hoveredEq.properties.mag?.toFixed(1) ?? 'N/A'}</span>
              <span className="text-slate-400 font-normal">
                {hoveredEq.geometry.coordinates[2].toFixed(1)} km depth
              </span>
            </div>
            <div className="text-slate-200 font-sans font-medium line-clamp-1">
              {hoveredEq.properties.place}
            </div>
            <div className="text-[11px] text-slate-400">
              {new Date(hoveredEq.properties.time).toLocaleDateString()} ·{' '}
              {new Date(hoveredEq.properties.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-[10px] text-cyan-300/80 pt-1 border-t border-slate-800">
              Click marker for detailed scientific analysis
            </div>
          </div>
        )}

        {/* Layers and Filter Control Panel (Left Overlay) */}
        {layersPanelOpen && (
          <div className="absolute top-16 left-4 z-20 w-80 bg-[#0b0e17]/95 border border-slate-800 rounded-xl p-4 shadow-2xl backdrop-blur-md space-y-5 max-h-[calc(100vh-7rem)] overflow-y-auto">
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

            {/* Base Map Type */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                Base Map Type
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
                {(
                  [
                    { id: 'dark', label: 'Dark Canvas' },
                    { id: 'satellite', label: 'Satellite' },
                    { id: 'topo', label: 'Topographic' },
                    { id: 'streets', label: 'Night Street' },
                  ] as const
                ).map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setBaseMap(style.id)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors text-left ${
                      baseMap === style.id
                        ? 'bg-cyan-500 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
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
                Live USGS global seismicity feed. Markers scaled by Moment Magnitude (Mw).
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
                  Reset Magnitude Filter (Show All)
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
                Peer-reviewed radar deformation studies (Türkiye 2023, Morocco 2023, Ridgecrest 2019).
              </p>
              <div className="space-y-1 pt-1">
                {INSAR_CASE_STUDIES.map((study) => (
                  <button
                    key={study.id}
                    onClick={() => {
                      setSelectedInSAR(study);
                      setCenter({ lat: study.coordinates.lat, lng: study.coordinates.lng });
                      setZoom(4.5);
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
              <div className="text-[10px] uppercase text-slate-400">Magnitude Scale</div>
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

        {/* InSAR Case Study Modal/Drawer Overlay */}
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

        {/* Bottom Coordinates & Scale Status Bar */}
        <div className="absolute bottom-2 left-4 z-10 flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded border border-slate-800">
          <div className="flex items-center gap-1 text-slate-300">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {mouseCoords
                ? `${mouseCoords.lat.toFixed(2)}° ${mouseCoords.lat >= 0 ? 'N' : 'S'}, ${mouseCoords.lng.toFixed(2)}° ${mouseCoords.lng >= 0 ? 'E' : 'W'}`
                : `${center.lat.toFixed(2)}° N, ${center.lng.toFixed(2)}° E`}
            </span>
          </div>
          <span>·</span>
          <span>Zoom: {zoom.toFixed(1)}x</span>
          <span>·</span>
          <span className="text-slate-400">USGS Live Telemetry</span>
        </div>
      </div>
    </div>
  );
};

// Procedural Continental Outlines (Approximate coastlines for world map orientation)
function drawContinentalOutlines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  project: (lat: number, lng: number, w: number, h: number) => { x: number; y: number },
  style: BaseMapStyle
) {
  // Simplified world land polygons [ [lat, lng], ... ]
  const continents: [number, number][][] = [
    // North America
    [
      [70, -160], [72, -130], [60, -90], [50, -55], [45, -65], [30, -80], [25, -80],
      [20, -105], [32, -117], [48, -125], [60, -140], [65, -168], [70, -160]
    ],
    // South America
    [
      [12, -75], [5, -52], [-10, -35], [-23, -42], [-40, -60], [-55, -67], [-45, -75],
      [-20, -70], [-5, -80], [8, -78], [12, -75]
    ],
    // Eurasia
    [
      [71, 28], [77, 105], [65, 170], [55, 135], [38, 120], [22, 114], [10, 105],
      [25, 80], [25, 60], [30, 35], [42, 28], [55, 12], [60, 5], [71, 28]
    ],
    // Africa
    [
      [36, -5], [37, 10], [32, 32], [12, 45], [-12, 40], [-34, 18], [-15, 12],
      [5, 8], [5, -1], [15, -17], [28, -13], [36, -5]
    ],
    // Australia
    [
      [-12, 132], [-15, 145], [-28, 153], [-38, 145], [-35, 115], [-20, 114], [-12, 132]
    ]
  ];

  ctx.save();
  continents.forEach((poly) => {
    ctx.beginPath();
    poly.forEach(([lat, lng], idx) => {
      const p = project(lat, lng, width, height);
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();

    if (style === 'dark') {
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (style === 'satellite') {
      ctx.fillStyle = '#0c1b2f';
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (style === 'topo') {
      ctx.fillStyle = '#17202c';
      ctx.fill();
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
  ctx.restore();
}

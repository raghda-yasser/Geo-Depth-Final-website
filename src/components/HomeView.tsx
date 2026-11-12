import React from 'react';
import {
  Compass,
  Radio,
  Activity,
  Shield,
  ArrowRight,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Users
} from 'lucide-react';
import { EarthquakeFeature } from '../types/earthquake.ts';
import { ActiveTab } from './Navbar.tsx';

interface HomeViewProps {
  recentEarthquakes: EarthquakeFeature[];
  totalCount: number;
  onNavigate: (tab: ActiveTab) => void;
  onSelectEarthquake: (eq: EarthquakeFeature) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  recentEarthquakes,
  totalCount,
  onNavigate,
  onSelectEarthquake,
}) => {
  // Show 4-5 real recent earthquakes
  const displayRecent = recentEarthquakes.slice(0, 5);

  const getMagClass = (m: number) => {
    if (m >= 7.0) return 'text-rose-400 bg-rose-950/60 border-rose-800';
    if (m >= 6.0) return 'text-orange-400 bg-orange-950/60 border-orange-800';
    if (m >= 4.5) return 'text-yellow-300 bg-yellow-950/60 border-yellow-800';
    if (m >= 3.0) return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
    return 'text-cyan-400 bg-cyan-950/60 border-cyan-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-16">
      {/* SECTION A: HERO SECTION */}
      <section className="relative pt-6 pb-4 border-b border-slate-800/80 space-y-6">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Earth Science · Satellite Geodesy · Public Safety</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight leading-none font-mono">
            GEO<span className="text-cyan-400">DEPTH</span>
          </h1>

          <p className="text-lg sm:text-xl font-semibold text-slate-200 tracking-tight">
            Understand Earthquakes. Discover Their Impact. Stay Safe.
          </p>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            Explore real earthquakes, discover how satellites observe changes on Earth, understand
            how disasters affect people, and learn how to stay safe.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('earth-explorer')}
              className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-cyan-950/50"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Earthquakes</span>
              {totalCount > 0 && (
                <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 bg-cyan-950 text-cyan-300 rounded ml-1">
                  {totalCount} Live
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('satellite-explorer')}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg font-medium text-xs transition-colors flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Learn How Satellites Work</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION B: RECENT REAL EARTHQUAKES */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-100 font-mono tracking-wide uppercase">
              Recent Earthquakes
            </h2>
            <p className="text-xs text-slate-400">
              Latest verified global events from the USGS National Earthquake Information Center.
            </p>
          </div>

          <button
            onClick={() => onNavigate('earthquakes')}
            className="text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            <span>View All Earthquakes</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Real Event Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {displayRecent.map((eq) => {
            const mag = eq.properties.mag ?? 0;
            const depth = eq.geometry.coordinates[2] ?? 0;
            const dateStr = new Date(eq.properties.time).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            });
            const timeStr = new Date(eq.properties.time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={eq.id}
                onClick={() => onSelectEarthquake(eq)}
                className="p-4 bg-[#0b0e17] hover:bg-[#0e1320] border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-colors space-y-3 flex flex-col justify-between group shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center justify-center px-2 py-0.5 rounded font-mono font-bold text-xs border ${getMagClass(
                        mag
                      )}`}
                    >
                      M {mag.toFixed(1)}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {depth.toFixed(0)} km
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-200 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                    {eq.properties.place || 'Unknown Location'}
                  </h3>
                </div>

                <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-900 flex items-center justify-between">
                  <span>{dateStr}</span>
                  <span>{timeStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION C: HOW GEO DEPTH WORKS */}
      <section className="bg-[#0b0e17] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-slate-100 font-mono tracking-wide uppercase">
            How GEO DEPTH Works
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Connecting earth science, satellite observations, and humanitarian preparedness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Step 1 */}
          <div className="space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm">
              1
            </div>
            <h3 className="text-sm font-semibold text-slate-100">
              Explore real earthquake events
            </h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Access live USGS seismicity data. Filter by minimum magnitude, view hypocenter depths,
              and inspect global fault systems on the interactive Earth Explorer map.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm">
              2
            </div>
            <h3 className="text-sm font-semibold text-slate-100">
              Discover what satellites observe
            </h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Learn how Sentinel-1 radar satellites beam microwave pulses to calculate millimeter-scale
              crustal deformation and map ground surface ruptures from orbit.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center font-mono font-bold text-sm">
              3
            </div>
            <h3 className="text-sm font-semibold text-slate-100">
              Understand the impact and stay prepared
            </h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Review verified UN and WHO humanitarian assessments, practice the evidence-based
              Drop-Cover-Hold-On protocol, and prepare your 72-hour family emergency kit.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION D: SAFETY BANNER & DIRECT LINK */}
      <section className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            <Shield className="w-4 h-4" />
            <span>Public Safety & Preparedness</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            Are You Prepared for the Next Earthquake?
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Knowing what to do before, during, and after an earthquake saves lives. Practice your
            response, track your emergency kit, and test your knowledge with our interactive safety quiz.
          </p>
        </div>

        <button
          onClick={() => onNavigate('safety-guide')}
          className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shrink-0 shadow-lg shadow-cyan-950"
        >
          <span>Open Safety Guide</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};

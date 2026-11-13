import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Home,
  HeartPulse,
  Building,
  DollarSign,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  MapPin,
  TrendingUp,
  FileCheck,
  Search,
  ChevronDown,
  Activity,
  Compass,
  Mountain,
  Info,
  Radio,
} from 'lucide-react';
import { HUMAN_IMPACT_RECORDS } from '../data/humanImpactData.ts';
import { EarthquakeFeature, HumanImpactRecord } from '../types/earthquake.ts';
import {
  fetchUsgsEventProducts,
  UsgsEventImpactProducts,
} from '../services/earthImpactService.ts';

interface HumanImpactViewProps {
  earthquakes?: EarthquakeFeature[];
  isLoadingFeed?: boolean;
  selectedEarthquake?: EarthquakeFeature | null;
  onSelectEarthquake?: (eq: EarthquakeFeature) => void;
  onOpenEarthImpact?: (eq: EarthquakeFeature) => void;
  onOpenInMap?: (eq: EarthquakeFeature) => void;
}

const PAGER_BADGE_STYLES: Record<string, string> = {
  green: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/60',
  yellow: 'bg-amber-950/70 text-amber-300 border-amber-500/60',
  orange: 'bg-orange-950/70 text-orange-300 border-orange-500/60',
  red: 'bg-rose-950/70 text-rose-300 border-rose-500/60',
};

export const HumanImpactView: React.FC<HumanImpactViewProps> = ({
  earthquakes = [],
  isLoadingFeed = false,
  selectedEarthquake = null,
  onSelectEarthquake,
  onOpenEarthImpact,
  onOpenInMap,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(HUMAN_IMPACT_RECORDS[0].id);
  const [searchFilter, setSearchFilter] = useState('');
  const [usgsProducts, setUsgsProducts] = useState<UsgsEventImpactProducts | null>(null);
  const [isLoadingUsgs, setIsLoadingUsgs] = useState(false);

  const selectedRecord: HumanImpactRecord =
    HUMAN_IMPACT_RECORDS.find((r) => r.id === selectedRecordId) || HUMAN_IMPACT_RECORDS[0];

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

  const notableSharedEvents = useMemo(() => {
    const ranked = [...earthquakes].sort((a, b) => {
      const aFelt = a.properties.felt ? Math.min(a.properties.felt, 500) : 0;
      const bFelt = b.properties.felt ? Math.min(b.properties.felt, 500) : 0;
      const aAlert = a.properties.alert ? 400 : 0;
      const bAlert = b.properties.alert ? 400 : 0;
      const aScore = aFelt + aAlert + (a.properties.mag ?? 0) * 60;
      const bScore = bFelt + bAlert + (b.properties.mag ?? 0) * 60;
      return bScore - aScore;
    });
    return ranked.slice(0, 4);
  }, [earthquakes]);

  // Fetch live USGS Event Detail products (PAGER, DYFI, MMI, Tsunami) when selectedEarthquake changes
  useEffect(() => {
    if (!selectedEarthquake) {
      setUsgsProducts(null);
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    async function loadUsgs() {
      setIsLoadingUsgs(true);
      try {
        const data = await fetchUsgsEventProducts(selectedEarthquake!, controller.signal);
        if (isActive) {
          setUsgsProducts(data);
        }
      } catch (err) {
        if (isActive && !(err instanceof DOMException && err.name === 'AbortError')) {
          setUsgsProducts(null);
        }
      } finally {
        if (isActive) setIsLoadingUsgs(false);
      }
    }

    loadUsgs();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [selectedEarthquake]);

  // Only match historical ReliefWeb bulletin if year, region, and magnitude genuinely align
  const matchedBulletin = useMemo(() => {
    if (!selectedEarthquake) return null;
    const eqYear = new Date(selectedEarthquake.properties.time).getUTCFullYear().toString();
    const placeLower = (selectedEarthquake.properties.place || '').toLowerCase();
    const mag = selectedEarthquake.properties.mag ?? 0;
    return (
      HUMAN_IMPACT_RECORDS.find(
        (h) =>
          h.date.includes(eqYear) &&
          Math.abs(h.magnitude - mag) < 0.6 &&
          (placeLower.includes(h.country.toLowerCase().split(' ')[0]) ||
            h.earthquakeName.toLowerCase().includes(placeLower))
      ) || null
    );
  }, [selectedEarthquake]);

  const feltCount = usgsProducts?.feltResponses ?? selectedEarthquake?.properties.felt ?? null;
  const cdiValue = usgsProducts?.cdi ?? selectedEarthquake?.properties.cdi ?? null;
  const mmiValue =
    usgsProducts?.shakemap?.maxMmi ??
    usgsProducts?.mmi ??
    selectedEarthquake?.properties.mmi ??
    null;
  const pagerAlert =
    usgsProducts?.losspager?.alertLevel ??
    usgsProducts?.alert ??
    selectedEarthquake?.properties.alert ??
    null;
  const tsunamiFlag = usgsProducts?.tsunami ?? selectedEarthquake?.properties.tsunami ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase tracking-wider font-semibold">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Humanitarian Seismology & Disaster Response</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Human Impact
          </h1>
          <p className="text-base font-medium text-slate-300">
            Behind Every Earthquake Is a Human Story.
          </p>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Earthquakes are geological events with profound human consequences. Explore documented
            casualties, community displacements, structural collapse patterns, and international
            recovery efforts verified by the United Nations, WHO, and national emergency agencies.
          </p>
        </div>

        {selectedEarthquake && (onOpenEarthImpact || onOpenInMap) && (
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
            {onOpenEarthImpact && (
              <button
                type="button"
                onClick={() => onOpenEarthImpact(selectedEarthquake)}
                className="px-3.5 py-2 text-xs font-mono font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Mountain className="w-3.5 h-3.5" />
                <span>View Earth Impact</span>
              </button>
            )}
            {onOpenInMap && (
              <button
                type="button"
                onClick={() => onOpenInMap(selectedEarthquake)}
                className="px-3.5 py-2 text-xs font-mono font-semibold text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-700/70 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>View on Earth Explorer</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Synchronized Live USGS Event Selection & PAGER/DYFI Assessment */}
      {earthquakes.length > 0 && onSelectEarthquake && (
        <section className="bg-[#0b0e17] border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-rose-400" />
                Select Live USGS Event for Human Impact Assessment
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Synchronized with GEO DEPTH’s shared USGS dataset ({earthquakes.length} events). Selecting an earthquake updates Earth Impact and Earth Explorer.
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
                          ? 'bg-rose-500 text-white border-rose-400 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-rose-500/50 hover:text-white'
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
            <div className="md:col-span-4 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by region or USGS ID..."
                aria-label="Filter Human Impact earthquake dropdown"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="md:col-span-8 relative">
              <select
                aria-label="Select earthquake for Human Impact analysis"
                value={selectedEarthquake?.id || ''}
                onChange={(e) => {
                  const match = earthquakes.find((item) => item.id === e.target.value);
                  if (match) onSelectEarthquake(match);
                }}
                className="w-full px-3.5 py-2.5 pr-9 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-rose-400 appearance-none cursor-pointer"
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
              <ChevronDown className="w-4 h-4 text-rose-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {selectedEarthquake ? (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-mono text-rose-400 uppercase tracking-wider font-semibold">
                    Synchronized USGS Event · {selectedEarthquake.id}
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                    M {(selectedEarthquake.properties.mag ?? 0).toFixed(1)} — {selectedEarthquake.properties.place || 'Unknown Location'}
                  </h3>
                  <div className="text-xs font-mono text-slate-400 mt-1">
                    {new Date(selectedEarthquake.properties.time).toISOString().replace('T', ' ').slice(0, 19)} UTC ·{' '}
                    {selectedEarthquake.geometry.coordinates[1].toFixed(4)}°, {selectedEarthquake.geometry.coordinates[0].toFixed(4)}° ·{' '}
                    {selectedEarthquake.geometry.coordinates[2].toFixed(1)} km depth
                  </div>
                </div>
                {isLoadingUsgs && (
                  <span className="text-xs font-mono text-cyan-400 animate-pulse">
                    Fetching USGS PAGER &amp; DYFI products...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* USGS PAGER Alert */}
                <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1.5">
                  <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
                    <span>USGS PAGER Alert</span>
                    <Activity className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  {pagerAlert ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-mono font-bold uppercase rounded border ${
                          PAGER_BADGE_STYLES[pagerAlert.toLowerCase()] ||
                          'bg-slate-800 text-slate-200 border-slate-700'
                        }`}
                      >
                        {pagerAlert.toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm font-bold font-mono text-slate-300">Not Issued</div>
                  )}
                  <div className="text-[11px] text-slate-400">
                    {pagerAlert
                      ? 'Official USGS LossPAGER rapid impact alert level.'
                      : 'No PAGER fatality/economic loss alert issued for this event.'}
                  </div>
                </div>

                {/* DYFI Citizen Felt Reports */}
                <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1.5">
                  <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
                    <span>Citizen Felt (DYFI)</span>
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-cyan-300">
                    {feltCount !== null ? feltCount.toLocaleString() : '0'}
                    {cdiValue !== null && (
                      <span className="text-xs font-normal text-slate-300 ml-2">
                        CDI {cdiValue.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {feltCount !== null && feltCount > 0
                      ? 'Reported to USGS "Did You Feel It?" community telemetry.'
                      : 'No USGS citizen felt reports submitted yet.'}
                  </div>
                </div>

                {/* Max Shaking Intensity (MMI) */}
                <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1.5">
                  <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
                    <span>Peak Shaking (MMI)</span>
                    <Radio className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-lg font-bold font-mono text-amber-300">
                    {mmiValue !== null ? `MMI ${mmiValue.toFixed(1)}` : 'Not Published'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {usgsProducts?.shakemap
                      ? 'From USGS ShakeMap instrumental ground-motion model.'
                      : 'No USGS ShakeMap MMI raster issued for this event.'}
                  </div>
                </div>

                {/* Tsunami Advisory Status */}
                <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1.5">
                  <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
                    <span>Tsunami Status</span>
                    <AlertTriangle
                      className={`w-3.5 h-3.5 ${tsunamiFlag === 1 ? 'text-amber-400' : 'text-slate-500'}`}
                    />
                  </div>
                  <div
                    className={`text-sm font-bold font-mono ${
                      tsunamiFlag === 1 ? 'text-amber-300' : 'text-slate-200'
                    }`}
                  >
                    {tsunamiFlag === 1 ? 'Tsunami Flag Active (1)' : 'No Tsunami Flagged'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {tsunamiFlag === 1
                      ? 'USGS/NOAA tsunami advisory parameter flagged; verify PTWC bulletins.'
                      : 'No NOAA/PTWC tsunami watch linked to this USGS event record.'}
                  </div>
                </div>
              </div>

              {matchedBulletin ? (
                <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <strong className="text-rose-300 font-mono block">
                      Matched ReliefWeb / UN OCHA Humanitarian Bulletin
                    </strong>
                    <span className="text-slate-200">
                      {matchedBulletin.earthquakeName} — {matchedBulletin.fatalities.toLocaleString()} fatalities reported ({matchedBulletin.source}).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRecordId(matchedBulletin.id)}
                    className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-mono text-xs font-semibold rounded shrink-0"
                  >
                    Inspect Full Bulletin Below
                  </button>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200">No UN OCHA / ReliefWeb casualties documented for {selectedEarthquake.id}.</strong>{' '}
                    Live USGS event parameters (PAGER, DYFI felt count, MMI, tsunami flag) are displayed directly above without fabricating casualty estimates. Verified major historical humanitarian bulletins remain accessible below.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-lg text-xs text-slate-400 flex items-center gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Select an earthquake from the dropdown above (or navigate here from Earth Explorer / Earth Impact) to inspect live USGS PAGER &amp; DYFI human impact telemetry alongside the historical case studies below.
              </span>
            </div>
          )}
        </section>
      )}

      {/* Critical Clarification: Exposed vs. Affected Populations */}
      <div className="p-5 bg-[#0e1320] border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold uppercase">
          <ShieldCheck className="w-4 h-4" />
          <span>Seismological Distinction: Exposed Population vs. Directly Affected</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
            <span className="font-semibold text-slate-200 block font-mono">Exposed Population</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              The total count of individuals living within the region who experienced ground shaking
              (e.g., MMI IV+ felt shaking). For major earthquakes like Türkiye 2023, exposure exceeded
              14 million people across 11 provinces.
            </p>
          </div>
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
            <span className="font-semibold text-slate-200 block font-mono">Directly Affected Population</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Individuals who suffered immediate physical harm, displacement due to collapsed or
              uninhabitable dwellings, loss of livelihood, or bereavement. Every metric in GEO DEPTH
              explicitly reports certified humanitarian casualties.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Case Study Selector */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-mono uppercase tracking-wide">
              Documented Major Events
            </h2>
            <p className="text-xs text-slate-400">
              Select an earthquake to view verified humanitarian assessments with direct source citations.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
            {HUMAN_IMPACT_RECORDS.map((rec) => (
              <button
                key={rec.id}
                onClick={() => setSelectedRecordId(rec.id)}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap ${
                  selectedRecordId === rec.id
                    ? 'bg-rose-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {rec.country} ({rec.magnitude.toFixed(1)})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Record Detail Sheet */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <span className="text-xs font-mono text-rose-400 uppercase tracking-wider">
                Event: {selectedRecord.date} · {selectedRecord.country}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
                {selectedRecord.earthquakeName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Scope: {selectedRecord.geographicScope}</span>
              </div>
            </div>

            {/* Official Source Badge */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs space-y-1 font-mono shrink-0">
              <div className="text-[10px] uppercase text-slate-400">Verification Source</div>
              <div className="text-slate-200 font-semibold text-[11px] max-w-xs line-clamp-2">
                {selectedRecord.source}
              </div>
              <div className="text-[10px] text-cyan-400">
                Reporting Date: {selectedRecord.reportingDate}
              </div>
            </div>
          </div>

          {/* Core Impact Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Fatalities */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Fatalities</span>
                <HeartPulse className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-rose-400">
                {selectedRecord.fatalities.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Confirmed by authorities</div>
            </div>

            {/* Injuries */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Injuries</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400">
                {selectedRecord.injuries.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Treated medical casualties</div>
            </div>

            {/* Displaced People */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Displaced</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-400">
                {selectedRecord.displacedPeople >= 1000000
                  ? `${(selectedRecord.displacedPeople / 1000000).toFixed(1)}M+`
                  : selectedRecord.displacedPeople.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Shelter & camp residents</div>
            </div>

            {/* Damaged Buildings */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>Damaged Buildings</span>
                <Home className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-200">
                {selectedRecord.buildingsDestroyedOrDamaged.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Destroyed or heavily damaged</div>
            </div>
          </div>

          {/* Economic Loss & Humanitarian Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg md:col-span-1 space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Estimated Economic Loss
              </span>
              <div className="text-2xl font-mono font-bold text-emerald-400">
                {selectedRecord.economicLossBillionsUSD
                  ? `$${selectedRecord.economicLossBillionsUSD.toFixed(1)} Billion`
                  : 'Pending Assessment'}
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Direct physical damage to infrastructure, residential housing, and civic assets.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg md:col-span-2 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                Key Humanitarian Analysis
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedRecord.keyHumanitarianNotes}
              </p>
            </div>
          </div>

          {/* Emergency Response & Recovery Actions */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Emergency Operations & Relief Mobilization
            </h4>
            <div className="space-y-2">
              {selectedRecord.emergencyResponseActions.map((action, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source Link */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Verified by: <strong className="text-slate-200">{selectedRecord.source}</strong>
            </span>
            <a
              href={selectedRecord.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
            >
              Access ReliefWeb / Official Bulletin <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

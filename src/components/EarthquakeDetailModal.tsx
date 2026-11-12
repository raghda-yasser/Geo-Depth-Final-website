import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Layers,
  Activity,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Radio,
  FileText,
  Info
} from 'lucide-react';
import { EarthquakeFeature } from '../types/earthquake.ts';
import { INSAR_CASE_STUDIES } from '../data/insarStudies.ts';
import { HUMAN_IMPACT_RECORDS } from '../data/humanImpactData.ts';

interface EarthquakeDetailModalProps {
  earthquake: EarthquakeFeature | null;
  onClose: () => void;
  onOpenInMap?: (eq: EarthquakeFeature) => void;
}

export const EarthquakeDetailModal: React.FC<EarthquakeDetailModalProps> = ({
  earthquake,
  onClose,
  onOpenInMap
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!earthquake) return null;

  const { properties, geometry } = earthquake;
  const [lng, lat, depth] = geometry.coordinates;
  const dateObj = new Date(properties.time);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
  const mag = properties.mag ?? 0;

  // Magnitude category & styling
  const getMagInfo = (m: number) => {
    if (m >= 7.0) return { label: 'Major Earthquake', color: 'text-rose-400', bg: 'bg-rose-950/60 border-rose-800/80', desc: 'Can cause severe structural damage across hundreds of kilometers.' };
    if (m >= 6.0) return { label: 'Strong Earthquake', color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800/80', desc: 'Can cause damage in populated areas up to ~100 km around epicenter.' };
    if (m >= 4.5) return { label: 'Moderate Earthquake', color: 'text-yellow-300', bg: 'bg-yellow-950/60 border-yellow-800/80', desc: 'Felt by most people; minor damage to poorly built buildings.' };
    if (m >= 3.0) return { label: 'Light Earthquake', color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800/80', desc: 'Often felt indoors, rarely causes structural damage.' };
    return { label: 'Minor / Micro Earthquake', color: 'text-cyan-400', bg: 'bg-cyan-950/60 border-cyan-800/80', desc: 'Recorded by sensitive seismometers; rarely felt by people.' };
  };
  const magInfo = getMagInfo(mag);

  // Depth explanation
  const getDepthInfo = (d: number) => {
    if (d <= 35) return { type: 'Shallow Focus', desc: 'Hypocenter in upper crust (<35 km). Shallow earthquakes typically produce the strongest surface ground shaking.' };
    if (d <= 70) return { type: 'Intermediate Crustal', desc: 'Hypocenter in intermediate crust (35–70 km). Moderate surface energy dissipation.' };
    return { type: 'Deep Focus', desc: 'Hypocenter in subducting mantle lithosphere (>70 km). Less intense surface destruction, but felt over expansive regional distances.' };
  };
  const depthInfo = getDepthInfo(depth);

  // Match corresponding InSAR study or Human Impact if applicable
  const matchingInSAR = INSAR_CASE_STUDIES.find(
    (s) =>
      Math.abs(s.coordinates.lat - lat) < 3 &&
      Math.abs(s.coordinates.lng - lng) < 3 &&
      Math.abs(s.magnitude - mag) < 1.0
  );

  const matchingHumanImpact = HUMAN_IMPACT_RECORDS.find(
    (h) =>
      Math.abs(h.magnitude - mag) < 0.6 &&
      (properties.place.toLowerCase().includes(h.country.toLowerCase().split(' ')[0]) ||
       h.earthquakeName.toLowerCase().includes(properties.place.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto bg-[#0b0e17] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800 bg-[#0d121e]">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Activity className="w-3.5 h-3.5" />
              <span>USGS EVENT ID: {properties.code || properties.net || earthquake.id}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{properties.type?.toUpperCase() || 'EARTHQUAKE'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              {properties.place || 'Unknown Location'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Section A: What Happened? */}
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-lg">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2">
              A. What Happened?
            </h3>
            <p className="text-slate-200 leading-relaxed text-sm">
              On {formattedDate} at {formattedTime}, an earthquake with a magnitude of{' '}
              <strong className="text-white font-mono">{mag.toFixed(1)}</strong> occurred at a focal
              depth of <strong className="text-white font-mono">{depth.toFixed(1)} km</strong>{' '}
              ({properties.place}). Sudden slip along a subsurface fault released stored tectonic
              strain energy, generating seismic waves that propagated through the Earth's crust.
            </p>
          </div>

          {/* Section B: Where and When? */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-3">
              B. Where and When?
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#101524] border border-slate-800 p-3 rounded-lg">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-400" /> Date
                </span>
                <div className="text-xs font-semibold text-slate-200 mt-1 font-mono">
                  {formattedDate}
                </div>
              </div>

              <div className="bg-[#101524] border border-slate-800 p-3 rounded-lg">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" /> Time (UTC)
                </span>
                <div className="text-xs font-semibold text-slate-200 mt-1 font-mono">
                  {formattedTime}
                </div>
              </div>

              <div className="bg-[#101524] border border-slate-800 p-3 rounded-lg">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" /> Latitude
                </span>
                <div className="text-xs font-semibold text-slate-200 mt-1 font-mono">
                  {lat.toFixed(4)}° {lat >= 0 ? 'N' : 'S'}
                </div>
              </div>

              <div className="bg-[#101524] border border-slate-800 p-3 rounded-lg">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" /> Longitude
                </span>
                <div className="text-xs font-semibold text-slate-200 mt-1 font-mono">
                  {lng.toFixed(4)}° {lng >= 0 ? 'E' : 'W'}
                </div>
              </div>
            </div>
          </div>

          {/* Section C: How Strong Was It? */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-3">
              C. How Strong Was It?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Magnitude Card */}
              <div className={`p-4 rounded-lg border ${magInfo.bg}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
                    Magnitude ({properties.magType?.toUpperCase() || 'Mw'})
                  </span>
                  <span className="text-3xl font-extrabold font-mono text-white">
                    {mag.toFixed(1)}
                  </span>
                </div>
                <div className={`text-xs font-semibold mt-1 ${magInfo.color}`}>
                  {magInfo.label}
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {magInfo.desc} The Moment Magnitude scale is logarithmic: each whole unit release
                  equals roughly <strong className="text-white">32 times</strong> more mechanical
                  energy.
                </p>
              </div>

              {/* Depth Card */}
              <div className="p-4 rounded-lg border border-slate-800 bg-[#101524]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Focal Depth
                  </span>
                  <span className="text-3xl font-extrabold font-mono text-cyan-300">
                    {depth.toFixed(1)}{' '}
                    <span className="text-xs font-normal text-slate-400">km</span>
                  </span>
                </div>
                <div className="text-xs font-semibold text-cyan-400 mt-1">{depthInfo.type}</div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {depthInfo.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Section D: Why Did It Happen? (Tectonic context) */}
          <div className="border border-slate-800 p-4 rounded-lg bg-[#0e1320]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              D. Why Did It Happen? (Tectonic Mechanism)
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Earthquakes occur when tectonic stress exceeds the frictional resistance holding rock
              blocks together across a fault. When rupture initiates at the hypocenter, the stored
              strain is released instantaneously as elastic energy.
            </p>
            {matchingInSAR ? (
              <div className="mt-3 p-3 bg-cyan-950/40 border border-cyan-800/50 rounded text-xs text-cyan-200">
                <strong className="text-cyan-300">Verified Regional Setting:</strong>{' '}
                {matchingInSAR.tectonicSetting}
              </div>
            ) : (
              <div className="mt-2 text-xs text-slate-400">
                Regional tectonic context is governed by plate boundary kinematics (subduction zones,
                transform faults, or continental collision belts) mapped by global geological surveys.
              </div>
            )}
          </div>

          {/* Section E: Ground Effects & Hazards */}
          <div className="border border-slate-800 p-4 rounded-lg bg-[#0e1320]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              E. Documented Ground Shaking & Hazards
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                <span className="text-slate-400 block font-mono text-[11px]">Maximum Intensity</span>
                <span className="text-slate-200 font-semibold font-mono text-sm mt-0.5 block">
                  {properties.mmi ? `MMI ${properties.mmi.toFixed(1)}` : mag >= 6.0 ? 'Severe Shaking' : mag >= 4.0 ? 'Moderate Shaking' : 'Light Shaking'}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  USGS ShakeMap Intensity Scale
                </span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                <span className="text-slate-400 block font-mono text-[11px]">Tsunami Hazard</span>
                <span className="text-slate-200 font-semibold font-mono text-sm mt-0.5 block">
                  {properties.tsunami === 1 ? 'Tsunami Wave Advisory' : 'No Tsunami Generated'}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  NOAA Pacific Tsunami Warning Center
                </span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded">
                <span className="text-slate-400 block font-mono text-[11px]">Ground Failure Hazards</span>
                <span className="text-slate-200 font-semibold font-mono text-sm mt-0.5 block">
                  {mag >= 6.5 ? 'High Landslide/Liquefaction' : mag >= 5.0 ? 'Localized Rockfall Hazard' : 'Low Surface Rupture'}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  USGS Ground Failure Assessment
                </span>
              </div>
            </div>
          </div>

          {/* Section F: Human Impact */}
          <div className="border border-slate-800 p-4 rounded-lg bg-[#0e1320]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              F. How Were People Affected?
            </h3>
            {matchingHumanImpact ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-400 text-[10px] block font-mono">Fatalities</span>
                    <span className="text-rose-400 font-bold font-mono text-sm">
                      {matchingHumanImpact.fatalities.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-400 text-[10px] block font-mono">Injuries</span>
                    <span className="text-amber-400 font-bold font-mono text-sm">
                      {matchingHumanImpact.injuries.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-400 text-[10px] block font-mono">Displaced</span>
                    <span className="text-cyan-400 font-bold font-mono text-sm">
                      {matchingHumanImpact.displacedPeople.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-400 text-[10px] block font-mono">Damaged Buildings</span>
                    <span className="text-slate-200 font-bold font-mono text-sm">
                      {matchingHumanImpact.buildingsDestroyedOrDamaged.toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {matchingHumanImpact.keyHumanitarianNotes}
                </p>
                <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                  <span>Source: {matchingHumanImpact.source} ({matchingHumanImpact.reportingDate})</span>
                  <a
                    href={matchingHumanImpact.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    ReliefWeb Report <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded border border-slate-800/60 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-semibold block mb-0.5">
                    No Direct Casualties Documented for this Event
                  </span>
                  <span>
                    Official humanitarian relief reports (UN OCHA / ReliefWeb) focus on major
                    damaging disasters. For smaller or offshore earthquakes, casualty and damage
                    assessments are either zero or not reported.
                  </span>
                  {properties.felt && (
                    <div className="mt-1.5 text-cyan-300 font-mono">
                      USGS Did You Feel It? (DYFI): {properties.felt.toLocaleString()} citizen responses recorded.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section G: What Did Satellites Observe? */}
          <div className="border border-slate-800 p-4 rounded-lg bg-[#0e1320]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              G. What Did Satellites Observe?
            </h3>
            {matchingInSAR ? (
              <div className="space-y-3">
                <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-lg text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-cyan-300 font-mono">
                    <span>Satellite: {matchingInSAR.satellite}</span>
                    <span>Sensor: {matchingInSAR.sensor} ({matchingInSAR.band})</span>
                  </div>
                  <div className="text-slate-300">
                    <strong>Observations:</strong> Pre-seismic ({matchingInSAR.preSeismicDate}) to post-seismic ({matchingInSAR.postSeismicDate}).
                  </div>
                  <div className="text-slate-200 leading-relaxed">
                    {matchingInSAR.summary}
                  </div>
                  <div className="text-[11px] text-cyan-200 border-t border-cyan-900/60 pt-1.5">
                    <strong>Interferogram Measurement:</strong> {matchingInSAR.fringeExplanation}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded border border-slate-800/60">
                <p className="leading-relaxed">
                  Sentinel-1 C-band Synthetic Aperture Radar (SAR) acquires repeat-pass radar imagery
                  every 6 to 12 days. For earthquakes of magnitude M ≥ 5.5 near inhabited land,
                  interferograms (InSAR) are routinely generated by Copernicus and ASF to measure
                  centimeter-scale crustal displacement. Smaller seismic events produce displacement
                  below radar coherence thresholds.
                </p>
              </div>
            )}
          </div>

          {/* Section H: Sources & Expandable Scientific Details */}
          <div className="border-t border-slate-800 pt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-xs font-mono text-slate-400 hover:text-cyan-400 py-1"
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                H. Scientific Sources & Raw Telemetry Data
              </span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded font-mono text-xs space-y-2 text-slate-300">
                <div>
                  <span className="text-slate-400">USGS Event URL:</span>{' '}
                  <a
                    href={properties.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline break-all inline-flex items-center gap-1"
                  >
                    {properties.url} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                  <div>Status: {properties.status}</div>
                  <div>Significance Score: {properties.sig}</div>
                  <div>Network: {properties.net}</div>
                  <div>Azimuthal Gap: {properties.gap ?? 'N/A'}°</div>
                  <div>RMS Residual: {properties.rms ?? 'N/A'} s</div>
                  <div>Number of Stations: {properties.nst ?? 'N/A'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-[#0d121e] flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 font-mono">
            Verified USGS GeoJSON Data Feed
          </div>
          <div className="flex items-center gap-3">
            {onOpenInMap && (
              <button
                onClick={() => {
                  onClose();
                  onOpenInMap(earthquake);
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-800 rounded-md transition-colors flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>View on Earth Explorer</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

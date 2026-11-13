import React, { useState } from 'react';
import {
  Radio,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Database
} from 'lucide-react';
import { INSAR_CASE_STUDIES } from '../data/insarStudies.ts';
import { SAR_OFFICIAL_SOURCES, SAR_SOURCE_CATEGORIES } from '../data/sarSources.ts';

export const SatelliteExplorerView: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(INSAR_CASE_STUDIES[0].id);
  const [showTechnicalGlossary, setShowTechnicalGlossary] = useState(false);

  const selectedCase =
    INSAR_CASE_STUDIES.find((c) => c.id === selectedCaseId) || INSAR_CASE_STUDIES[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
          <Radio className="w-3.5 h-3.5" />
          <span>Orbital Radar Geodesy · Sentinel-1 · NISAR · SAOCOM · RADARSAT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Satellite Radar Explorer
        </h1>
        <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
          How C-band, L-band, and S-band radar satellites in low Earth orbit measure millimeter-to-centimeter
          ground deformation following major earthquakes. Grounded in ESA Copernicus Sentinel-1,
          NASA-ISRO NISAR, JPL UAVSAR, CSA RADARSAT, and CONAE SAOCOM science archives.
        </p>
      </div>

      {/* Core Educational Concepts: The 5 Fundamental Questions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Concept 1 */}
        <div className="p-5 bg-[#0b0e17] border border-slate-800 rounded-xl space-y-2">
          <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            1. What is SAR?
          </div>
          <h3 className="text-base font-semibold text-slate-100">
            Synthetic Aperture Radar
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            SAR is an active microwave imaging system. Unlike optical cameras that need sunlight, SAR
            transmits microwave pulses (5.405 GHz for Sentinel-1) and records both the amplitude
            (brightness) and phase (travel time) of the backscattered signal day or night, through
            thick clouds and volcanic ash.
          </p>
        </div>

        {/* Concept 2 */}
        <div className="p-5 bg-[#0b0e17] border border-slate-800 rounded-xl space-y-2">
          <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            2. What is InSAR?
          </div>
          <h3 className="text-base font-semibold text-slate-100">
            Interferometric Fringe Stacking
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Interferometric SAR compares two radar acquisitions taken from the exact same orbital track
            before and after an earthquake. By computing the phase difference (Δφ),
            scientists detect crustal displacement with millimeter-scale sensitivity.
          </p>
        </div>

        {/* Concept 3 */}
        <div className="p-5 bg-[#0b0e17] border border-slate-800 rounded-xl space-y-2">
          <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            3. What Satellites Reveal
          </div>
          <h3 className="text-base font-semibold text-slate-100">
            Surface Ruptures & Slip Fields
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            InSAR reveals the exact geographical trace of surface fault breaks, identifies blind
            subsurface thrusting, maps co-seismic slip distribution, and monitors post-seismic afterslip
            and regional strain accumulation along active faults.
          </p>
        </div>
      </div>

      {/* Critical Scientific Taxonomy: Distinguishing Satellite Products */}
      <div className="p-5 bg-[#0e1320] border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold uppercase">
          <ShieldAlert className="w-4 h-4" />
          <span>Scientific Distinction: Satellite Imaging Products</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          In scientific geodesy, different satellite products represent distinct physical measurements.
          A common mistake is treating any satellite photo as radar, or treating an interferogram
          as an uncalibrated displacement map.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="font-mono text-cyan-400 block font-bold mb-1">Optical Imagery</span>
            <span className="text-slate-300 block text-[11px] leading-tight">
              Passive visible light reflections (Landsat, Sentinel-2). Shows surface visible damage,
              landslides, and collapses, but cannot directly measure centimeter ground movement.
            </span>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="font-mono text-cyan-400 block font-bold mb-1">SAR Backscatter</span>
            <span className="text-slate-300 block text-[11px] leading-tight">
              Radar pulse intensity reflection. Sensitive to surface roughness, building destruction,
              and soil moisture change.
            </span>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="font-mono text-cyan-400 block font-bold mb-1">Interferogram</span>
            <span className="text-slate-300 block text-[11px] leading-tight">
              Phase difference fringes (color cycles). Each complete fringe represents a displacement
              cycle equal to half the radar wavelength (2.8 cm for C-band).
            </span>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="font-mono text-cyan-400 block font-bold mb-1">Coherence Map</span>
            <span className="text-slate-300 block text-[11px] leading-tight">
              Degree of similarity between pre- and post-event radar waves. Severe drops in coherence
              pinpoint destroyed structures and active debris flows.
            </span>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="font-mono text-cyan-400 block font-bold mb-1">Displacement Map</span>
            <span className="text-slate-300 block text-[11px] leading-tight">
              Phase-unwrapped and georeferenced line-of-sight (LOS) deformation field, calibrated
              against GNSS ground stations.
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Mission Radar Wavelengths: C-Band vs L-Band & S-Band */}
      <div className="p-5 bg-[#0b0e17] border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
          <Database className="w-4 h-4" />
          <span>Global SAR Fleet: Why Radar Wavelength Matters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">
                C-Band SAR (~5.55 cm wavelength)
              </h3>
              <span className="font-mono text-[11px] text-cyan-400">2.8 cm / fringe</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Operated by <strong>ESA Copernicus Sentinel-1</strong> and the{' '}
              <strong>Canadian Space Agency (RADARSAT Constellation Mission &amp; RADARSAT-1)</strong>.
              Short ~5.6 cm microwaves deliver high sensitivity to small crustal motion and urban
              building damage, though dense forests can cause signal decorrelation.
            </p>
          </div>

          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">
                L-Band &amp; S-Band SAR (~24 cm / ~9.4 cm)
              </h3>
              <span className="font-mono text-[11px] text-amber-400">~12 cm / fringe (L)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Operated by <strong>CONAE SAOCOM-1A/1B</strong>, <strong>NASA JPL UAVSAR</strong>, and
              the dual-frequency <strong>NASA-ISRO NISAR</strong> mission. Longer L-band waves
              penetrate vegetation canopies and measure large fault displacements without phase
              aliasing across steep rupture gradients.
            </p>
          </div>
        </div>
      </div>

      {/* Verified Scientific Case Studies */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-mono uppercase tracking-wide">
              Verified InSAR Case Studies
            </h2>
            <p className="text-xs text-slate-400">
              Select an authoritative radar geodetic study published by ESA Copernicus, USGS, or NASA JPL.
            </p>
          </div>

          {/* Case Study Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
            {INSAR_CASE_STUDIES.map((study) => (
              <button
                key={study.id}
                onClick={() => setSelectedCaseId(study.id)}
                className={`px-3 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap ${
                  selectedCaseId === study.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {study.country} ({study.magnitude.toFixed(1)})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Case Study Spotlight Card */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Event: {selectedCase.date} · {selectedCase.country}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
                {selectedCase.name}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl mt-1">
                {selectedCase.summary}
              </p>
            </div>

            {/* Scientific Specs Badge Strip */}
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg font-mono text-xs space-y-1 shrink-0 text-slate-300">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Satellite:</span>
                <span className="text-cyan-400 font-bold">{selectedCase.satellite}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Radar Band:</span>
                <span>{selectedCase.band}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Wavelength:</span>
                <span>{selectedCase.wavelengthCm} cm</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Fringe Value:</span>
                <span className="text-slate-200">2.8 cm / cycle</span>
              </div>
            </div>
          </div>

          {/* Scientific Verification Audit: Ground Displacement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                Max Line-of-Sight Uplift
              </span>
              <div className="text-2xl font-mono font-bold text-cyan-400">
                +{selectedCase.verifiedDisplacement.losUpliftCm} <span className="text-xs text-slate-400">cm</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Crustal deformation directed toward satellite radar line-of-sight.
              </p>
            </div>

            <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                Max Line-of-Sight Subsidence
              </span>
              <div className="text-2xl font-mono font-bold text-amber-400">
                -{selectedCase.verifiedDisplacement.losSubsidenceCm} <span className="text-xs text-slate-400">cm</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Crustal deformation directed away from satellite radar line-of-sight.
              </p>
            </div>

            <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                Max Horizontal Surface Slip
              </span>
              <div className="text-2xl font-mono font-bold text-emerald-400">
                {selectedCase.verifiedDisplacement.horizontalFaultSlipMeters} <span className="text-xs text-slate-400">meters</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Measured horizontal surface fault offset along rupture scarp.
              </p>
            </div>
          </div>

          {/* Scientific Audit Explanatory Note */}
          <div className="p-4 bg-cyan-950/30 border border-cyan-800/50 rounded-lg text-xs space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Scientific Measurement Audit & Verification</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {selectedCase.verifiedDisplacement.notes}
            </p>
            <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-cyan-900/40">
              Peer-Reviewed Citation: {selectedCase.verifiedDisplacement.peerReviewedCitation}
            </div>
          </div>

          {/* Radar Interferogram Simulation & Color Fringe Representation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 uppercase tracking-wider font-semibold">
                InSAR Co-Seismic Interferogram Phase Map
              </span>
              <span className="text-slate-400">
                Baseline: {selectedCase.preSeismicDate} → {selectedCase.postSeismicDate}
              </span>
            </div>

            {/* Procedural Canvas Scientific Interferogram Display */}
            <div className="relative w-full h-64 rounded-lg bg-[#070b14] border border-slate-800 overflow-hidden flex items-center justify-center">
              <InterferogramFringeCanvas
                magnitude={selectedCase.magnitude}
                faultType={selectedCase.surfaceRuptureKm > 0 ? 'strike-slip' : 'thrust'}
              />
              <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded text-[11px] font-mono text-slate-300 flex items-center gap-3">
                <span className="text-cyan-400 font-semibold">{selectedCase.satellite}</span>
                <span>Track: {selectedCase.orbitTracks}</span>
                <span>Wavelength: 5.55 cm (C-band)</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {selectedCase.fringeExplanation}
            </p>
          </div>

          {/* Sources and Data Providers */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-slate-400">
              Data Providers:{' '}
              <span className="text-slate-300">{selectedCase.dataProviders.join(', ')}</span>
            </div>
            <a
              href={selectedCase.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
            >
              Access Verified Copernicus Products <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* H. Sources — Official SAR Portals, Missions & Training */}
      <div className="space-y-5 pt-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            <BookOpen className="w-4 h-4" />
            <span>H. Sources · Official Archives &amp; Educational Portals</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            Verified Space Agency SAR Data Portals &amp; Tutorials
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl">
            Explore primary open-access satellite radar archives, mission documentation, and
            open-source SAR curricula maintained by NASA, ASF, ISRO, JPL, the Canadian Space Agency
            (CSA), and Argentina’s CONAE.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {SAR_SOURCE_CATEGORIES.map((cat) => {
            const items = SAR_OFFICIAL_SOURCES.filter((s) => s.category === cat.id);
            return (
              <div
                key={cat.id}
                className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 space-y-3"
              >
                <div className="border-b border-slate-800 pb-2.5">
                  <h3 className="text-sm font-bold text-slate-100 font-mono">{cat.label}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{cat.subtitle}</p>
                </div>

                <div className="space-y-2.5">
                  {items.map((src) => (
                    <a
                      key={src.url}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-cyan-500/50 rounded-lg transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                            <span>{src.title}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400">
                            <span className="text-cyan-400">{src.agency}</span>
                            <span>·</span>
                            <span>{src.bandOrFocus}</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 shrink-0 mt-0.5" />
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed mt-1.5">
                        {src.description}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clarification: What Satellites Cannot Do */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs">
        <h4 className="font-mono text-slate-200 uppercase tracking-wider font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Important Seismological Truth: Can Satellites Predict Future Earthquakes?
        </h4>
        <p className="text-slate-300 leading-relaxed">
          No. Satellite geodesy and InSAR measure deformation that has already occurred or ongoing
          slow tectonic strain accumulation. Satellites <strong className="text-white">cannot predict</strong>{' '}
          the exact time, day, or precise location of a future earthquake. Radar observations provide
          invaluable post-event damage mapping and help scientists identify locked fault segments
          where stress is building, complementing ground seismometer networks.
        </p>
      </div>
    </div>
  );
};

// Procedural Canvas Component for authentic radar interferogram fringe simulation
const InterferogramFringeCanvas: React.FC<{ magnitude: number; faultType: 'strike-slip' | 'thrust' }> = ({
  magnitude,
  faultType,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);

    const cx = width / 2;
    const cy = height / 2;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Generate concentric or butterfly fringe phase patterns
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const dx = (px - cx) / 25;
        const dy = (py - cy) / 25;
        const r = Math.sqrt(dx * dx + dy * dy) + 0.001;

        let phase = 0;
        if (faultType === 'strike-slip') {
          // Quadrupolar butterfly lobes characteristic of strike-slip rupture
          const angle = Math.atan2(dy, dx);
          phase = (magnitude * 5 * Math.sin(2 * angle)) / (r + 0.8);
        } else {
          // Asymmetric elliptical dome characteristic of thrust faulting
          phase = (magnitude * 4) / (Math.sqrt(dx * dx + dy * dy * 2.2) + 0.6);
        }

        // Map phase mod 2*PI to cyclic interferogram rainbow color palette
        const norm = (phase % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const t = norm / (2 * Math.PI);

        // Cyclic InSAR palette: Cyan -> Blue -> Magenta -> Yellow -> Green -> Cyan
        let rCol = 0, gCol = 0, bCol = 0;
        if (t < 0.2) {
          rCol = 6; gCol = Math.floor(182 * (1 - t * 5)); bCol = 212;
        } else if (t < 0.4) {
          rCol = Math.floor(168 * ((t - 0.2) * 5)); gCol = 85; bCol = 247;
        } else if (t < 0.6) {
          rCol = 239; gCol = Math.floor(68 + 100 * (t - 0.4) * 5); bCol = 68;
        } else if (t < 0.8) {
          rCol = Math.floor(234 * (1 - (t - 0.6) * 5)); gCol = 179; bCol = 8;
        } else {
          rCol = 16; gCol = Math.floor(185 * (t - 0.8) * 5); bCol = 129;
        }

        // Slight attenuation by distance
        const attenuation = Math.max(0.2, Math.min(1.0, 1.2 - r / 12));

        const index = (py * width + px) * 4;
        data[index] = Math.floor(rCol * attenuation);
        data[index + 1] = Math.floor(gCol * attenuation);
        data[index + 2] = Math.floor(bCol * attenuation);
        data[index + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Draw Fault Surface Rupture line across center
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    if (faultType === 'strike-slip') {
      ctx.moveTo(cx - 140, cy + 60);
      ctx.lineTo(cx + 140, cy - 60);
    } else {
      ctx.moveTo(cx - 100, cy);
      ctx.lineTo(cx + 100, cy);
    }
    ctx.stroke();

    // Epicenter star
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText('SURFACE FAULT RUPTURE SCARP', cx + 15, cy - 12);
    ctx.restore();
  }, [magnitude, faultType]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};

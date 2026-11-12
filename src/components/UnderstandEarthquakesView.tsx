import React, { useState } from 'react';
import {
  Layers,
  Activity,
  Radio,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { ThreeFaultViewer } from './ThreeFaultViewer.tsx';

export const UnderstandEarthquakesView: React.FC = () => {
  const [openLearnMore, setOpenLearnMore] = useState<{ [k: string]: boolean }>({});

  const toggleLearnMore = (key: string) => {
    setOpenLearnMore((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          <span>Fundamental Earth Science & Seismology</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Understand Earthquakes
        </h1>
        <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
          Earthquakes are natural releases of mechanical energy inside our dynamic planet. Learn why
          the ground shakes, how scientists detect seismic waves in real time, and how satellites
          measure deformation from space.
        </p>
      </div>

      {/* QUESTION 1: WHY DO EARTHQUAKES HAPPEN? */}
      <section className="bg-[#0b0e17] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="space-y-1 border-b border-slate-800 pb-4">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
            Question 1
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            Why Do Earthquakes Happen?
          </h2>
          <p className="text-xs text-slate-400">
            From continental plate collisions to sudden friction rupture.
          </p>
        </div>

        {/* 5-Step Process in Plain English */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
            <span className="font-mono text-cyan-400 font-bold block text-sm">01</span>
            <h4 className="font-semibold text-slate-200">Tectonic Plates</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Earth's outer crust is divided into gigantic moving jigsaw pieces driven by mantle
              convection.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
            <span className="font-mono text-cyan-400 font-bold block text-sm">02</span>
            <h4 className="font-semibold text-slate-200">Fault Boundaries</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Cracks where rock blocks meet. Friction along the rough fault plane prevents them from
              sliding smoothly.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
            <span className="font-mono text-cyan-400 font-bold block text-sm">03</span>
            <h4 className="font-semibold text-slate-200">Pressure Buildup</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              While the plates keep pushing, the locked fault stays stuck. Elastic strain accumulates
              over decades or centuries.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
            <span className="font-mono text-cyan-400 font-bold block text-sm">04</span>
            <h4 className="font-semibold text-slate-200">Sudden Rupture</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              When stress overcomes rock friction, the fault slips violently in seconds at the
              hypocenter.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
            <span className="font-mono text-cyan-400 font-bold block text-sm">05</span>
            <h4 className="font-semibold text-slate-200">Seismic Waves</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              The released strain radiates outwards in all directions as seismic waves that shake the
              ground.
            </p>
          </div>
        </div>

        {/* Interactive 3D Three.js Fault Simulation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="font-semibold uppercase tracking-wider">
              Interactive 3D Crustal Fault Block Simulator
            </span>
            <span className="text-cyan-400">WebGL 3D Kinematics</span>
          </div>
          <ThreeFaultViewer />
        </div>

        {/* Expandable Learn More: Fault Types */}
        <div className="pt-2">
          <button
            onClick={() => toggleLearnMore('faultTypes')}
            className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:underline"
          >
            <span>Learn More: The Three Main Fault Kinematics</span>
            {openLearnMore.faultTypes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openLearnMore.faultTypes && (
            <div className="mt-3 p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-3 text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80">
                  <strong className="text-white block font-mono">1. Strike-Slip Faults</strong>
                  <span className="text-slate-400 text-[11px] mt-1 block">
                    Blocks slide horizontally past each other. Examples: San Andreas Fault (California),
                    East Anatolian Fault (Türkiye).
                  </span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80">
                  <strong className="text-white block font-mono">2. Normal Faults</strong>
                  <span className="text-slate-400 text-[11px] mt-1 block">
                    Crust pulls apart (extension); hanging wall drops downward relative to footwall.
                    Common in rift valleys and the Basin and Range province.
                  </span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80">
                  <strong className="text-white block font-mono">3. Reverse / Thrust Faults</strong>
                  <span className="text-slate-400 text-[11px] mt-1 block">
                    Crust is squeezed together (compression); hanging wall pushes upward over footwall.
                    Responsible for the largest megathrust quakes (Japan 2011, Chile 1960).
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* QUESTION 2: HOW DO WE DETECT EARTHQUAKES? */}
      <section className="bg-[#0b0e17] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="space-y-1 border-b border-slate-800 pb-4">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
            Question 2
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            How Do We Detect Earthquakes?
          </h2>
          <p className="text-xs text-slate-400">
            Global seismic networks, P and S wave arrivals, and focal depth calculation.
          </p>
        </div>

        {/* Detection Concepts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
            <h4 className="font-semibold text-slate-200 font-mono text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Seismometers & Seismic Stations
            </h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Seismometers are precision instruments anchored into bedrock. Inside, an inertial mass
              suspended by a spring stays stationary while the housing moves with the shaking ground.
              Electromagnetic sensors measure micro-displacements and stream digitized traces to
              monitoring hubs like the USGS National Earthquake Information Center (NEIC).
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
            <h4 className="font-semibold text-slate-200 font-mono text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              Epicenter vs. Hypocenter (Depth)
            </h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              The <strong>hypocenter</strong> (focus) is the true 3D point underground where fault
              rupture initiates. The <strong>epicenter</strong> is the geographical location directly
              above it on Earth's surface. Scientists triangulate the epicenter by comparing the
              arrival time differences of P and S waves across at least 3 seismic stations.
            </p>
          </div>
        </div>

        {/* Procedural Seismogram Trace Diagram */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="font-semibold uppercase tracking-wider">
              Anatomy of a Three-Component Seismogram
            </span>
            <span className="text-slate-400">Velocity (cm/s) vs Time</span>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
            <svg viewBox="0 0 800 180" className="w-full h-auto">
              {/* Background grid */}
              <line x1="50" y1="90" x2="780" y2="90" stroke="#1e293b" strokeWidth="1" />
              <line x1="160" y1="20" x2="160" y2="160" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="360" y1="20" x2="360" y2="160" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="520" y1="20" x2="520" y2="160" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />

              {/* Seismogram trace curve */}
              <path
                d="M 50 90 L 150 90 L 155 88 L 160 85 L 165 98 L 170 82 L 180 96 L 200 86 L 230 93 L 260 88 L 300 91 L 340 89 L 360 80 L 370 120 L 380 60 L 395 130 L 410 50 L 430 125 L 450 65 L 480 115 L 510 75 L 520 40 L 535 155 L 550 25 L 570 160 L 590 35 L 615 145 L 640 45 L 670 125 L 700 70 L 730 105 L 760 85 L 780 90"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
              />

              {/* Phase Arrival Markers */}
              <text x="160" y="35" fill="#38bdf8" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                P-Wave Arrival (Fastest, ~6 km/s)
              </text>
              <text x="360" y="55" fill="#f59e0b" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                S-Wave Arrival (Shear, ~3.5 km/s)
              </text>
              <text x="520" y="30" fill="#ef4444" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">
                Surface Waves (Love & Rayleigh, Highest Amplitude)
              </text>

              <text x="60" y="170" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono">
                Quiescent Baseline
              </text>
              <text x="240" y="170" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono">
                S - P Time Interval gives Distance
              </text>
              <text x="600" y="170" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono">
                Peak Ground Shaking
              </text>
            </svg>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Primary (P) waves are compressional longitudinal waves that travel fastest through rock.
            Secondary (S) waves arrive later and shake side-to-side. Surface waves (Rayleigh and Love)
            travel along Earth's exterior with the highest amplitude, causing the majority of
            structural building damage.
          </p>
        </div>

        {/* Expandable Learn More: Magnitude vs Intensity */}
        <div className="pt-2">
          <button
            onClick={() => toggleLearnMore('magVsInt')}
            className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:underline"
          >
            <span>Learn More: Magnitude (Mw) vs. Intensity (MMI)</span>
            {openLearnMore.magVsInt ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {openLearnMore.magVsInt && (
            <div className="mt-3 p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2 text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">Magnitude</strong> measures the total physical energy
                released at the hypocenter. An earthquake has <em>only one magnitude</em>.
              </p>
              <p>
                <strong className="text-white">Intensity (Modified Mercalli Intensity, MMI)</strong>{' '}
                measures the actual shaking felt and damage observed at a specific location on the
                surface. It varies depending on distance from the epicenter and local soil conditions
                (soft alluvium vs. hard bedrock).
              </p>
            </div>
          )}
        </div>
      </section>

      {/* QUESTION 3: HOW DO SATELLITES HELP US? */}
      <section className="bg-[#0b0e17] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="space-y-1 border-b border-slate-800 pb-4">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
            Question 3
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            How Do Satellites Help Us?
          </h2>
          <p className="text-xs text-slate-400">
            Bridging ground seismometer dots with complete 2D regional deformation maps.
          </p>
        </div>

        {/* 4-Step Satellite Workflow */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
            <span className="font-mono text-cyan-400 font-bold block text-sm">Step 1</span>
            <h4 className="font-semibold text-slate-200">Pre-Event Pass</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Sentinel-1 captures baseline radar scans of the target fault zone during scheduled
              orbital revisits.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
            <span className="font-mono text-cyan-400 font-bold block text-sm">Step 2</span>
            <h4 className="font-semibold text-slate-200">Earthquake Event</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Fault slip fractures crustal rocks, moving the land up, down, or sideways by
              centimeters to meters.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
            <span className="font-mono text-cyan-400 font-bold block text-sm">Step 3</span>
            <h4 className="font-semibold text-slate-200">Post-Event Pass</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Satellite re-flies the exact same orbital corridor, transmitting radar pulses to
              measure phase shifts.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
            <span className="font-mono text-cyan-400 font-bold block text-sm">Step 4</span>
            <h4 className="font-semibold text-slate-200">InSAR Interferogram</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Computers calculate interference fringes, revealing exact displacement contours across
              thousands of square kilometers.
            </p>
          </div>
        </div>

        {/* Essential Scientific Truth */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg text-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-200 font-mono font-semibold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Satellites Complement Ground Seismology</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Ground seismometers provide millisecond timing and trigger immediate earthquake early
            warnings (seconds before shaking arrives). Satellites provide comprehensive spatial
            coverage of the entire fault rupture field that would otherwise require thousands of
            physical GPS stations. Together, they give geologists a complete empirical picture.
          </p>
        </div>
      </section>
    </div>
  );
};

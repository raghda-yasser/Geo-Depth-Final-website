import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#05070a] border-t border-slate-900 text-slate-400 text-xs py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Mandate */}
          <div className="md:col-span-1 space-y-3">
            <div className="text-sm font-bold text-slate-200 font-mono tracking-wider">
              GEO<span className="text-cyan-400">DEPTH</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Understand Earthquakes. Discover Their Impact. Stay Safe. An interactive educational
              and scientific platform bridging seismology, satellite geodesy, and disaster preparedness.
            </p>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Scientific Data Verified & Peer-Reviewed Sources</span>
            </div>
          </div>

          {/* Col 2: Earth Science & Geodesy Sources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-3">
              Earth Science & Geodesy
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://earthquake.usgs.gov/earthquakes/feed/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 text-slate-400 hover:underline"
                >
                  USGS Real-time Feeds <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://dataspace.copernicus.eu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 text-slate-400 hover:underline"
                >
                  ESA Copernicus Sentinel-1 <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://aria.jpl.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 text-slate-400 hover:underline"
                >
                  NASA JPL / Caltech ARIA <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://asf.alaska.edu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 text-slate-400 hover:underline"
                >
                  Alaska Satellite Facility <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Humanitarian Impact & Relief */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-3">
              Humanitarian Impact
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.unocha.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 text-slate-400 hover:underline"
                >
                  UN OCHA <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://reliefweb.int/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 text-slate-400 hover:underline"
                >
                  ReliefWeb Disaster Reports <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.who.int/emergencies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 text-slate-400 hover:underline"
                >
                  WHO Health Emergencies <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Safety & Preparedness */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono mb-3">
              Public Safety Standards
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.fema.gov/emergency-managers/risk-management/earthquake"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 text-slate-400 hover:underline"
                >
                  FEMA Earthquake Guidance <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.cdc.gov/earthquakes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 text-slate-400 hover:underline"
                >
                  CDC Earthquake Safety <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.shakeout.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1 text-slate-400 hover:underline"
                >
                  Great ShakeOut Drills <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Quiet Disclaimer */}
        <div className="pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            Educational and scientific reference. GEO DEPTH is not an active emergency alarm service.
            Always obey instructions from local emergency managers.
          </p>
          <div className="font-mono text-slate-400">
            WGS84 Coordinates · UTC Timestamps · Mw Scale
          </div>
        </div>
      </div>
    </footer>
  );
};

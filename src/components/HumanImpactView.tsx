import React, { useState } from 'react';
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
  FileCheck
} from 'lucide-react';
import { HUMAN_IMPACT_RECORDS } from '../data/humanImpactData.ts';
import { HumanImpactRecord } from '../types/earthquake.ts';

export const HumanImpactView: React.FC = () => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(HUMAN_IMPACT_RECORDS[0].id);

  const selectedRecord: HumanImpactRecord =
    HUMAN_IMPACT_RECORDS.find((r) => r.id === selectedRecordId) || HUMAN_IMPACT_RECORDS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Page Title & Subtitle */}
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

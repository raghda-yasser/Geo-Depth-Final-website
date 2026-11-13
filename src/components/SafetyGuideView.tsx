import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckSquare,
  Square,
  HelpCircle,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Package,
  Info,
  Building2,
  Trees,
  Car,
  GraduationCap,
  Briefcase,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DropIllustration,
  CoverIllustration,
  HoldOnIllustration,
  SituationBuildingIllustration,
  SituationOutdoorsIllustration,
  SituationDrivingIllustration,
  SituationSchoolIllustration,
  SituationWorkIllustration,
} from './SafetyIllustrations.tsx';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SAFETY_QUIZ: QuizQuestion[] = [
  {
    question: 'If you are indoors when strong shaking starts, what is the safest immediate action?',
    options: [
      'Run immediately out into the street through the nearest doorway',
      'Drop to your hands and knees, take Cover under a sturdy table, and Hold On',
      'Stand in a doorway because doorways are always the strongest part of modern buildings',
      'Head immediately to the elevator to reach ground level quickly'
    ],
    correctIndex: 1,
    explanation:
      'DROP, COVER, HOLD ON is endorsed by USGS, FEMA, and CDC. Running during violent shaking often causes severe falls and exposes you to falling glass, bricks, and facades. Doorways in modern homes are no stronger than any other part and do not protect against falling objects.'
  },
  {
    question: 'Why should you avoid using matches, candles, or lighters immediately after an earthquake?',
    options: [
      'Open flames consume too much oxygen in confined spaces',
      'Ruptured gas lines and broken pipelines may cause catastrophic gas explosions',
      'Candles attract seismic aftershocks',
      'Matches interfere with emergency two-way radio frequencies'
    ],
    correctIndex: 1,
    explanation:
      'Earthquakes frequently sever underground natural gas mains and domestic pipe fittings. Any spark or naked flame can ignite leaking gas pockets, triggering massive post-earthquake conflagrations.'
  },
  {
    question: 'If you are driving on a highway or bridge when an earthquake occurs, what should you do?',
    options: [
      'Accelerate rapidly to clear the bridge before it collapses',
      'Pull over safely to the side away from overpasses, bridges, and power lines, set the parking brake, and stay inside',
      'Stop abruptly in the middle lane and abandon the vehicle immediately',
      'Swerve back and forth to keep tires aligned with seismic ground motion'
    ],
    correctIndex: 1,
    explanation:
      'Pull over safely out of traffic, avoiding overpasses, utility poles, and hanging signs. Stay inside your vehicle until shaking stops; the car suspension absorbs tremors and protects against falling debris.'
  },
  {
    question: 'How much emergency drinking water does FEMA recommend storing per person per day?',
    options: [
      'Half a cup per day',
      'At least 1 gallon (approximately 3.8 liters) per person per day for a minimum of 3 days',
      'Only as much as you can comfortably carry in a pocket flask',
      'Bottled soda and sugary drinks are superior to plain water'
    ],
    correctIndex: 1,
    explanation:
      'FEMA and CDC recommend at least 1 gallon of potable water per person per day (half for drinking, half for basic hygiene), stockpiled for a minimum of 72 hours (3 days), or ideally 2 weeks in earthquake-prone zones.'
  },
  {
    question: 'If you are along an ocean coast and feel strong or prolonged ground shaking, what should you do immediately?',
    options: [
      'Wait on the beach to photograph any receding ocean water or unusual waves',
      'Wait for an official television or siren broadcast before moving',
      'Immediately move inland and to high ground (at least 30 meters above sea level) on foot',
      'Swim out into deep ocean water where waves are smaller'
    ],
    correctIndex: 2,
    explanation:
      'Strong shaking near coastal areas is nature\'s own tsunami warning. Subsea faults can generate destructive tsunami waves that arrive in mere minutes, before official warning sirens can sound. Immediately evacuate to high ground on foot.'
  }
];

const EMERGENCY_KIT_ITEMS = [
  { id: 'water', label: 'Water (1 gallon per person per day for at least 3 days)', category: 'hydration' },
  { id: 'food', label: 'Non-perishable food (canned goods, dried fruit, nutrition bars - 3-day supply)', category: 'nutrition' },
  { id: 'first_aid', label: 'First-aid kit (bandages, antiseptic wipes, sterile gauze, shears, burn gel)', category: 'medical' },
  { id: 'flashlight', label: 'Flashlight (LED) or headlamp + spare fresh batteries', category: 'tools' },
  { id: 'powerbank', label: 'High-capacity power bank & charging cables for mobile phones', category: 'communication' },
  { id: 'radio', label: 'Emergency NOAA weather radio (hand-crank or battery-operated)', category: 'communication' },
  { id: 'medication', label: 'Essential prescription medications (at least 7-day personal supply)', category: 'medical' },
  { id: 'whistle', label: 'Emergency signaling whistle (to signal rescuers without exhausting your voice)', category: 'tools' },
  { id: 'documents', label: 'Important documents in a waterproof sealable pouch (IDs, insurance, deeds)', category: 'records' },
  { id: 'hygiene', label: 'Sanitation & hygiene supplies (wet wipes, hand sanitizer, heavy trash bags)', category: 'hygiene' }
];

interface DropCoverHoldStep {
  id: 'drop' | 'cover' | 'hold-on';
  stepNumber: string;
  title: string;
  instruction: string;
  Illustration: React.FC;
}

const DROP_COVER_HOLD_STEPS: DropCoverHoldStep[] = [
  {
    id: 'drop',
    stepNumber: '01',
    title: 'DROP',
    instruction:
      'Drop immediately onto your hands and knees before strong shaking knocks you down. This position keeps you low and lets you crawl to nearby shelter.',
    Illustration: DropIllustration,
  },
  {
    id: 'cover',
    stepNumber: '02',
    title: 'COVER',
    instruction:
      'Crawl underneath a sturdy table or desk and cover the back of your head and neck with your arms. Stay away from glass windows, mirrors, and tall shelves.',
    Illustration: CoverIllustration,
  },
  {
    id: 'hold-on',
    stepNumber: '03',
    title: 'HOLD ON',
    instruction:
      'Grip a sturdy leg of your table or desk firmly with one hand while continuing to shield your head and neck with the other arm until shaking completely stops.',
    Illustration: HoldOnIllustration,
  },
];

interface SituationGuidance {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  Illustration: React.FC;
  steps: string[];
  avoidNote: string;
}

const SITUATION_GUIDANCE: SituationGuidance[] = [
  {
    id: 'inside-building',
    title: 'Inside a Building',
    subtitle: 'What to do during an earthquake indoors',
    icon: Building2,
    Illustration: SituationBuildingIllustration,
    steps: [
      'Stay indoors until shaking stops and it is safe to exit — do not run outside during shaking.',
      'Drop to your hands and knees, take Cover under a sturdy desk or against an interior wall away from windows, and Hold On.',
      'Protect your head and neck from falling ceiling tiles, light fixtures, and heavy furniture.',
      'If you are in bed, stay there, turn face down, and cover your head and neck with a pillow.',
    ],
    avoidNote: 'Do not stand in doorways or use elevators during or immediately after shaking.',
  },
  {
    id: 'outdoors',
    title: 'Outdoors',
    subtitle: 'How to stay safe in an open outdoor area',
    icon: Trees,
    Illustration: SituationOutdoorsIllustration,
    steps: [
      'Move smoothly to a clear, open area away from buildings, brick walls, trees, and streetlights.',
      'Stay well clear of downed or overhead electrical utility wires and fuel lines.',
      'Drop low to the ground and shield your head with your arms until the ground stops moving.',
      'If you are near coastal waters and feel strong or prolonged shaking, move immediately to high ground.',
    ],
    avoidNote: 'Avoid sheltering under building awnings, glass facades, balconies, or tall masonry walls.',
  },
  {
    id: 'while-driving',
    title: 'While Driving',
    subtitle: 'What to do if an earthquake occurs while driving',
    icon: Car,
    Illustration: SituationDrivingIllustration,
    steps: [
      'Slow down gradually and pull safely over to the side of the road without blocking emergency lanes.',
      'Stop clear of bridges, overpasses, underpasses, trees, tall signs, and power lines.',
      'Engage the parking brake, turn on hazard lights, and remain buckled inside the vehicle.',
      'After shaking stops, proceed cautiously and avoid damaged roads, ramps, or cracked bridges.',
    ],
    avoidNote: 'Do not stop underneath highway overpasses or exit your car near live power lines.',
  },
  {
    id: 'at-school',
    title: 'At School',
    subtitle: 'How students and teachers should respond',
    icon: GraduationCap,
    Illustration: SituationSchoolIllustration,
    steps: [
      'Immediately Drop, Cover under your classroom desk or sturdy table, and Hold On facing away from windows.',
      'If in a hallway, gymnasium, or cafeteria without desks, crouch against an interior wall and cover your head and neck.',
      'Listen calmly for teacher instructions once shaking stops before evacuating in an orderly line to the designated assembly field.',
      'Wait with your class for attendance checks and parent reunification protocols.',
    ],
    avoidNote: 'Do not rush for stairwells, exits, or lockers while shaking is still active.',
  },
  {
    id: 'at-work',
    title: 'At Work',
    subtitle: 'What employees should do during an earthquake',
    icon: Briefcase,
    Illustration: SituationWorkIllustration,
    steps: [
      'Drop, Cover beneath a sturdy desk or workbench, and Hold On away from glass partitions, filing cabinets, and server racks.',
      'If working near machinery, laboratories, or industrial equipment, step clear of unanchored loads and hazardous materials.',
      'Once shaking stops, check coworkers nearby for injuries and exit via marked emergency stairs — never elevators.',
      'Follow your workplace floor warden to the outdoor muster point and account for all team members.',
    ],
    avoidNote: 'Never re-enter an office or industrial facility until structural safety is cleared.',
  },
];

export const SafetyGuideView: React.FC = () => {
  // Checklist State in LocalStorage
  const [checkedKit, setCheckedKit] = useState<{ [id: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('geo_depth_emergency_kit');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<{ [qIdx: number]: number | null }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Interactive Situations Accordion State (single active item at a time)
  const [activeSituationId, setActiveSituationId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('geo_depth_emergency_kit', JSON.stringify(checkedKit));
    } catch {
      // Ignore quota
    }
  }, [checkedKit]);

  const toggleKitItem = (id: string) => {
    setCheckedKit((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const completedCount = Object.values(checkedKit).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / EMERGENCY_KIT_ITEMS.length) * 100);

  // Calculate Quiz Score
  const quizScore = Object.entries(quizAnswers).reduce((acc, [qIdx, chosen]) => {
    const idx = parseInt(qIdx, 10);
    return chosen === SAFETY_QUIZ[idx].correctIndex ? acc + 1 : acc;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Important Note Banner at Top */}
      <div className="p-3.5 bg-amber-950/35 border border-amber-700/50 rounded-xl flex items-start sm:items-center gap-3 text-xs text-amber-200">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
        <div>
          <strong className="font-mono uppercase tracking-wider text-amber-300 mr-1.5">
            Important Note:
          </strong>
          <span>Geo Depth is an educational platform, not an official emergency alert service.</span>
        </div>
      </div>

      {/* Page Title & Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>Practical Preparedness Standards · FEMA · CDC · USGS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Earthquake Safety Guide
        </h1>
        <p className="text-base font-medium text-slate-300">
          Know What to Do. Protect Yourself and Others.
        </p>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          Earthquakes strike without immediate warning. Seconds count. Follow these evidence-based
          protocols established by the USGS, FEMA, and the CDC to prepare your home, respond
          correctly during shaking, and protect your family afterward.
        </p>
      </div>

      {/* THREE CORE PHASES: BEFORE, DURING, AFTER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PHASE A: BEFORE AN EARTHQUAKE */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider">
                Phase A
              </span>
              <span className="text-[11px] font-mono text-slate-400">Preparation</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100">Before an Earthquake</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">·</span>
                <span><strong>Secure Heavy Furniture:</strong> Strap tall bookcases, water heaters, mirrors, and large televisions to wall studs with heavy L-brackets.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">·</span>
                <span><strong>Identify Safe Zones:</strong> Locate sturdy tables, desks, or interior walls away from glass windows and hanging lighting fixtures.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">·</span>
                <span><strong>Family Emergency Plan:</strong> Establish an out-of-area contact person everyone can text when local cell circuits are congested.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">·</span>
                <span><strong>Locate Shutoffs:</strong> Teach responsible family members how to shut off the gas valve (with an attached wrench) and main electrical breaker.</span>
              </li>
            </ul>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-400">
            FEMA tip: Most earthquake-related injuries occur from falling objects, not building collapses.
          </div>
        </div>

        {/* PHASE B: DURING AN EARTHQUAKE */}
        <div className="bg-[#0b0e17] border border-cyan-500/40 rounded-xl p-5 space-y-4 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono text-xs text-rose-400 font-bold uppercase tracking-wider">
                Phase B · Survival
              </span>
              <span className="text-[11px] font-mono text-cyan-400 font-bold">IMMEDIATE ACTION</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100">During an Earthquake</h3>

            {/* DROP COVER HOLD ON CALLOUT */}
            <div className="p-3 bg-cyan-950/40 border border-cyan-500/50 rounded-lg text-center space-y-1">
              <div className="text-base font-extrabold font-mono text-cyan-300 tracking-wider">
                DROP · COVER · HOLD ON
              </div>
              <p className="text-[11px] text-cyan-100">
                Endorsed by emergency services worldwide.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                <strong className="text-slate-100 block font-mono text-[11px]">1. Inside a Building:</strong>
                <span className="text-slate-400 text-[11px]">Drop to hands and knees. Crawl under sturdy shelter (table/desk). Cover head and neck. Hold on until shaking stops. Do NOT run outdoors.</span>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                <strong className="text-slate-100 block font-mono text-[11px]">2. In Bed:</strong>
                <span className="text-slate-400 text-[11px]">Stay in bed. Turn face down to protect vital organs. Cover head and neck with a firm pillow.</span>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                <strong className="text-slate-100 block font-mono text-[11px]">3. Outdoors:</strong>
                <span className="text-slate-400 text-[11px]">Move immediately to a clear open area away from buildings, power cables, streetlights, and brick chimneys.</span>
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded border border-slate-800">
                <strong className="text-slate-100 block font-mono text-[11px]">4. In a Vehicle:</strong>
                <span className="text-slate-400 text-[11px]">Pull over safely away from overpasses, bridges, and electrical towers. Set parking brake and remain inside.</span>
              </div>
            </div>
          </div>
          <div className="p-3 bg-rose-950/30 border border-rose-900/40 rounded text-[11px] text-rose-300 font-mono">
            NEVER use elevators during or immediately after an earthquake.
          </div>
        </div>

        {/* PHASE C: AFTER AN EARTHQUAKE */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
                Phase C
              </span>
              <span className="text-[11px] font-mono text-slate-400">Recovery & Caution</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100">After an Earthquake</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">·</span>
                <span><strong>Expect Aftershocks:</strong> Additional tremors can occur minutes, days, or months later, potentially toppling compromised buildings.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">·</span>
                <span><strong>Check for Injuries:</strong> Provide first aid. Do not move seriously injured persons unless they are in immediate danger.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">·</span>
                <span><strong>Check Gas & Sparks:</strong> Smell for gas. If smelled, open windows, evacuate immediately, and turn off the exterior main gas valve.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">·</span>
                <span><strong>Tsunami Evacuation:</strong> If coastal and shaking lasted over 20 seconds or knocked you down, head to high ground immediately on foot.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">·</span>
                <span><strong>Official Instructions:</strong> Listen to emergency broadcasts via battery/hand-crank radio. Keep phone lines open for 911 emergencies.</span>
              </li>
            </ul>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-400">
            Put on sturdy shoes before walking through debris to prevent lacerations from shattered glass.
          </div>
        </div>
      </div>

      {/* DROP, COVER, AND HOLD ON — VISUAL ACTION ILLUSTRATIONS */}
      <section className="bg-[#0b0e17] border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
        <div className="border-b border-slate-800 pb-4 space-y-1">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            Visual Action Guide · During Shaking
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Drop, Cover, and Hold On
          </h2>
          <p className="text-xs text-slate-400">
            Follow these three immediate physical steps when shaking begins to protect vital organs from falling debris.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DROP_COVER_HOLD_STEPS.map((step) => {
            const StepIllustration = step.Illustration;
            return (
              <div
                key={step.id}
                className="bg-[#0d121d] border border-cyan-500/25 rounded-xl overflow-hidden flex flex-col shadow-lg"
              >
                <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-slate-800/80">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs font-bold text-cyan-400">{step.stepNumber}</span>
                    <span className="text-slate-600">·</span>
                    <h3 className="text-sm font-extrabold text-cyan-300 tracking-wider uppercase">
                      {step.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    Action Guide
                  </span>
                </div>

                <div className="w-full aspect-[400/260] bg-[#090d16] border-b border-slate-800/80 overflow-hidden">
                  <StepIllustration />
                </div>

                <div className="p-5 flex-1">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {step.instruction}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* NEW INTERACTIVE SECTION: WHAT TO DO IN DIFFERENT SITUATIONS */}
      <section className="bg-[#0b0e17] border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
        <div className="border-b border-slate-800 pb-4 space-y-1">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            Interactive Scenario Response
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            What To Do in Different Situations
          </h2>
          <p className="text-xs text-slate-400">
            Select a situation below to view clear, practical earthquake safety instructions for your surroundings.
          </p>
        </div>

        <div className="space-y-3">
          {SITUATION_GUIDANCE.map((situation) => {
            const IconComponent = situation.icon;
            const isOpen = activeSituationId === situation.id;

            return (
              <div
                key={situation.id}
                className={`rounded-xl border transition-colors overflow-hidden ${
                  isOpen
                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setActiveSituationId((prev) =>
                      prev === situation.id ? null : situation.id
                    )
                  }
                  className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-4 transition-colors focus:outline-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? 'bg-cyan-500/15 border-cyan-400/60 text-cyan-400'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3
                        className={`text-sm font-bold transition-colors ${
                          isOpen ? 'text-cyan-300' : 'text-slate-100'
                        }`}
                      >
                        {situation.title}
                      </h3>
                      <p className="text-xs text-slate-400 truncate sm:whitespace-normal">
                        {situation.subtitle}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.24, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 pt-3 sm:pl-[4.5rem] border-t border-slate-800/80 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                        <div className="lg:col-span-7 space-y-3">
                          <ul className="space-y-2 text-xs text-slate-200">
                            {situation.steps.map((stepText, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                                <span className="font-mono text-cyan-400 font-bold shrink-0">
                                  0{idx + 1}
                                </span>
                                <span>{stepText}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="p-2.5 bg-rose-950/30 border border-rose-900/40 rounded-lg text-[11px] text-rose-300 font-mono">
                            Avoid: {situation.avoidNote}
                          </div>
                        </div>

                        <div className="lg:col-span-5 w-full aspect-[400/260] rounded-xl border border-cyan-500/25 bg-[#090d16] overflow-hidden shadow-inner">
                          <situation.Illustration />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* INTERACTIVE EMERGENCY KIT CHECKLIST */}
      <section className="bg-[#0b0e17] border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold uppercase">
              <Package className="w-4 h-4" />
              <span>Interactive 72-Hour Disaster Preparedness Checklist</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">
              Emergency Go-Bag & Home Kit
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Check off supplies you have prepared. Your progress is saved locally in your browser.
            </p>
          </div>

          {/* Progress Bar Badge */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg font-mono text-xs space-y-1.5 shrink-0 sm:w-56">
            <div className="flex justify-between">
              <span className="text-slate-400">Kit Preparedness:</span>
              <span className="text-cyan-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 text-right">
              {completedCount} of {EMERGENCY_KIT_ITEMS.length} items verified
            </div>
          </div>
        </div>

        {/* Checklist Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {EMERGENCY_KIT_ITEMS.map((item) => {
            const isChecked = !!checkedKit[item.id];
            return (
              <button
                key={item.id}
                onClick={() => toggleKitItem(item.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors flex items-start gap-3 ${
                  isChecked
                    ? 'bg-cyan-950/30 border-cyan-500/40 text-slate-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="mt-0.5 shrink-0 text-cyan-400">
                  {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </div>
                <div className="text-xs">
                  <span className={isChecked ? 'line-through text-slate-400' : 'font-medium'}>
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {completedCount > 0 && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setCheckedKit({})}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors font-mono"
            >
              Reset Checklist
            </button>
          </div>
        )}
      </section>

      {/* INTERACTIVE EARTHQUAKE SAFETY QUIZ */}
      <section className="bg-[#0b0e17] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold uppercase">
              <HelpCircle className="w-4 h-4" />
              <span>Evidence-Based Decision Training</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">
              Interactive Earthquake Safety Quiz
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              5 practical scenario questions based on USGS and FEMA safety directives.
            </p>
          </div>

          {quizSubmitted && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono shrink-0">
              <span>Your Score: </span>
              <strong className={quizScore >= 4 ? 'text-emerald-400' : 'text-amber-400'}>
                {quizScore} / {SAFETY_QUIZ.length}
              </strong>{' '}
              ({Math.round((quizScore / SAFETY_QUIZ.length) * 100)}%)
            </div>
          )}
        </div>

        {/* Quiz Questions */}
        <div className="space-y-6">
          {SAFETY_QUIZ.map((q, qIdx) => {
            const selectedOpt = quizAnswers[qIdx];
            const isCorrect = selectedOpt === q.correctIndex;

            return (
              <div
                key={qIdx}
                className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-3"
              >
                <div className="flex items-start gap-2">
                  <span className="font-mono text-cyan-400 font-bold text-xs shrink-0 mt-0.5">
                    Q{qIdx + 1}.
                  </span>
                  <h4 className="text-sm font-semibold text-slate-200">{q.question}</h4>
                </div>

                {/* Options */}
                <div className="space-y-1.5 pl-6">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    let optStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850';

                    if (quizSubmitted) {
                      if (optIdx === q.correctIndex) {
                        optStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-medium';
                      } else if (isSelected && !isCorrect) {
                        optStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                      } else {
                        optStyle = 'bg-slate-900/40 border-slate-850 text-slate-500';
                      }
                    } else if (isSelected) {
                      optStyle = 'bg-cyan-950/60 border-cyan-400 text-cyan-200 font-medium';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={quizSubmitted}
                        onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex items-center justify-between ${optStyle}`}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && optIdx === q.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                        {quizSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Explanation */}
                {quizSubmitted && (
                  <div
                    className={`mt-2 p-3 rounded-lg text-xs leading-relaxed border ${
                      isCorrect
                        ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                        : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                    }`}
                  >
                    <strong className="block font-mono text-[11px] mb-1">
                      {isCorrect ? 'Correct!' : 'Scientific Safety Protocol:'}
                    </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quiz Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <div className="text-xs font-mono text-slate-400">
            {Object.keys(quizAnswers).length} of {SAFETY_QUIZ.length} questions answered
          </div>
          <div className="flex items-center gap-3">
            {quizSubmitted ? (
              <button
                onClick={() => {
                  setQuizSubmitted(false);
                  setQuizAnswers({});
                }}
                className="px-4 py-2 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
            ) : (
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={Object.keys(quizAnswers).length === 0}
                className="px-5 py-2 text-xs font-mono font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-md transition-colors shadow-lg shadow-cyan-950"
              >
                Submit Answers & View Explanations
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Official Guidelines Citation Bar */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          Authored from public domain safety recommendations by USGS, FEMA, CDC, and Great ShakeOut.
        </div>
        <div className="flex items-center gap-4 font-mono text-cyan-400">
          <a
            href="https://www.shakeout.org/dropcoverholdon/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1"
          >
            ShakeOut Protocols <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://www.ready.gov/earthquakes"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1"
          >
            Ready.gov Guide <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

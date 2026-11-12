import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckSquare,
  Square,
  HelpCircle,
  AlertTriangle,
  Flame,
  Radio,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Package
} from 'lucide-react';

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

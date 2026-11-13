import React, { useState } from 'react';
import {
  Activity,
  Menu,
  X,
  Globe,
  Satellite,
  Layers,
  HeartPulse,
  ShieldCheck,
  Home,
  Mountain,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ActiveTab =
  | 'home'
  | 'earth-explorer'
  | 'earthquakes'
  | 'satellite-explorer'
  | 'understand-earthquakes'
  | 'earth-impact'
  | 'human-impact'
  | 'safety-guide';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  earthquakeCount?: number;
}

interface NavItemConfig {
  id: ActiveTab;
  label: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', label: 'Home' },
  { id: 'earth-explorer', label: 'Earth Explorer' },
  { id: 'earthquakes', label: 'Earthquakes' },
  { id: 'satellite-explorer', label: 'Satellite Explorer' },
  { id: 'understand-earthquakes', label: 'Understand Earthquakes' },
  { id: 'earth-impact', label: 'Earth Impact' },
  { id: 'human-impact', label: 'Human Impact' },
  { id: 'safety-guide', label: 'Safety Guide' },
];

// Live, instrument-specific animated icon for each navigation section
const LiveNavIcon: React.FC<{
  id: ActiveTab;
  isActive: boolean;
  isHovered: boolean;
}> = ({ id, isActive, isHovered }) => {
  const iconClass = `w-3.5 h-3.5 shrink-0 transition-colors duration-200 ${
    isActive
      ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.65)]'
      : isHovered
      ? 'text-cyan-300'
      : 'text-slate-400'
  }`;

  switch (id) {
    case 'home':
      return (
        <motion.span
          className="inline-flex items-center justify-center"
          animate={
            isHovered
              ? { y: -2, scale: 1.15 }
              : isActive
              ? { scale: [1, 1.08, 1] }
              : { y: 0, scale: 1 }
          }
          transition={
            isHovered
              ? { type: 'spring', stiffness: 450, damping: 18 }
              : isActive
              ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.2 }
          }
        >
          <Home className={iconClass} />
        </motion.span>
      );

    case 'earth-explorer':
      return (
        <motion.span
          className="inline-flex items-center justify-center"
          animate={
            isHovered
              ? { rotate: 180, scale: 1.15 }
              : isActive
              ? { rotate: 360 }
              : { rotate: 0, scale: 1 }
          }
          transition={
            isHovered
              ? { duration: 0.55, ease: 'easeOut' }
              : isActive
              ? { duration: 14, repeat: Infinity, ease: 'linear' }
              : { duration: 0.25 }
          }
        >
          <Globe className={iconClass} />
        </motion.span>
      );

    case 'earthquakes':
      return (
        <motion.span
          className="inline-flex items-center justify-center"
          animate={
            isHovered
              ? { scale: [1, 1.25, 0.95, 1.15, 1], x: [0, -1, 1, -1, 0] }
              : isActive
              ? { scale: [1, 1.14, 1, 1.08, 1] }
              : { scale: 1, x: 0 }
          }
          transition={
            isHovered
              ? { duration: 0.45, ease: 'easeInOut' }
              : isActive
              ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.2 }
          }
        >
          <Activity className={iconClass} />
        </motion.span>
      );

    case 'satellite-explorer':
      return (
        <motion.span
          className="inline-flex items-center justify-center"
          animate={
            isHovered
              ? { rotate: [0, -18, 12, 0], y: -1.5, scale: 1.15 }
              : isActive
              ? { rotate: [-6, 6, -6], y: [-1, 1, -1] }
              : { rotate: 0, y: 0, scale: 1 }
          }
          transition={
            isHovered
              ? { duration: 0.5, ease: 'easeInOut' }
              : isActive
              ? { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.2 }
          }
        >
          <Satellite className={iconClass} />
        </motion.span>
      );

    case 'understand-earthquakes':
      return (
        <motion.span
          className="inline-flex items-center justify-center"
          animate={
            isHovered
              ? { y: [0, -2, 0], scale: 1.15 }
              : isActive
              ? { y: [0, -1.5, 0] }
              : { y: 0, scale: 1 }
          }
          transition={
            isHovered
              ? { duration: 0.35, ease: 'easeOut' }
              : isActive
              ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.2 }
          }
        >
          <Layers className={iconClass} />
        </motion.span>
      );

    case 'human-impact':
      return (
        <motion.span
          className="inline-flex items-center justify-center"
          animate={
            isHovered
              ? { scale: [1, 1.24, 1.05, 1.2, 1] }
              : isActive
              ? { scale: [1, 1.14, 1, 1.1, 1] }
              : { scale: 1 }
          }
          transition={
            isHovered
              ? { duration: 0.55, ease: 'easeInOut' }
              : isActive
              ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.2 }
          }
        >
          <HeartPulse className={iconClass} />
        </motion.span>
      );

    case 'earth-impact':
      return (
        <motion.span
          className="inline-flex items-center justify-center"
          animate={
            isHovered
              ? { scale: 1.18, y: [0, -2, 0] }
              : isActive
              ? { scale: [1, 1.09, 1] }
              : { scale: 1, y: 0 }
          }
          transition={
            isHovered
              ? { duration: 0.4, ease: 'easeOut' }
              : isActive
              ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.2 }
          }
        >
          <Mountain className={iconClass} />
        </motion.span>
      );

    case 'safety-guide':
      return (
        <motion.span
          className="inline-flex items-center justify-center"
          animate={
            isHovered
              ? { scale: 1.18, rotate: [0, -8, 8, 0] }
              : isActive
              ? { scale: [1, 1.08, 1] }
              : { scale: 1, rotate: 0 }
          }
          transition={
            isHovered
              ? { duration: 0.45, ease: 'easeInOut' }
              : isActive
              ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.2 }
          }
        >
          <ShieldCheck className={iconClass} />
        </motion.span>
      );
  }
};

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, earthquakeCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<ActiveTab | null>(null);
  const [brandHovered, setBrandHovered] = useState(false);
  const [logoPulseId, setLogoPulseId] = useState(0);

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07090e]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 h-16">
        {/* Zone 1: Interactive Live Geophysical & Orbital Brand Logo */}
        <motion.button
          type="button"
          onClick={() => {
            setLogoPulseId((c) => c + 1);
            handleNavClick('home');
          }}
          onMouseEnter={() => setBrandHovered(true)}
          onMouseLeave={() => setBrandHovered(false)}
          whileHover={{ x: 1 }}
          whileTap={{ scale: 0.94 }}
          className="flex items-center gap-3 text-left text-slate-100 whitespace-nowrap shrink-0 group focus:outline-none cursor-pointer"
          aria-label="GEO DEPTH Home"
        >
          <motion.div
            animate={
              brandHovered
                ? {
                    scale: 1.12,
                    borderColor: 'rgba(34, 211, 238, 0.95)',
                    boxShadow: '0 0 24px rgba(34, 211, 238, 0.5)',
                  }
                : {
                    scale: 1,
                    borderColor: 'rgba(6, 182, 212, 0.45)',
                    boxShadow: '0 0 14px rgba(6, 182, 212, 0.22)',
                  }
            }
            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
            className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#081526] via-[#0c1a2e] to-[#05080f] border flex items-center justify-center overflow-visible"
          >
            {/* Ambient continuous seismic breathing ring */}
            <motion.span
              aria-hidden="true"
              animate={{
                scale: brandHovered ? [1, 1.48, 1.55] : [1, 1.28, 1],
                opacity: brandHovered ? [0.65, 0.15, 0] : [0.35, 0, 0.35],
              }}
              transition={{
                duration: brandHovered ? 1.15 : 2.8,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute inset-0 rounded-xl border border-cyan-400/70 pointer-events-none"
            />

            {/* Click-triggered shockwave burst */}
            <AnimatePresence>
              {logoPulseId > 0 && (
                <motion.span
                  key={logoPulseId}
                  aria-hidden="true"
                  initial={{ scale: 0.9, opacity: 0.95 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-xl border-2 border-cyan-300 pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* GEO DEPTH Tectonic Depth Strata + Fault Pulse + Seismic Radiating Core SVG */}
            <svg
              viewBox="0 0 40 40"
              fill="none"
              className="w-8 h-8 relative z-10 overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="depthCoreGlow" cx="50%" cy="52%" r="55%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.38" />
                  <stop offset="65%" stopColor="#0284c7" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#082f49" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="strataStroke" x1="8" y1="14" x2="32" y2="33" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#67e8f9" />
                  <stop offset="50%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
                <linearGradient id="horizonPulse" x1="6" y1="15" x2="34" y2="15" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#a5f3fc" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Soft subsurface core illumination */}
              <circle cx="20" cy="21" r="15" fill="url(#depthCoreGlow)" />

              {/* Expanding live P-wave & S-wave seismic ripples from hypocenter */}
              <motion.circle
                cx="20"
                cy="21"
                stroke="#22d3ee"
                strokeWidth="1.15"
                animate={{
                  r: [4, 15.5],
                  opacity: [0.75, 0],
                }}
                transition={{
                  duration: brandHovered ? 1.1 : 2.2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
              <motion.circle
                cx="20"
                cy="21"
                stroke="#38bdf8"
                strokeWidth="1"
                animate={{
                  r: [4, 15.5],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: brandHovered ? 1.1 : 2.2,
                  delay: brandHovered ? 0.55 : 1.1,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />

              {/* Outer geophysical compass/horizon ring */}
              <circle
                cx="20"
                cy="20"
                r="15.5"
                stroke="#0ea5e9"
                strokeOpacity={brandHovered ? 0.85 : 0.45}
                strokeWidth="1.1"
                strokeDasharray="6 3"
              />

              {/* Upper crustal surface + live seismic waveform pulse */}
              <motion.path
                d="M7 15.5H14.2L16.8 10.5L20 20.5L23.2 12.2L25.4 15.5H33"
                stroke="url(#horizonPulse)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{
                  pathLength: [0.5, 1, 0.5],
                  pathOffset: [0, 0.25, 0],
                }}
                transition={{
                  duration: brandHovered ? 0.9 : 2.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Subsurface Depth Strata Chevrons (GEO DEPTH signature V-layers) */}
              <motion.path
                d="M9.5 22L20 32.5L30.5 22"
                stroke="url(#strataStroke)"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{
                  y: brandHovered ? [0, 1.5, 0] : 0,
                  opacity: brandHovered ? 1 : 0.9,
                }}
                transition={{
                  duration: 0.9,
                  repeat: brandHovered ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              />
              <motion.path
                d="M14 23L20 28.8L26 23"
                stroke="#67e8f9"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{
                  opacity: brandHovered ? [0.7, 1, 0.7] : [0.55, 0.9, 0.55],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Active Hypocenter Focus Beacon */}
              <motion.circle
                cx="20"
                cy="21"
                fill="#fbbf24"
                animate={{
                  r: brandHovered ? [2.1, 3.1, 2.1] : [1.7, 2.4, 1.7],
                }}
                transition={{
                  duration: brandHovered ? 0.75 : 1.7,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <circle cx="20" cy="21" r="1" fill="#fef3c7" />
            </svg>
          </motion.div>

          <div className="flex flex-col leading-none">
            <motion.span
              animate={
                brandHovered
                  ? { letterSpacing: '0.14em' }
                  : { letterSpacing: '0.08em' }
              }
              transition={{ duration: 0.25 }}
              className="text-base font-extrabold text-slate-100 font-mono group-hover:text-white transition-colors"
            >
              GEO
              <span className="text-cyan-400 font-normal group-hover:text-cyan-300 transition-colors">
                DEPTH
              </span>
            </motion.span>
          </div>
        </motion.button>

        {/* Zone 2: Navigation Links with Interactive Live Icons */}
        <nav className="hidden xl:flex items-center gap-1 2xl:gap-2 text-sm font-medium text-slate-300">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const isHovered = hoveredTab === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
                whileTap={{ scale: 0.96 }}
                className={`group transition-colors whitespace-nowrap shrink-0 text-[11px] tracking-wide uppercase font-medium px-2.5 py-1.5 rounded-md relative inline-flex items-center gap-1.5 ${
                  isActive
                    ? 'text-cyan-400 font-semibold bg-cyan-950/35'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <LiveNavIcon id={item.id} isActive={isActive} isHovered={isHovered} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-indicator"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute -bottom-[18px] left-1 right-1 h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Zone 3: Mobile Menu Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <motion.button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="xl:hidden p-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/70 rounded-md transition-colors"
            aria-label="Toggle navigation menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex"
                >
                  <X className="w-5 h-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex"
                >
                  <Menu className="w-5 h-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="xl:hidden border-t border-slate-800 bg-[#0b0e17] px-4 py-3 space-y-1 overflow-hidden"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-cyan-950/60 text-cyan-300 font-semibold border-l-2 border-cyan-400'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <LiveNavIcon id={item.id} isActive={isActive} isHovered={false} />
                    <span>{item.label}</span>
                  </span>
                  {item.id === 'earth-explorer' && earthquakeCount !== undefined && (
                    <span className="text-xs font-mono text-cyan-400">
                      {earthquakeCount} live
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

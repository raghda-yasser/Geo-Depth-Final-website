import React, { useState } from 'react';
import {
  Activity,
  Menu,
  X,
  Compass,
  Globe,
  Satellite,
  Layers,
  HeartPulse,
  ShieldCheck,
  Home,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ActiveTab =
  | 'home'
  | 'earth-explorer'
  | 'earthquakes'
  | 'satellite-explorer'
  | 'understand-earthquakes'
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
  const [ctaHovered, setCtaHovered] = useState(false);

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07090e]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 h-16">
        {/* Zone 1: Brand Wordmark with Live Seismograph Icon */}
        <motion.button
          type="button"
          onClick={() => handleNavClick('home')}
          onMouseEnter={() => setBrandHovered(true)}
          onMouseLeave={() => setBrandHovered(false)}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2.5 text-left text-slate-100 whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <motion.div
            animate={
              brandHovered
                ? { scale: 1.08, borderColor: 'rgba(34, 211, 238, 0.85)' }
                : { scale: 1, borderColor: 'rgba(6, 182, 212, 0.35)' }
            }
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="relative w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/35 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.18)] group-hover:shadow-[0_0_18px_rgba(34,211,238,0.45)] transition-shadow overflow-hidden"
          >
            {/* Live animated seismograph waveform */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-5 h-5 stroke-cyan-400"
              aria-hidden="true"
            >
              <motion.path
                d="M2 12h3.5l2-5.5 3 11 3-8.5 2 5 1.5-2H22"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0.4, pathOffset: 0 }}
                animate={{
                  pathLength: [0.35, 1, 0.35],
                  pathOffset: [0, 0.65, 1],
                  opacity: brandHovered ? 1 : [0.8, 1, 0.8],
                }}
                transition={{
                  duration: brandHovered ? 0.95 : 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </svg>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-wider text-slate-100 font-mono group-hover:text-white transition-colors">
              GEO<span className="text-cyan-400 font-normal">DEPTH</span>
            </span>
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

        {/* Zone 3: Primary Action & Mobile Menu Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <motion.button
            type="button"
            onClick={() => handleNavClick('earth-explorer')}
            onMouseEnter={() => setCtaHovered(true)}
            onMouseLeave={() => setCtaHovered(false)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 rounded-md transition-colors whitespace-nowrap shadow-sm shadow-cyan-950 hover:shadow-[0_0_18px_rgba(34,211,238,0.45)]"
          >
            <motion.span
              className="inline-flex items-center justify-center"
              animate={
                ctaHovered
                  ? { rotate: 180, scale: 1.15 }
                  : { rotate: [0, 14, -10, 6, 0] }
              }
              transition={
                ctaHovered
                  ? { duration: 0.45, ease: 'easeOut' }
                  : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <Compass className="w-3.5 h-3.5 stroke-[2.3]" />
            </motion.span>
            <span>Earth Explorer</span>
            {earthquakeCount !== undefined && earthquakeCount > 0 && (
              <motion.span
                animate={ctaHovered ? { scale: 1.08 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="text-[11px] font-mono font-bold px-1.5 py-0.5 bg-cyan-950 text-cyan-300 rounded ml-0.5 tabular-nums"
              >
                {earthquakeCount}
              </motion.span>
            )}
          </motion.button>

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

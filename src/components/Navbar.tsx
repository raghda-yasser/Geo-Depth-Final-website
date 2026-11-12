import React, { useState } from 'react';
import { Activity, Menu, X, Compass, Radio } from 'lucide-react';

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

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, earthquakeCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'earth-explorer', label: 'Earth Explorer' },
    { id: 'earthquakes', label: 'Earthquakes' },
    { id: 'satellite-explorer', label: 'Satellite Explorer' },
    { id: 'understand-earthquakes', label: 'Understand Earthquakes' },
    { id: 'human-impact', label: 'Human Impact' },
    { id: 'safety-guide', label: 'Safety Guide' },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07090e]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-16">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left text-slate-100 whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors">
            <Activity className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-wider text-slate-100 font-mono">
              GEO<span className="text-cyan-400 font-normal">DEPTH</span>
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`transition-colors whitespace-nowrap shrink-0 text-xs tracking-wide uppercase font-medium py-1 relative ${
                  isActive
                    ? 'text-cyan-400 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-cyan-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Mobile Menu Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleNavClick('earth-explorer')}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 rounded-md transition-colors whitespace-nowrap shadow-sm shadow-cyan-950"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Earth Explorer</span>
            {earthquakeCount !== undefined && earthquakeCount > 0 && (
              <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 bg-cyan-950 text-cyan-300 rounded ml-1">
                {earthquakeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-md transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-[#0b0e17] px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-cyan-950/60 text-cyan-300 font-semibold border-l-2 border-cyan-400'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'earth-explorer' && earthquakeCount !== undefined && (
                  <span className="text-xs font-mono text-cyan-400">
                    {earthquakeCount} live
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

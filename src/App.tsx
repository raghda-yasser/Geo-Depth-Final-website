import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { HomeView } from './components/HomeView.tsx';
import { EarthExplorerMap } from './components/EarthExplorerMap.tsx';
import { EarthquakesListView } from './components/EarthquakesListView.tsx';
import { SatelliteExplorerView } from './components/SatelliteExplorerView.tsx';
import { UnderstandEarthquakesView } from './components/UnderstandEarthquakesView.tsx';
import { HumanImpactView } from './components/HumanImpactView.tsx';
import { SafetyGuideView } from './components/SafetyGuideView.tsx';
import { EarthImpactView } from './components/EarthImpactView.tsx';
import { EarthquakeDetailModal } from './components/EarthquakeDetailModal.tsx';
import { EarthquakeFeature } from './types/earthquake.ts';
import { fetchEarthquakeFeed } from './services/earthquakeService.ts';

const VALID_TABS: ActiveTab[] = [
  'home',
  'earth-explorer',
  'earthquakes',
  'satellite-explorer',
  'understand-earthquakes',
  'earth-impact',
  'human-impact',
  'safety-guide',
];

function getInitialUrlState(): { tab: ActiveTab; eqId: string | null } {
  try {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as ActiveTab | null;
    const eqParam = params.get('eq');
    const tab = tabParam && VALID_TABS.includes(tabParam)
      ? tabParam
      : eqParam
      ? 'earth-explorer'
      : 'home';
    return { tab, eqId: eqParam };
  } catch {
    return { tab: 'home', eqId: null };
  }
}

export default function App() {
  const initialUrl = getInitialUrlState();

  const [activeTab, setActiveTab] = useState<ActiveTab>(initialUrl.tab);
  const [earthquakes, setEarthquakes] = useState<EarthquakeFeature[]>([]);
  const [totalLoadedCount, setTotalLoadedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Separate Modal state from Map-Focused state so "View on Earth Explorer" closes the modal and highlights the event on the map
  const [modalEarthquake, setModalEarthquake] = useState<EarthquakeFeature | null>(null);
  const [focusedEarthquake, setFocusedEarthquake] = useState<EarthquakeFeature | null>(null);
  const [pendingEqId, setPendingEqId] = useState<string | null>(initialUrl.eqId);
  const [focusedEarthquakeError, setFocusedEarthquakeError] = useState<string | null>(null);

  // Google Maps Platform Quota Alert state (Tier 2 handling)
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Fetch real USGS Earthquake Data on app mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const feed = await fetchEarthquakeFeed('all_week');
        if (isMounted) {
          setEarthquakes(feed.features);
          setTotalLoadedCount(feed.totalLoaded);
        }
      } catch (err) {
        console.error('Failed to load earthquake feed:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Resolve pending earthquake ID from URL (?eq=...) once data loads
  useEffect(() => {
    if (!pendingEqId || isLoading) return;

    const match = earthquakes.find((item) => item.id === pendingEqId);
    if (match) {
      setFocusedEarthquake(match);
      setFocusedEarthquakeError(null);
      setPendingEqId(null);
      return;
    }

    // Check sessionStorage backup in case the event was loaded from another feed or persisted across refresh
    try {
      const savedStr = sessionStorage.getItem('geo_depth_focused_eq');
      if (savedStr) {
        const savedEq: EarthquakeFeature = JSON.parse(savedStr);
        if (savedEq && savedEq.id === pendingEqId) {
          setFocusedEarthquake(savedEq);
          setFocusedEarthquakeError(null);
          setPendingEqId(null);
          return;
        }
      }
    } catch {
      // Ignore storage error
    }

    // Event ID was requested in URL but not found
    setFocusedEarthquakeError(
      `Selected earthquake (ID: ${pendingEqId}) could not be found in the current USGS dataset.`
    );
    setPendingEqId(null);
  }, [pendingEqId, isLoading, earthquakes]);

  // Synchronize activeTab & focusedEarthquake ID into URL query parameters
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', activeTab);
      const isSyncTab =
        activeTab === 'earth-explorer' ||
        activeTab === 'earth-impact' ||
        activeTab === 'human-impact';
      if (focusedEarthquake && isSyncTab) {
        params.set('eq', focusedEarthquake.id);
      } else if (!isSyncTab || !focusedEarthquake) {
        if (!pendingEqId) {
          params.delete('eq');
        }
      }
      const queryStr = params.toString();
      const newUrl = `${window.location.pathname}${queryStr ? `?${queryStr}` : ''}`;
      window.history.replaceState(null, '', newUrl);
    } catch {
      // Ignore history restrictions in sandboxed environments
    }
  }, [activeTab, focusedEarthquake, pendingEqId]);

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab !== 'earth-explorer' && tab !== 'earth-impact' && tab !== 'human-impact') {
      setFocusedEarthquakeError(null);
    }
  };

  const handleSelectSharedEarthquake = (eq: EarthquakeFeature | null) => {
    setFocusedEarthquakeError(null);
    setPendingEqId(null);
    setFocusedEarthquake(eq);
    try {
      if (eq) {
        sessionStorage.setItem('geo_depth_focused_eq', JSON.stringify(eq));
      } else {
        sessionStorage.removeItem('geo_depth_focused_eq');
      }
    } catch {
      // Ignore storage quota
    }
  };

  const handleOpenInMap = (eq: EarthquakeFeature) => {
    setModalEarthquake(null);
    handleSelectSharedEarthquake(eq);
    setActiveTab('earth-explorer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEarthImpact = (eq: EarthquakeFeature) => {
    setModalEarthquake(null);
    handleSelectSharedEarthquake(eq);
    setActiveTab('earth-impact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenHumanImpact = (eq: EarthquakeFeature) => {
    setModalEarthquake(null);
    handleSelectSharedEarthquake(eq);
    setActiveTab('human-impact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFocusedEarthquake = () => {
    handleSelectSharedEarthquake(null);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
      {/* GMP Quota Banner if triggered */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Main Navigation Top Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        earthquakeCount={totalLoadedCount}
      />

      {/* Primary View Routing */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            recentEarthquakes={earthquakes}
            totalCount={totalLoadedCount}
            onNavigate={handleSelectTab}
            onSelectEarthquake={setModalEarthquake}
          />
        )}

        {activeTab === 'earth-explorer' && (
          <EarthExplorerMap
            earthquakes={earthquakes}
            totalLoadedCount={totalLoadedCount}
            isLoading={isLoading}
            onOpenAnalysis={setModalEarthquake}
            onOpenEarthImpact={handleOpenEarthImpact}
            onOpenHumanImpact={handleOpenHumanImpact}
            focusedEarthquake={focusedEarthquake}
            onFocusEarthquake={handleSelectSharedEarthquake}
            onClearFocusedEarthquake={handleClearFocusedEarthquake}
            focusedEarthquakeError={focusedEarthquakeError}
            onDismissFocusedError={() => setFocusedEarthquakeError(null)}
          />
        )}

        {activeTab === 'earthquakes' && (
          <EarthquakesListView
            earthquakes={earthquakes}
            totalLoadedCount={totalLoadedCount}
            isLoading={isLoading}
            onSelectEarthquake={setModalEarthquake}
            onOpenMapWithEarthquake={handleOpenInMap}
          />
        )}

        {activeTab === 'satellite-explorer' && <SatelliteExplorerView />}

        {activeTab === 'understand-earthquakes' && <UnderstandEarthquakesView />}

        {activeTab === 'earth-impact' && (
          <EarthImpactView
            earthquakes={earthquakes}
            isLoadingFeed={isLoading}
            selectedEarthquake={focusedEarthquake}
            onSelectEarthquake={handleSelectSharedEarthquake}
            onOpenInMap={handleOpenInMap}
            onOpenHumanImpact={handleOpenHumanImpact}
          />
        )}

        {activeTab === 'human-impact' && (
          <HumanImpactView
            earthquakes={earthquakes}
            isLoadingFeed={isLoading}
            selectedEarthquake={focusedEarthquake}
            onSelectEarthquake={handleSelectSharedEarthquake}
            onOpenEarthImpact={handleOpenEarthImpact}
            onOpenInMap={handleOpenInMap}
          />
        )}

        {activeTab === 'safety-guide' && <SafetyGuideView />}
      </main>

      {/* Reusable Dynamic Earthquake Details Modal */}
      <EarthquakeDetailModal
        earthquake={modalEarthquake}
        onClose={() => setModalEarthquake(null)}
        onOpenInMap={handleOpenInMap}
        onOpenEarthImpact={handleOpenEarthImpact}
        onOpenHumanImpact={handleOpenHumanImpact}
      />

      {/* Footer on content views */}
      {activeTab !== 'earth-explorer' && <Footer />}
    </div>
  );
}

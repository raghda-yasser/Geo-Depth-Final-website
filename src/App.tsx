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
import { EarthquakeDetailModal } from './components/EarthquakeDetailModal.tsx';
import { EarthquakeFeature } from './types/earthquake.ts';
import { fetchEarthquakeFeed } from './services/earthquakeService.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [earthquakes, setEarthquakes] = useState<EarthquakeFeature[]>([]);
  const [totalLoadedCount, setTotalLoadedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedEarthquake, setSelectedEarthquake] = useState<EarthquakeFeature | null>(null);

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

  const handleOpenInMap = (eq: EarthquakeFeature) => {
    setSelectedEarthquake(eq);
    setActiveTab('earth-explorer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        onSelectTab={setActiveTab}
        earthquakeCount={totalLoadedCount}
      />

      {/* Primary View Routing */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            recentEarthquakes={earthquakes}
            totalCount={totalLoadedCount}
            onNavigate={setActiveTab}
            onSelectEarthquake={setSelectedEarthquake}
          />
        )}

        {activeTab === 'earth-explorer' && (
          <EarthExplorerMap
            earthquakes={earthquakes}
            totalLoadedCount={totalLoadedCount}
            isLoading={isLoading}
            onSelectEarthquake={setSelectedEarthquake}
            selectedEarthquake={selectedEarthquake}
          />
        )}

        {activeTab === 'earthquakes' && (
          <EarthquakesListView
            earthquakes={earthquakes}
            totalLoadedCount={totalLoadedCount}
            isLoading={isLoading}
            onSelectEarthquake={setSelectedEarthquake}
            onOpenMapWithEarthquake={handleOpenInMap}
          />
        )}

        {activeTab === 'satellite-explorer' && <SatelliteExplorerView />}

        {activeTab === 'understand-earthquakes' && <UnderstandEarthquakesView />}

        {activeTab === 'human-impact' && <HumanImpactView />}

        {activeTab === 'safety-guide' && <SafetyGuideView />}
      </main>

      {/* Reusable Dynamic Earthquake Details Modal */}
      <EarthquakeDetailModal
        earthquake={selectedEarthquake}
        onClose={() => setSelectedEarthquake(null)}
        onOpenInMap={handleOpenInMap}
      />

      {/* Footer on content views */}
      {activeTab !== 'earth-explorer' && <Footer />}
    </div>
  );
}

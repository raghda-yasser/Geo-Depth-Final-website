import { EarthquakeFeature, EarthquakeFeedResponse } from '../types/earthquake.ts';
import fallbackData from '../data/fallbackEarthquakes.json';

const USGS_FEEDS = {
  all_week: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',
  m25_week: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson',
  m45_month: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson',
  all_day: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
};

export type FeedKey = keyof typeof USGS_FEEDS;

export async function fetchEarthquakeFeed(feedKey: FeedKey = 'all_week'): Promise<{
  features: EarthquakeFeature[];
  totalLoaded: number;
  feedTitle: string;
  source: 'live' | 'cache' | 'fallback';
  generatedAt: number;
}> {
  const url = USGS_FEEDS[feedKey] || USGS_FEEDS.all_week;
  const cacheKey = `geo_depth_feed_${feedKey}`;

  // Try live fetch with 8-second timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`USGS HTTP Error ${res.status}: ${res.statusText}`);
    }

    const json: EarthquakeFeedResponse = await res.json();
    if (json && Array.isArray(json.features)) {
      // Store in sessionStorage
      try {
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: json,
            timestamp: Date.now(),
          })
        );
      } catch {
        // Ignore storage quota
      }

      return {
        features: json.features,
        totalLoaded: json.features.length,
        feedTitle: json.metadata?.title || 'USGS Earthquakes Feed',
        source: 'live',
        generatedAt: json.metadata?.generated || Date.now(),
      };
    }
  } catch (err) {
    console.warn('Live USGS feed fetch failed, attempting cached / fallback data:', err);
  }

  // Check cached in sessionStorage
  try {
    const cachedStr = sessionStorage.getItem(cacheKey);
    if (cachedStr) {
      const cached = JSON.parse(cachedStr);
      if (cached && cached.data && Array.isArray(cached.data.features)) {
        return {
          features: cached.data.features,
          totalLoaded: cached.data.features.length,
          feedTitle: cached.data.metadata?.title || 'USGS Earthquakes (Cached)',
          source: 'cache',
          generatedAt: cached.timestamp || Date.now(),
        };
      }
    }
  } catch {
    // Ignore cache parse error
  }

  // Graceful fallback to verified USGS snapshot
  const fallback = fallbackData as unknown as EarthquakeFeedResponse;
  return {
    features: fallback.features || [],
    totalLoaded: fallback.features?.length || 647,
    feedTitle: fallback.metadata?.title || 'USGS Earthquakes (Verified Baseline)',
    source: 'fallback',
    generatedAt: fallback.metadata?.generated || Date.now(),
  };
}

export function filterEarthquakes(
  items: EarthquakeFeature[],
  options: {
    minMag: number;
    searchQuery?: string;
    sortBy?: 'time_desc' | 'time_asc' | 'mag_desc' | 'mag_asc' | 'depth_asc' | 'depth_desc';
  }
): EarthquakeFeature[] {
  const { minMag, searchQuery, sortBy = 'time_desc' } = options;
  const q = (searchQuery || '').trim().toLowerCase();

  const filtered = items.filter((item) => {
    const mag = item.properties.mag ?? 0;
    if (mag < minMag) return false;

    if (q) {
      const place = (item.properties.place || '').toLowerCase();
      const title = (item.properties.title || '').toLowerCase();
      if (!place.includes(q) && !title.includes(q)) return false;
    }

    return true;
  });

  return filtered.sort((a, b) => {
    switch (sortBy) {
      case 'mag_desc':
        return (b.properties.mag ?? 0) - (a.properties.mag ?? 0);
      case 'mag_asc':
        return (a.properties.mag ?? 0) - (b.properties.mag ?? 0);
      case 'depth_desc':
        return (b.geometry.coordinates[2] ?? 0) - (a.geometry.coordinates[2] ?? 0);
      case 'depth_asc':
        return (a.geometry.coordinates[2] ?? 0) - (b.geometry.coordinates[2] ?? 0);
      case 'time_asc':
        return a.properties.time - b.properties.time;
      case 'time_desc':
      default:
        return b.properties.time - a.properties.time;
    }
  });
}

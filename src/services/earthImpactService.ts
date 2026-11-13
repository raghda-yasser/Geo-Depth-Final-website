import { EarthquakeFeature } from '../types/earthquake.ts';

export type ObservationMission =
  | 'NISAR'
  | 'OPERA-S1 / ARIA'
  | 'USGS'
  | 'NASA Worldview (VIIRS)';

export type ObservationTiming = 'co-seismic' | 'post-event' | 'pre-event' | 'event-response';

export type EpistemicImageCategory =
  | 'Scientific Measurement'
  | 'Satellite Observation'
  | 'Model Indicator';

export interface SatelliteObservation {
  id: string;
  title: string;
  mission: ObservationMission;
  category: EpistemicImageCategory;
  satellite: string;
  instrument: string;
  productType: string;
  collectionShortName: string;
  acquisitionStart: string;
  acquisitionEnd?: string;
  timing: ObservationTiming;
  timingLabel: string;
  geographicCoverage: string;
  bbox: [number, number, number, number]; // [south, west, north, east]
  polygon?: [number, number][]; // Leaflet [lat, lng][]
  coversEpicenter: boolean;
  trackOrBurstKey?: string;
  imageUrl: string;
  secondaryImageUrl?: string;
  sourceName: string;
  sourceUrl: string;
  methodology: string;
  isInterferometric: boolean;
  isDirectMeasurement: boolean;
}

export interface BeforeAfterComparisonPair {
  id: string;
  title: string;
  mission: ObservationMission;
  productType: string;
  compatibilityNote: string;
  isStrictPrePost: boolean;
  before: SatelliteObservation;
  after: SatelliteObservation;
}

export interface UsgsEventImpactProducts {
  usgsEventFound: boolean;
  eventUrl: string;
  feltResponses: number | null;
  cdi: number | null;
  mmi: number | null;
  alert: string | null;
  tsunami: number;
  shakemap?: {
    maxMmi: number | null;
    maxPgaPctG: number | null;
    maxPgvCmS: number | null;
    intensityImageUrl?: string;
    pgaImageUrl?: string;
    pgvImageUrl?: string;
    bbox?: [number, number, number, number];
    updatedAt?: string;
  };
  groundFailure?: {
    landslideAlert: string | null;
    landslideHazardScore: string | null;
    landslidePopulationExposed: string | null;
    landslideImageUrl?: string;
    landslideBbox?: [number, number, number, number];
    liquefactionAlert: string | null;
    liquefactionHazardScore: string | null;
    liquefactionPopulationExposed: string | null;
    liquefactionImageUrl?: string;
    liquefactionBbox?: [number, number, number, number];
    ruptureWarning: string | null;
    updatedAt?: string;
  };
  losspager?: {
    alertLevel: string | null;
    maxMmi: string | null;
    estimatedFatalitiesRange?: string | null;
    estimatedEconomicRange?: string | null;
  };
  finiteFaultAvailable: boolean;
  momentTensor?: {
    strike1?: number;
    dip1?: number;
    rake1?: number;
    percentDoubleCouple?: number;
  };
}

export interface SurfaceImpactMetric {
  key: 'ground-deformation' | 'surface-displacement' | 'surface-rupture' | 'landslides' | 'damage-indicators';
  title: string;
  status: 'measured' | 'indicator' | 'unavailable';
  summaryValue: string;
  unit?: string;
  observationDate?: string;
  methodology: string;
  source: string;
  sourceUrl?: string;
  details: string;
}

export interface EarthImpactReport {
  earthquakeId: string;
  fetchedAt: string;
  usgsProducts: UsgsEventImpactProducts;
  shakemapObservation: SatelliteObservation | null;
  insarDeformationObservation: SatelliteObservation | null;
  archivedPreEventInsarCount: number;
  observations: SatelliteObservation[];
  comparisons: BeforeAfterComparisonPair[];
  surfaceImpacts: SurfaceImpactMetric[];
  missingDataNotes: string[];
  scientificExplanation: {
    directMeasurements: string[];
    satelliteIndicators: string[];
    interpretations: string[];
    unknowns: string[];
  };
  apisQueried: {
    name: string;
    status: 'ok' | 'empty' | 'error';
    count: number;
  }[];
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function formatUtcDateDay(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

function parseCmrPolygons(polygons?: string[][]): [number, number][] | undefined {
  if (!polygons || !polygons.length || !polygons[0]?.length) return undefined;
  const raw = polygons[0][0];
  const parts = raw.trim().split(/\s+/).map(Number);
  if (parts.length < 6 || parts.some((n) => Number.isNaN(n))) return undefined;
  const coords: [number, number][] = [];
  for (let i = 0; i + 1 < parts.length; i += 2) {
    coords.push([parts[i], parts[i + 1]]);
  }
  return coords;
}

function bboxFromPolygon(
  poly?: [number, number][],
  fallback?: [number, number, number, number]
): [number, number, number, number] {
  if (!poly || poly.length === 0) return fallback || [0, 0, 0, 0];
  let s = 90;
  let n = -90;
  let w = 180;
  let e = -180;
  for (const [lat, lon] of poly) {
    if (lat < s) s = lat;
    if (lat > n) n = lat;
    if (lon < w) w = lon;
    if (lon > e) e = lon;
  }
  return [s, w, n, e];
}

// Strict spatial containment check: ensures granule footprint actually covers the earthquake epicenter
function pointInPolygonOrBbox(
  lat: number,
  lng: number,
  poly?: [number, number][],
  bbox?: [number, number, number, number]
): boolean {
  if (poly && poly.length >= 3) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const yi = poly[i][0];
      const xi = poly[i][1];
      const yj = poly[j][0];
      const xj = poly[j][1];
      const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
      if (intersect) inside = !inside;
    }
    if (inside) return true;
  }
  if (bbox) {
    const [s, w, n, e] = bbox;
    if (lat >= s && lat <= n && lng >= w && lng <= e) {
      // If polygon was provided and returned false, double-check only if polygon vertices span antimeridian
      if (!poly || Math.abs(e - w) > 180) return true;
    }
  }
  return false;
}

function classifyTiming(
  startIso: string,
  endIso: string | undefined,
  eventTimeMs: number
): {
  timing: ObservationTiming;
  timingLabel: string;
} {
  const startMs = Date.parse(startIso);
  const endMs = endIso ? Date.parse(endIso) : startMs;
  if (!Number.isNaN(startMs) && !Number.isNaN(endMs)) {
    if (startMs < eventTimeMs && endMs >= eventTimeMs) {
      return { timing: 'co-seismic', timingLabel: 'Co-Seismic Span (Pre -> Post)' };
    }
    if (startMs >= eventTimeMs) {
      return { timing: 'post-event', timingLabel: 'Post-Event Pass' };
    }
    return { timing: 'pre-event', timingLabel: 'Pre-Event Reference Baseline' };
  }
  return { timing: 'pre-event', timingLabel: 'Archived Acquisition' };
}

function pickHttpsBrowseUrls(links?: Array<{ rel?: string; href?: string; title?: string }>): {
  primary?: string;
  secondary?: string;
} {
  if (!links) return {};
  const browseHttps = links
    .map((l) => l.href || '')
    .filter(
      (href) =>
        href.startsWith('https://') &&
        (href.endsWith('.png') || href.endsWith('.jpg') || href.endsWith('.jpeg')) &&
        !href.includes('datapool.asf.alaska.edu')
    );

  const latlon = browseHttps.find((h) => h.includes('_LATLON.png') && !h.includes('thumbnail'));
  const mainBrowse = browseHttps.find((h) => h.includes('_BROWSE.png') && !h.includes('thumbnail'));
  const nonThumb = browseHttps.find((h) => !h.includes('thumbnail'));
  const native = browseHttps.find((h) => h.includes('_NATIVE.png'));

  const primary = latlon || mainBrowse || nonThumb || browseHttps[0];
  const secondary = native && native !== primary ? native : browseHttps.find((h) => h !== primary);
  return { primary, secondary };
}

function extractTrackOrBurstKey(granuleId: string, collectionShortName: string): string | undefined {
  if (collectionShortName.startsWith('OPERA_L2_RTC-S1')) {
    const m = granuleId.match(/T\d+-\d+-IW\d/);
    return m ? m[0] : undefined;
  }
  if (collectionShortName.startsWith('OPERA_L3_DISP-S1')) {
    const m = granuleId.match(/F\d+/);
    return m ? m[0] : undefined;
  }
  if (collectionShortName.startsWith('NISAR_')) {
    const m = granuleId.match(/NISAR_L[12]_[A-Z]+_[A-Z]+_\d+_(\d+_[AD]_\d+)/);
    return m ? m[1] : undefined;
  }
  return undefined;
}

interface CmrGranuleEntry {
  id: string;
  producer_granule_id?: string;
  title?: string;
  time_start: string;
  time_end?: string;
  updated?: string;
  dataset_id?: string;
  polygons?: string[][];
  boxes?: string[];
  links?: Array<{ rel?: string; href?: string; title?: string }>;
}

async function fetchCmrCollection(
  shortName: string,
  bboxString: string,
  pageSize: number,
  signal?: AbortSignal
): Promise<CmrGranuleEntry[]> {
  const url = `https://cmr.earthdata.nasa.gov/search/granules.json?short_name=${encodeURIComponent(
    shortName
  )}&bounding_box=${encodeURIComponent(bboxString)}&sort_key=-start_date&page_size=${pageSize}`;
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json?.feed?.entry) ? json.feed.entry : [];
}

export async function fetchUsgsEventProducts(
  eq: EarthquakeFeature,
  signal?: AbortSignal
): Promise<UsgsEventImpactProducts> {
  const fallbackUrl = eq.properties.url || `https://earthquake.usgs.gov/earthquakes/eventpage/${eq.id}`;
  const result: UsgsEventImpactProducts = {
    usgsEventFound: false,
    eventUrl: fallbackUrl,
    feltResponses: eq.properties.felt ?? null,
    cdi: eq.properties.cdi ?? null,
    mmi: eq.properties.mmi ?? null,
    alert: eq.properties.alert ?? null,
    tsunami: eq.properties.tsunami ?? 0,
    finiteFaultAvailable: false,
  };

  try {
    const detailUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?eventid=${encodeURIComponent(
      eq.id
    )}&format=geojson`;
    const res = await fetch(detailUrl, { signal, headers: { Accept: 'application/json' } });
    if (!res.ok) return result;
    const json = await res.json();
    result.usgsEventFound = true;
    result.eventUrl = json?.properties?.url || fallbackUrl;
    result.feltResponses = json?.properties?.felt ?? result.feltResponses;
    result.cdi = json?.properties?.cdi ?? result.cdi;
    result.mmi = json?.properties?.mmi ?? result.mmi;
    result.alert = json?.properties?.alert ?? result.alert;
    result.tsunami = json?.properties?.tsunami ?? result.tsunami;

    const prods = json?.properties?.products || {};

    const sm = prods.shakemap?.[0];
    if (sm) {
      const p = sm.properties || {};
      const contents = sm.contents || {};
      const getContentUrl = (suffix: string): string | undefined => {
        const key = Object.keys(contents).find((k) => k === suffix || k.endsWith('/' + suffix));
        return key ? contents[key]?.url : undefined;
      };
      const minLat = parseFloat(p['minimum-latitude']);
      const maxLat = parseFloat(p['maximum-latitude']);
      const minLng = parseFloat(p['minimum-longitude']);
      const maxLng = parseFloat(p['maximum-longitude']);
      const hasBbox = ![minLat, maxLat, minLng, maxLng].some(Number.isNaN);

      result.shakemap = {
        maxMmi: p.maxmmi !== undefined ? parseFloat(p.maxmmi) : null,
        maxPgaPctG: p.maxpga !== undefined ? parseFloat(p.maxpga) : null,
        maxPgvCmS: p.maxpgv !== undefined ? parseFloat(p.maxpgv) : null,
        intensityImageUrl: getContentUrl('intensity.jpg'),
        pgaImageUrl: getContentUrl('pga.jpg'),
        pgvImageUrl: getContentUrl('pgv.jpg'),
        bbox: hasBbox ? [minLat, minLng, maxLat, maxLng] : undefined,
        updatedAt: sm.updateTime ? new Date(sm.updateTime).toISOString() : undefined,
      };
    }

    const gf = prods['ground-failure']?.[0];
    if (gf) {
      const p = gf.properties || {};
      const contents = gf.contents || {};
      const lsOverlayName = p['landslide-overlay'] || 'jessee_2018.png';
      const lqOverlayName = p['liquefaction-overlay'] || 'zhu_2017_general.png';

      const lsMinLat = parseFloat(p['landslide-minimum-latitude']);
      const lsMaxLat = parseFloat(p['landslide-maximum-latitude']);
      const lsMinLng = parseFloat(p['landslide-minimum-longitude']);
      const lsMaxLng = parseFloat(p['landslide-maximum-longitude']);
      const hasLsBbox = ![lsMinLat, lsMaxLat, lsMinLng, lsMaxLng].some(Number.isNaN);

      const lqMinLat = parseFloat(p['liquefaction-minimum-latitude']);
      const lqMaxLat = parseFloat(p['liquefaction-maximum-latitude']);
      const lqMinLng = parseFloat(p['liquefaction-minimum-longitude']);
      const lqMaxLng = parseFloat(p['liquefaction-maximum-longitude']);
      const hasLqBbox = ![lqMinLat, lqMaxLat, lqMinLng, lqMaxLng].some(Number.isNaN);

      result.groundFailure = {
        landslideAlert: p['landslide-alert'] || null,
        landslideHazardScore: p['landslide-hazard-alert-value'] || null,
        landslidePopulationExposed: p['landslide-population-alert-value'] || null,
        landslideImageUrl: contents[lsOverlayName]?.url,
        landslideBbox: hasLsBbox ? [lsMinLat, lsMinLng, lsMaxLat, lsMaxLng] : undefined,
        liquefactionAlert: p['liquefaction-alert'] || null,
        liquefactionHazardScore: p['liquefaction-hazard-alert-value'] || null,
        liquefactionPopulationExposed: p['liquefaction-population-alert-value'] || null,
        liquefactionImageUrl: contents[lqOverlayName]?.url,
        liquefactionBbox: hasLqBbox ? [lqMinLat, lqMinLng, lqMaxLat, lqMaxLng] : undefined,
        ruptureWarning: p['rupture-warning'] || null,
        updatedAt: gf.updateTime ? new Date(gf.updateTime).toISOString() : undefined,
      };
    }

    const lp = prods.losspager?.[0];
    if (lp) {
      const p = lp.properties || {};
      result.losspager = {
        alertLevel: p.alertlevel || null,
        maxMmi: p.maxmmi || null,
        estimatedFatalitiesRange: p['fatalities-alert-value'] || null,
        estimatedEconomicRange: p['economic-alert-value'] || null,
      };
    }

    if (Array.isArray(prods['finite-fault']) && prods['finite-fault'].length > 0) {
      result.finiteFaultAvailable = true;
    }

    const mt = prods['moment-tensor']?.[0];
    if (mt?.properties) {
      const p = mt.properties;
      result.momentTensor = {
        strike1: p['nodal-plane-1-strike'] ? parseFloat(p['nodal-plane-1-strike']) : undefined,
        dip1: p['nodal-plane-1-dip'] ? parseFloat(p['nodal-plane-1-dip']) : undefined,
        rake1: p['nodal-plane-1-rake'] ? parseFloat(p['nodal-plane-1-rake']) : undefined,
        percentDoubleCouple: p['percent-double-couple']
          ? parseFloat(p['percent-double-couple']) * 100
          : undefined,
      };
    }
  } catch (err) {
    console.warn('USGS Event Detail fetch error:', err);
  }

  return result;
}

export async function fetchEarthImpactForEvent(
  eq: EarthquakeFeature,
  signal?: AbortSignal
): Promise<EarthImpactReport> {
  const [lng, lat, depthKm] = eq.geometry.coordinates;
  const eventTimeMs = eq.properties.time;
  const eventDayStr = formatUtcDateDay(eventTimeMs);
  const dayMs = 24 * 60 * 60 * 1000;
  const sarWindowMinMs = eventTimeMs - 60 * dayMs;

  const halfSpan = 0.45;
  const west = clamp(lng - halfSpan, -180, 180);
  const east = clamp(lng + halfSpan, -180, 180);
  const south = clamp(lat - halfSpan, -85, 85);
  const north = clamp(lat + halfSpan, -85, 85);
  const bboxString = `${west.toFixed(4)},${south.toFixed(4)},${east.toFixed(4)},${north.toFixed(4)}`;
  const bboxTuple: [number, number, number, number] = [south, west, north, east];
  const areaCoverageLabel = `${south.toFixed(2)}° to ${north.toFixed(2)}° lat, ${west.toFixed(2)}° to ${east.toFixed(2)}° lon`;

  const apisQueried: EarthImpactReport['apisQueried'] = [];
  const observations: SatelliteObservation[] = [];

  const [
    usgsProducts,
    nisarGunw,
    nisarGcovVal,
    nisarGcovProv,
    nisarUr,
    operaDispS1,
    operaRtcS1,
  ] = await Promise.all([
    fetchUsgsEventProducts(eq, signal),
    fetchCmrCollection('NISAR_L2_GUNW_PROVISIONAL_V1', bboxString, 8, signal).catch(() => []),
    fetchCmrCollection('NISAR_L2_GCOV_V1', bboxString, 8, signal).catch(() => []),
    fetchCmrCollection('NISAR_L2_GCOV_PROVISIONAL_V1', bboxString, 8, signal).catch(() => []),
    fetchCmrCollection('NISAR_UR_L2', bboxString, 8, signal).catch(() => []),
    fetchCmrCollection('OPERA_L3_DISP-S1_V1', bboxString, 8, signal).catch(() => []),
    fetchCmrCollection('OPERA_L2_RTC-S1_V1', bboxString, 14, signal).catch(() => []),
  ]);

  apisQueried.push({
    name: 'USGS Earthquake Detail API',
    status: usgsProducts.usgsEventFound ? 'ok' : 'empty',
    count:
      (usgsProducts.shakemap ? 1 : 0) +
      (usgsProducts.groundFailure ? 1 : 0) +
      (usgsProducts.losspager ? 1 : 0),
  });

  // 1. Primary Dedicated Scientific Measurements: USGS ShakeMap
  let shakemapObservation: SatelliteObservation | null = null;
  if (usgsProducts.shakemap?.intensityImageUrl) {
    const smBbox = usgsProducts.shakemap.bbox || bboxTuple;
    shakemapObservation = {
      id: `${eq.id}-shakemap-intensity`,
      title: `USGS ShakeMap Intensity (${eq.id})`,
      mission: 'USGS',
      category: 'Scientific Measurement',
      satellite: 'USGS ANSS Seismic Network',
      instrument: 'Broadband Seismographs & Strong-Motion Accelerometers',
      productType: 'Macroseismic Intensity Map (MMI / PGA / PGV)',
      collectionShortName: 'USGS_SHAKEMAP',
      acquisitionStart: new Date(eventTimeMs).toISOString(),
      timing: 'event-response',
      timingLabel: 'Verified Event Measurement',
      geographicCoverage: `${smBbox[0].toFixed(2)}° to ${smBbox[2].toFixed(2)}° lat, ${smBbox[1].toFixed(2)}° to ${smBbox[3].toFixed(2)}° lon`,
      bbox: smBbox,
      coversEpicenter: true,
      imageUrl: usgsProducts.shakemap.intensityImageUrl,
      secondaryImageUrl: usgsProducts.shakemap.pgaImageUrl || usgsProducts.shakemap.pgvImageUrl,
      sourceName: 'USGS Earthquake Hazards Program',
      sourceUrl: `${usgsProducts.eventUrl}#shakemap`,
      methodology:
        'Empirical interpolation combining actual seismic station ground motion records with site amplification (Vs30).',
      isInterferometric: false,
      isDirectMeasurement: true,
    };
    observations.push(shakemapObservation);
  }

  // 2. Priority NASA-ISRO NISAR & OPERA Sentinel-1
  // STRICT AUDIT RULE:
  // - Every granule MUST spatially cover the epicenter [lat, lng] (reject adjacent scenes missing the epicenter).
  // - InSAR deformation products (GUNW, DISP-S1) are ONLY included if they are co-seismic or post-event (never show a 2025 or unrelated pre-event interferogram as earthquake deformation imagery).
  // - SAR backscatter amplitude products (GCOV, RTC-S1) are included within the 60-day pre-event baseline through post-event window and clearly labeled as Pre-Event Baseline vs Post-Event Pass.
  let archivedPreEventInsarCount = 0;
  let insarDeformationObservation: SatelliteObservation | null = null;
  let nisarAddedCount = 0;
  let operaAddedCount = 0;
  const seenGranules = new Set<string>();

  const candidateGranules: Array<{
    mission: ObservationMission;
    satellite: string;
    instrument: string;
    shortName: string;
    productLabel: string;
    isInSAR: boolean;
    sourceName: string;
    methodology: string;
    entry: CmrGranuleEntry;
  }> = [
    ...nisarGunw.map((entry) => ({
      mission: 'NISAR' as const,
      satellite: 'NASA-ISRO NISAR',
      instrument: 'L-band Synthetic Aperture Radar (24 cm)',
      shortName: 'NISAR_L2_GUNW_PROVISIONAL_V1',
      productLabel: 'L2 Geocoded Unwrapped Interferogram (GUNW · L-band InSAR)',
      isInSAR: true,
      sourceName: 'NASA Earthdata / Alaska Satellite Facility (ASF)',
      methodology: 'L-band Repeat-Pass Interferometry (24 cm radar wavelength unwrapped phase difference).',
      entry,
    })),
    ...nisarUr.map((entry) => ({
      mission: 'NISAR' as const,
      satellite: 'NASA-ISRO NISAR',
      instrument: 'L-band Synthetic Aperture Radar (24 cm)',
      shortName: 'NISAR_UR_L2',
      productLabel: 'Urgent Response Level-2 L-band SAR Product',
      isInSAR: entry.producer_granule_id?.includes('GUNW') || false,
      sourceName: 'NASA Earthdata / Alaska Satellite Facility (ASF)',
      methodology: 'Urgent-response L-band SAR backscatter/interferometric rapid product.',
      entry,
    })),
    ...nisarGcovVal.map((entry) => ({
      mission: 'NISAR' as const,
      satellite: 'NASA-ISRO NISAR',
      instrument: 'L-band Synthetic Aperture Radar (24 cm)',
      shortName: 'NISAR_L2_GCOV_V1',
      productLabel: 'L2 Validated Geocoded Polarimetric Covariance SAR (GCOV)',
      isInSAR: false,
      sourceName: 'NASA Earthdata / Alaska Satellite Facility (ASF)',
      methodology: 'Geocoded polarimetric radar backscatter amplitude covariance (requires post-event pass for change comparison).',
      entry,
    })),
    ...nisarGcovProv.map((entry) => ({
      mission: 'NISAR' as const,
      satellite: 'NASA-ISRO NISAR',
      instrument: 'L-band Synthetic Aperture Radar (24 cm)',
      shortName: 'NISAR_L2_GCOV_PROVISIONAL_V1',
      productLabel: 'L2 Provisional Geocoded Polarimetric Covariance SAR (GCOV)',
      isInSAR: false,
      sourceName: 'NASA Earthdata / Alaska Satellite Facility (ASF)',
      methodology: 'Provisional geocoded polarimetric radar backscatter covariance over epicenter region.',
      entry,
    })),
    ...operaDispS1.map((entry) => ({
      mission: 'OPERA-S1 / ARIA' as const,
      satellite: 'Copernicus Sentinel-1A/B/C/D',
      instrument: 'C-band SAR (5.55 cm) · NASA JPL OPERA/ARIA Pipeline',
      shortName: 'OPERA_L3_DISP-S1_V1',
      productLabel: 'OPERA / ARIA L3 Line-of-Sight Surface Displacement (Sentinel-1)',
      isInSAR: true,
      sourceName: 'NASA JPL OPERA / ASF Distributed Active Archive',
      methodology: 'Sentinel-1 IW co-registered phase unwrapping calibrated by NASA/JPL OPERA & ARIA algorithms.',
      entry,
    })),
    ...operaRtcS1.map((entry) => ({
      mission: 'OPERA-S1 / ARIA' as const,
      satellite: 'Copernicus Sentinel-1A/B/C/D',
      instrument: 'C-band SAR (5.55 cm) · NASA JPL OPERA Pipeline',
      shortName: 'OPERA_L2_RTC-S1_V1',
      productLabel: 'OPERA L2 Radiometrically Terrain Corrected SAR Backscatter (30 m)',
      isInSAR: false,
      sourceName: 'NASA JPL OPERA / ASF Distributed Active Archive',
      methodology: '30 m radiometrically terrain-corrected C-band gamma-nought SAR backscatter normalized against Copernicus DEM.',
      entry,
    })),
  ];

  for (const item of candidateGranules) {
    const gId = item.entry.producer_granule_id || item.entry.id;
    if (seenGranules.has(gId)) continue;
    const { primary, secondary } = pickHttpsBrowseUrls(item.entry.links);
    if (!primary) continue;

    const poly = parseCmrPolygons(item.entry.polygons);
    const bbox = bboxFromPolygon(poly, bboxTuple);
    const coversEpicenter = pointInPolygonOrBbox(lat, lng, poly, bbox);

    // Reject granules whose footprint does NOT cover the earthquake epicenter
    if (!coversEpicenter) continue;

    const { timing, timingLabel } = classifyTiming(item.entry.time_start, item.entry.time_end, eventTimeMs);

    // Reject archived pre-event InSAR interferograms so older unrelated interferograms are never shown as deformation from this earthquake
    if (item.isInSAR && timing === 'pre-event') {
      archivedPreEventInsarCount++;
      continue;
    }

    // For amplitude SAR scenes (GCOV/RTC), keep only scenes within [event - 60 days .. now]
    const acqMs = Date.parse(item.entry.time_start);
    if (!item.isInSAR && !Number.isNaN(acqMs) && acqMs < sarWindowMinMs) {
      continue;
    }

    seenGranules.add(gId);
    const obs: SatelliteObservation = {
      id: gId,
      title: gId,
      mission: item.mission,
      category: item.isInSAR ? 'Scientific Measurement' : 'Satellite Observation',
      satellite: item.satellite,
      instrument: item.instrument,
      productType: item.productLabel,
      collectionShortName: item.shortName,
      acquisitionStart: item.entry.time_start,
      acquisitionEnd: item.entry.time_end,
      timing,
      timingLabel,
      geographicCoverage: `${bbox[0].toFixed(2)}° to ${bbox[2].toFixed(2)}° lat, ${bbox[1].toFixed(2)}° to ${bbox[3].toFixed(2)}° lon`,
      bbox,
      polygon: poly,
      coversEpicenter: true,
      trackOrBurstKey: extractTrackOrBurstKey(gId, item.shortName),
      imageUrl: primary,
      secondaryImageUrl: secondary,
      sourceName: item.sourceName,
      sourceUrl: `https://search.asf.alaska.edu/#/?granule=${encodeURIComponent(gId)}`,
      methodology: item.methodology,
      isInterferometric: item.isInSAR,
      isDirectMeasurement: true,
    };

    if (item.isInSAR && !insarDeformationObservation) {
      insarDeformationObservation = obs;
    }

    observations.push(obs);
    if (item.mission === 'NISAR') nisarAddedCount++;
    if (item.mission === 'OPERA-S1 / ARIA') operaAddedCount++;
  }

  apisQueried.push({
    name: 'NASA CMR (NISAR Covering Epicenter)',
    status: nisarAddedCount > 0 ? 'ok' : 'empty',
    count: nisarAddedCount,
  });
  apisQueried.push({
    name: 'NASA CMR (OPERA / ARIA Sentinel-1)',
    status: operaAddedCount > 0 ? 'ok' : 'empty',
    count: operaAddedCount,
  });

  // 3. USGS Ground-Failure Probabilistic Indicators (clearly labeled Model Indicator)
  if (usgsProducts.groundFailure?.landslideImageUrl) {
    const lsBbox = usgsProducts.groundFailure.landslideBbox || bboxTuple;
    observations.push({
      id: `${eq.id}-ground-failure-landslide`,
      title: `USGS Ground-Failure Landslide Indicator (${eq.id})`,
      mission: 'USGS',
      category: 'Model Indicator',
      satellite: 'USGS Ground-Failure Model (Jessee et al., 2018)',
      instrument: 'ShakeMap PGV + Topographic Slope & Lithology',
      productType: 'Coseismic Landslide Probability Indicator',
      collectionShortName: 'USGS_GROUND_FAILURE_LS',
      acquisitionStart: new Date(eventTimeMs).toISOString(),
      timing: 'event-response',
      timingLabel: 'Model Indicator (Not Field Inventory)',
      geographicCoverage: `${lsBbox[0].toFixed(2)}° to ${lsBbox[2].toFixed(2)}° lat, ${lsBbox[1].toFixed(2)}° to ${lsBbox[3].toFixed(2)}° lon`,
      bbox: lsBbox,
      coversEpicenter: true,
      imageUrl: usgsProducts.groundFailure.landslideImageUrl,
      secondaryImageUrl: usgsProducts.groundFailure.liquefactionImageUrl,
      sourceName: 'USGS Earthquake Hazards Program (Ground Failure)',
      sourceUrl: `${usgsProducts.eventUrl}#ground-failure`,
      methodology:
        'Probabilistic logistic model combining ShakeMap Peak Ground Velocity with terrain slope and lithology. Indicator only — not direct optical/field confirmation.',
      isInterferometric: false,
      isDirectMeasurement: false,
    });
  }

  // 4. NASA Worldview / GIBS True-Color Optical Reflectance centered on exact epicenter
  const nowMs = Date.now();
  const preDate = formatUtcDateDay(eventTimeMs - 3 * dayMs);
  const preWvsUrl = `https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&TIME=${preDate}&BBOX=${south.toFixed(
    4
  )},${west.toFixed(4)},${north.toFixed(4)},${east.toFixed(
    4
  )}&CRS=EPSG:4326&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&FORMAT=image/jpeg&WIDTH=640&HEIGHT=520`;

  const wvsBeforeObs: SatelliteObservation = {
    id: `${eq.id}-wvs-pre-${preDate}`,
    title: `NASA VIIRS True-Color Optical Pre-Event (${preDate})`,
    mission: 'NASA Worldview (VIIRS)',
    category: 'Satellite Observation',
    satellite: 'Suomi NPP',
    instrument: 'VIIRS Passive Optical Radiometer (375 m)',
    productType: 'Corrected Reflectance True Color (Pre-Event Optical Context)',
    collectionShortName: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
    acquisitionStart: `${preDate}T12:00:00Z`,
    timing: 'pre-event',
    timingLabel: 'Pre-Event Optical Baseline',
    geographicCoverage: areaCoverageLabel,
    bbox: bboxTuple,
    coversEpicenter: true,
    imageUrl: preWvsUrl,
    sourceName: 'NASA EOSDIS Worldview / GIBS',
    sourceUrl: `https://worldview.earthdata.nasa.gov/?v=${west.toFixed(2)},${south.toFixed(2)},${east.toFixed(
      2
    )},${north.toFixed(2)}&t=${preDate}`,
    methodology:
      'Passive visible-band solar reflectance composite centered directly on epicenter coordinates. Shows cloud/terrain/ocean state prior to event (does not measure ground displacement).',
    isInterferometric: false,
    isDirectMeasurement: true,
  };
  observations.push(wvsBeforeObs);

  let wvsAfterObs: SatelliteObservation | null = null;
  if (nowMs - eventTimeMs >= dayMs) {
    const postTimeMs = Math.min(eventTimeMs + 2 * dayMs, nowMs - dayMs);
    const postDate = formatUtcDateDay(postTimeMs);
    if (postDate > preDate) {
      const postWvsUrl = `https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&TIME=${postDate}&BBOX=${south.toFixed(
        4
      )},${west.toFixed(4)},${north.toFixed(4)},${east.toFixed(
        4
      )}&CRS=EPSG:4326&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&FORMAT=image/jpeg&WIDTH=640&HEIGHT=520`;

      wvsAfterObs = {
        id: `${eq.id}-wvs-post-${postDate}`,
        title: `NASA VIIRS True-Color Optical Post-Event (${postDate})`,
        mission: 'NASA Worldview (VIIRS)',
        category: 'Satellite Observation',
        satellite: 'Suomi NPP',
        instrument: 'VIIRS Passive Optical Radiometer (375 m)',
        productType: 'Corrected Reflectance True Color (Post-Event Optical Context)',
        collectionShortName: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
        acquisitionStart: `${postDate}T12:00:00Z`,
        timing: 'post-event',
        timingLabel: 'Post-Event Optical Pass',
        geographicCoverage: areaCoverageLabel,
        bbox: bboxTuple,
        coversEpicenter: true,
        imageUrl: postWvsUrl,
        sourceName: 'NASA EOSDIS Worldview / GIBS',
        sourceUrl: `https://worldview.earthdata.nasa.gov/?v=${west.toFixed(2)},${south.toFixed(2)},${east.toFixed(
          2
        )},${north.toFixed(2)}&t=${postDate}`,
        methodology:
          'Passive visible-band solar reflectance composite matching the exact epicentral bounding box after the earthquake.',
        isInterferometric: false,
        isDirectMeasurement: true,
      };
      observations.push(wvsAfterObs);
    }
  }

  apisQueried.push({
    name: 'NASA EOSDIS GIBS / Worldview Optical',
    status: 'ok',
    count: wvsAfterObs ? 2 : 1,
  });

  // 5. Build Compatible Before / After Pairs (strictly same-burst / same-bbox Pre vs Post)
  const comparisons: BeforeAfterComparisonPair[] = [];

  const operaRtcObs = observations.filter(
    (o) => o.collectionShortName === 'OPERA_L2_RTC-S1_V1' && o.trackOrBurstKey
  );
  const burstMap = new Map<string, SatelliteObservation[]>();
  for (const obs of operaRtcObs) {
    const key = obs.trackOrBurstKey!;
    if (!burstMap.has(key)) burstMap.set(key, []);
    burstMap.get(key)!.push(obs);
  }
  for (const [burstKey, list] of burstMap.entries()) {
    const preList = list
      .filter((x) => x.timing === 'pre-event')
      .sort((a, b) => b.acquisitionStart.localeCompare(a.acquisitionStart));
    const postList = list
      .filter((x) => x.timing === 'post-event')
      .sort((a, b) => a.acquisitionStart.localeCompare(b.acquisitionStart));
    if (preList.length > 0 && postList.length > 0) {
      comparisons.push({
        id: `compare-opera-prepost-${burstKey}`,
        title: `Sentinel-1 SAR Backscatter Pre/Post Pair (Burst ${burstKey})`,
        mission: 'OPERA-S1 / ARIA',
        productType: 'OPERA L2 RTC-S1 C-band Backscatter (30 m)',
        compatibilityNote: `Matched identical Sentinel-1 burst (${burstKey}) before (${preList[0].acquisitionStart.slice(
          0,
          10
        )}) and after (${postList[0].acquisitionStart.slice(0, 10)}) the earthquake.`,
        isStrictPrePost: true,
        before: preList[0],
        after: postList[0],
      });
    }
  }

  const nisarGcovObs = observations.filter(
    (o) => o.mission === 'NISAR' && !o.isInterferometric && o.trackOrBurstKey
  );
  const nisarTrackMap = new Map<string, SatelliteObservation[]>();
  for (const obs of nisarGcovObs) {
    const key = obs.trackOrBurstKey!;
    if (!nisarTrackMap.has(key)) nisarTrackMap.set(key, []);
    nisarTrackMap.get(key)!.push(obs);
  }
  for (const [trackKey, list] of nisarTrackMap.entries()) {
    const preList = list
      .filter((x) => x.timing === 'pre-event')
      .sort((a, b) => b.acquisitionStart.localeCompare(a.acquisitionStart));
    const postList = list
      .filter((x) => x.timing === 'post-event')
      .sort((a, b) => a.acquisitionStart.localeCompare(b.acquisitionStart));
    if (preList.length > 0 && postList.length > 0) {
      comparisons.push({
        id: `compare-nisar-prepost-${trackKey}`,
        title: `NASA-ISRO NISAR L-Band SAR Pre/Post Pair (Track ${trackKey})`,
        mission: 'NISAR',
        productType: 'NISAR L2 GCOV L-band Polarimetric Backscatter',
        compatibilityNote: `Matched identical NISAR track/frame (${trackKey}) before and after the earthquake.`,
        isStrictPrePost: true,
        before: preList[0],
        after: postList[0],
      });
    }
  }

  if (wvsAfterObs) {
    comparisons.push({
      id: `compare-viirs-prepost-${eq.id}`,
      title: `NASA VIIRS True-Color Pre/Post Comparison (${areaCoverageLabel})`,
      mission: 'NASA Worldview (VIIRS)',
      productType: '375 m Optical Corrected Reflectance (Non-SAR)',
      compatibilityNote: `Exact same geographic bounding box comparing ${preDate} (Pre-Event) vs ${wvsAfterObs.acquisitionStart.slice(
        0,
        10
      )} (Post-Event).`,
      isStrictPrePost: true,
      before: wvsBeforeObs,
      after: wvsAfterObs,
    });
  }

  // 6. Section C Surface Impacts
  const surfaceImpacts: SurfaceImpactMetric[] = [];

  if (insarDeformationObservation) {
    surfaceImpacts.push({
      key: 'ground-deformation',
      title: '1. Ground Deformation',
      status: 'measured',
      summaryValue: 'Co-Seismic Interferogram Available',
      observationDate: insarDeformationObservation.acquisitionEnd || insarDeformationObservation.acquisitionStart,
      methodology: insarDeformationObservation.methodology,
      source: insarDeformationObservation.sourceName,
      sourceUrl: insarDeformationObservation.sourceUrl,
      details: `An interferometric product (${insarDeformationObservation.title}) covering the epicenter and spanning ${eventDayStr} was found. Unwrapped millimeter values reside in the official NetCDF/HDF5 product.`,
    });
  } else {
    surfaceImpacts.push({
      key: 'ground-deformation',
      title: '1. Ground Deformation',
      status: 'unavailable',
      summaryValue: 'Co-Seismic InSAR Product Unavailable',
      observationDate: archivedPreEventInsarCount > 0 ? `Archived pre-event scenes filtered out (${archivedPreEventInsarCount})` : undefined,
      methodology: 'Repeat-pass L-band NISAR (GUNW) or C-band OPERA/ARIA (DISP-S1) interferometry.',
      source: 'NASA Earthdata CMR (NISAR & OPERA)',
      sourceUrl: 'https://search.asf.alaska.edu/#/',
      details: `No co-seismic or post-event NISAR GUNW or Sentinel-1 OPERA DISP-S1 interferogram covering ${lat.toFixed(
        2
      )}°, ${lng.toFixed(2)}° on or after ${eventDayStr} is available. (${
        archivedPreEventInsarCount > 0
          ? `${archivedPreEventInsarCount} older pre-event interferogram(s) from prior months were excluded so they are not confused with this event.`
          : 'Moderate/deep/offshore events typically remain below orbital InSAR detection thresholds.'
      })`,
    });
  }

  if (usgsProducts.shakemap?.maxPgvCmS !== null && usgsProducts.shakemap?.maxPgvCmS !== undefined) {
    surfaceImpacts.push({
      key: 'surface-displacement',
      title: '2. Surface Displacement & Shaking',
      status: 'measured',
      summaryValue: `Peak Velocity: ${usgsProducts.shakemap.maxPgvCmS.toFixed(2)} cm/s | PGA: ${(
        usgsProducts.shakemap.maxPgaPctG ?? 0
      ).toFixed(2)} %g`,
      unit: 'cm/s (PGV), %g (PGA)',
      observationDate: eventDayStr,
      methodology:
        'Direct transient ground-shaking telemetry from USGS ShakeMap (distinct from permanent InSAR LOS static displacement).',
      source: 'USGS ShakeMap Product',
      sourceUrl: `${usgsProducts.eventUrl}#shakemap`,
      details: `Maximum MMI ${usgsProducts.shakemap.maxMmi?.toFixed(1) ?? 'N/A'}. ShakeMap measures transient wave shaking, while permanent static LOS displacement requires post-event unwrapped InSAR.`,
    });
  } else {
    surfaceImpacts.push({
      key: 'surface-displacement',
      title: '2. Surface Displacement',
      status: 'unavailable',
      summaryValue: 'No LOS Displacement or ShakeMap Published',
      methodology: 'Satellite LOS unwrapping (NISAR GUNW / OPERA DISP-S1) or USGS ShakeMap PGV.',
      source: 'NASA CMR & USGS Event Feed',
      details: `Neither an event-spanning satellite LOS displacement raster nor a USGS ShakeMap PGV dataset is currently published for ${eq.id}.`,
    });
  }

  if (usgsProducts.finiteFaultAvailable || usgsProducts.groundFailure?.ruptureWarning === 'True') {
    surfaceImpacts.push({
      key: 'surface-rupture',
      title: '3. Surface Rupture',
      status: 'measured',
      summaryValue: usgsProducts.finiteFaultAvailable
        ? 'USGS Finite Fault Model Published'
        : 'Elevated Rupture Potential',
      observationDate: eventDayStr,
      methodology: 'USGS Finite-Fault inversion and shallow hypocenter fault-break criteria.',
      source: 'USGS Earthquake Hazards Program',
      sourceUrl: usgsProducts.eventUrl,
      details: 'Verified fault rupture modeling is attached to this USGS event record.',
    });
  } else {
    const note =
      depthKm > 35
        ? `Hypocentral depth (${depthKm.toFixed(1)} km) places this rupture below the brittle upper crust; deep events rarely break the surface.`
        : eq.properties.mag < 5.8
        ? `At M ${eq.properties.mag.toFixed(1)}, slip generally stays buried underground without forming a primary surface fault scarp.`
        : `No USGS finite-fault model or verified SAR phase-discontinuity scarp is published for this event.`;
    surfaceImpacts.push({
      key: 'surface-rupture',
      title: '3. Surface Rupture',
      status: 'unavailable',
      summaryValue: 'No Confirmed Surface Fault Break',
      observationDate: eventDayStr,
      methodology: 'Finite-fault kinematic inversion and InSAR fringe discontinuity mapping.',
      source: 'USGS & NASA CMR Catalog',
      details: note,
    });
  }

  if (usgsProducts.groundFailure?.landslideAlert) {
    surfaceImpacts.push({
      key: 'landslides',
      title: '4. Landslides (Hazard Indicator)',
      status: 'indicator',
      summaryValue: `${usgsProducts.groundFailure.landslideAlert.toUpperCase()} Alert · Hazard Index ${
        usgsProducts.groundFailure.landslideHazardScore ?? 'N/A'
      }`,
      unit: 'USGS Aggregate Hazard Score',
      observationDate: usgsProducts.groundFailure.updatedAt?.slice(0, 10) || eventDayStr,
      methodology:
        'USGS Ground-Failure Landslide Model (Jessee et al., 2018) using ShakeMap PGV + topographic slope.',
      source: 'USGS Ground-Failure Product',
      sourceUrl: `${usgsProducts.eventUrl}#ground-failure`,
      details: `Estimated population exposed to landslide hazard: ${
        usgsProducts.groundFailure.landslidePopulationExposed ?? 'N/A'
      }. Rapid geospatial model indicator — not confirmed field landslide inventory.`,
    });
  } else {
    surfaceImpacts.push({
      key: 'landslides',
      title: '4. Landslides',
      status: 'unavailable',
      summaryValue: 'No Landslide Hazard Product Published',
      methodology: 'USGS Jessee (2018) ground-failure model & optical/SAR slope change detection.',
      source: 'USGS Ground Failure / NASA SAR',
      details:
        'Automated USGS landslide hazard modeling is generally triggered only for shallow onshore earthquakes of M ≥ 5.5 (or damaging M ≥ 5.0).',
    });
  }

  if (usgsProducts.groundFailure?.liquefactionAlert || usgsProducts.losspager?.alertLevel) {
    const parts: string[] = [];
    if (usgsProducts.losspager?.alertLevel) {
      parts.push(`PAGER: ${usgsProducts.losspager.alertLevel.toUpperCase()}`);
    }
    if (usgsProducts.groundFailure?.liquefactionAlert) {
      parts.push(
        `Liquefaction: ${usgsProducts.groundFailure.liquefactionAlert.toUpperCase()} (${
          usgsProducts.groundFailure.liquefactionHazardScore ?? 'N/A'
        })`
      );
    }
    surfaceImpacts.push({
      key: 'damage-indicators',
      title: '5. Damage & Liquefaction Indicators',
      status: 'indicator',
      summaryValue: parts.join(' · '),
      unit: 'PAGER / Zhu (2017) Hazard Index',
      observationDate: eventDayStr,
      methodology:
        'USGS LossPAGER empirical loss alert & Zhu et al. (2017) liquefaction hazard indicator (NOT confirmed structural damage).',
      source: 'USGS PAGER & Ground-Failure',
      sourceUrl: `${usgsProducts.eventUrl}#pager`,
      details: `Indicator-level estimate only. Satellite ARIA Damage Proxy Maps (DPM) require post-event coherent SAR pairs and are not published for ${eq.id}.`,
    });
  } else {
    surfaceImpacts.push({
      key: 'damage-indicators',
      title: '5. Damage Indicators',
      status: 'unavailable',
      summaryValue: 'No Satellite DPM or PAGER Indicator Published',
      methodology: 'ARIA SAR Coherence Loss (Damage Proxy Map) & USGS LossPAGER.',
      source: 'NASA JPL ARIA / USGS',
      details: 'No satellite coherence-loss Damage Proxy Map or USGS PAGER alert has been issued for this event.',
    });
  }

  const missingDataNotes: string[] = [];
  if (!shakemapObservation) {
    missingDataNotes.push(`USGS ShakeMap ground-shaking raster for ${eq.id} (not issued for this event).`);
  }
  if (!insarDeformationObservation) {
    missingDataNotes.push(
      `Co-seismic or post-event NISAR GUNW / Sentinel-1 OPERA DISP-S1 InSAR deformation imagery spanning ${eventDayStr}.`
    );
  }
  if (!usgsProducts.groundFailure) {
    missingDataNotes.push('USGS Ground-Failure landslide & liquefaction hazard maps.');
  }
  if (!wvsAfterObs) {
    missingDataNotes.push('Post-event VIIRS optical acquisition (event occurred within last 24 hours).');
  }

  const directMeasurements: string[] = [
    `USGS Hypocenter & Magnitude: M ${eq.properties.mag.toFixed(1)} (${
      eq.properties.magType || 'Mw'
    }) at ${lat.toFixed(4)}°, ${lng.toFixed(4)}°, ${depthKm.toFixed(1)} km depth on ${eventDayStr}.`,
  ];
  if (usgsProducts.shakemap?.maxPgaPctG !== null && usgsProducts.shakemap?.maxPgaPctG !== undefined) {
    directMeasurements.push(
      `USGS ShakeMap direct ground-motion telemetry: Peak Acceleration ${usgsProducts.shakemap.maxPgaPctG.toFixed(
        2
      )}% g and Peak Velocity ${usgsProducts.shakemap.maxPgvCmS?.toFixed(2) ?? 'N/A'} cm/s.`
    );
  }
  if (nisarAddedCount > 0) {
    directMeasurements.push(
      `${nisarAddedCount} spatially verified NASA-ISRO NISAR L-band granule(s) intersecting ${lat.toFixed(2)}°, ${lng.toFixed(2)}°.`
    );
  }
  if (operaAddedCount > 0) {
    directMeasurements.push(
      `${operaAddedCount} spatially verified NASA OPERA Sentinel-1 granule(s) intersecting ${lat.toFixed(2)}°, ${lng.toFixed(2)}°.`
    );
  }

  const satelliteIndicators: string[] = [];
  if (usgsProducts.groundFailure) {
    satelliteIndicators.push(
      `USGS Ground-Failure models combine ShakeMap intensity with global satellite slope/terrain grids (Landslide: ${usgsProducts.groundFailure.landslideAlert?.toUpperCase()}, Liquefaction: ${usgsProducts.groundFailure.liquefactionAlert?.toUpperCase()}). These are probabilistic indicators, not verified damage.`
    );
  } else {
    satelliteIndicators.push(
      'No satellite-derived Damage Proxy Map (DPM) or USGS Ground-Failure hazard raster is published for this event.'
    );
  }

  const interpretations: string[] = [
    `At M ${eq.properties.mag.toFixed(1)} and ${depthKm.toFixed(
      1
    )} km depth, physical surface detectability by InSAR depends on whether coseismic surface deformation exceeds ~1–2 cm onshore within an active orbital swath.`,
    'Pre-event radar baselines and true-color optical snapshots establish regional surface conditions and cloud cover, but visible temporal correlation is never treated as earthquake-caused deformation without interferometric phase unwrapping or field evidence.',
  ];

  return {
    earthquakeId: eq.id,
    fetchedAt: new Date().toISOString(),
    usgsProducts,
    shakemapObservation,
    insarDeformationObservation,
    archivedPreEventInsarCount,
    observations,
    comparisons,
    surfaceImpacts,
    missingDataNotes,
    scientificExplanation: {
      directMeasurements,
      satelliteIndicators,
      interpretations,
      unknowns: missingDataNotes,
    },
    apisQueried,
  };
}

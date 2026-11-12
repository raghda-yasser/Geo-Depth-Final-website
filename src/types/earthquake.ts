export interface EarthquakeFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    tz?: number | null;
    url: string;
    detail: string;
    felt: number | null;
    cdi: number | null;
    mmi: number | null;
    alert: string | null;
    status: string;
    tsunami: number;
    sig: number;
    net: string;
    code: string;
    ids: string;
    sources: string;
    types: string;
    nst: number | null;
    dmin: number | null;
    rms: number | null;
    gap: number | null;
    magType: string;
    type: string;
    title: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number, number]; // [longitude, latitude, depth_km]
  };
}

export interface EarthquakeFeedResponse {
  type: 'FeatureCollection';
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: EarthquakeFeature[];
}

export interface InSARCaseStudy {
  id: string;
  name: string;
  country: string;
  date: string;
  magnitude: number;
  hypocenterDepthKm: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  satellite: string;
  sensor: string;
  band: string;
  wavelengthCm: number;
  orbitTracks: string;
  preSeismicDate: string;
  postSeismicDate: string;
  dataProviders: string[];
  sourceUrl: string;
  summary: string;
  tectonicSetting: string;
  surfaceRuptureKm: number;
  verifiedDisplacement: {
    losUpliftCm: number;
    losSubsidenceCm: number;
    horizontalFaultSlipMeters: number;
    notes: string;
    peerReviewedCitation: string;
  };
  fringeExplanation: string;
  imageUrl?: string;
}

export interface HumanImpactRecord {
  id: string;
  earthquakeName: string;
  country: string;
  date: string;
  magnitude: number;
  fatalities: number;
  injuries: number;
  displacedPeople: number;
  buildingsDestroyedOrDamaged: number;
  economicLossBillionsUSD?: number;
  geographicScope: string;
  reportingDate: string;
  source: string;
  sourceUrl: string;
  keyHumanitarianNotes: string;
  emergencyResponseActions: string[];
}

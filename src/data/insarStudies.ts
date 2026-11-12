import { InSARCaseStudy } from '../types/earthquake.ts';

export const INSAR_CASE_STUDIES: InSARCaseStudy[] = [
  {
    id: 'turkiye-syria-2023',
    name: '2023 Kahramanmaraş Earthquake Sequence',
    country: 'Türkiye & Syria',
    date: '2023-02-06',
    magnitude: 7.8,
    hypocenterDepthKm: 10.0,
    coordinates: {
      lat: 37.226,
      lng: 37.014,
    },
    satellite: 'Copernicus Sentinel-1A & Sentinel-1B',
    sensor: 'C-band Synthetic Aperture Radar (SAR)',
    band: 'C-band (5.405 GHz)',
    wavelengthCm: 5.55,
    orbitTracks: 'Ascending Track 14 & Descending Track 21',
    preSeismicDate: '2023-01-28',
    postSeismicDate: '2023-02-09',
    dataProviders: [
      'European Space Agency (ESA) Copernicus',
      'COMET (Centre for the Observation & Modelling of Earthquakes, Tectonics & Volcanoes)',
      'USGS Earthquake Hazards Program'
    ],
    sourceUrl: 'https://dataspace.copernicus.eu/',
    summary:
      'A devastating doublet of earthquakes (Mw 7.8 followed 9 hours later by Mw 7.5) ruptured over 350 km along the East Anatolian Fault and Çardak Fault systems. Sentinel-1 SAR interferometry mapped massive co-seismic displacement fields.',
    tectonicSetting: 'Left-lateral strike-slip along the Anatolian-Arabian plate boundary.',
    surfaceRuptureKm: 380,
    verifiedDisplacement: {
      losUpliftCm: 110,
      losSubsidenceCm: 95,
      horizontalFaultSlipMeters: 6.7,
      notes:
        'Scientific Audit Note: Previous unverified references to "±420 cm LOS displacement" conflated horizontal slip with radar line-of-sight. Peer-reviewed data (COMET/USGS 2023) establishes maximum horizontal ground slip of up to 6.7 m near Ekinözü, while Sentinel-1 radar Line-Of-Sight (LOS) displacement spans -95 cm to +110 cm per fringe cycle stack.',
      peerReviewedCitation:
        'USGS / COMET Sentinel-1 InSAR Co-Seismic Deformation Analysis (February 2023); Reitman et al., Science (2023).'
    },
    fringeExplanation:
      'Each complete color fringe (full cyan-to-red cycle) represents exactly 2.8 cm (half of the 5.55 cm radar wavelength) of ground motion toward or away from the satellite line-of-sight.'
  },
  {
    id: 'morocco-2023',
    name: '2023 Al Haouz High Atlas Earthquake',
    country: 'Morocco',
    date: '2023-09-08',
    magnitude: 6.8,
    hypocenterDepthKm: 18.5,
    coordinates: {
      lat: 31.057,
      lng: -8.404,
    },
    satellite: 'Copernicus Sentinel-1A',
    sensor: 'C-band Synthetic Aperture Radar (SAR)',
    band: 'C-band (5.405 GHz)',
    wavelengthCm: 5.55,
    orbitTracks: 'Ascending Track 131 & Descending Track 36',
    preSeismicDate: '2023-08-30',
    postSeismicDate: '2023-09-11',
    dataProviders: [
      'ESA Copernicus Data Space',
      'COMET Satellite Observations Portal',
      'Institut Scientifique Rabat'
    ],
    sourceUrl: 'https://dataspace.copernicus.eu/',
    summary:
      'A deep intraplate oblique-thrust event beneath the High Atlas Mountains. Sentinel-1 interferograms revealed asymmetric crustal uplift with no prominent surface fault rupture break.',
    tectonicSetting: 'Oblique-slip thrust faulting within the High Atlas intraplate mountain belt.',
    surfaceRuptureKm: 0, // Blind faulting
    verifiedDisplacement: {
      losUpliftCm: 20,
      losSubsidenceCm: 8,
      horizontalFaultSlipMeters: 1.8,
      notes:
        'InSAR demonstrated up to ~20 cm of line-of-sight uplift toward the satellite south of the epicentral zone, confirming deep blind thrusting that did not pierce the ground surface.',
      peerReviewedCitation:
        'COMET Special Event Report: Morocco High Atlas Earthquake Sentinel-1 Interferometry (September 2023).'
    },
    fringeExplanation:
      'The concentric elliptical fringes centered north of Ighil indicate smooth subsurface doming and elastic strain release.'
  },
  {
    id: 'ridgecrest-2019',
    name: '2019 Ridgecrest California Earthquake Sequence',
    country: 'United States',
    date: '2019-07-05',
    magnitude: 7.1,
    hypocenterDepthKm: 8.0,
    coordinates: {
      lat: 35.770,
      lng: -117.599,
    },
    satellite: 'Copernicus Sentinel-1 & ALOS-2 PALSAR-2',
    sensor: 'C-band & L-band SAR',
    band: 'C-band (5.55 cm) & L-band (23.6 cm)',
    wavelengthCm: 5.55,
    orbitTracks: 'Descending Track 71 & Ascending Track 64',
    preSeismicDate: '2019-07-04',
    postSeismicDate: '2019-07-16',
    dataProviders: [
      'NASA Jet Propulsion Laboratory (JPL) ARIA Team',
      'USGS Earthquake Science Center',
      'Alaska Satellite Facility (ASF)'
    ],
    sourceUrl: 'https://aria.jpl.nasa.gov/',
    summary:
      'Orthogonal fault rupture in the Mojave Desert Eastern California Shear Zone. NASA JPL ARIA generated high-resolution interferograms and damage proxy maps (DPM).',
    tectonicSetting: 'Right-lateral strike-slip along the Eastern California Shear Zone.',
    surfaceRuptureKm: 75,
    verifiedDisplacement: {
      losUpliftCm: 85,
      losSubsidenceCm: 70,
      horizontalFaultSlipMeters: 4.8,
      notes:
        'NASA JPL ARIA derived line-of-sight deformation showing sharp fringe discontinuities directly delineating two conjugate fault ruptures intersecting at nearly 90 degrees.',
      peerReviewedCitation:
        'Fielding et al., NASA-JPL ARIA Processing of Sentinel-1 for 2019 Ridgecrest Earthquakes; Barnhart et al., Science (2019).'
    },
    fringeExplanation:
      'Fringe discontinuity lines precisely mark the surface trace of the fault rupture across desert terrain.'
  }
];

export interface SarSourceItem {
  title: string;
  agency: string;
  category: 'nasa-earthdata' | 'nisar-jpl' | 'csa-radarsat' | 'conae-saocom';
  description: string;
  bandOrFocus: string;
  url: string;
}

export const SAR_OFFICIAL_SOURCES: SarSourceItem[] = [
  // NASA Earthdata & Alaska Satellite Facility (ASF)
  {
    title: 'NASA Earthdata Search',
    agency: 'NASA ESDIS',
    category: 'nasa-earthdata',
    description: 'Primary catalog to search, filter, and download NASA Earth observation datasets across radar, optical, and geophysical archives.',
    bandOrFocus: 'Global Data Discovery Portal',
    url: 'https://search.earthdata.nasa.gov/search',
  },
  {
    title: 'Alaska Satellite Facility (ASF) Vertex Search',
    agency: 'NASA DAAC / UAF',
    category: 'nasa-earthdata',
    description: 'Interactive radar granule search portal providing Sentinel-1, ALOS PALSAR, RADARSAT-1, UAVSAR, and NISAR SAR products.',
    bandOrFocus: 'Multi-Mission SAR Granules',
    url: 'https://search.asf.alaska.edu/#/',
  },
  {
    title: 'Earth Observation Data Basics',
    agency: 'NASA Earthdata',
    category: 'nasa-earthdata',
    description: 'Foundational guide explaining satellite orbits, spatial and temporal resolution, spectral bands, and remote sensing data levels.',
    bandOrFocus: 'Remote Sensing Fundamentals',
    url: 'https://www.earthdata.nasa.gov/learn/earth-observation-data-basics',
  },
  {
    title: 'What is Synthetic Aperture Radar (SAR)?',
    agency: 'NASA Earthdata',
    category: 'nasa-earthdata',
    description: 'Scientific overview of active microwave backscatter, radar wavelengths (X, C, L, P bands), polarization, and interferometry.',
    bandOrFocus: 'SAR Physics & Wavelengths',
    url: 'https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar',
  },
  {
    title: 'NASA ARSET (Applied Remote Sensing Training)',
    agency: 'NASA Capacity Building',
    category: 'nasa-earthdata',
    description: 'Instructor-led and self-paced training materials on applying satellite radar and optical data to earthquakes, landslides, and floods.',
    bandOrFocus: 'Disaster Monitoring Training',
    url: 'https://www.earthdata.nasa.gov/data/projects/arset',
  },

  // NASA-ISRO NISAR Mission & JPL UAVSAR
  {
    title: 'NISAR Mission Documentation (ASF)',
    agency: 'NASA / ISRO / ASF',
    category: 'nisar-jpl',
    description: 'Technical documentation for the dual-frequency L-band and S-band NASA-ISRO Synthetic Aperture Radar mission for crustal deformation.',
    bandOrFocus: 'L-Band & S-Band SAR Specs',
    url: 'https://nisar-docs.asf.alaska.edu/',
  },
  {
    title: 'NISAR Mission ArcGIS StoryMaps',
    agency: 'NASA Science',
    category: 'nisar-jpl',
    description: 'Visual science narratives illustrating how NISAR tracks solid Earth motion, fault creep, volcanic inflation, and ice-sheet dynamics.',
    bandOrFocus: 'Interactive Mission Stories',
    url: 'https://science.nasa.gov/mission/nisar/arcgis-storymaps/',
  },
  {
    title: 'NISAR Societal Benefits',
    agency: 'NASA Science',
    category: 'nisar-jpl',
    description: 'Overview of how open-access radar deformation measurements inform earthquake hazard modeling, infrastructure resilience, and response.',
    bandOrFocus: 'Hazards & Public Benefit',
    url: 'https://science.nasa.gov/mission/nisar/societal-benefits/',
  },
  {
    title: 'JPL UAVSAR Education Postcards',
    agency: 'NASA Jet Propulsion Laboratory',
    category: 'nisar-jpl',
    description: 'Airborne L-band Polarimetric SAR case studies demonstrating fault slip, subsidence, and ground deformation interferograms.',
    bandOrFocus: 'L-Band Airborne InSAR Examples',
    url: 'https://uavsar.jpl.nasa.gov/education/postcards.html',
  },

  // Canadian Space Agency (CSA) RADARSAT
  {
    title: 'RADARSAT Constellation Mission (RCM) Open Data',
    agency: 'Canadian Space Agency (CSA)',
    category: 'csa-radarsat',
    description: 'Open-access C-band SAR datasets from Canada’s three-satellite constellation supporting rapid revisit disaster and terrain monitoring.',
    bandOrFocus: 'C-Band Constellation SAR',
    url: 'https://donnees-data.asc-csa.gc.ca/en/dataset/rcm',
  },
  {
    title: 'RADARSAT-1 Open Data Archive',
    agency: 'Canadian Space Agency (CSA)',
    category: 'csa-radarsat',
    description: 'Historic global C-band SAR archive (1995–2013) released for scientific baseline comparisons and long-term tectonic deformation research.',
    bandOrFocus: 'Historic C-Band Archive',
    url: 'https://donnees-data.asc-csa.gc.ca/en/dataset/radarsat1',
  },
  {
    title: 'CSA Synthetic Aperture Radar Tutorial',
    agency: 'Canadian Space Agency (GitHub)',
    category: 'csa-radarsat',
    description: 'Open-source educational repository covering SAR imaging geometry, speckle filtering, polarimetry, and practical processing workflows.',
    bandOrFocus: 'Open-Source SAR Curriculum',
    url: 'https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial',
  },

  // CONAE Argentina SAOCOM L-Band Mission
  {
    title: 'CONAE SAOCOM Product Catalog',
    agency: 'CONAE (Argentina)',
    category: 'conae-saocom',
    description: 'Official catalog for the SAOCOM-1A and SAOCOM-1B L-band polarimetric SAR satellites, ideal for measuring large fault displacements through vegetation.',
    bandOrFocus: 'L-Band Polarimetric SAR',
    url: 'https://catalogos.conae.gov.ar/catalogo/catalogoSaocomInfo.html',
  },
  {
    title: 'SAOCOM Open Information & Accessibility',
    agency: 'Argentina.gob.ar / CONAE',
    category: 'conae-saocom',
    description: 'Official update detailing expanded public and scientific accessibility to SAOCOM L-band radar observations and emergency products.',
    bandOrFocus: 'Open L-Band Access Policy',
    url: 'https://www.argentina.gob.ar/noticias/la-informacion-saocom-cada-vez-mas-accesible',
  },
];

export const SAR_SOURCE_CATEGORIES: {
  id: SarSourceItem['category'];
  label: string;
  subtitle: string;
}[] = [
  {
    id: 'nasa-earthdata',
    label: 'NASA Earthdata & ASF',
    subtitle: 'Global SAR archives, data fundamentals, and applied remote sensing training.',
  },
  {
    id: 'nisar-jpl',
    label: 'NASA-ISRO NISAR & JPL UAVSAR',
    subtitle: 'Next-generation L/S-band crustal deformation missions and airborne interferometry.',
  },
  {
    id: 'csa-radarsat',
    label: 'Canadian Space Agency (RADARSAT)',
    subtitle: 'C-band RCM & RADARSAT-1 open datasets and open-source SAR tutorials.',
  },
  {
    id: 'conae-saocom',
    label: 'CONAE Argentina (SAOCOM)',
    subtitle: 'L-band polarimetric SAR catalog and public scientific data access.',
  },
];

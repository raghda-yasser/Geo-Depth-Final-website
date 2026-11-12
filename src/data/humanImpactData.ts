import { HumanImpactRecord } from '../types/earthquake.ts';

export const HUMAN_IMPACT_RECORDS: HumanImpactRecord[] = [
  {
    id: 'turkiye-syria-2023',
    earthquakeName: '2023 Kahramanmaraş Earthquake Doublet (Mw 7.8 & 7.5)',
    country: 'Türkiye and Syria',
    date: '6 February 2023',
    magnitude: 7.8,
    fatalities: 59259, // ~53,537 in Türkiye (AFAD) + ~5,722 in Syria (WHO/UN)
    injuries: 107204,
    displacedPeople: 3000000,
    buildingsDestroyedOrDamaged: 312000,
    economicLossBillionsUSD: 103.6,
    geographicScope: '11 provinces in southern Türkiye (Hatay, Kahramanmaraş, Gaziantep, etc.) and northwest Syria (Aleppo, Idlib).',
    reportingDate: 'Reported March 2023 / Updated September 2023',
    source: 'UN OCHA Situation Reports, WHO Disaster Database, and AFAD Official Bulletin',
    sourceUrl: 'https://reliefweb.int/disaster/eq-2023-000015-tur',
    keyHumanitarianNotes:
      'Extreme winter temperatures compounded shelter vulnerability. Over 14 million people were exposed to strong shaking (MMI VII+), with 3+ million directly displaced into temporary container cities and tent villages.',
    emergencyResponseActions: [
      'AFAD mobilized 238,000 national and international search and rescue personnel across 11 provinces.',
      'WHO deployed 160+ Emergency Medical Teams (EMTs) for trauma triage and infectious disease surveillance.',
      'UN OCHA Flash Appeal allocated $1.4B in humanitarian assistance for shelter, clean water, and thermal nutrition.'
    ]
  },
  {
    id: 'morocco-2023',
    earthquakeName: '2023 Al Haouz High Atlas Earthquake (Mw 6.8)',
    country: 'Morocco',
    date: '8 September 2023',
    magnitude: 6.8,
    fatalities: 2960,
    injuries: 5674,
    displacedPeople: 250000,
    buildingsDestroyedOrDamaged: 58000,
    economicLossBillionsUSD: 7.0,
    geographicScope: 'Al Haouz, Taroudant, Chichaoua, Ouarzazate, and Marrakech provinces.',
    reportingDate: 'Reported October 2023',
    source: 'Ministry of Interior Morocco, WHO Regional Office, and ReliefWeb UN OCHA',
    sourceUrl: 'https://reliefweb.int/disaster/eq-2023-000166-mar',
    keyHumanitarianNotes:
      'Isolated mountain hamlets in the High Atlas were cut off by rockfalls on narrow winding roads. Traditional adobe (clay brick) vernacular dwellings suffered catastrophic collapse.',
    emergencyResponseActions: [
      'Royal Armed Forces (FAR) deployed heavy air-lift helicopters and specialized mountain rescue units.',
      'Moroccan Red Crescent established mobile health clinics, psychological first aid, and winterized tent camps.',
      'Government announced direct reconstruction stipends for 50,000+ certified damaged households.'
    ]
  },
  {
    id: 'nepal-2015',
    earthquakeName: '2015 Gorkha Nepal Earthquake (Mw 7.8)',
    country: 'Nepal',
    date: '25 April 2015',
    magnitude: 7.8,
    fatalities: 8964,
    injuries: 22300,
    displacedPeople: 2800000,
    buildingsDestroyedOrDamaged: 602000,
    economicLossBillionsUSD: 10.0,
    geographicScope: 'Central and Western Regions of Nepal, including Kathmandu Valley and Everest Region.',
    reportingDate: 'Reported August 2015',
    source: 'Government of Nepal Post-Disaster Needs Assessment (PDNA), UN OCHA',
    sourceUrl: 'https://reliefweb.int/report/nepal/nepal-earthquake-2015-post-disaster-needs-assessment-pdna-executive-summary',
    keyHumanitarianNotes:
      'Triggered massive avalanches on Mount Everest and widespread valley landslides that blocked arterial transit routes prior to the annual monsoon season.',
    emergencyResponseActions: [
      'Multi-national military logistics hub established at Tribhuvan International Airport.',
      'Over 4.2 million people received emergency shelter kits and high-energy food rations from WFP.',
      'Comprehensive seismic retrofitting codes enacted for school infrastructure rehabilitation.'
    ]
  },
  {
    id: 'japan-2011',
    earthquakeName: '2011 Great East Japan Earthquake & Tsunami (Mw 9.1)',
    country: 'Japan',
    date: '11 March 2011',
    magnitude: 9.1,
    fatalities: 19759, // Deaths and confirmed missing (National Police Agency Japan)
    injuries: 6242,
    displacedPeople: 470000,
    buildingsDestroyedOrDamaged: 121996,
    economicLossBillionsUSD: 235.0,
    geographicScope: 'Tohoku Region (Miyagi, Iwate, Fukushima prefectures) and coastal Honshu.',
    reportingDate: 'Reported 2012 / Updated 2021 by NPA Japan & World Bank',
    source: 'National Police Agency of Japan, Cabinet Office Disaster Management, World Bank GFDRR',
    sourceUrl: 'https://www.usgs.gov/news/featured-story/ten-years-after-2011-great-east-japan-earthquake-and-tsunami',
    keyHumanitarianNotes:
      'Over 90% of casualties resulted from drowning due to the colossal tsunami inundation (run-up heights exceeding 39 meters). Strict building codes minimized structural collapse from shaking alone.',
    emergencyResponseActions: [
      'Japan Self-Defense Forces mobilized 100,000 personnel in largest post-war domestic disaster operation.',
      'Reconstruction Agency instituted 10-year reconstruction framework including elevated sea walls and relocated residential zones.',
      'Global mutual aid received from 163 countries and regions.'
    ]
  }
];

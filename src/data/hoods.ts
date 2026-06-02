export type Status = 'sun' | 'partly' | 'mist' | 'karl' | 'wind' | 'rain' | 'night';

export interface Hood {
  id: string;
  name: string;
  x: number; // % of map width
  y: number; // % of map height
  status: Status;
  temp: number;
  wind: number;
  vis: number;
  score: number;
  cams: number;
  host: string;
  liveUrl?: string;
  embedUrl?: string;
  embed?: boolean;
  poster?: string;
  blurb: string;
}

export const KARL_HOODS: Hood[] = [
  { id: 'presidio',         name: 'Presidio',          x: 40.5, y: 29.3, status: 'mist',   temp: 56, wind: 17, vis: 1.8, score: 62, cams: 6,  host: 'Inspiration Pt. cam',   blurb: 'Forest + fog = my favorite cologne.' },
  { id: 'marina',           name: 'Marina',            x: 52.3, y: 26.0, status: 'partly', temp: 60, wind: 17, vis: 4.5, score: 43, cams: 12, host: 'Crissy Field beach cam',  liveUrl: 'https://parksconservancy.siteproxy.net/Crissy%20Beach/ctl.html', blurb: 'Sun now, wall of me rolling in by 5. Classic.' },
  { id: 'fishermans',       name: "Fisherman's Wharf", x: 59.7, y: 24.2, status: 'partly', temp: 60, wind: 16, vis: 5.0, score: 41, cams: 9,  host: 'EarthCam · SF Bayfront', liveUrl: 'https://www.earthcam.com/usa/california/sanfrancisco/?cam=rowingclub', embed: false, blurb: 'Briny and brisk. The sea lions don\'t mind me.' },
  { id: 'north-beach',      name: 'North Beach',       x: 63.4, y: 27.5, status: 'sun',    temp: 64, wind: 10, vis: 7.5, score: 20, cams: 8,  host: 'Washington Sq. cam',    blurb: 'Espresso weather. Sit outside, you\'ve earned it.' },
  { id: 'fidi',             name: 'FiDi',              x: 64.6, y: 35.4, status: 'sun',    temp: 64, wind: 12, vis: 8.0, score: 17, cams: 11, host: 'SkylineWebcams · San Francisco', liveUrl: 'https://www.skylinewebcams.com/en/webcam/united-states/california/san-francisco/san-francisco.html', embed: false, blurb: 'Clear up high, gusty at the crosswalks.' },
  { id: 'soma',             name: 'SOMA',              x: 64.7, y: 43.9, status: 'partly', temp: 63, wind: 9,  vis: 6.5, score: 27, cams: 12, host: 'EarthCam · SF Skyline', liveUrl: 'https://www.earthcam.com/usa/california/sanfrancisco/?cam=sanfranciscoskyline', embed: false, blurb: 'Sun with a side of wind tunnel between towers.' },
  { id: 'dogpatch',         name: 'Dogpatch',          x: 68.6, y: 56.4, status: 'sun',    temp: 65, wind: 8,  vis: 8.5, score: 13, cams: 9,  host: 'Pier crane cam',        blurb: 'Flat, bright, and breezy off the water.' },
  { id: 'potrero',          name: 'Potrero Hill',      x: 64.1, y: 57.6, status: 'sun',    temp: 66, wind: 6,  vis: 9.0, score: 10, cams: 8,  host: '18th St. crest cam',    blurb: 'Sun trap. You\'ll forget I exist down here.' },
  { id: 'southeast',        name: 'Southeast SF',      x: 65.1, y: 83.1, status: 'sun',    temp: 66, wind: 9,  vis: 9.0, score: 9,  cams: 8,  host: 'India Basin cam',       blurb: 'Sunniest corner of the city. Don\'t tell everyone.' },
  { id: 'richmond',         name: 'Richmond',          x: 34.6, y: 41.2, status: 'karl',   temp: 53, wind: 20, vis: 0.4, score: 89, cams: 13, host: 'Surfline · Ocean Beach', liveUrl: 'http://beachcams.wannabemobile.com/ocean-beach-san-francisco', blurb: 'Full pour. The ocean and I are one big damp idea.' },
  { id: 'pac-heights',      name: 'Pacific Heights',   x: 50.4, y: 37.4, status: 'partly', temp: 60, wind: 15, vis: 5.0, score: 39, cams: 9,  host: 'Broadway view cam',     blurb: 'Million-dollar view of me approaching from the west.' },
  { id: 'nob-hill',         name: 'Nob Hill',          x: 58.3, y: 34.9, status: 'partly', temp: 61, wind: 13, vis: 6.0, score: 32, cams: 6,  host: 'Grace Cathedral cam',   blurb: 'I crest the hill some afternoons. Cable-car cinematic.' },
  { id: 'hayes',            name: 'Hayes Valley',      x: 57.1, y: 45.9, status: 'partly', temp: 62, wind: 10, vis: 6.0, score: 30, cams: 8,  host: "Patricia's Green cam",  blurb: "Pleasant pockets. P'tit gray by dusk." },
  { id: 'mission',          name: 'The Mission',       x: 58.8, y: 59.3, status: 'sun',    temp: 67, wind: 5,  vis: 9.5, score: 8,  cams: 16, host: 'Dolores Park hill cam', blurb: 'The one true sunny. I dare not enter.' },
  { id: 'bernal',           name: 'Bernal Heights',    x: 58.1, y: 73.9, status: 'sun',    temp: 65, wind: 7,  vis: 9.0, score: 11, cams: 9,  host: 'Bernal summit cam',     blurb: 'Top of the hill, top of the forecast. Crisp.' },
  { id: 'noe-valley',       name: 'Noe Valley',        x: 51.4, y: 69.5, status: 'sun',    temp: 63, wind: 6,  vis: 7.5, score: 18, cams: 10, host: '24th St. stroller cam', blurb: 'Banana belt behavior. I bounce right off these hills.' },
  { id: 'castro',           name: 'The Castro',        x: 52.7, y: 60.0, status: 'sun',    temp: 64, wind: 7,  vis: 7.8, score: 16, cams: 8,  host: 'SkylineWebcams · Castro St', liveUrl: 'https://www.skylinewebcams.com/en/webcam/united-states/california/san-francisco/castro-street-san-francisco.html', embed: false, blurb: 'Bright and proud. The hills keep me out.' },
  { id: 'haight',           name: 'Haight-Ashbury',    x: 48.0, y: 51.2, status: 'partly', temp: 59, wind: 12, vis: 4.0, score: 44, cams: 7,  host: 'Buena Vista cam',       blurb: 'Half gray, half groovy. Mood lighting, basically.' },
  { id: 'twin-peaks',       name: 'Twin Peaks',        x: 46.4, y: 64.2, status: 'wind',   temp: 52, wind: 28, vis: 1.0, score: 78, cams: 7,  host: 'Sutro Tower base cam',  blurb: 'Hold your hat. I\'m doing 28 and accelerating.' },
  { id: 'golden-gate-park', name: 'Golden Gate Park',  x: 34.7, y: 50.9, status: 'karl',   temp: 54, wind: 15, vis: 0.6, score: 83, cams: 6,  host: 'Bison paddock cam',     blurb: "The bison can't see the windmill. Neither can you." },
  { id: 'sunset',           name: 'Sunset',            x: 34.7, y: 65.4, status: 'karl',   temp: 54, wind: 18, vis: 0.3, score: 92, cams: 14, host: 'Surfline · Ocean Beach', liveUrl: 'http://beachcams.wannabemobile.com/ocean-beach-san-francisco', blurb: "I never left. Bring a hood." },
  { id: 'lake-merced',      name: 'Lake Merced',       x: 34.1, y: 84.2, status: 'mist',   temp: 55, wind: 11, vis: 1.6, score: 60, cams: 4,  host: 'Lake Merced overlook',  blurb: 'Soft focus all day. Very flattering, low visibility.' },
  { id: 'glen-park',        name: 'Glen Park',         x: 44.1, y: 80.5, status: 'partly', temp: 60, wind: 8,  vis: 5.0, score: 33, cams: 5,  host: 'Canyon ridge cam',      blurb: "Canyon's keeping the gloom out. Lucky you." },
];

export const KARL_STATUS: Record<Status, { label: string; vibe: string }> = {
  sun:    { label: 'Clear',      vibe: 'No Karl in sight' },
  partly: { label: 'Patchy',     vibe: "Karl's circling" },
  mist:   { label: 'Misty',      vibe: 'Light Karl' },
  karl:   { label: 'Full Karl',  vibe: 'Peak fog' },
  wind:   { label: 'Gale',       vibe: 'Karl in a hurry' },
  rain:   { label: 'Drizzle',    vibe: "Karl's crying" },
  night:  { label: 'Night',      vibe: 'Karl after dark' },
};

export function cityVerdict(hoods: Hood[]) {
  const avg = Math.round(hoods.reduce((s, h) => s + h.score, 0) / hoods.length);
  let head: string, status: Status;
  if (avg >= 62)      { head = 'Heavy Karl citywide';      status = 'karl'; }
  else if (avg >= 42) { head = 'Patchy Karl';              status = 'partly'; }
  else if (avg >= 26) { head = 'Mostly clear';             status = 'partly'; }
  else                { head = "Karl's taken the day off"; status = 'sun'; }
  return { head, status, avg };
}

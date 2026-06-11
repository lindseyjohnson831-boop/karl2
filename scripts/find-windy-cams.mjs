#!/usr/bin/env node
// Discover Windy webcams for the KarlCheck neighborhoods that can't use Surfline.
// Windy's player embed iframes are public (no key at runtime) — the key is only
// needed here, to look up which cams exist and grab their embed URLs.
//
// The key lives in .env.local (gitignored). Run with:
//   node --env-file=.env.local scripts/find-windy-cams.mjs
// or override inline:  WINDY_API_KEY=xxxx node scripts/find-windy-cams.mjs
// Get a free key at https://api.windy.com/keys (Webcams API).
//
// Paste the printed embedUrl into the matching hood in assets/karlcheck.html.

const KEY = process.env.WINDY_API_KEY;
if (!KEY) {
  console.error('No WINDY_API_KEY. Run: node --env-file=.env.local scripts/find-windy-cams.mjs');
  process.exit(1);
}

// approximate lat/lon for each cam-less downtown/wharf neighborhood
const TARGETS = [
  { id: 'fidi',        name: 'FiDi',              lat: 37.7946, lon: -122.3999 },
  { id: 'soma',        name: 'SOMA',              lat: 37.7785, lon: -122.4056 },
  { id: 'fishermans',  name: "Fisherman's Wharf", lat: 37.8080, lon: -122.4177 },
  { id: 'castro',      name: 'The Castro',        lat: 37.7609, lon: -122.4350 },
];

const API = 'https://api.windy.com/webcams/api/v3/webcams';

async function nearby(t) {
  const url = `${API}?nearby=${t.lat},${t.lon},12&limit=30&include=player,location,images,categories,urls`;
  const res = await fetch(url, { headers: { 'x-windy-api-key': KEY } });
  if (!res.ok) throw new Error(`${t.name}: HTTP ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.webcams || [];
}

const km = (a, b, c, d) => {
  const R = 6371, toR = (x) => (x * Math.PI) / 180;
  const dLat = toR(c - a), dLon = toR(d - b);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a)) * Math.cos(toR(c)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(h)) * 10) / 10;
};

for (const t of TARGETS) {
  try {
    const cams = await nearby(t);
    // prefer scenic views over highway traffic cams
    const scored = cams
      .filter((c) => c.status === 'active' && c.player?.live)
      .map((c) => {
        const cats = (c.categories || []).map((x) => x.id);
        const dist = c.location?.latitude ? km(t.lat, t.lon, c.location.latitude, c.location.longitude) : 99;
        const traffic = cats.includes('traffic') || /TVD\d|I-80|US-101|caltrans|hwy/i.test(c.title);
        return { c, cats, dist, traffic };
      })
      .sort((a, b) => (a.traffic - b.traffic) || (a.dist - b.dist));
    console.log(`\n=== ${t.name} (${t.id}) — ${scored.length} live cams ===`);
    scored.slice(0, 8).forEach(({ c, cats, dist, traffic }) => {
      console.log(`  ${traffic ? '🚗' : '🌆'} ${c.title}  [${dist}km · ${cats.join(',')}]`);
      console.log(`      embedUrl: ${c.player.live}`);
      console.log(`      poster:   ${c.images?.current?.preview || ''}`);
    });
    const best = scored[0];
    if (best) console.log(`  → SUGGESTED ${t.id}: embedUrl="${best.c.player.live}" poster="${best.c.images?.current?.preview || ''}"`);
  } catch (e) {
    console.error('  ' + e.message);
  }
}

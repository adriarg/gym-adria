// Lee de Strava los entrenos de fuerza (con las series que escribe Hevy) y las carreras desde agosto,
// y los guarda en docs/data/ con la misma forma que usa la dashboard. Lo ejecuta GitHub Actions.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(raiz, 'docs', 'data');
const CACHE = path.join(raiz, 'data-cache', 'descripciones.json');
const DESDE = Date.parse('2026-08-01T00:00:00Z') / 1000;
const MAX_DETALLES = 80; // Strava permite 100 lecturas cada 15 minutos

const {STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN} = process.env;
if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
  console.log('Faltan los secrets de Strava: no se actualiza nada.');
  process.exit(0);
}

const tok = await fetch('https://www.strava.com/oauth/token', {
  method: 'POST',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  body: new URLSearchParams({client_id: STRAVA_CLIENT_ID, client_secret: STRAVA_CLIENT_SECRET, refresh_token: STRAVA_REFRESH_TOKEN, grant_type: 'refresh_token'})
});
if (!tok.ok) throw new Error('Strava rechazó las claves: ' + tok.status + ' ' + (await tok.text()).slice(0, 200));
const {access_token} = await tok.json();
const api = async (url) => {
  const r = await fetch('https://www.strava.com/api/v3' + url, {headers: {Authorization: 'Bearer ' + access_token}});
  if (!r.ok) throw new Error('Strava ' + url + ' → ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return r.json();
};

const todas = [];
for (let page = 1; ; page++) {
  const lote = await api(`/athlete/activities?after=${DESDE}&per_page=200&page=${page}`);
  todas.push(...lote);
  if (lote.length < 200) break;
}

const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
const reciente = Date.now() - 3 * 864e5; // Hevy puede editar la descripción después de subirla
const gymActs = todas.filter((a) => a.sport_type === 'WeightTraining');
let pedidos = 0;
for (const a of gymActs.sort((x, y) => Date.parse(y.start_date) - Date.parse(x.start_date))) {
  const c = cache[a.id];
  // Las recientes se vuelven a pedir como mucho cada hora, para no gastar el límite diario de Strava.
  if (c && (!(Date.parse(a.start_date) > reciente) || Date.now() - (c.leido || 0) < 36e5)) continue;
  if (pedidos >= MAX_DETALLES) break;
  const d = await api('/activities/' + a.id);
  pedidos++;
  cache[a.id] = {description: d.description || '', leido: Date.now()};
}

const forma = (a) => ({id: a.id, name: a.name, sport_type: a.sport_type, start_local: String(a.start_date_local || '').replace('Z', ''), description: (cache[a.id] && cache[a.id].description) || '', summary: {moving_time: a.moving_time, distance: a.distance}});
const porFecha = (x, y) => (x.start_local < y.start_local ? 1 : -1);
const gym = {activities: gymActs.map(forma).sort(porFecha), has_next_page: false};
const carreras = {activities: todas.filter((a) => a.sport_type === 'Run').map(forma).map(({description, ...r}) => r).sort(porFecha), has_next_page: false};

fs.mkdirSync(OUT, {recursive: true});
fs.mkdirSync(path.dirname(CACHE), {recursive: true});
const escribe = (f, v) => { const p = path.join(OUT, f), t = JSON.stringify(v, null, 1); const antes = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''; if (antes !== t) { fs.writeFileSync(p, t); return true; } return false; };
const cambio = [escribe('gym.json', gym), escribe('carreras.json', carreras)].some(Boolean);
fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1));
if (cambio || !fs.existsSync(path.join(OUT, 'meta.json'))) fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({actualizado: new Date().toISOString(), entrenos: gym.activities.length, carreras: carreras.activities.length}));
console.log(`Strava: ${gym.activities.length} entrenos, ${carreras.activities.length} carreras, ${pedidos} descripciones pedidas, ${cambio ? 'con cambios' : 'sin cambios'}.`);

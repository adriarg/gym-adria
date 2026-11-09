// Pruebas de los cálculos de la web. Se lanzan con: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = (f) => JSON.parse(fs.readFileSync(path.join(raiz, f), 'utf8'));
const rutina = leer('dashboard/rutina.json'), musculos = leer('dashboard/musculos.json'), partes = leer('dashboard/partes.json');

// Un "dash" de mentira que solo guarda los cálculos para poder llamarlos.
const calcs = {}, loaders = {};
const nada = () => {};
const dash = {calc: (id, o) => { calcs[id] = o; }, loader: (id, o) => { loaders[id] = o; }, draw: nada, onData: nada, data: () => ({status: 'loading'}), params: () => ({}), setParams: nada, meta: () => null};
const d3 = {formatDefaultLocale: nada, timeFormatDefaultLocale: nada};
const window = {dash, d3, console};
window.window = window; // en el navegador, window es el ámbito global
const ctx = vm.createContext(window);
for (const f of ['dashboard/calculos.js', 'web/analisis.js']) vm.runInContext(fs.readFileSync(path.join(raiz, f), 'utf8'), ctx, {filename: f});

const sesion = (id, fecha, texto) => ({id, name: 'Entreno', start_local: fecha + 'T18:00:00', summary: {moving_time: 3600}, description: texto});
const cargar = (acts) => loaders.gym.fn({answer: {activities: acts}}).rows;
const series = (acts) => calcs.series.fn(cargar(acts), musculos);
const sug = (acts, id) => calcs.sugerencias.fn(rutina, series(acts)).find((r) => r.id === id);
const ej = (id) => rutina.find((r) => r.id === id);
const PRESS = 'Iso-Lateral Chest Press (Machine)';

test('la rutina tiene todos los campos que usa la web', () => {
  assert.equal(new Set(rutina.map((r) => r.id)).size, rutina.length, 'ids repetidos');
  for (const r of rutina) {
    for (const c of ['id', 'dia', 'bloque', 'ejercicio', 'hevy', 'musculo', 'series', 'reps']) assert.ok(r[c] != null && r[c] !== '', r.id + ' sin ' + c);
    assert.match(String(r.reps), /^\d+[–-]\d+/, r.id + ': rango de reps raro');
    const m = musculos.slice().sort((a, b) => a.orden - b.orden).find((x) => new RegExp(x.patron, 'i').test(r.hevy));
    assert.ok(m, r.id + ': ningún músculo reconoce "' + r.hevy + '"');
    assert.equal(m.musculo, r.musculo, r.id + ': el nombre de Hevy cae en otro músculo');
  }
});

test('lee las series de Hevy: peso, reps, calentamiento, fallo y notas', () => {
  const filas = cargar([sesion(1, '2026-11-09', 'Lat Pulldown (Cable)\n"Agarre ancho,\nnoto bien el dorsal"\nSet 1: 30 kg x 10 [Warm-up]\nSet 2: 50 kg x 9\nSet 3: 50 kg x 8 [Failure]\n\nPlank\nSet 1: 45s\n\nLogged with Hevy')]);
  assert.equal(filas.length, 4);
  assert.deepEqual([filas[0].tipo, filas[1].kg, filas[1].reps, filas[2].tipo], ['calentamiento', 50, 9, 'fallo']);
  assert.equal(filas[3].segundos, 45);
  assert.ok(filas.every((f) => f.ejercicio === 'Lat Pulldown (Cable)' || f.ejercicio === 'Plank'));
  const s = calcs.series.fn(filas, musculos);
  assert.equal(s.length, 3, 'el calentamiento no cuenta');
  assert.equal(s[0].musculo, 'Espalda');
  assert.equal(s[0].semana, '2026-11-09');
});

test('notas de Hevy: de una línea y de varias', () => {
  const n = window.mgNotas({activities: [sesion(7, '2026-11-09', 'Bicep Curl (Dumbbell)\n"Molesta el codo"\nSet 1: 10 kg x 10\n\nLat Pulldown (Cable)\n"Línea uno\nlínea dos"\nSet 1: 50 kg x 9')]});
  assert.equal(n['7|Bicep Curl (Dumbbell)'], 'Molesta el codo');
  assert.equal(n['7|Lat Pulldown (Cable)'], 'Línea uno · línea dos');
});

test('peso sugerido: sin historial usa el peso de partida', () => {
  const r = sug([], 'L1');
  assert.equal(r.origen, 'inicial');
  assert.equal(r.kg, ej('L1').peso_inicial);
});

test('peso sugerido: tope de reps en todas las series → sube un escalón', () => {
  const r = sug([sesion(1, '2026-11-09', PRESS + '\nSet 1: 25 kg x 10\nSet 2: 25 kg x 10\nSet 3: 25 kg x 10')], 'L1');
  assert.equal(r.kg, 25 + ej('L1').incremento);
});

test('peso sugerido: dentro del rango → mismo peso', () => {
  const r = sug([sesion(1, '2026-11-09', PRESS + '\nSet 1: 25 kg x 9\nSet 2: 25 kg x 8\nSet 3: 25 kg x 7')], 'L1');
  assert.equal(r.kg, 25);
  assert.ok(!r.estancado);
});

test('peso sugerido: solo propone pesos que existen en la máquina del jalón', () => {
  const r = sug([sesion(1, '2026-11-09', 'Lat Pulldown (Cable)\nSet 1: 57.5 kg x 4\nSet 2: 57.5 kg x 3\nSet 3: 57.5 kg x 3')], 'L2');
  const e = ej('L2');
  assert.ok(r.kg < 57.5, 'debe bajar');
  const pasos = (r.kg - e.peso_base) / e.incremento;
  assert.ok(Math.abs(pasos - Math.round(pasos)) < 1e-9, r.kg + ' kg no existe en la máquina');
});

test('peso sugerido: tres sesiones iguales → avisa de estancamiento', () => {
  const s = (id, f) => sesion(id, f, PRESS + '\nSet 1: 25 kg x 8\nSet 2: 25 kg x 8\nSet 3: 25 kg x 7');
  const r = sug([s(1, '2026-11-09'), s(2, '2026-11-16'), s(3, '2026-11-23')], 'L1');
  assert.equal(r.estancado, true);
  assert.match(r.consejo, /3 sesiones sin mejorar/);
  const bien = sug([s(1, '2026-11-09'), s(2, '2026-11-16'), sesion(3, '2026-11-23', PRESS + '\nSet 1: 25 kg x 9\nSet 2: 25 kg x 8\nSet 3: 25 kg x 8')], 'L1');
  assert.equal(bien.estancado, false);
});

test('récords y tendencia', () => {
  const s = series([
    sesion(1, '2026-11-09', PRESS + '\nSet 1: 25 kg x 8'),
    sesion(2, '2026-11-16', PRESS + '\nSet 1: 25 kg x 10'),
    sesion(3, '2026-11-23', PRESS + '\nSet 1: 25 kg x 9')]);
  const rec = calcs.records.fn(s);
  assert.deepEqual(Array.from(rec, (r) => r.record), [false, true, false], 'la primera sesión no es récord; la segunda sí');
  const t = calcs.tendencia.fn(rec, rutina).find((r) => r.ejercicio === PRESS);
  assert.equal(t.estado, 'Baja');
  assert.equal(t.sesiones, 3);
});

test('plan frente a lo hecho: asigna la sesión a su día y marca cada ejercicio', () => {
  const lunes = rutina.filter((r) => r.dia === 'Lunes').sort((a, b) => a.orden - b.orden);
  const hi = (r) => Number(String(r.reps).split(/[–-]/)[1]);
  // Hace el lunes un martes, se salta el último ejercicio, deja corto el segundo y añade uno de fuera.
  const texto = lunes.slice(0, -1).map((r, i) => r.hevy + '\n' + Array.from({length: i === 1 ? r.series - 1 : r.series}, (_, k) => 'Set ' + (k + 1) + ': 20 kg x ' + hi(r)).join('\n')).join('\n\n') + '\n\nShrug (Dumbbell)\nSet 1: 20 kg x 12';
  const filas = calcs.cumplimiento.fn(cargar([sesion(1, '2026-11-10', texto)]), rutina);
  const dia = filas.filter((f) => f.dia === 'Lunes');
  assert.equal(dia[0].fecha, '2026-11-10', 'la sesión cuenta como el lunes aunque se hiciera en martes');
  const de = (id) => dia.find((f) => f.id === id).estado;
  assert.equal(de(lunes[0].id), 'Tope de reps');
  assert.equal(de(lunes[1].id), 'Faltan series');
  assert.equal(de(lunes[lunes.length - 1].id), 'No hecho');
  assert.equal(dia.filter((f) => f.tipo === 'extra').length, 1);
  assert.ok(filas.filter((f) => f.dia === 'Jueves').every((f) => f.estado === 'Pendiente'));
});

test('cobertura del plan: todas las partes prioritarias salen calculadas', () => {
  const c = calcs.cobertura.fn(rutina, partes);
  assert.ok(c.length > 0);
  for (const f of c) assert.equal(f.efectivas, f.directas + f.indirectas / 2);
  assert.ok(!c.some((f) => f.prioridad === 'Alta' && f.estado === 'Sin trabajo'), 'hay una parte prioritaria sin trabajo');
});

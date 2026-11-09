/* Motor mínimo que imita el de la dashboard de Claude para que calculos.js y vistas.js
   funcionen igual en una web estática. Los datos salen de data/*.json, que GitHub Actions
   actualiza desde Strava. */
(function () {
  const ARCHIVOS = {gym: 'gym.json', carreras: 'carreras.json', marcas: 'marcas.json', rutina: 'rutina.json', partes: 'partes.json', musculos: 'musculos.json', cambios: 'cambios.json'};
  const loaders = {}, calcs = {}, draws = {}, onDataFns = [], raw = {};
  let cache = {}, params = {}, listo = false, meta = null;

  const data = (id) => {
    if (!listo) return {status: 'loading', data: calcs[id] ? null : [], refreshing: false};
    if (id in cache) return cache[id];
    let r;
    try {
      if (calcs[id]) {
        const ins = calcs[id].inputs.map(data);
        const mal = ins.find((d) => d.status !== 'ok');
        r = mal ? {status: mal.status, data: null, message: mal.message} : {status: 'ok', data: calcs[id].fn(...ins.map((d) => d.data))};
      } else if (id in raw) {
        const v = raw[id];
        if (v instanceof Error) r = {status: 'error', data: [], message: v.message};
        else if (loaders[id]) { const o = loaders[id].fn({answer: v}); r = {status: 'ok', data: o.rows || o, columns: o.columns}; }
        else r = {status: 'ok', data: Array.isArray(v) ? v : (v.rows || [])};
      } else r = {status: 'missing', data: []};
    } catch (e) {
      console.error('[' + id + ']', e);
      r = {status: 'error', data: calcs[id] ? null : [], message: e.message};
    }
    return (cache[id] = r);
  };

  const pintar = () => {
    for (const el of document.querySelectorAll('[data-draw]')) {
      const f = draws[el.getAttribute('data-draw')];
      if (!f) continue;
      try { f(el); } catch (e) { console.error('[draw ' + el.getAttribute('data-draw') + ']', e); }
    }
    for (const f of onDataFns) { try { f(); } catch (e) { console.error(e); } }
  };
  let pendiente = false;
  const repintar = () => { if (pendiente) return; pendiente = true; requestAnimationFrame(() => { pendiente = false; pintar(); }); };

  window.dash = {
    loader: (id, o) => { loaders[id] = o; },
    calc: (id, o) => { calcs[id] = o; },
    draw: (nombre, fn) => { draws[nombre] = fn; },
    data,
    onData: (fn) => { onDataFns.push(fn); },
    params: () => Object.assign({}, params),
    setParams: (p) => { for (const k in p) { if (p[k] == null) delete params[k]; else params[k] = p[k]; } repintar(); },
    resetParams: () => { params = {}; repintar(); },
    setLink: (nombre) => { try { history.replaceState(null, '', '#' + nombre); } catch (e) { /* sin historial */ } },
    refresh: () => cargar(),
    raw: (id) => (raw[id] instanceof Error ? null : raw[id] || null),
    colors: ['#3e7bfa', '#f07a2b', '#22a06b', '#9b6cf6', '#e5484d', '#0ea5c6', '#b8860b'],
    meta: () => meta
  };

  const cargar = async () => {
    const v = '?v=' + Date.now();
    await Promise.all(Object.entries(ARCHIVOS).map(async ([id, f]) => {
      try {
        const r = await fetch('data/' + f + v, {cache: 'no-store'});
        if (!r.ok) throw new Error('No se pudo leer ' + f + ' (' + r.status + ')');
        raw[id] = await r.json();
      } catch (e) { raw[id] = e; }
    }));
    try { const r = await fetch('data/meta.json' + v, {cache: 'no-store'}); if (r.ok) meta = await r.json(); } catch (e) { meta = null; }
    listo = true;
    cache = {};
    pintar();
  };

  document.addEventListener('DOMContentLoaded', () => {
    pintar();
    cargar();
    let ancho = window.innerWidth;
    window.addEventListener('resize', () => { if (Math.abs(window.innerWidth - ancho) > 20) { ancho = window.innerWidth; repintar(); } });
  });
})();

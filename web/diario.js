/* Solo en la web pública: pestaña "Entrenos" con cada sesión y cada serie, y la hora de los datos. */
(function () {
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const GRUPO = {'Pecho': 'pecho', 'Espalda': 'espalda', 'Hombro lateral': 'hombro', 'Hombro anterior': 'hombro', 'Hombro posterior': 'hombro', 'Bíceps': 'biceps', 'Tríceps': 'triceps', 'Antebrazo': 'antebrazo', 'Abdominales': 'abdomen', 'Cuádriceps': 'pierna', 'Isquios': 'pierna', 'Glúteos': 'pierna', 'Gemelos': 'pierna'};
  const color = (m) => 'var(--g-' + (GRUPO[m] || 'otros') + ')';
  const fKg = (n) => String(Math.round(n * 100) / 100).replace('.', ',');
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const fFecha = (f) => { const d = new Date(f + 'T12:00:00'); return DIAS[d.getDay()] + ' ' + d.getDate() + ' ' + MESES[d.getMonth()]; };

  // Línea de "datos actualizados" bajo el título.
  const lead = document.querySelector('.mg-lead');
  if (lead) { const p = el('p', 'mg-sub mg-fresh'); p.setAttribute('data-draw', 'actualizado'); lead.after(p); }
  dash.draw('actualizado', (p) => {
    const m = dash.meta();
    if (!m || !m.actualizado) { p.textContent = ''; return; }
    const d = new Date(m.actualizado);
    p.textContent = 'Datos de Strava al ' + d.getDate() + ' ' + MESES[d.getMonth()] + ', ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ' · se actualiza sola cada 5 minutos';
  });

  // Pestaña nueva, justo después de "Entreno".
  const nav = document.querySelector('.mg-nav');
  const primero = nav && nav.querySelector('[data-page="entreno"]');
  if (primero) {
    const b = el('button', 'mg-navbtn', 'Entrenos hechos');
    b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('data-page', 'diario'); b.setAttribute('aria-selected', 'false');
    primero.after(b);
    const sec = el('section', 'mg-page');
    sec.id = 'diario'; sec.setAttribute('data-pagepanel', 'diario'); sec.hidden = true;
    sec.append(el('h2', 'mg-h2', 'Entrenos hechos'), el('p', 'mg-sub', 'Cada sesión de Hevy con todas sus series, la más reciente arriba. Las de calentamiento salen en gris y no cuentan.'));
    const lista = el('div', 'mg-diario'); lista.setAttribute('data-draw', 'diario');
    sec.append(lista);
    document.getElementById('entreno').after(sec);
  }

  let todas = false;
  dash.draw('diario', (box) => {
    const g = dash.data('gym'), mu = dash.data('musculos');
    if (g.status !== 'ok') { box.replaceChildren(el('p', 'mg-empty', g.status === 'loading' ? 'Cargando…' : 'Aún no hay datos de Strava.')); return; }
    const reglas = mu.status === 'ok' ? mu.data.slice().sort((a, b) => a.orden - b.orden).map((r) => [new RegExp(r.patron, 'i'), r.musculo]) : [];
    const musc = (n) => { const r = reglas.find((x) => x[0].test(n)); return r ? r[1] : 'Otros'; };
    const ses = new Map();
    for (const s of g.data) {
      if (!ses.has(s.actividad)) ses.set(s.actividad, {fecha: s.fecha, sesion: s.sesion, minutos: s.minutos, ej: new Map()});
      if (!s.ejercicio) continue;
      const S = ses.get(s.actividad);
      if (!S.ej.has(s.ejercicio)) S.ej.set(s.ejercicio, []);
      S.ej.get(s.ejercicio).push(s);
    }
    const orden = [...ses.values()].sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
    const ver = todas ? orden : orden.slice(0, 8);
    box.replaceChildren(...ver.map((S) => {
      const card = el('article', 'mg-card mg-sesion');
      const head = el('div', 'mg-sesion-head');
      head.append(el('h3', 'mg-card-title', S.sesion || 'Entreno'), el('span', 'mg-note', fFecha(S.fecha) + (S.minutos ? ' · ' + S.minutos + ' min' : '') + (S.fecha < '2026-11-02' ? ' · en casa' : ' · Mast')));
      card.append(head);
      if (!S.ej.size) card.append(el('p', 'mg-empty', 'Sin series apuntadas.'));
      for (const [nombre, sets] of S.ej) {
        const m = musc(nombre), c = color(m);
        const fila = el('div', 'mg-ejrow');
        fila.style.borderLeftColor = c;
        const t = el('div', 'mg-ejname');
        t.append(el('b', null, nombre));
        const ch = el('span', 'mg-chip', m); ch.style.background = 'color-mix(in srgb, ' + c + ' 18%, transparent)'; ch.style.color = c;
        t.append(ch);
        const ss = el('div', 'mg-sets');
        for (const s of sets.sort((a, b) => a.serie - b.serie)) {
          const txt = s.kg != null && s.kg !== 0 ? fKg(s.kg) + ' kg × ' + s.reps : s.reps != null ? s.reps + ' reps' : s.segundos != null ? s.segundos + ' s' : '—';
          const p = el('span', 'mg-set mg-set-' + s.tipo, txt);
          if (s.tipo === 'calentamiento') p.title = 'Calentamiento';
          if (s.tipo === 'fallo') { p.append(el('small', null, ' fallo')); }
          if (s.tipo === 'drop') { p.append(el('small', null, ' drop')); }
          ss.append(p);
        }
        fila.append(t, ss);
        card.append(fila);
      }
      return card;
    }));
    if (orden.length > 8) {
      const b = el('button', 'mg-navbtn', todas ? 'Ver solo las últimas 8' : 'Ver las ' + orden.length + ' sesiones');
      b.type = 'button';
      b.addEventListener('click', () => { todas = !todas; dash.setParams({}); });
      box.append(b);
    }
  });
})();

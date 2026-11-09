/* Solo en la web pública: pestaña "Resumen" pensada para el entrenador. Una semana de un vistazo:
   qué se hizo frente al plan, qué ejercicios suben o se atascan, las notas de Adrià y los cambios de la rutina. */
(function () {
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const GRUPO = {'Pecho': 'pecho', 'Espalda': 'espalda', 'Hombro lateral': 'hombro', 'Hombro anterior': 'hombro', 'Hombro posterior': 'hombro', 'Bíceps': 'biceps', 'Tríceps': 'triceps', 'Antebrazo': 'antebrazo', 'Abdominales': 'abdomen', 'Cuádriceps': 'pierna', 'Isquios': 'pierna', 'Glúteos': 'pierna', 'Gemelos': 'pierna'};
  const color = (m) => 'var(--g-' + (GRUPO[m] || 'otros') + ')';
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const fFecha = (f) => { const d = new Date(f + 'T12:00:00'); return DIAS[d.getDay()] + ' ' + d.getDate() + ' ' + MESES[d.getMonth()]; };
  const pad2 = (n) => String(n).padStart(2, '0');
  const iso = (d) => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  const hoyISO = () => iso(new Date());
  const lunesHoy = () => { const d = new Date(); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return iso(d); };
  const masDias = (f, n) => { const d = new Date(f + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); };
  const POS = {Lunes: 0, Martes: 1, 'Miércoles': 2, Jueves: 3, Viernes: 4, 'Sábado': 5, Domingo: 6};
  const semana = () => dash.params().semana || lunesHoy();
  const INICIO_BLOQUE = '2026-11-09';
  const CLASE = {'En rango': 'mg-ok', 'Tope de reps': 'mg-ok', 'Faltan series': 'mg-warn', 'Bajo el rango': 'mg-warn', 'No hecho': 'mg-bad', 'Pendiente': 'mg-na', 'Fuera del plan': 'mg-na', 'Sube': 'mg-ok', 'Igual': 'mg-na', 'Baja': 'mg-bad', 'Estancado': 'mg-warn', 'Primera sesión': 'mg-na'};
  const EXPLICA = {'Tope de reps': 'Hizo el máximo de reps en todas las series: la próxima vez sube peso.', 'Bajo el rango': 'Alguna serie se quedó por debajo del mínimo de reps.', 'Faltan series': 'Hizo menos series de las que pide el plan.', 'Fuera del plan': 'Ejercicio que no está en la rutina de ese día.', 'Estancado': 'Tres sesiones seguidas sin mejorar la mejor serie.'};
  const estadoChip = (e, extra) => { const s = el('span', 'mg-estadochip ' + (CLASE[e] || 'mg-na'), e + (extra || '')); if (EXPLICA[e]) s.title = EXPLICA[e]; return s; };
  const cargando = (box, ...ds) => { const mal = ds.find((d) => d.status !== 'ok'); if (!mal) return false; box.replaceChildren(el('p', 'mg-empty', mal.status === 'loading' ? 'Cargando…' : 'No se pudo cargar.')); return true; };

  const nav = document.querySelector('.mg-nav');
  const primero = nav && nav.querySelector('[data-page="entreno"]');
  if (!primero) return;
  const b = el('button', 'mg-navbtn', 'Resumen');
  b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('data-page', 'resumen'); b.setAttribute('aria-selected', 'false');
  primero.after(b);
  const sec = el('section', 'mg-page');
  sec.id = 'resumen'; sec.setAttribute('data-pagepanel', 'resumen'); sec.hidden = true;
  const fila = el('div', 'mg-row');
  const tit = el('div');
  tit.append(el('h2', 'mg-h2', 'Resumen de la semana'), el('p', 'mg-sub', 'Lo que pedía el plan y lo que se hizo de verdad, con los datos que Hevy sube a Strava.'));
  const sel = el('select', 'dash-select mg-select'); sel.setAttribute('aria-label', 'Semana'); sel.setAttribute('data-draw', 'sel-semana');
  fila.append(tit, sel);
  const caja = (draw, cls) => { const d = el('div', cls); d.setAttribute('data-draw', draw); return d; };
  const tarjeta = (titulo, nota, draw) => { const c = el('div', 'mg-card'); c.append(el('h3', 'mg-card-title', titulo)); if (nota) c.append(el('p', 'mg-note', nota)); c.append(caja(draw)); return c; };
  sec.append(fila, caja('res-tiles', 'mg-tiles'),
    tarjeta('Plan frente a lo hecho', 'Cada día de la rutina con sus ejercicios: series hechas de las que tocaban, pesos y reps, y las notas que Adrià apuntó en Hevy.', 'res-plan'),
    tarjeta('Cómo va cada ejercicio', 'Compara la mejor serie de la última sesión con la de la sesión anterior (fuerza estimada, fórmula de Epley). "Estancado" = tres sesiones seguidas sin mejorar.', 'res-tend'),
    tarjeta('Cambios en la rutina', 'Qué se ha cambiado, cuándo y por qué.', 'res-cambios'));
  document.getElementById('entreno').after(sec);

  dash.draw('res-tiles', (box) => {
    const sm = dash.data('semanas'), pl = dash.data('plan_total'), rec = dash.data('records'), te = dash.data('tendencia');
    if (cargando(box, sm, pl, rec, te)) return;
    const w = semana(), r = sm.data.find((x) => x.semana === w) || {sesiones: 0, series: 0}, p = pl.data[0];
    const ru = dash.data('rutina'), nombre = {};
    if (ru.status === 'ok') for (const x of ru.data) nombre[x.hevy] = x.ejercicio;
    const records = rec.data.filter((x) => x.record && x.fecha >= w && x.fecha < masDias(w, 7));
    const suben = te.data.filter((x) => x.estado === 'Sube').length, atascados = te.data.filter((x) => x.estado === 'Estancado' || x.estado === 'Baja');
    const tile = (label, valor, pie, c) => { const t = el('div', 'mg-tile'); t.style.setProperty('--tc', c); const v = el('span', 'mg-big', valor); if (pie) v.append(el('small', null, ' ' + pie)); t.append(el('span', 'mg-tile-label', label), v); return t; };
    box.replaceChildren(
      tile('Sesiones', String(r.sesiones), 'de ' + p.plan_sesiones, 'var(--g-espalda)'),
      tile('Series efectivas', String(r.series), 'de ' + p.plan_series, 'var(--g-biceps)'),
      tile('Récords esta semana', String(records.length), records.length ? records.slice(0, 2).map((x) => nombre[x.ejercicio] || x.ejercicio.replace(/\s*\(.*\)$/, '')).join(', ') + (records.length > 2 ? '…' : '') : '', 'var(--g-abdomen)'),
      tile('Ejercicios que suben', String(suben), atascados.length ? '· ' + atascados.length + ' a vigilar' : '', atascados.length ? 'var(--g-pecho)' : 'var(--g-triceps)'));
  });

  dash.draw('res-plan', (box) => {
    const cu = dash.data('cumplimiento'), ru = dash.data('rutina');
    if (cargando(box, cu, ru)) return;
    const w = semana(), notas = window.mgNotas(dash.raw('gym'));
    if (w < INICIO_BLOQUE) { box.replaceChildren(el('p', 'mg-empty', 'El bloque 1 empezó el lunes 9 de noviembre. Las sesiones de esta semana, de prueba de máquinas, están en "Entrenos hechos".')); return; }
    let filas = cu.data.filter((r) => r.semana === w);
    if (!filas.length) {
      // Semana sin ninguna sesión todavía: se enseña el plan entero como pendiente.
      filas = ru.data.map((r) => ({semana: w, dia: r.dia, bloque: r.bloque, fecha: '', actividad: '', minutos: 0, tipo: 'plan', id: r.id, orden: r.orden, nombre: r.ejercicio, ejercicio: r.hevy, musculo: r.musculo, plan_series: r.series, plan_reps: r.reps, hechas: 0, detalle: '', estado: 'Pendiente'}));
    }
    const dias = [];
    for (const r of filas) if (!dias.includes(r.dia)) dias.push(r.dia);
    box.replaceChildren(...dias.map((dia) => {
      const v = filas.filter((r) => r.dia === dia).sort((a, b) => a.orden - b.orden), f0 = v[0];
      const cuando = masDias(w, POS[dia] || 0);
      const bloque = el('div', 'mg-plandia');
      const head = el('div', 'mg-sesion-head');
      const h = el('h4', 'mg-plandia-t', dia + ' · ' + f0.bloque);
      let estado, cls;
      if (f0.fecha) { estado = 'Hecho el ' + fFecha(f0.fecha) + (f0.minutos ? ' · ' + f0.minutos + ' min' : ''); cls = 'mg-ok'; }
      else if (cuando >= hoyISO()) { estado = cuando === hoyISO() ? 'Toca hoy' : 'Toca el ' + fFecha(cuando); cls = 'mg-na'; }
      else { estado = 'Sin hacer'; cls = 'mg-bad'; }
      head.append(h, el('span', cls, estado));
      bloque.append(head);
      if (!f0.fecha && cuando < hoyISO()) for (const r of v) r.estado = 'No hecho';
      const hechasT = v.filter((r) => r.tipo === 'plan').reduce((t, r) => t + Math.min(r.hechas, r.plan_series), 0), planT = v.reduce((t, r) => t + r.plan_series, 0);
      if (f0.fecha) { const bar = el('span', 'mg-bar'), fill = el('span'); fill.style.width = (100 * hechasT / planT) + '%'; fill.style.background = 'var(--color-ok)'; bar.append(fill); bloque.append(el('p', 'mg-note', hechasT + ' de ' + planT + ' series del plan'), bar); }
      for (const r of v) {
        const li = el('div', 'mg-ejrow');
        li.style.borderLeftColor = r.tipo === 'extra' ? 'var(--g-otros)' : color(r.musculo);
        const t = el('div', 'mg-ejname');
        t.append(el('b', null, r.nombre));
        if (r.tipo === 'plan') t.append(el('span', 'mg-note', (f0.fecha ? r.hechas + ' de ' : '') + r.plan_series + ' series × ' + r.plan_reps));
        t.append(estadoChip(r.estado));
        li.append(t);
        if (r.detalle) li.append(el('div', 'mg-detalle', r.detalle));
        const nota = notas[r.actividad + '|' + r.ejercicio];
        if (nota) li.append(el('p', 'mg-nota', '“' + nota + '”'));
        bloque.append(li);
      }
      return bloque;
    }));
  });

  dash.draw('res-tend', (box) => {
    const te = dash.data('tendencia');
    if (cargando(box, te)) return;
    if (!te.data.length) { box.replaceChildren(el('p', 'mg-empty', 'Todavía no hay sesiones de la rutina.')); return; }
    const orden = {'Estancado': 0, 'Baja': 1, 'Sube': 2, 'Igual': 3, 'Primera sesión': 4};
    const rows = te.data.slice().sort((a, b) => orden[a.estado] - orden[b.estado] || (a.nombre < b.nombre ? -1 : 1));
    const tabla = el('table', 'mg-table'), tb = el('tbody');
    const th = el('tr');
    th.append(el('th', null, 'Ejercicio'), el('th', null, 'Última mejor serie'), el('th', 'mg-n', 'Sesiones'), el('th', 'mg-n', 'Frente a la anterior'), el('th', null, 'Estado'));
    const thead = el('thead'); thead.append(th);
    for (const r of rows) {
      const tr = el('tr'), n = el('td');
      const dot = el('span', 'mg-dot'); dot.style.background = color(r.musculo);
      n.append(dot, r.nombre);
      const st = el('td'); st.append(estadoChip(r.estado));
      tr.append(n, el('td', null, r.ultima), el('td', 'mg-n', String(r.sesiones)), el('td', 'mg-n ' + (r.cambio > 0 ? 'mg-ok' : r.cambio < 0 ? 'mg-bad' : ''), r.cambio == null ? '—' : (r.cambio > 0 ? '+' : '') + String(Math.round(r.cambio * 1000) / 10).replace('.', ',') + ' %'), st);
      tb.append(tr);
    }
    tabla.append(thead, tb);
    const wrap = el('div', 'mg-tablebox'); wrap.append(tabla);
    box.replaceChildren(wrap);
  });

  dash.draw('res-cambios', (box) => {
    const c = dash.data('cambios'), ru = dash.data('rutina');
    if (cargando(box, c)) return;
    const dia = {};
    if (ru.status === 'ok') for (const r of ru.data) dia[r.id] = r.dia;
    const rows = c.data.slice().sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
    box.replaceChildren(...rows.map((r) => {
      const li = el('div', 'mg-cambio');
      const t = el('div', 'mg-ejname');
      t.append(el('span', 'mg-chip mg-chip-fecha', fFecha(r.fecha)), el('b', null, r.cambio));
      if (dia[r.id]) t.append(el('span', 'mg-note', dia[r.id]));
      li.append(t, el('p', 'mg-note', 'Por qué: ' + r.motivo));
      return li;
    }));
  });
})();

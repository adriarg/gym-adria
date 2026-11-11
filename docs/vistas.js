const pad2 = (n) => String(n).padStart(2, '0');
const isoLocal = (d) => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
const hoy = new Date();
const lunesHoy = (() => { const d = new Date(hoy); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return isoLocal(d); })();
dash.setParams({semana: lunesHoy});

const INICIO_BLOQUE = '2026-11-09';
const PRIORIDAD = ['Bíceps', 'Tríceps', 'Hombro lateral', 'Pecho', 'Espalda', 'Hombro posterior', 'Hombro anterior', 'Abdominales', 'Cuádriceps', 'Isquios', 'Glúteos', 'Gemelos', 'Otros'];
const GRUPO_DE = {'Pecho': 'pecho', 'Espalda': 'espalda', 'Hombro': 'hombro', 'Hombro lateral': 'hombro', 'Hombro anterior': 'hombro', 'Hombro posterior': 'hombro', 'Bíceps': 'biceps', 'Tríceps': 'triceps', 'Antebrazo': 'antebrazo', 'Abdomen': 'abdomen', 'Abdominales': 'abdomen', 'Pierna': 'pierna', 'Cuádriceps': 'pierna', 'Isquios': 'pierna', 'Glúteos': 'pierna', 'Gemelos': 'pierna'};
const REGION_GRUPO = {chest: 'pecho', front_deltoids: 'hombro', back_deltoids: 'hombro', biceps: 'biceps', triceps: 'triceps', forearm: 'antebrazo', abs: 'abdomen', obliques: 'abdomen', upper_back: 'espalda', trapezius: 'espalda', lower_back: 'espalda', neck: 'espalda', quadriceps: 'pierna', abductors: 'pierna', abductor: 'pierna', hamstring: 'pierna', gluteal: 'pierna', calves: 'pierna', left_soleus: 'pierna', right_soleus: 'pierna'};
const colorDe = (m) => 'var(--g-' + (GRUPO_DE[m] || 'otros') + ')';
const ESTADO_CLASE = {'Cubierto': 'mg-ok', 'Por debajo': 'mg-warn', 'Sin trabajo': 'mg-bad', 'Le llega de rebote': 'mg-na', 'No lo necesitas': 'mg-na'};
const fSemana = (w) => d3.utcFormat('%-d %b')(new Date(w + 'T00:00:00Z'));
const fFecha = (f) => d3.utcFormat('%-d %b %Y')(new Date(f + 'T00:00:00Z'));
const fKg = d3.format(',.1~f');
const fPct = d3.format('+.0%');
const enc = (v) => encodeURIComponent(String(v));
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const mark = (tag, source, where, field, text, cls) => { const e = el(tag, cls, text); e.setAttribute('data-source', source); if (where) e.setAttribute('data-where', where); if (field) e.setAttribute('data-field', field); return e; };
const listo = (x) => x.classList.remove('dash-skeleton');
const notOk = (x, d, guion) => {
  listo(x);
  if (d.status === 'loading') x.classList.add('dash-skeleton');
  if (d.status === 'error') { x.replaceChildren(el('span', 'mg-fail', 'No se pudo cargar')); return; }
  x.replaceChildren();
  if (guion) x.textContent = '—';
};
const chip = (texto, color) => { const c = el('span', 'mg-chip', texto); c.style.background = 'color-mix(in srgb, ' + color + ' 18%, transparent)'; c.style.color = color; return c; };
const tip = (box) => { const t = el('div', 'mg-tip'); t.hidden = true; box.append(t); return t; };
const showTip = (box, t, x, y, lines) => {
  t.replaceChildren(...lines.map((l, i) => { const s = el('div', null, l); if (i === 0) s.style.color = 'var(--cds-text-secondary)'; return s; }));
  t.hidden = false;
  t.style.left = Math.max(0, Math.min(box.clientWidth - t.offsetWidth, x - t.offsetWidth / 2)) + 'px';
  t.style.top = Math.max(0, y - t.offsetHeight - 10) + 'px';
};
const NS = 'http://www.w3.org/2000/svg';
const cuerpo = (colorPara, cls) => {
  const A = window.MG_ANAT;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 210 200');
  svg.setAttribute('class', cls || 'mg-body');
  svg.setAttribute('aria-hidden', 'true');
  if (!A) return svg;
  [['front', 0], ['back', 110]].forEach(([lado, dx]) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('transform', 'translate(' + dx + ',0)');
    for (const it of A[lado]) for (const pts of it.p) {
      const pg = document.createElementNS(NS, 'polygon');
      pg.setAttribute('points', pts);
      const c = colorPara(lado + ':' + it.m, it.m);
      if (c) { pg.style.fill = c[0]; if (c[1] != null) pg.style.fillOpacity = c[1]; } else pg.setAttribute('class', 'mg-body-off');
      g.append(pg);
    }
    svg.append(g);
  });
  return svg;
};

const semanaSel = () => dash.params().semana || lunesHoy;
const filaSemana = () => { const d = dash.data('semanas'); return d.status === 'ok' ? d.data.find((r) => r.semana === semanaSel()) || null : null; };
const plan = () => { const d = dash.data('plan_total'); return d.status === 'ok' && d.data.length ? d.data[0] : null; };

dash.draw('t-semana', (x) => { x.textContent = fSemana(semanaSel()); });
const valorSemana = (campo) => (x) => {
  const d = dash.data('semanas');
  if (d.status !== 'ok') return notOk(x, d, true);
  listo(x);
  const r = filaSemana();
  x.replaceChildren(r ? mark('span', 'semanas', 'semana=' + enc(r.semana), campo, String(r[campo])) : el('span', null, '0'));
};
const valorPlan = (campo) => (x) => {
  const d = dash.data('plan_total');
  if (d.status !== 'ok') return notOk(x, d, true);
  listo(x);
  const s = mark('span', 'plan_total', null, campo, String(d.data[0][campo]));
  s.setAttribute('data-row', '0');
  x.replaceChildren(s);
};
dash.draw('t-ses', valorSemana('sesiones'));
dash.draw('t-series', valorSemana('series'));
dash.draw('t-pses', valorPlan('plan_sesiones'));
dash.draw('t-plan', valorPlan('plan_series'));

const tileRatio = (campo, campoPlan) => (x) => {
  const d = dash.data('semanas'), p = dash.data('plan_total');
  if (d.status !== 'ok' || p.status !== 'ok') return notOk(x, d.status !== 'ok' ? d : p, true);
  listo(x);
  const r = filaSemana();
  const small = el('small');
  const sp = mark('span', 'plan_total', null, campoPlan, String(p.data[0][campoPlan]));
  sp.setAttribute('data-row', '0');
  small.append(' de ', sp);
  x.replaceChildren(r ? mark('span', 'semanas', 'semana=' + enc(r.semana), campo, String(r[campo])) : el('span', null, '0'), small);
};
dash.draw('k-ses', tileRatio('sesiones', 'plan_sesiones'));
dash.draw('k-series', tileRatio('series', 'plan_series'));
dash.draw('k-racha', (x) => {
  const d = dash.data('racha_gym');
  if (d.status !== 'ok') return notOk(x, d, true);
  listo(x);
  const s = mark('span', 'racha_gym', null, 'semanas_seguidas', String(d.data[0].semanas_seguidas));
  s.setAttribute('data-row', '0');
  x.replaceChildren(s, el('small', null, d.data[0].semanas_seguidas === 1 ? ' semana' : ' semanas'));
});
dash.draw('k-mast', (x) => {
  const d = dash.data('resumen');
  if (d.status !== 'ok') return notOk(x, d, true);
  listo(x);
  const s = mark('span', 'resumen', null, 'sesiones_mast', String(d.data[0].sesiones_mast));
  s.setAttribute('data-row', '0');
  x.replaceChildren(s);
});

dash.draw('sel-semana', (sel) => {
  const d = dash.data('semanas');
  const ws = [lunesHoy].concat(d.status === 'ok' ? d.data.map((r) => r.semana) : []).filter((w, i, a) => a.indexOf(w) === i).sort().reverse();
  sel.replaceChildren(...ws.map((w) => new Option((w === lunesHoy ? 'Esta semana · ' : 'Semana del ') + fSemana(w), w)));
  sel.value = semanaSel();
  sel.onchange = () => dash.setParams({semana: sel.value || lunesHoy});
});

dash.draw('musc', (box) => {
  const h = dash.data('musculo_semana'), p = dash.data('plan_musculo');
  if (h.status !== 'ok' || p.status !== 'ok') return notOk(box, h.status !== 'ok' ? h : p, false);
  listo(box);
  const w = semanaSel();
  const hechas = {};
  for (const r of h.data) if (r.semana === w) hechas[r.musculo] = r.hechas;
  const planM = {};
  for (const r of p.data) planM[r.musculo] = r.plan;
  const rows = Object.keys(Object.assign({}, planM, hechas)).map((m) => ({musculo: m, hechas: hechas[m] || 0, plan: planM[m] || 0})).sort((a, b) => PRIORIDAD.indexOf(a.musculo) - PRIORIDAD.indexOf(b.musculo));
  box.replaceChildren();
  const W = Math.max(280, box.clientWidth || 600), rowH = 30;
  const svg = d3.select(box).append('svg').attr('width', '100%');
  const probe = svg.append('text').attr('class', 'mg-tick-strong');
  let lw = 0;
  for (const r of rows) { probe.text(r.musculo); lw = Math.max(lw, probe.node().getComputedTextLength()); }
  probe.remove();
  const L = Math.ceil(lw) + 12, R = 52, H = 12 + rows.length * rowH;
  svg.attr('viewBox', '0 0 ' + W + ' ' + H).attr('height', H);
  const x = d3.scaleLinear([0, d3.max(rows, (r) => Math.max(r.plan, r.hechas)) || 1], [L, W - R]);
  const y = d3.scaleBand(rows.map((r) => r.musculo), [6, H - 6]).padding(0.3);
  const g = svg.selectAll('g.row').data(rows).join('g');
  g.append('text').attr('class', 'mg-tick-strong').attr('x', L - 10).attr('y', (r) => y(r.musculo) + y.bandwidth() / 2).attr('dy', '0.35em').attr('text-anchor', 'end').text((r) => r.musculo);
  g.filter((r) => r.plan > 0).append('rect').attr('x', L).attr('y', (r) => y(r.musculo) - 2).attr('height', y.bandwidth() + 4).attr('width', (r) => x(r.plan) - L).attr('rx', 3).style('fill', 'none').style('stroke', 'var(--cds-chart-axis)').style('stroke-dasharray', '4 3');
  g.append('rect').attr('x', L).attr('y', (r) => y(r.musculo)).attr('height', y.bandwidth()).attr('width', (r) => Math.max(0, x(r.hechas) - L)).attr('rx', 3).style('fill', (r) => colorDe(r.musculo));
  g.append('text').attr('class', 'mg-tick').attr('x', (r) => x(Math.max(r.plan, r.hechas)) + 8).attr('y', (r) => y(r.musculo) + y.bandwidth() / 2).attr('dy', '0.35em').text((r) => r.hechas + ' / ' + r.plan);
  const t = tip(box);
  g.append('rect').attr('x', 0).attr('y', (r) => y(r.musculo) - 4).attr('width', W).attr('height', y.step()).style('fill', 'transparent')
    .on('pointermove', (ev, r) => { const [px] = d3.pointer(ev, box); showTip(box, t, px, y(r.musculo), [r.musculo, r.hechas + ' de ' + r.plan + ' series del plan']); })
    .on('pointerleave', () => { t.hidden = true; });
});

dash.draw('foto', (img) => { const f = window.MG_FOTOS && window.MG_FOTOS[img.getAttribute('data-foto')]; if (f) img.src = f; });

dash.draw('bloque', (x) => {
  const n = Math.floor((new Date(lunesHoy + 'T00:00:00') - new Date(INICIO_BLOQUE + 'T00:00:00')) / (7 * 864e5)) + 1;
  x.replaceChildren();
  const b = el('b');
  if (n <= 2) { b.textContent = 'Semana ' + Math.max(1, n) + ' de 6. '; x.append(b, 'Estás aprendiendo las máquinas: en todas las series deja 2–3 reps en reserva, aunque la ficha diga otra cosa. Desde la semana 3 sigue el esfuerzo de cada ejercicio.'); }
  else if (n <= 6) { b.textContent = 'Semana ' + n + ' de 6. '; x.append(b, 'Sigue el esfuerzo que marca cada ejercicio y sube peso cuando la ficha te lo diga.'); }
  else if (n === 7) { b.textContent = 'Semana de descarga. '; x.append(b, 'Haz la mitad de series de cada ejercicio y deja 3 reps en reserva. Es para recuperar.'); }
  else { b.textContent = 'Bloque 1 terminado. '; x.append(b, 'Pídele a Claude que revise el bloque y prepare el bloque 2.'); }
});

dash.draw('rutina-dia', (ul) => {
  const d = dash.data('rutina'), s = dash.data('sugerencias'), p = dash.data('partes');
  if (d.status !== 'ok') return notOk(ul, d, false);
  listo(ul);
  const sug = {};
  if (s.status === 'ok') for (const r of s.data) sug[r.id] = r;
  const mapa = {};
  if (p.status === 'ok') for (const r of p.data) mapa[r.id] = mgLista(r.mapa);
  const dia = ul.getAttribute('data-dia');
  const rows = d.data.filter((r) => r.dia === dia).sort((a, b) => a.orden - b.orden);
  ul.replaceChildren(...rows.map((r) => {
    const w = 'id=' + enc(r.id), c = colorDe(r.musculo);
    const li = el('li', 'mg-ex');
    li.style.borderTop = '4px solid ' + c;
    const top = el('div', 'mg-ex-top');
    const badge = mark('span', 'rutina', w, 'orden', String(r.orden), 'mg-num-badge');
    badge.style.background = c;
    const chipM = chip(r.musculo, c);
    chipM.setAttribute('data-source', 'rutina'); chipM.setAttribute('data-where', w); chipM.setAttribute('data-field', 'musculo');
    top.append(badge, mark('h4', 'rutina', w, 'ejercicio', r.ejercicio, 'mg-ex-name'), chipM);
    const media = el('div', 'mg-media');
    const foto = window.MG_FOTOS && window.MG_FOTOS[r.foto];
    if (foto) { const im = el('img', 'mg-photo'); im.src = foto; im.alt = r.maquina; media.append(im); }
    const prim = new Set(), sec = new Set();
    mgLista(r.principal).forEach((id) => (mapa[id] || []).forEach((k) => prim.add(k)));
    mgLista(r.secundario).forEach((id) => (mapa[id] || []).forEach((k) => { if (!prim.has(k)) sec.add(k); }));
    media.append(cuerpo((k) => (prim.has(k) ? [c] : sec.has(k) ? [c, 0.3] : null)));
    const peso = el('div', 'mg-peso');
    peso.append(el('span', 'mg-peso-k', 'Peso de hoy'));
    const sg = sug[r.id];
    if (sg) {
      const v = mark('span', 'sugerencias', w, 'kg', sg.kg == null ? 'Peso corporal' : fKg(sg.kg) + ' kg', 'mg-peso-v');
      v.style.color = c;
      peso.append(v);
      if (sg.ultimas) peso.append(mark('span', 'sugerencias', w, 'ultimas', 'Última vez: ' + sg.ultimas, 'mg-note'));
      peso.append(mark('span', 'sugerencias', w, 'consejo', sg.consejo, 'mg-note'));
    } else peso.append(el('span', 'mg-peso-v', '—'));
    media.append(peso);
    const dl = el('dl', 'mg-dl');
    const fila = (k, ...v) => { const dd = el('dd'); dd.append(...v); dl.append(el('dt', null, k), dd); return dd; };
    fila('Calentar', r.calentamiento ? mark('span', 'rutina', w, 'calentamiento', r.calentamiento) : 'No hace falta: ya estás caliente.');
    const work = fila('Trabajo', mark('span', 'rutina', w, 'series', String(r.series)), ' series × ', mark('span', 'rutina', w, 'reps', r.reps), ' reps');
    work.className = 'mg-work';
    fila('Descanso', mark('span', 'rutina', w, 'descanso', r.descanso));
    fila('Esfuerzo', mark('span', 'rutina', w, 'esfuerzo', r.esfuerzo));
    fila('Técnica', mark('span', 'rutina', w, 'nota', r.nota));
    fila('Trabaja', mark('span', 'rutina', w, 'zona', r.zona));
    fila('Máquina', mark('span', 'rutina', w, 'maquina', r.maquina));
    fila('En Hevy', mark('span', 'rutina', w, 'hevy', r.hevy, 'mg-code'));
    li.append(top, media, dl);
    return li;
  }));
});

const ejActual = () => { const d = dash.data('ejercicios'); if (d.status !== 'ok' || !d.data.length) return null; const p = dash.params().ej; return d.data.some((r) => r.ejercicio === p) ? p : d.data[0].ejercicio; };
dash.draw('sel-ej', (sel) => {
  const d = dash.data('ejercicios');
  if (d.status !== 'ok') { sel.replaceChildren(); return; }
  const rows = d.data.slice().sort((a, b) => PRIORIDAD.indexOf(a.musculo) - PRIORIDAD.indexOf(b.musculo) || (a.ejercicio < b.ejercicio ? -1 : 1));
  sel.replaceChildren(...rows.map((r) => new Option(r.musculo + ' · ' + r.ejercicio, r.ejercicio)));
  sel.value = ejActual() || '';
  sel.onchange = () => dash.setParams({ej: sel.value || null});
});
dash.draw('ej-chart', (box) => {
  const d = dash.data('progreso');
  if (d.status !== 'ok') return notOk(box, d, false);
  listo(box);
  const ej = ejActual();
  const pts = d.data.filter((r) => r.ejercicio === ej).map((r) => Object.assign({}, r, {date: new Date(r.fecha + 'T00:00:00Z'), v: r.e1rm != null ? r.e1rm : r.top_reps}));
  box.replaceChildren();
  if (!pts.length) { box.append(el('p', 'mg-empty', 'Elige un ejercicio que hayas hecho en Mast.')); return; }
  const conPeso = pts.some((p) => p.e1rm != null), col = colorDe(pts[0].musculo);
  const W = Math.max(280, box.clientWidth || 500), H = 220;
  const svg = d3.select(box).append('svg').attr('width', '100%').attr('viewBox', '0 0 ' + W + ' ' + H).attr('height', H);
  const lo = d3.min(pts, (p) => p.v), hi = d3.max(pts, (p) => p.v);
  const y = d3.scaleLinear([Math.max(0, lo * 0.85), hi * 1.12 || 1], [H - 26, 12]).nice(4);
  const probe = svg.append('text').attr('class', 'mg-tick');
  let lw = 0;
  for (const v of y.ticks(4)) { probe.text(fKg(v)); lw = Math.max(lw, probe.node().getComputedTextLength()); }
  probe.remove();
  const L = Math.ceil(lw) + 10, R = 18;
  const ext = d3.extent(pts, (p) => p.date);
  if (+ext[0] === +ext[1]) { ext[0] = d3.utcDay.offset(ext[0], -3); ext[1] = d3.utcDay.offset(ext[1], 3); }
  const x = d3.scaleUtc(ext, [L + 10, W - R - 10]);
  svg.append('g').selectAll('line').data(y.ticks(4)).join('line').attr('x1', L).attr('x2', W - R).attr('y1', (v) => y(v)).attr('y2', (v) => y(v)).style('stroke', 'var(--cds-chart-grid)');
  svg.append('g').selectAll('text').data(y.ticks(4)).join('text').attr('class', 'mg-tick').attr('x', L - 6).attr('y', (v) => y(v)).attr('dy', '0.35em').attr('text-anchor', 'end').text((v) => fKg(v));
  const nx = Math.max(2, Math.min(pts.length, Math.floor((W - L) / 70)));
  const xt = pts.length <= nx ? pts.map((p) => p.date) : x.ticks(nx);
  svg.append('g').selectAll('text').data(xt).join('text').attr('class', 'mg-tick').attr('x', (v) => x(v)).attr('y', H - 6).attr('text-anchor', 'middle').text((v) => d3.utcFormat('%-d %b')(v));
  svg.append('path').datum(pts).attr('d', d3.line((p) => x(p.date), (p) => y(p.v))).style('fill', 'none').style('stroke', col).style('stroke-width', 2).style('stroke-linejoin', 'round').style('stroke-linecap', 'round');
  svg.append('g').selectAll('circle').data(pts).join('circle').attr('cx', (p) => x(p.date)).attr('cy', (p) => y(p.v)).attr('r', 4).style('fill', col);
  const last = pts[pts.length - 1];
  svg.append('text').attr('class', 'mg-tick-strong').attr('x', Math.min(x(last.date), W - R)).attr('y', y(last.v) - 10).attr('text-anchor', pts.length > 1 ? 'end' : 'middle').text(conPeso ? fKg(last.v) + ' kg' : last.v + ' reps');
  const t = tip(box);
  svg.append('rect').attr('x', L).attr('width', W - L).attr('height', H).style('fill', 'transparent')
    .on('pointermove', (ev) => {
      const [px] = d3.pointer(ev, svg.node());
      const p = d3.least(pts, (q) => Math.abs(x(q.date) - px));
      const serie = p.top_kg > 0 ? fKg(p.top_kg) + ' kg × ' + p.top_reps : p.top_reps + ' reps';
      showTip(box, t, x(p.date) * box.clientWidth / W, y(p.v), [fFecha(p.fecha), 'Mejor serie: ' + serie, conPeso ? 'Fuerza estimada: ' + fKg(p.e1rm) + ' kg' : p.series + ' series']);
    })
    .on('pointerleave', () => { t.hidden = true; });
});
dash.draw('ej-tabla', (tb) => {
  const d = dash.data('ejercicios');
  if (d.status !== 'ok') { tb.replaceChildren(); return; }
  tb.replaceChildren(...d.data.map((r) => {
    const tr = el('tr');
    tr.setAttribute('data-key', r.ejercicio);
    tr.style.cursor = 'pointer';
    const tdM = el('td', 'mg-hide-narrow');
    tdM.append(chip(r.musculo, colorDe(r.musculo)));
    tr.append(el('td', null, r.ejercicio), tdM, el('td', 'mg-n', String(r.sesiones)), el('td', null, r.ultimo_top), el('td', 'mg-n ' + (r.cambio > 0 ? 'mg-ok' : r.cambio < 0 ? 'mg-bad' : ''), r.cambio == null ? '—' : fPct(r.cambio)));
    tr.addEventListener('click', () => dash.setParams({ej: r.ejercicio}));
    return tr;
  }));
});

dash.draw('mapa-grupos', (box) => {
  box.replaceChildren(cuerpo((k, m) => (REGION_GRUPO[m] ? ['var(--g-' + REGION_GRUPO[m] + ')'] : null), 'mg-bigmap'));
});
dash.draw('cob-estados', (ul) => {
  const d = dash.data('cobertura_estado');
  if (d.status !== 'ok') return notOk(ul, d, false);
  listo(ul);
  const cls = {'Cubierto': 'mg-ok', 'Por debajo': 'mg-warn', 'Sin trabajo': 'mg-bad', 'Le llega de rebote': 'mg-na', 'No lo necesitas': 'mg-na'};
  const expl = {'Le llega de rebote': 'No necesitan ejercicio propio: trabajan ayudando en otros.', 'No lo necesitas': 'No aportan a tu objetivo.'};
  ul.replaceChildren(...d.data.map((r) => {
    const w = 'estado=' + enc(r.estado), li = el('li', 'mg-estado');
    li.append(mark('span', 'cobertura_estado', w, 'partes', String(r.partes), 'mg-estado-n'), mark('span', 'cobertura_estado', w, 'estado', r.estado, cls[r.estado]));
    if (expl[r.estado]) li.append(el('span', 'mg-note', expl[r.estado]));
    if (r.estado !== 'Cubierto') li.append(mark('span', 'cobertura_estado', w, 'lista', r.lista, 'mg-note'));
    return li;
  }));
});
dash.draw('sel-grupo', (sel) => {
  const d = dash.data('cobertura');
  if (d.status !== 'ok') { sel.replaceChildren(); return; }
  const gs = d.data.map((r) => r.grupo).filter((g, i, a) => a.indexOf(g) === i);
  sel.replaceChildren(new Option('Todos los grupos', ''), ...gs.map((g) => new Option(g, g)));
  sel.value = dash.params().grupo || '';
  sel.onchange = () => dash.setParams({grupo: sel.value || null});
});
dash.draw('cob-tabla', (tb) => {
  const d = dash.data('cobertura'), real = dash.data('cobertura_real'), p = dash.data('partes');
  if (d.status !== 'ok') { tb.replaceChildren(); return; }
  const mapa = {};
  if (p.status === 'ok') for (const r of p.data) mapa[r.id] = new Set(mgLista(r.mapa));
  const sem = {};
  if (real.status === 'ok') for (const r of real.data) if (r.semana === semanaSel()) sem[r.id] = r;
  const g = dash.params().grupo || '';
  const rows = d.data.filter((r) => !g || r.grupo === g);
  const max = Math.max(1, ...d.data.map((r) => Math.max(r.efectivas, r.objetivo)));
  tb.replaceChildren(...rows.map((r, i) => {
    const c = colorDe(r.grupo), tr = el('tr');
    tr.setAttribute('data-key', r.id);
    if (i > 0 && rows[i - 1].grupo !== r.grupo) tr.style.borderTop = '2px solid var(--color-border-line)';
    const tdMap = el('td');
    tdMap.append(cuerpo((k) => (mapa[r.id] && mapa[r.id].has(k) ? [c] : null)));
    const tdParte = el('td', 'mg-parte');
    tdParte.append(chip(r.grupo, c), el('div', null, r.parte));
    const ef = el('td');
    const bar = el('span', 'mg-bar'), fill = el('span');
    fill.style.width = (100 * r.efectivas / max) + '%';
    fill.style.background = c;
    bar.append(fill);
    if (r.objetivo > 0) { const goal = el('i'); goal.style.left = 'calc(' + (100 * r.objetivo / max) + '% - 1px)'; bar.append(goal); }
    ef.append(el('span', null, fKg(r.efectivas) + (r.objetivo > 0 ? ' / ' + r.objetivo : '')), bar);
    const s = sem[r.id];
    const tdSem = el('td', 'mg-n');
    tdSem.append(s ? mark('span', 'cobertura_real', 'clave=' + enc(s.clave), 'efectivas', fKg(s.efectivas)) : el('span', 'mg-na', '0'));
    tr.append(tdMap, tdParte, el('td', null, r.prioridad), el('td', 'mg-n', String(r.directas)), el('td', 'mg-n', String(r.indirectas)), ef, tdSem, el('td', 'mg-n', String(r.dias)),
      el('td', ESTADO_CLASE[r.estado], r.estado), el('td', 'mg-why mg-hide-narrow', r.porque), tdEj(r));
    return tr;
  }));
});

// Ejercicios de MI rutina que trabajan esta parte: día, nombre y series (las indirectas en gris).
function tdEj(r) {
  const td = el('td', 'mg-why mg-ejdia mg-hide-narrow');
  const l = r.ej_lista || [];
  if (!l.length) { td.textContent = '—'; return td; }
  for (const x of l) {
    const fila = el('div', x.directa ? null : 'mg-ind');
    fila.append(el('b', 'mg-dia', x.dia.slice(0, 3)), document.createTextNode(' ' + x.ejercicio + ' '), el('span', 'mg-ser', x.series + ' series' + (x.directa ? '' : ' (cuentan ½)')));
    td.append(fila);
  }
  return td;
}


// Tabla de frecuencia: músculos (se despliegan al tocarlos) y sus partes, día a día.
dash.draw('frec-tabla', (tb) => {
  const d = dash.data('frecuencia');
  if (d.status !== 'ok') { tb.replaceChildren(); return; }
  const g = dash.params().grupo || '';
  const abiertos = tb._abiertos || (tb._abiertos = new Set(g ? [g] : []));
  if (g) abiertos.add(g);
  const pinta = () => {
    tb.replaceChildren(...d.data.filter((r) => !g || r.grupo === g).map((r) => {
      const tr = el('tr', r.tipo === 'grupo' ? 'mg-frec-g' : 'mg-frec-p'), c = colorDe(r.grupo);
      tr.setAttribute('data-key', r.clave);
      if (r.tipo === 'parte' && !abiertos.has(r.grupo)) tr.hidden = true;
      const tdN = el('td');
      if (r.tipo === 'grupo') {
        tdN.append(el('span', 'mg-frec-fl', abiertos.has(r.grupo) ? '▾' : '▸'), chip(r.grupo, c));
        tr.onclick = () => { abiertos.has(r.grupo) ? abiertos.delete(r.grupo) : abiertos.add(r.grupo); pinta(); };
      } else tdN.textContent = r.nombre;
      tr.append(tdN);
      for (const dia of r.dias) {
        const x = r[dia], td = el('td', 'mg-c');
        if (x.efectivas > 0) {
          const b = el('span', 'mg-frec-b' + (x.directo ? '' : ' mg-frec-ind'), fKg(x.efectivas));
          b.style.setProperty('--c', c);
          b.title = dia + ': ' + x.ejercicios.join(', ');
          td.append(b);
        } else td.append(el('span', 'mg-na', '·'));
        tr.append(td);
      }
      const dd = el('td', 'mg-c mg-frec-n', r.dias_directos + '×');
      if (r.dias_directos >= 2) dd.style.color = c;
      tr.append(dd, el('td', 'mg-c mg-frec-n2', r.dias_total + '×'));
      return tr;
    }));
  };
  pinta();
});

const GYM_DIAS = {1: 'Lunes', 2: 'Martes', 4: 'Jueves', 5: 'Viernes'};
const todos = (sel) => Array.from(document.querySelectorAll(sel));
const verPagina = (pg, link) => {
  for (const b of todos('.mg-navbtn')) b.setAttribute('aria-selected', String(b.getAttribute('data-page') === pg));
  for (const s of todos('[data-pagepanel]')) s.hidden = s.getAttribute('data-pagepanel') !== pg;
  if (link) dash.setLink(pg);
};
const verDia = (dia) => {
  for (const b of todos('.mg-day')) b.setAttribute('aria-selected', String(b.getAttribute('data-dia') === dia));
  for (const p of todos('.mg-exlist[data-panel]')) p.hidden = p.getAttribute('data-panel') !== dia;
};
for (const b of todos('.mg-navbtn')) b.addEventListener('click', () => verPagina(b.getAttribute('data-page'), true));
for (const b of todos('.mg-day')) b.addEventListener('click', () => verDia(b.getAttribute('data-dia')));
const h = location.hash.slice(1);
verPagina(todos('[data-pagepanel]').some((s) => s.id === h) ? h : 'entreno', false);
verDia(GYM_DIAS[hoy.getDay()] || 'Lunes');

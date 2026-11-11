/* Las listas de la rutina (principal, secundario, mapa) llegan como texto JSON: esto las vuelve lista. */
window.mgLista = (v) => { if (Array.isArray(v)) return v; if (typeof v !== 'string' || !v.trim()) return []; try { const a = JSON.parse(v); return Array.isArray(a) ? a : [a]; } catch (e) { return v.split(',').map((x) => x.trim()).filter(Boolean); } };
d3.formatDefaultLocale({decimal: ',', thousands: '.', grouping: [3], currency: ['', ' €']});
d3.timeFormatDefaultLocale({
  dateTime: '%A, %e de %B de %Y, %X', date: '%d/%m/%Y', time: '%H:%M:%S', periods: ['AM', 'PM'],
  days: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  shortDays: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  months: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  shortMonths: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
});

dash.loader('gym', {
  description: 'Convierte la descripción que Hevy escribe en cada actividad de Strava en una fila por serie: ejercicio, peso, reps y tipo de serie.',
  fn: ({answer}) => {
    const a = typeof answer === 'string' ? JSON.parse(answer) : answer;
    if (!a || !Array.isArray(a.activities)) throw new Error('Strava no devolvió actividades (claves: ' + Object.keys(a || {}).join(', ') + ')');
    const rows = [];
    for (const act of a.activities) {
      const base = {actividad: String(act.id), fecha: String(act.start_local || '').slice(0, 10), sesion: act.name || '', minutos: Math.round(((act.summary && act.summary.moving_time) || 0) / 60)};
      const lines = String(act.description || '').replace(/\r/g, '').split('\n');
      let nombre = null, enNota = false, n = 0;
      for (const raw of lines) {
        const t = raw.trim();
        if (enNota) { if (t.endsWith('"')) enNota = false; continue; }
        if (t.startsWith('"')) { if (t.length === 1 || !t.endsWith('"')) enNota = true; continue; }
        const m = t.match(/^Set\s+(\d+):\s*(.*)$/i);
        if (m) {
          if (!nombre) continue;
          const r = m[2];
          const kgx = r.match(/(-?[\d.]+)\s*kg\s*x\s*(\d+)/i);
          const solo = r.match(/^(\d+)\s*reps?/i);
          const seg = r.match(/^(\d+)\s*s\b/i);
          const tag = (r.match(/\[([^\]]+)\]/) || [])[1] || '';
          const tipo = /warm/i.test(tag) ? 'calentamiento' : /fail/i.test(tag) ? 'fallo' : /drop/i.test(tag) ? 'drop' : 'normal';
          rows.push(Object.assign({}, base, {ejercicio: nombre, serie: Number(m[1]), kg: kgx ? Number(kgx[1]) : null, reps: kgx ? Number(kgx[2]) : solo ? Number(solo[1]) : null, segundos: seg ? Number(seg[1]) : null, tipo}));
          n++;
        } else if (t) {
          nombre = t;
        }
      }
      if (!n) rows.push(Object.assign({}, base, {ejercicio: '', serie: 0, kg: null, reps: null, segundos: null, tipo: ''}));
    }
    return {columns: ['fecha', 'sesion', 'ejercicio', 'serie', 'kg', 'reps', 'segundos', 'tipo', 'minutos', 'actividad'], rows, cut: !!a.has_next_page};
  }
});



dash.calc('series', {
  title: 'Series con músculo y semana',
  description: 'Cada serie que no es de calentamiento, con su músculo, la semana (lunes) y la fuerza estimada.',
  inputs: ['gym', 'musculos'],
  fn: (gym, musculos) => {
    const reglas = musculos.slice().sort((a, b) => a.orden - b.orden).map((r) => [new RegExp(r.patron, 'i'), r.musculo]);
    const lunes = (f) => { const d = new Date(f + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return d.toISOString().slice(0, 10); };
    return gym.filter((s) => s.ejercicio && s.tipo !== 'calentamiento').map((s) => {
      const m = reglas.find((r) => r[0].test(s.ejercicio));
      return Object.assign({}, s, {musculo: m ? m[1] : 'Otros', semana: lunes(s.fecha), mast: s.fecha >= '2026-11-02', e1rm: s.kg > 0 && s.reps ? Math.round(s.kg * (1 + s.reps / 30) * 10) / 10 : null});
    });
  }
});

dash.calc('semanas', {
  title: 'Sesiones y series por semana',
  description: 'Por cada semana en Mast: sesiones hechas y series efectivas.',
  inputs: ['series', 'gym'],
  fn: (series, gym) => {
    const lunes = (f) => { const d = new Date(f + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return d.toISOString().slice(0, 10); };
    const ses = {}, ser = {};
    for (const g of gym) if (g.fecha >= '2026-11-02') { const w = lunes(g.fecha); (ses[w] = ses[w] || new Set()).add(g.actividad); }
    for (const s of series) if (s.mast) ser[s.semana] = (ser[s.semana] || 0) + 1;
    return Object.keys(ses).sort().map((w) => ({semana: w, sesiones: ses[w].size, series: ser[w] || 0}));
  }
});

dash.calc('plan_total', {
  title: 'Plan semanal',
  description: 'Sesiones y series por semana que pide la rutina.',
  inputs: ['rutina'],
  fn: (rutina) => [{plan_sesiones: new Set(rutina.map((r) => r.dia)).size, plan_series: rutina.reduce((t, r) => t + r.series, 0)}]
});

dash.calc('plan_musculo', {
  title: 'Plan por músculo',
  description: 'Series por semana que pide la rutina para cada músculo.',
  inputs: ['rutina'],
  fn: (rutina) => {
    const p = {};
    for (const r of rutina) p[r.musculo] = (p[r.musculo] || 0) + r.series;
    return Object.keys(p).map((m) => ({musculo: m, plan: p[m]}));
  }
});

dash.calc('musculo_semana', {
  title: 'Series por músculo y semana',
  description: 'Series efectivas hechas de cada músculo por semana en Mast.',
  inputs: ['series'],
  fn: (series) => {
    const h = {};
    for (const s of series) if (s.mast) { const k = s.semana + '|' + s.musculo; h[k] = h[k] || {clave: k, semana: s.semana, musculo: s.musculo, hechas: 0}; h[k].hechas++; }
    return Object.values(h);
  }
});

dash.calc('racha_gym', {
  title: 'Racha en Mast',
  description: 'Semanas seguidas, hasta la última con entreno, con al menos una sesión en Mast desde el 2 de noviembre.',
  inputs: ['gym'],
  fn: (gym) => {
    const lunes = (f) => { const d = new Date(f + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return d.toISOString().slice(0, 10); };
    const w = [...new Set(gym.filter((g) => g.fecha >= '2026-11-02').map((g) => lunes(g.fecha)))].sort();
    let n = w.length ? 1 : 0;
    for (let i = w.length - 1; i > 0; i--) { if ((new Date(w[i]) - new Date(w[i - 1])) / 864e5 === 7) n++; else break; }
    return [{semanas_seguidas: n, semanas_con_gym: w.length, ultima: w.length ? w[w.length - 1] : ''}];
  }
});

dash.calc('progreso', {
  title: 'Mejor serie por ejercicio y sesión',
  description: 'En cada sesión en Mast, la serie con la fuerza estimada más alta de cada ejercicio.',
  inputs: ['series'],
  fn: (series) => {
    const g = {};
    for (const s of series) if (s.mast) { const k = s.ejercicio + '|' + s.fecha; (g[k] = g[k] || []).push(s); }
    return Object.keys(g).map((k) => {
      const v = g[k];
      const top = v.reduce((a, b) => ((b.e1rm || 0) > (a.e1rm || 0) || ((b.e1rm || 0) === (a.e1rm || 0) && (b.reps || 0) > (a.reps || 0))) ? b : a);
      return {clave: k, ejercicio: v[0].ejercicio, musculo: v[0].musculo, fecha: v[0].fecha, series: v.length, top_kg: top.kg, top_reps: top.reps, e1rm: top.e1rm};
    }).sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));
  }
});

dash.calc('ejercicios', {
  title: 'Resumen por ejercicio',
  description: 'Por ejercicio: sesiones, última mejor serie y cambio de la fuerza estimada desde la primera sesión.',
  inputs: ['progreso'],
  fn: (progreso) => {
    const g = {};
    for (const p of progreso) (g[p.ejercicio] = g[p.ejercicio] || []).push(p);
    return Object.keys(g).map((k) => {
      const v = g[k].slice().sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
      const a = v[0], z = v[v.length - 1];
      return {ejercicio: k, musculo: z.musculo, sesiones: v.length, ultima_fecha: z.fecha, ultimo_top: z.top_kg > 0 ? String(z.top_kg).replace('.', ',') + ' kg × ' + z.top_reps : (z.top_reps || 0) + ' reps', e1rm: z.e1rm, cambio: v.length > 1 && a.e1rm && z.e1rm ? Math.round((z.e1rm / a.e1rm - 1) * 1000) / 1000 : null};
    }).sort((x, y) => y.sesiones - x.sesiones || (x.ejercicio < y.ejercicio ? -1 : 1));
  }
});

dash.calc('resumen', {
  title: 'Sesiones de fuerza',
  description: 'Sesiones de fuerza en Mast (desde el 2 de noviembre) y en total desde agosto.',
  inputs: ['gym'],
  fn: (gym) => {
    const todas = new Set(), mast = new Set();
    for (const g of gym) { todas.add(g.actividad); if (g.fecha >= '2026-11-02') mast.add(g.actividad); }
    return [{sesiones_mast: mast.size, sesiones_total: todas.size}];
  }
});

dash.calc('sugerencias', {
  title: 'Peso de hoy',
  description: 'Peso sugerido para cada ejercicio de la rutina según tu última sesión en Hevy (doble progresión), o un peso de partida si aún no lo has hecho.',
  inputs: ['rutina', 'series'],
  fn: (rutina, series) => {
    const porEj = {};
    for (const s of series) if (s.mast && s.kg != null && s.kg > 0) (porEj[s.ejercicio] = porEj[s.ejercicio] || []).push(s);
    const fmt = (x) => String(x).replace('.', ',');
    return rutina.map((r) => {
      const [lo, hi] = String(r.reps).split(/[–-]/).map(Number);
      const inc = r.incremento || 2.5;
      const base = {id: r.id, hevy: r.hevy};
      if (r.peso_inicial == null) return Object.assign(base, {kg: null, origen: 'corporal', ultima_fecha: '', ultimas: '', consejo: 'Con tu peso corporal: busca llegar a ' + hi + ' reps en todas las series.'});
      const v = porEj[r.hevy] || [];
      if (!v.length) return Object.assign(base, {kg: r.peso_inicial, origen: 'inicial', ultima_fecha: '', ultimas: '', consejo: 'Peso de partida estimado. Si en la primera serie haces más de ' + hi + ' reps, súbelo; si no llegas a ' + lo + ', bájalo.'});
      const fecha = v.reduce((m, s) => (s.fecha > m ? s.fecha : m), '');
      const dia = v.filter((s) => s.fecha === fecha);
      const top = Math.max(...dia.map((s) => s.kg));
      const enTop = dia.filter((s) => s.kg === top);
      const reps = enTop.map((s) => s.reps || 0);
      const fallo = enTop.some((s) => s.tipo === 'fallo');
      const e1 = Math.max(...dia.map((s) => s.kg * (1 + (s.reps || 0) / 30)));
      const ultimas = fmt(top) + ' kg × ' + reps.join(' · ');
      // Pesos que existen en la máquina: peso_base + n × incremento (p. ej. 42,5 → 50 → 57,5).
      const rejilla = (x) => { const b = r.peso_base || 0; return b + Math.floor((x - b) / inc + 1e-9) * inc; };
      const pocas = reps.length < r.series;
      let kg, consejo;
      if (!pocas && reps.every((x) => x >= hi)) { kg = top + inc; consejo = 'Hiciste el tope de reps en todas las series: toca subir.'; }
      else if (reps.every((x) => x >= lo - 1) && !(fallo && pocas)) { kg = top; consejo = pocas ? 'Haz las ' + r.series + ' series con este peso; cuando llegues a ' + hi + ' reps en todas, sube.' : 'Mismo peso: intenta sumar 1 rep por serie hasta llegar a ' + hi + '.'; }
      else { kg = Math.max(r.peso_min || 0, rejilla(e1 / (1 + (lo + (fallo ? 6 : 4)) / 30))); consejo = 'Calculado con tu mejor serie para que hagas ' + lo + '–' + hi + ' reps con 2 de margen.'; }
      // Estancado: tres sesiones seguidas con el mismo peso tope sin sumar ni una rep.
      const fechas = [...new Set(v.map((s) => s.fecha))].sort().slice(-3);
      const marca = (f) => { const d = v.filter((s) => s.fecha === f), t = Math.max(...d.map((s) => s.kg)); return [t, d.filter((s) => s.kg === t).reduce((n, s) => n + (s.reps || 0), 0)]; };
      const m3 = fechas.map(marca);
      const estancado = m3.length === 3 && m3[1][0] <= m3[0][0] && m3[2][0] <= m3[0][0] && m3[1][1] <= m3[0][1] && m3[2][1] <= m3[0][1];
      if (estancado) consejo += ' Llevas 3 sesiones sin mejorar aquí: respeta el descanso de la ficha y llega cerca del fallo en la última serie. Si la próxima tampoco sube, baja un 10 % el peso y vuelve a subir desde ahí.';
      return Object.assign(base, {kg: Math.round(kg * 100) / 100, origen: 'historial', ultima_fecha: fecha, ultimas, consejo, estancado});
    });
  }
});

const MG_DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
// Ejercicios de la rutina ordenados por día y orden dentro del día (las directas antes que las indirectas).
const mgOrdenDias = (l) => l.slice().sort((a, b) => (b.directa - a.directa) || (MG_DIAS.indexOf(a.dia) - MG_DIAS.indexOf(b.dia)) || (a.orden - b.orden));

dash.calc('cobertura', {
  title: 'Cobertura por parte del músculo',
  description: 'Series semanales del plan que llegan a cada parte del músculo: directas, indirectas (cuentan la mitad), días y estado frente al objetivo.',
  inputs: ['rutina', 'partes'],
  fn: (rutina, partes) => {
    const est = {};
    for (const p of partes) est[p.id] = {directas: 0, indirectas: 0, dias: new Set(), ej: []};
    for (const r of rutina) {
      for (const id of mgLista(r.principal)) if (est[id]) { est[id].directas += r.series; est[id].dias.add(r.dia); est[id].ej.push({dia: r.dia, orden: r.orden, ejercicio: r.ejercicio, series: r.series, directa: true}); }
      for (const id of mgLista(r.secundario)) if (est[id]) { est[id].indirectas += r.series; est[id].dias.add(r.dia); est[id].ej.push({dia: r.dia, orden: r.orden, ejercicio: r.ejercicio, series: r.series, directa: false}); }
    }
    return partes.slice().sort((a, b) => a.orden - b.orden).map((p) => {
      const e = est[p.id];
      const efectivas = e.directas + e.indirectas / 2;
      const estado = p.objetivo === 0 ? (efectivas > 0 ? 'Le llega de rebote' : 'No lo necesitas') : efectivas === 0 ? 'Sin trabajo' : efectivas >= p.objetivo ? 'Cubierto' : 'Por debajo';
      return {id: p.id, grupo: p.grupo, parte: p.parte, prioridad: p.prioridad, objetivo: p.objetivo, directas: e.directas, indirectas: e.indirectas, efectivas, dias: e.dias.size, estado, porque: p.porque || p.aporta, ejercicios: mgOrdenDias(e.ej).map((x) => x.dia + ': ' + x.ejercicio + ' (' + x.series + (x.directa ? '' : ', indirecta') + ')').join(' · '), ej_lista: mgOrdenDias(e.ej)};
    });
  }
});

dash.calc('frecuencia', {
  title: 'Cuántas veces tocas cada músculo en tu rutina',
  description: 'Por músculo y por parte: series efectivas del plan cada día de entreno, y cuántos días a la semana le llega trabajo directo y en total.',
  inputs: ['rutina', 'partes'],
  fn: (rutina, partes) => {
    const dias = MG_DIAS.filter((d) => rutina.some((r) => r.dia === d));
    const nuevo = () => Object.fromEntries(dias.map((d) => [d, {dir: 0, ind: 0, ej: []}]));
    const porParte = {}, porGrupo = {};
    for (const p of partes) { porParte[p.id] = nuevo(); porGrupo[p.grupo] = porGrupo[p.grupo] || nuevo(); }
    const grupoDe = Object.fromEntries(partes.map((p) => [p.id, p.grupo]));
    for (const r of rutina) {
      const sumar = (ids, campo) => {
        const gs = new Set();
        for (const id of ids) if (porParte[id]) { porParte[id][r.dia][campo] += r.series; porParte[id][r.dia].ej.push(r.ejercicio); gs.add(grupoDe[id]); }
        return gs;
      };
      const gDir = sumar(mgLista(r.principal), 'dir'), gInd = sumar(mgLista(r.secundario), 'ind');
      // Un ejercicio cuenta una sola vez para el grupo: directo si es protagonista de alguna de sus partes.
      for (const g of gDir) { porGrupo[g][r.dia].dir += r.series; porGrupo[g][r.dia].ej.push(r.ejercicio); }
      for (const g of gInd) if (!gDir.has(g)) { porGrupo[g][r.dia].ind += r.series; porGrupo[g][r.dia].ej.push(r.ejercicio + ' (de rebote)'); }
    }
    const fila = (base, m) => {
      const out = Object.assign({}, base, {dias_directos: 0, dias_total: 0});
      for (const d of dias) {
        const x = m[d];
        out[d] = {efectivas: x.dir + x.ind / 2, directo: x.dir > 0, ejercicios: x.ej.filter((e, i, a) => a.indexOf(e) === i)};
        if (x.dir > 0) out.dias_directos++;
        if (x.dir + x.ind > 0) out.dias_total++;
      }
      return out;
    };
    const out = [];
    const orden = partes.slice().sort((a, b) => a.orden - b.orden);
    for (const g of orden.map((p) => p.grupo).filter((g, i, a) => a.indexOf(g) === i)) {
      out.push(fila({clave: 'g:' + g, tipo: 'grupo', grupo: g, nombre: g, dias}, porGrupo[g]));
      for (const p of orden.filter((p) => p.grupo === g)) out.push(fila({clave: p.id, tipo: 'parte', grupo: g, nombre: p.parte, dias}, porParte[p.id]));
    }
    return out;
  }
});

dash.calc('cobertura_real', {
  title: 'Cobertura real por semana',
  description: 'Series efectivas que de verdad llegaron a cada parte del músculo cada semana, con los ejercicios de la rutina apuntados en Hevy.',
  inputs: ['series', 'rutina', 'partes'],
  fn: (series, rutina, partes) => {
    const ids = new Set(partes.map((p) => p.id));
    const mapa = {};
    for (const r of rutina) if (!mapa[r.hevy]) mapa[r.hevy] = r;
    const acc = {};
    for (const s of series) {
      const r = s.mast ? mapa[s.ejercicio] : null;
      if (!r) continue;
      const add = (id, campo) => { if (!ids.has(id)) return; const k = s.semana + '|' + id; const a = acc[k] = acc[k] || {clave: k, semana: s.semana, id, directas: 0, indirectas: 0}; a[campo]++; };
      mgLista(r.principal).forEach((id) => add(id, 'directas'));
      mgLista(r.secundario).forEach((id) => add(id, 'indirectas'));
    }
    return Object.values(acc).map((a) => Object.assign(a, {efectivas: a.directas + a.indirectas / 2}));
  }
});

dash.calc('cobertura_estado', {
  title: 'Partes por estado',
  description: 'Cuántas partes del músculo hay en cada estado, y cuáles.',
  inputs: ['cobertura'],
  fn: (cobertura) => ['Por debajo', 'Sin trabajo', 'Cubierto', 'Le llega de rebote', 'No lo necesitas'].map((e) => {
    const v = cobertura.filter((r) => r.estado === e);
    return {estado: e, partes: v.length, lista: v.map((r) => r.parte).join(' · ')};
  }).filter((r) => r.partes > 0)
});



/* Solo en la web pública: cálculos para el resumen del entrenador (récords, tendencia,
   plan frente a lo hecho y notas de Hevy). Sin nada de pantalla, para poder probarlos con `node --test`. */
(function () {
  const INICIO_MAST = '2026-11-02', INICIO_BLOQUE = '2026-11-09';
  const lunes = (f) => { const d = new Date(f + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return d.toISOString().slice(0, 10); };
  const DIA_SEMANA = {Lunes: 0, Martes: 1, 'Miércoles': 2, Jueves: 3, Viernes: 4, 'Sábado': 5, Domingo: 6};
  const masDias = (f, n) => { const d = new Date(f + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const fmt = (x) => String(Math.round(x * 100) / 100).replace('.', ',');
  const valor = (s) => (s.kg > 0 && s.reps ? s.kg * (1 + s.reps / 30) : s.reps || s.segundos || 0);

  /* Notas que Adrià escribe en Hevy: van entre comillas bajo el nombre del ejercicio. Devuelve {"actividad|ejercicio": nota}. */
  window.mgNotas = (crudo) => {
    const out = {};
    for (const act of (crudo && crudo.activities) || []) {
      let nombre = null, nota = null;
      for (const raw of String(act.description || '').replace(/\r/g, '').split('\n')) {
        const t = raw.trim();
        if (nota != null) {
          if (t.endsWith('"')) { nota.push(t.slice(0, -1)); out[act.id + '|' + nombre] = nota.map((x) => x.trim()).filter(Boolean).join(' · '); nota = null; } else nota.push(t);
          continue;
        }
        if (t.startsWith('"') && nombre) {
          if (t.length > 1 && t.endsWith('"')) out[act.id + '|' + nombre] = t.slice(1, -1).trim();
          else nota = [t.slice(1)];
          continue;
        }
        if (t && !/^Set\s+\d+:/i.test(t) && !/^Logged with/i.test(t)) nombre = t;
      }
    }
    return out;
  };

  dash.calc('records', {
    title: 'Mejor serie de cada sesión y récords',
    description: 'Por ejercicio y sesión en Mast: la mejor serie, la mejor marca anterior y si la supera (récord).',
    inputs: ['series'],
    fn: (series) => {
      const g = {};
      for (const s of series) if (s.mast) { const k = s.ejercicio + '|' + s.fecha; (g[k] = g[k] || []).push(s); }
      const filas = Object.values(g).map((v) => {
        const top = v.reduce((a, b) => (valor(b) > valor(a) ? b : a));
        return {clave: v[0].ejercicio + '|' + v[0].fecha, ejercicio: v[0].ejercicio, musculo: v[0].musculo, fecha: v[0].fecha, actividad: v[0].actividad, v: Math.round(valor(top) * 10) / 10, con_peso: top.kg > 0, top_kg: top.kg, top_reps: top.reps, top_serie: top.serie, series: v.length};
      }).sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));
      const mejor = {};
      for (const f of filas) {
        const previo = mejor[f.ejercicio];
        f.previo = previo == null ? null : previo;
        f.record = previo != null && f.v > previo;
        mejor[f.ejercicio] = Math.max(previo || 0, f.v);
      }
      return filas;
    }
  });

  dash.calc('tendencia', {
    title: 'Cómo va cada ejercicio',
    description: 'Por ejercicio de la rutina: última mejor serie frente a la sesión anterior, y si lleva 3 sesiones sin mejorar.',
    inputs: ['records', 'rutina'],
    fn: (records, rutina) => {
      const g = {};
      for (const r of records) (g[r.ejercicio] = g[r.ejercicio] || []).push(r);
      const vistos = new Set(), out = [];
      for (const r of rutina) {
        if (vistos.has(r.hevy)) continue;
        vistos.add(r.hevy);
        const v = g[r.hevy];
        if (!v) continue;
        const z = v[v.length - 1], a = v[v.length - 2], b = v[v.length - 3];
        let estado = 'Primera sesión';
        if (a) estado = z.v > a.v ? 'Sube' : z.v < a.v ? 'Baja' : 'Igual';
        if (b && z.v <= b.v && a.v <= b.v) estado = 'Estancado';
        out.push({ejercicio: r.hevy, nombre: r.ejercicio, musculo: r.musculo, sesiones: v.length, fecha: z.fecha, ultima: z.con_peso ? fmt(z.top_kg) + ' kg × ' + z.top_reps : (z.top_reps || 0) + ' reps', cambio: a && a.v ? Math.round((z.v / a.v - 1) * 1000) / 1000 : null, estado});
      }
      return out;
    }
  });

  dash.calc('cumplimiento', {
    title: 'Plan frente a lo hecho',
    description: 'Por semana del bloque y día de la rutina: qué sesión lo cubrió y, por ejercicio, series hechas frente a las del plan y si las reps están en el rango.',
    inputs: ['gym', 'rutina'],
    fn: (gym, rutina) => {
      const dias = [];
      for (const r of rutina) if (!dias.includes(r.dia)) dias.push(r.dia);
      const sesiones = {};
      for (const s of gym) {
        if (s.fecha < INICIO_BLOQUE) continue;
        const S = sesiones[s.actividad] = sesiones[s.actividad] || {actividad: s.actividad, fecha: s.fecha, sesion: s.sesion, minutos: s.minutos, semana: lunes(s.fecha), ej: {}};
        if (s.ejercicio && s.tipo !== 'calentamiento') (S.ej[s.ejercicio] = S.ej[s.ejercicio] || []).push(s);
      }
      const porSemana = {};
      for (const S of Object.values(sesiones)) (porSemana[S.semana] = porSemana[S.semana] || []).push(S);
      const out = [];
      for (const semana of Object.keys(porSemana).sort()) {
        // Cada sesión se asigna al día de la rutina con el que comparte más ejercicios; si no comparte ninguno, al día de la semana en que se hizo.
        const pares = [];
        for (const S of porSemana[semana]) for (const dia of dias) {
          const comunes = rutina.filter((r) => r.dia === dia && S.ej[r.hevy]).length;
          const mismoDia = masDias(semana, DIA_SEMANA[dia]) === S.fecha;
          if (comunes || mismoDia) pares.push({S, dia, peso: comunes * 10 + (mismoDia ? 1 : 0)});
        }
        pares.sort((a, b) => b.peso - a.peso);
        const deDia = {}, usadas = new Set();
        for (const p of pares) if (!deDia[p.dia] && !usadas.has(p.S.actividad)) { deDia[p.dia] = p.S; usadas.add(p.S.actividad); }
        for (const dia of dias) {
          const S = deDia[dia] || null, plan = rutina.filter((r) => r.dia === dia).sort((a, b) => a.orden - b.orden);
          const base = {semana, dia, bloque: plan[0].bloque, fecha: S ? S.fecha : '', actividad: S ? S.actividad : '', minutos: S ? S.minutos : 0};
          for (const r of plan) {
            const sets = S ? (S.ej[r.hevy] || []).slice().sort((a, b) => a.serie - b.serie) : [];
            const [lo, hi] = String(r.reps).split(/[–-]/).map(Number);
            const reps = sets.map((s) => s.reps || 0);
            let estado = 'Pendiente';
            if (S) estado = !sets.length ? 'No hecho' : sets.length < r.series ? 'Faltan series' : reps.every((x) => x >= hi) ? 'Tope de reps' : reps.some((x) => x < lo) ? 'Bajo el rango' : 'En rango';
            out.push(Object.assign({clave: semana + '|' + r.id, tipo: 'plan', id: r.id, orden: r.orden, nombre: r.ejercicio, ejercicio: r.hevy, musculo: r.musculo, plan_series: r.series, plan_reps: r.reps, hechas: sets.length, detalle: sets.map((s) => (s.kg > 0 ? fmt(s.kg) + ' kg × ' : '') + (s.reps != null ? s.reps : s.segundos + ' s') + (s.tipo === 'fallo' ? ' (fallo)' : '')).join(' · '), estado}, base));
          }
          if (S) for (const nombre of Object.keys(S.ej)) {
            if (plan.some((r) => r.hevy === nombre)) continue;
            const sets = S.ej[nombre];
            out.push(Object.assign({clave: semana + '|' + dia + '|' + nombre, tipo: 'extra', id: '', orden: 99, nombre, ejercicio: nombre, musculo: '', plan_series: 0, plan_reps: '', hechas: sets.length, detalle: sets.map((s) => (s.kg > 0 ? fmt(s.kg) + ' kg × ' : '') + (s.reps != null ? s.reps : s.segundos + ' s')).join(' · '), estado: 'Fuera del plan'}, base));
          }
        }
      }
      return out;
    }
  });
})();

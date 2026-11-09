# Proyecto gimnasio de Adrià

Habla siempre en español y tutea. Adrià no es programador: explícale los resultados en lenguaje llano.

## Quién es Adrià (a 2026-11-09)
- 24,5 años, 1,75 m, 70 kg. Sin lesiones (tuvo una sobrecarga de sóleo en oct 2026 por no descansar).
- Ex-corredor fuerte: 10K 35:49, media maratón 1:18:38. Ya no quiere correr tanto; como mucho un rodaje suave a la semana.
- Principiante en el gimnasio: Mast Fitness (Barcelona) desde el 2026-11-02. Entrena lunes, martes, jueves y viernes, sin límite de tiempo por sesión.
- Prioridad: tren superior, sobre todo brazos. Las piernas solo para compensar; está contento con ellas.
- Dispuesto a ganar algo de peso. Proteína objetivo 120–140 g/día (whey de Decathlon: 30 g = 21 g de proteína, 113 kcal). Creatina Creapure 3 g/día.
- No quiere medirse con cinta: se hace fotos a diario. El progreso se mide con fotos + pesos y reps.
- Odia el "vendehumo": todo consejo debe tener respaldo de evidencia (doble progresión, series efectivas = directas + ½ indirectas, proteína 1,6–2,2 g/kg, 1RM estimado con Epley).
- Le gustan mucho el color y la jerarquía visual. Los consejos van dentro de cada ejercicio, no en tarjetas genéricas.
- Su entrenador sigue la web pública: lo que se publique ahí lo ve él.

## La rutina
- Bloque 1: 2026-11-09 → 2026-12-20; semana de descarga la del 2026-12-21. Al acabar, revisar series por músculo y progresión y preparar el bloque 2.
- L Torso A · M Pierna + core · J Torso B · V Brazos + hombros. 29 ejercicios, 81 series/semana.
- Toda la rutina está en `dashboard/rutina.json` (ejercicio, máquina, nombre en Hevy, series, reps, descanso, calentamiento, esfuerzo, peso inicial, partes del músculo que trabaja…).
- Partes musculares, prioridad y series objetivo en `dashboard/partes.json`. Reglas nombre de Hevy → músculo en `dashboard/musculos.json`.
- Máquinas disponibles en Mast: `datos/equipamiento-mast.md`. Usa solo máquinas de esa lista.
- No tiene Hevy Pro, así que no hay API de Hevy: las rutinas en Hevy las cambia él a mano. Cuando cambies un ejercicio, recuérdale qué tocar en Hevy (el nombre exacto está en el campo `hevy`).

## Cómo funciona la web pública
- URL: https://adriarg.github.io/gym-adria/ (GitHub Pages, sin login). Repo público `adriarg/gym-adria`: no subas nada privado.
- Datos: Hevy sube cada entreno a Strava con las series en la descripción ("Set N: X kg x R [Warm-up]/[Failure]"). `.github/workflows/sync.yml` corre cada ~5 min (relevándose a sí mismo, ver más abajo) y:
  1. `scripts/build-site.mjs` monta `docs/` a partir de `dashboard/` (página, cálculos, vistas, JSON) y `web/` (piezas solo de la web).
  2. `scripts/sync-strava.mjs` lee la API de Strava (secrets `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN`) y escribe `docs/data/gym.json` y `carreras.json`.
  3. Si algo cambió, hace commit y publica la web.
- Un push que toque `dashboard/`, `web/`, `scripts/` o el workflow vuelve a publicar la web sola en 2–3 min. No edites `docs/` a mano: se regenera.
- `web/shim.js` imita el motor `dash` de la dashboard de Claude (`dash.calc`, `dash.loader`, `dash.draw`, `dash.data`, `dash.params`…), así que `dashboard/calculos.js` y `dashboard/vistas.js` funcionan igual en los dos sitios. `web/diario.js` añade la pestaña "Entrenos hechos".
- Piezas solo de la web (en `web/`): `analisis.js` (cálculos `records`, `tendencia`, `cumplimiento` y `mgNotas()`, que saca las notas que Adrià escribe en Hevy), `resumen.js` (pestaña "Resumen" para el entrenador, enlace directo `…/#resumen`: plan frente a lo hecho, cómo va cada ejercicio y cambios de la rutina) y `diario.js` (pestaña "Entrenos hechos", récords en dorado y la línea de frescura, que pregunta a la API pública de GitHub cuándo fue la última ejecución correcta y avisa si pasa de 45 min).
- Cada cambio de la rutina se apunta también en `dashboard/cambios.json` (`fecha`, `id`, `cambio`, `motivo`): sale en la pestaña Resumen para que el entrenador sepa qué cambió y por qué.
- Pruebas: `node --test tests/*.test.mjs` (el workflow las lanza en cada push; si fallan, no se publica). Lánzalas antes de subir.
- El `schedule` de GitHub no ha saltado nunca en este repo, así que el workflow se releva solo: el job `relevo` espera 4 min y lanza la siguiente ejecución (`workflow_dispatch` con `cadena=true`). Los push no entran en la cadena. Si la cadena se rompe (no hay ejecuciones recientes en `gh run list -R adriarg/gym-adria`), se rearranca con `gh workflow run sync.yml -R adriarg/gym-adria`; la web avisa en naranja cuando pasan más de 45 min sin comprobar Strava.
- Las marcas corriendo son fijas en `docs/data/marcas.json` (Strava no da los récords absolutos por la API).
- Los campos lista de los JSON (`principal`, `secundario`, `mapa`) pueden llegar como texto JSON en la dashboard de Claude: léelos siempre con `mgLista()`.
- Antes de subir, prueba la web: `node scripts/build-site.mjs` y sirve `docs/` (por ejemplo `python -m http.server --directory docs`); sin `docs/data/gym.json` la página sale vacía.

## La dashboard dentro de Claude
Existe también un artefacto de Claude (https://claude.ai/artifact/BfWBmdjNBDdPEwqcUs3FBW) con los mismos archivos guardados en su propio almacén. Desde una sesión en la nube puede que no se pueda actualizar: la web de GitHub es la principal. Si cambias algo en `dashboard/` y no puedes actualizar el artefacto, díselo a Adrià.

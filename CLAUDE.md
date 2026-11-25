# Proyecto gimnasio de Adrià

Habla siempre en español y tutea. Adrià no es programador: explícale los resultados en lenguaje llano. Respuestas cortas: si escribes mucho texto lo lee por encima.

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
- Su entrenadora (2026-11-10) quiere que aprenda bien los ejercicios básicos con barra libre (peso muerto, peso muerto rumano, sentadilla, zancadas): sirven en cualquier gimnasio y enseñan a apretar el tronco. El rumano (lunes desde el 2026-11-23), la sentadilla con barra y el peso muerto convencional (jueves desde el 2026-11-23, desde el 2026-11-11, en el Half Rack) ya están en el bloque 1; en el bloque 2 entran las zancadas, con poco peso y técnica primero.
- Desde el 2026-11-23: L Pierna (ids M*) · M Torso A (L*) · J Pierna + brazos (V*) · V Torso B (J*). Los ids conservan la letra del día antiguo. 28 ejercicios, 83 series/semana. Las sesiones de pierna (M*) y de pierna + brazos (V*) las eligió Adrià ejercicio a ejercicio y en ese orden (2026-11-11): respeta el orden.
- Lo que quiere Adrià (2026-11-11, días cambiados el 2026-11-23 por las colas): dos días de torso mezclando empuje y tirón (martes y viernes) y uno de pierna (lunes) son los días fuertes. El jueves es pierna con barra libre (sentadilla, peso muerto, hip thrust) alternada con brazos.
- Favoritos de Adrià (2026-11-12) para lo que le falta: extensión de tríceps sobre la cabeza con cuerda en polea (cabeza larga) y elevación lateral en polea baja a un brazo (hombro lateral). La elevación lateral en polea ya está el jueves (sustituye al press de hombro, 2026-11-12); la extensión con cuerda está el lunes. No añadas más sin que lo confirme.
- Regla de descanso de Adrià (2026-11-12): lo que se trabaja un día NO se repite al día siguiente (lunes→martes y jueves→viernes son seguidos). Con los días de 2026-11-23 se cumple: pierna el lunes y torso el martes; pierna + brazos el jueves y torso el viernes (brazos solo de forma indirecta). Objetivo: llegar a las series objetivo de cada parte, sin pasarse mucho ni quedarse corto, con descansos suficientes.
- En la web y al darle la rutina: usa siempre el nombre exacto de la máquina en Mast (campo `maquina`, en mayúsculas y con la marca entre paréntesis, p. ej. SUPER PULLOVER (PANATTA)) para que la encuentre rápido; la foto de la máquina va grande en cada ficha. En la nota de Hevy pone «MÁQUINA — MÚSCULO». Formato que le gusta para darle cada ejercicio (2026-11-19): línea 1 «MÁQUINA (MARCA) — PARTE DEL MÚSCULO» en mayúsculas; luego «Calentamiento: …», «N × reps con X kg · descanso … · reserva» y «Técnica: …» (corta). Ya están todas las fotos (Linear Leg Press y Glute Drive añadidas el 2026-11-17).
- Curls (2026-11-24, decidido con Adrià): martes curl inclinado (L6, bíceps estirado); jueves curl MTS (V2, le gusta y casi nunca está ocupada) + curl martillo (V4, braquial y braquiorradial). El curl de pie se quitó.
- Molestia (2026-11-09 y 2026-11-12): dolor lumbar en el peso muerto rumano («técnica mejorable»). Con rumano el lunes y peso muerto el jueves: poco peso, 2–3 reps en reserva y vigilarlo. 2026-11-23: rumano con 20 kg de discos sin molestia «porque apreté bien los abs»: clave apretar el abdomen.
- Calentamiento (2026-11-12): como máximo 1 serie de aproximación por ejercicio, nunca 2. En los ejercicios a un brazo (lateral en polea) es 1 por brazo, así que en Hevy salen 2 Warm-up: es correcto.
- Cada comentario de técnica que se le dé en el chat (feedback de un entreno, dudas de sus notas de Hevy) se añade en ese momento a la `nota` del ejercicio en `dashboard/rutina.json`, para que salga en las notas del siguiente entreno (2026-11-20).
- Notas de Hevy (2026-11-24, lo pidió Adrià): TODAS sus notas de Hevy van siempre a la `nota` del ejercicio y a lo que se le da para pegar, aunque no se entiendan (entonces, literales: «Tu nota: «…»»). Si no está claro de qué ejercicio es, ponla en todos los candidatos.
- Toda la rutina está en `dashboard/rutina.json` (ejercicio, máquina, nombre en Hevy, series, reps, descanso, calentamiento, esfuerzo, peso inicial, partes del músculo que trabaja…).
- Partes musculares, prioridad y series objetivo en `dashboard/partes.json`. Reglas nombre de Hevy → músculo en `dashboard/musculos.json`.
- Máquinas disponibles en Mast: `datos/equipamiento-mast.md`. Usa solo máquinas de esa lista.
- En Hevy/Strava Adrià apunta solo los discos, sin el peso propio de la máquina. La tabla "Peso propio de las máquinas" de `datos/equipamiento-mast.md` da ese peso: súmalo para saber la carga real y, al recomendar un peso, dile cuántos discos poner (total − máquina). Usa los nombres exactos de las etiquetas. Cuando mande fotos de otras máquinas, añádelas a esa tabla.
- Desde el 2026-11-12, en las máquinas iso-laterales (High Row, Incline Press…) Adrià apunta en Hevy la SUMA de los dos lados («peso es suma de ambos, siempre»). Antes apuntaba el peso por brazo.
- Desde el 2026-11-13, en el curl MTS (V2), el curl inclinado con mancuernas (L6 desde el 2026-11-24; antes V4), el curl martillo (V4 desde el 2026-11-24) y los fondos SEATED DIP (V1) Adrià apunta en Hevy la SUMA de los dos brazos o pilas. Para comparar con la rutina (por brazo), divide entre 2.
- 2026-11-19: nombres reales que usa en Hevy: L1 «MTS Chest Press», L3 «Iso-Lateral Chest Press (Machine)» (es la ISO-LATERAL INCLINE PRESS: confirmado con fotos el 2026-11-25), J5 «Peck Fly (Máquina)». «Peso de hoy» avisa si la 2ª serie cae ≥3 reps o hay series ligeras sin marcar como calentamiento.
- Cambio de días aplicado el 2026-11-21 (vale desde el lunes 2026-11-23), porque hay menos cola. Rodaje suave mejor el sábado (no el miércoles, que va antes de la pierna del jueves).
- 2026-11-19: en el High Row le duelen las manos y a veces para antes por eso (no por la espalda): probar correas o agarre más relajado.
- 2026-11-13: en la sentadilla con barra le duele el apoyo de la barra en la espalda. En los fondos usa cinturón y el asiento al 12.
- No tiene Hevy Pro, así que no hay API de Hevy: las rutinas en Hevy las cambia él a mano. Cuando cambies un ejercicio, recuérdale qué tocar en Hevy (el nombre exacto está en el campo `hevy`).

- Rutinas públicas de Hevy (enlaces hevy.com/routine/ID): la página no trae los datos; se leen con `curl -H "x-api-key: shelobs_hevy_web" https://api.hevyapp.com/routine_with_short_id/ID` (clave pública de la web de Hevy). El entorno tiene hevy.com permitido desde el 2026-11-16.

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
- El `schedule` de GitHub no ha saltado nunca en este repo, así que el workflow se releva solo: el job `relevo` espera 4 min y lanza la siguiente ejecución (`workflow_dispatch` con `cadena=true`). Los push no entran en la cadena. Si la cadena se rompe (no hay ejecuciones recientes en `gh run list -R adriarg/gym-adria`), se rearranca con `gh workflow run sync.yml -R adriarg/gym-adria`; la web avisa en naranja cuando pasan más de 45 min sin comprobar Strava. Ojo (2026-11-18): una ejecución puede quedarse «queued» horas sin máquina y, como el grupo `concurrency: sync` no deja pasar a nadie, bloquea toda la cola (las demás acaban «cancelled»). Si pasa, cancela esa ejecución atascada (MCP `actions_run_trigger` → `cancel_workflow_run`) y la siguiente arranca sola. Desde el 2026-11-18 el `schedule` sí salta a veces. Desde el 2026-11-24 `deploy-pages` falla a ratos con «No artifacts named github-pages» (fallo de GitHub, no nuestro; a Adrià le llegan correos «Run failed»): el paso «Publicar» reintenta solo una vez tras 60 s.
- «Ocupada → ¿y ahora?» (2026-11-24, lo pidió Adrià): en cada ejercicio de la rutina hay botones «Hecho» y «Ocupada», y arriba sale cuál toca (`mgSiguiente` en `calculos.js`). Regla: si el siguiente de su orden está libre, ese; si no, el libre que no repita músculo con el último hecho, con los pesados (`fase` 1) antes que los ligeros (2) y los abdominales (3) al final. Al marcar un ejercicio como hecho, las «Ocupada» se borran (se vuelve a la que estaba ocupada; si sigue ocupada, la marca otra vez). Lo marcado se guarda solo en su móvil y solo ese día. Cada ejercicio nuevo necesita `fase`.
- La pestaña Corredor se quitó (2026-11-11, a petición de Adrià). La pestaña Músculos muestra los ejercicios de SU rutina con su día y una tabla de cuántas veces toca cada músculo y parte por semana (`frecuencia` en `calculos.js`).
- Los campos lista de los JSON (`principal`, `secundario`, `mapa`) pueden llegar como texto JSON en la dashboard de Claude: léelos siempre con `mgLista()`.
- Antes de subir, prueba la web: `node scripts/build-site.mjs` y sirve `docs/` (por ejemplo `python -m http.server --directory docs`); sin `docs/data/gym.json` la página sale vacía.

## Sesiones y GitHub
- Adrià autoriza que fusiones tú mismo tus PR (merge) cuando las pruebas pasen, sin esperarle.
- Todo lo que se aprenda y deba durar va a GitHub (este archivo, `datos/`, `dashboard/`): cada sesión nueva debe arrancar sabiéndolo todo.
- Cualquier dato nuevo de Adrià, por pequeño que sea (una preferencia, una molestia, una máquina, un cambio de horario…), se apunta en el archivo que toque y se sube a GitHub en ese mismo momento, sin esperar al final de la sesión.
- La sesión se compacta sola a los 300k tokens; un aviso cuenta las compactaciones. A partir de la 2ª, dile a Adrià que abra una sesión nueva.

## La dashboard dentro de Claude
Existe también un artefacto de Claude (https://claude.ai/artifact/BfWBmdjNBDdPEwqcUs3FBW) con los mismos archivos guardados en su propio almacén. Desde una sesión en la nube puede que no se pueda actualizar: la web de GitHub es la principal. Si cambias algo en `dashboard/` y no puedes actualizar el artefacto, díselo a Adrià.

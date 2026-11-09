# Mast Gym · Adrià

Rutina de gimnasio (bloque 1) y dashboard de seguimiento.

- **Web pública:** https://adriarg.github.io/gym-adria/ — se actualiza sola cada 30 minutos con los entrenos que Hevy sube a Strava.
- `dashboard/` — la dashboard original (rutina, cálculos y vistas). La web pública reutiliza estos mismos archivos.
- `web/` — piezas solo de la web pública: motor de datos (`shim.js`), estilos base y la pestaña "Entrenos hechos".
- `scripts/build-site.mjs` — monta la web en `docs/`.
- `scripts/sync-strava.mjs` — lee Strava y guarda los datos en `docs/data/`. Lo ejecuta `.github/workflows/sync.yml`.
- `datos/` — catálogo de máquinas de Mast Fitness.

Secrets necesarios en el repo: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN`.

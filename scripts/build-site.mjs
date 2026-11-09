// Monta la web pública en docs/ a partir de la dashboard (dashboard/) y las piezas propias de la web (web/).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dash = path.join(raiz, 'dashboard'), web = path.join(raiz, 'web'), out = path.join(raiz, 'docs');
fs.mkdirSync(path.join(out, 'data'), {recursive: true});

for (const f of ['estilos.css', 'anatomia.js', 'fotos.js', 'calculos.js', 'vistas.js']) fs.copyFileSync(path.join(dash, f), path.join(out, f));
for (const f of ['rutina.json', 'partes.json', 'musculos.json']) fs.copyFileSync(path.join(dash, f), path.join(out, 'data', f));
for (const f of fs.readdirSync(web)) fs.copyFileSync(path.join(web, f), path.join(out, f));

let cuerpo = fs.readFileSync(path.join(dash, 'index.html'), 'utf8').replace('<meta name="dash-one-writer">', '').trim();
cuerpo = cuerpo.replace('<script src="calculos.js"></script>', '<script src="diario.js"></script>\n<script src="calculos.js"></script>');
cuerpo = cuerpo.replace('Esta página lee tu Strava cada vez que la abres.', 'Esta web lee el Strava de Adrià cada 30 minutos.');

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Mast Gym · Adrià</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%8F%8B%EF%B8%8F%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="base.css">
<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>
<script src="shim.js"></script>
</head>
<body>
<div id="dash-root">
${cuerpo}
</div>
</body>
</html>
`;
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.writeFileSync(path.join(out, '.nojekyll'), '');
console.log('Web montada en docs/');

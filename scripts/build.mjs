// Buduje wersję do hostowania w dist/: kopia strony i zasobów, wersjonowanie CSS/JS po hashu treści.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const dist = new URL('../dist/', import.meta.url);
const src = new URL('../', import.meta.url);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(new URL('assets/', src), new URL('assets/', dist), { recursive: true });

const hash = async path => createHash('sha256').update(await readFile(new URL(path, src))).digest('hex').slice(0, 10);
let html = await readFile(new URL('index.html', src), 'utf8');
for (const asset of ['assets/css/style.css', 'assets/js/app.js']) {
  html = html.replace(`"${asset}"`, `"${asset}?v=${await hash(asset)}"`);
}
await writeFile(new URL('index.html', dist), html);
// GitHub Pages bez przetwarzania Jekyll.
await writeFile(new URL('.nojekyll', dist), '');
console.log('Zbudowano dist/');

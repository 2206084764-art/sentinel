import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, relative, dirname, join, sep, extname } from 'node:path';
import { runInNewContext } from 'node:vm';

const root = resolve(process.argv[2] || 'dist');
const read = path => readFileSync(path, 'utf8');
const walk = path => readdirSync(path, { withFileTypes: true }).flatMap(entry => {
  const file = join(path, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});

// Exact case matters on GitHub Pages even when local macOS paths are case-insensitive.
function requireFile(path) {
  const target = resolve(path);
  const parts = relative(root, target).split(sep);
  assert(!parts.includes('..'), `Resource escapes dist: ${target}`);
  let parent = root;
  for (const part of parts) {
    assert(readdirSync(parent).includes(part), `Missing file or filename case mismatch: ${relative(root, target)}`);
    parent = join(parent, part);
  }
  assert(statSync(target).isFile(), `Not a file: ${target}`);
  assert(statSync(target).size > 0 || target.endsWith('.nojekyll'), `Empty resource: ${target}`);
  return target;
}

function localReference(url, from) {
  if (!url || /^(?:[a-z]+:|\/\/|#)/i.test(url)) return;
  assert(!url.startsWith('/'), `Root-absolute URL breaks repository Pages: ${url}`);
  const path = decodeURIComponent(url.split(/[?#]/)[0]);
  if (path) requireFile(resolve(dirname(from), path));
}

const index = requireFile(join(root, 'index.html'));
requireFile(join(root, 'event-config.js'));
const configScope = { window: {} };
runInNewContext(read(join(root, 'event-config.js')), configScope, { timeout: 1000 });
const eventConfig = configScope.window.SENTINEL_EVENT || {};
if (eventConfig.startISO || eventConfig.endISO) {
  const zoned = value => typeof value === 'string' && /(Z|[+-]\d\d:\d\d)$/.test(value) && Number.isFinite(Date.parse(value));
  assert(zoned(eventConfig.startISO) && zoned(eventConfig.endISO), 'Set both startISO and endISO with explicit timezones.');
  assert(Date.parse(eventConfig.endISO) > Date.parse(eventConfig.startISO), 'Event end must be after its start.');
}
requireFile(join(root, '.nojekyll'));
for (const [, url] of read(index).matchAll(/(?:src|href)=["']([^"']+)["']/g)) localReference(url, index);
assert(!read(index).includes('/src/main.'), 'dist/index.html still points at unbuilt React source');

const manifest = JSON.parse(read(requireFile(join(root, 'assets/media-manifest.json'))));
const images = manifest.files.filter(item => item.file.startsWith('Images/'));
const videos = manifest.files.filter(item => item.kind === 'video');
assert.equal(images.length, 27, 'Expected all 27 source product/case images');
assert.equal(videos.length, 6, 'Expected all 6 source videos');
for (const item of manifest.files) {
  const path = item.file.replace(/^(Images|Videos|Branding)\//, folder => folder.toLowerCase());
  requireFile(join(root, 'assets', path));
}
for (const name of ['S5-Installation-Guide.docx', 'S5-Product-Specification.docx', 'S5-User-Manual.docx', 'Sentinel-Product-Presentation.pptx']) {
  requireFile(join(root, 'docs', name));
}

const modelRoot = join(root, 'assets/3d');
const models = JSON.parse(read(requireFile(join(modelRoot, 'manifest.json'))));
assert.equal(models.pages.length, 11, 'Expected all 11 original 3D entry pages');
for (const page of models.pages) {
  const file = requireFile(join(modelRoot, page.file));
  const html = read(file);
  assert(!/https?:\/\//.test(html), `External dependency remains in 3D page: ${page.file}`);
  for (const name of page.models) requireFile(join(modelRoot, 'models', name));
  const map = JSON.parse(html.match(/<script\s+type=["']importmap["']\s*>([\s\S]*?)<\/script>/)?.[1] || '{}');
  assert.equal(map.imports?.three, './vendor/three/build/three.module.js');
  assert.equal(map.imports?.['three/addons/'], './vendor/three/examples/jsm/');
}
for (const name of Object.keys(models.models)) {
  const bytes = readFileSync(requireFile(join(modelRoot, 'models', name)));
  assert.equal(bytes.subarray(0, 4).toString(), 'glTF', `Invalid GLB header: ${name}`);
  assert.equal(bytes.readUInt32LE(4), 2, `Unsupported GLB version: ${name}`);
  assert.equal(bytes.readUInt32LE(8), bytes.length, `Truncated GLB: ${name}`);
}

const imports = /(?:^\s*(?:import|export)\s+(?:[^;"']*?\s+from\s+)?|\bimport\(\s*)["']([^"']+)["']/gm;
for (const file of walk(modelRoot).filter(path => ['.html', '.js'].includes(extname(path)))) {
  for (const [, specifier] of read(file).matchAll(imports)) {
    if (specifier === 'three') requireFile(join(modelRoot, 'vendor/three/build/three.module.js'));
    else if (specifier.startsWith('three/addons/')) requireFile(join(modelRoot, 'vendor/three/examples/jsm', specifier.slice(13)));
    else if (specifier.startsWith('.')) requireFile(resolve(dirname(file), specifier));
    else assert.fail(`Unresolved 3D dependency: ${specifier} in ${file}`);
  }
}

// Original DS100 Zoom event IDs must never become Sentinel's registration destination.
const oldZoomIds = ['Agy5JEPsHnwj0ZboxNQbZbh16oeU0MFrX7zpKwtBp1PqDIlmkhpL', 'AjmpPzr0D9RaBvHM55CgYS30ETGXh-xzFhmNl6N6x47zJdSRBjkX', 'Akfmgi9XI370fr0tuzrmxvm8oh2BtvdRoxb1cwNzuiHE_2w-bSUv', 'An9S1JAjPHZVebW-SJUTKGD6fhKYYnEr3rVV92vVpJ3L9DNeTMLH', 'AnphqLG1dWVBV65_YjAtIc23lhMDNSMafVSyKk6qlbALQWrk0oOq', 'ApkBGNXTNS6WkPK_lz6gF1ZANFwTcQzVylaUL9u0Ar8yJ30RvW1i', 'As2DHjmzRJ6Cf6whTk0x4thDdHcmeh9MDfBG7dAGB-d0rgfRW83P', 'AszUGJ7uotvhAuBFtTTc2Dt-bBWBG4wRNNCbJeNtAA1WLE7FIM04'];
const files = walk(root);
for (const file of files) {
  assert(statSync(file).size <= 25_000_000, `File exceeds 25 MB upload budget: ${relative(root, file)}`);
  if (!['.html', '.js', '.css'].includes(extname(file))) continue;
  const content = read(file);
  assert(!oldZoomIds.some(id => content.includes(id)), `Old DS100 event link in ${file}`);
  assert(!/ds100_(?:utm|register|webinar|signup)/i.test(content), `Old DS100 event identifier in ${file}`);
  if (extname(file) === '.css') {
    for (const [, url] of content.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) localReference(url, file);
  }
}
console.log(`Build verified: ${files.length} files; 27 images, 6 videos, 11 3D entries, 4 documents; all files <= 25 MB.`);
console.log('Checked local paths, exact filename case, GLB headers, 3D imports, and old DS100 event identifiers. Browser QA and live registration still require manual checks.');

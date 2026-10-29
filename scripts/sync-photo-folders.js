#!/usr/bin/env node
'use strict';

/**
 * Folder-based photo library sync for the static Szklarska Poręba site.
 * Run on Cloudflare Pages before publishing:
 *   Build command: node scripts/sync-photo-folders.js
 *   Build output directory: .
 *
 * Room structure:
 *   assets/library/rooms/<room-slug>/cover.webp
 *   assets/library/rooms/<room-slug>/*.{jpg,jpeg,png,webp,avif}
 *   assets/library/rooms/<room-slug>/normalne/*.{...}
 *   assets/library/rooms/<room-slug>/closeup/*.{...}
 *
 * Images placed directly in the room folder (except cover) and in normalne/
 * appear in the standard gallery. Images inside closeup/ appear under a
 * separate “Detale i zbliżenia” gallery on room detail pages.
 * Empty folders never wipe existing JSON content.
 */
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const DATA = path.join(ROOT, 'data');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);
const ROOT_DIRS = {
  rooms: path.join(ROOT, 'assets', 'library', 'rooms'),
  property: path.join(ROOT, 'assets', 'library', 'property'),
  plans: path.join(ROOT, 'assets', 'library', 'plans'),
  concepts: path.join(ROOT, 'assets', 'library', 'concepts')
};

function log(message) { console.log('[photo-folder-sync] ' + message); }
function readJson(file) {
  const filePath = path.join(DATA, file);
  if (!fs.existsSync(filePath)) throw new Error('Missing data file: ' + path.relative(ROOT, filePath));
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
function writeJson(file, value) {
  const filePath = path.join(DATA, file);
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}
function slugify(value) {
  let s = String(value || '').toLowerCase().replace(/ł/g, 'l');
  try { s = s.normalize('NFKD').replace(/[\u0300-\u036f]/g, ''); } catch (_) {}
  return s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');
}
function naturalSort(a, b) {
  return path.basename(a).localeCompare(path.basename(b), 'pl', { numeric: true, sensitivity: 'base' });
}
function isImage(file) { return IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()); }
function isIgnoredName(name) { return !name || name.startsWith('.') || name.toLowerCase() === 'thumbs.db' || name.toLowerCase() === 'desktop.ini'; }
function walkImages(dir, recursive) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'pl', { numeric: true, sensitivity: 'base' }));
  for (const entry of entries) {
    if (isIgnoredName(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isFile() && isImage(entry.name)) results.push(full);
    else if (recursive && entry.isDirectory()) results = results.concat(walkImages(full, true));
  }
  return results.sort(naturalSort);
}
function publicUrl(filePath) {
  const relative = path.relative(ROOT, filePath).split(path.sep).map(part => encodeURIComponent(part)).join('/');
  return '/' + relative;
}
function diskPathFromPublicUrl(url) {
  if (!url || typeof url !== 'string' || /^(https?:|data:|blob:)/i.test(url)) return null;
  const raw = url.split(/[?#]/, 1)[0].replace(/^\/+/, '');
  let decoded;
  try { decoded = raw.split('/').map(part => decodeURIComponent(part)).join(path.sep); }
  catch (_) { decoded = raw.split('/').join(path.sep); }
  const full = path.resolve(ROOT, decoded);
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) return null;
  return full;
}
function publicUrlExists(url) {
  const p = diskPathFromPublicUrl(url);
  return Boolean(p && fs.existsSync(p) && fs.statSync(p).isFile());
}
function stem(file) { return path.basename(file, path.extname(file)); }
function isCoverFile(file, slug) {
  const base = stem(file).toLowerCase();
  return base === 'cover' || base === slug.toLowerCase() + '-cover' || base.endsWith('-cover');
}
function chooseCover(files, slug) {
  if (!files.length) return null;
  const priorities = ['.webp', '.avif', '.jpg', '.jpeg', '.png', '.gif'];
  const byStem = (wanted) => priorities.map(ext => files.find(file => stem(file).toLowerCase() === wanted + ext)).find(Boolean) || null;
  const exact = byStem('cover');
  if (exact) return exact;
  const slugCover = byStem(slug.toLowerCase() + '-cover');
  if (slugCover) return slugCover;
  for (const file of files) if (isCoverFile(file, slug)) return file;
  return null;
}
function generatedTitle(file) {
  return stem(file).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, c => c.toLocaleUpperCase('pl-PL')) || 'Zdjęcie';
}
function uniqueByUrl(files) {
  const seen = new Set();
  return files.map(publicUrl).filter(url => { if (seen.has(url)) return false; seen.add(url); return true; });
}

function syncRooms() {
  const rooms = readJson('rooms.json');
  let changed = 0;
  for (const room of rooms) {
    const folderSlug = slugify(room.slug);
    const roomDir = path.join(ROOT_DIRS.rooms, folderSlug);
    if (!fs.existsSync(roomDir)) continue;

    const directFiles = walkImages(roomDir, false);
    const normalFiles = walkImages(path.join(roomDir, 'normalne'), true);
    const closeupFiles = walkImages(path.join(roomDir, 'closeup'), true);
    const allRoomFiles = [...directFiles, ...normalFiles, ...closeupFiles].sort(naturalSort);
    // Do not overwrite a CMS gallery when the folder is only a .gitkeep placeholder.
    if (!allRoomFiles.length) continue;

    const explicitCover = chooseCover(directFiles, folderSlug);
    let coverFile = explicitCover;
    if (!coverFile && !publicUrlExists(room.cover)) {
      coverFile = [...normalFiles, ...closeupFiles, ...directFiles].sort(naturalSort)[0] || null;
    }
    if (coverFile) room.cover = publicUrl(coverFile);

    const currentCoverUrl = room.cover || '';
    const normalCandidates = [...directFiles, ...normalFiles].sort(naturalSort);
    const normalUrls = uniqueByUrl(normalCandidates.filter(file => publicUrl(file) !== currentCoverUrl));
    const closeupUrls = uniqueByUrl(closeupFiles.filter(file => publicUrl(file) !== currentCoverUrl));

    room.gallery = normalUrls;
    room.closeup_gallery = closeupUrls;
    changed++;
    log('room ' + room.slug + ': cover=' + (room.cover || '(none)') + ', normal=' + normalUrls.length + ', closeups=' + closeupUrls.length);
  }
  writeJson('rooms.json', rooms);
  log('rooms.json synchronized (' + changed + ' room folders with images).');
}

function syncPropertyGallery() {
  const files = walkImages(ROOT_DIRS.property, false);
  if (!files.length) { log('property gallery unchanged (no images found).'); return; }
  const current = readJson('property-gallery.json');
  const byImage = new Map(current.map(item => [item.image, item]));
  const next = files.map((file, i) => {
    const image = publicUrl(file);
    const existing = byImage.get(image);
    if (existing) return Object.assign({}, existing, { image, sort_order: i + 1, visible: existing.visible !== false });
    const title = generatedTitle(file);
    return { title, title_en: title, title_de: title, alt: title, image, sort_order: i + 1, visible: true };
  });
  writeJson('property-gallery.json', next);
  log('property-gallery.json synchronized (' + next.length + ' photos).');
}

function syncPropertyDetailGallery() {
  const normalFiles = walkImages(path.join(ROOT_DIRS.property, 'normalne'), true);
  const closeupFiles = walkImages(path.join(ROOT_DIRS.property, 'closeup'), true);
  if (!normalFiles.length && !closeupFiles.length) {
    log('property detail gallery unchanged (no images found).');
    return;
  }
  const current = readJson('property-detail-gallery.json');
  const existing = new Map(current.map(item => [item.image, item]));
  function mapFiles(files) {
    return files.map(file => {
      const image = publicUrl(file);
      const previous = existing.get(image);
      if (previous) return Object.assign({}, previous, { image, visible: previous.visible !== false });
      const title = generatedTitle(file);
      return { title, title_en: title, title_de: title, alt: title, image, visible: true };
    });
  }
  writeJson('property-detail-gallery.json', {
    normal: mapFiles(normalFiles),
    closeup: mapFiles(closeupFiles)
  });
  log('property-detail-gallery.json synchronized (normal=' + normalFiles.length + ', closeups=' + closeupFiles.length + ').');
}

function syncPlans() {
  const plans = readJson('floor-plans.json');
  let changed = 0;
  for (const plan of plans) {
    const dir = path.join(ROOT_DIRS.plans, slugify(plan.slug));
    const files = walkImages(dir, true);
    if (!files.length) continue;
    // A plan folder normally contains one file. If there are several, cover.webp
    // (or a *-cover file) is selected; otherwise the alphabetically first image wins.
    const candidate = chooseCover(walkImages(dir, false), slugify(plan.slug)) || files[0];
    plan.image = publicUrl(candidate);
    changed++;
    log('floor plan ' + plan.slug + ': ' + plan.image);
  }
  writeJson('floor-plans.json', plans);
  log('floor-plans.json synchronized (' + changed + ' plan folders with images).');
}

function syncConcepts() {
  const concepts = readJson('concepts.json');
  let changed = 0;
  for (const concept of concepts) {
    const slug = slugify(concept.slug);
    const dir = path.join(ROOT_DIRS.concepts, slug);
    if (!fs.existsSync(dir)) continue;
    const direct = walkImages(dir, false);
    const extra = walkImages(path.join(dir, 'gallery'), true);
    const all = [...direct, ...extra].sort(naturalSort);
    if (!all.length) continue;
    const coverFile = chooseCover(direct, slug);
    if (coverFile) concept.cover = publicUrl(coverFile);
    const currentCoverUrl = concept.cover || '';
    concept.gallery = uniqueByUrl(all.filter(file => publicUrl(file) !== currentCoverUrl));
    changed++;
    log('concept ' + concept.slug + ': cover=' + (concept.cover || '(none)') + ', gallery=' + concept.gallery.length);
  }
  writeJson('concepts.json', concepts);
  log('concepts.json synchronized (' + changed + ' concept folders with images).');
}

function main() {
  for (const dir of Object.values(ROOT_DIRS)) fs.mkdirSync(dir, { recursive: true });
  syncRooms();
  syncPropertyGallery();
  syncPropertyDetailGallery();
  syncPlans();
  syncConcepts();
  log('Done. Static files are ready to publish.');
}

try { main(); }
catch (error) { console.error('[photo-folder-sync] ERROR:', error && error.stack || error); process.exitCode = 1; }

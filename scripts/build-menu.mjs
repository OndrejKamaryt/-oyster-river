#!/usr/bin/env node
/**
 * build-menu.mjs — renders menu sections from JSON data into the static HTML.
 * Source of truth: content/menu-food.json, content/menu-drink.json (edited via Decap CMS).
 * Keeps the menu in the static HTML (SEO) while data stays editable.
 * Run: `node scripts/build-menu.mjs`
 *
 * Two targeting modes per section:
 *   { id: 'oysters' }        -> first <ul class="menu-list"> inside <article id="oysters">
 *   { marker: 'bar_dishes' } -> content between <!--m:bar_dishes--> ... <!--/m:bar_dishes-->
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(root, p), 'utf8');
const foodData = JSON.parse(read('content/menu-food.json'));
const drinkData = JSON.parse(read('content/menu-drink.json'));

const FOOD_SECTIONS = {
  oysters: { id: 'oysters' }, small: { id: 'small' }, main: { id: 'main' }, desserts: { id: 'desserts' },
  tasting: { id: 'tasting' }, bar_oysters: { marker: 'bar_oysters' }, bar_dishes: { marker: 'bar_dishes' },
};
const DRINK_SECTIONS = {
  wine_white: { marker: 'wine_white' }, wine_red: { marker: 'wine_red' }, champagne: { id: 'champagne' },
};

const JOBS = [
  { data: foodData,  file: 'food.html',    name: 'en_name', desc: 'en_desc', unit: 'CZK', sections: FOOD_SECTIONS },
  { data: foodData,  file: 'cz/food.html', name: 'cs_name', desc: 'cs_desc', unit: 'Kč',  sections: FOOD_SECTIONS },
  { data: drinkData, file: 'drink.html',   name: 'en_name', desc: 'en_desc', unit: 'CZK', sections: DRINK_SECTIONS },
  { data: drinkData, file: 'cz/drink.html', name: 'cs_name', desc: 'cs_desc', unit: 'Kč',  sections: DRINK_SECTIONS },
];

// escape raw text for HTML (editors type "&" and quotes; we store raw, output entities)
const esc = s => String(s ?? '')
  .replace(/&(?!(?:amp|lt|gt|quot|#\d+);)/g, '&amp;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

function li(item, job) {
  const name = esc(item[job.name]);
  const desc = esc(item[job.desc]);
  const small = desc ? ` <small>${desc}</small>` : '';
  const price = (item.price !== undefined && item.price !== '')
    ? `<span class="price">${esc(item.price)} ${job.unit}</span>` : '';
  return `<li><span class="item">${name}${small}</span>${price}</li>`;
}

function renderInner(items, job, liPad) {
  const closePad = ' '.repeat(liPad.length - 2);
  return '\n' + items.map(it => liPad + li(it, job)).join('\n') + '\n' + closePad;
}

let changed = 0, warnings = 0;
for (const job of JOBS) {
  let html = read(job.file);
  const before = html;

  for (const [key, target] of Object.entries(job.sections)) {
    const items = job.data[key];
    if (!items) { console.warn(`  ! ${job.file}: no data for "${key}"`); warnings++; continue; }

    if (target.id) {
      const re = new RegExp('(<article[^>]*id="' + target.id + '"[^>]*>[\\s\\S]*?<ul class="menu-list"[^>]*>)([\\s\\S]*?)(</ul>)');
      if (!re.test(html)) { console.warn(`  ! ${job.file}: article#${target.id} not found`); warnings++; continue; }
      html = html.replace(re, (_m, open, _inner, close) => open + renderInner(items, job, '          ') + close);
    } else {
      const re = new RegExp('(<!--m:' + target.marker + '-->)([\\s\\S]*?)(<!--/m:' + target.marker + '-->)');
      if (!re.test(html)) { console.warn(`  ! ${job.file}: marker ${target.marker} not found`); warnings++; continue; }
      html = html.replace(re, (_m, open, _inner, close) => open + renderInner(items, job, '              ') + close);
    }
  }

  if (html !== before) { writeFileSync(join(root, job.file), html); changed++; console.log(`  updated ${job.file}`); }
  else console.log(`  unchanged ${job.file}`);
}
console.log(`Done. ${changed} file(s) changed, ${warnings} warning(s).`);

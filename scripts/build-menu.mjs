#!/usr/bin/env node
/**
 * build-menu.mjs — renders menu sections from JSON data into the static HTML.
 * Source of truth: content/menu-food.json, content/menu-drink.json (edited via Decap CMS).
 * Keeps the menu in the static HTML (SEO) while data stays editable. Run: `node scripts/build-menu.mjs`
 *
 * Targeting per section:
 *   { id: 'oysters' }               -> first <ul class="menu-list"> inside <article id="oysters">
 *   { marker: 'bar_dishes' }        -> content between <!--m:bar_dishes--> ... <!--/m:bar_dishes-->
 *   { marker: 'cocktails', kind: 'cocktail' } -> card layout instead of <li> list
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
  cocktails: { marker: 'cocktails', kind: 'cocktail' },
};

const JOBS = [
  { data: foodData,  file: 'food.html',    lang: 'en', unit: 'CZK', sections: FOOD_SECTIONS },
  { data: foodData,  file: 'cz/food.html', lang: 'cs', unit: 'Kč',  sections: FOOD_SECTIONS },
  { data: drinkData, file: 'drink.html',   lang: 'en', unit: 'CZK', sections: DRINK_SECTIONS },
  { data: drinkData, file: 'cz/drink.html', lang: 'cs', unit: 'Kč',  sections: DRINK_SECTIONS },
];

// escape raw text for HTML (editors type "&" and quotes; we store raw, output entities)
const esc = s => String(s ?? '')
  .replace(/&(?!(?:amp|lt|gt|quot|#\d+);)/g, '&amp;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// --- renderers ---
function li(item, job) {
  const name = esc(item[job.lang === 'en' ? 'en_name' : 'cs_name']);
  const desc = esc(item[job.lang === 'en' ? 'en_desc' : 'cs_desc']);
  const small = desc ? ` <small>${desc}</small>` : '';
  const price = (item.price !== undefined && item.price !== '')
    ? `<span class="price">${esc(item.price)} ${job.unit}</span>` : '';
  return `<li><span class="item">${name}${small}</span>${price}</li>`;
}
function renderItems(items, job, liPad) {
  const closePad = ' '.repeat(liPad.length - 2);
  return '\n' + items.map(it => liPad + li(it, job)).join('\n') + '\n' + closePad;
}

function card(item, job) {
  const style = esc(item[job.lang === 'en' ? 'style_en' : 'style_cs']);
  const name = esc(item.name);
  const ing = esc(item[job.lang === 'en' ? 'ing_en' : 'ing_cs']);
  const price = (item.price !== undefined && item.price !== '')
    ? `\n            <p class="card__price">${esc(item.price)} ${job.unit}</p>` : '';
  return `          <div class="card">
            <span class="card__no">${style}</span>
            <h3 class="card__title">${name}</h3>
            <p class="card__body">${ing}</p>${price}
          </div>`;
}
function renderCards(items, job) {
  return '\n' + items.map(c => card(c, job)).join('\n');
}

let changed = 0, warnings = 0;
for (const job of JOBS) {
  let html = read(job.file);
  const before = html;

  for (const [key, target] of Object.entries(job.sections)) {
    const items = job.data[key];
    if (!items) { console.warn(`  ! ${job.file}: no data for "${key}"`); warnings++; continue; }
    const render = target.kind === 'cocktail'
      ? () => renderCards(items, job)
      : (pad) => renderItems(items, job, pad);

    if (target.id) {
      const re = new RegExp('(<article[^>]*id="' + target.id + '"[^>]*>[\\s\\S]*?<ul class="menu-list"[^>]*>)([\\s\\S]*?)(</ul>)');
      if (!re.test(html)) { console.warn(`  ! ${job.file}: article#${target.id} not found`); warnings++; continue; }
      html = html.replace(re, (_m, open, _i, close) => open + render('          ') + close);
    } else {
      const re = new RegExp('(<!--m:' + target.marker + '-->)([\\s\\S]*?)(<!--/m:' + target.marker + '-->)');
      if (!re.test(html)) { console.warn(`  ! ${job.file}: marker ${target.marker} not found`); warnings++; continue; }
      html = html.replace(re, (_m, open, _i, close) => open + render('              ') + close);
    }
  }

  if (html !== before) { writeFileSync(join(root, job.file), html); changed++; console.log(`  updated ${job.file}`); }
  else console.log(`  unchanged ${job.file}`);
}
console.log(`Done. ${changed} file(s) changed, ${warnings} warning(s).`);

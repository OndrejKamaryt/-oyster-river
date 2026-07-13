# Oyster & River — kompletní web

Statický web pro ústřicový bar **Oyster & River** (Praha). Šest stránek,
jeden vizuální jazyk, soběstačný balíček.

- **Homepage** (index.html) — interaktivní konstelace nad dark hero,
  pak poetické sekce (koncept převzatý z [Champagne La Closerie](https://champagnelacloserie.fr/en/))
- **Ostatní stránky** — design, fonty a obsah převzaty z původního
  [oyster-and-river.netlify.app](https://oyster-and-river.netlify.app/)

Všechny stránky sdílejí stejný vizuální jazyk: krémové pozadí #f2e4d8,
**Libre Caslon Display** + **EB Garamond**, charcoal text, burgundy akcenty.
Sjednocený topbar a tmavá patička. Konstelace zůstává unikátem homepage,
ale teď zapadá do brandu.

## Struktura

```
oyster-river/
├── index.html             Homepage — konstelace nad dark hero + 5 poetických sekcí
├── menu.html              Karta — Kitchen + Classic Oyster Menu
├── o-nas.html             Příběh + Executive Chef David Vlášek
├── galerie.html           Mřížka 11 fotek z původního webu
├── kontakt.html           Adresa, kontakt, otev. doba, mapa
├── rezervace.html         Formulář žádosti o rezervaci
│
├── site.css               Sdílený stylesheet (EB Garamond + Libre Caslon)
├── script.js              Konstelace, mobilní menu, fade-in, formuláře
│
├── oyster_logo.svg        Logo (z původního webu)
├── facebook.svg           Ikonka FB
├── instagram.svg          Ikonka IG
└── images/
    ├── about.jpg, about_chef.jpg, about_stock.jpg, about_stock2.jpg
    ├── menu_hero.jpg, menu_parallax.jpg
    ├── contact_hero.jpg, oyster_hero.webp, map.png
    └── gallery/
        ├── gallery_hero.jpg
        └── gallery_01–05, 07–12.jpg   (11 fotek, číslo 6 chybí už v originálu)
```

## Nasazení na Netlify

**Rychlá cesta** (drag & drop):
1. Stáhni `oyster-river.zip` a rozbal lokálně.
2. V Netlify: **Sites → Add new site → Deploy manually**.
3. Přetáhni složku `oyster-river/` do okna prohlížeče.
4. Hotovo, Netlify ti vrátí URL.

**Cesta přes Git**: pushni složku do repo, Netlify si ji vytáhne automaticky.
Žádný build step, žádný `package.json`.

## Co budeš chtít doplnit / vyměnit

### Funkční formuláře
Momentálně oba formuláře (rezervace, kontakt) jen zobrazí potvrzovací hlášku.
Pro skutečné odesílání: na `<form>` tag přidej atributy
`name="rezervace" netlify` (nebo `name="kontakt"`) — Netlify Forms se postarají
o zbytek. Detaily: <https://docs.netlify.com/forms/setup/>

### Skutečná Google mapa
V `kontakt.html` je teď statický `images/map.png`. Pro interaktivní mapu
ho vyměň za `<iframe>` z [Google Maps Embed](https://www.google.com/maps).

### EN verze
Odkaz `EN` v navigaci momentálně směřuje na `#`. Buď ho skryj,
nebo doplň anglickou variantu jednotlivých stránek.

## Designové poznámky

### Jednotný jazyk
- **Fonty**: Libre Caslon Display (display) + EB Garamond (body) — z Google Fonts.
- **Pozadí**: krémové `#f2e4d8`, text charcoal `#2c3136`.
- **Akcent**: burgundy `#7a3f3a` (ceny v menu, role šéfa, popisky kontaktu).
- **Topbar**: nad každým hero, s cream barvou textu, hover podtržení.
- **Patička**: gradient earth-dark → charcoal, brand + adresa + kontakt + social.

### Hero pattern
Každá stránka má fotografické pozadí s tmavým overlay, centrovaný titulek
v Libre Caslon Display a kurzívní podtitulek v EB Garamond.

### Homepage specifika
- **Konstelace**: SVG s pěti hvězdami nad ústřední lasturou v hero sekci,
  v cream/warm-gray barvách nad fotkou. Hover roztáhne písmo (18 → 22 px),
  zhoustne čára a rozsvítí kruh. Klik plynule scrolluje na sekci.
- **Poetické sekce**: pět sekcí (Mořský dech, Pramen, Úlovek, Stůl, Klíče),
  každá s vlastní čárovou SVG ilustrací, krátkou básní a citátem.
  Sekce jsou střídavě na krémovém a jemně modrošedém pozadí.
- **Parallax CTA**: mezi sekcí Úlovek a Stůl, "Seafood crafted with precision"
  s odkazem na menu.

## Lokální náhled

```bash
cd oyster-river
python3 -m http.server 8000
# → http://localhost:8000
```

Funguje i bez serveru — otevři `index.html` přímo v prohlížeči
(jen některé prohlížeče blokují IntersectionObserver pro `file://`,
takže fade-in nemusí naskočit, jinak vše OK).

## Velikost balíčku

- HTML + CSS + JS: ~50 kB
- SVG ikonky: ~106 kB (logo je největší — 100 kB)
- Obrázky: ~11 MB (oysters_hero, menu_hero a contact_hero jsou těžké, ~2 MB každý)

Pro produkci doporučuji projet obrázky přes [Squoosh](https://squoosh.app/)
nebo `imagemagick` — současné soubory pocházejí z původního Netlify webu
v plné velikosti, dají se zmenšit na cca polovinu beze ztráty kvality.

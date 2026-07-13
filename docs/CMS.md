# River & Oyster — Decap CMS

Menu je řízené **daty**: jediný zdroj pravdy je `content/menu-food.json`.
Skript `scripts/build-menu.mjs` z něj vygeneruje HTML do `food.html` a `cz/food.html`
(sekce Ústřice / Malá jídla / Velká jídla / Dezerty), dvojjazyčně. Ceny píšeš jen
číslem — na webu se zobrazí jako `225 CZK` (EN) a `225 Kč` (CZ).

Rozsah pilotu: **Food à la carte**. Bar menu, degustace a nápoje se přidají stejně
(další sekce do `menu-food.json` + `SECTIONS` v build skriptu, případně další JSON).

---

## Vyzkoušet lokálně (bez GitHubu, bez loginu)

```bash
# 1) server webu
python serve.py 5173
# 2) v druhém terminálu — Decap local backend proxy
npx decap-server
# 3) otevři http://localhost:5173/admin/  → „Přihlásit“ (jen vstup) → Menu → Jídlo
# 4) po úpravě přegeneruj stránky:
node scripts/build-menu.mjs
```

Editace v `/admin` zapisuje rovnou do `content/menu-food.json`. Build pak promítne
změnu do obou jazykových stránek.

---

## Nasazení naostro (co je potřeba udělat na účtech)

Decap commituje změny do gitu → Netlify přebuildí a nasadí. Kroky, které nejsou
v kódu:

1. **Web do GitHub repa** — založit repo a nahrát tuto složku (`.gitignore` už
   vylučuje `node_modules` a `.netlify`).
2. **Netlify napojit na repo** — v Netlify: *Add new site → Import from Git → vybrat repo.*
   Build command a publish už jsou v `netlify.toml`
   (`command = "node scripts/build-menu.mjs"`, `publish = "."`). Nahradí to
   dosavadní CLI deploye.
3. **Autentizace editorů** — buď Netlify Identity + Git Gateway (zapnout v
   *Site settings → Identity*, přidat pozvané uživatele), nebo GitHub OAuth.
   `admin/config.yml` je nastavený na `git-gateway`.

Pak `local_backend: true` v `admin/config.yml` odstraň (nebo nech — ignoruje se mimo
localhost) a `/admin` na živém webu funguje s loginem.

---

## Soubory

| Soubor | Účel |
|---|---|
| `content/menu-food.json` | data menu (zdroj pravdy) |
| `scripts/build-menu.mjs` | generuje menu HTML z JSON |
| `admin/config.yml` | konfigurace Decapu (kolekce, pole) |
| `admin/index.html` | načte Decap z CDN |
| `netlify.toml` | build command pro Netlify |

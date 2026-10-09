# Toasts Generator

A single-page web app that generates toasts for parties and other occasions.
Built with vanilla HTML/CSS/JS — no build step, no dependencies.

- Runs locally on Mac/PC (one command, see below)
- Opens on any smartphone browser over the network, no installation
- Live on GitHub Pages: <https://jfletch79.github.io/toasts/> — opens on any phone, no server needed

## Run locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

On a phone (same Wi-Fi/LAN), open `http://<your-computer-ip>:8000` —
find your IP with `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows).

## Requirements

There are **no package-level dependencies** — no `package.json`, no npm packages,
no build tools, nothing to install. The whole app is five plain files:

| File | Role |
| --- | --- |
| `index.html` | The single page (markup) |
| `style.css` | All styling, including every theme (Phase 6) |
| `app.js` | All logic: generator, browse, favorites, themes, copy |
| `data/toasts.json` | The toast database (the only data file) |
| `.gitignore` | Excludes source material from the repo |

To run or rebuild it locally you need only:

1. **A modern browser** (anything from the last ~5 years; ES2017+ features used).
2. **Any static file server** to serve this folder — the app loads its data with
   `fetch()`, which does not work from `file://`, so it must be served over HTTP.
   The only documented tool is Python 3's built-in server (no `pip install` —
   `http.server` ships with Python 3): `python3 -m http.server 8000`.
   Any other static server works equally well (e.g. `npx serve`, Caddy, Nginx),
   as long as `index.html` and `data/toasts.json` keep their relative paths.

That's the entire dependency list. The in-app error screen shows the same guidance
if the data file can't be loaded.

## Data

All toasts live in [`data/toasts.json`](data/toasts.json) — a flat JSON array.
Each entry:

| Field      | Description                                                        |
| ---------- | ------------------------------------------------------------------ |
| `id`       | Stable unique number                                                |
| `type`     | `"toast"` (a full toast) or `"phrase"` (a "cheers" word)            |
| `text`     | Cleaned toast text; `\n` marks line breaks. For phrases, the phonetic (English-letter) pronunciation |
| `native`   | Optional — for phrases: the traditional spelling in the native script/characters |
| `category` | Slug: `drinking`, `wedding`, `birthday`, `babies`, `anniversary`, `friendship`, `romance`, `overnight-guests`, `everyday`, `luck` (incl. St. Patrick's Day & Ireland), `holidays`, `celebrity`, `foreign-language`, `global` |
| `tags`     | Optional, e.g. `["irish"]` for Irish-language toasts                |
| `author`   | Attribution when known, otherwise `null`                            |
| `adult`    | `true` for toasts with adult-themed language (hidden behind the UI toggle) |
| `notes`    | Optional: origin stories, translations, source citations, or (for phrases) the country; “(verify)” marks spellings to double-check |

Display names for category slugs live in `app.js`, keeping the data file lean.
Some `notes` values carry toasting-etiquette tips (e.g. Korea: never pour your own
drink — always fill others' glasses; Italy: never toast with water).

## Generator

"Raise another glass" picks **at random** from the current pool (occasion + 18+ toggle)
— toasts may repeat. There is no no-repeat queue.

## Favorites (Phase 8)

- A **♥ Favorite** button on the generated toast (replaces the old Share button),
  plus a heart toggle on every item in Browse.
- A third **Favorites ❤️** tab shows your saved toasts (searchable, and filtered by
  the current occasion + 18+ settings).
- Favorites are stored **per device** in browser `localStorage` (key
  `toasts-favorites`) as a list of toast ids. A static site can't write back to
  `data/toasts.json`, so favorites don't sync across devices or browsers — and a
  dataset renumber can shift what a stored id points at (see Architecture).

## Live version (Phase 7)

Hosted on GitHub Pages: **<https://jfletch79.github.io/toasts/>**

The site is deployed from the [`jfletch79/toasts`](https://github.com/jfletch79/toasts) repo
(branch `main`, root path) via the GitHub web UI — no git or token needed:

1. **Small edits** — open the file in the repo, click the ✏️ edit button, commit.
2. **Replace a whole file** (e.g. an updated `data/toasts.json`) —
   **Add file → Upload files**, drop the replacement, commit.

The live site updates about a minute after each commit. Source material files
(`toasts.md`, `toasts.docx`, `Top 10 Toasts.*`) are intentionally not in the repo.

## Contact

Maintainer: `jfletch79` — contact via GitHub noreply email:
`176612627+jfletch79@users.noreply.github.com`

## Architecture

Decisions and constraints behind the design (why it is built this way):

- **No framework, no build step (by design).** The app is vanilla HTML/CSS/JS so
  it can be opened anywhere a static file can be hosted — locally, on a LAN, or on
  GitHub Pages — with zero tooling. There is deliberately nothing to `install`,
  `compile`, or `bundle`.
- **All paths are relative** (`style.css`, `app.js`, `data/toasts.json`). No
  absolute paths and no `<base>` tag, so the app works unchanged under any URL
  subpath (which is why the GitHub Pages subpath URL needed no code changes).
- **`data/toasts.json` is the single source of truth for content**, but
  category *display names and order* live in `app.js`
  (`CATEGORY_NAMES` / `CATEGORY_ORDER`) so the data file stays pure content.
- **`id` is an internal key only.** It is kept sequential (1..N) and renumbered
  whenever the dataset is edited. Nothing external should depend on a specific id
  — note that favorites (see below) are stored by id, so a dataset renumber can
  shift which toast a saved favorite points at.
- **Phrases ("cheers" words)** use `text` for the phonetic English-letter
  pronunciation and `native` for the traditional spelling; the card displays
  `native` large with `text` as the phonetic line, and `notes` carries the
  language/country, translation, and etiquette tips.
- **Adult content is kept as-is and gated, never edited out.** Entries with
  adult-themed language retain their original text and are only hidden behind
  the 18+ UI toggle (`adult: true`).
- **Generation is purely random** from the pool filtered by occasion + 18+ toggle;
  repeats are allowed (the earlier no-repeat shuffle queue was removed).
- **Themes are pure CSS**: every theme is a CSS custom-property set in
  [style.css](style.css) under `html[data-theme="…"]`; the JS only toggles the
  attribute. Choice persists in `localStorage` (`toasts-skin`), "Auto" follows
  the selected occasion.
- **Favorites are per-device by necessity.** A static site cannot write back to
  `data/toasts.json`, so favorites are a list of ids in `localStorage`
  (`toasts-favorites`) and don't sync across devices or browsers.
- **Copy uses the async Clipboard API** with a legacy `execCommand` fallback for
  non-secure contexts (e.g. `http://192.168.x.x` on a phone), where the modern
  API is unavailable. (The Web Share button was removed in Phase 8 when the
  Favorites button replaced it.)

## Themes (Phase 6)

Every occasion has its own theme — a full color palette plus a faint emoji
watermark on the toast card (Wedding 💍, Birthday 🎂, Babies 🍼, Romance ❤️,
Overnight Guests 🌙, Celebrity ✨, and so on; Drinking is a dark pub theme 🍻).
Themes are CSS custom-property sets applied via `html[data-theme="…"]` in
[style.css](style.css). The header picker offers **Auto — match occasion**
(default — the app re-skins as you change occasions), any category theme, or the
Classic default; the choice persists in `localStorage`.

## Roadmap

- [x] **Phase 6** — Theme picker: one theme per category, "Auto" follows the occasion (saved in the browser)
- [x] **Phase 7** — GitHub Pages deployment: <https://jfletch79.github.io/toasts/> (redeploy via the GitHub web UI, see above)
- [x] **Phase 8** — Favorites: heart button (replaces Share), Favorites tab, per-device `localStorage` storage; generator is now purely random (repeats allowed)
- [x] Verify the **45 flagged entries** in [verify-list.md](verify-list.md) (27 edited, 4 expanded with new translations, 14 removed as garbled or duplicative — Oct 2026)
- [ ] Verify questionable author attributions from the original source (e.g. "Rudyard Wheatley", "Lord Neaves")

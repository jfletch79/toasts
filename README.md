# Toasts Generator

A single-page web app that generates toasts for parties and other occasions.
Built with vanilla HTML/CSS/JS — no build step, no dependencies.

- Runs locally on Mac/PC (one command, see below)
- Opens on any smartphone browser over the network, no installation
- Later: deployable to any static host (see Phase 7)

## Run locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

On a phone (same Wi-Fi/LAN), open `http://<your-computer-ip>:8000` —
find your IP with `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows).

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

## Contact

Maintainer: `jfletch79` — contact via GitHub noreply email:
`176612627+jfletch79@users.noreply.github.com`

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
- [ ] **Phase 7** — GitHub Pages deployment (so it works on the phone without a local server)
- [ ] Verify questionable author attributions (kept as-is from the source for now — e.g. "Rudyard Wheatley", "Lord Neaves"; also check the garbled global phrases for India ("Aancllld") and Tagalog ("Mubuhcly"))

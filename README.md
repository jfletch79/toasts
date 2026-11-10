# Toast Database — Session Notes (2026-11-09)

## The database

`toasts.json` — a JSON array of toast entries. Majority schema per entry:

- `id` (int, unique), `type` ("toast" | "phrase"), `text`, `category`, `author` (null or name), `adult` (bool), `notes` (source/attribution info)
- Some older entries carry extra keys (`tags`, `native`) or omit `notes` — pre-existing inconsistency, left untouched.
- Categories: drinking, global, wedding, everyday, birthday, friendship, foreign-language, anniversary, romance, luck, celebrity, holidays, overnight-guests, babies. ("global" entries are phonetic cheer-phrases, type "phrase".)

## Changes made this session

Growth: **497 → 723 entries** (ids 1–734 with 11 gaps; unique).

1. **Round 1: +64 toasts (ids 498–561)** — sourced from rd.com "100 Best Toasts" (bylined Charlotte Hilton Andersen) and listcaboodle.com wedding/drinking lists. Deduped (exact + fuzzy >0.80) against the existing 497.
2. **Attribution review** — researched the 38 RD-sourced entries; aggregator attributions recorded in the author field for id 504 (Dixie Willson), id 523 (Alfred D. Souza), id 529 (John W. Stephens). All RD notes now record the byline and publication date.
3. **Round 2: +52 toasts (ids 562–613)** — famous historical toasts with named authors (Churchill, Oppenheimer, Shakespeare, Twain, etc.) from listcaboodle "100+ Famous Toasts" and thewritegreeting.com.
4. **Round 3: +121 attributed quotes (ids 614–734)** — every entry has a named author (92 distinct authors); sources are en.wikiquote.org (Wine, Beer, Friendship, Love, Birthday, Wedding pages) and remaining attributed ListCaboodle famous toasts.
5. **Recategorization** — 31 of 44 "celebrity" entries moved to topic categories (drinking, wedding, friendship, romance, luck, holidays, birthday, everyday); 13 historical/political/aphorism entries remain in celebrity.
7. **Deletions** — ids 6, 172, 316, 364, 675, 683, 703, 724 removed per user review of inappropriate_toasts_report.md (734 → 726). Also removed 309/123/484 during spelling review (de-dup and normalize): 726 → 723.
6. **Cleanup pass** — full-database scan (37 flagged): stripped leading junk (`)`, `:`, `*`, wrapped quotes), fixed spacing/punctuation artifacts, split combined author+source fields (e.g. "Charles Dickens, Nicholas Nickleby"), and demoted non-person authors ("Prohibition toast", "French proverb", …) to the notes field. Intentional ellipsis style was preserved.

## Files

- `toasts.json` — the database (723 entries)
- `toasts_added_report.md` — full report of every added entry by round, with ids, categories, sources, and dropped-as-duplicate lists
- `added_toasts.json`, `added_toasts_r2.json`, `added_toasts_r3.json` — copies of just the additions per round
- `new_toasts.json`, `new_toasts_r2.json` — staging files (candidates pre-dedup)
- `existing_texts.txt` — normalized text dump used for dedup

## Undo / review

- Undo round 1: remove ids 498–561; round 2: 562–613; round 3: 614–734.
- All additions are reproducible from the `added_toasts*` files.
- Round 3 selection was semi-automated (quality filters + per-author quotas) — review flags welcome; quote-aggregator attributions are recorded in notes where evidence is weaker.

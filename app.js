'use strict';

// ---- Category display names & order ---------------------------------------
const CATEGORY_NAMES = {
  'all': 'Any occasion',
  'wedding': 'Weddings',
  'birthday': 'Birthdays',
  'babies': 'Babies & New Parents',
  'anniversary': 'Anniversaries',
  'friendship': 'Friendship',
  'romance': 'Romance',
  'overnight-guests': 'Overnight Guests',
  'everyday': 'Everyday',
  'drinking': 'Drinking',
  'celebrity': 'Celebrity',
  'luck': "Luck & St. Patrick's Day",
  'holidays': 'Holidays',
  'foreign-language': 'Foreign Languages',
  'global': 'Global Cheers'
};

const CATEGORY_ORDER = [
  'all', 'wedding', 'birthday', 'babies', 'anniversary', 'friendship',
  'romance', 'overnight-guests', 'everyday', 'drinking', 'celebrity',
  'luck', 'holidays', 'foreign-language', 'global'
];

// ---- DOM -------------------------------------------------------------------
const $ = (sel) => document.querySelector(sel);

const els = {
  category: $('#category-select'),
  adult: $('#adult-toggle'),
  tabGenerate: $('#tab-generate'),
  tabBrowse: $('#tab-browse'),
  tabFavorites: $('#tab-favorites'),
  viewGenerate: $('#view-generate'),
  viewBrowse: $('#view-browse'),
  card: $('#toast-card'),
  toastText: $('#toast-text'),
  toastPhonetic: $('#toast-phonetic'),
  toastAuthor: $('#toast-author'),
  toastNotes: $('#toast-notes'),
  btnNext: $('#btn-next'),
  btnCopy: $('#btn-copy'),
  btnFav: $('#btn-fav'),
  search: $('#search'),
  resultCount: $('#result-count'),
  list: $('#toast-list'),
  footer: $('#footer'),
  loadError: $('#load-error'),
  themeSelect: $('#theme-select')
};

// ---- State -----------------------------------------------------------------
const state = { category: 'all', adult: false, mode: 'generate' };
let allToasts = [];
let current = null; // toast currently shown in generate view
const FAV_KEY = 'toasts-favorites'; // must be declared before the let below runs
let favorites = loadFavorites(); // Set of favorite toast ids (Phase 8)

// ---- Helpers ---------------------------------------------------------------

// Toasts visible under the current occasion + 18+ settings.
function pool() {
  return allToasts.filter(
    (t) =>
      (state.category === 'all' || t.category === state.category) &&
      (!t.adult || state.adult)
  );
}

function toastToShareText(t) {
  if (t.type === 'phrase') {
    const body = t.native ? `${t.native} ("${t.text}")` : t.text;
    return t.notes ? `${body} — ${t.notes}` : body;
  }
  return t.author ? `${t.text}\n\n— ${t.author}` : t.text;
}

// ---- Generate mode ---------------------------------------------------------
// Purely random — toasts may repeat.
function nextToast() {
  const p = pool();
  current = p.length ? p[Math.floor(Math.random() * p.length)] : null;
  renderCard();
}

// ---- Favorites (Phase 8) ---------------------------------------------------
function loadFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw : []);
  } catch (_) {
    return new Set();
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify([...favorites]));
  } catch (_) {
    /* storage unavailable (private mode, file://) — ignore */
  }
}

function toggleFavorite(t) {
  if (favorites.has(t.id)) favorites.delete(t.id);
  else favorites.add(t.id);
  saveFavorites();
}

function updateFavButton() {
  const on = !!(current && favorites.has(current.id));
  els.btnFav.textContent = on ? '♥ Favorited' : '♡ Favorite';
  els.btnFav.classList.toggle('fav-active', on);
  els.btnFav.setAttribute('aria-pressed', String(on));
  els.btnFav.disabled = !current;
}

function renderCard() {
  // Re-trigger the card entrance animation.
  els.card.style.animation = 'none';
  void els.card.offsetWidth;
  els.card.style.animation = '';

  if (!current) {
    els.card.classList.remove('phrase');
    els.toastText.textContent =
      'No toasts in this pool.\nTry another occasion, or turn on the Adult (18+) toggle.';
    els.toastAuthor.textContent = '';
    els.toastPhonetic.textContent = '';
    els.toastNotes.textContent = '';
    els.btnNext.disabled = true;
    els.btnCopy.disabled = true;
    updateFavButton();
    return;
  }

  const t = current;
  els.card.classList.toggle('phrase', t.type === 'phrase');
  const phraseNative = t.type === 'phrase' && t.native;
  els.toastText.textContent = phraseNative ? t.native : t.text;
  els.toastPhonetic.textContent = phraseNative ? t.text : '';
  els.toastAuthor.textContent = t.author ? '— ' + t.author : '';
  els.toastNotes.textContent = t.notes || '';
  els.btnNext.disabled = false;
  els.btnCopy.disabled = false;
  updateFavButton();
}

// ---- Copy & share ----------------------------------------------------------
function flashButton(btn, label) {
  if (!btn.dataset.originalLabel) btn.dataset.originalLabel = btn.textContent;
  btn.textContent = label;
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = btn.dataset.originalLabel;
    btn.disabled = false;
  }, 1300);
}

// Fallback for non-secure contexts (e.g. http://192.168.x.x on a phone),
// where the async Clipboard API is unavailable.
function legacyCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (_) {
    ok = false;
  }
  ta.remove();
  return ok;
}

async function copyText(text, btn) {
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch (_) {
    ok = legacyCopy(text);
  }
  flashButton(btn, ok ? 'Copied!' : 'Copy failed');
}

// ---- Browse mode -----------------------------------------------------------
function renderBrowse() {
  const q = els.search.value.trim().toLowerCase();
  const favOnly = state.mode === 'favorites';
  const items = pool().filter((t) => {
    if (favOnly && !favorites.has(t.id)) return false;
    if (!q) return true;
    const hay = [t.text, t.author, t.notes, CATEGORY_NAMES[t.category]]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });

  const scope = state.category === 'all' ? '' : ` · ${CATEGORY_NAMES[state.category]}`;
  const word = favOnly ? 'favorite' : 'toast';
  els.resultCount.textContent = `${items.length} ${items.length === 1 ? word : word + 's'}${scope}`;

  els.list.innerHTML = '';
  for (const t of items) {
    const card = document.createElement('article');
    card.className = 'toast-item' + (t.type === 'phrase' ? ' phrase' : '');

    const phraseNative = t.type === 'phrase' && t.native;
    const text = document.createElement('p');
    text.className = 'item-text';
    text.textContent = phraseNative ? t.native : t.text;
    card.appendChild(text);

    const metaBits = [];
    if (phraseNative) metaBits.push(t.text);
    if (t.type === 'phrase' && t.notes) metaBits.push(t.notes);
    if (t.author) metaBits.push(t.author);
    if (t.adult) metaBits.push('18+');
    if (metaBits.length) {
      const meta = document.createElement('p');
      meta.className = 'item-meta';
      meta.textContent = metaBits.join('  ·  ');
      card.appendChild(meta);
    }

    const favBtn = document.createElement('button');
    favBtn.className = 'btn small' + (favorites.has(t.id) ? ' fav-active' : '');
    favBtn.textContent = favorites.has(t.id) ? '♥' : '♡';
    favBtn.title = 'Toggle favorite';
    favBtn.setAttribute('aria-pressed', String(favorites.has(t.id)));
    favBtn.addEventListener('click', () => {
      toggleFavorite(t);
      renderBrowse();
    });
    card.appendChild(favBtn);

    const btn = document.createElement('button');
    btn.className = 'btn small';
    btn.textContent = 'Copy';
    btn.addEventListener('click', () => copyText(toastToShareText(t), btn));
    card.appendChild(btn);

    els.list.appendChild(card);
  }
}

// ---- Themes (Phase 6) ---------------------------------------------------------
const THEMES = [
  { key: 'classic', name: 'Classic' },
  { key: 'wedding', name: 'Wedding' },
  { key: 'birthday', name: 'Birthday' },
  { key: 'babies', name: 'Babies' },
  { key: 'anniversary', name: 'Anniversary' },
  { key: 'friendship', name: 'Friendship' },
  { key: 'romance', name: 'Romance' },
  { key: 'overnight-guests', name: 'Overnight Guests' },
  { key: 'everyday', name: 'Everyday' },
  { key: 'drinking', name: 'Drinking' },
  { key: 'celebrity', name: 'Celebrity' },
  { key: 'luck', name: "Luck & St. Patrick's" },
  { key: 'holidays', name: 'Holidays' },
  { key: 'foreign-language', name: 'Foreign Languages' },
  { key: 'global', name: 'Global Cheers' }
];

const SKIN_KEY = 'toasts-skin';
let skin = loadSkin();

function loadSkin() {
  try {
    return localStorage.getItem(SKIN_KEY) || 'auto';
  } catch (_) {
    return 'auto';
  }
}

function saveSkin() {
  try {
    localStorage.setItem(SKIN_KEY, skin);
  } catch (_) {
    /* storage unavailable (private mode, file://) — ignore */
  }
}

function activeThemeKey() {
  if (skin !== 'auto') return skin;
  return state.category === 'all' ? 'classic' : state.category;
}

function applyTheme() {
  const key = activeThemeKey();
  if (key === 'classic') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = key;
}

function populateThemeSelect() {
  const auto = document.createElement('option');
  auto.value = 'auto';
  auto.textContent = 'Auto — match occasion';
  els.themeSelect.appendChild(auto);
  for (const t of THEMES) {
    const opt = document.createElement('option');
    opt.value = t.key;
    opt.textContent = t.name;
    els.themeSelect.appendChild(opt);
  }
  els.themeSelect.value = skin;
  if (!els.themeSelect.value) {
    skin = 'auto';
    els.themeSelect.value = 'auto';
  }
}

// ---- Mode switching ---------------------------------------------------------
function setMode(mode) {
  state.mode = mode;
  const isGen = mode === 'generate';
  els.tabGenerate.classList.toggle('active', isGen);
  els.tabBrowse.classList.toggle('active', mode === 'browse');
  els.tabFavorites.classList.toggle('active', mode === 'favorites');
  els.tabGenerate.setAttribute('aria-selected', String(isGen));
  els.tabBrowse.setAttribute('aria-selected', String(mode === 'browse'));
  els.tabFavorites.setAttribute('aria-selected', String(mode === 'favorites'));
  els.viewGenerate.classList.toggle('hidden', !isGen);
  els.viewBrowse.classList.toggle('hidden', isGen);
  if (!isGen) renderBrowse();
}

// ---- Init -------------------------------------------------------------------
function populateCategories() {
  for (const key of CATEGORY_ORDER) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = CATEGORY_NAMES[key];
    els.category.appendChild(opt);
  }
}

function onPoolChange() {
  state.category = els.category.value;
  state.adult = els.adult.checked;
  applyTheme(); // occasion themes follow the selected category
  if (state.mode === 'generate') nextToast();
  else renderBrowse();
}

async function init() {
  populateCategories();

  els.tabGenerate.addEventListener('click', () => setMode('generate'));
  els.tabBrowse.addEventListener('click', () => setMode('browse'));
  els.tabFavorites.addEventListener('click', () => setMode('favorites'));
  els.category.addEventListener('change', onPoolChange);
  els.adult.addEventListener('change', onPoolChange);
  els.search.addEventListener('input', renderBrowse);
  els.btnNext.addEventListener('click', nextToast);
  els.btnCopy.addEventListener('click', () => {
    if (current) copyText(toastToShareText(current), els.btnCopy);
  });
  els.btnFav.addEventListener('click', () => {
    if (!current) return;
    toggleFavorite(current);
    updateFavButton();
  });
  els.themeSelect.addEventListener('change', () => {
    skin = els.themeSelect.value;
    saveSkin();
    applyTheme();
  });

  try {
    const res = await fetch('data/toasts.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allToasts = await res.json();
  } catch (err) {
    els.loadError.classList.remove('hidden');
    document.querySelector('main').classList.add('hidden');
    return;
  }

  const adultCount = allToasts.filter((t) => t.adult).length;
  els.footer.textContent = `${allToasts.length} toasts & cheers · ${adultCount} marked 18+ · vanilla HTML, CSS & JS`;

  populateThemeSelect();
  applyTheme();
  nextToast();
}

init();

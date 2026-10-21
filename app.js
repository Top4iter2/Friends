// ============ Состояние приложения ============
const state = {
  movies: [],
  filter: 'all',
  editingId: null,
  draftStatus: 'watch',
  draftRating: 0,
};

// ============ Утилиты ============
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const escapeHTML = (str) =>
  str.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

function makeId() {
  try { return crypto.randomUUID(); }
  catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
}

// Детерминированный градиент из названия — у каждого фильма свой цвет "постера"
function posterGradient(title) {
  let h = 0;
  for (let i = 0; i < title.length; i++) {
    h = (h << 5) - h + title.charCodeAt(i);
    h |= 0;
  }
  h = Math.abs(h);
  const hue1 = h % 360;
  const hue2 = (hue1 + 30 + (h >> 8) % 60) % 360;
  return `linear-gradient(155deg, hsl(${hue1} 62% 48%) 0%, hsl(${hue2} 68% 28%) 100%)`;
}

// ============ Рендер ============
function render() {
  const listEl  = $('#list');
  const emptyEl = $('#empty');

  $('#statCount').textContent = state.movies.length;

  if (state.movies.length === 0) {
    listEl.innerHTML = '';
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;

  const filtered = state.movies.filter((m) =>
    state.filter === 'all' ? true : m.status === state.filter
  );

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="list-empty">В этой категории пока пусто</div>`;
    return;
  }

  listEl.innerHTML = filtered.map(movieCardHTML).join('');
  bindCardEvents();
}

function movieCardHTML(movie, index) {
  const initial   = (movie.title.trim().charAt(0) || '?').toUpperCase();
  const isWatched = movie.status === 'watched';
  const gradient  = posterGradient(movie.title);

  const starsHTML = isWatched
    ? `<div class="stars">${[1, 2, 3, 4, 5].map((i) => starSVG(i, i <= movie.rating)).join('')}</div>`
    : '';

  return `
    <article class="movie-card" data-id="${movie.id}" style="animation-delay:${index * 40}ms">
      <div class="movie-card__poster" style="background:${gradient}">
        <span>${escapeHTML(initial)}</span>
      </div>
      <div class="movie-card__body">
        <h3 class="movie-card__title">${escapeHTML(movie.title)}</h3>
        <span class="badge badge--${isWatched ? 'watched' : 'watch'}">
          ${isWatched ? 'Смотрено' : 'Хочу посмотреть'}
        </span>
        ${starsHTML}
      </div>
    </article>
  `;
}

// Одна звезда. Если interactive — рендерим как кнопку с data-value.
function starSVG(value, on, interactive = false) {
  const path = `<path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z"
                fill="${on ? 'currentColor' : 'none'}"
                stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>`;
  return `<button type="button" class="star ${on ? 'is-on' : ''}"
            data-value="${value}" ${interactive ? '' : 'aria-hidden="true" tabindex="-1"'}>
            <svg viewBox="0 0 24 24">${path}</svg>
          </button>`;
}

function bindCardEvents() {
  $$('.movie-card').forEach((card) => {
    const id = card.dataset.id;

    // Тап по карточке — редактирование
    card.addEventListener('click', () => {
      const movie = state.movies.find((m) => m.id === id);
      if (movie) openSheet(movie);
    });

    // Тап по звезде — быстрая смена оценки без открытия модалки
    card.querySelectorAll('.stars .star').forEach((star) => {
      star.addEventListener('click', (e) => {
        e.stopPropagation();
        const movie = state.movies.find((m) => m.id === id);
        if (!movie) return;
        movie.rating = Number(star.dataset.value);
        Storage.save(state.movies);
        render();
      });
    });
  });
}

// ============ Bottom sheet ============
function openSheet(movie = null) {
  state.editingId   = movie ? movie.id : null;
  state.draftStatus = movie ? movie.status : 'watch';
  state.draftRating = movie ? movie.rating : 0;

  $('#sheetTitle').textContent = movie ? 'Редактировать' : 'Новый фильм';
  $('#inputTitle').value       = movie ? movie.title : '';
  $('#deleteBtn').hidden       = !movie;

  syncSegmented();
  syncRatingField();
  buildStarsInput();

  $('#backdrop').classList.add('is-open');
  $('#sheet').classList.add('is-open');
  document.body.style.overflow = 'hidden';

  if (!movie) setTimeout(() => $('#inputTitle').focus(), 380);
}

function closeSheet() {
  $('#backdrop').classList.remove('is-open');
  $('#sheet').classList.remove('is-open');
  document.body.style.overflow = '';
  state.editingId = null;
}

function syncSegmented() {
  $$('#statusSegmented .segmented__btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.status === state.draftStatus);
  });
}

function syncRatingField() {
  $('#ratingField').hidden = state.draftStatus !== 'watched';
}

function buildStarsInput() {
  const container = $('#starsInput');
  container.innerHTML = [1, 2, 3, 4, 5]
    .map((i) => starSVG(i, i <= state.draftRating, true))
    .join('');

  container.querySelectorAll('.star').forEach((star) => {
    star.addEventListener('click', () => {
      state.draftRating = Number(star.dataset.value);
      buildStarsInput();
    });
  });
}

// ============ CRUD ============
function handleSubmit(e) {
  e.preventDefault();
  const title = $('#inputTitle').value.trim();
  if (!title) return;

  const rating = state.draftStatus === 'watched' ? state.draftRating : 0;

  if (state.editingId) {
    const movie = state.movies.find((m) => m.id === state.editingId);
    if (movie) {
      movie.title  = title;
      movie.status = state.draftStatus;
      movie.rating = rating;
    }
  } else {
    state.movies.unshift({
      id: makeId(),
      title,
      status: state.draftStatus,
      rating,
      createdAt: Date.now(),
    });
  }

  Storage.save(state.movies);
  closeSheet();
  render();
}

function handleDelete() {
  if (!state.editingId) return;
  if (!confirm('Удалить фильм из архива?')) return;

  state.movies = state.movies.filter((m) => m.id !== state.editingId);
  Storage.save(state.movies);
  closeSheet();
  render();
}

// ============ Tabs + indicator ============
function moveIndicator(tab) {
  if (!tab) return;
  const indicator = $('#tabIndicator');
  const tabsEl    = $('#tabs');
  const tabRect   = tab.getBoundingClientRect();
  const tabsRect  = tabsEl.getBoundingClientRect();

  indicator.style.width     = `${tabRect.width}px`;
  indicator.style.transform = `translateX(${tabRect.left - tabsRect.left}px)`;
}

function initTabs() {
  const tabs = $$('.tab');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      state.filter = tab.dataset.filter;
      tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
      moveIndicator(tab);
      render();
    });
  });

  // Позиционируем индикатор после загрузки шрифтов (иначе ширина поедет)
  const place = () => moveIndicator($('.tab.is-active'));
  place();
  window.addEventListener('load', place);
  window.addEventListener('resize', place);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(place);
  }
}

// ============ Инициализация ============
function init() {
  state.movies = Storage.load();

  initTabs();
  render();

  $('#fab').addEventListener('click', () => openSheet());
  $('#emptyAddBtn').addEventListener('click', () => openSheet());
  $('#backdrop').addEventListener('click', closeSheet);
  $('#form').addEventListener('submit', handleSubmit);
  $('#deleteBtn').addEventListener('click', handleDelete);

  $$('#statusSegmented .segmented__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.draftStatus = btn.dataset.status;
      syncSegmented();
      syncRatingField();
    });
  });

  // Закрытие по Esc — на десктопе пригодится
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#sheet').classList.contains('is-open')) {
      closeSheet();
    }
  });
}

init();

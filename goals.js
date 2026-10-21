/* =========================================================
   ЦЕЛИ — localStorage
   ========================================================= */
const STORAGE_KEY = 'our-goals-v2';

const DEFAULT_STATE = {
  rodiya: [
    { id: crypto.randomUUID(), text: 'Прочитать 12 книг за год', done: false },
    { id: crypto.randomUUID(), text: 'Начать бегать по утрам',    done: false },
  ],
  me: [
    { id: crypto.randomUUID(), text: 'Выучить английский до B2',  done: false },
    { id: crypto.randomUUID(), text: 'Сделать свой проект',       done: false },
  ],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : structuredClone(DEFAULT_STATE);
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

const state = loadState();

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

function renderList(owner) {
  const list = document.getElementById(`goals-${owner}`);
  if (!list) return;
  list.innerHTML = '';
  state[owner].forEach(goal => {
    const li = document.createElement('li');
    li.className = 'goal' + (goal.done ? ' is-done' : '');
    li.dataset.id = goal.id;
    li.innerHTML = `
      <button class="goal__check" aria-label="Отметить">
        <svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-9"/></svg>
      </button>
      <span class="goal__text">${escapeHtml(goal.text)}</span>
      <button class="goal__delete" aria-label="Удалить">×</button>
    `;
    li.querySelector('.goal__check').addEventListener('click', () => toggleGoal(owner, goal.id));
    li.querySelector('.goal__delete').addEventListener('click', () => deleteGoal(owner, goal.id));
    list.appendChild(li);
  });
}

function toggleGoal(owner, id) {
  const g = state[owner].find(x => x.id === id);
  if (!g) return;
  g.done = !g.done;
  saveState();
  renderList(owner);
  updateStats();
}

function deleteGoal(owner, id) {
  state[owner] = state[owner].filter(x => x.id !== id);
  saveState();
  renderList(owner);
  updateStats();
}

function addGoal(owner, text) {
  state[owner].push({ id: crypto.randomUUID(), text, done: false });
  saveState();
  renderList(owner);
  updateStats();
}

function animateNumber(el, from, to) {
  if (!el) return;
  const dur = 700;
  const t0 = performance.now();
  const ease = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
  const step = now => {
    const t = Math.min(1, (now - t0) / dur);
    el.textContent = Math.round(from + (to - from) * ease(t));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function updateStats() {
  const all = [...state.rodiya, ...state.me];
  const total = all.length;
  const done = all.filter(g => g.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const totalEl = document.getElementById('statTotal');
  const doneEl = document.getElementById('statDone');
  const pctEl = document.getElementById('statPercent');

  if (totalEl) {
    const from = parseInt(totalEl.textContent) || 0;
    animateNumber(totalEl, from, total);
  }
  if (doneEl) {
    const from = parseInt(doneEl.textContent) || 0;
    animateNumber(doneEl, from, done);
  }
  if (pctEl) pctEl.textContent = percent + '%';

  // прогресс по каждой панели
  ['rodiya', 'me'].forEach(owner => {
    const arr = state[owner];
    const t = arr.length;
    const d = arr.filter(g => g.done).length;
    const p = t ? Math.round((d / t) * 100) : 0;

    const bar = document.querySelector(`[data-progress="${owner}"]`);
    const panel = document.querySelector(`.growth__panel:nth-child(${owner === 'rodiya' ? 1 : 2}) .growth__panel-bar span`);
    if (bar) bar.textContent = p + '%';
    if (panel) panel.style.width = p + '%';
  });
}

document.querySelectorAll('.goal-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input');
    const text = input.value.trim();
    if (!text) return;
    addGoal(form.dataset.owner, text);
    input.value = '';
    input.focus();
  });
});

renderList('rodiya');
renderList('me');
updateStats();

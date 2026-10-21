/* =========================================================
   ЦЕЛИ — сохраняются в localStorage
   ========================================================= */
const STORAGE_KEY = 'our-goals-v1';

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const state = loadState();

function renderList(owner) {
  const list = document.getElementById(`goals-${owner}`);
  if (!list) return;
  list.innerHTML = '';
  state[owner].forEach(goal => {
    const li = document.createElement('li');
    li.className = 'goal' + (goal.done ? ' is-done' : '');
    li.dataset.id = goal.id;
    li.innerHTML = `
      <button class="goal__check" aria-label="Отметить">✓</button>
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
  if (g) {
    g.done = !g.done;
    saveState();
    renderList(owner);
    updateStats();
  }
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

function updateStats() {
  const all = [...state.rodiya, ...state.me];
  const total = all.length;
  const done = all.filter(g => g.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const totalEl = document.getElementById('statTotal');
  const doneEl = document.getElementById('statDone');
  const pctEl = document.getElementById('statPercent');
  if (totalEl) totalEl.textContent = total;
  if (doneEl) doneEl.textContent = done;
  if (pctEl) pctEl.textContent = percent + '%';
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

document.querySelectorAll('.goal-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input');
    const text = input.value.trim();
    if (!text) return;
    addGoal(form.dataset.owner, text);
    input.value = '';
  });
});

renderList('rodiya');
renderList('me');
updateStats();

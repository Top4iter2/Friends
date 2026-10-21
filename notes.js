/* =========================================================
   ЗАПИСКИ — localStorage
   ========================================================= */
const NOTES_KEY = 'our-notes-v2';

function loadNotes() {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY)) || []; }
  catch { return []; }
}

function saveNotes(notes) {
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch {}
}

let notes = loadNotes();

const notesGrid = document.getElementById('notesGrid');
const noteForm = document.getElementById('noteForm');

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

function renderNotes() {
  if (!notesGrid) return;
  notesGrid.innerHTML = '';
  if (!notes.length) {
    notesGrid.innerHTML = '<p style="color: var(--text-muted); font-style: italic; padding: 1rem; grid-column: 1/-1;">Пока нет записок. Оставьте первую ♡</p>';
    return;
  }
  [...notes].reverse().forEach((note, i) => {
    const card = document.createElement('article');
    card.className = 'note';
    card.style.animationDelay = `${Math.min(i * 40, 400)}ms`;
    const date = new Date(note.date).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    card.innerHTML = `
      <button class="note__delete" aria-label="Удалить">×</button>
      <p class="note__author">${escapeHtml(note.author)}</p>
      <p class="note__text">${escapeHtml(note.text)}</p>
      <span class="note__date">${date}</span>
    `;
    card.querySelector('.note__delete').addEventListener('click', () => {
      notes = notes.filter(n => n.id !== note.id);
      saveNotes(notes);
      renderNotes();
    });
    notesGrid.appendChild(card);
  });
}

if (noteForm) {
  noteForm.addEventListener('submit', e => {
    e.preventDefault();
    const author = document.getElementById('noteAuthor').value.trim();
    const text = document.getElementById('noteText').value.trim();
    if (!author || !text) return;
    notes.push({
      id: crypto.randomUUID(),
      author, text,
      date: new Date().toISOString(),
    });
    saveNotes(notes);
    renderNotes();
    noteForm.reset();
    document.getElementById('noteAuthor').focus();
  });
}

renderNotes();

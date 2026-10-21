/* =========================================================
   ГЛАВНЫЙ КОНФИГ — меняй тут
   ========================================================= */
const CONFIG = {
  // Дата начала вашей истории (YYYY-MM-DD)
  startDate: '2023-06-15',
};

/* =========================================================
   SCROLL PROGRESS
   ========================================================= */
const progress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  if (progress) progress.style.width = scrolled + '%';
}, { passive: true });

/* =========================================================
   CURSOR GLOW (только на десктопе)
   ========================================================= */
const glow = document.getElementById('cursorGlow');
if (glow) {
  const fine = window.matchMedia('(pointer: fine)').matches;
  if (!fine) {
    glow.style.display = 'none';
  } else {
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let gx = mx, gy = my;
    window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    const animate = () => {
      gx += (mx - gx) * 0.12;
      gy += (my - gy) * 0.12;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animate);
    };
    animate();
  }
}

/* =========================================================
   SMOOTH SCROLL
   ========================================================= */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* =========================================================
   REVEAL ON SCROLL
   ========================================================= */
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal, .section__head, .section__desc').forEach(el => io.observe(el));

/* =========================================================
   СЧЁТЧИК ДНЕЙ ВМЕСТЕ
   ========================================================= */
const daysEl = document.getElementById('daysTogether');
if (daysEl) {
  const start = new Date(CONFIG.startDate);
  const diff = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
  const total = Math.max(0, diff);
  let current = 0;
  const step = Math.max(1, Math.floor(total / 70));
  const tick = () => {
    current += step;
    if (current >= total) {
      current = total;
      clearInterval(timer);
    }
    daysEl.textContent = current.toLocaleString('ru-RU');
  };
  const timer = setInterval(tick, 20);
}

/* =========================================================
   ТАЙМЛАЙН — редактируй массив
   ========================================================= */
const MOMENTS = [
  { date: '2023', title: 'Наша точка отсчёта', text: 'День, с которого всё началось. Просто быть рядом стало чем-то большим.' },
  { date: '2023', title: 'Первые победы',   text: 'Маленькие шаги, которые изменили многое — для каждого из нас.' },
  { date: '2024', title: 'Новая глава',     text: 'Продолжаем расти и удивлять друг друга. История всё ещё пишется.' },
];

const tl = document.getElementById('timelineList');
if (tl) {
  MOMENTS.forEach(m => {
    const item = document.createElement('div');
    item.className = 'timeline__item reveal';
    item.innerHTML = `
      <div class="timeline__dot"></div>
      <div class="timeline__content">
        <span class="timeline__date">${m.date}</span>
        <h3 class="timeline__title">${m.title}</h3>
        <p class="timeline__text">${m.text}</p>
      </div>
    `;
    tl.appendChild(item);
    io.observe(item);
  });
}

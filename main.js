/* =========================================================
   ГЛАВНЫЙ КОНФИГ — меняй тут
   ========================================================= */
const CONFIG = {
  // Дата начала вашей истории (YYYY-MM-DD)
  startDate: '2026-04-22',

  // Фоновая музыка
  musicSrc: 'audio/ambient.mp3',  // путь к файлу
  musicVolume: 0.35,              // 0..1

  // Частицы в hero
  particlesCount: 60,
};

/* =========================================================
   SCROLL PROGRESS + STICKY NAV
   ========================================================= */
const progress = document.getElementById('scrollProgress');
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  if (progress) progress.style.width = scrolled + '%';

  if (nav) {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }
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
      gx += (mx - gx) * 0.14;
      gy += (my - gy) * 0.14;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animate);
    };
    animate();
  }
}

/* =========================================================
   SPOTLIGHT — блик под курсором на карточках
   ========================================================= */
document.querySelectorAll('.spotlight').forEach(el => {
  el.addEventListener('pointermove', e => {
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mx', x + '%');
    el.style.setProperty('--my', y + '%');
  });
});

/* =========================================================
   HERO PARALLAX
   ========================================================= */
const heroBg = document.querySelector('.hero__bg');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroBg.style.transform = `translateY(${y * 0.35}px)`;
    }
  }, { passive: true });
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
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* =========================================================
   СЧЁТЧИК ДНЕЙ ВМЕСТЕ (ease-out)
   ========================================================= */
const daysEl = document.getElementById('daysTogether');
if (daysEl) {
  const start = new Date(CONFIG.startDate);
  const total = Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000));

  const duration = 1600;
  const t0 = performance.now();
  const easeOutExpo = t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  const tick = now => {
    const t = Math.min(1, (now - t0) / duration);
    const val = Math.round(easeOutExpo(t) * total);
    daysEl.textContent = val.toLocaleString('ru-RU');
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* =========================================================
   ЧАСТИЦЫ В HERO (canvas)
   ========================================================= */
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  const particles = [];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.8 + 0.4;
      this.speed = Math.random() * 0.25 + 0.08;
      this.offset = Math.random() * Math.PI * 2;
      this.alpha = Math.random() * 0.5 + 0.15;
      this.hue = Math.random() > 0.5 ? 320 : 265; // розовый / фиолетовый
    }
    update(t) {
      this.y -= this.speed;
      this.x += Math.sin(t * 0.0006 + this.offset) * 0.3;
      if (this.y < -10) { this.y = H + 10; this.x = Math.random() * W; }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 85%, 75%, ${this.alpha})`;
      ctx.fill();
    }
  }

  resize();
  for (let i = 0; i < CONFIG.particlesCount; i++) particles.push(new Particle());
  window.addEventListener('resize', resize);

  const loop = t => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(t); p.draw(); });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();

/* =========================================================
   ФОНОВАЯ МУЗЫКА
   ========================================================= */
(function initMusic() {
  const btn = document.getElementById('musicToggle');
  if (!btn) return;

  if (!CONFIG.musicSrc) { btn.style.display = 'none'; return; }

  const audio = new Audio();
  audio.src = CONFIG.musicSrc;
  audio.loop = true;
  audio.volume = CONFIG.musicVolume;
  audio.preload = 'auto';

  let playing = false;

  const setPlaying = state => {
    playing = state;
    btn.classList.toggle('is-playing', playing);
    btn.setAttribute('aria-label', playing ? 'Выключить музыку' : 'Включить музыку');
  };

  const tryPlay = async () => {
    try { await audio.play(); setPlaying(true); return true; }
    catch { setPlaying(false); return false; }
  };

  btn.addEventListener('click', () => {
    if (playing) { audio.pause(); setPlaying(false); }
    else tryPlay();
  });

  tryPlay();

  const firstInteraction = async e => {
    if (btn.contains(e.target)) return;
    const ok = await tryPlay();
    if (ok) document.removeEventListener('pointerdown', firstInteraction);
  };
  document.addEventListener('pointerdown', firstInteraction);
})();

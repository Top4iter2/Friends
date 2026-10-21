/* =========================================================
   ФОТО — редактируй этот массив
   Просто положи фото в папку images/ и допиши строку
   ========================================================= */
const PHOTOS = [
  { src: 'images/photo-1.jpg', caption: 'Наш первый день' },
  { src: 'images/photo-2.jpg', caption: 'Поездка мечты' },
  { src: 'images/photo-3.jpg', caption: 'Тот самый вечер' },
  { src: 'images/photo-4.jpg', caption: 'Просто вместе' },
  { src: 'images/photo-5.jpg', caption: 'Маленькое счастье' },
  { src: 'images/photo-6.jpg', caption: 'Момент, который остался' },
];

const grid = document.getElementById('galleryGrid');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const btnPrev = lightbox.querySelector('.lightbox__nav--prev');
const btnNext = lightbox.querySelector('.lightbox__nav--next');
const btnClose = lightbox.querySelector('.lightbox__close');

let activeIndex = 0;

function renderGallery() {
  if (!grid) return;
  PHOTOS.forEach((photo, i) => {
    const item = document.createElement('div');
    item.className = 'gallery__item';
    item.style.animationDelay = `${i * 60}ms`;
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.caption;
    img.loading = 'lazy';
    img.onerror = () => { img.style.display = 'none'; };
    const cap = document.createElement('p');
    cap.className = 'gallery__caption';
    cap.textContent = photo.caption;
    item.appendChild(img);
    item.appendChild(cap);
    item.addEventListener('click', () => openLightbox(i));
    grid.appendChild(item);
  });
}

function openLightbox(index) {
  if (!lightbox) return;
  activeIndex = index;
  updateLightbox();
  lightbox.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  document.body.style.overflow = '';
}

function updateLightbox() {
  const p = PHOTOS[activeIndex];
  lightboxImg.src = p.src;
  lightboxImg.alt = p.caption;
  lightboxCaption.textContent = p.caption;
}

function nextPhoto() {
  activeIndex = (activeIndex + 1) % PHOTOS.length;
  updateLightbox();
}

function prevPhoto() {
  activeIndex = (activeIndex - 1 + PHOTOS.length) % PHOTOS.length;
  updateLightbox();
}

btnClose.addEventListener('click', closeLightbox);
btnNext.addEventListener('click', nextPhoto);
btnPrev.addEventListener('click', prevPhoto);
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextPhoto();
  if (e.key === 'ArrowLeft') prevPhoto();
});

renderGallery();

// Массив ваших мемов
const memes = [
  "«Кинул на карту 100 рублей» — скинул 10 копеек",
  "Кто-то: «Давайте без фанатизма». Тоже кто-то: *заказывает 10 шаурм*",
  "Наш чат в 3 часа ночи: обсуждение теории заговора про плоскую землю",
  "«Я сегодня лягу пораньше» (время 04:30 утра, смотрит тиктоки)",
  "Тот самый скрин, который скидывают раз в месяц, чтобы поржать",
  "«Я в 5 минутах» — выехал из дома 2 минуты назад",
  "Единственный человек в компании, кто знает пароль от Wi-Fi на даче",
  "Когда один опоздал на встречу, а остальные уже съели всё без него",
  "Наш общий бюджет: 0 рублей, но планов на 100 тысяч",
  "«Я не буду это есть» (съел абсолютно всё)"
];

const generateBtn = document.getElementById('generateBtn');
const quoteDisplay = document.getElementById('quoteDisplay');

// Эффект печатной машинки
function typeWriter(text, element, speed = 30) {
  element.innerHTML = '';
  element.style.opacity = '1';
  let i = 0;
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      generateBtn.disabled = false;
      generateBtn.textContent = "Ещё мем!";
    }
  }
  type();
}

generateBtn.addEventListener('click', () => {
  generateBtn.disabled = true;
  generateBtn.textContent = "Печатает...";
  quoteDisplay.style.opacity = '0.5'; // Легкое затухание перед печатью
  
  setTimeout(() => {
    const randomMeme = memes[Math.floor(Math.random() * memes.length)];
    typeWriter(randomMeme, quoteDisplay, 25);
  }, 300);
});


// ================= АНИМАЦИЯ ПОЯВЛЕНИЯ ПРИ СКРОЛЛЕ =================
// Настраиваем Intersection Observer для отслеживания появления элементов
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15 // Срабатывает, когда 15% элемента видно на экране
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target); // Отключаем наблюдение после появления
    }
  });
}, observerOptions);

// Находим все элементы с классом .reveal и начинаем за ними следить
document.querySelectorAll('.reveal').forEach(el => {
  observer.observe(el);
});

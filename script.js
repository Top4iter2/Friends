// Массив ваших мемов и цитат
// Потом просто добавишь сюда новые строки
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

// Эффект печатной машинки для красоты
function typeWriter(text, element, speed = 30) {
  element.innerHTML = '';
  element.style.opacity = '1';
  let i = 0;
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

generateBtn.addEventListener('click', () => {
  // Блокируем кнопку на время анимации
  generateBtn.disabled = true;
  
  // Выбираем случайный мем
  const randomMeme = memes[Math.floor(Math.random() * memes.length)];
  
  // Запускаем печать
  typeWriter(randomMeme, quoteDisplay, 20);
  
  // Разблокируем кнопку через секунду
  setTimeout(() => {
    generateBtn.disabled = false;
  }, 1000);
});

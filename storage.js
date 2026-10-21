// Небольшой слой для работы с localStorage.
// Легко заменить на fetch к бэкенду, когда захочешь синхронизацию между друзьями.

const Storage = (() => {
  const KEY = 'movie-archive-v1';

  return {
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    },

    save(movies) {
      try {
        localStorage.setItem(KEY, JSON.stringify(movies));
      } catch (e) {
        console.warn('Не удалось сохранить архив', e);
      }
    },
  };
})();

// 🔗 URL Google Apps Script Web App
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQ-drrXDEwbhrZ6UN7IE26howT2NDN52yhzhjWssR-QqRIiyL-S_aVb4mtiqSS2VuVcg/exec?action=nextToken';

// 🎯 DOM-элементы
const qrcodeBox  = document.getElementById('qrcode');
const linkBox    = document.getElementById('link');
const btnRefresh = document.getElementById('refresh');

let currentToken = null;
let pollId = null;

// 🔘 Событие на кнопку
btnRefresh.addEventListener('click', () => getNewToken(true));

// 🚀 При загрузке страницы
getNewToken();

/**
 * 📦 Получение нового токена и отрисовка QR
 */
async function getNewToken(forced = false) {
  clearPolling();
  showLoadingState();

  try {
    const res = await fetch(`${SCRIPT_URL}?action=nextToken${forced ? '&forced=1' : ''}`);
    if (!res.ok) throw new Error(`Ошибка ${res.status}`);

    const data = await res.json();
    if (!data.token || !data.url) throw new Error('Неверный ответ сервера');

    currentToken = data.token;
    renderQR(data.url);
    linkBox.textContent = data.url;

    startPolling();
  } catch (err) {
    console.error('❌ Ошибка при получении токена:', err);
    linkBox.textContent = '❌ Не удалось получить QR-код. Проверь соединение.';
    qrcodeBox.innerHTML = '🚫';
  }
}

/**
 * 🖼 Генерация QR-кода
 */
function renderQR(url) {
  qrcodeBox.innerHTML = '';
  new QRCode(qrcodeBox, {
    text: url,
    width: 256,
    height: 256,
    correctLevel: QRCode.CorrectLevel.M
  });
}

/**
 * 🔄 Проверка, использован ли токен
 */
function startPolling() {
  pollId = setInterval(async () => {
    try {
      const res = await fetch(`${SCRIPT_URL}?action=checkToken&token=${currentToken}`);
      if (!res.ok) throw new Error(`Ошибка ${res.status}`);

      const { used } = await res.json();
      if (used) {
        console.log('✅ Токен использован, генерирую новый');
        getNewToken();
      }
    } catch (err) {
      console.error('❌ Ошибка при проверке токена:', err);
    }
  }, 4000);
}

/**
 * 🧹 Остановка опроса
 */
function clearPolling() {
  if (pollId) {
    clearInterval(pollId);
    pollId = null;
  }
}

/**
 * ⏳ Отображение состояния загрузки
 */
function showLoadingState() {
  qrcodeBox.innerHTML = '⏳ Генерация QR…';
  linkBox.textContent = '';
}

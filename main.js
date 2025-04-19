// 🔗 URL Google Apps Script Web App (проверь, что это актуальный /exec!)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQ-drrXDEwbhrZ6UN7IE26howT2NDN52yhzhjWssR-QqRIiyL-S_aVb4mtiqSS2VuVcg/exec';

// 🎯 DOM-элементы
const qrcodeBox = document.getElementById('qrcode');
const linkBox   = document.getElementById('link');
const btnRefresh= document.getElementById('refresh');

let currentToken = null;
let pollId = null;

// 🔘 Обработка кнопки "Сгенерировать заново"
btnRefresh.addEventListener('click', () => getNewToken(true));

// 🟢 Первая загрузка
getNewToken();

// 🧠 Генерация нового токена и QR-кода
async function getNewToken(forced = false) {
  clearPolling();
  showLoadingState();

  try {
    const res = await fetch(`${SCRIPT_URL}?action=nextToken${forced ? '&forced=1' : ''}`);
    if (!res.ok) throw new Error(`Ошибка ${res.status}`);

    const { token, url } = await res.json();
    currentToken = token;

    renderQR(url);
    linkBox.textContent = url;
    startPolling();
  } catch (err) {
    console.error('Ошибка получения токена:', err);
    linkBox.textContent = '❌ Не удалось получить QR. Проверь соединение.';
    qrcodeBox.innerHTML = '❌';
  }
}

// 🖼 Отрисовка QR-кода
function renderQR(url) {
  qrcodeBox.innerHTML = '';
  new QRCode(qrcodeBox, {
    text: url,
    width: 256,
    height: 256,
    correctLevel: QRCode.CorrectLevel.M
  });
}

// 🟡 Начать проверку использования токена
function startPolling() {
  pollId = setInterval(async () => {
    try {
      const res = await fetch(`${SCRIPT_URL}?action=checkToken&token=${currentToken}`);
      if (!res.ok) throw new Error(`Ошибка ${res.status}`);

      const { used } = await res.json();
      if (used) {
        console.log('✅ Токен использован, обновляю QR');
        getNewToken(); // перегенерация нового QR
      }
    } catch (err) {
      console.error('Ошибка проверки токена:', err);
    }
  }, 4000);
}

// 🔁 Очистить текущий polling
function clearPolling() {
  if (pollId) {
    clearInterval(pollId);
    pollId = null;
  }
}

// ⏳ Отображение "загрузки"
function showLoadingState() {
  qrcodeBox.innerHTML = '⏳ Генерация QR…';
  linkBox.textContent = '';
}

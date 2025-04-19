const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQ-drrXDEwbhrZ6UN7IE26howT2NDN52yhzhjWssR-QqRIiyL-S_aVb4mtiqSS2VuVcg/exec';
const qrcodeBox = document.getElementById('qrcode');
const linkBox   = document.getElementById('link');
const btnRefresh= document.getElementById('refresh');

let currentToken, pollId;

btnRefresh.addEventListener('click', () => getNewToken(true));

async function getNewToken(forced = false) {
  if (pollId) {
    clearInterval(pollId);
    pollId = null;
  }

  try {
    const res = await fetch(`${SCRIPT_URL}?action=nextToken${forced ? '&forced=1' : ''}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { token, url } = await res.json();

    currentToken = token;
    renderQR(url);
    linkBox.textContent = url;
    startPolling();
  } catch (err) {
    console.error('❌ Ошибка получения токена:', err);
    linkBox.textContent = 'Ошибка получения QR-кода';
    qrcodeBox.innerHTML = '';
  }
}

function renderQR(url) {
  qrcodeBox.innerHTML = '';
  new QRCode(qrcodeBox, {
    text: url,
    width: 256,
    height: 256,
    correctLevel: QRCode.CorrectLevel.M
  });
}

function startPolling() {
  pollId = setInterval(async () => {
    try {
      const res = await fetch(`${SCRIPT_URL}?action=checkToken&token=${currentToken}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { used } = await res.json();
      if (used) {
        console.log('✅ Токен использован, обновляю QR');
        getNewToken();
      }
    } catch (err) {
      console.error('❌ Ошибка проверки токена:', err);
    }
  }, 4000);
}

// При первом запуске
getNewToken();

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwiheKzddCdSIiOSnXupkSvoUt0REPql3UW1HS9qP7n52Y85xVGeL5K_7RYgLhYoklh/exec'; // «Веб‑приложение» Apps Script
const qrcodeBox = document.getElementById('qrcode');
const linkBox   = document.getElementById('link');
const btnRefresh= document.getElementById('refresh');

let currentToken, pollId;

btnRefresh.addEventListener('click', () => getNewToken(true));

async function getNewToken(forced=false){
  if(pollId){ clearInterval(pollId); pollId=null }
  const res = await fetch(`${SCRIPT_URL}?action=nextToken${forced?'&forced=1':''}`);
  const {token, url} = await res.json();
  currentToken = token;
  renderQR(url);
  linkBox.textContent = url;
  startPolling();
}

function renderQR(url){
  qrcodeBox.innerHTML='';
  new QRCode(qrcodeBox, {
    text: url,
    width: 256, height: 256,
    correctLevel: QRCode.CorrectLevel.M
  });
}

function startPolling(){
  pollId = setInterval(async ()=>{
    const res = await fetch(`${SCRIPT_URL}?action=checkToken&token=${currentToken}`);
    const {used} = await res.json();
    if(used){ getNewToken(); }
  }, 4000);
}

getNewToken();           // первое обращение

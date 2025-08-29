window.Grove = window.Grove || {};

(function(){
  // 後備值（若各頁沒定義，就用這裡的）
  window.API     = window.API     || "https://zdqo2eqb.lc-cn-n1-shared.com/1.1";
  window.APP_ID  = window.APP_ID  || "ZDqo2eQBcSChCfRgwix9jUeI-gzGzoHsz";
  window.APP_KEY = window.APP_KEY || "U66ybZWAD99LrT9zJnQlW52H";

  function lcHeaders(){
    const h = { 'X-LC-Id': window.APP_ID, 'X-LC-Key': window.APP_KEY };
    const t = localStorage.getItem('sg_token');
    if(t) h['X-LC-Session'] = t;
    return h;
  }

  async function isBlocked(userId){
    if(!userId) return false;
    const where = encodeURIComponent(JSON.stringify({
      target:{ "__type":"Pointer","className":"_User","objectId": userId },
      status:"active"
    }));
    const url = `${window.API}/classes/BlockedUser?where=${where}&limit=1`;
    try{
      const r = await fetch(url, { headers: lcHeaders() });
      const d = await r.json();
      if(!r.ok){ console.error('[Grove] isBlocked error:', d); return false; }
      return !!(d.results && d.results.length);
    }catch(e){
      console.error('[Grove] isBlocked fetch fail:', e);
      return false; // 網路失敗時不阻擋
    }
  }

  async function assertNotBlockedOrThrow(userId){
    if(await isBlocked(userId)) throw new Error('你的帳號已被封鎖，暫時無法進行此操作。');
  }

  window.Grove.isBlocked = isBlocked;
  window.Grove.assertNotBlockedOrThrow = assertNotBlockedOrThrow;
})();
/* ====== 下壓彈匡（選單） ====== */
const menuBtn  = document.getElementById('menuBtn');
const menuDrop = document.getElementById('menuDrop');
const modeItem = document.getElementById('modeItem');

function toggleMenu(){
  if(!menuDrop || !menuBtn) return;   // ← 保護
  const opened = menuDrop.classList.toggle('show');
  menuBtn.textContent = opened ? '&' : '%';
  menuBtn.setAttribute('aria-expanded', opened ? 'true' : 'false');
}


// 點外面關閉
document.addEventListener('click', (e)=>{
  if(!menuDrop) return;
  const within = e.target.closest('.menu-wrap');
  if(!within && menuDrop.classList.contains('show')){
    menuDrop.classList.remove('show');
    menuBtn.textContent = '%';
    menuBtn.setAttribute('aria-expanded','false');
  }
});

/* ====== 主題切換＆記憶 ====== */
const THEME_KEY = 'sg_theme';

function applyTheme(mode){
  document.documentElement.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light');
  modeItem.textContent = (mode === 'dark') ? '切換模式：晝間' : '切換模式：夜間';
}
function toggleTheme(){
  const now  = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = now === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}
(function initTheme(){
  applyTheme(localStorage.getItem(THEME_KEY) || 'light');
})();
// 1) 點擊攔截：購買、下單、送出訊息等按鈕 class 自行擴充
// 點擊攔截（用捕獲階段，能搶在別的 handler 前先跑）
document.addEventListener('click', async (e)=>{
  const el = e.target.closest('button, a, input[type="submit"], [data-requires-unblocked]');
  if(!el) return;

  // 只攔需要檢查的：有這些 class 或 data 屬性才攔
  const needCheck =
    el.matches('.buy-btn, .checkout-btn, .send-btn, [data-requires-unblocked]');
  if(!needCheck) return;

  const me = JSON.parse(localStorage.getItem('sg_user')||'null');
  if(!me) return;

  if(await Grove.isBlocked(me.objectId)){
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    alert('你的帳號已被封鎖 🚫，暫時無法使用此功能');
    return;
  }
}, true); // ←←← 捕獲階段

// 表單攔截（同樣用捕獲）
document.addEventListener('submit', async (e)=>{
  const form = e.target;
  if(!(form instanceof HTMLFormElement)) return;
  if(!form.matches('[data-requires-unblocked], .checkout-form')) return;

  const me = JSON.parse(localStorage.getItem('sg_user')||'null');
  if(!me) return;

  if(await Grove.isBlocked(me.objectId)){
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    alert('你的帳號已被封鎖 🚫，暫時無法送出');
    return;
  }
}, true); // ←←← 捕獲階段
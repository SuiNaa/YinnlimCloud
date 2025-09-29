//游標
const cursor = document.getElementById('cursor');
let lastX = 0, lastY = 0, ticking = false;

function onPointerMove(e){
  lastX = e.clientX; lastY = e.clientY;
  if (!ticking){
    requestAnimationFrame(()=>{
      cursor.style.transform = `translate3d(${lastX}px, ${lastY}px, 0)`;
      ticking = false;
    });
    ticking = true;
  }
}
function onScroll(){
  cursor.style.transform = `translate3d(${lastX}px, ${lastY}px, 0)`;
}
function onDown(){ cursor.classList.add('down'); }
function onUp(){   cursor.classList.remove('down'); }
function forceHideNative(){
  document.documentElement.style.setProperty('cursor','var(--cursor-none)','important');
  document.body.style.setProperty('cursor','var(--cursor-none)','important');
}
window.addEventListener('focus', forceHideNative);
document.addEventListener('visibilitychange', ()=> { if (!document.hidden) forceHideNative(); });
document.addEventListener('mouseenter', forceHideNative);
document.addEventListener('pointermove', onPointerMove, { passive:true });
document.addEventListener('pointerdown', onDown);
document.addEventListener('pointerup',   onUp);
document.addEventListener('scroll',      onScroll, { passive:true });
document.addEventListener('wheel',       onScroll, { passive:true });

// --- 防止滾輪/捲動時冒出原生游標：短暫開啟 shield 命中 ---
const shield = document.getElementById('cursor-shield');
let shieldTimer = null;

// 啟用遮罩一小段時間
function coverShield(ms = 180){
  if (!shield) return;
  shield.classList.add('cover');
  clearTimeout(shieldTimer);
  shieldTimer = setTimeout(()=> shield.classList.remove('cover'), ms);
}

// 在會出現閃爍的時機啟用（wheel/scroll/gesture）
document.addEventListener('wheel',  () => coverShield(0), {passive:true});
document.addEventListener('scroll', () => coverShield(0), {passive:true});

// 使用者一旦按下或進入頁面，就關掉遮罩避免擋互動
document.addEventListener('pointerdown', () => shield.classList.remove('cover'), {passive:true});
document.addEventListener('mouseenter',  () => shield.classList.remove('cover'), {passive:true});

// 再保險：視窗回焦或可見時，重新蓋一次 none（你已經有 forceHideNative 也OK）
window.addEventListener('focus', () => coverShield(120));
document.addEventListener('visibilitychange', () => { if (!document.hidden) coverShield(120); });

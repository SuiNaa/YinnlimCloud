
/* ====== 下拉 → 開啟激素換算視窗（保留你的開關行為） ====== */
const convertModal = document.getElementById('modal-convert');
function openConvertModal() {
  convertModal.classList.add('show');
  convertModal.setAttribute('aria-hidden', 'false');
  populateUnits();
  calc();
}
function closeConvertModal() {
  convertModal.classList.remove('show');
  convertModal.setAttribute('aria-hidden', 'true');
}
document.querySelectorAll('.tool-item[data-tool="convert"]').forEach(btn=>{
  btn.addEventListener('click', openConvertModal);
});
convertModal.querySelectorAll('[data-close="convert"]').forEach(btn=>{
  btn.addEventListener('click', closeConvertModal);
});
convertModal.addEventListener('click', (e)=>{ if(e.target===convertModal) closeConvertModal(); });

/* ====== 單位與換算（擴充版）====== */
/* 說明：
   - 每個 hormone 都定義可用單位與 convert() 實作
   - 盡量沿用你原本 UI：左/右兩個 select 選單 + 數值輸入
   - 內建因子：
       Estradiol(E2):  pg/mL ↔ pmol/L  ×3.671
       Testosterone(T): ng/dL ↔ nmol/L ×0.0347
       Progesterone(P4): ng/mL ↔ nmol/L ×3.18
     甲狀腺素群：nmol/L ↔ pmol/L（×1000 / ÷1000）
     促性腺/促甲：IU/L、mIU/mL、mIU/L（1 IU/L = 1 mIU/mL；1 IU/L = 1000 mIU/L）
*/

// 共用小工具
const round = (x, d=3) => Number.isFinite(x) ? Number(x.toFixed(d)) : x;

// 通用：nmol/L ↔ pmol/L
const nmolL_to_pmolL = v => v * 1000;
const pmolL_to_nmolL = v => v / 1000;

// 通用：IU/L、mIU/mL、mIU/L 互換
// 1 IU/L = 1 mIU/mL = 1000 mIU/L
function convIU(v, from, to){
  // 先轉到 IU/L
  let iuL = v;
  if (from === 'IU/L') iuL = v;
  else if (from === 'mIU/mL') iuL = v;              // 1:1
  else if (from === 'mIU/L') iuL = v / 1000;

  // 再轉成目標
  if (to === 'IU/L') return iuL;
  if (to === 'mIU/mL') return iuL;                  // 1:1
  if (to === 'mIU/L') return iuL * 1000;
  return v;
}

// 各激素定義
const hormoneDefs = {
  // 雌二醇
  E2: {
    label: '雌二醇（E2）',
    units: ['pg/mL','pmol/L'],
    convert(v, from, to){
      const f = 3.671; // pg/mL → pmol/L
      if (from === to) return v;
      return (from === 'pg/mL' && to === 'pmol/L') ? v * f : v / f;
    }
  },

  // 睪酮
  T: {
    label: '睪酮（T）',
    units: ['ng/dL','nmol/L'],
    convert(v, from, to){
      const f = 0.0347; // ng/dL → nmol/L
      if (from === to) return v;
      return (from === 'ng/dL' && to === 'nmol/L') ? v * f : v / f;
    }
  },

  // 孕酮（黃體素、P4）
  P4: {
    label: '孕酮（P4）',
    units: ['ng/mL','nmol/L'],
    convert(v, from, to){
      const f = 3.18; // ng/mL → nmol/L（≈1000/314.46）
      if (from === to) return v;
      return (from === 'ng/mL' && to === 'nmol/L') ? v * f : v / f;
    }
  },

  // 甲狀腺素群（多為物質量單位，彼此只差 10^3 倍）
  T3:   { label: '三碘甲狀腺原氨酸（T3）',  units: ['nmol/L','pmol/L'],
          convert:(v,f,t)=> f===t ? v : (f==='nmol/L'? nmolL_to_pmolL(v): pmolL_to_nmolL(v)) },
  FT3:  { label: '游離三碘甲狀腺原氨酸（FT3）', units: ['nmol/L','pmol/L'],
          convert:(v,f,t)=> f===t ? v : (f==='nmol/L'? nmolL_to_pmolL(v): pmolL_to_nmolL(v)) },
  T4:   { label: '甲狀腺素（T4）',           units: ['nmol/L','pmol/L'],
          convert:(v,f,t)=> f===t ? v : (f==='nmol/L'? nmolL_to_pmolL(v): pmolL_to_nmolL(v)) },
  FT4:  { label: '游離甲狀腺素（FT4）',       units: ['nmol/L','pmol/L'],
          convert:(v,f,t)=> f===t ? v : (f==='nmol/L'? nmolL_to_pmolL(v): pmolL_to_nmolL(v)) },

  // 促甲狀腺激素 / 促性腺激素（常見活性單位）
  TSH:  { label: '促甲狀腺激素（TSH）', units: ['IU/L','mIU/mL','mIU/L'],
          convert:(v,f,t)=> convIU(v,f,t) },
  FSH:  { label: '卵泡刺激素（FSH）',   units: ['IU/L','mIU/mL','mIU/L'],
          convert:(v,f,t)=> convIU(v,f,t) },
  LH:   { label: '黃體生成素（LH）',     units: ['IU/L','mIU/mL','mIU/L'],
          convert:(v,f,t)=> convIU(v,f,t) },
};

// 取 DOM
const selHormone = document.getElementById('hormone');
const selFrom    = document.getElementById('unitFrom');
const selTo      = document.getElementById('unitTo');
const inpValue   = document.getElementById('value');
const outResult  = document.getElementById('result');

// 用 JS 把「激素列表」灌進去（不用改 HTML）
(function fillHormoneOptions(){
  selHormone.innerHTML = '';
  Object.entries(hormoneDefs).forEach(([key, def])=>{
    selHormone.add(new Option(def.label, key));
  });
  selHormone.value = 'E2'; // 預設顯示 E2
})();

function populateUnits(){
  const def = hormoneDefs[ selHormone.value ];
  selFrom.innerHTML = '';
  selTo.innerHTML   = '';
  def.units.forEach(u=>{
    selFrom.add(new Option(u, u));
    selTo.add(new Option(u, u));
  });
  selTo.selectedIndex = Math.min(1, def.units.length-1); // 預設選第2個
}

// 計算
function calc(){
  const val = parseFloat(inpValue.value);
  if(isNaN(val)){ outResult.textContent = '請輸入數值'; return; }

  const hKey = selHormone.value;
  const def  = hormoneDefs[hKey];
  const u1   = selFrom.value;
  const u2   = selTo.value;

  const ans = def.convert(val, u1, u2);
  outResult.textContent = `${val} ${u1} ≈ ${round(ans)} ${u2}`;
}

// 綁事件
selHormone.addEventListener('change', ()=>{ populateUnits(); calc(); });
[inpValue, selFrom, selTo].forEach(el=> el.addEventListener('input', calc));

// 初始
populateUnits();
calc();


/* ---------- 你的下拉選單 hover/點擊行為：原樣保留 ---------- */
(function(){
  const menu = document.querySelector('.menu');
  if(!menu) return;
  const btn  = menu.querySelector('.menu-btn');
  const list = menu.querySelector('.menu-list');

  btn.setAttribute('role','button');
  btn.setAttribute('tabindex','0');
  btn.setAttribute('aria-expanded','false');

  let hideTimer;

  function openMenu(){
    clearTimeout(hideTimer);
    menu.classList.add('is-open');
    btn.setAttribute('aria-expanded','true');
  }
  function closeMenu(){
    hideTimer = setTimeout(()=>{
      menu.classList.remove('is-open');
      btn.setAttribute('aria-expanded','false');
    }, 150);
  }

  menu.addEventListener('mouseenter', openMenu);
  menu.addEventListener('mouseleave', (e)=>{
    const to = e.relatedTarget;
    if (!menu.contains(to)) closeMenu();
  });

  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    if(menu.classList.contains('is-open')) closeMenu(); else openMenu();
  });

  btn.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      if(menu.classList.contains('is-open')) closeMenu(); else openMenu();
    }
    if(e.key === 'Escape'){ closeMenu(); }
  });
  list.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ closeMenu(); btn.focus(); } });

  document.addEventListener('click', (e)=>{
    if(!menu.contains(e.target)) { menu.classList.remove('is-open'); btn.setAttribute('aria-expanded','false'); }
  });
  document.addEventListener('touchstart', (e)=>{
    if(!menu.contains(e.target)) { menu.classList.remove('is-open'); btn.setAttribute('aria-expanded','false'); }
  }, {passive:true});
})();

// 動態注入藥丸+磨砂+放大
// === 1) 注入樣式（藥丸 + 磨砂 + 放大） ===
(function injectGlassStyles(){
  const css = `
    /* 放大整個彈窗盒 */
    #modal-convert .modal-box{
      transform: translateY(0) scale(1.28) !important;
    }

    /* 外層藥丸殼（做磨砂） */
    #modal-convert .glass-pill{
      display:flex; align-items:center;
      gap:8px;
      padding:6px 12px;
      border-radius:9999px;
      background: rgba(255,255,255,.22);
      -webkit-backdrop-filter: blur(10px);
      backdrop-filter: blur(10px);
      border:1px solid rgba(255,255,255,.35);
      box-shadow: inset 0 1px 0 rgba(255,255,255,.2),
                  0 8px 28px rgba(0,0,0,.18);
    }

    /* 讓原生控制項透明、貼合外殼 */
    #modal-convert .glass-pill > input,
    #modal-convert .glass-pill > select{
      flex:1 1 auto;
      width:100%;
      background: transparent !important;
      border: none !important;
      outline: none !important;
      color: inherit !important;
      font-size: 1.05rem !important;
      line-height: 1.2;
      padding: 6px 2px !important;
      /* 拿掉 iOS/Safari 原生樣式，才能吃到圓角與自訂背景 */
      -webkit-appearance: none;
      appearance: none;
      border-radius: 9999px; /* 藥丸 */
    }

    /* 統一下拉選單外觀：加一個小箭頭 */
    #modal-convert .glass-pill.select{
      position: relative;
      padding-right: 38px; /* 騰出箭頭空間 */
    }
    #modal-convert .glass-pill.select::after{
      content: "";
      position:absolute;
      right:12px; top:50%;
      width: 8px; height: 8px;
      border-right:2px solid rgba(0,0,0,.45);
      border-bottom:2px solid rgba(0,0,0,.45);
      transform: translateY(-50%) rotate(45deg);
      pointer-events: none;
      opacity:.85;
    }

    /* 讓結果區域更清楚 */
    #modal-convert #result{
      margin-top:10px;
      font-weight:700;
      background: rgba(255,255,255,.14);
      -webkit-backdrop-filter: blur(6px);
      backdrop-filter: blur(6px);
      border-radius: 12px;
      padding: 10px 12px;
    }

    #modal-convert .glass-pill > input,
#modal-convert .glass-pill > select {
  flex:1 1 auto;
  width:100%;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  color: #84d9daff !important; /* 深橘色（巧克力色系） */
  font-size: 1.05rem !important;
  line-height: 1.2;
  padding: 6px 2px !important;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 9999px; /* 藥丸 */
}
  `;
  const s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);
})();

// === 2) 在彈窗開啟時，把控制項包進「玻璃藥丸外殼」 ===
function applyGlassPills(){
  const box = document.querySelector('#modal-convert .modal-box');
  if(!box) return;

  // 要處理的欄位：select／input
  const targets = box.querySelectorAll('select, input[type="number"], input[type="text"]');

  targets.forEach(el=>{
    // 已經包過就跳過
    if(el.parentElement && el.parentElement.classList.contains('glass-pill')) return;

    // 建外殼
    const wrap = document.createElement('div');
    wrap.className = 'glass-pill' + (el.tagName === 'SELECT' ? ' select' : '');

    // 把原元素移進外殼
    el.parentElement.insertBefore(wrap, el);
    wrap.appendChild(el);
  });
}

// === 3) 擴充：在你原本「打開彈窗」那段後面，呼叫 applyGlassPills() ===
(function hookOpenModal(){
  const modal = document.getElementById('modal-convert');
  if(!modal) return;

  // 監聽 class 變化，只要彈窗變成 show 就套樣式
  const obs = new MutationObserver(muts=>{
    muts.forEach(m=>{
      if(m.attributeName === 'class'){
        if(modal.classList.contains('show')){
          // 彈窗剛打開
          applyGlassPills();
        }
      }
    });
  });
  obs.observe(modal, { attributes:true });
})();
/* ===================== 罩杯計算（JS-only，不動 HTML/CSS） ===================== */

// 1) 攔截頂欄「罩杯計算」連結
document.querySelectorAll('a[href="/cup.html"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    openCupModal();
  });
});

// 2) 插入只作用於罩杯彈窗的樣式（由 JS 動態掛上）
(function injectCupStyles(){
  if (document.getElementById('cup-modal-style')) return;
  const css = `
  .cup-overlay{
    position: fixed; inset: 0; z-index: 3000;
    background: rgba(0,0,0,.35);
    -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px);
    display: grid; place-items: center;
  }
  .cup-modal{
    width: min(92vw, 560px);
    background: rgba(162, 125, 187, .45);           /* 半透明卡片 */
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 16px;                             /* 方形卡片（略圓角） */
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
    color: var(--text, #e9eef3);
    padding: 16px;
    transform: translateY(6px) scale(.98);
    opacity: 0;
    transition: opacity .18s ease, transform .18s ease;
  }
  .cup-overlay.show .cup-modal{ transform: translateY(0) scale(1); opacity: 1; }

  .cup-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .cup-title{ margin:0; font-size:1.1rem; font-weight:700; }
  .cup-close{
    background: transparent; border: 0; color: currentColor;
    font-size: 20px; cursor: pointer; line-height: 1;
  }

  .cup-form{ display:flex; flex-direction:column; gap:12px; }

  /* 藥丸型磨砂輸入組件 */
  .pill{
    display:flex; align-items:center; gap:10px;
    background: rgba(255,255,255,.10);
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
    border:1px solid rgba(255,255,255,.20);
    border-radius: 999px; padding: 10px 12px;
  }
  .pill label{
    font-size:.92rem; opacity:.9; white-space:nowrap;
  }
  .pill input{
    flex:1 1 auto; min-width:0;
    background: transparent; border: 0; outline: 0;
    color: var(--text, #e9eef3);
    font: inherit;
  }
  .pill input::placeholder{ opacity:.6; }

  .row2{ display:flex; gap:12px; flex-wrap:wrap; }
  .row2 .col{ flex:1 1 220px; }

  .cup-note{
    margin-top:6px; font-size:.9rem; color: var(--muted, #b2becc);
  }
  .cup-result{
    margin-top:6px; font-weight:800;
    background: rgba(255,255,255,.08);
    border:1px solid rgba(255,255,255,.12);
    border-radius:10px; padding:10px 12px;
  }
    .cup-modal .pill input{ color: #e82ebdff; }   /* 深橘 */
  `;
  const style = document.createElement('style');
  style.id = 'cup-modal-style';
  style.textContent = css;
  document.head.appendChild(style);
})();
// 3) 開啟彈窗
function openCupModal(){
  // 若已存在先移除，避免重複
  const old = document.querySelector('.cup-overlay');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.className = 'cup-overlay';
  overlay.innerHTML = `
    <div class="cup-modal" role="dialog" aria-label="罩杯計算">
      <div class="cup-head">
        <h3 class="cup-title">🍄‍🟫 罩杯計算</h3>
        <button class="cup-close" aria-label="關閉">×</button>
      </div>

      <div class="cup-form">
        <div class="row2">
          <div class="col">
            <div class="pill">
              <label for="cup-under">下胸圍 (cm)</label>
              <input id="cup-under" type="number" step="any" placeholder="例如 72" />
            </div>
          </div>
          <div class="col">
            <div class="pill">
              <label for="cup-over">上胸圍 (cm)</label>
              <input id="cup-over" type="number" step="any" placeholder="例如 83" />
            </div>
          </div>
        </div>

        <div class="pill">
          <label for="cup-diff">差值 (上 - 下)</label>
          <input id="cup-diff" type="text" placeholder="自動計算" readonly />
        </div>

        <div class="cup-result" id="cup-result">結果將顯示在這裡</div>
        <div class="cup-note">說明：依常見日/台標準，以每 2.5 cm 為一級；A 從 10 cm 起算（10→A，12.5→B，15→C…）。</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // 顯示動畫
  requestAnimationFrame(()=> overlay.classList.add('show'));

  // 綁事件
  const closeBtn = overlay.querySelector('.cup-close');
  closeBtn.addEventListener('click', ()=> overlay.remove());
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) overlay.remove(); });
  document.addEventListener('keydown', escCloseOnce);

  function escCloseOnce(e){
    if(e.key === 'Escape'){ overlay.remove(); document.removeEventListener('keydown', escCloseOnce); }
  }

  // 計算邏輯
  const under = overlay.querySelector('#cup-under');
  const over  = overlay.querySelector('#cup-over');
  const diff  = overlay.querySelector('#cup-diff');
  const out   = overlay.querySelector('#cup-result');

  [under, over].forEach(inp => inp.addEventListener('input', calcCup));
  calcCup();

  function calcCup(){
    const u = parseFloat(under.value);
    const o = parseFloat(over.value);

    if (isNaN(u) || isNaN(o)) {
      diff.value = '';
      out.textContent = '請輸入上胸圍與下胸圍（cm）。';
      return;
    }
    const d = +(o - u).toFixed(1);
    diff.value = `${d} cm`;

    // 以 2.5 cm 為一級，10cm 起算為 A
    const steps = Math.round((d - 10) / 2.5); // 四捨五入到最近級距
    const idx = Math.max(0, steps);          // 低於 10cm 視為 AA/A- 類
    const scale = ['A','B','C','D','E','F','G','H','I','J'];
    let cup = idx < scale.length ? scale[idx] : `${scale[scale.length-1]}+`;

    if (d < 10) {
      // 低於 10 cm：給出 AA / A- 提示
      cup = d >= 7.5 ? 'AA/近 A' : 'AA';
    }

    out.textContent = `推測罩杯：${cup} Cup（差值：${d} cm）`;
  }
}
//=======晝夜＝＝＝＝

// ============ 「設定」→ 夜/晝模式切換下拉 ============
// 放在檔尾，確保 DOM 都 ready
(function mountThemeDropdown(){
  // 找「設定」連結（多寫幾個備援）
  const link =
    document.querySelector('nav.topmenu a[href="/contact.html"]') ||
    Array.from(document.querySelectorAll('nav.topmenu a'))
      .find(a => /設定/.test(a.textContent.trim()));
  if (!link) return;                             // 找不到就跳過
  if (document.getElementById('theme-pop')) return; // 已建過就不重複

  // 外層包一個容器（不改原 HTML，只是 wrap）
  const wrap = document.createElement('span');
  wrap.className = 'settings-wrap';
  link.parentNode.insertBefore(wrap, link);
  wrap.appendChild(link);

  // 建立小彈匡
  const pop = document.createElement('div');
  pop.id = 'theme-pop';
  pop.setAttribute('role','menu');
  pop.innerHTML = `
    <button type="button" id="themeToggleBtn" role="menuitem">🌙 切換夜間 / 晝間</button>
  `;
  wrap.appendChild(pop);

  // 高權重樣式（避免被原站 CSS 壓過）
  if (!document.getElementById('theme-pop-style')) {
    const s = document.createElement('style');
    s.id = 'theme-pop-style';
    s.textContent = `
      .settings-wrap{ position:relative; display:inline-flex; align-items:center; }
      /* 小彈匡定位與外觀 */
      #theme-pop{
        position:absolute; top:100%; left:50%; transform:translate(-50%,8px);
        min-width: 160px;
        background: rgba(34,38,44,.92);
        -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
        border:1px solid rgba(255,255,255,.18);
        border-radius:12px; padding:8px;
        box-shadow: 0 14px 30px rgba(0,0,0,.35);
        opacity:0; visibility:hidden; pointer-events:none;
        transition: opacity .18s ease, transform .18s ease, visibility .18s;
        z-index: 2000;
      }
      /* hover 或鍵盤聚焦時顯示 */
      .settings-wrap:hover #theme-pop,
      .settings-wrap:focus-within #theme-pop{
        opacity:1; visibility:visible; pointer-events:auto;
        transform: translate(-50%, 12px);
      }
      /* 內部按鈕（膠囊、淺色） */
      #theme-pop #themeToggleBtn{
        display:block; width:100%;
        appearance:none; -webkit-appearance:none;
        border:1px solid rgba(255,255,255,.28);
        background: linear-gradient(135deg, #ffc4d6, #ffdde1);
        color: #5e4b56;
        border-radius:999px; padding:10px 12px; font-weight:700;
        cursor:pointer;
        transition: transform .12s ease, filter .18s ease;
      }
      #theme-pop #themeToggleBtn:hover{ transform: translateY(-1px); filter:brightness(1.05); }
      #theme-pop #themeToggleBtn:active{ transform: translateY(0); }

      /* 夜間模式色票（沿用你頁面變數） */
      body.dark {
        --bg-1:#1c1b22; --bg-2:#2a2730;
        --accent:#e0b3ff; --text:#f5eaff; --muted:#aaa;
        --card: rgba(255,255,255,0.08);
      }
    `;
    document.head.appendChild(s);
  }

  // 讀取偏好 → 設定初始圖示
  const btn = pop.querySelector('#themeToggleBtn');
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark');
    btn.textContent = '☀️ 切換晝間 / 夜間';
  }

  // 點「切換」：只切主題，不要跳頁
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    e.stopPropagation();               // 重要：避免氣泡去觸發「設定」的超連結
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    btn.textContent = isDark ? '☀️ 切換晝間 / 夜間' : '🌙 切換夜間 / 晝間';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // 防止在彈匡裡點任何地方會觸發「設定」連結
  pop.addEventListener('click', (e)=>{ e.stopPropagation(); e.preventDefault(); });

  // 可選：鍵盤可用（Tab 到「設定」也能看到彈匡）
  link.setAttribute('aria-haspopup','true');
  link.setAttribute('aria-expanded','false');
})();
// === 修復：設定→主題下拉在移動游標時不消失（橋接 + 緩衝） ===
(function stickyThemePop(){
  const wrap = document.querySelector('.settings-wrap');
  const pop  = document.getElementById('theme-pop');
  if (!wrap || !pop) return;

  // 補一段 CSS：在彈匡上方做「無形橋接區」，避免 hover 斷掉
  if (!document.getElementById('theme-pop-bridge-style')) {
    const s = document.createElement('style');
    s.id = 'theme-pop-bridge-style';
    s.textContent = `
      /* 無形橋接：把上方 10px 視作彈匡的一部分，游標經過不關閉 */
      #theme-pop::before{
        content:""; position:absolute; left:0; right:0; top:-10px; height:10px;
      }
      /* 顯示條件維持不變 */
      .settings-wrap:hover #theme-pop,
      .settings-wrap:focus-within #theme-pop{
        opacity:1; visibility:visible; pointer-events:auto;
        transform: translate(-50%, 12px);
      }
    `;
    document.head.appendChild(s);
  }

  // 再加一點 JS 緩衝：離開 wrap 150ms 才關，給手移動時間
  let hideTimer = null;
  function openNow(){
    clearTimeout(hideTimer);
    pop.style.opacity = '1';
    pop.style.visibility = 'visible';
    pop.style.pointerEvents = 'auto';
    pop.style.transform = 'translate(-50%, 12px)';
  }
  function scheduleHide(){
    clearTimeout(hideTimer);
    hideTimer = setTimeout(()=>{
      pop.style.opacity = '';
      pop.style.visibility = '';
      pop.style.pointerEvents = '';
      pop.style.transform = '';
    }, 150);
  }

  wrap.addEventListener('mouseenter', openNow);
  wrap.addEventListener('mouseleave', scheduleHide);
  pop.addEventListener('mouseenter', openNow);
  pop.addEventListener('mouseleave', scheduleHide);
})();
//================================`
  const helpBtn   = document.getElementById('helpBtn');
const helpModal = document.getElementById('modal-help');

function openHelpModal(){
  helpModal.classList.add('show');
  helpModal.setAttribute('aria-hidden','false');
}
function closeHelpModal(){
  helpModal.classList.remove('show');
  helpModal.setAttribute('aria-hidden','true');
}

helpBtn.addEventListener('click', (e)=>{
  e.preventDefault();
  openHelpModal();
});
helpModal.querySelector('.modal-close').addEventListener('click', closeHelpModal);
helpModal.addEventListener('click', (e)=>{ if(e.target===helpModal) closeHelpModal(); });
window.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && helpModal.classList.contains('show')) closeHelpModal(); });

helpModal.querySelectorAll('.help-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const key = btn.dataset.key;
    if (key === 'explore'){ closeHelpModal(); location.href='record.html'; }
    if (key === 'gender'){ closeHelpModal(); location.href='gender-identity.html'; }
    if (key === 'support'){ closeHelpModal(); location.href='command.html'; }
  });
});
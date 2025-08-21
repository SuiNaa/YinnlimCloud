/* ====== 0) 小樣式：讓國家英文縮小、灰色（JS 動態注入，不改原 CSS） ====== */
(function injectMiniCss(){
  if (document.getElementById('dyn-style-country')) return;
  const css = `
    #tbl td .country-zh{ display:block; font-weight:600; }
    #tbl td .country-en{ display:block; font-size:.85em; color:rgba(255,255,255,.75); }
  `;
  const s = document.createElement('style');
  s.id = 'dyn-style-country';
  s.textContent = css;
  document.head.appendChild(s);
})();

/* ====== 1) 資料 schema（擴充：countryZh/countryEn 與 doses） ======
每筆：
{
  id, countryZh, countryEn, center, doctor, kind, drug, route,
  rangeText, stability, notes, tags, sources,
  doses: { E2_mg: '2–6', T_mg: '50–100' }   // 以 mg 為主，字串顯示
}
================================================= */
const DATA = [
  // 臺灣（MTF：E2）
  {
    id:'tw-mtf-e2',
    countryZh:'臺灣', countryEn:'Taiwan',
    center:'多家門診（社群彙整）', doctor:'—',
    kind:'MTF', drug:'17β-estradiol', route:'oral / sublingual',
    rangeText:'偏低～中等劑量，依血檢與風險調整。',
    stability:4,
    notes:'傾向安全優先；追蹤 E2/T、肝腎功能與凝血風險。',
    tags:['台灣','雌二醇'],
    sources:[{name:'社群整理FTM 心血管風險觀察研究', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC7208511/?utm_source=chatgpt.com'}],
    doses:{ E2_mg:'2–6 mg/日', T_mg:'—' }
  },
{
    id:'tw-ftm-t-inj',
    countryZh:'臺灣', countryEn:'Taiwan',
    center:'部分門診（社群彙整）', doctor:'—',
    kind:'FTM', drug:'testosterone', route:'IM / SC',
    rangeText:'每週或雙週肌肉/皮下注射；依血檢與臨床反應調整。',
    stability:4,
    notes:'追蹤 Hct/Hgb、總T/遊離T、情緒與副作用；劑量與間隔依個別差異調整。',
    tags:['台灣','睪酮','注射'],
    sources: [
  { name: 'Johns Hopkins GAHT 快速指引（2023）', url: 'https://www.hopkinsmedicine.org/-/media/center-for-transgender-health/documents/tgd-gaht-quick-guide.ashx' },
  { name: 'SFDPH GAHT 劑量監測指南（2023）', url: 'https://www.sf.gov/file/ghsf-gender-affirming-hormone-therapy-gaht-dosing-monitoring-guide-primary-care' },
  { name: 'Review of adult gender transition medications（2023）', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10355117/' }
],
    doses:{ E2_mg:'—', T_mg:'50–100 mg/週' }
  },
  // 美國（FTM：T）
  {
    id:'us-ftm-t',
    countryZh:'美國', countryEn:'United States',
    center:'多中心（社群回報）', doctor:'—',
    kind:'FTM', drug:'testosterone', route:'IM / SC',
    rangeText:'每週或雙週注射，依血檢與臨床反應調整。',
    stability:4,
    notes:'監測 Hct/Hgb、T 濃度、情緒與副作用。',
    tags:['美國','睪酮'],
   sources: [
  { name: '立法會', url: 'https://www.legco.gov.hk/yr13-14/english/bc/bc52/papers/bc520605cb2-1708-2-e.pdf?utm_source=chatgpt.com' },
  { name: 'Masculinizing Hormone Therapy', url: 'https://hum-clinic.com/service/transgender-hormone-therapy-bangkok/?utm_source=chatgpt.com' },
],
    doses:{ E2_mg:'—', T_mg:'50–100 mg/週' }
  },
  {
  id:'us-mtf-e2',
  countryZh:'美國', countryEn:'United States',
  center:'多中心（社群回報）', doctor:'—',
  kind:'MTF', drug:'17β-雌二醇', route:'口服 / 舌下 / 貼片 / 注射',
  rangeText:'社群常見口服 2–6 mg/日，或注射型依週期調整；會依血檢與風險因子調整。',
  stability:4,
  notes:'監測 E2/T 濃度、肝腎功能、凝血風險。部分醫師偏向較保守劑量，安全優先。',
  tags:['美國','雌二醇'],
  sources: [
    { name: 'UCSF 跨性別初級與性別肯定護理指南', url: 'https://www.bumc.bu.edu/endo/clinics/transgender-medicine/guidelines/?utm_source=chatgpt.com' },
    { name: 'Endocrine SocietyCallen‑Lorde 藥物療法協議（MTF 部分）', url: 'https://www.hopkinsmedicine.org/-/media/center-for-transgender-health/documents/tgd-gaht-quick-guide.ashx?utm_source=chatgpt.com' },
    { name:'Endocrine Society 指南（女性化療法監控範圍）', url:'https://arupconsult.com/content/endocrine-testing-transgender-adults?utm_source=chatgpt.com'}
  ],
  doses:{ E2_mg:'2–6 mg/日（口服）', T_mg:'—' }
},
  // 香港（MTF：E2）
{
  id: 'hk-mtf-e2',
  countryCode: 'HK', countryZh: '香港', countryEn: 'Hong Kong',
  center: '多家門診（社群回報）', doctor: '—',
  kind: 'MTF',
  drug: '17β-estradiol',
  route: '口服 / 舌下含服 / 經皮貼片',
  rangeText: '公私醫療差異較大，依血檢與風險調整；部分個案會合併抗雄（如 CPA／螺內酯）。',
  stability: 4,
  notes: '臨床常以較保守劑量起始以降低血栓風險；重點監測 E2/T、肝腎功能與凝血風險因子。',
  tags: ['香港', '雌二醇'],
  sources: [{ name: '社群整理（香港）', url: 'https://www.quarkshk.org/gender-affirming-care?utm_source=chatgpt.com' }],
  doses: { E2_mg: '2-6 mg/日', T_mg: '—' }
},

// 香港（FTM：T）
{
  id: 'hk-ftm-t',
  countryCode: 'HK', countryZh: '香港', countryEn: 'Hong Kong',
  center: '多家門診（社群回報）', doctor: '—',
  kind: 'FTM',
  drug: 'testosterone',
  route: '肌肉注射 / 皮下注射',
  rangeText: '常見每週或雙週注射；公立與私家做法略有差異，依血檢與臨床反應調整。',
  stability: 4,
  notes: '建議規律追蹤 Hct/Hgb、T 濃度與副作用；未成年與保險規範需另依院所流程。',
  tags: ['香港', '睪酮'],
  sources: [{ name: '社群討論（香港）', url: 'https://www.quarkshk.org/gender-affirming-care?utm_source=chatgpt.com' }],
  doses: { E2_mg: '—', T_mg: '50-100 mg/週' }
},
  // 泰國（MTF：E2 + CPA 常見）
  {
    id:'th-mtf-e2',
    countryZh:'泰國', countryEn:'Thailand',
    center:'部分診所（社群回報）', doctor:'—',
    kind:'MTF', drug:'17β-estradiol', route:'oral / injection',
    rangeText:'部分診所傾向較高劑量；需注意血栓風險。',
    stability:3,
    notes:'CPA 在當地常見；務必依醫囑與血檢調整。',
    tags:['泰國','雌二醇','CPA'],
    sources:[
    { name:'跨性別激素治療評論', url:'https://www.researchgate.net/publication/258580821_THe_Use_of_Hormone_Therapy_in_the_Male-to-Female_Transgender_Population_Issues_for_Consideration_in_Thailand?utm_source=chatgpt.com'},
    { name:'當地診所實際服務（MTF/FTM））', url:'https://hum-clinic.com/service/transgender-hormone-therapy-bangkok/?utm_source=chatgpt.com'}
    ],
    doses:{ E2_mg:'2–6 mg/日（口服）或依針劑', T_mg:'—' }
  },
  {
  id:'th-ftm-t',
  countryZh:'泰國', countryEn:'Thailand',
  center:'部分診所（社群回報）', doctor:'—',
  kind:'FTM',
  drug:'testosterone',
  route:'IM / SC',  // 會被 mapRoute 顯示成「肌肉注射 / 皮下注射」
  rangeText:'常見每週或雙週注射；部分院所提供長效製劑（如 TU，每 8–12 週），依血檢與臨床反應調整。',
  stability:3,
  notes:'建議監測 Hct/Hgb、總T/遊離T、情緒與副作用；旅遊醫療可能造成製劑與劑量差異，需個別化調整。',
  tags:['泰國','睪酮'],
  sources:[{ name:'當地診所實際服務（MTF/FTM））', url:'https://hum-clinic.com/service/transgender-hormone-therapy-bangkok/?utm_source=chatgpt.com' }],
  doses:{ E2_mg:'—', T_mg:'50–100 mg/週（短效）；或 TU 1000 mg/8–12 週' }
}
];

/* ====== 2) 選單初始化（國家用中文顯示，但值同時含中文+英文，方便搜尋） ====== */
const $  = (sel,root=document)=>root.querySelector(sel);
const $$ = (sel,root=document)=>[...root.querySelectorAll(sel)];

const table   = $('#tbl');
const theadTr = $('#tbl thead tr') || (function(){
  // 若頁面還沒放 thead，我們自動建立（不改原 HTML）
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  thead.appendChild(tr);
  table.prepend(thead);
  return tr;
})();
const tbody       = $('#tbl tbody') || (function(){
  const tb = document.createElement('tbody');
  table.appendChild(tb);
  return tb;
})();

const selCountry  = $('#filterCountry');
const selDrug     = $('#filterDrug');
const selKind     = $('#filterKind');
const q           = $('#q');
const count       = $('#count');
const drawer      = $('#drawer');

/* === 國家同義詞（簡體／繁體／日文常用稱呼／英文／縮寫）=== */
const COUNTRY_ALIASES = {
  taiwan: ['台灣','臺灣','台湾','taiwan','tw','中華民國','roc','republic of china (taiwan)'],
  united_states: ['美國','美国','united states','usa','us','u.s.','u.s.a.','america','アメリカ','米国'],
  hong_kong: ['香港','hong kong','hk','ホンコン','香港特別行政区','hongkong'],
  thailand: ['泰國','泰国','thailand','thai','th','タイ','タイ王国']
};

/* 把 countryZh/En 映射成上面字典的 key（你也可改成讀 item.countryCode） */
function countryKeyOf(item){
  const zh = (item.countryZh || '');
  const en = (item.countryEn || '').toLowerCase();
  if (zh.includes('臺') || zh.includes('台') || en.includes('taiwan')) return 'taiwan';
  if (zh.includes('美') || en.includes('united states') || en === 'us') return 'united_states';
  if (zh.includes('香') || en.includes('hong')) return 'hong_kong';
  if (zh.includes('泰') || en.includes('thailand')) return 'thailand';
  return '';
}

/* 字串正規化：小寫、去多空白、全形→半形 */
function norm(s){
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[！-～]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)) // 全形轉半形
    .trim();
}

/* 建立每列的搜尋草堆（含同義詞） */
function haystackOf(item){
  const parts = [
    item.countryZh, item.countryEn, item.center, item.doctor,
    item.kind, item.drug, item.route, item.rangeText,
    (item.tags||[]).join(' '), (item.notes||''),
    item.doses?.E2_mg || '', item.doses?.T_mg || ''
  ];
  const key = countryKeyOf(item);
  if (key && COUNTRY_ALIASES[key]) parts.push(COUNTRY_ALIASES[key].join(' '));
  return norm(parts.join(' '));
}

function uniq(list){ return [...new Set(list)].sort(); }
function initFilters(){
  const countries = uniq(DATA.map(x=> `${x.countryZh}｜${x.countryEn}`));
  const drugs     = uniq(DATA.map(x=> x.drug));

  countries.forEach(c=>{
    // 顯示中文（+英文小字），值用「中文｜英文」方便過濾
    const [zh,en] = c.split('｜');
    const opt = new Option(`${zh} / ${en}`, c);
    selCountry.add(opt);
  });
  drugs.forEach(d=> selDrug.add(new Option(d,d)));
}
initFilters();

/* ====== 2.1 設定表頭（自動補上 E2/T 欄位） ====== */
(function setupHeader(){
  theadTr.innerHTML = `
    <th>國家/地區</th>
    <th>醫療單位 / 醫師</th>
    <th>對象</th>
    <th>藥物 / 途徑</th>
    <th>常用 E2（mg/日）</th>
    <th>常用 T（mg/週）</th>
    <th>社群範圍/備註</th>
    <th>穩定度</th>
    <th>來源</th>
  `;
})();

/* ====== 3) 篩選 + 繪表 ====== */
function match(item){
  const k   = selKind?.value || '';
  const c   = selCountry?.value || '';
  const d   = selDrug?.value || '';
  const keyRaw = (q?.value || '').trim();

  if (k && item.kind !== k) return false;
  if (c){
    const [czh, cen] = c.split('｜');
    if (item.countryZh !== czh || item.countryEn !== cen) return false;
  }
  if (d && item.drug !== d) return false;

  if (!keyRaw) return true;              // 沒輸入關鍵字就通過

  const hay = haystackOf(item);          // 含同義詞的草堆
  const key = norm(keyRaw);              // 正規化關鍵字

  // 支援多關鍵字：空白分詞後每個都要命中
  return key.split(/\s+/).every(term => hay.includes(term));
}
function star(n){ return '★'.repeat(n)+'☆'.repeat(5-(n||0)); }
function countryCell(zh,en){
  return `<span class="country-zh">${zh}</span><span class="country-en">${en}</span>`;
}
// 英文 → 中文（給途徑用）
const ROUTE_MAP = {
  oral: '口服',
  sublingual: '舌下含服',
  injection: '注射',
  im: '肌肉注射',
  sc: '皮下注射',
  'im/sc': '肌肉/皮下注射',
  transdermal: '經皮貼片'
};
function mapRoute(str){
  if (!str) return '—';
  return String(str)
    .split('/')
    .map(s => ROUTE_MAP[s.trim().toLowerCase()] || s.trim())
    .join(' / ');
}
function render(){
  const rows = DATA.filter(match);
  if (count) count.textContent = `${rows.length} 筆`;
  tbody.innerHTML = '';

  rows.forEach(item=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${countryCell(item.countryZh, item.countryEn)}</td>
      <td>${item.center}${item.doctor && item.doctor!=='—' ? '｜'+item.doctor : ''}</td>
      <td><span class="badge">${item.kind}</span></td>
      <td>
        <div class="tag">${item.drug}</div>
        <div class="tag">${mapRoute(item.route)}</div>
      </td>
      <td>${item.doses?.E2_mg || '—'}</td>      <!-- 常用 E2（mg/日） -->
      <td>${item.doses?.T_mg  || '—'}</td>      <!-- 常用 T（mg/週） -->
      <td>${item.rangeText || '—'}</td>         <!-- 社群範圍/備註 -->
      <td>${star(item.stability||3)}</td>       <!-- 穩定度 -->
      <td>${(item.sources && item.sources.length) ? '<span class="link">點擊看來源</span>' : '—'}</td>
    `;
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', ()=>openDrawer(item));
    tbody.appendChild(tr);
  });
}
['input','change'].forEach(ev=>{
  q && q.addEventListener(ev, render);
  selCountry && selCountry.addEventListener(ev, render);
  selDrug && selDrug.addEventListener(ev, render);
  selKind && selKind.addEventListener(ev, render);
});
render();

/* ====== 4) 右側詳情抽屜：補充顯示 E2/T 劑量 ====== */
function openDrawer(item){
  const dTitle = $('#dv-title');
  const kv     = $('#dv-kv');
  const dNotes = $('#dv-notes');
  const dSrc   = $('#dv-sources');

  if (dTitle) dTitle.textContent = `${item.countryZh}/${item.countryEn}・${item.center}`;

  if (kv) kv.innerHTML = `
  <div>醫師/單位</div><div>${(item.doctor || '—')} / ${item.center}</div>
  <div>對象</div><div>${item.kind}</div>
  <div>藥物</div><div>${item.drug}</div>
  <div>途徑</div><div>${mapRoute(item.route)}</div>   <!-- ← 這裡改用中文 -->
  <div>E2（mg/日）</div><div>${item.doses?.E2_mg || '—'}</div>
  <div>T（mg/週）</div><div>${item.doses?.T_mg  || '—'}</div>
  <div>穩定度</div><div>${star(item.stability||3)}</div>
  <div>標籤</div><div>${(item.tags||[]).map(t=>`<span class="tag">${t}</span>`).join(' ')||'—'}</div>
`;

  if (dNotes) dNotes.textContent = item.notes || '—';
  if (dSrc) dSrc.innerHTML = (item.sources||[]).map(s=>`<div>• <a class="link" href="${s.url}" target="_blank" rel="noopener">${s.name}</a></div>`).join('') || '—';

  if (drawer){
    drawer.classList.add('show');
    drawer.setAttribute('aria-hidden','false');
  }
}
$('#dv-close')?.addEventListener('click', closeDrawer);
drawer?.addEventListener('click', (e)=>{ if(e.target===drawer) closeDrawer(); });
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeDrawer(); });
function closeDrawer(){
  if (!drawer) return;
  drawer.classList.remove('show');
  drawer.setAttribute('aria-hidden','true');
}

/* ====== 5) 備註 ======
- 之後要「大量擴充資料」，只要照著 DATA 的 schema 增加物件即可。
- 國家顯示：直接填 countryZh/countryEn；濾選用「中文｜英文」不影響你原本 UI。
================================================ */
/* =======================
   血檢數值 → 區間對照小工具（JS 動態注入）
   ======================= */

// === 參考帶（基準單位：E2=pmol/L, T=nmol/L, P4=nmol/L） ===
const REF = {
  E2: [
    { label:'停經後',     range:[0,184] },      // <50 pg/mL
    { label:'濾泡期',     range:[46,607] },     // 12–166 pg/mL
    { label:'排卵高峰',   range:[315,1828] },   // 86–498 pg/mL
    { label:'黃體期',     range:[161,774] }     // 44–211 pg/mL
  ],
  T: [
    { label:'低於女性參考', range:[-Infinity,0.3] },
    { label:'女性參考範圍', range:[0.3,3.0] },
    { label:'女上緣/男下緣', range:[3.0,10] },
    { label:'典型男性',     range:[10,35] },
    { label:'高於典型男性', range:[35,Infinity] }
  ],
  // 孕酮（P4）粗分帶，用於週期判斷（nmol/L）
  P4: [
    { label:'極低',  range:[-Infinity,1] },     // ~<0.3 ng/mL
    { label:'低',    range:[1,5] },             // 濾泡/排卵前
    { label:'中',    range:[5,10] },            // 接近黃體起始
    { label:'高',    range:[10,80] },           // 黃體期典型
    { label:'很高',  range:[80,Infinity] }
  ]
};

// === 單位換算 ===
const UNIT = {
  E2: { list:['pmol/L','pg/mL'],  toBase:(v,u)=> u==='pg/mL' ? v*3.671 : v,  base:'pmol/L' },
  T : { list:['nmol/L','ng/dL'],  toBase:(v,u)=> u==='ng/dL' ? v*0.0347 : v, base:'nmol/L' },
  P4: { list:['nmol/L','ng/mL'],  toBase:(v,u)=> u==='ng/mL' ? v*3.18 : v,   base:'nmol/L' } // ~3.18
};

// === 嵌入到 .controls 右側 ===
// ========== 產生「水平對照」小工具（固定寬、置中、P4條件啟用） ==========
(function mountLevelWidget(){
  const host = document.querySelector('.controls');
  if (!host || document.getElementById('lv-widget')) return;

  // 動態注入一點點樣式（不改全站 CSS）
  const css = `
    #lv-widget { width:100%; display:flex; justify-content:center; margin-top:8px; }
    #lv-row { display:flex; flex-wrap:wrap; align-items:center; gap:10px;
              background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08);
              border-radius:12px; padding:10px 12px; -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px); }
    #lv-row .lv-input { width:160px; min-width:160px; }          /* 固定寬度 */
    #lv-row .lv-unit  { width:120px; min-width:120px; }
    #lv-row .lv-chip  { background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
                         border-radius:999px; padding:6px 10px; color:#cfe6ff; white-space:nowrap; }
    #lv-row .lv-dim   { opacity:.45; pointer-events:none; }       /* 禁用時變暗 */
  `;
  const s = document.createElement('style');
  s.id = 'lv-style';
  s.textContent = css;
  document.head.appendChild(s);

  // 元件骨架
  const box = document.createElement('div');
  box.id = 'lv-widget';
  box.innerHTML = `
    <div id="lv-row" role="group" aria-label="激素水平對照">
      <select id="lv-mode" class="input lv-unit" title="選擇模式">
        <option value="E2">雌激素（E2） 對照</option>
        <option value="T">睪酮（T） 對照</option>
        <option value="cycle">週期分析（E2+P4）</option>
      </select>

      <input id="lv-e2v" class="input lv-input" type="number" step="any" placeholder="激素 數值">
      <select id="lv-e2u" class="input lv-unit">
        <option>pmol/L</option><option>pg/mL</option>
      </select>

      <input id="lv-p4v" class="input lv-input" type="number" step="any" placeholder="孕酮 P4 數值">
      <select id="lv-p4u" class="input lv-unit">
        <option>nmol/L</option><option>ng/mL</option>
      </select>

      <span id="lv-out" class="lv-chip">請輸入數值</span>
    </div>
  `;
  host.appendChild(box);

  // 取得節點
  const modeSel = document.getElementById('lv-mode');
  const e2v = document.getElementById('lv-e2v');
  const e2u = document.getElementById('lv-e2u');
  const p4v = document.getElementById('lv-p4v');
  const p4u = document.getElementById('lv-p4u');
  const out = document.getElementById('lv-out');

  // 參考區間與單位換算，用你先前定義好的 REF / UNIT
  const bandOf = (bands, x) => {
    for (const b of bands){ const [lo, hi] = b.range; if (x >= lo && x < hi) return b.label; }
    return '—';
  };
  const cyclePhase = (e2b, p4b)=>{
    // 簡單規則：P4 高 → 黃體期；P4 低時用 E2 判斷濾泡/排卵
    if (p4b >= 10) return '黃體期（P4 高）';
    if (e2b >= 315) return '排卵高峰';
    if (e2b >= 46)  return '濾泡期';
    return '停經後或極低';
  };

  function updateP4Enabled(){
    const on = (modeSel.value === 'cycle');
    [p4v, p4u].forEach(el=>{
      el.disabled = !on;
      el.classList.toggle('lv-dim', !on);
    });
  }

  function compute(){
    const mode = modeSel.value;

    if (mode === 'E2'){
      const raw = parseFloat(e2v.value);
      if (isNaN(raw)){ out.textContent = '請輸入數值'; return; }
      const base = (e2u.value === 'pg/mL') ? raw * 3.671 : raw; // pmol/L
      const band = bandOf(REF.E2, base);
      out.textContent = `E2 ≈ ${Math.round(base)} pmol/L，對應：${band}`;
      return;
    }

    if (mode === 'T'){
      // 只借用 E2 欄位輸入數值 + 單位換成 T，避免再加欄位
      const raw = parseFloat(e2v.value);
      if (isNaN(raw)){ out.textContent = '請輸入數值'; return; }
      // 把 e2u 下拉當成 T 單位選：nmol/L / ng/dL
      const unit = e2u.value; // 你也可把 e2u 的選項換成 nmol/L / ng/dL
      const base = (unit === 'ng/dL') ? raw * 0.0347 : raw; // nmol/L
      const band = bandOf(REF.T, base);
      out.textContent = `T ≈ ${base.toFixed(2)} nmol/L，對應：${band}`;
      return;
    }

    // cycle：E2 + P4 都要
    const vE2 = parseFloat(e2v.value);
    const vP4 = parseFloat(p4v.value);
    if (isNaN(vE2) || isNaN(vP4)){ out.textContent = '請同時輸入 E2 與 P4'; return; }

    const e2base = (e2u.value === 'pg/mL') ? vE2 * 3.671 : vE2;  // pmol/L
    const p4base = (p4u.value === 'ng/mL') ? vP4 * 3.18   : vP4;  // nmol/L
    const phase  = cyclePhase(e2base, p4base);
    const p4Band = bandOf(REF.P4, p4base); // 低 / 中 / 高

    out.textContent =
      `E2 ≈ ${Math.round(e2base)} pmol/L、` +
      `P4 ≈ ${p4base.toFixed(2)} nmol/L（${p4Band}） → 判定：${phase}`;
  }

  // 初始：模式=E2，P4 禁用且變暗
  updateP4Enabled();
  compute();

  // 事件
  ['input','change'].forEach(ev=>{
    e2v.addEventListener(ev, compute);
    e2u.addEventListener(ev, compute);
    p4v.addEventListener(ev, compute);
    p4u.addEventListener(ev, compute);
  });
  modeSel.addEventListener('change', ()=>{
    // 切換模式時，固定寬度不變，只改啟用狀態
    updateP4Enabled();
    // 若你想在 T 模式把單位選單改成 nmol/L & ng/dL，可在這裡動態替換選項
    compute();
  });
})();
/* =========== Cute Theme 2.0（高權重、帶註解）=========== */
(function applyCuteTheme(){
  // 1) 在 <html> 加一個旗標 class，讓選擇器更有力
  document.documentElement.classList.add('cute-theme');

  // 2) 注入樣式（最後載入、權重更高）
  if (document.getElementById('dyn-style-cute-2')) return;
  const s = document.createElement('style');
  s.id = 'dyn-style-cute-2';
  s.textContent = `
/* —— 全域色票：可改主色 —— */
:root{
  --accent: var(--accent, #b78ad3);         /* 主色（膠囊重點色） */
  --cute-text: #a2e0e8ff;                      /* 可愛風文字色 */
  --cute-bg: rgba(197, 132, 197, 0.08);          /* 玻璃底色（較淡） */
  --cute-bg-2: rgba(205, 191, 151, 0.23);        /* hover 時更亮 */
  --cute-br: rgba(206, 150, 222, 0.28);          /* 邊框 */
  --cute-shadow: 0 12px 32px rgba(175, 125, 176, 0.28);/* 按鈕陰影 */
}

/* —— 通用膠囊按鈕（.btn / 任意 button）—— */
.cute-theme :is(.btn, button){
  appearance:none !important;
  border:1px solid var(--cute-br) !important;         /* 邊框 */
  color:var(--cute-text) !important;                  /* 文字色 */
  background:
    linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,.10)),
    radial-gradient(120% 120% at 0% 0%, color-mix(in oklab, var(--accent) 60%, transparent), transparent) !important; /* 玻璃+淡漸層 */
  padding:10px 16px !important;                       /* 內距（大小） */
  border-radius:999px !important;                     /* 膠囊圓角 */
  font-weight:600 !important;                         /* 粗體一點 */
  box-shadow: var(--cute-shadow) !important;          /* 立體陰影 */
  -webkit-backdrop-filter: blur(10px) !important;
  backdrop-filter: blur(10px) !important;             /* 磨砂 */
  transition: transform .12s ease, box-shadow .2s ease, border-color .2s ease, filter .2s ease !important; /* 動效 */
}
.cute-theme :is(.btn, button):hover{
  transform: translateY(-1px) !important;             /*  hover 微浮起 */
  filter: brightness(1.05) saturate(1.05) !important; /*  微增亮 */
}
.cute-theme :is(.btn, button):active{
  transform: translateY(0) !important;
  box-shadow: 0 8px 22px rgba(0,0,0,.24) !important;  /*  按下陰影 */
}
.cute-theme .btn.primary{
  background: linear-gradient(135deg, var(--accent), #8f6ec1) !important; /* 主按鈕漸層 */
  border-color: transparent !important;
}

/* —— Chip / tag 類（.chip）—— */
.cute-theme .chip{
  color:#e7ecff !important;                           /* 文字色 */
  border:1px solid var(--cute-br) !important;         /* 邊框 */
  background: var(--cute-bg) !important;              /* 玻璃底 */
  padding:6px 12px !important;                        /* 內距 */
  border-radius:999px !important;                     /* 膠囊 */
  -webkit-backdrop-filter: blur(10px) !important;
  backdrop-filter: blur(10px) !important;             /* 磨砂 */
}

/* —— 輸入框 / 下拉（.input, select）—— */
.cute-theme :is(.input, select){
  background: var(--cute-bg) !important;              /* 玻璃底 */
  border:1px solid var(--cute-br) !important;         /* 邊框 */
  color:var(--cute-text) !important;                  /* 文字色 */
  padding:10px 14px !important;                       /* 內距（大小） */
  border-radius:999px !important;                     /* 膠囊 */
  min-height:40px !important;                         /* 統一高度 */
  box-shadow: inset 0 1px 0 rgba(255,255,255,.18) !important; /* 內陰影 */
  -webkit-backdrop-filter: blur(10px) !important;
  backdrop-filter: blur(10px) !important;             /* 磨砂 */
  outline: none !important;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease !important;
}
.cute-theme :is(.input, select)::placeholder{
  color: rgba(255,255,255,.7) !important;             /* placeholder 色 */
}
.cute-theme :is(.input, select):hover{
  background: var(--cute-bg-2) !important;            /* hover 更亮 */
}
.cute-theme :is(.input, select):focus{
  border-color: color-mix(in oklab, var(--accent) 65%, white 0%) !important; /* 聚焦邊框色 */
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 35%, transparent) !important; /* 外光暈 */
}

/* —— 連結（來源）—— */
.cute-theme a.link{
  color: #9fd3ff !important;                          /* 淡藍 */
  text-decoration: none !important;
}
.cute-theme a.link:hover{
  text-decoration: underline !important;
}

/* —— 控制列更鬆並置中 —— */
.cute-theme .controls{
  gap:12px !important;
  justify-content:center !important;
}
  `;
  document.head.appendChild(s);

  // 3) 自動補上 .btn：把沒 class 的 <button> 也變漂亮
  document.querySelectorAll('button:not(.btn)').forEach(b=> b.classList.add('btn'));

  // 4) 如果是 SPA/動態渲染，監聽後續節點變化再補一次
  const mo = new MutationObserver(()=>{
    document.querySelectorAll('button:not(.btn)').forEach(b=> b.classList.add('btn'));
  });
  mo.observe(document.body, {childList:true, subtree:true});
})();
(function cuteGirlTheme(){
  // 如果已經加過就不重複
  if (document.getElementById('cute-btn-style')) return;

  const style = document.createElement('style');
  style.id = 'cute-btn-style';
  style.textContent = `
/* 按鈕＆輸入框少女系扁平風 */
button, .btn, input[type="button"], input[type="submit"], select {
  background: linear-gradient(135deg, #ffc4d6, #ffdde1) !important; /* 粉漸層 */
  border: none !important; /* 移除黑邊 */
  border-radius: 999px !important; /* 膠囊圓角 */
  color: #fff !important; /* 白色文字 */
  font-weight: bold !important;
  padding: 8px 16px !important;
  box-shadow: none !important; /* 移除立體陰影 */
  transition: background 0.3s ease, transform 0.15s ease !important;
}

/* hover 狀態：顏色稍微亮一點 */
button:hover, .btn:hover, input[type="button"]:hover, input[type="submit"]:hover, select:hover {
  background: linear-gradient(135deg, #ffb0c5, #ffc9d6) !important;
  transform: translateY(-1px) !important;
}

/* active 狀態：按下去時微暗 */
button:active, .btn:active, input[type="button"]:active, input[type="submit"]:active, select:active {
  background: linear-gradient(135deg, #ff99b3, #ffb6c6) !important;
  transform: translateY(1px) !important;
}

/* 輸入框少女系 */
input[type="text"], input[type="number"], .input {
  background: #fff5f8 !important; /* 淺粉背景 */
  border: 1px solid #ffb6c6 !important;
  border-radius: 999px !important;
  padding: 6px 12px !important;
  color: #333 !important;
  box-shadow: none !important;
}

input[type="text"]::placeholder, input[type="number"]::placeholder {
  color: #ff99b3 !important;
}
  `;
  document.head.appendChild(style);
})();
/* ============== Cute UI Override (Safari/深色主題也吃得到) ============== */
(function applyCuteUI(){
  // 讓選擇器更有力量：在 <html> 加旗標
  document.documentElement.classList.add('cute-theme');

  // 防重複
  if (document.getElementById('cute-theme-style')) return;

  const css = `
  /* 調色（想換色改這裡） */
  :root{
    --cute-accent: #b78ad3;            /* 主色 */
    --cute-text:   #5e4b56;            /* 文字（深紫灰） */
    --cute-bg:     #fff5f8;            /* 淺粉底 */
    --cute-bg-2:   #ffeef8;            /* hover 更亮 */
    --cute-br:     #ffc9de;            /* 邊框粉 */
  }

  /* —— 所有表單控件：input/select/textarea —— */
  .cute-theme input[type="text"],
  .cute-theme input[type="search"],
  .cute-theme input[type="number"],
  .cute-theme input[type="email"],
  .cute-theme input[type="password"],
  .cute-theme select,
  .cute-theme .input{
    -webkit-appearance: none !important;
    appearance: none !important;               /* 關掉原生樣式（重點） */
    background: var(--cute-bg) !important;     /* 淺粉 */
    color: var(--cute-text) !important;
    border: 1.5px solid var(--cute-br) !important;
    border-radius: 999px !important;           /* 膠囊 */
    padding: 10px 14px !important;
    min-height: 40px !important;
    box-shadow: none !important;               /* 去機械感陰影 */
    outline: none !important;
    transition: background .2s ease, border-color .2s ease !important;
  }
  .cute-theme select{
    padding-right: 32px !important;            /* 預留箭頭空間 */
    background-image:
      linear-gradient(45deg, transparent 50%, var(--cute-text) 50%),
      linear-gradient(135deg, var(--cute-text) 50%, transparent 50%);
    background-position:
      calc(100% - 18px) 16px, calc(100% - 12px) 16px; /* 自製小箭頭 */
    background-size: 6px 6px, 6px 6px;
    background-repeat: no-repeat;
  }
  .cute-theme :is(input,select).lv-dim{        /* 你的小工具禁用態 */
    opacity:.45 !important; pointer-events:none !important;
  }
  .cute-theme :is(input,select):hover{
    background: var(--cute-bg-2) !important;
  }
  .cute-theme :is(input,select):focus{
    border-color: var(--cute-accent) !important;
    box-shadow: 0 0 0 3px rgba(183,138,211,.22) !important;
  }

  /* —— 按鈕 —— */
  .cute-theme :is(.btn, button){
    -webkit-appearance: none !important;
    appearance: none !important;
    background: linear-gradient(135deg, #ffc4d6, #ffdde1) !important;
    color: #744b6b !important;
    border: 1.5px solid var(--cute-br) !important;
    border-radius: 999px !important;
    padding: 10px 16px !important;
    font-weight: 700 !important;
    box-shadow: none !important;
    cursor: pointer !important;
    transition: transform .12s ease, background .2s ease !important;
  }
  .cute-theme :is(.btn, button):hover{
    transform: translateY(-1px) !important;
    background: linear-gradient(135deg, #ffbcd2, #ffd7e2) !important;
  }
  .cute-theme :is(.btn, button):active{
    transform: translateY(0) !important;
    background: linear-gradient(135deg, #ffb0c8, #ffc9da) !important;
  }

  /* —— chip 標籤 —— */
  .cute-theme .chip{
    -webkit-appearance: none !important;
    appearance: none !important;
    background: #ffe3f0 !important;
    color: #744b6b !important;
    border: 1px solid var(--cute-br) !important;
    border-radius: 999px !important;
    box-shadow: none !important;
  }
/* —— 讓輸入框裡的 placeholder 也看得清楚 —— */
.cute-theme input::placeholder,
.cute-theme .input::placeholder,
.cute-theme textarea::placeholder {
  color: var(--cute-text) !important;  /* 用同樣的文字顏色 */
  opacity: 0.6 !important;             /* 適度透明，不會太暗 */
}
  /* —— 控制區置中，間距柔和 —— */
  .cute-theme .controls{
    justify-content: center !important;
    gap: 12px !important;
  }`;

  const style = document.createElement('style');
  style.id = 'cute-theme-style';
  style.textContent = css;
  document.head.appendChild(style);

  // 把沒有 .btn 的 button 也加上（避免漏網）
  document.querySelectorAll('button:not(.btn)').forEach(b => b.classList.add('btn'));

  // SPA/動態節點監聽（可選）
  new MutationObserver(() => {
    document.querySelectorAll('button:not(.btn)').forEach(b => b.classList.add('btn'));
  }).observe(document.body, {childList:true, subtree:true});
})();
// 監聽滾動，顯示/隱藏按鈕
window.addEventListener('scroll', function() {
  const btn = document.getElementById('backToTop');
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    btn.style.display = 'block';
  } else {
    btn.style.display = 'none';
  }
});

// 點擊回到頂部
document.getElementById('backToTop').addEventListener('click', function() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
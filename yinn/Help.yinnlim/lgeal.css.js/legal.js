/* ===== 資料：先給你一批種子，之後可一直擴充 ===== */
const DATA = {
  tw: [
    {
      title:'法律扶助基金會',
      desc:'低收入或特殊情況者可申請法律扶助，提供律師諮詢、訴訟協助。',
      chips:['免費/減免','律師諮詢','訴訟協助'],
      links:[
        {label:'🌐 官方網站', url:'https://www.laf.org.tw/'},
        {label:'📞 服務專線', url:'tel:412-8518'}
      ]
    },
    {
      title:'台灣同志諮詢熱線協會｜法律與性別平等資源',
      desc:'提供性少數工作、校園、租屋等情境之權益資訊與轉介。',
      chips:['LGBTQ+','法權資訊','轉介'],
      links:[
        {label:'🌐 網站', url:'https://hotline.org.tw/'}
      ]
    },
    {
      title:'各縣市政府｜性別平等委員會/申訴管道',
      desc:'遇到性別歧視、職場或校園不當對待，可循地方政府與學校系統申訴。',
      chips:['性平申訴','公部門'],
      links:[{label:'🔎 查詢地方管道', url:'https://www.gender.ey.gov.tw/'}]
    }
  ],
  cn: [
    {
      title:'12348 公共法律服務',
      desc:'官方法律諮詢熱線與線上諮詢；可就民事、勞動、消費等問題尋求意見。',
      chips:['電話諮詢','官方','免費'],
      links:[{label:'📞 撥打 12348', url:'tel:12348'}]
    },
    {
      title:'法律援助中心（各地）',
      desc:'經濟困難或特別案件可申請法律援助，提供律師諮詢/訴訟協助。',
      chips:['法援','律師諮詢'],
      links:[{label:'🔎 搜尋所在地法援', url:'https://www.12348.gov.cn/'}] // 之後補各地連結
    }
    // 若你有合作或社群整理的性少數友善律師，也可在這裡持續補上
  ],
  hk: [
    {
      title:'平等機會委員會（EOC）',
      desc:'受性傾向或性別重置歧視可向 EOC 投訴並尋求調解。',
      chips:['反歧視','投訴/調解','政府'],
      links:[{label:'🌐 官方網站', url:'https://www.eoc.org.hk/'}]
    },
    {
      title:'法律援助署（Legal Aid Department）',
      desc:'經審查後提供民事/刑事法律援助。',
      chips:['法援','律師'],
      links:[{label:'🌐 官方網站', url:'https://www.lad.gov.hk/'}]
    },
    {
      title:'當值律師服務（Duty Lawyer Service）/免費法律諮詢計劃',
      desc:'提供初步法律意見與轉介。',
      chips:['初談','轉介'],
      links:[{label:'🌐 官方網站', url:'https://www.dutylawyer.org.hk/'}]
    }
  ],
  intl: [
    {
      title:'ILGA World',
      desc:'國際性少數權益網絡，匯整各國法規與年報。',
      chips:['國際','法規總覽'],
      links:[{label:'🌐 官方網站', url:'https://ilga.org/'}]
    },
    {
      title:'Lambda Legal（US）',
      desc:'美國性少數法扶組織，提供案件支援與法律資源（英文）。',
      chips:['法律支援','英文'],
      links:[{label:'🌐 官方網站', url:'https://www.lambdalegal.org/'}]
    },
    {
      title:'ACLU（US）LGBTQ+',
      desc:'美國公民自由聯盟之 LGBTQ+ 法權頁（英文）。',
      chips:['權益指南','英文'],
      links:[{label:'🌐 官方網站', url:'https://www.aclu.org/issues/lgbtq-rights'}]
    }
  ]
};

/* ===== 繪製卡片 ===== */
const list = document.getElementById('list');
function render(region='tw'){
  list.innerHTML = '';
  (DATA[region]||[]).forEach(item=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="title">${item.title}</div>
      <div class="desc">${item.desc||''}</div>
      <div class="chips">${(item.chips||[]).map(t=>`<span class="chip">${t}</span>`).join('')}</div>
      <div class="actions">
        ${(item.links||[]).map(l=>`<a class="btn" href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label}</a>`).join('')}
      </div>
    `;
    list.appendChild(card);
  });
}
render('tw');

/* ===== 分頁切換 ===== */
const tabs = document.getElementById('tabs');
tabs.addEventListener('click', e=>{
  const t = e.target.closest('.tab'); if(!t) return;
  tabs.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  render(t.dataset.region);
});

/* ===== 主題切換、回頂 ===== */
const html = document.documentElement;
document.getElementById('toggleTheme').addEventListener('click', ()=>{
  html.setAttribute('data-theme', html.getAttribute('data-theme')==='dark' ? 'light':'dark');
});
const goTop = document.getElementById('goTop');
window.addEventListener('scroll', ()=>{ goTop.classList.toggle('show', window.scrollY>300); });
goTop.addEventListener('click', ()=>{ window.scrollTo({top:0,behavior:'smooth'}); });

/* 跑馬燈內容寬度不夠時複製一份避免空檔 */
const hl = document.getElementById('heroLine');
function ensureLoop(){
  if(hl.scrollWidth/2 < hl.parentElement.offsetWidth){ hl.innerHTML += hl.innerHTML; }
}
window.addEventListener('load', ensureLoop);
window.addEventListener('resize', ensureLoop);
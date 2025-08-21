// LeanCloud 初始化
AV.init({
  appId: 'jxPF13ZiTBmbFt75fXRnYs42-gzGzoHsz',
  appKey: 'ydXYcG0fGtWLgWetR0szCygQ',
  serverURL: 'https://jxpf13zi.lc-cn-n1-shared.com'
});
// 🎉 彩帶特效（可選）
function burstConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

// 💡 發光與抖動
function shakeAndGlow(element) {
  element.classList.add("shake", "glow");
  setTimeout(() => {
    element.classList.remove("shake", "glow");
  }, 600);
}

// 🐾 導向註冊頁面
function goToRegister(btn) {
  btn.innerText = "🪐"; // 符號變換
  setTimeout(() => {
    window.location.href = "register.html";
  }, 600);
}

// ✅ 登入主邏輯
async function login() {
  burstConfetti();
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const noticeId = "loginNotice";

  // 清除舊提示
  const oldNotice = document.getElementById(noticeId);
  if (oldNotice) oldNotice.remove();

  // ✅ 驗證格式：email & password
  const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email && !password) {
    shakeAndGlow(emailInput);
    shakeAndGlow(passwordInput);
    showNotice("請輸入帳號與密碼", noticeId);
    return;
  }

  if (!emailFormat.test(email)) {
    shakeAndGlow(emailInput);
    showNotice("⚠️ 請輸入正確的電子郵件格式", noticeId);
    return;
  }

  if (!email || !password) {
    if (!email) shakeAndGlow(emailInput);
    if (!password) shakeAndGlow(passwordInput);
    showNotice("輸入帳號或密碼有誤", noticeId);
    return;
  }

  try {
    // 🔍 查詢帳號是否存在
    const query = new AV.Query("_User");
    query.equalTo("email", email);
    const user = await query.first();

    if (!user) {
      showNotice(`
        ❌ 此帳號尚未註冊<br>
        是否前往註冊？請點擊 <span id="registerRedirect" style="cursor:pointer; font-size: 22px;">🐾</span>
      `, noticeId);
      document.getElementById("registerRedirect").onclick = function () {
        goToRegister(this);
      };
      return;
    }

    // ✅ 存在 → 嘗試登入
    await AV.User.logIn(email, password);
    burstConfetti();
    showNotice("🎉 登入成功！", noticeId);
    setTimeout(() => {
      window.location.href = "../LimCn.html";
    }, 1000);

  } catch (error) {
    if (error.code === 210) {
      shakeAndGlow(passwordInput);
      showNotice("❌ 登入失敗：密碼錯誤", noticeId);
    } else {
      showNotice("❌ 登入失敗：" + error.message, noticeId);
    }
  }
}

// 👁️ 顯示提示訊息
function showNotice(msg, id) {
  const notice = document.createElement("div");
  notice.id = id;
  notice.style.textAlign = "center";
  notice.style.marginTop = "12px";
  notice.style.color = "#c0392b";
  notice.innerHTML = msg;
  document.querySelector(".login-box").appendChild(notice);
}

// 📌 掛給 HTML
window.login = login;


  function goToHomepage() {
    window.location.href = "../LimCn.html"; // 根據你主頁的實際路徑修改
  }
  function goBack() {
  history.back(); // 回上一頁
}
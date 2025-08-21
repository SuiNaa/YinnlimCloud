  // LeanCloud 初始化
AV.init({
  appId: 'jxPF13ZiTBmbFt75fXRnYs42-gzGzoHsz',
  appKey: 'ydXYcG0fGtWLgWetR0szCygQ',
  serverURL: 'https://jxpf13zi.lc-cn-n1-shared.com'
});
  function togglePassword() {
      const pwInput = document.getElementById("regPassword");
      const toggle = document.getElementById("togglePassword");
      if (pwInput.type === "password") {
        pwInput.type = "text";
        toggle.textContent = "🌱";
      } else {
        pwInput.type = "password";
        toggle.textContent = "🪴";
      }
    }
   // 🌟 輔助：抖動 + 發光
function shakeAndGlow(element) {
  element.classList.add("shake", "glow");
  setTimeout(() => {
    element.classList.remove("shake", "glow");
  }, 600);
}

// ✅ 註冊主流程
async function register() {
  const nicknameInput = document.getElementById("nickname");
  const emailInput = document.getElementById("Email");
  const passwordInput = document.getElementById("regPassword");

  const nickname = nicknameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  let hasError = false;

  if (!nickname) {
    shakeAndGlow(nicknameInput);
    hasError = true;
  }
  if (!email) {
    shakeAndGlow(emailInput);
    hasError = true;
  }
  if (!password) {
    shakeAndGlow(passwordInput);
    hasError = true;
  }

  if (hasError) return;



  // ✅ 註冊用戶
  const user = new AV.User();
  user.setUsername(email);   // 使用 email 當作帳號
  user.setEmail(email);
  user.setPassword(password);
  user.set("nickname", nickname); // 綁定暱稱
 
 
try {
    await user.signUp();

    alert("🎉 註冊成功！請登入！");
    window.location.href = "login.html"; // ← 跳轉登入頁面
  } catch (error) {
    if (error.code === 203) {
      alert("❗ 此 Email 已被註冊，請直接登入");
    } else {
      alert("❌ 註冊失敗：" + error.message);
    }
  }
}
// ✅ 掛給 HTML 用
window.register = register;


function goToHomepage() {
    window.location.href = "../LimCn.html"; // 根據你主頁的實際路徑修改
  }
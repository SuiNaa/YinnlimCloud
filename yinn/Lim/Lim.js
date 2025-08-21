// ✅ 真太陽時計算函數（包含均時差）
function getTrueSolarTime(date, longitude, timezoneOffset = new Date().getTimezoneOffset()) {
  const dayOfYear = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 86400000);
  const B = (360 / 365) * (dayOfYear - 81) * Math.PI / 180;
  const EoT = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
  const standardMeridian = -timezoneOffset / 60 * 15;
  const longitudeCorrection = (longitude - standardMeridian) * 4;
  const totalCorrection = EoT + longitudeCorrection;
  const solar = new Date(date);
  solar.setMinutes(solar.getMinutes() + totalCorrection);
  return solar;
}
// LeanCloud 初始化
AV.init({
  appId: 'jxPF13ZiTBmbFt75fXRnYs42-gzGzoHsz',
  appKey: 'ydXYcG0fGtWLgWetR0szCygQ',
  serverURL: 'https://jxpf13zi.lc-cn-n1-shared.com'
});
let user = null;
let nickname = "匿名用戶";
document.addEventListener("DOMContentLoaded", () => {
  user = AV.User.current();  // ⚠️ 使用全域的 user
const isLoggedIn = !!user;

if (isLoggedIn) {
  nickname = user.get("nickname") || "匿名用戶"; // ⚠️ 使用全域的 nickname
  document.getElementById("currentNickname").innerText = `Lim：${nickname}`;
} else {
  document.getElementById("currentNickname").innerText = `帳戶：未登入訪客`;
}

  // 🍭 發文按鈕動畫
  const plusBtn = document.getElementById("plusBtn");
  const postForm = document.getElementById("postForm");
  plusBtn.addEventListener("click", () => {
  if (!isLoggedIn) {
    alert("⚠️ 請先登入才能發文！");
    return;
  }

  plusBtn.classList.add("spin");
  setTimeout(() => {
    plusBtn.classList.remove("spin");
    if (postForm.classList.contains("show")) {
      postForm.classList.remove("show");
      setTimeout(() => (postForm.style.display = "none"), 300);
    } else {
      postForm.style.display = "block";
      setTimeout(() => postForm.classList.add("show"), 10);
    }
  }, 300);
});

  // 📝 發文
  document.getElementById("submitBtn").addEventListener("click", async () => {
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const imageFile = document.getElementById("imageUpload").files[0];
    const imagePosition = document.querySelector('input[name="imagePosition"]:checked')?.value || "top";
    if (!title || !content) {
      alert("請填寫標題與內容 🍓");
      return;
    }

    const Post = AV.Object.extend("Post");
    const post = new Post();
    post.set("title", title);
    post.set("content", content);
    post.set("author", user);
    post.set("nickname", nickname);
    post.set("owner", user);
    post.set("imagePosition", imagePosition);

    const acl = new AV.ACL();
    acl.setPublicReadAccess(true);
    acl.setWriteAccess(user, true);
    post.setACL(acl);

    if (imageFile) {
      const avFile = new AV.File(imageFile.name, imageFile);
      post.set("image", avFile);
    }

    try {
      await post.save();
      alert("🎉 發文成功！");
      document.getElementById("title").value = "";
      document.getElementById("content").value = "";
      document.getElementById("imageUpload").value = "";
      loadPosts();
    } catch (error) {
      alert("貼文失敗：" + error.message);
    }
  });

  // 🔄 載入貼文
  window.loadPosts = async function () {
  const Post = AV.Object.extend("Post");
  const query = new AV.Query(Post);
  query.descending("createdAt");
  query.include("author");
  query.limit(50);

  try {
    const results = await query.find();
    const container = document.getElementById("postsContainer");
    container.innerHTML = "";

    results.forEach(post => {
      const owner = post.get("owner");
      if (!owner) return;

      const title = post.get("title");
      const content = post.get("content");
      const nickname = post.get("nickname") || "匿名用戶";
      const image = post.get("image") ? post.get("image").url() : null;
      const shortContent = content.length > 60 ? content.slice(0, 60) + "..." : content;

      const postDiv = document.createElement("div");
      postDiv.classList.add("post-card", "collapsed");

      const titleEl = document.createElement("h3");
      titleEl.textContent = ` ${title}`;

      const shortEl = document.createElement("p");
      shortEl.className = "short-content";
      shortEl.textContent = shortContent;

      const fullEl = document.createElement("p");
      fullEl.className = "full-content";
      fullEl.style.display = "none";
      fullEl.textContent = content;

      const nicknameEl = document.createElement("p");
      nicknameEl.style.cssText = "font-size: 13px; color: #999;";
      nicknameEl.innerHTML = `👤 ${nickname}`;

      if (image) {
        const img = document.createElement("img");
        img.src = image;
        img.className = "post-image";
        img.style.display = "none";
        img.style.maxWidth = "100%";
        postDiv.appendChild(img);
      }

     // 顯示發佈者與真太陽時時間
const infoEl = document.createElement("p");
infoEl.style.cssText = "font-size: 13px; color: #999;";
infoEl.textContent = `👤 ${nickname}｜🕒 計算中...`;
postDiv.appendChild(infoEl);

// ✨ 取得定位後更新時間
navigator.geolocation.getCurrentPosition(pos => {
  const solarTime = getTrueSolarTime(post.createdAt, pos.coords.longitude);
  const formatted = solarTime.toLocaleString();
  infoEl.textContent = `👤 ${nickname}｜🕒 真太陽時：${formatted}`;
}, () => {
  const fallback = new Date(post.createdAt).toLocaleString();
  infoEl.textContent = `👤 ${nickname}｜🕒 北京時間：${fallback}`;
});

 postDiv.appendChild(titleEl);
      postDiv.appendChild(shortEl);
      postDiv.appendChild(fullEl);
   

      // 👉 詳情點擊事件
      postDiv.addEventListener("click", () => {
        document.getElementById("postsContainer").style.display = "none";
        const detailView = document.getElementById("postDetailView");
        detailView.style.display = "block";
        const isOwner = AV.User.current()?.id === post.get("owner")?.id;
        const imagePosition = post.get("imagePosition") || "top";

        detailView.innerHTML = `
  <div class="post-detail">
    <h2>🧃 ${title}</h2>
    ${imagePosition === "top" && image ? `<img src="${image}" style="max-width: 50%; border-radius: 12px; margin: 10px 0;">` : ""}
    <pre style="font-size: 16px; line-height: 1.6;">${content}</pre>
    ${imagePosition === "bottom" && image ? `<img src="${image}" style="max-width: 80%; border-radius: 12px; margin: 10px 0;">` : ""}
    <p style="font-size: 13px; color: #999;">👤 ${nickname}｜🕒平太陽時： ${new Date(post.createdAt).toLocaleString()}</p>
    <br>
    <button onclick="goBackToList()" style="padding: 8px 20px; border-radius: 8px; background: #ffb6c1; border: none; cursor: pointer;">
      🔙 返回列表
    </button>
    ${isOwner ? `
      <button onclick="deletePost('${post.id}')" style="padding: 8px 20px; border-radius: 8px; background: #ff6666; border: none; cursor: pointer; color: white; margin-left: 10px;">
        🌵🐛 刪除貼文
      </button>
    ` : ""}
  <div class="comment-section" style="margin-top: 30px;">
    <h3>💬 留言評論</h3>
    <div id="commentList"></div>
    <br>
    <textarea id="commentInput" placeholder="輸入你的評論..." rows="3" style="width: 100%; padding: 10px; border-radius: 8px;"></textarea>
    <button onclick="submitComment('${post.id}')" 
  style="
    margin-top: 10px;
    padding: 8px 16px;
    background: transparent;
    border: 2px solid #bb55cc;
    border-radius: 12px;
    color: #bb55cc;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s;
  "
  onmouseover="this.style.background='#f9eaff';"
  onmouseout="this.style.background='transparent';"
>
  ☁️送出評論
</button>
  </div>
  </div>
`;
loadComments(post.id);  // 詳情顯示後自動載入評論
      });

      // 👉 外層縮略蟲蟲按鈕
      if (AV.User.current()?.id === owner.id) {
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "🌵🐛";
        deleteBtn.style.cssText = `
         position: absolute;
         bottom: 8px;
        right: 8px;
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 20px;
        opacity: 1; /* 直接顯示完全不透明 */
        `;
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          deletePost(post.id);
        });
        postDiv.appendChild(deleteBtn);
      }
      container.appendChild(postDiv);
    });
  } catch (error) {
    alert("載入貼文失敗 🍂");
    console.error(error);
  }
};

//=======================


  // 🟣 功能按鈕區塊
  window.logout = () => {
    const user = AV.User.current();  // 檢查當前使用者
  if (!user) {
    alert("⚠️ 🥹尚未登入，無法執行登出！");
    return;
  }
    AV.User.logOut();
    alert("已登出！");
    window.location.href = "/lim longin/login.html";
  };

// 提交登入
// 👉 登入跳轉函數
window.goToLogin = () => {
  const user = AV.User.current();
  if (user) {
    alert("你已經登入囉～");
    return;
  }
  localStorage.setItem("previousPage", window.location.href); // 回傳目前頁面
  window.location.href = "limlongin/login.html"; // ⬅️ 你的登入頁路徑
};

// 送出暱稱修改
// 🔁 顯示暱稱修改視窗
window.goToNicknameSettings = () => {
  const user = AV.User.current();
  if (!user) {
    alert("⚠️ 😭請先登入才能修改暱稱喔～！");
    return;
  }

  document.getElementById("nicknameModal").style.display = "flex";
};

// 🔒 隱藏暱稱修改視窗
window.hideNicknameModal = () => {
  document.getElementById("nicknameModal").style.display = "none";
};

// ✅ 提交修改暱稱
window.submitNickname = async () => {
  const input = document.getElementById("newNickname");
  const nickname = input.value.trim();
  const user = AV.User.current();

  if (!nickname) {
    alert("請輸入新暱稱 🍬");
    input.focus();
    return;
  }

  try {
    user.set("nickname", nickname);
    await user.save(); // 儲存
    document.getElementById("currentNickname").innerText = `帳戶：${nickname}`;
    hideNicknameModal();
    alert("✅ 暱稱已更新！");
  } catch (err) {
    alert("❌ 暱稱修改失敗：" + err.message);
    console.error(err);
  }
};
//結束修改

  window.toggleMenu = () => {
    const menu = document.getElementById("sideMenu");
    const toggle = document.querySelector(".menu-toggle");
    const infoBtn = document.querySelector(".info-toggle");
    toggle.classList.toggle("active");
    menu.classList.toggle("open");
    infoBtn.classList.toggle("shifted", menu.classList.contains("open"));
  };

  window.toggleInfoBox = (btn) => {
    const box = document.getElementById("infoBox");
    const showing = box.style.display === "block";
    box.style.display = showing ? "none" : "block";
    btn.classList.toggle("active");
  };

  // 🚀 載入
  loadPosts();
});

// 🔙 詳情頁返回列表
function goBackToList() {
  document.getElementById("postDetailView").style.display = "none";
  document.getElementById("postsContainer").style.display = "grid";
}
// ✅ 刪除貼文（只能刪除自己的）
async function deletePost(postId) {
  const confirmDelete = confirm("你確定要刪除這篇貼文嗎？刪除後無法復原！");
  if (!confirmDelete) return;

  try {
    const Post = AV.Object.extend("Post");
    const query = new AV.Query(Post);
    const post = await query.get(postId);

    const currentUser = AV.User.current();
    if (!currentUser || post.get("owner")?.id !== currentUser.id) {
      alert("⚠️ 你沒有權限刪除這篇貼文！");
      return;
    }

    await post.destroy();
    alert("✅ 刪除成功！");
    goBackToList();
    loadPosts(); // 重新載入貼文列表
  } catch (error) {
    alert("刪除失敗：" + error.message);
    console.error(error);
  }
}
function checkConnection() {
  const statusBox = document.getElementById("connectionStatus");
  if (!statusBox) return;

  try {
    AV.Query.doCloudQuery("select count(*) from _User")
      .then(() => {
        statusBox.innerHTML = "✅ 已連接糖糖伺服器～";
        setTimeout(() => {
          statusBox.style.display = "none";
        }, 3000);
      })
      .catch(() => {
        statusBox.innerHTML = "⚠️ 糖糖連線失敗，請檢查網路";
        statusBox.style.background = "#ffe6e6";
        statusBox.style.color = "#cc0000";
      });
  } catch (e) {
    statusBox.innerHTML = "⚠️ 糖糖連線失敗（語法錯誤）";
    statusBox.style.background = "#ffe6e6";
    statusBox.style.color = "#cc0000";
  }
}// ✅ 載入時自動呼叫
checkConnection();
//註銷
// 顯示註銷帳戶確認彈匡
window.confirmDeleteAccount = async () => {
  const user = AV.User.current();
  if (!user) {
    alert("⚠️ 還沒有帳戶喔～請先登入訥！(⁎⁍̴̛ᴗ⁍̴̛⁎)");
    return;
  }

  const confirmDelete = confirm("⚠️ 你確定要永久註銷帳戶嗎？這將會永久刪除帳號與所有貼文！");
  if (!confirmDelete) return;

  try {
    // 🧹 先刪除這個使用者的所有貼文
    const Post = AV.Object.extend("Post");
    const query = new AV.Query(Post);
    query.equalTo("owner", user);
    query.limit(1000); // 最多一次刪 1000 筆
    const posts = await query.find();

    for (const post of posts) {
      await post.destroy();
    }

    // 🗑️ 再刪除帳戶本身
    await user.destroy();

    alert("✅ 帳戶與貼文皆已成功註銷！");
    await AV.User.logOut();
    window.location.href = "/lim longin/login.html";
  } catch (error) {
    alert("❌ 註銷失敗：" + error.message);
    console.error(error);
  }
};
document.addEventListener("click", (e) => {
  const form = document.getElementById("postForm");
  const plusBtn = document.getElementById("plusBtn");
  if (form.style.display === "block" && !form.contains(e.target) && e.target !== plusBtn) {
    form.style.display = "none";
  }
});
//暱稱yinn

/*暱稱控制*/
const firebaseConfig = {
  apiKey: "AIzaSyBkLJKrOdTgk4uf58jpciJIHm9hEYQUFCw",
  authDomain: "yinnlim-mgsg-wall.firebaseapp.com",
  projectId: "yinnlim-mgsg-wall",
  storageBucket: "yinnlim-mgsg-wall.firebasestorage.app",
  messagingSenderId: "811614776183",
  appId: "1:811614776183:web:d0b11607a54b5a4d8a0f72"
};
firebase.initializeApp(firebaseConfig);
/*初始化*/
firebase.auth().onAuthStateChanged(user => {
  const nicknameSpan = document.getElementById("yinnNicknameStatus");
  if (user) {
    nicknameSpan.textContent = `：${user.displayName || "未設定暱稱"}`;
  } else {
    nicknameSpan.textContent = "未登入";
  }
});

//=========================
// 提交評論（只能登入者）
window.submitComment = async function(postId) {
  const user = AV.User.current();
  if (!user) {
    alert("請先登入才能留言！");
    return;
  }

  const input = document.getElementById("commentInput");
  const text = input.value.trim();
  if (!text) {
    alert("請輸入留言內容！");
    return;
  }

  const Comment = AV.Object.extend("Comment");
  const comment = new Comment();
  comment.set("text", text);
  comment.set("postId", postId);
  comment.set("author", user);
  comment.set("nickname", user.get("nickname") || "匿名用戶");

  const acl = new AV.ACL();
  acl.setPublicReadAccess(true);
  acl.setWriteAccess(user, true);
  comment.setACL(acl);

  await comment.save();
  input.value = "";
  loadComments(postId);
};

// 載入評論
window.loadComments = async function(postId) {
  const list = document.getElementById("commentList");
  list.innerHTML = "";

  const Comment = AV.Object.extend("Comment");
  const query = new AV.Query(Comment);
  query.equalTo("postId", postId);
  query.ascending("createdAt");

  const comments = await query.find();
  const currentUserId = AV.User.current()?.id;

  comments.forEach(comment => {
    const text = comment.get("text");
    const nickname = comment.get("nickname") || "匿名用戶";
    const created = comment.createdAt.toLocaleString();
    const isOwner = currentUserId === comment.get("author")?.id;

    const item = document.createElement("div");
    item.style = "padding: 10px 0; border-bottom: 1px solid #eee;";

    item.innerHTML = `
      <strong>${nickname}</strong> 🕒 ${created}<br>
      <span>${text}</span>
      ${isOwner ? `<button onclick="deleteComment('${comment.id}', '${postId}')" style="margin-left: 10px;">🗑 刪除</button>` : ""}
    `;
    list.appendChild(item);
  });
};

// 刪除自己的評論
window.deleteComment = async function(commentId, postId) {
  const Comment = AV.Object.extend("Comment");
  const query = new AV.Query(Comment);
  const comment = await query.get(commentId);

  const user = AV.User.current();
  if (!user || comment.get("author")?.id !== user.id) {
    alert("⚠️ 你只能刪除自己的評論！");
    return;
  }

  await comment.destroy();
  alert("✅ 已刪除評論！");
  loadComments(postId);
};
function showTownLoginModal() {
  document.getElementById("townLoginModal").style.display = "flex";
}

function hideTownLoginModal() {
  document.getElementById("townLoginModal").style.display = "none";
}
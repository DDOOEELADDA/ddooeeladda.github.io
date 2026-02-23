import {
  db,
} from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";


// -----------------------------
// 로그인 상태 표시
// -----------------------------
auth.onAuthStateChanged(user => {
  const loginLink = document.getElementById("loginLink");
  const signupLink = document.getElementById("signupLink");
  const userInfo = document.getElementById("userInfo");

  if (!loginLink) return; // index.html 아닌 경우 대비

  if (user) {
    loginLink.style.display = "none";
    signupLink.style.display = "none";

    userInfo.style.display = "inline-block";
    userInfo.innerHTML = `
      <span style="color:#00d9ff">로그인됨: ${user.displayName || user.email}</span>
      <button onclick="logout()" class="logout-btn">로그아웃</button>
    `;
  } else {
    loginLink.style.display = "inline-block";
    signupLink.style.display = "inline-block";
    userInfo.style.display = "none";
  }
});

function logout() {
  auth.signOut();
}



// ----------------------------------------------------------------
// 게시판 글 불러오기 (board.html)
// ----------------------------------------------------------------

async function loadPostList() {
  const listEl = document.getElementById("post-list");
  if (!listEl) return;

  const q = query(collection(db, "posts"), orderBy("date", "desc"));
  const data = await getDocs(q);

  listEl.innerHTML = ""; // 초기화

  data.forEach((docu) => {
    const post = docu.data();

    const item = document.createElement("div");
    item.className = "post-item";
    item.innerHTML = `
      <a href="viewPost.html?id=${docu.id}">
        <h2>${post.title}</h2>
        <p>${post.author} · ${new Date(post.date.toDate()).toLocaleDateString()}</p>
      </a>
    `;
    listEl.appendChild(item);
  });
}
loadPostList();


/* ---------------------------------------------------
    글쓰기 페이지(writePost.html)
--------------------------------------------------- */
const submitBtn = document.getElementById("postSubmit");
if (submitBtn) {
  submitBtn.addEventListener("click", async () => {
    const title = document.getElementById("titleInput").value.trim();
    const content = document.getElementById("contentInput").value.trim();

    if (!title || !content) {
      alert("제목과 내용을 입력해주세요!");
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        author: localStorage.getItem("nickname") || "익명",
        date: new Date(),
      });

      alert("등록 완료!");
      location.href = "board.html";
    } catch (err) {
      console.error("글쓰기 실패:", err);
      alert("오류 발생");
    }
  });
}



/* ---------------------------------------------------
    게시글 상세(viewPost.html)
--------------------------------------------------- */
async function loadPostDetail() {
  const titleEl = document.getElementById("postTitle");
  const contentEl = document.getElementById("postContent");
  const authorEl = document.getElementById("postAuthor");
  const dateEl = document.getElementById("postDate");

  const params = new URLSearchParams(location.search);
  const postId = params.get("id");

  if (!postId) return;

  const docRef = doc(db, "posts", postId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    titleEl.textContent = "글을 찾을 수 없습니다.";
    return;
  }

  const post = docSnap.data();

  titleEl.textContent = post.title;
  contentEl.textContent = post.content;
  authorEl.textContent = post.author;
  dateEl.textContent = new Date(post.date.toDate()).toLocaleString();
}


/* ---------------------------------------------------
    댓글 기능 (viewPost.html)
--------------------------------------------------- */
async function loadComments() {
  const params = new URLSearchParams(location.search);
  const postId = params.get("id");
  if (!postId) return;

  const list = document.getElementById("comment-list");

  const q = query(
    collection(db, "posts", postId, "comments"),
    orderBy("date", "asc")
  );
  const data = await getDocs(q);

  list.innerHTML = "";

  data.forEach((docu) => {
    const c = docu.data();

    const div = document.createElement("div");
    div.className = "comment-item";
    div.innerHTML = `
      <p class="comment-author">${c.author}</p>
      <p class="comment-text">${c.text}</p>
      <span class="comment-date">${new Date(c.date.toDate()).toLocaleString()}</span>
    `;
    list.appendChild(div);
  });
}

window.loadComments = loadComments;

/* 댓글 작성 */
async function submitComment() {
  const params = new URLSearchParams(location.search);
  const postId = params.get("id");
  const input = document.getElementById("comment-input");

  if (!input.value.trim()) {
    alert("댓글 내용을 입력해주세요.");
    return;
  }

  await addDoc(collection(db, "posts", postId, "comments"), {
    text: input.value.trim(),
    author: localStorage.getItem("nickname") || "익명",
    date: new Date(),
  });

  input.value = "";
  loadComments();
}

window.submitComment = submitComment;
window.loadPostDetail = loadPostDetail;

/* ---------------------------------------------------
    리플레이 제출 기능 (replay.html)
--------------------------------------------------- */

document.getElementById("submitReplay").addEventListener("click", function () {

  var replayCode = document.getElementById("replayCode").value.trim();

  if (!replayCode) {
    alert("리플레이 코드를 입력하세요.");
    return;
  }

  var deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = "device_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("deviceId", deviceId);
  }

  var now = Date.now();

  database.ref("deviceLimits/" + deviceId).once("value")
    .then(function(snapshot) {

      var data = snapshot.val();

      if (data && data.lastSubmit && (now - data.lastSubmit < 3 * 60 * 60 * 1000)) {
        alert("3시간 동안 다시 제출할 수 없습니다.");
        return;
      }

      // 리플레이 저장
      database.ref("replays").push({
        code: replayCode,
        deviceId: deviceId,
        submittedAt: now
      });

      // 제한 시간 저장
      database.ref("deviceLimits/" + deviceId).set({
        lastSubmit: now
      });

      alert("제출 완료!");
    });
});




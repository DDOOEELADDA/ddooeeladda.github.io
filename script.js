// Firebase 초기화
const auth = firebase.auth();
const db = firebase.database();

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

let loadedPosts = [];
let postsPerPage = 10;
let currentPage = 1;

function loadPosts() {
  const ref = db.ref("posts");

  ref.once("value", snapshot => {
    loadedPosts = [];

    snapshot.forEach(child => {
      loadedPosts.unshift({
        id: child.key,
        ...child.val()
      });
    });

    renderPage(1);
  });
}

function renderPage(page) {
  currentPage = page;

  const list = document.getElementById("postList");
  const pagination = document.getElementById("pagination");

  if (!list) return; // board.html 아닐 때 대비

  list.innerHTML = "";
  pagination.innerHTML = "";

  const start = (page - 1) * postsPerPage;
  const end = start + postsPerPage;

  const pagePosts = loadedPosts.slice(start, end);

  pagePosts.forEach((post, i) => {
    const tr = document.createElement("tr");
    tr.onclick = () => location.href = `viewPost.html?id=${post.id}`;

    tr.innerHTML = `
      <td>${loadedPosts.length - (start + i)}</td>
      <td>${post.title}</td>
      <td>${post.author}</td>
      <td>${post.date}</td>
      <td>${post.views || 0}</td>
    `;

    list.appendChild(tr);
  });

  const totalPages = Math.ceil(loadedPosts.length / postsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;

    if (i === page) btn.classList.add("active");
    btn.onclick = () => renderPage(i);

    pagination.appendChild(btn);
  }
}



// ----------------------------------------------------------------
// 글 작성 (writePost.html)
// ----------------------------------------------------------------

function submitPost() {
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !content) {
    alert("제목과 내용을 모두 입력해줘!");
    return;
  }

  let author = "Boxer(UnknownIP)";
  const user = auth.currentUser;

  if (user) {
    author = user.displayName || user.email || "User";
  }

  const newPost = {
    title,
    content,
    author,
    date: new Date().toLocaleString("ko-KR"),
    views: 0
  };

  db.ref("posts").push(newPost).then(() => {
    alert("글이 등록되었어!");
    location.href = "board.html";
  });
}



// ----------------------------------------------------------------
// 글 보기 페이지(viewPost.html)
// ----------------------------------------------------------------

function loadPostDetail() {
  const params = new URLSearchParams(location.search);
  const postId = params.get("id");

  const titleTag = document.getElementById("postTitle");
  const contentTag = document.getElementById("postContent");
  const authorTag = document.getElementById("postAuthor");
  const dateTag = document.getElementById("postDate");

  if (!postId) return;

  const ref = db.ref("posts/" + postId);

  ref.once("value").then(snapshot => {
    const data = snapshot.val();

    titleTag.innerText = data.title;
    contentTag.innerText = data.content;
    authorTag.innerText = data.author;
    dateTag.innerText = data.date;

    // 조회수 증가
    ref.update({ views: (data.views || 0) + 1 });
  });
}



// ----------------------------------------------------------------
// 댓글 기능 (viewPost.html)
// ----------------------------------------------------------------

function submitComment() {
  const params = new URLSearchParams(location.search);
  const postId = params.get("id");

  const input = document.getElementById("comment-input");
  const comment = input.value.trim();

  if (!comment) {
    alert("댓글 내용을 입력해줘!");
    return;
  }

  const user = auth.currentUser;
  let author = "Boxer(UnknownIP)";

  if (user) author = user.displayName || user.email;

  db.ref(`comments/${postId}`).push({
    comment,
    author,
    date: new Date().toLocaleString("ko-KR")
  });

  input.value = "";
  loadComments();
}

function loadComments() {
  const params = new URLSearchParams(location.search);
  const postId = params.get("id");

  const container = document.getElementById("comment-list");
  if (!container) return;

  container.innerHTML = "";

  db.ref(`comments/${postId}`).once("value", snap => {
    snap.forEach(child => {
      const c = child.val();

      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `
        <b>${c.author}</b> (${c.date})<br>
        ${c.comment}
        <hr>
      `;

      container.appendChild(div);
    });
  });
}


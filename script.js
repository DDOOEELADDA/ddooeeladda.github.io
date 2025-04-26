const posts = [];

function showWriteForm() {
  document.getElementById('write-form').style.display = 'block';
}

function submitPost() {
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;

  if (title && content) {
    posts.push({ title, content });
    renderPosts();
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('write-form').style.display = 'none';
  } else {
    alert('제목과 내용을 모두 입력해줘!');
  }
}

function renderPosts() {
  const postsDiv = document.getElementById('posts');
  postsDiv.innerHTML = '';

  posts.forEach((post) => {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.innerHTML = `<h3>${post.title}</h3><p>${post.content}</p><hr>`;
    postsDiv.appendChild(postDiv);
  });
}

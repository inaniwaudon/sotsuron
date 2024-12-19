const section = {};
const registerInput = {};
const updateInput = {};
const spans = {};
let tokenInput;
let accountInfo = null;

window.onload = () => {
  section.register = document.querySelector("#register");
  section.signin = document.querySelector("#signin");
  section.token = document.querySelector("#token");
  section.update = document.querySelector("#update");
  section.next = document.querySelector("#next");

  registerInput.id = document.querySelector("#register-id-input");
  registerInput.twitter = document.querySelector("#register-twitter-input");
  registerInput.goal = document.querySelector("#register-goal-input");
  registerInput.comment = document.querySelector("#register-comment-input");

  updateInput.twitter = document.querySelector("#update-twitter-input");
  updateInput.goal = document.querySelector("#update-goal-input");
  updateInput.comment = document.querySelector("#update-comment-input");

  spans.id = document.querySelectorAll(".id");
  spans.progressUrl = document.querySelectorAll(".progress-url");
  spans.token = document.querySelectorAll(".token");

  tokenInput = document.querySelector("#token-input");

  const token = localStorage.getItem("token");
  if (token) {
    setRegistered(token);
  }
};

const setRegistered = (token) => {
  (async () => {
    // アカウント情報を取得
    let result;
    try {
      result = await fetch(`/api/accounts/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
      if (!result.ok) {
        throw new Error();
      }
      accountInfo = await result.json();
    } catch {
      const json = await result.json();
      localStorage.removeItem("token");
      alert(json.message);
    }

    // 表示を更新
    updateInput.twitter.value = accountInfo.twitter;
    updateInput.goal.value = accountInfo.goal;
    updateInput.comment.value = accountInfo.comment;

    const url = encodeURI(
      `https://sotsuron.yokohama.dev/api/progress?token=${token}&pages=$pages`
    );
    section.register.style.display = "none";
    section.signin.style.display = "none";
    section.token.style.display = "block";
    section.next.style.display = "block";

    for (const idSpan of spans.id) {
      idSpan.innerHTML = accountInfo.id;
    }
    for (const progressUrl of spans.progressUrl) {
      progressUrl.href = url;
      progressUrl.innerHTML = url;
    }
    for (const tokenSpan of spans.token) {
      tokenSpan.innerHTML = escapeHtml(token);
    }
  })();
};

const escapeHtml = (string) => {
  if (typeof string !== "string") {
    return string;
  }
  return string.replace(/[&'`"<>]/g, (match) => {
    return {
      "&": "&amp;",
      "'": "&#x27;",
      "`": "&#x60;",
      '"': "&quot;",
      "<": "&lt;",
      ">": "&gt;",
    }[match];
  });
};

function register() {
  (async () => {
    let result;
    try {
      result = await fetch(`/api/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: registerInput.id.value,
          twitter: registerInput.twitter.value,
          goal: parseInt(registerInput.goal.value),
          comment: registerInput.comment.value,
        }),
      });
      if (!result.ok) {
        throw new Error();
      }
      const json = await result.json();
      localStorage.setItem("token", json.token);
      location.reload();
    } catch (e) {
      const json = await result.json();
      alert(json.message);
    }
  })();
}

function signin() {
  localStorage.setItem("token", tokenInput.value);
  location.reload();
}

function signout() {
  localStorage.removeItem("token");
  location.reload();
}

function update() {
  (async () => {
    let result;
    try {
      result = await fetch(`/api/accounts`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: accountInfo.id,
          twitter: updateInput.twitter.value,
          goal: parseInt(updateInput.goal.value),
          comment: updateInput.comment.value,
          token: accountInfo.token,
        }),
      });
      if (!result.ok) {
        throw new Error();
      }
      alert("更新しました．");
      location.reload();
    } catch (e) {
      const json = await result.json();
      alert(json.message);
    }
  })();
}

function deleteAccount() {
  (async () => {
    const ok = window.confirm("アカウントを削除しますか？");
    if (!ok) {
      return;
    }
    let result;
    try {
      result = await fetch(`/api/accounts`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: accountInfo.id,
          token: accountInfo.token,
        }),
      });
      if (!result.ok) {
        throw new Error();
      }
      localStorage.removeItem("token");
      alert("削除しました．");
      location.reload();
    } catch (e) {
      const json = await result.json();
      alert(json.message);
    }
  })();
}

function displayUpdateSection() {
  section.update.style.display = "block";
}

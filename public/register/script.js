let registerSection;
let alreadySection;
let tokenSection;
let nextSection;

let idInput;
let twitterInput;
let goalInput;
let commentInput;
let registerButton;
let tokenInput;

let idSpans;
let progressUrls;
let tokenSpans;

window.onload = () => {
  registerSection = document.querySelector("#register");
  alreadySection = document.querySelector("#already");
  tokenSection = document.querySelector("#token");
  nextSection = document.querySelector("#next");

  idInput = document.querySelector("#id-input");
  twitterInput = document.querySelector("#twitter-input");
  goalInput = document.querySelector("#goal-input");
  commentInput = document.querySelector("#comment-input");
  registerButton = document.querySelector("#register-button");
  tokenInput = document.querySelector("#token-input");

  idSpans = document.querySelectorAll(".id");
  progressUrls = document.querySelectorAll(".progress-url");
  tokenSpans = document.querySelectorAll(".token");

  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");
  if (id && token) {
    setRegistered(id, token);
  }
};

const setRegistered = (id, token) => {
  const url = encodeURI(
    `https://sotsuron.yokohama.dev/api/progress?token=${token}&pages=$pages`
  );
  registerSection.style.display = "none";
  alreadySection.style.display = "none";
  tokenSection.style.display = "block";
  nextSection.style.display = "block";

  for (const idSpan of idSpans) {
    idSpan.innerHTML = id;
  }
  for (const progressUrl of progressUrls) {
    progressUrl.href = url;
    progressUrl.innerHTML = url;
  }
  for (const tokenSpan of tokenSpans) {
    tokenSpan.innerHTML = escapeHtml(token);
  }
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
    const body = {
      id: idInput.value,
      twitter: twitterInput.value,
      goal: parseInt(goalInput.value),
      comment: commentInput.value,
    };

    try {
      result = await fetch(`/api/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!result.ok) {
        throw new Error();
      }
      const json = await result.json();
      localStorage.setItem("id", json.id);
      localStorage.setItem("token", json.token);
      location.reload();
    } catch (e) {
      const json = await result.json();
      alert(json.message);
    }
  })();
}

function signin() {
  (async () => {
    let result;
    const body = {
      token: tokenInput.value,
    };

    try {
      result = await fetch(`/api/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!result.ok) {
        throw new Error();
      }
      const json = await result.json();
      localStorage.setItem("id", json.id);
      localStorage.setItem("token", json.token);
      location.reload();
    } catch (e) {
      const json = await result.json();
      alert(json.message);
    }
  })();
}

function signout() {
  localStorage.removeItem("id");
  localStorage.removeItem("token");
  location.reload();
}

function deleteAccount() {
  (async () => {
    const ok = window.confirm("アカウントを削除しますか？");
    if (!ok) {
      return;
    }
    let result;
    const body = {
      id: localStorage.getItem("id"),
      token: localStorage.getItem("token"),
    };

    try {
      result = await fetch(`/api/accounts`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!result.ok) {
        throw new Error();
      }
      localStorage.removeItem("id");
      localStorage.removeItem("token");
      alert("削除しました");
      location.reload();
    } catch (e) {
      const json = await result.json();
      alert(json.message);
    }
  })();
}

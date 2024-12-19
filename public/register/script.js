let registerSection;
let alreadySection;
let tokenSection;
let updateSection;
let nextSection;

let registerInput = {};
let updateInput = {};
let registerButton;
let updateButton;

let tokenInput;

let idSpans;
let progressUrls;
let tokenSpans;

let accountInfo = null;

window.onload = () => {
  registerSection = document.querySelector("#register");
  alreadySection = document.querySelector("#already");
  tokenSection = document.querySelector("#token");
  updateSection = document.querySelector("#update");
  nextSection = document.querySelector("#next");

  registerInput.id = document.querySelector("#register-id-input");
  registerInput.twitter = document.querySelector("#register-twitter-input");
  registerInput.goal = document.querySelector("#register-goal-input");
  registerInput.comment = document.querySelector("#register-comment-input");

  updateInput.twitter = document.querySelector("#update-twitter-input");
  updateInput.goal = document.querySelector("#update-goal-input");
  updateInput.comment = document.querySelector("#update-comment-input");

  tokenInput = document.querySelector("#token-input");

  registerButton = document.querySelector("#register-button");
  updateButton = document.querySelector("#update-button");

  idSpans = document.querySelectorAll(".id");
  progressUrls = document.querySelectorAll(".progress-url");
  tokenSpans = document.querySelectorAll(".token");

  const token = localStorage.getItem("token");
  if (token) {
    setRegistered(token);
  }
};

const setRegistered = (token) => {
  (async () => {
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

    const url = encodeURI(
      `https://sotsuron.yokohama.dev/api/progress?token=${token}&pages=$pages`
    );
    registerSection.style.display = "none";
    alreadySection.style.display = "none";
    tokenSection.style.display = "block";
    nextSection.style.display = "block";

    for (const idSpan of idSpans) {
      idSpan.innerHTML = accountInfo.id;
    }
    for (const progressUrl of progressUrls) {
      progressUrl.href = url;
      progressUrl.innerHTML = url;
    }
    for (const tokenSpan of tokenSpans) {
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
    const body = {
      id: registerInput.id.value,
      twitter: registerInput.twitter.value,
      goal: parseInt(registerInput.goal.value),
      comment: registerInput.comment.value,
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
      result = await fetch(`/api/accounts/me`, {
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
      localStorage.setItem("token", json.token);
      location.reload();
    } catch (e) {
      const json = await result.json();
      alert(json.message);
    }
  })();
}

function signout() {
  localStorage.removeItem("token");
  location.reload();
}

function update() {
  (async () => {
    let result;
    const body = {
      id: accountInfo.id,
      twitter: updateInput.twitter.value,
      goal: parseInt(updateInput.goal.value),
      comment: updateInput.comment.value,
      token: accountInfo.token,
    };

    try {
      result = await fetch(`/api/accounts`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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
    const body = {
      id: accountInfo.id,
      token: accountInfo.token,
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
  updateSection.style.display = "block";
}

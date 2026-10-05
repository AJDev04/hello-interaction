// Geroosterd. — accounts, quiz en roastpagina.
// Alles draait in de browser: accounts worden in localStorage bewaard.

(function () {
  const USERS_KEY = "geroosterd.users.v2";
  const SESSION_KEY = "geroosterd.session.v2";
  const OLD_KEYS = ["geroosterd.users", "geroosterd.session"];

  const LOADING_MESSAGES = [
    "Even je antwoorden lezen…",
    "Je ouders bellen ter bevestiging…",
    "Even bijkomen van het lachen…",
    "De brief schrijven…",
  ];

  const app = document.getElementById("app");

  const state = {
    screen: "auth", // auth | quiz | loading | roast
    authMode: "register", // register | login
    authError: "",
    authEmail: "",
    authName: "",
    busy: false,
    q: 0,
    answers: {},
    toast: "",
  };

  let loadingTimer = null;
  let toastTimer = null;

  // ---------- opslag ----------

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private modus of volle opslag: dan werkt het enkel voor deze sessie */
    }
  }

  const loadUsers = () => read(USERS_KEY, {});
  const saveUsers = (users) => write(USERS_KEY, users);

  function currentUser() {
    const email = read(SESSION_KEY, null);
    const users = loadUsers();
    return email && users[email] ? { email, ...users[email] } : null;
  }

  function updateUser(email, patch) {
    const users = loadUsers();
    if (!users[email]) return;
    users[email] = { ...users[email], ...patch };
    saveUsers(users);
  }

  // ---------- wachtwoorden ----------

  function randomSalt() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function hashPassword(password, salt) {
    const data = new TextEncoder().encode(salt + ":" + password);
    if (crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
    }
    // Fallback voor browsers zonder SubtleCrypto (bv. sommige file://-contexten).
    let h = 0x811c9dc5;
    for (const byte of data) h = Math.imul(h ^ byte, 0x01000193) >>> 0;
    return "fnv-" + h.toString(16);
  }

  // ---------- helpers ----------

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  function displayName(user) {
    if (user.name) return user.name;
    const local = user.email.split("@")[0];
    const first = local.split(/[._\-+0-9]+/).filter(Boolean)[0] || local;
    return first.charAt(0).toUpperCase() + first.slice(1);
  }

  const newSeed = () => Math.floor(Math.random() * 2 ** 31);

  const logo = () => `<a class="logo" href="#" data-action="home">geroosterd<span>.</span></a>`;

  function go(screen) {
    state.screen = screen;
    render();
    window.scrollTo(0, 0);
  }

  function showToast(msg) {
    state.toast = msg;
    renderToast();
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      state.toast = "";
      renderToast();
    }, 2200);
  }

  // ---------- acties ----------

  async function handleAuth(form) {
    if (state.busy) return;
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;
    const nameField = form.elements.namedItem("name");
    const name = nameField ? nameField.value.trim().replace(/\s+/g, " ") : "";
    state.authEmail = email;
    state.authName = name;

    const fail = (msg, focus = "password") => {
      state.authError = msg;
      state.busy = false;
      render();
      const field = app.querySelector(`input[name="${focus}"]`);
      if (field) field.focus();
    };

    if (state.authMode === "register" && !name) return fail("Hoe heet je? We moeten toch weten wie we gaan afbreken.", "name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Dat is geen geldig e-mailadres. Het begint al goed.");
    if (password.length < 6) return fail("Je wachtwoord moet minstens 6 tekens lang zijn. “123” is geen wachtwoord, dat is een cry for help.");

    state.busy = true;
    const users = loadUsers();

    if (state.authMode === "register") {
      if (users[email]) return fail("Er bestaat al een account met dit e-mailadres. Log in, of vergeet niet meer wie je bent.");
      const salt = randomSalt();
      users[email] = { name, salt, hash: await hashPassword(password, salt), createdAt: Date.now(), answers: null, seed: null };
      saveUsers(users);
      write(SESSION_KEY, email);
      state.busy = false;
      startQuiz({});
      return;
    }

    const user = users[email];
    if (!user || user.hash !== (await hashPassword(password, user.salt))) {
      return fail("E-mailadres of wachtwoord klopt niet. Net zoals de rest van je leven.");
    }
    write(SESSION_KEY, email);
    state.busy = false;
    if (user.answers) go("roast");
    else startQuiz({});
  }

  function logout() {
    clearInterval(loadingTimer);
    write(SESSION_KEY, null);
    state.authMode = "login";
    state.authError = "";
    go("auth");
  }

  function startQuiz(prefill) {
    state.answers = { ...prefill };
    state.q = 0;
    state.authError = "";
    go("quiz");
  }

  let advancing = false;

  function answer(value) {
    if (advancing) return;
    advancing = true;
    const question = QUESTIONS[state.q];
    state.answers[question.id] = value;
    // Toon de selectie heel even zonder de vraag opnieuw te animeren.
    app.querySelectorAll(".option").forEach((btn) => {
      const on = btn.dataset.value === value;
      btn.classList.toggle("selected", on);
      btn.setAttribute("aria-checked", on);
    });
    setTimeout(() => {
      advancing = false;
      if (state.screen !== "quiz") return;
      if (state.q < QUESTIONS.length - 1) {
        state.q += 1;
        render();
      } else {
        finishQuiz();
      }
    }, 220);
  }

  function back() {
    if (state.q > 0) {
      state.q -= 1;
      render();
    }
  }

  function finishQuiz() {
    const user = currentUser();
    if (!user) return logout();
    updateUser(user.email, { answers: { ...state.answers }, seed: newSeed(), roastedAt: Date.now() });
    go("loading");

    let i = 0;
    clearInterval(loadingTimer);
    loadingTimer = setInterval(() => {
      i += 1;
      if (i >= LOADING_MESSAGES.length) {
        clearInterval(loadingTimer);
        go("roast");
        return;
      }
      const el = app.querySelector(".loading-text");
      if (el) {
        el.classList.remove("fade");
        void el.offsetWidth;
        el.textContent = LOADING_MESSAGES[i];
        el.classList.add("fade");
      }
    }, 900);
  }

  function reroll() {
    const user = currentUser();
    if (!user) return logout();
    updateUser(user.email, { seed: newSeed(), roastedAt: Date.now() });
    render();
    showToast("Nieuwe roast. Zelfde teleurstelling.");
  }

  function roastAsText() {
    const user = currentUser();
    const name = displayName(user);
    const r = generateRoast(user.answers, user.seed, name);
    return [
      `Beste ${name},`,
      ``,
      r.intro,
      ``,
      ...r.items.map((it) => it.text),
      ``,
      r.outro,
      ``,
      `Met weinig respect,`,
      `Geroosterd.`,
      ``,
      `P.S. Mijn levensscore is ${r.score} op 100.`,
    ].join("\n\n").replace(/\n{3,}/g, "\n\n");
  }

  async function copyRoast() {
    const text = roastAsText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    showToast("Gekopieerd.");
  }

  function deleteAccount() {
    const user = currentUser();
    if (!user) return logout();
    if (!confirm("Account verwijderen? Je roast verdwijnt, maar de waarheid blijft.")) return;
    const users = loadUsers();
    delete users[user.email];
    saveUsers(users);
    state.authEmail = "";
    state.authName = "";
    logout();
    state.authMode = "register";
    render();
  }

  // ---------- schermen ----------

  function renderAuth() {
    const isRegister = state.authMode === "register";
    return `
      <main class="page auth">
        ${logo()}

        <h1>Laat je roasten.</h1>
        <p class="lead">Maak een account, beantwoord ${QUESTIONS.length} vragen over jezelf en lees daarna wat we echt van je denken. Het is een grap. Grotendeels.</p>

        <form id="auth-form" novalidate>
          ${isRegister ? `
          <label class="field">
            <span>Voornaam</span>
            <input type="text" name="name" autocomplete="given-name" maxlength="40" value="${escapeHtml(state.authName)}" required>
          </label>` : ""}
          <label class="field">
            <span>E-mailadres</span>
            <input type="email" name="email" autocomplete="email" value="${escapeHtml(state.authEmail)}" required>
          </label>
          <label class="field">
            <span>Wachtwoord</span>
            <input type="password" name="password" autocomplete="${isRegister ? "new-password" : "current-password"}" required>
          </label>
          ${state.authError ? `<p class="error" role="alert">${escapeHtml(state.authError)}</p>` : ""}
          <button class="btn" type="submit" ${state.busy ? "disabled" : ""}>${isRegister ? "Account aanmaken" : "Inloggen"}</button>
        </form>

        <p class="switch">
          ${isRegister
            ? `Al een account? <button class="link" data-action="mode" data-mode="login">Log in</button>`
            : `Nog geen account? <button class="link" data-action="mode" data-mode="register">Maak er een aan</button>`}
        </p>

        <p class="note">Je account blijft in deze browser en wordt nergens naartoe gestuurd.</p>
      </main>`;
  }

  function renderHeader() {
    return `
      <header class="header">
        ${logo()}
        <button class="link muted" data-action="logout">Uitloggen</button>
      </header>`;
  }

  function renderQuiz() {
    const question = QUESTIONS[state.q];
    const selected = state.answers[question.id];
    const progress = ((state.q + 1) / QUESTIONS.length) * 100;

    return `
      <div class="page">
        ${renderHeader()}
        <main class="quiz">
          <div class="quiz-meta">
            <span>${state.q + 1} / ${QUESTIONS.length}</span>
            ${state.q > 0 ? `<button class="link muted" data-action="back">Vorige</button>` : ""}
          </div>
          <div class="progress" aria-hidden="true"><span style="width:${progress}%"></span></div>

          <div class="question-wrap">
            <h2 class="question">${escapeHtml(question.question)}</h2>
            ${question.hint ? `<p class="hint">${escapeHtml(question.hint)}</p>` : ""}
            <div class="options" role="radiogroup" aria-label="${escapeHtml(question.question)}">
              ${question.options
                .map(
                  (o, i) => `
                <button class="option ${selected === o.id ? "selected" : ""}" role="radio" aria-checked="${selected === o.id}" data-action="answer" data-value="${o.id}">
                  <span class="key">${"abcdef"[i]}</span>${escapeHtml(o.label)}
                </button>`
                )
                .join("")}
            </div>
          </div>
        </main>
      </div>`;
  }

  function renderLoading() {
    return `
      <main class="page loading">
        <p class="loading-text" aria-live="polite">${LOADING_MESSAGES[0]}</p>
      </main>`;
  }

  function renderRoast() {
    const user = currentUser();
    const name = displayName(user);
    const r = generateRoast(user.answers, user.seed, name);
    const date = new Date(user.roastedAt || Date.now()).toLocaleDateString("nl-BE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const evidence = QUESTIONS.map((q) => {
      const opt = q.options.find((o) => o.id === user.answers[q.id]);
      return `<div><dt>${escapeHtml(q.short)}</dt><dd>${escapeHtml(opt ? opt.label : "—")}</dd></div>`;
    }).join("");

    return `
      <div class="page">
        ${renderHeader()}
        <main>
          <article class="letter">
            <p class="date">${date}</p>
            <p class="salutation">Beste ${escapeHtml(name)},</p>
            <p>${escapeHtml(r.intro)}</p>
            ${r.items.map((it) => `<p>${escapeHtml(it.text)}</p>`).join("")}
            <p>${escapeHtml(r.outro)}</p>

            <p class="closing">Met weinig respect,</p>
            <p class="signature">Geroosterd.</p>

            <p class="ps"><em>P.S.</em> Je levensscore is <strong>${r.score} op 100</strong>. Conclusie: ${escapeHtml(r.verdict.title.toLowerCase())}. ${escapeHtml(r.verdict.text)}</p>
          </article>

          <nav class="actions">
            <button class="link" data-action="reroll">Andere roast</button>
            <button class="link" data-action="copy">Kopiëren</button>
            <button class="link" data-action="retake">Vragen opnieuw invullen</button>
          </nav>

          <details class="answers">
            <summary>Jouw antwoorden</summary>
            <dl>${evidence}</dl>
          </details>

          <footer class="footer">
            <button class="link muted" data-action="delete">Account verwijderen</button>
          </footer>
        </main>
      </div>`;
  }

  function renderToast() {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = state.toast;
    el.classList.toggle("show", Boolean(state.toast));
  }

  function render() {
    const user = currentUser();
    // Bewaak de schermen: zonder account geen quiz of roast.
    if (state.screen !== "auth" && !user) state.screen = "auth";
    if (state.screen === "roast" && !user.answers) state.screen = "quiz";

    const screens = { auth: renderAuth, quiz: renderQuiz, loading: renderLoading, roast: renderRoast };
    app.innerHTML = screens[state.screen]();
    document.body.dataset.screen = state.screen;
  }

  // ---------- events ----------

  app.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const action = el.dataset.action;

    if (action !== "delete") e.preventDefault();

    switch (action) {
      case "home": {
        const user = currentUser();
        if (!user) go("auth");
        else if (user.answers) go("roast");
        break;
      }
      case "mode":
        state.authMode = el.dataset.mode;
        state.authError = "";
        render();
        break;
      case "answer":
        answer(el.dataset.value);
        break;
      case "back":
        back();
        break;
      case "logout":
        logout();
        break;
      case "reroll":
        reroll();
        break;
      case "copy":
        copyRoast();
        break;
      case "retake":
        startQuiz(currentUser().answers || {});
        break;
      case "delete":
        deleteAccount();
        break;
    }
  });

  app.addEventListener("submit", (e) => {
    if (e.target.id === "auth-form") {
      e.preventDefault();
      handleAuth(e.target);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (state.screen !== "quiz" || e.metaKey || e.ctrlKey || e.altKey) return;
    const question = QUESTIONS[state.q];
    const key = e.key.toLowerCase();
    const letterIndex = "abcdef".indexOf(key);
    const numberIndex = "123456".indexOf(key);
    const index = letterIndex >= 0 ? letterIndex : numberIndex;
    if (index >= 0 && question.options[index]) {
      e.preventDefault();
      answer(question.options[index].id);
    } else if (key === "backspace" || key === "arrowleft") {
      e.preventDefault();
      back();
    }
  });

  // ---------- start ----------

  OLD_KEYS.forEach((key) => write(key, null));

  const user = currentUser();
  if (user) state.screen = user.answers ? "roast" : "quiz";
  render();
})();

(() => {
  const USERS_KEY = "campfireUsers";
  const currentPage = document.body.dataset.page;
  const prefix = document.body.dataset.root !== undefined ? "" : "../";

  const escapeHtml = (value) => String(value).replace(/[&<>'\"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;"
  }[character]));

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function renderLayout() {
    const links = [
      ["register", "Register", "main.html"],
      ["login", "Log in", "pages/login.html"],
      ["members", "People", "pages/members.html"],
      ["blank", "Quiet page", "pages/blank.html"]
    ];
    document.getElementById("site-header").innerHTML = `
      <header class="site-header">
        <nav class="navbar" aria-label="Main navigation">
          <a class="brand" href="${prefix}main.html">camp<span>fire</span></a>
          <div class="nav-links">
            ${links.map(([id, label, path]) => `<a class="${id === currentPage ? "active" : ""}" href="${prefix}${path}" ${id === currentPage ? "aria-current=\"page\"" : ""}>${label}</a>`).join("")}
          </div>
        </nav>
      </header>`;
    document.getElementById("site-footer").innerHTML = `<footer class="site-footer">Campfire Club &middot; Learn together, make things, stay curious.</footer>`;
    document.body.insertAdjacentHTML("beforeend", `
      <div class="modal-backdrop" id="info-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
        <section class="modal">
          <button class="modal-close" type="button" aria-label="Close modal" data-close-modal>&times;</button>
          <p class="eyebrow">Campfire Club</p>
          <h2 id="modal-title">Registration complete.</h2>
          <p id="modal-text">Your account has been saved in this browser.</p>
          <button class="primary-button" type="button" data-close-modal>Close</button>
        </section>
      </div>`);
  }

  function setupModal() {
    const modal = document.getElementById("info-modal");
    modal.addEventListener("click", (event) => {
      if (event.target === modal || event.target.closest("[data-close-modal]")) modal.hidden = true;
    });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") modal.hidden = true; });
    return (title, text) => {
      document.getElementById("modal-title").textContent = title;
      document.getElementById("modal-text").textContent = text;
      modal.hidden = false;
    };
  }

  function setupRegistration(showModal) {
    const form = document.getElementById("registration-form");
    if (!form) return;
    const message = document.getElementById("form-message");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim().toLowerCase();
      const password = form.elements.password.value;
      const users = getUsers();
      if (users.some((user) => user.email === email)) {
        message.textContent = "This email is already registered.";
        return;
      }
      users.push({ name, email, password });
      saveUsers(users);
      form.reset();
      message.textContent = "Registration complete. You can now log in.";
      showModal("Registration complete.", "Your account has been saved in this browser.");
    });
  }

  function setupLogin() {
    const form = document.getElementById("login-form");
    if (!form) return;
    const message = document.getElementById("login-message");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = form.elements.email.value.trim().toLowerCase();
      const password = form.elements.password.value;
      const user = getUsers().find((person) => person.email === email && person.password === password);
      message.textContent = user ? `Welcome back, ${user.name}.` : "We could not find a matching email and password.";
      if (user) form.reset();
    });
  }

  function renderMembers() {
    const body = document.getElementById("members-body");
    if (!body) return;
    const users = getUsers();
    if (!users.length) {
      body.innerHTML = '<tr><td class="empty-state" colspan="3">No registrations yet. Visit the Register page to add the first person.</td></tr>';
      return;
    }
    body.innerHTML = users.map((user, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(user.name)}</td><td>${escapeHtml(user.email)}</td></tr>`).join("");
  }

  renderLayout();
  const showModal = setupModal();
  setupRegistration(showModal);
  setupLogin();
  renderMembers();
})();

(async () => {
  const loginGate = document.getElementById("loginGate");
  const appContent = document.getElementById("appContent");
  const statusBadge = document.getElementById("statusBadge");
  const statusText = document.getElementById("statusText");

  function showLoggedIn() {
    loginGate.classList.remove("visible");
    appContent.classList.add("visible");
    statusBadge.className = "status-badge active";
    statusText.textContent = "Ready";
  }

  function showLoggedOut() {
    loginGate.classList.add("visible");
    appContent.classList.remove("visible");
    statusBadge.className = "status-badge";
    statusText.textContent = "Logged out";
  }

  // Instantly restore last-known login state to avoid flash
  const { wasLoggedIn } = await chrome.storage.local.get("wasLoggedIn");
  if (wasLoggedIn) {
    showLoggedIn();
    const { cachedResults } = await chrome.storage.local.get("cachedResults");
    if (cachedResults) {
      document.getElementById("username").value = cachedResults.username;
      renderResults(cachedResults.dontFollowMeBack);
    }
  }

  // Then verify with a live check
  try {
    const result = await chrome.runtime.sendMessage({ action: "checkLogin" });
    if (result && result.loggedIn) {
      await chrome.storage.local.set({ wasLoggedIn: true });
      showLoggedIn();
      // Load cached results if we haven't already
      if (!wasLoggedIn) {
        const { cachedResults } = await chrome.storage.local.get("cachedResults");
        if (cachedResults) {
          document.getElementById("username").value = cachedResults.username;
          renderResults(cachedResults.dontFollowMeBack);
        }
      }
    } else {
      await chrome.storage.local.set({ wasLoggedIn: false });
      showLoggedOut();
    }
  } catch {
    await chrome.storage.local.set({ wasLoggedIn: false });
    showLoggedOut();
  }
})();

document.getElementById("scanBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const userList = document.getElementById("userList");
  const statusBadge = document.getElementById("statusBadge");
  const statusText = document.getElementById("statusText");

  if (!username) {
    document.getElementById("username").focus();
    return;
  }

  document.getElementById("scanBtn").disabled = true;
  statusBadge.className = "status-badge active";
  statusText.textContent = "Scanning…";

  userList.innerHTML = `
    <div class="progress-msg">
      <div class="spinner"></div>
      <div>Fetching data for <strong>@${escapeHtml(username)}</strong>…</div>
    </div>`;

  try {
    const response = await chrome.runtime.sendMessage({
      action: "scrapeInstagram",
      username,
    });

    if (response.error) {
      userList.innerHTML = `<div class="error-msg">${escapeHtml(response.error)}</div>`;
      statusBadge.className = "status-badge";
      statusText.textContent = "Error";
    } else {
      // Cache results
      await chrome.storage.local.set({
        cachedResults: {
          username,
          dontFollowMeBack: response.dontFollowMeBack,
        },
      });
      renderResults(response.dontFollowMeBack);
    }
  } catch (error) {
    userList.innerHTML = `<div class="error-msg">${escapeHtml(error.message)}</div>`;
    statusBadge.className = "status-badge";
    statusText.textContent = "Error";
  } finally {
    document.getElementById("scanBtn").disabled = false;
  }
});

async function renderResults(dontFollowMeBack) {
  const userList = document.getElementById("userList");
  const statusBadge = document.getElementById("statusBadge");
  const statusText = document.getElementById("statusText");

  document.getElementById("statUnfollowers").textContent = dontFollowMeBack.length;
  statusBadge.className = "status-badge active";
  statusText.textContent = `${dontFollowMeBack.length} found`;

  const { profilePicCache = {} } = await chrome.storage.local.get("profilePicCache");

  userList.innerHTML = `
    <input class="filter-input" id="filterInput" type="text" placeholder="Filter usernames…" spellcheck="false">
    <div class="filter-row">
      <label class="verified-label" for="verifiedToggle">Include verified</label>
      <label class="toggle-switch">
        <input type="checkbox" id="verifiedToggle" checked>
        <span class="toggle-slider"></span>
      </label>
    </div>`;
  const container = document.createElement("div");

  dontFollowMeBack.forEach((user, i) => {
    const cachedPic = profilePicCache[user.username];
    const imgSrc = cachedPic || getInitialsAvatar(user.username);
    const fallback = getInitialsAvatar(user.username);

    const item = document.createElement("div");
    item.className = "user-item";
    item.dataset.username = user.username.toLowerCase();
    item.dataset.verified = user.is_verified ? "true" : "false";
    item.style.animationDelay = `${Math.min(i * 30, 300)}ms`;

    item.innerHTML = `
      <img class="user-avatar" src="${imgSrc}" alt="${escapeHtml(user.username)}" onerror="this.src='${fallback}'">
      <div class="user-info">
        <div class="user-name">${escapeHtml(user.username)}</div>
        <div class="user-fullname">${escapeHtml(user.full_name || "")}</div>
      </div>`;

    item.querySelector(".user-name").addEventListener("click", () => {
      window.open(`https://instagram.com/${user.username}`, "_blank");
    });

    container.appendChild(item);
  });

  userList.appendChild(container);

  function applyFilters() {
    const q = document.getElementById("filterInput").value.toLowerCase();
    const includeVerified = document.getElementById("verifiedToggle").checked;
    let visible = 0;
    container.querySelectorAll(".user-item").forEach((item) => {
      const matchesText = item.dataset.username.includes(q);
      const matchesVerified = includeVerified || item.dataset.verified !== "true";
      const show = matchesText && matchesVerified;
      item.style.display = show ? "" : "none";
      if (show) visible++;
    });
    document.getElementById("statUnfollowers").textContent = visible;
    statusText.textContent = `${visible} found`;
  }

  document.getElementById("filterInput").addEventListener("input", applyFilters);
  document.getElementById("verifiedToggle").addEventListener("change", applyFilters);

  const copyBtn = document.getElementById("copyBtn");
  copyBtn.style.display = "inline-block";
  copyBtn.addEventListener("click", () => {
    const visible = [...container.querySelectorAll('.user-item')]
      .filter(item => item.style.display !== 'none')
      .map(item => item.dataset.username);
    navigator.clipboard.writeText(visible.join('\n')).then(() => {
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.textContent = "Copy";
        copyBtn.classList.remove("copied");
      }, 1500);
    });
  });
}

document.getElementById("username").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("scanBtn").click();
});

function getInitialsAvatar(username) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 50;
  canvas.height = 50;

  context.fillStyle = "#27272A";
  context.beginPath();
  context.arc(25, 25, 25, 0, Math.PI * 2, true);
  context.fill();

  context.font = "bold 20px Arial";
  context.fillStyle = "#71717A";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(username.substring(0, 2).toUpperCase(), 25, 25);

  return canvas.toDataURL();
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

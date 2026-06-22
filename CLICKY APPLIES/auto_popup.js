// auto_popup.js - Shows the TEAM IQRA in-page apply panel automatically.

(function () {
  const DEFAULT_BD_NAMES = [
    "Chand Ali Shakir",
    "Saad Tahir",
    "Muhammad Adeel",
    "Muhammad Aliyan Malik",
    "Farhan Khan",
    "Muhammad Akbar",
    "Usama Umer",
    "Ali Raza",
    "Abdul Moiz",
    "Usman",
    "Huzaifa",
    "Ahmed Sharjeel",
    "Iqra",
    "Safi ullah Khan",
    "Ahmed Hamza"
  ];

  const DEFAULT_TECH_STACKS = ["AI/ML", "Full Stack", "Frontend", "Backend", "DevOps", "Data Science", "Mobile", "Other"];
  const PANEL_ID = "clickyAutoPanel";
  let lastUrl = window.location.href;
  let urlWatchTimer = null;
  let currentBdNames = DEFAULT_BD_NAMES.slice();
  let currentTechStacks = DEFAULT_TECH_STACKS.slice();

  function shouldSkipPage() {
    const url = window.location.href;
    return url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://") ||
      url.startsWith("edge://") ||
      url.startsWith("about:") ||
      url.includes("chrome.google.com/webstore") ||
      url.includes("chromewebstore.google.com");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function optionHtml(options, selected) {
    return options.map((option) => {
      const isSelected = option === selected ? " selected" : "";
      return `<option value="${escapeHtml(option)}"${isSelected}>${escapeHtml(option)}</option>`;
    }).join("");
  }

  function getJobInfo() {
    if (typeof window.__CLICKY_DETECT_JOB_INFO === "function") {
      return window.__CLICKY_DETECT_JOB_INFO();
    }

    return {
      jobTitle: document.querySelector("h1")?.textContent?.trim() || document.title || "",
      company: "",
      url: window.location.href
    };
  }

  function setStatus(message, type) {
    const status = document.getElementById("clickyAutoStatus");
    if (!status) return;
    status.textContent = message;
    status.style.color = type === "error" ? "#fca5a5" : "#86efac";
  }

  function setInputValue(id, value, force) {
    const input = document.getElementById(id);
    if (!input) return;
    if (force || !input.value.trim()) {
      input.value = value || "";
    }
  }

  function fillDetectedInfo(force) {
    const info = getJobInfo();
    setInputValue("clickyAutoJobTitle", info.jobTitle, force);
    setInputValue("clickyAutoCompany", info.company, force);
    setInputValue("clickyAutoJobUrl", info.url || window.location.href, true);
  }

  async function loadSettings() {
    const stored = await chrome.storage.sync.get([
      "autoPopup",
      "bdNames",
      "techStacks",
      "defaultBd",
      "defaultTechStack"
    ]);

    currentBdNames = Array.isArray(stored.bdNames) && stored.bdNames.length
      ? stored.bdNames
      : DEFAULT_BD_NAMES.slice();

    currentTechStacks = Array.isArray(stored.techStacks) && stored.techStacks.length
      ? stored.techStacks
      : DEFAULT_TECH_STACKS.slice();

    return stored;
  }

  async function injectPanel() {
    if (shouldSkipPage() || document.getElementById(PANEL_ID) || !document.body) {
      return;
    }

    const stored = await loadSettings();

    if (stored.autoPopup === false) {
      return;
    }

    const defaultBd = currentBdNames.includes(stored.defaultBd) ? stored.defaultBd : currentBdNames[0];
    const defaultTechStack = currentTechStacks.includes(stored.defaultTechStack) ? stored.defaultTechStack : currentTechStacks[0];

    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <style>
        #${PANEL_ID} {
          position: fixed;
          right: 18px;
          bottom: 18px;
          width: 360px;
          max-width: calc(100vw - 24px);
          z-index: 2147483647;
          color: #f8fafc;
          background: #111827;
          border: 1px solid #334155;
          border-radius: 8px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
          font-family: Arial, Helvetica, sans-serif;
          overflow: hidden;
        }
        #${PANEL_ID} * { box-sizing: border-box; font-family: Arial, Helvetica, sans-serif; }
        #${PANEL_ID} .clicky-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 9px 10px;
          background: #1557c8;
        }
        #${PANEL_ID} .clicky-title { font-size: 15px; font-weight: 800; line-height: 1; }
        #${PANEL_ID} .clicky-head-actions { display: flex; align-items: center; gap: 6px; }
        #${PANEL_ID} .clicky-icon-btn {
          border: 0;
          background: rgba(255,255,255,0.14);
          color: #fff;
          min-width: 28px;
          height: 28px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          line-height: 1;
          padding: 0 8px;
        }
        #${PANEL_ID} .clicky-body {
          display: grid;
          gap: 9px;
          padding: 12px;
        }
        #${PANEL_ID} label {
          display: grid;
          gap: 5px;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0;
        }
        #${PANEL_ID} input,
        #${PANEL_ID} select {
          width: 100%;
          border: 1px solid #334155;
          border-radius: 7px;
          background: #0f172a;
          color: #f8fafc;
          padding: 8px 9px;
          font-size: 13px;
          font-weight: 700;
          outline: none;
        }
        #${PANEL_ID} input:focus,
        #${PANEL_ID} select:focus { border-color: #60a5fa; }
        #${PANEL_ID} .clicky-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        #${PANEL_ID} .clicky-actions {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          align-items: center;
          margin-top: 2px;
        }
        #${PANEL_ID} .clicky-apply,
        #${PANEL_ID} .clicky-refresh,
        #${PANEL_ID} .clicky-save-settings,
        #${PANEL_ID} .clicky-add-btn {
          border: 0;
          border-radius: 7px;
          cursor: pointer;
          color: #fff;
          padding: 10px 11px;
          font-weight: 800;
          font-size: 13px;
        }
        #${PANEL_ID} .clicky-apply { background: #2563eb; }
        #${PANEL_ID} .clicky-refresh,
        #${PANEL_ID} .clicky-add-btn { background: #334155; }
        #${PANEL_ID} .clicky-save-settings { background: #2563eb; font-size: 13px; padding: 10px 12px; }
        #${PANEL_ID} .clicky-apply:disabled { opacity: 0.7; cursor: not-allowed; }
        #${PANEL_ID} .clicky-status {
          min-height: 18px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 700;
        }
        #${PANEL_ID} .clicky-settings {
          display: none;
          border-top: 1px solid #334155;
          padding: 12px;
          background: #0f172a;
        }
        #${PANEL_ID}.settings-open .clicky-settings { display: block; }
        #${PANEL_ID}.settings-open .clicky-body { display: none; }
        #${PANEL_ID} .clicky-settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        #${PANEL_ID} .clicky-settings-title {
          color: #f8fafc;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 6px;
        }
        #${PANEL_ID} .clicky-list {
          display: grid;
          gap: 6px;
          max-height: 112px;
          overflow: auto;
          padding-right: 3px;
        }
        #${PANEL_ID} .clicky-list-item {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          align-items: center;
          background: #111827;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 6px 8px;
          font-size: 12px;
          font-weight: 700;
        }
        #${PANEL_ID} .clicky-remove {
          border: 0;
          border-radius: 6px;
          background: #7f1d1d;
          color: #fff;
          cursor: pointer;
          width: 26px;
          height: 24px;
          font-weight: 800;
        }
        #${PANEL_ID} .clicky-add-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          margin-top: 8px;
        }
        #${PANEL_ID} .clicky-add-row input {
          font-size: 13px;
          padding: 10px;
        }
        #${PANEL_ID} .clicky-add-btn {
          font-size: 13px;
          padding: 10px 12px;
        }
        #${PANEL_ID} .clicky-footer {
          padding: 0 12px 10px;
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          text-align: center;
        }
        @media (max-width: 620px) {
          #${PANEL_ID} { width: calc(100vw - 24px); right: 12px; bottom: 12px; }
          #${PANEL_ID} .clicky-row,
          #${PANEL_ID} .clicky-settings-grid { grid-template-columns: 1fr; }
        }
      </style>
      <div class="clicky-head">
        <div class="clicky-title">TEAM IQRA</div>
        <div class="clicky-head-actions">
          <button class="clicky-icon-btn" id="clickyAutoSettings" title="Settings">Settings</button>
          <button class="clicky-icon-btn" id="clickyAutoClose" title="Close">x</button>
        </div>
      </div>
      <div class="clicky-body">
        <label>Job Title
          <input id="clickyAutoJobTitle" type="text" placeholder="Job title">
        </label>
        <label>Company
          <input id="clickyAutoCompany" type="text" placeholder="Company name">
        </label>
        <label>Job URL
          <input id="clickyAutoJobUrl" type="text" placeholder="https://...">
        </label>
        <div class="clicky-row">
          <label>BD Name
            <select id="clickyAutoBdName">${optionHtml(currentBdNames, defaultBd)}</select>
          </label>
          <label>Tech Stack
            <select id="clickyAutoTechStack">${optionHtml(currentTechStacks, defaultTechStack)}</select>
          </label>
        </div>
        <div class="clicky-actions">
          <button class="clicky-apply" id="clickyAutoApplyBtn">Apply</button>
          <button class="clicky-refresh" id="clickyAutoRefreshBtn" title="Refresh detected info">Refresh</button>
        </div>
        <div class="clicky-status" id="clickyAutoStatus"></div>
      </div>
      <div class="clicky-settings">
        <div class="clicky-settings-grid">
          <div>
            <div class="clicky-settings-title">BD Names</div>
            <div class="clicky-list" id="clickyBdList"></div>
            <div class="clicky-add-row">
              <input id="clickyNewBdName" type="text" placeholder="Add BD name">
              <button class="clicky-add-btn" id="clickyAddBd">Add</button>
            </div>
          </div>
          <div>
            <div class="clicky-settings-title">Tech Stack</div>
            <div class="clicky-list" id="clickyTechList"></div>
            <div class="clicky-add-row">
              <input id="clickyNewTechStack" type="text" placeholder="Add tech stack">
              <button class="clicky-add-btn" id="clickyAddTech">Add</button>
            </div>
          </div>
        </div>
        <div style="margin-top:12px;">
          <button class="clicky-save-settings" id="clickySaveSettings">Save Settings</button>
        </div>
      </div>
      <div class="clicky-footer">DEVELOPED BY SAAD TAHIR</div>
    `;

    document.body.appendChild(panel);

    document.getElementById("clickyAutoClose").addEventListener("click", () => panel.remove());
    document.getElementById("clickyAutoSettings").addEventListener("click", toggleSettings);
    document.getElementById("clickyAutoRefreshBtn").addEventListener("click", () => {
      fillDetectedInfo(true);
      setStatus("Detected info refreshed.", "success");
    });
    document.getElementById("clickyAutoApplyBtn").addEventListener("click", submitApplication);
    document.getElementById("clickyAddBd").addEventListener("click", addBdName);
    document.getElementById("clickyAddTech").addEventListener("click", addTechStack);
    document.getElementById("clickySaveSettings").addEventListener("click", savePanelSettings);
    document.getElementById("clickyNewBdName").addEventListener("keydown", (event) => {
      if (event.key === "Enter") addBdName();
    });
    document.getElementById("clickyNewTechStack").addEventListener("keydown", (event) => {
      if (event.key === "Enter") addTechStack();
    });

    renderSettingsLists();
    fillDetectedInfo(true);
    setTimeout(() => fillDetectedInfo(false), 900);
    setTimeout(() => fillDetectedInfo(false), 2000);
  }

  function toggleSettings() {
    const panel = document.getElementById(PANEL_ID);
    const button = document.getElementById("clickyAutoSettings");
    if (!panel || !button) return;

    const isOpen = panel.classList.toggle("settings-open");
    button.textContent = isOpen ? "Back" : "Settings";
    renderSettingsLists();
  }

  function renderSettingsLists() {
    renderList("clickyBdList", currentBdNames, (index) => {
      if (currentBdNames.length <= 1) {
        setStatus("Keep at least one BD name.", "error");
        return;
      }
      currentBdNames.splice(index, 1);
      renderSettingsLists();
      refreshSelects();
    });

    renderList("clickyTechList", currentTechStacks, (index) => {
      if (currentTechStacks.length <= 1) {
        setStatus("Keep at least one tech stack.", "error");
        return;
      }
      currentTechStacks.splice(index, 1);
      renderSettingsLists();
      refreshSelects();
    });
  }

  function renderList(containerId, items, onRemove) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    items.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "clicky-list-item";

      const text = document.createElement("span");
      text.textContent = item;

      const button = document.createElement("button");
      button.className = "clicky-remove";
      button.textContent = "x";
      button.title = "Remove";
      button.addEventListener("click", () => onRemove(index));

      row.appendChild(text);
      row.appendChild(button);
      container.appendChild(row);
    });
  }

  function addBdName() {
    const input = document.getElementById("clickyNewBdName");
    const value = input.value.trim();
    if (!value) return;
    if (!currentBdNames.includes(value)) currentBdNames.push(value);
    input.value = "";
    renderSettingsLists();
    refreshSelects(value, null);
  }

  function addTechStack() {
    const input = document.getElementById("clickyNewTechStack");
    const value = input.value.trim();
    if (!value) return;
    if (!currentTechStacks.includes(value)) currentTechStacks.push(value);
    input.value = "";
    renderSettingsLists();
    refreshSelects(null, value);
  }

  function refreshSelects(selectedBd, selectedTech) {
    const bdSelect = document.getElementById("clickyAutoBdName");
    const techSelect = document.getElementById("clickyAutoTechStack");

    if (bdSelect) {
      const selected = selectedBd || bdSelect.value || currentBdNames[0];
      bdSelect.innerHTML = optionHtml(currentBdNames, currentBdNames.includes(selected) ? selected : currentBdNames[0]);
    }

    if (techSelect) {
      const selected = selectedTech || techSelect.value || currentTechStacks[0];
      techSelect.innerHTML = optionHtml(currentTechStacks, currentTechStacks.includes(selected) ? selected : currentTechStacks[0]);
    }
  }

  async function savePanelSettings() {
    const bdSelect = document.getElementById("clickyAutoBdName");
    const techSelect = document.getElementById("clickyAutoTechStack");

    await chrome.storage.sync.set({
      bdNames: currentBdNames,
      techStacks: currentTechStacks,
      defaultBd: bdSelect?.value || currentBdNames[0],
      defaultTechStack: techSelect?.value || currentTechStacks[0]
    });

    setStatus("Settings saved.", "success");
    toggleSettings();
  }

  function resetApplyButton() {
    const applyBtn = document.getElementById("clickyAutoApplyBtn");
    if (!applyBtn) return;
    applyBtn.disabled = false;
    applyBtn.textContent = "Apply";
  }

  function submitApplication() {
    const applyBtn = document.getElementById("clickyAutoApplyBtn");
    const payload = {
      timestamp: new Date().toISOString(),
      bdName: document.getElementById("clickyAutoBdName").value,
      company: document.getElementById("clickyAutoCompany").value.trim(),
      jobTitle: document.getElementById("clickyAutoJobTitle").value.trim(),
      jobUrl: document.getElementById("clickyAutoJobUrl").value.trim() || window.location.href,
      techStack: document.getElementById("clickyAutoTechStack").value
    };

    if (!payload.jobTitle || !payload.company) {
      setStatus("Please fill Job Title and Company.", "error");
      return;
    }

    applyBtn.disabled = true;
    applyBtn.textContent = "Applying...";
    setStatus("Saving to sheet...", "success");

    let finished = false;
    const fallbackTimer = setTimeout(() => {
      if (finished) return;
      finished = true;
      resetApplyButton();
      setStatus("Saved or sent. If it appears in the sheet, you are good.", "success");
    }, 15000);

    chrome.runtime.sendMessage({ action: "SUBMIT_APPLICATION", data: payload }, (res) => {
      if (finished) return;
      finished = true;
      clearTimeout(fallbackTimer);
      resetApplyButton();

      if (chrome.runtime.lastError) {
        setStatus(chrome.runtime.lastError.message || "Extension connection error.", "error");
        return;
      }

      if (res && res.success) {
        setStatus("Saved to sheet.", "success");
      } else {
        setStatus(res?.error || "Error. Check Web App URL in extension settings.", "error");
      }
    });
  }

  function watchUrlChanges() {
    if (urlWatchTimer) return;
    urlWatchTimer = setInterval(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        if (!document.getElementById(PANEL_ID)) {
          injectPanel();
        } else {
          setTimeout(() => fillDetectedInfo(true), 600);
          setTimeout(() => fillDetectedInfo(false), 1600);
        }
      }
    }, 800);
  }

  window.addEventListener("load", injectPanel);
  setTimeout(injectPanel, 700);
  setTimeout(injectPanel, 1800);
  watchUrlChanges();
})();

// popup.js

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

const jobTitleEl = document.getElementById("jobTitle");
const companyEl = document.getElementById("company");
const jobUrlEl = document.getElementById("jobUrl");
const bdNameEl = document.getElementById("bdName");
const techStackEl = document.getElementById("techStack");
const applyBtn = document.getElementById("applyBtn");
const toast = document.getElementById("toast");
const autoPopupEl = document.getElementById("autoPopup");
const toggleStatus = document.getElementById("toggleStatus");
const saveDefaultEl = document.getElementById("saveDefault");
const settingsToggle = document.getElementById("settingsToggle");
const settingsPanel = document.getElementById("settingsPanel");
const mainForm = document.getElementById("mainForm");
const webAppUrlEl = document.getElementById("webAppUrl");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const bdListEl = document.getElementById("bdList");
const newBdNameEl = document.getElementById("newBdName");
const addBdBtn = document.getElementById("addBdBtn");
const techListEl = document.getElementById("techList");
const newTechStackEl = document.getElementById("newTechStack");
const addTechBtn = document.getElementById("addTechBtn");

let bdNames = [...DEFAULT_BD_NAMES];
let techStacks = [...DEFAULT_TECH_STACKS];

async function init() {
  const stored = await chrome.storage.sync.get([
    "autoPopup",
    "defaultBd",
    "defaultTechStack",
    "bdNames",
    "techStacks",
    "WEB_APP_URL"
  ]);

  if (Array.isArray(stored.bdNames) && stored.bdNames.length) bdNames = stored.bdNames;
  if (Array.isArray(stored.techStacks) && stored.techStacks.length) techStacks = stored.techStacks;

  populateBdDropdown(stored.defaultBd);
  populateTechDropdown(stored.defaultTechStack);

  const ap = stored.autoPopup !== false;
  autoPopupEl.checked = ap;
  toggleStatus.textContent = ap ? "On" : "Off";
  toggleStatus.style.color = ap ? "#6366f1" : "#6b7280";

  if (stored.WEB_APP_URL) webAppUrlEl.value = stored.WEB_APP_URL;

  fillFromActiveTab();
  renderBdList();
  renderTechList();
}

async function fillFromActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;

    jobUrlEl.value = tab.url || "";

    chrome.tabs.sendMessage(tab.id, { action: "GET_JOB_INFO" }, (res) => {
      if (chrome.runtime.lastError || !res) return;
      jobTitleEl.value = res.jobTitle || jobTitleEl.value;
      companyEl.value = res.company || companyEl.value;
      jobUrlEl.value = res.url || tab.url || jobUrlEl.value;
    });
  } catch (e) {}
}

function populateBdDropdown(defaultBd) {
  bdNameEl.innerHTML = "";
  bdNames.forEach((name) => addOption(bdNameEl, name));
  if (defaultBd && bdNames.includes(defaultBd)) bdNameEl.value = defaultBd;
}

function populateTechDropdown(defaultTechStack) {
  techStackEl.innerHTML = "";
  techStacks.forEach((stack) => addOption(techStackEl, stack));
  if (defaultTechStack && techStacks.includes(defaultTechStack)) techStackEl.value = defaultTechStack;
}

function addOption(select, value) {
  const opt = document.createElement("option");
  opt.value = value;
  opt.textContent = value;
  select.appendChild(opt);
}

function renderBdList() {
  renderList(bdListEl, bdNames, removeBd);
}

function renderTechList() {
  renderList(techListEl, techStacks, removeTech);
}

function renderList(container, items, onRemove) {
  if (!container) return;
  container.innerHTML = "";
  items.forEach((name, i) => {
    const item = document.createElement("div");
    item.className = "list-item";

    const label = document.createElement("span");
    label.textContent = name;

    const button = document.createElement("button");
    button.title = "Remove";
    button.textContent = "x";
    button.addEventListener("click", () => onRemove(i));

    item.appendChild(label);
    item.appendChild(button);
    container.appendChild(item);
  });
}

function removeBd(index) {
  if (bdNames.length <= 1) return showToast("Keep at least one BD name.", "error");
  bdNames.splice(index, 1);
  renderBdList();
  populateBdDropdown(bdNameEl.value);
}

function removeTech(index) {
  if (techStacks.length <= 1) return showToast("Keep at least one tech stack.", "error");
  techStacks.splice(index, 1);
  renderTechList();
  populateTechDropdown(techStackEl.value);
}

autoPopupEl.addEventListener("change", () => {
  const on = autoPopupEl.checked;
  toggleStatus.textContent = on ? "On" : "Off";
  toggleStatus.style.color = on ? "#6366f1" : "#6b7280";
  chrome.storage.sync.set({ autoPopup: on });
});

settingsToggle.addEventListener("click", () => {
  const isOpen = settingsPanel.classList.toggle("active");
  mainForm.classList.toggle("hidden", isOpen);
  settingsToggle.textContent = isOpen ? "x" : "Settings";
  if (isOpen) {
    renderBdList();
    renderTechList();
  }
});

addBdBtn.addEventListener("click", () => {
  const name = newBdNameEl.value.trim();
  if (!name) return;
  if (!bdNames.includes(name)) bdNames.push(name);
  newBdNameEl.value = "";
  renderBdList();
  populateBdDropdown(name);
});

addTechBtn.addEventListener("click", () => {
  const name = newTechStackEl.value.trim();
  if (!name) return;
  if (!techStacks.includes(name)) techStacks.push(name);
  newTechStackEl.value = "";
  renderTechList();
  populateTechDropdown(name);
});

newBdNameEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addBdBtn.click();
});

newTechStackEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTechBtn.click();
});

saveSettingsBtn.addEventListener("click", async () => {
  const url = webAppUrlEl.value.trim();
  await chrome.storage.sync.set({
    WEB_APP_URL: url,
    bdNames,
    techStacks,
    defaultBd: bdNameEl.value,
    defaultTechStack: techStackEl.value
  });

  showToast("Settings saved.", "success");
  setTimeout(() => {
    settingsPanel.classList.remove("active");
    mainForm.classList.remove("hidden");
    settingsToggle.textContent = "Settings";
  }, 800);
});

applyBtn.addEventListener("click", async () => {
  const payload = {
    timestamp: new Date().toISOString(),
    bdName: bdNameEl.value,
    company: companyEl.value.trim(),
    jobTitle: jobTitleEl.value.trim(),
    jobUrl: jobUrlEl.value.trim(),
    techStack: techStackEl.value
  };

  if (!payload.jobTitle || !payload.company) {
    showToast("Please fill in Job Title and Company.", "error");
    return;
  }

  if (!payload.jobUrl) {
    showToast("No Job URL detected. Please fill it in.", "error");
    return;
  }

  if (saveDefaultEl.checked) {
    await chrome.storage.sync.set({ defaultBd: payload.bdName, defaultTechStack: payload.techStack });
  }

  applyBtn.disabled = true;
  applyBtn.textContent = "Applying...";

  let finished = false;
  const fallbackTimer = setTimeout(() => {
    if (finished) return;
    finished = true;
    applyBtn.disabled = false;
    applyBtn.textContent = "Apply";
    showToast("Saved or sent. If it appears in the sheet, you are good.", "success");
  }, 15000);

  chrome.runtime.sendMessage({ action: "SUBMIT_APPLICATION", data: payload }, (res) => {
    if (finished) return;
    finished = true;
    clearTimeout(fallbackTimer);
    applyBtn.disabled = false;
    applyBtn.textContent = "Apply";

    if (chrome.runtime.lastError) {
      showToast(chrome.runtime.lastError.message || "Extension connection error.", "error");
      return;
    }

    if (res && res.success) {
      showToast("Application saved to sheet.", "success");
    } else {
      showToast(res?.error || "Unknown error. Check your Web App URL in settings.", "error");
    }
  });
});

function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = "toast " + type;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.className = "toast";
  }, 3500);
}

init();

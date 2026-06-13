let currentSettings = {
  showPageNav: true,
  showCodeNav: true
};

function applySettings(settings) {
  currentSettings = { ...currentSettings, ...settings };
  
  const pageGroup = document.getElementById("ln-page-group");
  const pageDivider = document.getElementById("ln-page-divider");
  const codeGroup = document.getElementById("ln-code-group");
  
  if (pageGroup) pageGroup.style.display = currentSettings.showPageNav ? "flex" : "none";
  if (pageDivider) pageDivider.style.display = currentSettings.showPageNav ? "block" : "none";
  if (codeGroup) codeGroup.style.display = currentSettings.showCodeNav ? "flex" : "none";
}

// Load initial settings
chrome.storage.sync.get({
  showPageNav: true,
  showCodeNav: true
}, (items) => {
  applySettings(items);
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    const newSettings = {};
    if (changes.showPageNav) newSettings.showPageNav = changes.showPageNav.newValue;
    if (changes.showCodeNav) newSettings.showCodeNav = changes.showCodeNav.newValue;
    applySettings(newSettings);
  }
});

function maintenanceLoop() {
  if (!document.getElementById("llm-nav-container")) {
    createUI();
    applySettings(currentSettings);
  }

  const config = getCurrentConfig();
  if (!config) return;

  const container = document.getElementById("llm-nav-container");
  const hasPrompts = document.querySelector(config.prompt) !== null;
  const hasCode = document.querySelector(config.code) !== null;
  const shouldShow = hasPrompts || hasCode;

  if (shouldShow && container.style.display === "none") {
    container.style.display = "flex";
  } else if (!shouldShow && container.style.display !== "none") {
    container.style.display = "none";
  }

  updateMinimap(config);
}

window.addEventListener("load", () => {
  setInterval(maintenanceLoop, 1000);
  maintenanceLoop();
});

document.addEventListener("keydown", (e) => {
  if (!e.altKey) return;
  const tag = e.target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea") return;

  switch (e.code) {
    case "KeyW":
      if (!currentSettings.showCodeNav) return;
      e.preventDefault();
      navigate("code", "prev");
      break;
    case "KeyS":
      if (!currentSettings.showCodeNav) return;
      e.preventDefault();
      navigate("code", "next");
      break;
    case "KeyA":
      e.preventDefault();
      navigate("prompt", "prev");
      break;
    case "KeyD":
      e.preventDefault();
      navigate("prompt", "next");
      break;
  }
});

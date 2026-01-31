/**
 * LLM Scroll Navigator - Root Injection Fix
 */

// --- Configuration ---
const HEADER_OFFSET = 160;
const SCROLL_TOLERANCE = 10;

const SITE_CONFIG = {
  chatgpt: {
    host: "chatgpt.com",
    prompt: '[data-message-author-role="user"]',
    code: "pre",
  },
  claude: { host: "claude.ai", prompt: ".font-user-message", code: "pre" },
  gemini: {
    host: "google.com",
    prompt:
      '.query-content, .user-query, [data-test-id="user-query"], h2[data-test-id="user-query"]',
    code: "pre",
  },
};

// --- Helpers ---
function getCurrentConfig() {
  const host = window.location.hostname;
  if (host.includes("chatgpt.com")) return SITE_CONFIG.chatgpt;
  if (host.includes("claude.ai")) return SITE_CONFIG.claude;
  if (host.includes("google.com")) return SITE_CONFIG.gemini;
  return null;
}

function getScrollParent(node) {
  if (!node) return window;
  let parent = node.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    if (
      (style.overflowY === "auto" || style.overflowY === "scroll") &&
      parent.scrollHeight > parent.clientHeight
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

// --- Navigation ---
function navigate(type, direction) {
  const config = getCurrentConfig();
  if (!config) return;

  const elements = Array.from(document.querySelectorAll(config[type]));
  const visibleElements = elements.filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.height > 0 && el.offsetParent !== null;
  });

  if (visibleElements.length === 0) return;

  let target = null;
  if (direction === "next") {
    target = visibleElements.find(
      (el) => el.getBoundingClientRect().top > HEADER_OFFSET + SCROLL_TOLERANCE,
    );
  } else {
    target = [...visibleElements]
      .reverse()
      .find(
        (el) =>
          el.getBoundingClientRect().top < HEADER_OFFSET - SCROLL_TOLERANCE,
      );
  }

  if (target) {
    smoothScrollToElement(target);
    flashHighlight(target);
  }
}

function smoothScrollToElement(element) {
  const container = getScrollParent(element);
  const rect = element.getBoundingClientRect();
  const scrollAmount = rect.top - HEADER_OFFSET;

  if (container === window) {
    window.scrollBy({ top: scrollAmount, behavior: "smooth" });
  } else {
    container.scrollBy({ top: scrollAmount, behavior: "smooth" });
  }
}

function flashHighlight(element) {
  const originalTransition = element.style.transition;
  const originalOutline = element.style.outline;
  element.style.transition = "outline 0.2s ease";
  element.style.outline = "3px solid #facc15";
  setTimeout(() => {
    element.style.outline = originalOutline;
    element.style.transition = originalTransition;
  }, 600);
}

// --- Draggable Logic ---
function makeDraggable(element) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  element.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if (e.target.tagName.toLowerCase() === "button") return;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;

    // Switch to absolute positioning relative to window
    const rect = element.getBoundingClientRect();
    element.style.bottom = "auto";
    element.style.right = "auto";
    element.style.left = rect.left + "px";
    element.style.top = rect.top + "px";
    element.style.opacity = "1";

    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = element.offsetTop - pos2 + "px";
    element.style.left = element.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    element.style.opacity = "";
  }
}

// --- UI Construction (The Critical Fix) ---
function createUI() {
  if (document.getElementById("llm-nav-container")) return;

  const container = document.createElement("div");
  container.id = "llm-nav-container";
  container.style.display = "none";
  container.innerHTML = `
    <div class="llm-nav-group">
      <span class="llm-nav-label">Prompts (Alt+A/D)</span>
      <div class="llm-nav-buttons">
        <button id="ln-prev-prompt">▲</button>
        <button id="ln-next-prompt">▼</button>
      </div>
    </div>
    <div class="llm-nav-group">
      <span class="llm-nav-label">Code (Alt+W/S)</span>
      <div class="llm-nav-buttons">
        <button id="ln-prev-code">▲</button>
        <button id="ln-next-code">▼</button>
      </div>
    </div>
  `;

  // INJECTION FIX: Attach to documentElement (HTML tag) instead of body
  // This bypasses Gemini's body layout logic completely.
  document.documentElement.appendChild(container);

  makeDraggable(container);

  document.getElementById("ln-prev-prompt").onclick = () =>
    navigate("prompt", "prev");
  document.getElementById("ln-next-prompt").onclick = () =>
    navigate("prompt", "next");
  document.getElementById("ln-prev-code").onclick = () =>
    navigate("code", "prev");
  document.getElementById("ln-next-code").onclick = () =>
    navigate("code", "next");
}

function maintenanceLoop() {
  if (!document.getElementById("llm-nav-container")) createUI();

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
}

// --- Init ---
// Wait for window load to ensure we don't interrupt initial page render
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
      e.preventDefault();
      navigate("code", "prev");
      break;
    case "KeyS":
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

/**
 * LLM Scroll Navigator - With Top/Bottom Navigation
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

// --- Navigation Logic ---
function getTarget(type, direction) {
  const config = getCurrentConfig();
  if (!config) return null;

  const elements = Array.from(document.querySelectorAll(config[type]));
  const visibleElements = elements.filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.height > 0 && el.offsetParent !== null;
  });

  if (visibleElements.length === 0) return null;

  if (direction === "next") {
    return visibleElements.find(
      (el) => el.getBoundingClientRect().top > HEADER_OFFSET + SCROLL_TOLERANCE,
    );
  } else {
    return [...visibleElements]
      .reverse()
      .find(
        (el) =>
          el.getBoundingClientRect().top < HEADER_OFFSET - SCROLL_TOLERANCE,
      );
  }
}

function navigate(type, direction) {
  const target = getTarget(type, direction);

  if (target) {
    smoothScrollToElement(target);
    flashHighlight(target);
  }
}

/**
 * Scrolls to the very top or bottom of the active container
 */
function scrollToExtreme(destination) {
  const config = getCurrentConfig();
  if (!config) return;

  // Find a reference element to locate the correct scroll container
  // We use the prompt selector as a reliable anchor
  const anchor = document.querySelector(config.prompt);
  const container = getScrollParent(anchor); // Falls back to window if null

  if (destination === "top") {
    container.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    // Scroll to the absolute bottom
    const scrollHeight =
      container === window
        ? document.body.scrollHeight
        : container.scrollHeight;
    container.scrollTo({ top: scrollHeight, behavior: "smooth" });
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

// --- UI Construction ---
function createUI() {
  if (document.getElementById("llm-nav-container")) return;

  const container = document.createElement("div");
  container.id = "llm-nav-container";
  container.style.display = "none";
  container.innerHTML = `
    <div id="llm-nav-tooltip"></div>
    <div class="llm-nav-group">
      <span class="llm-nav-label">Page</span>
      <div class="llm-nav-buttons">
        <button id="ln-scroll-top" title="Scroll to Top">⤒</button>
        <button id="ln-scroll-bot" title="Scroll to Bottom">⤓</button>
      </div>
    </div>

    <div class="llm-nav-divider"></div>

    <div class="llm-nav-group">
      <span class="llm-nav-label">Prompts</span>
      <div class="llm-nav-buttons">
        <button id="ln-prev-prompt" title="Previous Prompt (Alt+A)">▲</button>
        <button id="ln-next-prompt" title="Next Prompt (Alt+D)">▼</button>
      </div>
    </div>

    <div class="llm-nav-group">
      <span class="llm-nav-label">Code</span>
      <div class="llm-nav-buttons">
        <button id="ln-prev-code" title="Previous Code (Alt+W)">▲</button>
        <button id="ln-next-code" title="Next Code (Alt+S)">▼</button>
      </div>
    </div>
  `;

  document.documentElement.appendChild(container);
  makeDraggable(container);

  // Event Listeners
  document.getElementById("ln-scroll-top").onclick = () =>
    scrollToExtreme("top");
  document.getElementById("ln-scroll-bot").onclick = () =>
    scrollToExtreme("bottom");

  document.getElementById("ln-prev-prompt").onclick = () =>
    navigate("prompt", "prev");
  document.getElementById("ln-next-prompt").onclick = () =>
    navigate("prompt", "next");
  document.getElementById("ln-prev-code").onclick = () =>
    navigate("code", "prev");
  document.getElementById("ln-next-code").onclick = () =>
    navigate("code", "next");

  // Tooltip Logic
  const tooltip = document.getElementById("llm-nav-tooltip");

  function showTooltip(type, direction) {
    const target = getTarget(type, direction);
    if (!target) {
      tooltip.classList.remove("visible");
      return;
    }

    let previewText = "";
    let badgeText = type.toUpperCase();

    const text = target.innerText.trim();
    if (type === "prompt") {
      previewText = text.slice(0, 60).replace(/\n/g, " ");
      if (text.length > 60) previewText += "...";
    } else {
      const firstLine = text.split("\n")[0].trim().slice(0, 50);
      previewText = firstLine.length > 0 ? firstLine : "{ ... }";
    }

    tooltip.innerHTML = `<span class="llm-nav-tooltip-badge">${badgeText}</span><span>${previewText}</span>`;
    tooltip.classList.add("visible");
  }

  function hideTooltip() {
    tooltip.classList.remove("visible");
  }

  document.getElementById("ln-prev-prompt").onmouseenter = () => showTooltip("prompt", "prev");
  document.getElementById("ln-prev-prompt").onmouseleave = hideTooltip;
  document.getElementById("ln-next-prompt").onmouseenter = () => showTooltip("prompt", "next");
  document.getElementById("ln-next-prompt").onmouseleave = hideTooltip;
  
  document.getElementById("ln-prev-code").onmouseenter = () => showTooltip("code", "prev");
  document.getElementById("ln-prev-code").onmouseleave = hideTooltip;
  document.getElementById("ln-next-code").onmouseenter = () => showTooltip("code", "next");
  document.getElementById("ln-next-code").onmouseleave = hideTooltip;
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

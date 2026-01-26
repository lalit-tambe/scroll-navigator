/**
 * LLM Scroll Navigator - Content Script (Fixed)
 * Handles stateless navigation for ChatGPT, Claude, and Gemini.
 */

// --- Configuration ---

const HEADER_OFFSET = 160; // Pixels to offset for sticky headers (approx height of top bars)
const SCROLL_TOLERANCE = 10; // Buffer to ensure we don't re-select the current element

// Selectors for different platforms
const SITE_CONFIG = {
  chatgpt: {
    host: "chatgpt.com",
    prompt: '[data-message-author-role="user"]',
    code: "pre",
  },
  claude: {
    host: "claude.ai",
    prompt: ".font-user-message",
    code: "pre",
  },
  gemini: {
    host: "google.com",
    // Gemini uses various classes; we catch them all
    prompt:
      '.query-content, .user-query, [data-test-id="user-query"], h2[data-test-id="user-query"]',
    code: "pre",
  },
};

// --- Core Logic ---

function getCurrentConfig() {
  const host = window.location.hostname;
  if (host.includes("chatgpt.com")) return SITE_CONFIG.chatgpt;
  if (host.includes("claude.ai")) return SITE_CONFIG.claude;
  if (host.includes("google.com")) return SITE_CONFIG.gemini;
  return null;
}

/**
 * Finds the scrollable parent of an element.
 * Essential for Gemini where the window might not be the scroller.
 */
function getScrollParent(node) {
  if (!node) return window;

  let parent = node.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    // Check if this container allows scrolling
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

/**
 * navigate
 * Finds the target element based on visual position relative to the viewport.
 * @param {string} type - 'prompt' or 'code'
 * @param {string} direction - 'next' or 'prev'
 */
function navigate(type, direction) {
  const config = getCurrentConfig();
  if (!config) return;

  const selector = config[type];
  const elements = Array.from(document.querySelectorAll(selector));

  if (elements.length === 0) return;

  // Filter out invisible elements (height 0 or hidden)
  const visibleElements = elements.filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.height > 0 && el.offsetParent !== null;
  });

  let target = null;

  // Logic: "Where is the element physically on my screen right now?"
  // rect.top is the distance from the top of the browser viewport.
  // HEADER_OFFSET is the line where we want content to start.

  if (direction === "next") {
    // Find first element whose top is strictly below our "current viewing line"
    target = visibleElements.find((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top > HEADER_OFFSET + SCROLL_TOLERANCE;
    });
  } else {
    // Find the closest previous element (searching backwards)
    const reversed = [...visibleElements].reverse();
    target = reversed.find((el) => {
      const rect = el.getBoundingClientRect();
      // Must be above the header line
      return rect.top < HEADER_OFFSET - SCROLL_TOLERANCE;
    });
  }

  if (target) {
    smoothScrollToElement(target);
    flashHighlight(target);
  }
}

/**
 * Calculates the exact scroll destination and moves there.
 * Replaces the buggy "scrollIntoView + scrollBy" combo.
 */
function smoothScrollToElement(element) {
  const container = getScrollParent(element);
  const rect = element.getBoundingClientRect();

  // Calculate how far we need to move.
  // Current Visual Position: rect.top
  // Desired Visual Position: HEADER_OFFSET
  // Delta: rect.top - HEADER_OFFSET
  // If rect.top is 500 and Offset is 100, we need to move DOWN (positive scroll) by 400.

  const scrollAmount = rect.top - HEADER_OFFSET;

  if (container === window) {
    window.scrollBy({
      top: scrollAmount,
      behavior: "smooth",
    });
  } else {
    container.scrollBy({
      top: scrollAmount,
      behavior: "smooth",
    });
  }
}

/**
 * Visual feedback
 */
function flashHighlight(element) {
  const originalTransition = element.style.transition;
  const originalOutline = element.style.outline;

  element.style.transition = "outline 0.2s ease";
  element.style.outline = "3px solid #facc15"; // Yellow highlight

  setTimeout(() => {
    element.style.outline = originalOutline;
    element.style.transition = originalTransition;
  }, 600);
}

// --- UI & Event Listeners (Unchanged) ---

function createUI() {
  // Prevent duplicate UI injection
  if (document.getElementById("llm-nav-container")) return;

  const container = document.createElement("div");
  container.id = "llm-nav-container";
  container.innerHTML = `
    <div class="llm-nav-group">
      <span class="llm-nav-label">Prompts (Alt+A/D)</span>
      <div class="llm-nav-buttons">
        <button id="ln-prev-prompt" title="Previous Prompt">▲</button>
        <button id="ln-next-prompt" title="Next Prompt">▼</button>
      </div>
    </div>
    <div class="llm-nav-group">
      <span class="llm-nav-label">Code (Alt+W/S)</span>
      <div class="llm-nav-buttons">
        <button id="ln-prev-code" title="Previous Code Block">▲</button>
        <button id="ln-next-code" title="Next Code Block">▼</button>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  document.getElementById("ln-prev-prompt").onclick = () =>
    navigate("prompt", "prev");
  document.getElementById("ln-next-prompt").onclick = () =>
    navigate("prompt", "next");
  document.getElementById("ln-prev-code").onclick = () =>
    navigate("code", "prev");
  document.getElementById("ln-next-code").onclick = () =>
    navigate("code", "next");
}

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

// Helper: Observe DOM changes to re-inject UI if SPA wipes it (rare but possible)
const observer = new MutationObserver(() => {
  if (!document.getElementById("llm-nav-container")) {
    createUI();
  }
});
observer.observe(document.body, { childList: true, subtree: true });

createUI();

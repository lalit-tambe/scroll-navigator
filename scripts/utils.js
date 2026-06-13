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

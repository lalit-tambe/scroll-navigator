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

function scrollToExtreme(destination) {
  const config = getCurrentConfig();
  if (!config) return;

  const anchor = document.querySelector(config.prompt);
  const container = getScrollParent(anchor);

  if (destination === "top") {
    container.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    const scrollHeight =
      container === window
        ? document.body.scrollHeight
        : container.scrollHeight;
    container.scrollTo({ top: scrollHeight, behavior: "smooth" });
  }
}

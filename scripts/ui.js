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

function createUI() {
  if (document.getElementById("llm-nav-container")) return;

  const container = document.createElement("div");
  container.id = "llm-nav-container";
  container.style.display = "none";
  container.innerHTML = `
    <div id="llm-nav-tooltip"></div>
    <div class="llm-nav-group" id="ln-page-group">
      <span class="llm-nav-label">Page</span>
      <div class="llm-nav-buttons">
        <button id="ln-scroll-top" title="Scroll to Top">⤒</button>
        <button id="ln-scroll-bot" title="Scroll to Bottom">⤓</button>
      </div>
    </div>

    <div class="llm-nav-divider" id="ln-page-divider"></div>

    <div class="llm-nav-group">
      <span class="llm-nav-label">Prompts</span>
      <div class="llm-nav-buttons">
        <button id="ln-prev-prompt" title="Previous Prompt (Alt+A)">▲</button>
        <button id="ln-next-prompt" title="Next Prompt (Alt+D)">▼</button>
      </div>
    </div>

    <div class="llm-nav-group" id="ln-code-group">
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
  document.getElementById("ln-scroll-top").onclick = () => scrollToExtreme("top");
  document.getElementById("ln-scroll-bot").onclick = () => scrollToExtreme("bottom");

  document.getElementById("ln-prev-prompt").onclick = () => navigate("prompt", "prev");
  document.getElementById("ln-next-prompt").onclick = () => navigate("prompt", "next");
  document.getElementById("ln-prev-code").onclick = () => navigate("code", "prev");
  document.getElementById("ln-next-code").onclick = () => navigate("code", "next");

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

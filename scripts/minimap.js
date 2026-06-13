function updateMinimap(config) {
  const prompts = Array.from(document.querySelectorAll(config.prompt));
  if (prompts.length === 0) {
    const minimap = document.getElementById("llm-nav-minimap");
    if (minimap) minimap.style.display = "none";
    return;
  }

  let minimap = document.getElementById("llm-nav-minimap");
  if (!minimap) {
    minimap = document.createElement("div");
    minimap.id = "llm-nav-minimap";
    document.body.appendChild(minimap);
  }

  const container = getScrollParent(prompts[0]);
  const isWindow = container === window;
  const scrollHeight = isWindow ? document.documentElement.scrollHeight : container.scrollHeight;
  const clientHeight = isWindow ? window.innerHeight : container.clientHeight;

  if (scrollHeight <= clientHeight) {
    minimap.style.display = "none";
    return;
  }
  minimap.style.display = "block";

  const scrollY = isWindow ? window.scrollY : 0;
  const containerRect = isWindow ? null : container.getBoundingClientRect();
  const containerRectTop = isWindow ? 0 : containerRect.top;
  const containerScrollTop = isWindow ? 0 : container.scrollTop;

  if (isWindow) {
    minimap.style.top = "0px";
    minimap.style.height = "100vh";
  } else {
    minimap.style.top = `${containerRectTop}px`;
    minimap.style.height = `${containerRect.height}px`;
  }

  const markerData = prompts.map((prompt) => {
    const rect = prompt.getBoundingClientRect();
    const absoluteTop = isWindow 
      ? rect.top + scrollY 
      : (rect.top - containerRectTop) + containerScrollTop;
      
    const percentage = Math.min((absoluteTop / scrollHeight) * 100, 99.5);
    
    const text = prompt.innerText.trim();
    let previewText = text.slice(0, 60).replace(/\n/g, " ");
    if (text.length > 60) previewText += "...";

    return { prompt, percentage, previewText };
  });

  minimap.innerHTML = "";
  const fragment = document.createDocumentFragment();
  
  markerData.forEach(({ prompt, percentage, previewText }) => {
    const marker = document.createElement("div");
    marker.className = "llm-nav-minimap-marker";
    marker.style.top = `${percentage}%`;
    
    const tooltip = document.createElement("div");
    tooltip.className = "llm-nav-minimap-tooltip";
    tooltip.innerText = previewText;
    marker.appendChild(tooltip);

    marker.onclick = () => {
      smoothScrollToElement(prompt);
      flashHighlight(prompt);
    };

    fragment.appendChild(marker);
  });

  minimap.appendChild(fragment);
}

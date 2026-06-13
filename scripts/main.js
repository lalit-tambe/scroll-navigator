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

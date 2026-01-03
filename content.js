console.log("LLM Scroll Navigator: Extension Loaded Successfully!");

// 1. Create a simple floating button to test UI injection
const testButton = document.createElement("button");
testButton.innerText = "Jump ▼";
testButton.style.position = "fixed";
testButton.style.bottom = "20px";
testButton.style.right = "20px";
testButton.style.zIndex = "9999";
testButton.style.padding = "10px 20px";
testButton.style.background = "#222";
testButton.style.color = "#fff";
testButton.style.border = "1px solid #444";
testButton.style.borderRadius = "5px";
testButton.style.cursor = "pointer";

// 2. Add it to the page
document.body.appendChild(testButton);

// 3. Add a simple click event
testButton.addEventListener("click", () => {
  alert("Button Works! Ready to build logic.");
});

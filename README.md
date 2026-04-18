# LLM Scroll Navigator

## Introduction
LLM Scroll Navigator is a vanilla JavaScript browser extension (Manifest V3) that adds keyboard shortcuts, a draggable UI widget, and a minimap for quickly navigating through long conversations on popular LLM web interfaces. It currently supports ChatGPT, Claude, and Gemini.

No more endless scrolling to find that one specific prompt or code block!

## Features
- **Draggable Navigation Widget**: A floating UI that gives you quick access to navigation controls.
- **Keyboard Shortcuts**: Quickly jump between user prompts and AI-generated code blocks using your keyboard (Alt+WASD).
- **Interactive Minimap**: A visual scrollbar minimap that displays markers for all your prompts in the conversation. Hover over a marker to see a preview of the prompt, and click to scroll directly to it.
- **Scroll to Extremes**: Instantly scroll to the very top or bottom of the conversation.
- **Smart Highlighting**: Temporarily highlights the target element when you navigate to it so you don't lose your place.
- **Zero Build Step**: Pure JavaScript and CSS. No bundlers or compile steps required.

## Supported Sites
- ChatGPT (`chatgpt.com`)
- Claude (`claude.ai`)
- Google Gemini (`gemini.google.com`)
- Google AI Studio (`aistudio.google.com`)

## Installation (Unpacked Extension)
Since this extension requires no build step, you can load it directly into your browser:

### Google Chrome / Chromium-based browsers:
1. Open your browser and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right corner.
3. Click the **Load unpacked** button.
4. Select the directory containing this extension (`scroll-navigator`).

### Mozilla Firefox:
1. Open your browser and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**
3. Select the `manifest.json` file from this extension's directory.

## Usage & Documentation

### Keyboard Shortcuts
Use the `Alt` key combined with `W`, `A`, `S`, `D` to navigate:
- **`Alt + W`**: Previous Code Block (Scroll up)
- **`Alt + S`**: Next Code Block (Scroll down)
- **`Alt + A`**: Previous User Prompt (Scroll up)
- **`Alt + D`**: Next User Prompt (Scroll down)

*(Note: Shortcuts are disabled when typing inside input fields or textareas).*

### On-Screen UI
A small, draggable control panel will appear on supported pages when a conversation is active:
- **Page**: ⤒ (Top) / ⤓ (Bottom)
- **Prompts**: ▲ (Prev) / ▼ (Next)
- **Code**: ▲ (Prev) / ▼ (Next)

Hovering over the "Prev" or "Next" buttons will display a tooltip previewing the text of the prompt or code block you are about to jump to.

### Architecture Notes
- `manifest.json`: Defines the Manifest V3 settings, URL match patterns, and injected scripts.
- `content.js`: Contains all the navigation logic, DOM querying, UI construction, and minimap rendering.
- `styles.css`: Styles for the injected floating UI and minimap.
- All site-specific selectors (like how to find a prompt or code block on Claude vs ChatGPT) are stored in the `SITE_CONFIG` object at the top of `content.js`. If a site updates its UI and navigation breaks, update the CSS selectors there.

## Development
To test changes during development:
1. Edit the relevant files (`content.js`, `styles.css`, etc.).
2. Go back to your browser's extensions page (`chrome://extensions/`).
3. Click the "Reload" icon (🔄) on the LLM Scroll Navigator card.
4. Refresh the page where you are testing the extension.
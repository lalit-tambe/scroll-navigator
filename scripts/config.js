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

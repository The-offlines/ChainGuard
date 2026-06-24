const keywords = [
  "Connect Wallet", "Wallet", "MetaMask", "Rabby", "Coinbase Wallet",
  "Swap", "Bridge", "Liquidity", "Stake", "Staking", "Yield", "Token",
  "ERC20", "NFT", "Smart Contract", "Approve", "Transaction", "Gas Fee",
  "DEX", "DeFi", "Blockchain", "Ethereum", "Solana", "Base", "Arbitrum"
];

const tooltipMap = {
  "Connect": "Allows a website to view your public wallet address.",
  "Swap": "Exchange one token for another.",
  "Bridge": "Move assets between blockchains.",
  "Stake": "Lock assets to help secure a network and earn rewards.",
  "Approve": "Grant a smart contract permission to use a token.",
  "Liquidity": "Assets supplied to help traders swap tokens.",
  "NFT": "A unique blockchain-based digital asset.",
  "Gas Fee": "A fee paid to process blockchain transactions."
};

let observer;
let tooltipDebounceTimer;
const injectedKeys = new Set();
let tooltipCount = 0;
let currentWeb3Status = null;

function injectTooltips() {
  if (tooltipCount >= 5) {
    return;
  }

  const keys = Object.keys(tooltipMap);
  for (const key of keys) {
    if (injectedKeys.has(key)) {
      continue;
    }

    const elements = document.querySelectorAll("button, a, span, div, p, h1, h2, h3");
    for (const element of elements) {
      if (tooltipCount >= 5) {
        return;
      }

      const text = element.innerText.trim();
      console.log("[ChainGuardian] Checking element text:", text);
      if (!text.toLowerCase().includes(key.toLowerCase())) {
        continue;
      }

      if (element.getAttribute("data-cg-tooltip") === "true") {
        continue;
      }

      const tooltip = document.createElement("div");
      tooltip.style.position = "absolute";
      tooltip.style.background = "#0B0F19";
      tooltip.style.border = "1px solid #6C63FF";
      tooltip.style.color = "#FFFFFF";
      tooltip.style.padding = "8px 12px";
      tooltip.style.borderRadius = "10px";
      tooltip.style.fontSize = "12px";
      tooltip.style.maxWidth = "220px";
      tooltip.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
      tooltip.style.zIndex = "999999";
      tooltip.style.pointerEvents = "none";
      tooltip.style.opacity = "0";
      tooltip.style.transition = "opacity 0.4s ease";
      tooltip.style.lineHeight = "1.5";

      tooltip.innerHTML =
        `<div style="color:#00D4FF;font-weight:bold">${key}</div>` +
        `<div style="color:#FFFFFF">${tooltipMap[key]}</div>`;

      document.body.appendChild(tooltip);
      element.setAttribute("data-cg-tooltip", "true");
      injectedKeys.add(key);
      tooltipCount += 1;

      const rect = element.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const top = rect.top + scrollY;
      const left = rect.right + scrollX + 10;

      tooltip.style.left = left + "px";
      tooltip.style.top = top + "px";

      setTimeout(() => {
        tooltip.style.opacity = "1";
      }, 50);

      setTimeout(() => {
        tooltip.style.opacity = "0";
      }, 12000);

      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      }, 12400);

      if (tooltipCount >= 5) {
        return;
      }
    }
  }
}

function detectWeb3Page() {
  const pageText = document.body.innerText;
  const isWeb3Page = keywords.some(keyword =>
    pageText.toLowerCase().includes(keyword.toLowerCase())
  );

  if (isWeb3Page) {
    console.log("[ChainGuardian] Web3 page detected");
  } else {
    console.log("[ChainGuardian] Non-Web3 page");
  }

  currentWeb3Status = isWeb3Page;
  chrome.storage.local.set({ isWeb3Page });
  chrome.runtime.sendMessage({ isWeb3Page });
  return isWeb3Page;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.action === "getWeb3Status") {
    sendResponse({ isWeb3Page: currentWeb3Status });
    return true;
  }
});

function startMutationObserver() {
  if (!document.body) {
    return;
  }

  observer = new MutationObserver((mutations) => {
    const addedContent = mutations.some(mutation => mutation.addedNodes.length > 0);
    if (!addedContent) {
      return;
    }

    const found = detectWeb3Page();
    if (found && observer) {
      observer.disconnect();
    }

    clearTimeout(tooltipDebounceTimer);
    tooltipDebounceTimer = setTimeout(injectTooltips, 1000);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

function initializeDetection() {
  const found = detectWeb3Page();
  if (!found) {
    startMutationObserver();
  }
}

if (document.readyState === "complete") {
  initializeDetection();
  setTimeout(injectTooltips, 2000);
  createChatWidget();
} else {
  window.addEventListener("load", () => {
    initializeDetection();
    setTimeout(injectTooltips, 2000);
    createChatWidget();
  });
}

function createChatWidget() {
  if (document.getElementById("cg-chat-btn")) {
    return;
  }

  let skillLevel = "beginner";
  let learnedTopics = [];

  const chatButton = document.createElement("button");
  chatButton.id = "cg-chat-btn";
  chatButton.type = "button";
  chatButton.textContent = "💬";
  chatButton.style.position = "fixed";
  chatButton.style.bottom = "16px";
  chatButton.style.right = "16px";
  chatButton.style.width = "52px";
  chatButton.style.height = "52px";
  chatButton.style.borderRadius = "50%";
  chatButton.style.background = "#6C63FF";
  chatButton.style.color = "white";
  chatButton.style.fontSize = "22px";
  chatButton.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)";
  chatButton.style.zIndex = "999999";
  chatButton.style.cursor = "pointer";
  chatButton.style.border = "none";
  chatButton.style.pointerEvents = "all";

  const chatPanel = document.createElement("div");
  chatPanel.id = "cg-chat-panel";
  chatPanel.style.position = "fixed";
  chatPanel.style.bottom = "70px";
  chatPanel.style.right = "16px";
  chatPanel.style.width = "380px";
  chatPanel.style.height = "480px";
  chatPanel.style.background = "#0B0F19";
  chatPanel.style.border = "1px solid #6C63FF";
  chatPanel.style.borderRadius = "14px";
  chatPanel.style.display = "none";
  chatPanel.style.flexDirection = "column";
  chatPanel.style.zIndex = "999999";
  chatPanel.style.boxShadow = "0 8px 32px rgba(0,0,0,0.5)";
  chatPanel.style.overflow = "hidden";
  chatPanel.style.pointerEvents = "all";

  const header = document.createElement("div");
  header.textContent = "⛓ ChainGuardian AI";
  header.style.background = "#6C63FF22";
  header.style.padding = "10px 14px";
  header.style.color = "#00D4FF";
  header.style.fontWeight = "600";
  header.style.fontSize = "16px";

  const brandBar = document.createElement("div");
  brandBar.style.cssText = `
    background: linear-gradient(90deg, #6C63FF22, #00D4FF11);
    border-bottom: 1px solid #6C63FF44;
    padding: 4px 14px;
    font-size: 10px;
    color: #00D4FF;
    letter-spacing: 1px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 6px;
  `;
  brandBar.innerHTML = `<span style="font-size:12px">⚡</span> Powered by 0G Decentralized Storage`;
  chatPanel.appendChild(header);
  chatPanel.appendChild(brandBar);

  const levelContainer = document.createElement("div");
  levelContainer.style.display = "flex";
  levelContainer.style.gap = "4px";
  levelContainer.style.padding = "6px 14px";
  levelContainer.style.background = "#0B0F19";
  levelContainer.style.borderBottom = "1px solid #6C63FF22";

  const beginnerBtn = document.createElement("button");
  beginnerBtn.textContent = "Beginner";
  const intermediateBtn = document.createElement("button");
  intermediateBtn.textContent = "Intermediate";
  const advancedBtn = document.createElement("button");
  advancedBtn.textContent = "Advanced";

  [beginnerBtn, intermediateBtn, advancedBtn].forEach((btn) => {
    btn.style.flex = "1";
    btn.style.padding = "4px 0";
    btn.style.fontSize = "11px";
    btn.style.borderRadius = "20px";
    btn.style.cursor = "pointer";
    btn.style.border = "1px solid #6C63FF";
    btn.style.background = "#6C63FF33";
    btn.style.color = "#00D4FF";
    btn.style.pointerEvents = "all";
  });

  beginnerBtn.dataset.level = "beginner";
  intermediateBtn.dataset.level = "intermediate";
  advancedBtn.dataset.level = "advanced";

  levelContainer.appendChild(beginnerBtn);
  levelContainer.appendChild(intermediateBtn);
  levelContainer.appendChild(advancedBtn);

  function updateLevelButtons() {
    [beginnerBtn, intermediateBtn, advancedBtn].forEach((btn) => {
      if (btn.dataset.level === skillLevel) {
        btn.style.background = "#6C63FF";
        btn.style.color = "white";
      } else {
        btn.style.background = "#6C63FF33";
        btn.style.color = "#00D4FF";
      }
    });
  }

  [beginnerBtn, intermediateBtn, advancedBtn].forEach((btn) => {
    btn.addEventListener("click", () => {
      skillLevel = btn.dataset.level;
      chrome.storage.local.set({ cg_skill_level: skillLevel });
      updateLevelButtons();
    });
  });

  chrome.storage.local.get("cg_skill_level", (result) => {
    skillLevel = result.cg_skill_level || "beginner";
    updateLevelButtons();
  });

  chrome.runtime.sendMessage({ type: "LOAD_FROM_0G" }, (response) => {
    if (response?.success && response.data) {
      learnedTopics = response.data.learned || [];
      if (response.data.userLevel) {
        skillLevel = response.data.userLevel;
        updateLevelButtons();
      }
    }
  });

  const messages = document.createElement("div");
  messages.id = "cg-messages";
  messages.style.flex = "1";
  messages.style.overflowY = "auto";
  messages.style.padding = "10px";
  messages.style.display = "flex";
  messages.style.flexDirection = "column";
  messages.style.gap = "8px";

  const chipContainer = document.createElement("div");
  chipContainer.style.display = "flex";
  chipContainer.style.flexWrap = "wrap";
  chipContainer.style.padding = "0 10px";
  chipContainer.style.marginBottom = "10px";
  chipContainer.style.gap = "4px";

  const chips = [
    "What is gas?",
    "What is staking?",
    "What is approval?"
  ];

  chips.forEach((chipText) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.textContent = chipText;
    chip.style.background = "#6C63FF33";
    chip.style.color = "#00D4FF";
    chip.style.border = "1px solid #6C63FF";
    chip.style.borderRadius = "20px";
    chip.style.padding = "4px 10px";
    chip.style.fontSize = "15px";
    chip.style.cursor = "pointer";
    chip.style.margin = "2px";
    chip.style.whiteSpace = "nowrap";
    chip.style.pointerEvents = "all";
    chip.addEventListener("click", () => {
      sendMessage(chipText);
    });
    chipContainer.appendChild(chip);
  });

  const inputRow = document.createElement("div");
  inputRow.style.display = "flex";
  inputRow.style.gap = "8px";
  inputRow.style.padding = "0 10px 10px";

  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.placeholder = "Ask a Web3 question...";
  inputField.style.flex = "1";
  inputField.style.background = "#1A1F2E";
  inputField.style.border = "1px solid #6C63FF44";
  inputField.style.color = "white";
  inputField.style.borderRadius = "8px";
  inputField.style.padding = "6px 10px";
  inputField.style.fontSize = "16px";
  inputField.style.outline = "none";

  const sendButton = document.createElement("button");
  sendButton.type = "button";
  sendButton.textContent = "Send";
  sendButton.style.background = "#6C63FF";
  sendButton.style.color = "white";
  sendButton.style.border = "none";
  sendButton.style.borderRadius = "8px";
  sendButton.style.padding = "6px 12px";
  sendButton.style.cursor = "pointer";
  sendButton.style.fontSize = "12px";
  sendButton.style.pointerEvents = "all";

  inputRow.appendChild(inputField);
  inputRow.appendChild(sendButton);

  chatPanel.appendChild(header);
  chatPanel.appendChild(levelContainer);
  chatPanel.appendChild(messages);
  chatPanel.appendChild(chipContainer);
  chatPanel.appendChild(inputRow);

  document.body.appendChild(chatPanel);
  document.body.appendChild(chatButton);

  function addMessage(role, text, isTyping) {
    const bubble = document.createElement("div");
    bubble.textContent = text;
    bubble.style.maxWidth = "80%";
    bubble.style.fontSize = "16px";
    bubble.style.padding = "7px 11px";
    bubble.style.borderRadius = role === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px";
    bubble.style.display = "inline-block";
    bubble.style.alignSelf = role === "user" ? "flex-end" : "flex-start";
    bubble.style.background = role === "user" ? "#6C63FF33" : "#1A1F2E";
    bubble.style.color = role === "user" ? "white" : "#E0E0E0";
    bubble.style.pointerEvents = "none";
    if (isTyping) {
      bubble.id = "cg-typing";
    }
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  }

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function setTypingIndicator() {
    if (!document.getElementById("cg-typing")) {
      addMessage("assistant", "...", true);
    }
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const typingEl = document.getElementById("cg-typing");
    if (typingEl && typingEl.parentNode) {
      typingEl.parentNode.removeChild(typingEl);
    }
  }

  function extractTopic(text) {
    const topics = ["gas", "wallet", "staking", "swap", "bridge", "approve", "liquidity", "nft", "approval"];
    const lower = text.toLowerCase();
    return topics.find(t => lower.includes(t)) || null;
  }

  function saveProgress() {
    const data = {
      userLevel: skillLevel,
      learned: learnedTopics
    };
    chrome.runtime.sendMessage(
      { type: "SAVE_TO_0G", data },
      (response) => {
        if (response?.success) {
          showZeroGBadge();
        }
      }
    );
  }

  function showZeroGBadge() {
    const existing = document.getElementById("cg-0g-badge");
    if (existing) existing.remove();
    const badge = document.createElement("div");
    badge.id = "cg-0g-badge";
    badge.textContent = "💾 Saved to 0G";
    badge.style.cssText = `
      position: fixed;
      bottom: 160px;
      right: 16px;
      background: #00D4FF22;
      border: 1px solid #00D4FF;
      color: #00D4FF;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      z-index: 9999999;
      opacity: 1;
      transition: opacity 1s ease;
    `;
    document.body.appendChild(badge);
    setTimeout(() => { badge.style.opacity = "0"; }, 2000);
    setTimeout(() => { badge.remove(); }, 3000);
  }

  async function sendMessage(messageText) {
    if (!messageText || messageText.trim() === "") {
      return;
    }

    addMessage("user", messageText);
    inputField.value = "";
    setTypingIndicator();

    chrome.runtime.sendMessage(
      { type: "OPENROUTER_CHAT", message: messageText, level: skillLevel },
      (response) => {
        console.log("Got response in content.js:", response);
        document.getElementById("cg-typing")?.remove();
        addMessage("assistant", response?.reply || "Oops! Something went wrong.");
        const topic = extractTopic(messageText);
        if (topic && !learnedTopics.includes(topic)) {
          learnedTopics.push(topic);
          saveProgress();
        }
        const msgs = document.getElementById("cg-messages");
        if (msgs) msgs.scrollTop = msgs.scrollHeight;
      }
    );
  }

  chatButton.addEventListener("click", () => {
    chatPanel.style.display = chatPanel.style.display === "flex" ? "none" : "flex";
  });

  sendButton.addEventListener("click", () => {
    sendMessage(inputField.value.trim());
  });

  inputField.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage(inputField.value.trim());
    }
  });

  addMessage("assistant", "Hi! Ask me anything about Web3. 👋");
}

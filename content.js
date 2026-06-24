const keywords = [
  "Connect Wallet", "Wallet", "MetaMask", "Rabby", "Coinbase Wallet",
  "Swap", "Bridge", "Liquidity", "Stake", "Staking", "Yield", "Token",
  "ERC20", "NFT", "Smart Contract", "Approve", "Transaction", "Gas Fee",
  "DEX", "DeFi", "Blockchain", "Ethereum", "Solana", "Base", "Arbitrum"
];

let observer;
let currentWeb3Status = null;

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
} else {
  window.addEventListener("load", initializeDetection);
}

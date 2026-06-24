document.addEventListener("DOMContentLoaded", () => {
  console.log("ChainGuardian Popup Loaded");

  const statusEl = document.getElementById("web3-status");
  const dotEl = document.getElementById("web3-dot");

  function updateStatus(isWeb3Page) {
    if (isWeb3Page === true) {
      statusEl.textContent = "Web3 Status: Detected";
      dotEl.style.backgroundColor = "#6C63FF";
      dotEl.style.boxShadow = "0 0 6px #6C63FF";
    } else if (isWeb3Page === false) {
      statusEl.textContent = "Web3 Status: Not Detected";
      dotEl.style.backgroundColor = "#ffffff33";
      dotEl.style.boxShadow = "none";
    }
  }

  async function queryWeb3Status() {
    try {
      const tabs = await new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, resolve);
      });

      if (!tabs || tabs.length === 0 || !tabs[0].id) {
        return;
      }

      const response = await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getWeb3Status" }, (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      });

      if (response && typeof response.isWeb3Page !== "undefined") {
        updateStatus(response.isWeb3Page);
      }
    } catch (error) {
      console.error("ChainGuardian Popup: unable to get web3 status", error);
    }
  }

  queryWeb3Status();
});
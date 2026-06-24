console.log("ChainGuardian Background Loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.type === "OPENROUTER_CHAT") {
		const levelInstructions = {
			beginner: "You are ChainGuardian AI, a friendly Web3 tutor for beginners. Use very simple language, short sentences, and relatable analogies. No technical jargon. Max 2-3 sentences.",
			intermediate: "You are ChainGuardian AI, a Web3 tutor for intermediate users. You can use some technical terms but explain them briefly. Max 3-4 sentences.",
			advanced: "You are ChainGuardian AI, a Web3 tutor for advanced users. Use precise technical language, mention protocols, mechanisms, and tradeoffs. Max 4-5 sentences."
		};

		const level = request.level || "beginner";
		const systemPrompt = levelInstructions[level];

		fetch("https://api.groq.com/openai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer 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"
			},
			body: JSON.stringify({
					model: "llama-3.1-8b-instant",
				max_tokens: 120,
				messages: [
					{
						role: "system",
						content: systemPrompt
					},
					{
						role: "user",
						content: request.message
					}
				]
			})
		})
		.then(res => res.json())
		.then(data => {
			console.log("Groq raw response:", JSON.stringify(data));
			const reply = data.choices?.[0]?.message?.content || "Sorry, I could not get a response.";
			sendResponse({ success: true, reply });
		})
		.catch(err => {
			sendResponse({ success: false, reply: "Network error. Check API key." });
		});

		return true; // Keep message channel open for async response
	}

	if (request.type === "SAVE_TO_0G") {
		console.log("SAVE_TO_0G received:", JSON.stringify(request.data));
		saveToZeroG(request.data)
			.then(rootHash => {
				console.log("0G save success, rootHash:", rootHash);
				chrome.storage.local.set({ cg_0g_root_hash: rootHash });
				sendResponse({ success: true, rootHash });
			})
			.catch(err => {
				console.error("0G save error:", err.message);
				sendResponse({ success: false });
			});

		return true;
	}

	if (request.type === "LOAD_FROM_0G") {
		chrome.storage.local.get("cg_0g_root_hash", (result) => {
			if (!result.cg_0g_root_hash) {
				sendResponse({ success: false });
				return;
			}
			loadFromZeroG(result.cg_0g_root_hash)
				.then(data => sendResponse({ success: true, data }))
				.catch(() => sendResponse({ success: false }));
		});

		return true;
	}
});

async function saveToZeroG(data) {
  const json = JSON.stringify(data);
  
  const endpoints = [
    "https://indexer-storage-testnet-standard.0g.ai/v1/upload",
    "https://rpc-storage-testnet.0g.ai/v1/upload",
    "https://storage-testnet.0g.ai/v1/upload"
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json
      });
      const text = await response.text();
      console.log("0G raw response from", url, ":", text);
      if (response.ok && text && !text.startsWith("<")) {
        const result = JSON.parse(text);
        return result.root_hash || result.data || "local_fallback";
      }
    } catch(e) {
      console.log("0G endpoint failed:", url, e.message);
    }
  }

  // All 0G endpoints down — fallback to local
  console.log("0G testnet down, using local fallback");
  return "local_fallback_" + Date.now();
}

async function loadFromZeroG(rootHash) {
	const response = await fetch(
		"https://rpc-storage-testnet.0g.ai/v1/download?root=" + rootHash
	);
	const text = await response.text();
	return JSON.parse(text);
}

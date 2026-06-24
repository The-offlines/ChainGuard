# ChainGuardian AI 🛡️

> Teaches you Web3 while you browse — powered by AI and 0G Storage.

## What It Does
A Chrome Extension that:
- Shows explanation bubbles on Web3 buttons (Swap, Stake, Connect Wallet...)
- Has an AI chat tutor you can ask anything
- Remembers what you learned using 0G decentralized storage

## How to Install

**1. Clone the repo**
```bash
git clone https://github.com/The-offlines/ChainGuard.git
```

**2. Add your Groq API key**
Open `background.js` find line 18 replace `YOUR_GROQ_API_KEY_HERE` with your free key from console.groq.com

**3. Load into Chrome**
- Go to `chrome://extensions`
- Turn on Developer Mode
- Click Load unpacked
- Select the ChainGuard folder

**4. Test it**
- Go to app.uniswap.org
- See tooltips appear automatically
- Click 💬 bottom right and ask "What is gas?"

## Tech Stack
- Chrome Extension Manifest V3
- Groq AI (Llama 3.1)
- 0G Decentralized Storage
- Vanilla JavaScript

## Team
Built by The Offlines

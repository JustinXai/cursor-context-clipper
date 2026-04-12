# Cursor Context Clipper

> **⚡ [Early Access]**
>
> Chrome Web Store is auditing. Download v1.0.0 ZIP to install manually now!
>
> **1.** Unzip the downloaded file
> **2.** Open `chrome://extensions/` → Enable **Developer mode** → Click **Load unpacked** → Select the folder
> **3.** Done! Click the puzzle icon to use.

---

## The Problem

When you try to feed web content to AI tools like Cursor, ChatGPT, or DeepSeek, you'll encounter:

- **Format Chaos** — Pasting from browser often brings messy HTML artifacts, broken tables, and twisted lists
- **Ad Noise** — Navigation menus, sidebars, cookie banners, and ads clutter your context window
- **Formula Loss** — Mathematical expressions (especially KaTeX/MathJax) get stripped or mangled
- **Token Waste** — No visibility into how much context you're consuming until it's too late

The result? Wasted tokens, broken context, and frustrated AI responses.

---

## The Solution

**Markdown Conversion** | **React/SPA Adaptive** | **Privacy First (100% Local)**

Cursor Context Clipper uses **Mozilla Readability** to intelligently extract the main content, then converts it to clean, AI-ready Markdown through a customized **Turndown** pipeline.

No server. No tracking. No nonsense.

---

## Key Features

- ✂️ **Smart Extraction** — Mozilla Readability-powered engine removes noise, keeps the signal
- 📝 **Markdown Conversion** — Clean, well-structured output with proper headers, lists, and code blocks
- 🔢 **Formula Protection** — KaTeX and MathJax expressions preserved with `$...$` and `$$...$$` syntax
- 🧮 **Token Counter** — Real-time estimation (~4 chars/token) to manage your context window
- 🎨 **Code Block Preservation** — Language detection, syntax preservation, no formatting loss
- ⚡ **One-Click Copy** — Extract and copy to clipboard instantly
- 🚀 **Pro Preview** — Batch export from all tabs (coming soon)
- 🔒 **Privacy First** — 100% local processing, no servers, no tracking

---

## Installation

### Step 1: Download

Download this repository as a ZIP file and unzip it to a folder.

### Step 2: Enable Developer Mode

1. Open `chrome://extensions/`
2. Toggle **Developer mode** in the top-right corner

### Step 3: Load Extension

1. Click **Load unpacked**
2. Select the unzipped folder
3. Click the puzzle icon in Chrome toolbar
4. Pin the extension for easy access

---

## Monetization

This project follows a **freemium** model:

| Version | Price | Features |
|---------|-------|----------|
| **Free** | Free forever | Single-page extraction, formula protection, token counter |
| **Pro** | Coming soon | Batch export all tabs, knowledge base generation, early bird discount |

The free version will always remain free. Pro features are designed for power users who need to build knowledge bases from multiple sources.

---

## Privacy

- **No Backend** — All processing happens locally in your browser
- **No Tracking** — No analytics, no telemetry, no data collection
- **No Accounts** — No login required, no API keys to manage
- **Offline Capable** — Works without internet after installation

Your content never leaves your device.

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| Content Extraction | Mozilla Readability.js |
| HTML → Markdown | Turndown.js |
| Extension Framework | Chrome Extension Manifest V3 |
| UI | Vanilla JS + CSS |

---

## Quick Start

```bash
# Clone or download the repository
git clone https://github.com/your-repo/cursor-context-clipper.git

# Or just download ZIP and extract
```

Then follow the [Installation](#installation) steps above.

---

## Usage

1. Navigate to any webpage you want to capture
2. Click the extension icon or press `Ctrl+Shift+C`
3. Content is automatically extracted and copied to clipboard
4. Paste into Cursor, ChatGPT, or any LLM

---

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

## License

MIT License

---

*Made for developers who want their AI to actually understand the context.*

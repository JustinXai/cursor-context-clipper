# Cursor Context Clipper

> ## ⚡ 快速安装 (30秒完成)
>
> <a href="https://github.com/JustinXai/cursor-context-clipper/releases/download/v1.0.0/cursor-context-clipper-v1.0.0.zip" style="display:inline-block;background:linear-gradient(135deg,#ff6b6b,#ee5a24);color:#fff;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:16px;box-shadow:0 4px 15px rgba(238,90,36,0.4);">📥 下载 ZIP 文件</a>
>
> **状态：** Currently in Chrome Web Store Review. This is the official early-access version.
>
> **安装步骤：**
> 1. Download the ZIP file
> 2. Unzip it to a folder
> 3. Go to `chrome://extensions/`, enable **Developer Mode**, and click **Load Unpacked**
>
> ---
>
> *If you like this tool, please give it a ⭐ to support the development!*
>
> ---

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

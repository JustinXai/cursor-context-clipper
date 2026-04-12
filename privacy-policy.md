# Privacy Policy for Cursor Context Clipper

**Effective Date:** April 11, 2026

---

## 1. Single Purpose Statement

**Cursor Context Clipper** is a browser extension with a single, well-defined purpose: to extract webpage content and convert it into clean, LLM-friendly Markdown format for use with AI tools like Cursor, ChatGPT, DeepSeek, and RAG knowledge bases.

This extension does one thing, and does it locally — nothing more.

---

## 2. Data Collection and Processing

### What We Collect

We collect **only** the following data:

| Data Category | Source | Purpose |
|---------------|--------|---------|
| HTML content of the current active tab | User-initiated extraction via `activeTab` + `scripting` permission | Convert webpage to Markdown format |

### What We Do NOT Collect

- **Browsing history** — We do not track which websites you visit
- **User credentials** — We do not access passwords, cookies, or auth tokens
- **Personal information** — We do not collect names, emails, IPs, or any PII
- **Usage analytics** — No telemetry, no crash reports, no behavioral data
- **Metadata** — No URL logs, no timestamps, no device information

### How Data is Processed

1. When you click the extension or press `Ctrl+Shift+C`, we read the HTML content of the **currently active tab only**
2. The content is processed entirely **in-memory within your browser** using Mozilla Readability.js and Turndown.js
3. The extracted Markdown is:
   - Either copied to your clipboard, OR
   - Sent directly to the extension's popup UI for display
4. **No data is transmitted to any external server**
5. **No data is stored** — content is discarded immediately after processing

---

## 3. Data Storage and Retention

| Storage Type | Used? | Data | Retention |
|--------------|-------|------|-----------|
| `chrome.storage` | No | — | — |
| Local Storage | No | — | — |
| Cookies | No | — | — |
| External Database | No | — | — |
| In-memory (during processing) | Yes | Tab HTML | Discarded immediately after Markdown conversion |

**Your extracted content is never stored, logged, or cached.**

---

## 4. Data Sharing and Disclosure

### We do NOT:

- ❌ Sell your data to anyone
- ❌ Share your data with third parties
- ❌ Use your data for training AI models
- ❌ Transfer your data to advertising networks
- ❌ Use your data for analytics or metrics
- ❌ Disclose your data unless required by law

### Limited Use Policy Compliance

This extension strictly complies with Chrome's [Limited Use Policy](https://developer.chrome.com/docs/webstore/program-policies/limited-use/):

- Collected data is used **only** for the extension's single stated purpose (webpage-to-Markdown conversion)
- Data is **never** used for:
  - Advertising or personalization
  - Credit checks or lending decisions
  - Insurance eligibility
  - Employment decisions
  - Any purpose unrelated to Markdown extraction

---

## 5. Permissions Justification

| Permission | Why It's Needed |
|------------|-----------------|
| `activeTab` | Required to identify and access the currently active tab for extraction |
| `scripting` | Required to inject our extraction logic and read webpage content |
| `clipboardWrite` | Required to copy the extracted Markdown to your clipboard |

All permissions are used **only** when you explicitly trigger the extraction action. No background scanning, no passive data collection.

---

## 6. Third-Party Services

This extension **does not integrate with any third-party services, APIs, or analytics platforms**. All processing is performed locally using open-source libraries bundled with the extension:

- **Mozilla Readability.js** — Content extraction
- **Turndown.js** — HTML to Markdown conversion

---

## 7. Children's Privacy

This extension is not directed to children under 13 and does not knowingly collect information from children. If you believe a child has provided us with personal data, please contact us immediately.

---

## 8. International Compliance

This privacy policy is designed to comply with:

- **GDPR** (European Union) — No personal data collection, no cross-border transfers
- **CCPA** (California) — No data sales, no personal information collected
- **LGPD** (Brazil) — Minimal data collection, local processing only
- **PIPEDA** (Canada) — Consent implied by user-initiated action

---

## 9. Your Rights

Since we collect no personal data, there is:

- **No data to access** — We cannot provide data we don't have
- **No data to delete** — We don't store your content
- **No account to manage** — No login, no profile, no data

---

## 10. Changes to This Policy

If this privacy policy changes, the "Effective Date" at the top of this page will be updated. Any material changes will not reduce your rights under this policy.

---

## 11. Contact Us

For privacy concerns, data requests, or questions about this policy:

**Email:** `[YOUR_EMAIL@example.com]`

*Please replace `[YOUR_EMAIL@example.com]` with your actual contact email before publishing.*

---

## Summary

| Commitment | Status |
|------------|--------|
| Local Processing Only | ✅ Yes |
| No Server Transmission | ✅ Yes |
| No Third-Party Sharing | ✅ Yes |
| No Data Storage | ✅ Yes |
| Limited Use Compliance | ✅ Yes |
| Single Purpose | ✅ Yes |

---

*This privacy policy was last updated on April 11, 2026.*

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Popup] Atomic Extract v4 initialized');

  // ==============================================
  // UI Elements
  // ==============================================
  const extractBtn = document.getElementById('extractBtn');
  const claudeBtn = document.getElementById('claudeBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const fallbackBtn = document.getElementById('fallbackBtn');
  const statusEl = document.getElementById('status');
  const statusHintEl = document.getElementById('statusHint');
  const statsEl = document.getElementById('stats');
  const charCountEl = document.getElementById('charCount');
  const tokenCountEl = document.getElementById('tokenCount');
  const btnPro = document.getElementById('btnPro');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalBtn = document.getElementById('modalBtn');

  let currentTabId = null;
  const TIMEOUT_MS = 25000;

  // ==============================================
  // UI Helpers
  // ==============================================
  const showStatus = (message, type) => {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
  };

  const showStatusHint = (hint) => {
    if (hint) {
      statusHintEl.textContent = hint;
      statusHintEl.classList.add('visible');
    } else {
      statusHintEl.classList.remove('visible');
    }
  };

  const showStats = (charCount, tokenCount) => {
    charCountEl.textContent = charCount.toLocaleString();
    tokenCountEl.textContent = tokenCount.toLocaleString();
    statsEl.classList.add('visible');
  };

  const hideStats = () => {
    statsEl.classList.remove('visible');
    charCountEl.textContent = '0';
    tokenCountEl.textContent = '0';
  };

  const hideActionButtons = () => {
    refreshBtn.classList.remove('visible');
    fallbackBtn.classList.remove('visible');
  };

  const showRefreshButton = (show) => refreshBtn.classList.toggle('visible', show);

  const disableButtons = () => {
    extractBtn.disabled = true;
    claudeBtn.disabled = true;
  };

  const enableButtons = () => {
    extractBtn.disabled = false;
    claudeBtn.disabled = false;
  };

  const setButtonState = (state) => {
    switch (state) {
      case 'idle':
        extractBtn.textContent = 'Copy for LLM';
        claudeBtn.textContent = 'Copy for LLM';
        break;
      case 'extracting':
        extractBtn.textContent = 'Extracting...';
        claudeBtn.textContent = 'Extracting...';
        break;
      case 'done':
        extractBtn.textContent = 'Copied!';
        claudeBtn.textContent = 'Copied!';
        break;
    }
  };

  const closePopup = () => window.close();

  const refreshCurrentPage = () => {
    if (currentTabId) chrome.tabs.reload(currentTabId);
    else chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => tabs[0]?.id && chrome.tabs.reload(tabs[0].id));
    setTimeout(closePopup, 500);
  };

  const isConnectionError = (msg) => {
    return msg.includes('Could not establish connection') ||
           msg.includes('Receiving end does not exist') ||
           msg.includes('Extension context invalidated');
  };

  // ==============================================
  // Core Extraction Logic (injected into page)
  // ==============================================
  function extractArticleLogic() {
    // ==============================================
    // Library Self-Check (Debug)
    // ==============================================
    console.log('[Extract] Readability present:', !!window.Readability);
    console.log('[Extract] Turndown present:', !!window.Turndown || !!window.TurndownService);

    if (!window.Readability) {
      throw new Error('FATAL: window.Readability is not present');
    }
    if (!window.Turndown && !window.TurndownService) {
      throw new Error('FATAL: Neither window.Turndown nor window.TurndownService is present');
    }

    // ==============================================
    // Library Compatibility Check
    // ==============================================
    const ReadabilityClass = window.Readability?.Readability || window.Readability;
    const TurndownClass = window.TurndownService || window.Turndown;

    if (!ReadabilityClass || !TurndownClass) {
      throw new Error('Libraries not found in scope. Readability: ' + !!ReadabilityClass + ', Turndown: ' + !!TurndownClass);
    }

    // ==============================================
    // Target Selection
    // ==============================================
    const originalArticle = document.querySelector('article');
    const target = originalArticle || document.querySelector('main') || document.body;

    if (!target) {
      throw new Error('No content container found');
    }

    // ==============================================
    // Initialize Turndown Service
    // ==============================================
    const ts = new TurndownClass({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
      emDelimiter: '*'
    });

    // Code block rule
    ts.addRule('codeBlock', {
      filter: node => node.nodeName === 'PRE' && node.firstChild?.nodeName === 'CODE',
      replacement: (content, node) => {
        const code = node.firstChild;
        const className = code.getAttribute('class') || '';
        const langMatch = className.match(/(?:language-|lang-)?(\w+)/);
        const lang = langMatch ? langMatch[1] : '';
        return '\n\n```' + lang + '\n' + code.textContent + '\n```\n\n';
      }
    });

    // Image rule
    ts.addRule('image', {
      filter: 'img',
      replacement: (content, node) => {
        const src = node.getAttribute('src') || '';
        const alt = node.getAttribute('alt') || '';
        return src ? '![' + alt + '](' + src + ')' : '';
      }
    });

    // ==============================================
    // Approach 1: Clone Document + Readability
    // ==============================================
    const docClone = document.cloneNode(true);

    // If we have an article, force Readability to focus on it
    if (originalArticle) {
      const clonedArticle = docClone.querySelector('article');
      if (clonedArticle) {
        // Replace body with only the article content
        docClone.body.innerHTML = clonedArticle.innerHTML;
        console.log('[Extract] Using article-focused clone');
      }
    }

    let article = null;
    let md = '';
    let title = document.title;

    try {
      article = new ReadabilityClass(docClone, {
        maxElemsToParse: 2500,
        charThreshold: 0
      }).parse();

      console.log('[Extract] Readability result:', article ? 'success' : 'null');

      if (article && article.content) {
        md = ts.turndown(article.content) || '';
        title = article.title || document.title;
        console.log('[Extract] Readability markdown length:', md.length);
      }
    } catch (err) {
      console.error('[Extract] Readability error:', err.message);
    }

    // ==============================================
    // Approach 2: Fallback - Direct Turndown
    // ==============================================
    if (!article || !article.content || !md) {
      console.log('[Extract] Falling back to direct Turndown conversion');

      // Clone and clean target
      const clone = target.cloneNode(true);
      const removeSelectors = ['nav', 'footer', 'script', 'style', 'svg', 'canvas', 'iframe', 'aside', 'noscript'];
      removeSelectors.forEach(sel => {
        clone.querySelectorAll(sel).forEach(el => el.remove());
      });

      md = ts.turndown(clone) || '';
      console.log('[Extract] Fallback markdown length:', md.length);
    }

    // Prepend title
    if (title && title !== document.title) {
      md = '# ' + title + '\n\n' + md;
    }

    // Length protection
    const TRUNCATE_LIMIT = 50000;
    const finalMd = md.length > TRUNCATE_LIMIT
      ? md.substring(0, TRUNCATE_LIMIT) + '\n\n[Truncated for performance...]'
      : md;

    // Return safe object
    return {
      markdown: finalMd,
      title: title,
      length: finalMd.length
    };
  }

  // ==============================================
  // Atomic Extraction (Sequential Injection)
  // ==============================================
  const executeExtraction = async () => {
    console.log('[Popup] Sequential extraction starting...');
    disableButtons();
    setButtonState('extracting');
    showStatus('Initializing...', 'loading');
    showStatusHint('');
    hideStats();
    hideActionButtons();

    let timeoutId;

    try {
      // Get current tab
      const tab = await new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          if (!tabs[0]?.id) reject(new Error('Cannot access current tab'));
          resolve(tabs[0]);
        });
      });

      currentTabId = tab.id;
      console.log('[Popup] Tab ID:', tab.id);

      // ==============================================
      // Step 1: Inject Readability.js
      // ==============================================
      showStatus('Loading Readability...', 'loading');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['libs/Readability.js']
      });
      console.log('[Popup] Readability injected');

      // ==============================================
      // Step 2: Inject Turndown.js
      // ==============================================
      showStatus('Loading Turndown...', 'loading');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['libs/turndown.js']
      });
      console.log('[Popup] Turndown injected');

      // ==============================================
      // Step 3: Execute Extraction
      // ==============================================
      showStatus('Extracting content...', 'loading');

      const results = await Promise.race([
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractArticleLogic
        }),
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), TIMEOUT_MS);
        })
      ]);

      clearTimeout(timeoutId);

      // ==============================================
      // Result Validation
      // ==============================================
      if (!results || !results[0] || !results[0].result) {
        throw new Error('No data returned from script');
      }

      const result = results[0].result;

      if (!result.markdown) {
        throw new Error('No markdown content in result');
      }

      console.log('[Popup] Extracted:', result.length, 'chars');

      // ==============================================
      // Step 4: Copy to Clipboard (in Popup)
      // ==============================================
      await navigator.clipboard.writeText(result.markdown);
      console.log('[Popup] Copied to clipboard');

      showStats(result.length, Math.ceil(result.length / 4));
      setButtonState('done');
      showStatus('Copied!', 'success');
      showStatusHint('');

      setTimeout(() => {
        setButtonState('idle');
        enableButtons();
      }, 2000);

    } catch (error) {
      clearTimeout(timeoutId);
      console.error('[Popup] Error:', error.message);

      setButtonState('idle');

      if (isConnectionError(error.message)) {
        showStatus('Connection lost. Refresh page.', 'error');
        showStatusHint('Try refreshing and retry.');
        showRefreshButton(true);
      } else if (error.message === 'TIMEOUT_EXCEEDED') {
        showStatus('Extraction timeout.', 'error');
        showStatusHint('The page took too long to process.');
        showRefreshButton(true);
      } else {
        // Explicit error display
        const shortMsg = error.message.length > 150
          ? error.message.substring(0, 150) + '...'
          : error.message;
        showStatus('Error: ' + shortMsg, 'error');
        showStatusHint('Check browser console for full details.');
        showRefreshButton(true);
      }

      enableButtons();
    }
  };

  // ==============================================
  // Event Listeners (bound immediately)
  // ==============================================
  extractBtn.addEventListener('click', executeExtraction);
  claudeBtn.addEventListener('click', executeExtraction);
  refreshBtn.addEventListener('click', refreshCurrentPage);

  btnPro.addEventListener('click', () => modalOverlay.classList.add('visible'));
  modalClose.addEventListener('click', () => modalOverlay.classList.remove('visible'));

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('visible');
  });

  modalBtn.addEventListener('click', () => {
    modalBtn.textContent = 'Thanks!';
    modalBtn.disabled = true;
    setTimeout(() => {
      modalOverlay.classList.remove('visible');
      setTimeout(() => {
        modalBtn.textContent = 'Join Waitlist →';
        modalBtn.disabled = false;
      }, 300);
    }, 1500);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('visible')) {
      modalOverlay.classList.remove('visible');
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      executeExtraction();
    }
  });

  // Initial state
  setButtonState('idle');
  console.log('[Popup] Ready');
});

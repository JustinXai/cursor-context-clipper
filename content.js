// Cursor-Context-Clipper Content Script
// Extract main content with Readability + Convert to Markdown with Turndown

(function() {
  'use strict';

  console.log('[Content] Script loaded on:', window.location.href);

  // ============================================
  // Timing Utilities
  // ============================================
  const _timers = {};

  function _startTimer(name) {
    _timers[name] = performance.now();
  }

  function _endTimer(name) {
    if (_timers[name]) {
      const ms = (performance.now() - _timers[name]).toFixed(1);
      console.log(`[Timer] ${name}: ${ms}ms`);
      delete _timers[name];
      return ms;
    }
    return '?';
  }

  // ============================================
  // Utility Functions
  // ============================================
  function estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  function toAbsoluteUrl(href, baseUri) {
    try {
      return new URL(href, baseUri).href;
    } catch (e) {
      return href;
    }
  }

  // ============================================
  // Fast Noise Removal (inline, no clone needed)
  // ============================================
  function fastClean(container) {
    const noise = container.querySelectorAll(
      'script, style, noscript, iframe, svg, canvas, form, nav, footer, header, aside, .ad, .ads, .advertisement, .cookie, .popup, .modal, .sidebar, [role="navigation"], [role="banner"], [role="contentinfo"]'
    );
    noise.forEach(el => el.remove());
  }

  // ============================================
  // Math Protection
  // ============================================
  function protectMath(container) {
    _startTimer('math');
    var count = 0;
    const selectors = ['.katex', '.MathJax', '[data-math]', '[data-latex]'];

    selectors.forEach(sel => {
      try {
        container.querySelectorAll(sel).forEach(el => {
          var latex = el.getAttribute('data-math') || el.getAttribute('data-latex') || el.textContent;
          if (latex && latex.trim()) {
            var wrapper = document.createElement('span');
            wrapper.className = 'math-protected';
            wrapper.setAttribute('data-latex', latex.trim());
            wrapper.textContent = '$' + latex.trim() + '$';
            el.parentNode.replaceChild(wrapper, el);
            count++;
          }
        });
      } catch (e) {}
    });

    _endTimer('math');
    return count;
  }

  // ============================================
  // Image Processing
  // ============================================
  function processImages(container) {
    _startTimer('images');
    var count = 0;

    container.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
        try {
          img.setAttribute('src', toAbsoluteUrl(src, document.baseURI));
          count++;
        } catch (e) {}
      }
    });

    _endTimer('images');
    return count;
  }

  // ============================================
  // Turndown Service (Optimized for complex DOM)
  // ============================================
  function createTurndown() {
    _startTimer('turndownInit');

    const service = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
      emDelimiter: '*',
      preformattedCode: false,
      // Skip empty nodes - only keep meaningful elements
      blankReplacement: function(content, node) {
        return '';
      }
    });

    // Remove all default rules first (start clean)
    const defaultRules = [
      'paragraph', 'lineBreak', 'heading', 'blockquote', 'list', 'listItem',
      'indentedCodeBlock', 'fencedCodeBlock', 'horizontalRule',
      'inlineLink', 'referenceLink', 'emphasis', 'strong', 'code', 'image'
    ];
    defaultRules.forEach(rule => service.remove(rule));

    // -----------------------------------------------
    // Rule 1: Skip empty/skip nodes
    // Nodes without text content AND not img/pre/code -> skip entirely
    // -----------------------------------------------
    service.addRule('skipEmpty', {
      filter: function(node) {
        const tag = node.nodeName;
        // Always keep these: void elements, pre blocks, code, images
        if (['IMG', 'PRE', 'CODE', 'BR', 'HR'].includes(tag)) return false;
        // Skip if no text and no meaningful children
        if (!node.textContent || !node.textContent.trim()) {
          return true;
        }
        return false;
      },
      replacement: function(content, node) {
        return '';
      }
    });

    // -----------------------------------------------
    // Rule 2: Transparent containers
    // div, span, section, article, main, aside, etc -> just extract text
    // -----------------------------------------------
    const transparentTags = [
      'DIV', 'SPAN', 'SECTION', 'ARTICLE', 'MAIN', 'ASIDE', 'HEADER', 'FOOTER',
      'NAV', 'FIGURE', 'FIGCAPTION', 'ADDRESS', 'HGROUP', 'CENTER', 'FIGURE'
    ];
    service.addRule('transparentContainer', {
      filter: function(node) {
        return transparentTags.includes(node.nodeName);
      },
      replacement: function(content, node) {
        return content;
      }
    });

    // -----------------------------------------------
    // Rule 3: Headings (h1-h6)
    // -----------------------------------------------
    service.addRule('heading', {
      filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      replacement: function(content, node) {
        var hLevel = Number(node.nodeName.charAt(1));
        return '\n\n' + '#'.repeat(hLevel) + ' ' + content + '\n\n';
      }
    });

    // -----------------------------------------------
    // Rule 4: Paragraphs
    // -----------------------------------------------
    service.addRule('paragraph', {
      filter: 'p',
      replacement: function(content) {
        return '\n\n' + content + '\n\n';
      }
    });

    // -----------------------------------------------
    // Rule 5: Blockquote
    // -----------------------------------------------
    service.addRule('blockquote', {
      filter: 'blockquote',
      replacement: function(content) {
        content = content.replace(/^\n*/, '').replace(/\n*$/, '').replace(/^/gm, '> ');
        return '\n\n' + content + '\n\n';
      }
    });

    // -----------------------------------------------
    // Rule 6: Unordered List
    // -----------------------------------------------
    service.addRule('unorderedList', {
      filter: 'ul',
      replacement: function(content, node) {
        var parent = node.parentNode;
        if (parent && parent.nodeName === 'LI' && parent.lastElementChild === node) {
          return '\n' + content;
        }
        return '\n\n' + content + '\n\n';
      }
    });

    // -----------------------------------------------
    // Rule 7: Ordered List
    // -----------------------------------------------
    service.addRule('orderedList', {
      filter: 'ol',
      replacement: function(content, node) {
        var parent = node.parentNode;
        if (parent && parent.nodeName === 'LI' && parent.lastElementChild === node) {
          return '\n' + content;
        }
        return '\n\n' + content + '\n\n';
      }
    });

    // -----------------------------------------------
    // Rule 8: List Item
    // -----------------------------------------------
    service.addRule('listItem', {
      filter: 'li',
      replacement: function(content, node) {
        var prefix = '-   ';
        var parent = node.parentNode;
        if (parent && parent.nodeName === 'OL') {
          var start = parent.getAttribute('start');
          var index = Array.prototype.indexOf.call(parent.children, node);
          prefix = (start ? Number(start) + index : index + 1) + '.  ';
        }
        content = content.replace(/\n+$/, '');
        content = content.replace(/\n/g, '\n' + ' '.repeat(prefix.length));
        return prefix + content + '\n';
      }
    });

    // -----------------------------------------------
    // Rule 9: Code Block (pre > code)
    // -----------------------------------------------
    service.addRule('codeBlock', {
      filter: function(node) {
        return node.nodeName === 'PRE' && node.firstChild && node.firstChild.nodeName === 'CODE';
      },
      replacement: function(content, node) {
        var code = node.firstChild;
        var lang = '';

        var className = code.getAttribute('class') || '';
        var langMatch = className.match(/(?:language-|lang-)?(\w+)/);
        if (langMatch) lang = langMatch[1];

        return '\n\n```' + lang + '\n' + code.textContent + '\n```\n\n';
      }
    });

    // -----------------------------------------------
    // Rule 10: Inline Code
    // -----------------------------------------------
    service.addRule('inlineCode', {
      filter: function(node) {
        return node.nodeName === 'CODE' && node.parentNode.nodeName !== 'PRE';
      },
      replacement: function(content) {
        if (!content) return '';
        content = content.replace(/\r?\n|\r/g, ' ');
        if (content.indexOf('`') !== -1) {
          return '`` ' + content + ' ``';
        }
        return '`' + content + '`';
      }
    });

    // -----------------------------------------------
    // Rule 11: Image
    // -----------------------------------------------
    service.addRule('image', {
      filter: 'img',
      replacement: function(content, node) {
        var src = node.getAttribute('src') || '';
        var alt = node.getAttribute('alt') || '';
        return src ? '![' + alt + '](' + src + ')' : '';
      }
    });

    // -----------------------------------------------
    // Rule 12: Link
    // -----------------------------------------------
    service.addRule('link', {
      filter: 'a',
      replacement: function(content, node) {
        var href = node.getAttribute('href') || '';
        return '[' + content + '](' + href + ')';
      }
    });

    // -----------------------------------------------
    // Rule 13: Table (basic support)
    // -----------------------------------------------
    service.addRule('table', {
      filter: function(node) {
        return node.nodeName === 'TABLE';
      },
      replacement: function(content, node) {
        var table = node;
        var rows = [];

        table.querySelectorAll('tr').forEach(function(tr) {
          var cells = [];
          tr.querySelectorAll('td, th').forEach(function(cell) {
            cells.push(cell.textContent.trim());
          });
          if (cells.length) {
            rows.push('| ' + cells.join(' | ') + ' |');
          }
        });

        if (rows.length === 0) return '';

        var separator = '| ' + rows[0].split('|').map(function() { return '---'; }).join(' | ') + ' |';
        return '\n\n' + rows[0] + '\n' + separator + '\n' + rows.slice(1).join('\n') + '\n\n';
      }
    });

    // -----------------------------------------------
    // Rule 14: Math formula (protected)
    // -----------------------------------------------
    service.addRule('math', {
      filter: function(node) {
        return node.className && node.className.indexOf && node.className.indexOf('math-protected') !== -1;
      },
      replacement: function(content, node) {
        var latex = node.getAttribute('data-latex');
        return latex || content;
      }
    });

    _endTimer('turndownInit');
    return service;
  }

  // ============================================
  // Targeted Extraction (React.dev optimization)
  // ============================================
  function extractTargeted() {
    _startTimer('targeted');

    // Step 1: Find <article> or <main> tag
    const articleEl = document.querySelector('article') || document.querySelector('main[role="main"]') || document.querySelector('main');
    const title = articleEl ? articleEl.querySelector('h1')?.textContent || document.title : document.title;

    if (articleEl) {
      console.log('[Content] Targeted extraction used: article tag');

      // Clone and clean the targeted element only
      const clone = articleEl.cloneNode(true);
      fastClean(clone);

      // Process content
      const mathCount = protectMath(clone);
      const imageCount = processImages(clone);

      // Absolute links
      clone.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#')) {
          try { a.setAttribute('href', toAbsoluteUrl(href, document.baseURI)); } catch (e) {}
        }
      });

      // Convert
      _startTimer('turndown');
      const service = createTurndown();
      const markdown = service.turndown(clone.innerHTML);
      _endTimer('turndown');

      const finalMarkdown = '# ' + title + '\n\n' + markdown + '\n\n---\n*URL: ' + window.location.href + '*';

      _endTimer('targeted');
      return {
        success: true,
        markdown: finalMarkdown,
        title: title,
        charCount: finalMarkdown.length,
        tokenEstimate: estimateTokens(finalMarkdown),
        mode: 'targeted',
        stats: { mathFormulas: mathCount, images: imageCount }
      };
    }

    _endTimer('targeted');
    return null;
  }

  // ============================================
  // Full Body Extraction (Fallback)
  // ============================================
  function extractFullBody() {
    console.log('[Content] Fallback to full body extraction');

    _startTimer('fullBody');

    const docClone = document.cloneNode(true);
    fastClean(docClone);

    // Extra aggressive cleaning for heavy pages
    docClone.querySelectorAll('iframe, svg, canvas, video, audio').forEach(el => el.remove());

    const reader = new Readability(docClone, {
      maxElemsToParse: 2000,
      charThreshold: 500
    });
    const article = reader.parse();

    if (!article || !article.content) {
      throw new Error('Readability failed to extract content');
    }

    console.log('[Content] Full body OK, content length:', article.content.length);

    // Truncate safety
    let content = article.content;
    if (content.length > 100000) {
      console.log('[Content] Truncating from', content.length, 'to 100000');
      content = content.substring(0, 100000);
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    const mathCount = protectMath(tempDiv);
    const imageCount = processImages(tempDiv);

    tempDiv.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#')) {
        try { a.setAttribute('href', toAbsoluteUrl(href, document.baseURI)); } catch (e) {}
      }
    });

    _startTimer('turndown');
    const service = createTurndown();
    let markdown = service.turndown(tempDiv.innerHTML);
    _endTimer('turndown');

    if (article.title) markdown = '# ' + article.title + '\n\n' + markdown;
    markdown += '\n\n---\n*URL: ' + window.location.href + '*';
    if (article.byline) markdown += '\n*Author: ' + article.byline + '*';
    if (article.siteName) markdown += '\n*Source: ' + article.siteName + '*';

    _endTimer('fullBody');

    return {
      success: true,
      markdown: markdown,
      title: article.title || document.title,
      charCount: markdown.length,
      tokenEstimate: estimateTokens(markdown),
      mode: 'fullbody',
      stats: { mathFormulas: mathCount, images: imageCount }
    };
  }

  // ============================================
  // Main Extraction
  // ============================================
  function extractPageToMarkdown() {
    console.log('[Content] === EXTRACTION START ===');
    _startTimer('total');

    try {
      // Try targeted extraction first
      let result = extractTargeted();

      // Fallback to full body if no article found
      if (!result) {
        result = extractFullBody();
      }

      const charCount = result.charCount;
      const tokenCount = result.tokenEstimate;

      _endTimer('total');
      console.log('[Content] === EXTRACTION DONE ===', result.mode, '-', charCount, 'chars, ~', tokenCount, 'tokens');

      return result;

    } catch (error) {
      _endTimer('total');
      console.error('[Content] Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================
  // Message Listener
  // ============================================
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'PING') {
      sendResponse({ ready: true });
      return true;
    }

    if (request.action === 'extractPlainText') {
      console.log('[Content] Fallback: plain text extraction');
      sendResponse({
        text: document.body ? document.body.innerText : '',
        title: document.title,
        url: window.location.href
      });
      return true;
    }

    if (request.action === 'extractContent') {
      console.log('[Content] extractContent received');
      const result = extractPageToMarkdown();
      sendResponse(result);
      return true;
    }

    return false;
  });

  console.log('[Content] Ready');
})();
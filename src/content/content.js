// LeetCode Topic Analyzer Content Script
class LeetCodeAnalyzer {
  constructor() {
    this.topics = {
      'Arrays & Strings': {
        keywords: ['array', 'string', 'substring', 'subarray', 'concatenate', 'split', 'join', 'slice', 'splice', 'index', 'length', 'size'],
        color: '#FF6B6B'
      },
      'Linked Lists': {
        keywords: ['linked list', 'node', 'next', 'head', 'tail', 'pointer', 'traverse', 'reverse', 'cycle', 'detect'],
        color: '#4ECDC4'
      },
      'Trees & Graphs': {
        keywords: ['tree', 'graph', 'node', 'edge', 'vertex', 'root', 'leaf', 'parent', 'child', 'traversal', 'dfs', 'bfs', 'binary', 'bst'],
        color: '#45B7D1'
      },
      'Dynamic Programming': {
        keywords: ['dp', 'dynamic programming', 'memoization', 'recursion', 'optimal', 'subproblem', 'state', 'transition'],
        color: '#96CEB4'
      },
      'Two Pointers': {
        keywords: ['two pointers', 'slow', 'fast', 'pointer', 'collision', 'meeting', 'cycle detection'],
        color: '#FFEAA7'
      },
      'Sliding Window': {
        keywords: ['sliding window', 'window', 'k elements', 'consecutive', 'subarray', 'minimum', 'maximum'],
        color: '#DDA0DD'
      },
      'Binary Search': {
        keywords: ['binary search', 'sorted', 'middle', 'left', 'right', 'target', 'logarithmic'],
        color: '#98D8C8'
      },
      'Stack & Queue': {
        keywords: ['stack', 'queue', 'push', 'pop', 'peek', 'dequeue', 'enqueue', 'lifo', 'fifo'],
        color: '#F7DC6F'
      },
      'Hash Table': {
        keywords: ['hash', 'hashmap', 'hashset', 'dictionary', 'key', 'value', 'lookup', 'collision'],
        color: '#BB8FCE'
      },
      'Greedy': {
        keywords: ['greedy', 'optimal', 'local optimum', 'choice', 'select', 'minimum', 'maximum'],
        color: '#F8C471'
      },
      'Backtracking': {
        keywords: ['backtrack', 'combination', 'permutation', 'subset', 'recursion', 'state', 'undo'],
        color: '#E74C3C'
      },
      'Bit Manipulation': {
        keywords: ['bit', 'xor', 'and', 'or', 'shift', 'mask', 'binary', 'bitwise'],
        color: '#9B59B6'
      }
    };
    
    this.highlightedElements = new Set();
    this.isEnabled = true;
    this.init();
  }

  init() {
    // Listen for messages from popup and background
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleAnalysis') {
        this.isEnabled = request.enabled;
        if (this.isEnabled) {
          this.analyzePage();
        } else {
          this.removeHighlights();
        }
        sendResponse({success: true});
      } else if (request.action === 'refreshAnalysis') {
        this.removeHighlights();
        if (this.isEnabled) {
          this.analyzePage();
        }
        sendResponse({success: true});
      } else if (request.action === 'clearHighlights') {
        this.removeHighlights();
        sendResponse({success: true});
      } else if (request.action === 'pageLoaded') {
        // Page has loaded, re-analyze if enabled
        if (this.isEnabled) {
          setTimeout(() => this.analyzePage(), 500);
        }
        sendResponse({success: true});
      }
    });

    // Initial analysis
    this.analyzePage();
    
    // Watch for dynamic content changes
    this.observePageChanges();
  }

  analyzePage() {
    if (!this.isEnabled) return;
    
    // Remove existing highlights
    this.removeHighlights();
    
    // Get problem content
    const problemContent = this.getProblemContent();
    if (!problemContent) return;
    
    // Analyze and highlight keywords
    this.highlightKeywords(problemContent);
  }

  getProblemContent() {
    // Try different selectors for LeetCode problem content
    const selectors = [
      '[data-track-load="description_content"]',
      '.description__24sA',
      '.question-content__JfgR',
      '.content__1YWB',
      '.description',
      '.problem-description'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
    }
    
    return null;
  }

  highlightKeywords(container) {
    // Get all text nodes that haven't been processed yet
    const textNodes = this.getTextNodes(container);
    
    textNodes.forEach(node => {
      const text = node.textContent;
      if (!text.trim()) return; // Skip empty text nodes
      
      // Create a document fragment to build the highlighted content
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let hasHighlights = false;
      
      // Find all keyword matches and sort them by position
      const matches = [];
      Object.entries(this.topics).forEach(([topic, config]) => {
        config.keywords.forEach(keyword => {
          const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'gi');
          let match;
          while ((match = regex.exec(text)) !== null) {
            matches.push({
              start: match.index,
              end: match.index + match[0].length,
              text: match[0],
              topic: topic,
              config: config
            });
          }
        });
      });
      
      // Sort matches by start position
      matches.sort((a, b) => a.start - b.start);
      
      // Remove overlapping matches (keep the first one)
      const filteredMatches = [];
      for (let i = 0; i < matches.length; i++) {
        const current = matches[i];
        const overlapping = filteredMatches.find(m => 
          (current.start >= m.start && current.start < m.end) ||
          (current.end > m.start && current.end <= m.end)
        );
        if (!overlapping) {
          filteredMatches.push(current);
        }
      }
      
      // Build the highlighted content
      filteredMatches.forEach(match => {
        // Add text before the match
        if (match.start > lastIndex) {
          const textBefore = text.substring(lastIndex, match.start);
          fragment.appendChild(document.createTextNode(textBefore));
        }
        
        // Create highlighted span
        const span = document.createElement('span');
        span.className = `lc-highlight lc-${match.topic.toLowerCase().replace(/\s+/g, '-')}`;
        span.setAttribute('data-topic', match.topic);
        span.style.cssText = `
          background-color: ${match.config.color}; 
          color: white; 
          padding: 2px 4px; 
          border-radius: 3px; 
          margin: 0 1px;
          cursor: pointer;
        `;
        span.title = `Topic: ${match.topic}`;
        span.textContent = match.text;
        
        fragment.appendChild(span);
        hasHighlights = true;
        lastIndex = match.end;
      });
      
      // Add remaining text
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
      }
      
      // Replace the text node with the highlighted content
      if (hasHighlights) {
        const wrapper = document.createElement('span');
        wrapper.className = 'lc-highlighted-container';
        wrapper.appendChild(fragment);
        node.parentNode.replaceChild(wrapper, node);
        this.highlightedElements.add(wrapper);
      }
    });
  }

  getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip if parent is already highlighted or is a script/style tag
          const parent = node.parentElement;
          if (parent && (
            parent.tagName === 'SCRIPT' || 
            parent.tagName === 'STYLE' || 
            parent.tagName === 'NOSCRIPT' ||
            parent.classList.contains('lc-highlight') ||
            parent.classList.contains('lc-highlighted-container') ||
            parent.closest('.lc-highlighted-container')
          )) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim().length > 0) {
        textNodes.push(node);
      }
    }
    
    return textNodes;
  }

  removeHighlights() {
    this.highlightedElements.forEach(element => {
      if (element.parentNode) {
        // Get the text content without any HTML markup
        const textContent = element.textContent || element.innerText;
        const textNode = document.createTextNode(textContent);
        
        // Replace the highlighted element with the original text
        element.parentNode.replaceChild(textNode, element);
      }
    });
    this.highlightedElements.clear();
  }

  observePageChanges() {
    // Watch for navigation changes (SPA)
    let currentUrl = window.location.href;
    
    setInterval(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        setTimeout(() => this.analyzePage(), 1000); // Wait for content to load
      }
    }, 1000);
    
    // Watch for dynamic content changes
    const observer = new MutationObserver((mutations) => {
      if (!this.isEnabled) return;
      
      let shouldReanalyze = false;
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const selectors = [
                '[data-track-load="description_content"]',
                '.description__24sA',
                '.question-content__JfgR'
              ];
              
              if (selectors.some(selector => node.matches?.(selector) || node.querySelector?.(selector))) {
                shouldReanalyze = true;
                break;
              }
            }
          }
        }
      });
      
      if (shouldReanalyze) {
        setTimeout(() => this.analyzePage(), 500);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Initialize the analyzer when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new LeetCodeAnalyzer();
  });
} else {
  new LeetCodeAnalyzer();
} 
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
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleAnalysis') {
        this.isEnabled = request.enabled;
        if (this.isEnabled) {
          this.analyzePage();
        } else {
          this.removeHighlights();
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
    const textNodes = this.getTextNodes(container);
    
    textNodes.forEach(node => {
      const text = node.textContent;
      let highlightedText = text;
      
      // Check each topic for keywords
      Object.entries(this.topics).forEach(([topic, config]) => {
        config.keywords.forEach(keyword => {
          const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'gi');
          highlightedText = highlightedText.replace(regex, (match) => {
            return `<span class="lc-highlight lc-${topic.toLowerCase().replace(/\s+/g, '-')}" 
                     data-topic="${topic}" 
                     style="background-color: ${config.color}; 
                            color: white; 
                            padding: 2px 4px; 
                            border-radius: 3px; 
                            margin: 0 1px;
                            cursor: pointer;"
                     title="Topic: ${topic}">${match}</span>`;
          });
        });
      });
      
      if (highlightedText !== text) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = highlightedText;
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
            parent.classList.contains('lc-highlight')
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
        const textContent = element.textContent;
        const textNode = document.createTextNode(textContent);
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
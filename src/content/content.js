// LeetCode Topic Analyzer Content Script
class LeetCodeAnalyzer {
  constructor() {
    this.topics = {
      'Arrays & Strings': {
        keywords: ['array', 'string', 'substring', 'subarray', 'concatenate', 'split', 'join', 'slice', 'splice', 'index', 'length', 'size'],
        contextKeywords: ['nums', 'str', 's.charAt', 's.substring', 's.length', 'array.length'],
        color: '#FF6B6B'
      },
      'Linked Lists': {
        keywords: ['linked list', 'node', 'next', 'head', 'tail', 'pointer', 'traverse', 'reverse', 'cycle', 'detect'],
        contextKeywords: ['ListNode', 'head.next', 'slow', 'fast', 'cycle detection'],
        color: '#4ECDC4'
      },
      'Trees & Graphs': {
        keywords: ['tree', 'graph', 'node', 'edge', 'vertex', 'root', 'leaf', 'parent', 'child', 'traversal', 'dfs', 'bfs', 'binary', 'bst'],
        contextKeywords: ['TreeNode', 'left', 'right', 'root.left', 'root.right', 'inorder', 'preorder', 'postorder'],
        color: '#45B7D1'
      },
      'Dynamic Programming': {
        keywords: ['dp', 'dynamic programming', 'memoization', 'recursion', 'optimal', 'subproblem', 'state', 'transition'],
        contextKeywords: ['dp[i]', 'memo', 'cache', 'bottom-up', 'top-down', 'optimal substructure'],
        color: '#96CEB4'
      },
      'Two Pointers': {
        keywords: ['two pointers', 'slow', 'fast', 'pointer', 'collision', 'meeting', 'cycle detection'],
        contextKeywords: ['left', 'right', 'start', 'end', 'i++', 'j--', 'collision'],
        color: '#FFEAA7'
      },
      'Sliding Window': {
        keywords: ['sliding window', 'window', 'k elements', 'consecutive', 'subarray', 'minimum', 'maximum'],
        contextKeywords: ['window', 'k', 'consecutive', 'subarray', 'min', 'max'],
        color: '#DDA0DD',
        
      },
      'Binary Search': {
        keywords: ['binary search', 'sorted', 'middle', 'left', 'right', 'target', 'logarithmic'],
        contextKeywords: ['sorted', 'ascending', 'descending', 'mid', 'target', 'log(n)'],
        color: '#98D8C8',
        
      },
      'Stack & Queue': {
        keywords: ['stack', 'queue', 'push', 'pop', 'peek', 'dequeue', 'enqueue', 'lifo', 'fifo'],
        contextKeywords: ['stack.push', 'stack.pop', 'queue.offer', 'queue.poll'],
        color: '#F7DC6F',
        
      },
      'Hash Table': {
        keywords: ['hash', 'hashmap', 'hashset', 'dictionary', 'key', 'value', 'lookup', 'collision'],
        contextKeywords: ['HashMap', 'HashSet', 'containsKey', 'get', 'put', 'O(1)'],
        color: '#BB8FCE',
        
      },
      'Greedy': {
        keywords: ['greedy', 'optimal', 'local optimum', 'choice', 'select', 'minimum', 'maximum'],
        contextKeywords: ['always choose', 'best choice', 'local optimal', 'greedy choice'],
        color: '#F8C471',
        
      },
      'Backtracking': {
        keywords: ['backtrack', 'combination', 'permutation', 'subset', 'recursion', 'state', 'undo'],
        contextKeywords: ['backtrack', 'combinations', 'permutations', 'subsets', 'state'],
        color: '#E74C3C',
        
      },
      'Bit Manipulation': {
        keywords: ['bit', 'xor', 'and', 'or', 'shift', 'mask', 'binary', 'bitwise'],
        contextKeywords: ['&', '|', '^', '<<', '>>', 'bit', 'mask'],
        color: '#9B59B6',
      }
    };
    
    this.highlightedElements = new Set();
    this.isEnabled = true;
    this.foundTopics = new Set();
    this.foundKeywords = 0;
    this.highlightOpacity = 0.8;
    this.init();
  }

  async init() {
    // Load settings
    await this.loadSettings();
    
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
      } else if (request.action === 'getStats') {
        // Return statistics about found topics and keywords
        sendResponse({
          success: true,
          topicsFound: this.foundTopics.size,
          keywordsFound: this.foundKeywords,
          topics: Array.from(this.foundTopics)
        });
      } else if (request.action === 'toggleTopic') {
        // Toggle topic visibility
        this.toggleTopic(request.topic, request.enabled);
        sendResponse({success: true});
      } else if (request.action === 'updateOpacity') {
        // Update highlight opacity
        this.highlightOpacity = request.opacity;
        this.updateHighlightOpacity(request.opacity);
        sendResponse({success: true});
      }
    });

    // Initial analysis
    if (this.isEnabled) {
      this.analyzePage();
    }
    
    // Watch for dynamic content changes
    this.observePageChanges();
  }

  analyzePage() {
    if (!this.isEnabled) return;
    
    // Remove existing highlights
    this.removeHighlights();
    
    // Reset statistics
    this.foundTopics.clear();
    this.foundKeywords = 0;
    
    // Get problem content
    const problemContent = this.getProblemContent();
    if (!problemContent) return;
    
    // Extract only the problem description (no examples/constraints)
    const descriptionOnly = this.getProblemDescriptionOnly(problemContent);
    
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

  getProblemDescriptionOnly(container) {
    // Extract only the problem description, stopping at "Example 1"
    const fullText = container.textContent;
    
    // Look specifically for "Example 1" or similar patterns
    const examplePatterns = [
      /\bExample\s*1\s*:/i,
      /\bExample\s*1\s*$/i,
      /\bExample\s*1\s*\n/i,
      /\bExamples?\s*:/i,
      /\bConstraints?\s*:/i,
      /\bFollow-up\s*:/i,
      /\bNote\s*:/i,
      /\bInput\s*:/i,
      /\bOutput\s*:/i
    ];
    
    // Find the earliest occurrence of any end pattern
    let endIndex = fullText.length;
    examplePatterns.forEach(pattern => {
      const match = pattern.exec(fullText);
      if (match && match.index < endIndex) {
        endIndex = match.index;
      }
    });
    
    // Extract only the description part
    const descriptionOnly = fullText.substring(0, endIndex).trim();
    
    // Create a temporary container with only the description
    const tempContainer = document.createElement('div');
    tempContainer.textContent = descriptionOnly;
    
    return tempContainer;
  }

  highlightKeywords(container) {
    // Get all text nodes that haven't been processed yet
    const textNodes = this.getTextNodes(container);
    
    textNodes.forEach(node => {
      const text = node.textContent;
      if (!text.trim()) return; // Skip empty text nodes
      
      // Check if this text node is in the description area
      if (!this.isInDescriptionArea(node)) {
        return; // Skip if not in description area
      }
      
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
        span.className = `lc-highlight ${normalizeTopicClass(match.topic)}`;
        span.setAttribute('data-topic', match.topic);
        span.style.cssText = `
          background-color: ${match.config.color}; 
          color: white; 
          padding: 2px 4px; 
          border-radius: 3px; 
          margin: 0 1px;
          cursor: pointer;
          opacity: ${this.highlightOpacity || 0.8};
        `;
        span.title = `Topic: ${match.topic}`;
        span.textContent = match.text;
        
        fragment.appendChild(span);
        hasHighlights = true;
        this.foundTopics.add(match.topic);
        this.foundKeywords++;
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

  isInDescriptionArea(node) {
    // Check if the text node is within the description area
    const fullText = this.getProblemContent()?.textContent || '';
    const nodeText = node.textContent;
    
    // Find the position of this text node in the full content
    const nodeIndex = fullText.indexOf(nodeText);
    if (nodeIndex === -1) return false;
    
    // Get the description-only text to find where it ends
    const descriptionOnly = this.getProblemDescriptionOnly(this.getProblemContent());
    const descriptionText = descriptionOnly.textContent;
    
    // Check if this node's text appears in the description area
    return descriptionText.includes(nodeText);
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

  toggleTopic(topicName, enabled) {
    // Normalize topic name to match class naming (remove punctuation)
    const topicClass = normalizeTopicClass(topicName);
    const highlights = document.querySelectorAll(`.${topicClass}`);
    highlights.forEach(highlight => {
      if (enabled) {
        highlight.style.display = 'inline';
      } else {
        highlight.style.display = 'none';
      }
    });
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['highlightOpacity', 'analysisEnabled']);
      if (result.highlightOpacity !== undefined) {
        this.highlightOpacity = result.highlightOpacity;
      }
      if (result.analysisEnabled !== undefined) {
        this.isEnabled = result.analysisEnabled;
      } else {
        this.isEnabled = true; // default to true if not set
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  }

  updateHighlightOpacity(opacity) {
    // Update opacity of all highlighted elements
    const highlights = document.querySelectorAll('.lc-highlight');
    highlights.forEach(highlight => {
      highlight.style.opacity = opacity;
    });
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }




}

// Utility to normalize topic names for class names
function normalizeTopicClass(topicName) {
  return `lc-${topicName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
}

// Initialize the analyzer when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new LeetCodeAnalyzer();
  });
} else {
  new LeetCodeAnalyzer();
} 
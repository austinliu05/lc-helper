// Popup JavaScript for LeetCode Topic Analyzer
class PopupController {
  constructor() {
    this.topics = {
      'Arrays & Strings': { color: '#FF6B6B', keywords: ['array', 'string', 'substring', 'subarray'] },
      'Linked Lists': { color: '#4ECDC4', keywords: ['linked list', 'node', 'next', 'head'] },
      'Trees & Graphs': { color: '#45B7D1', keywords: ['tree', 'graph', 'node', 'edge'] },
      'Dynamic Programming': { color: '#96CEB4', keywords: ['dp', 'dynamic programming', 'memoization'] },
      'Two Pointers': { color: '#FFEAA7', keywords: ['two pointers', 'slow', 'fast', 'pointer'] },
      'Sliding Window': { color: '#DDA0DD', keywords: ['sliding window', 'window', 'k elements'] },
      'Binary Search': { color: '#98D8C8', keywords: ['binary search', 'sorted', 'middle'] },
      'Stack & Queue': { color: '#F7DC6F', keywords: ['stack', 'queue', 'push', 'pop'] },
      'Hash Table': { color: '#BB8FCE', keywords: ['hash', 'hashmap', 'hashset', 'dictionary'] },
      'Greedy': { color: '#F8C471', keywords: ['greedy', 'optimal', 'local optimum'] },
      'Backtracking': { color: '#E74C3C', keywords: ['backtrack', 'combination', 'permutation'] },
      'Bit Manipulation': { color: '#9B59B6', keywords: ['bit', 'xor', 'and', 'or'] }
    };
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.populateTopicsGrid();
    await this.loadSettings();
    await this.updateStats();
  }

  setupEventListeners() {
    // Toggle analysis
    document.getElementById('analysisToggle').addEventListener('change', (e) => {
      this.toggleAnalysis(e.target.checked);
    });

    // Refresh analysis
    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.refreshAnalysis();
    });

    // Clear highlights
    document.getElementById('clearBtn').addEventListener('click', () => {
      this.clearHighlights();
    });

    // Settings
    document.getElementById('autoAnalyze').addEventListener('change', (e) => {
      this.saveSetting('autoAnalyze', e.target.checked);
    });

    document.getElementById('highlightOpacity').addEventListener('input', (e) => {
      const value = e.target.value;
      document.getElementById('opacityValue').textContent = `${Math.round(value * 100)}%`;
      this.saveSetting('highlightOpacity', value);
      this.updateHighlightOpacity(value);
    });
  }

  populateTopicsGrid() {
    const grid = document.getElementById('topicsGrid');
    grid.innerHTML = '';

    Object.entries(this.topics).forEach(([topic, config]) => {
      const topicItem = document.createElement('div');
      topicItem.className = 'topic-item';
      topicItem.style.backgroundColor = config.color;
      topicItem.textContent = topic;
      topicItem.title = `Keywords: ${config.keywords.join(', ')}`;
      
      topicItem.addEventListener('click', () => {
        this.toggleTopic(topicItem, topic);
      });
      
      grid.appendChild(topicItem);
    });
  }

  async toggleAnalysis(enabled) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url && tab.url.includes('leetcode.com')) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'toggleAnalysis',
            enabled: enabled
          });
          
          this.saveSetting('analysisEnabled', enabled);
        } catch (contentScriptError) {
          // Content script not ready, inject it first
          await this.injectContentScript(tab.id);
          setTimeout(async () => {
            try {
              await chrome.tabs.sendMessage(tab.id, {
                action: 'toggleAnalysis',
                enabled: enabled
              });
              this.saveSetting('analysisEnabled', enabled);
            } catch (retryError) {
              this.showError('Failed to toggle analysis. Please refresh the page.');
            }
          }, 500);
        }
      } else {
        this.showError('Please navigate to a LeetCode problem page');
      }
    } catch (error) {
      console.error('Error toggling analysis:', error);
      this.showError('Failed to toggle analysis. Please refresh the page.');
    }
  }

  async refreshAnalysis() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url.includes('leetcode.com')) {
        await chrome.tabs.sendMessage(tab.id, { action: 'refreshAnalysis' });
        await this.updateStats();
      } else {
        this.showError('Please navigate to a LeetCode problem page');
      }
    } catch (error) {
      console.error('Error refreshing analysis:', error);
      this.showError('Failed to refresh analysis');
    }
  }

  async clearHighlights() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url && tab.url.includes('leetcode.com')) {
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'clearHighlights' });
          await this.updateStats();
        } catch (contentScriptError) {
          console.log('Content script not ready');
          this.showError('Please refresh the page and try again');
        }
      } else {
        this.showError('Please navigate to a LeetCode problem page');
      }
    } catch (error) {
      console.error('Error clearing highlights:', error);
      this.showError('Failed to clear highlights');
    }
  }

  async updateStats() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url && tab.url.includes('leetcode.com')) {
        try {
          const response = await chrome.tabs.sendMessage(tab.id, { action: 'getStats' });
          
          if (response && response.success) {
            document.getElementById('topicsFound').textContent = response.topicsFound || 0;
            document.getElementById('keywordsFound').textContent = response.keywordsFound || 0;
            
            // Update found topics section
            this.updateFoundTopics(response.topics || []);
          } else {
            // Content script responded but no stats available
            document.getElementById('topicsFound').textContent = '0';
            document.getElementById('keywordsFound').textContent = '0';
            this.updateFoundTopics([]);
          }
        } catch (contentScriptError) {
          // Content script not ready - this is normal, just show 0 stats
          console.log('Content script not ready yet');
          document.getElementById('topicsFound').textContent = '0';
          document.getElementById('keywordsFound').textContent = '0';
          this.updateFoundTopics([]);
        }
      } else {
        document.getElementById('topicsFound').textContent = '0';
        document.getElementById('keywordsFound').textContent = '0';
        this.updateFoundTopics([]);
      }
    } catch (error) {
      console.error('Error updating stats:', error);
      document.getElementById('topicsFound').textContent = '0';
      document.getElementById('keywordsFound').textContent = '0';
      this.updateFoundTopics([]);
    }
  }

  async updateHighlightOpacity(opacity) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url && tab.url.includes('leetcode.com')) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'updateOpacity',
            opacity: opacity
          });
        } catch (contentScriptError) {
          console.log('Content script not ready for opacity update');
        }
      }
    } catch (error) {
      console.error('Error updating opacity:', error);
    }
  }

  updateFoundTopics(foundTopics) {
    const section = document.getElementById('foundTopicsSection');
    const list = document.getElementById('foundTopicsList');
    
    if (foundTopics.length === 0) {
      section.style.display = 'none';
      return;
    }
    
    section.style.display = 'block';
    list.innerHTML = '';
    
    foundTopics.forEach(topic => {
      const topicItem = document.createElement('div');
      topicItem.className = 'found-topic-item';
      topicItem.style.backgroundColor = this.topics[topic]?.color || '#ccc';
      topicItem.textContent = topic;
      list.appendChild(topicItem);
    });
  }

  async injectContentScript(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['src/content/content.js']
      });
    } catch (error) {
      console.log('Content script injection failed:', error);
    }
  }

  toggleTopic(topicElement, topicName) {
    topicElement.classList.toggle('inactive');
    const isActive = !topicElement.classList.contains('inactive');
    
    // Save topic preference
    this.saveTopicPreference(topicName, isActive);
    
    // Update content script
    const normalizedTopic = topicName.toLowerCase().replace(/\s+/g, '-');
    this.updateTopicVisibility(normalizedTopic, isActive);
  }

  async saveTopicPreference(topicName, isActive) {
    const preferences = await this.getSetting('topicPreferences', {});
    preferences[topicName] = isActive;
    await this.saveSetting('topicPreferences', preferences);
  }

  async updateTopicVisibility(topicName, isActive) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url && tab.url.includes('leetcode.com')) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'toggleTopic',
            topic: topicName,
            enabled: isActive
          });
        } catch (contentScriptError) {
          console.log('Content script not ready for topic toggle');
        }
      }
    } catch (error) {
      console.error('Error updating topic visibility:', error);
    }
  }

  async loadSettings() {
    const analysisEnabled = await this.getSetting('analysisEnabled', true);
    const autoAnalyze = await this.getSetting('autoAnalyze', true);
    const opacity = await this.getSetting('highlightOpacity', 0.8);
    const topicPreferences = await this.getSetting('topicPreferences', {});

    document.getElementById('analysisToggle').checked = analysisEnabled;
    document.getElementById('autoAnalyze').checked = autoAnalyze;
    document.getElementById('highlightOpacity').value = opacity;
    document.getElementById('opacityValue').textContent = `${Math.round(opacity * 100)}%`;

    // Apply topic preferences
    Object.entries(topicPreferences).forEach(([topic, isActive]) => {
      const topicElements = document.querySelectorAll('.topic-item');
      topicElements.forEach(element => {
        if (element.textContent === topic) {
          if (!isActive) {
            element.classList.add('inactive');
          }
        }
      });
    });
  }

  async saveSetting(key, value) {
    try {
      await chrome.storage.sync.set({ [key]: value });
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  }

  async getSetting(key, defaultValue) {
    try {
      const result = await chrome.storage.sync.get([key]);
      return result[key] !== undefined ? result[key] : defaultValue;
    } catch (error) {
      console.error('Error getting setting:', error);
      return defaultValue;
    }
  }

  showError(message) {
    // Create a temporary error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: #dc3545;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 1000;
      animation: fadeInOut 3s ease-in-out;
    `;
    errorDiv.textContent = message;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        10% { opacity: 1; transform: translateX(-50%) translateY(0); }
        90% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      document.body.removeChild(errorDiv);
      document.head.removeChild(style);
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
}); 
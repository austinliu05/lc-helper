// Background service worker for LeetCode Topic Analyzer
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings on first install
    chrome.storage.sync.set({
      analysisEnabled: true,
      autoAnalyze: true,
      highlightOpacity: 0.8,
      topicPreferences: {},
      version: '1.0.0'
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/welcome.html')
    });
  } else if (details.reason === 'update') {
    // Handle updates
    console.log('Extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(null, (settings) => {
      sendResponse({ success: true, settings });
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Handle tab updates to notify content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('leetcode.com')) {
    // Notify content script that page has loaded
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, { action: 'pageLoaded' }).catch(() => {
        // Content script not ready yet, that's okay
      });
    }, 1000);
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('leetcode.com')) {
    // Toggle popup or send message to content script
    chrome.tabs.sendMessage(tab.id, { action: 'toggleAnalysis' });
  } else {
    // Open LeetCode in new tab
    chrome.tabs.create({ url: 'https://leetcode.com' });
  }
});

// Context menu for right-click actions
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyzeProblem',
    title: 'Analyze LeetCode Problem',
    contexts: ['page'],
    documentUrlPatterns: ['https://leetcode.com/*']
  });
  
  chrome.contextMenus.create({
    id: 'clearHighlights',
    title: 'Clear Highlights',
    contexts: ['page'],
    documentUrlPatterns: ['https://leetcode.com/*']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyzeProblem') {
    chrome.tabs.sendMessage(tab.id, { action: 'refreshAnalysis' });
  } else if (info.menuItemId === 'clearHighlights') {
    chrome.tabs.sendMessage(tab.id, { action: 'clearHighlights' });
  }
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command, tab) => {
  if (tab.url && tab.url.includes('leetcode.com')) {
    switch (command) {
      case 'toggle-analysis':
        chrome.tabs.sendMessage(tab.id, { action: 'toggleAnalysis' });
        break;
      case 'refresh-analysis':
        chrome.tabs.sendMessage(tab.id, { action: 'refreshAnalysis' });
        break;
      case 'clear-highlights':
        chrome.tabs.sendMessage(tab.id, { action: 'clearHighlights' });
        break;
    }
  }
}); 
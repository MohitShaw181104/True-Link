// Background script for context menu and other background tasks

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'checkLink',
    title: 'Check link safety',
    contexts: ['link']
  });
  
  chrome.contextMenus.create({
    id: 'checkPage',
    title: 'Check current page',
    contexts: ['page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'checkLink') {
    // Open popup with the link URL
    chrome.action.openPopup();
    // Send the URL to the popup
    chrome.storage.local.set({ pendingUrl: info.linkUrl });
  } else if (info.menuItemId === 'checkPage') {
    // Open popup with current page URL
    chrome.action.openPopup();
    chrome.storage.local.set({ pendingUrl: tab.url });
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkUrl') {
    checkUrlSafety(request.url)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Will respond asynchronously
  }
});

// Function to check URL safety
async function checkUrlSafety(url) {
  const trustedDomains = {
    "videolan.org": "https://www.videolan.org",
    "github.com": "https://github.com",
    "nodejs.org": "https://nodejs.org",
    "microsoft.com": "https://www.microsoft.com",
    "google.com": "https://www.google.com",
    "mozilla.org": "https://www.mozilla.org",
    "adobe.com": "https://www.adobe.com",
    "apple.com": "https://www.apple.com",
    "ubuntu.com": "https://ubuntu.com",
    "debian.org": "https://www.debian.org"
  };

  const domain = extractDomain(url);
  if (!domain) {
    return { status: 'error', message: 'Invalid URL' };
  }

  // Check trusted domains first
  if (trustedDomains[domain]) {
    return {
      status: 'safe',
      source: trustedDomains[domain],
      message: 'Trusted domain'
    };
  }

  // For non-trusted domains, we'd need VirusTotal API
  // This would be implemented similar to the server version
  return {
    status: 'unknown',
    message: 'External domain - verify manually'
  };
}

// Helper function to extract domain
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// Badge management
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  updateBadgeForTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    updateBadgeForTab(tabId);
  }
});

async function updateBadgeForTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url) return;

    const domain = extractDomain(tab.url);
    const trustedDomains = {
      "videolan.org": "https://www.videolan.org",
      "github.com": "https://github.com",
      "nodejs.org": "https://nodejs.org",
      "microsoft.com": "https://www.microsoft.com",
      "google.com": "https://www.google.com",
      "mozilla.org": "https://www.mozilla.org",
      "adobe.com": "https://www.adobe.com",
      "apple.com": "https://www.apple.com",
      "ubuntu.com": "https://ubuntu.com",
      "debian.org": "https://www.debian.org"
    };

    if (trustedDomains[domain]) {
      chrome.action.setBadgeText({ text: '✓', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#28a745', tabId });
    } else {
      chrome.action.setBadgeText({ text: '?', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#ffc107', tabId });
    }
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}
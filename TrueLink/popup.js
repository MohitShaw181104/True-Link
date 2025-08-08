// Trusted domains - same as your backend
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

document.addEventListener('DOMContentLoaded', function() {
  const urlInput = document.getElementById('urlInput');
  const checkBtn = document.getElementById('checkBtn');
  const result = document.getElementById('result');
  const status = document.getElementById('status');
  const details = document.getElementById('details');
  const recommendation = document.getElementById('recommendation');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveSettings = document.getElementById('saveSettings');
  const scanPageBtn = document.getElementById('scanPageBtn');

  // Load saved API key
  chrome.storage.sync.get(['virusTotalApiKey'], function(result) {
    if (result.virusTotalApiKey) {
      apiKeyInput.value = result.virusTotalApiKey;
    }
  });

  // Check button click
  checkBtn.addEventListener('click', function() {
    const url = urlInput.value.trim();
    if (!url) {
      showResult('error', 'Please enter a URL');
      return;
    }
    checkLink(url);
  });

  // Enter key in input
  urlInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      checkBtn.click();
    }
  });

  // Settings toggle
  settingsBtn.addEventListener('click', function() {
    settingsPanel.classList.toggle('hidden');
  });

  // Save settings
  saveSettings.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.sync.set({ virusTotalApiKey: apiKey }, function() {
        showResult('safe', 'API Key saved successfully!');
        settingsPanel.classList.add('hidden');
      });
    }
  });

  // Scan current page
  scanPageBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentUrl = tabs[0].url;
      urlInput.value = currentUrl;
      checkLink(currentUrl);
    });
  });

  async function checkLink(url) {
    checkBtn.disabled = true;
    checkBtn.classList.add('loading');
    checkBtn.textContent = 'Checking...';
    
    try {
      const domain = extractDomain(url);
      if (!domain) {
        showResult('error', 'Invalid URL format');
        return;
      }

      // Check trusted domains first
      if (trustedDomains[domain]) {
        showResult('safe', '✅ Safe - Trusted Domain', 
          `This is a verified safe domain.`, 
          `Official site: <a href="${trustedDomains[domain]}" target="_blank">${trustedDomains[domain]}</a>`);
        return;
      }

      // Get API key
      const apiKeyResult = await new Promise(resolve => {
        chrome.storage.sync.get(['virusTotalApiKey'], resolve);
      });

      if (!apiKeyResult.virusTotalApiKey) {
        showResult('error', 'Please set your VirusTotal API key in settings');
        return;
      }

      // Check with VirusTotal
      const virusTotalResult = await checkWithVirusTotal(url, apiKeyResult.virusTotalApiKey);
      displayVirusTotalResult(virusTotalResult);

    } catch (error) {
      console.error('Error checking link:', error);
      showResult('error', 'Error checking link: ' + error.message);
    } finally {
      checkBtn.disabled = false;
      checkBtn.classList.remove('loading');
      checkBtn.textContent = 'Check Link';
    }
  }

  async function checkWithVirusTotal(url, apiKey) {
    // Submit URL to VirusTotal
    const submitResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
      method: 'POST',
      headers: {
        'x-apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ url })
    });

    if (!submitResponse.ok) {
      throw new Error(`VirusTotal submission failed: ${submitResponse.status}`);
    }

    // Wait a bit for processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the analysis
    const encodedUrl = btoa(url).replace(/=+$/, '');
    const analysisResponse = await fetch(`https://www.virustotal.com/api/v3/urls/${encodedUrl}`, {
      headers: { 'x-apikey': apiKey }
    });

    if (!analysisResponse.ok) {
      if (analysisResponse.status === 404) {
        return { status: 'unknown', message: 'URL not found in database' };
      }
      throw new Error(`VirusTotal analysis failed: ${analysisResponse.status}`);
    }

    const data = await analysisResponse.json();
    const stats = data.data.attributes.last_analysis_stats;
    
    return {
      status: 'analyzed',
      stats: stats,
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      total: Object.values(stats).reduce((a, b) => a + b, 0)
    };
  }

  function displayVirusTotalResult(result) {
  const { malicious, suspicious, total } = result;
  const scannedUrl = document.getElementById('urlInput').value.trim();
  const timestamp = new Date().toISOString();

  if (result.status === 'unknown') {
    showResult('unknown', '⚠️ Unknown', 
      'This URL has not been analyzed before.',
      'Proceed with caution and avoid entering sensitive information.');
    
    sendLogToServer(scannedUrl, 'unknown', timestamp);
    return;
  }

  let verdict = 'safe';
  if (malicious >= 2 || (malicious + suspicious) >= 3) {
    verdict = 'malicious';
    showResult('malicious', '🚨 Malicious Detected', 
      `${malicious} malicious, ${suspicious} suspicious out of ${total} scans`,
      'This link is potentially dangerous. Avoid clicking and use official sources instead.');
  } else {
    showResult('safe', '✅ Safe', 
      `${malicious} malicious, ${suspicious} suspicious out of ${total} scans`,
      'This link appears to be safe based on current analysis.');
  }

  sendLogToServer(scannedUrl, verdict, timestamp);
}
  function sendLogToServer(url, result, timestamp) {
  fetch('http://localhost:5000/api/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url,
      result,
      timestamp,
      userId: 'chrome-extension-user' // Optional: make dynamic later
    })
  }).then(res => res.json())
    .then(data => {
      console.log('Log saved to server:', data);
    })
    .catch(err => {
      console.error('Error sending log:', err);
    });
}


  function showResult(type, statusText, detailsText = '', recommendationText = '') {
    result.classList.remove('hidden');
    status.className = `status ${type}`;
    status.textContent = statusText;
    details.textContent = detailsText;
    recommendation.innerHTML = recommendationText;
  }

  function extractDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  }
});
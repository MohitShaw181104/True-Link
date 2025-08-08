// Content script to handle link checking on web pages

// Trusted domains
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

let tooltip = null;
let currentLink = null;

// Initialize
function init() {
  createTooltip();
  attachLinkListeners();
}

// Create tooltip element
function createTooltip() {
  tooltip = document.createElement('div');
  tooltip.id = 'safe-link-tooltip';
  tooltip.className = 'safe-link-tooltip hidden';
  document.body.appendChild(tooltip);
}

// Attach event listeners to all links
function attachLinkListeners() {
  document.addEventListener('mouseover', handleLinkHover);
  document.addEventListener('mouseout', handleLinkLeave);
  document.addEventListener('click', handleLinkClick, true);
}

// Handle link hover
function handleLinkHover(e) {
  const link = e.target.closest('a[href]');
  if (!link || !link.href) return;

  currentLink = link;
  showTooltip(link);
}

// Handle link leave
function handleLinkLeave(e) {
  const link = e.target.closest('a[href]');
  if (!link) {
    hideTooltip();
  }
}

// Handle link click
function handleLinkClick(e) {
  const link = e.target.closest('a[href]');
  if (!link || !link.href) return;

  const domain = extractDomain(link.href);
  if (!domain) return;

  // If it's a trusted domain, allow the click
  if (trustedDomains[domain]) {
    return;
  }

  // For external links, show confirmation
  if (isExternalLink(link.href)) {
    e.preventDefault();
    e.stopPropagation();
    showLinkConfirmation(link.href);
  }
}

// Show tooltip with link status
async function showTooltip(link) {
  const rect = link.getBoundingClientRect();
  const domain = extractDomain(link.href);
  
  if (!domain) return;

  tooltip.style.left = rect.left + 'px';
  tooltip.style.top = (rect.bottom + 5) + 'px';
  tooltip.classList.remove('hidden');

  if (trustedDomains[domain]) {
    tooltip.innerHTML = `
      <div class="tooltip-header safe">✅ Trusted Domain</div>
      <div class="tooltip-body">${domain}</div>
    `;
  } else {
    tooltip.innerHTML = `
      <div class="tooltip-header unknown">⚠️ External Link</div>
      <div class="tooltip-body">${domain}</div>
      <div class="tooltip-footer">Click to verify safety</div>
    `;
  }
}

// Hide tooltip
function hideTooltip() {
  if (tooltip) {
    tooltip.classList.add('hidden');
  }
  currentLink = null;
}

// Show link confirmation dialog
function showLinkConfirmation(url) {
  const domain = extractDomain(url);
  const confirmed = confirm(
    `You're about to visit an external link:\n\n${domain}\n\nThis link hasn't been verified as safe. Do you want to continue?\n\nClick "Cancel" to stay safe, or "OK" to proceed.`
  );
  
  if (confirmed) {
    // Open in new tab for safety
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// Check if link is external
function isExternalLink(url) {
  try {
    const linkDomain = new URL(url).hostname;
    const currentDomain = window.location.hostname;
    return linkDomain !== currentDomain;
  } catch {
    return false;
  }
}

// Extract domain from URL
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
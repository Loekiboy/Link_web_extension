document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('disableBtn');
  btn.addEventListener('click', function () {
    // Open the extension management page for this extension so the user can disable it.
    const id = chrome.runtime.id;
    const url = `chrome://extensions/?id=${id}`;
    // Try opening a new tab to the extensions page.
    if (chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url });
      btn.textContent = 'open extensiepagina…';
      btn.disabled = true;
    } else {
      // Fallback: open in the popup window (may be blocked), but still try.
      window.open(url, '_blank');
      btn.textContent = 'open extensiepagina…';
      btn.disabled = true;
    }
  });
});

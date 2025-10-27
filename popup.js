document.addEventListener('DOMContentLoaded', function () {
  const disableBtn = document.getElementById('disableBtn');
  const testBtn = document.getElementById('testBtn');

  const runtimeAvailable = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

  if (testBtn) {
    if (runtimeAvailable && chrome.tabs && chrome.tabs.create) {
      testBtn.addEventListener('click', function () {
        const url = chrome.runtime.getURL('test.html');
        chrome.tabs.create({ url }, function (tab) {
          const hasError = chrome.runtime && chrome.runtime.lastError;
          if (hasError || !tab || typeof tab.id !== 'number') {
            window.open(url, '_blank');
            return;
          }

          if (chrome.scripting && chrome.scripting.insertCSS) {
            chrome.scripting.insertCSS(
              {
                target: { tabId: tab.id },
                files: ['styles.css']
              },
              function () {
                if (chrome.runtime && chrome.runtime.lastError) {
                  window.open(url, '_blank');
                }
              }
            );
          }

          if (chrome.scripting && chrome.scripting.executeScript) {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                files: ['content.js']
              },
              function () {
                if (chrome.runtime && chrome.runtime.lastError) {
                  window.open(url, '_blank');
                }
              }
            );
          }
        });
      });
    } else {
      testBtn.addEventListener('click', function () {
        window.open('test.html', '_blank');
        testBtn.textContent = 'Opened test page preview';
        testBtn.disabled = true;
      });
    }
  }

  if (!disableBtn) {
    return;
  }

  if (!runtimeAvailable) {
    disableBtn.textContent = 'Open from the extension popup to disable';
    disableBtn.disabled = true;
    return;
  }

  disableBtn.addEventListener('click', function () {
    const url = `chrome://extensions/?id=${chrome.runtime.id}`;
    const openFallback = function () {
      window.open(url, '_blank');
      disableBtn.textContent = 'Opening extensions page…';
      disableBtn.disabled = true;
    };

    if (chrome.tabs && chrome.tabs.create) {
      try {
        chrome.tabs.create({ url }, function () {
          if (chrome.runtime && chrome.runtime.lastError) {
            openFallback();
          } else {
            disableBtn.textContent = 'Opening extensions page…';
            disableBtn.disabled = true;
          }
        });
      } catch (error) {
        openFallback();
      }
    } else {
      openFallback();
    }
  });
});

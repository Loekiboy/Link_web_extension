chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== 'link-web-extension-open-popup') {
    return;
  }

  const respond = (success, error) => {
    try {
      sendResponse({ success, error: error || null });
    } catch (err) {
      // ignore duplicate responses
    }
  };

  if (!chrome.action || !chrome.action.openPopup) {
    respond(false, 'action.openPopup unavailable');
    return true;
  }

  try {
    const result = chrome.action.openPopup();
    if (result && typeof result.then === 'function') {
      result
        .then(() => {
          respond(true);
        })
        .catch((error) => {
          const messageText = error && error.message ? error.message : 'Unable to open popup';
          respond(false, messageText);
        });
      return true;
    }
    respond(true);
  } catch (error) {
    const messageText = error && error.message ? error.message : 'Unable to open popup';
    respond(false, messageText);
  }

  return true;
});

/**
 * Content script to detect and convert plain text URLs to clickable links
 */

(function() {
  'use strict';

  const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  const skipTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'A', 'CODE', 'PRE']);

  let isEnabled = false;
  let observer = null;

  function resetPattern() {
    urlPattern.lastIndex = 0;
  }

  function announceStatus() {
    window.postMessage({
      type: 'link-web-extension-toggle-status',
      enabled: isEnabled
    }, '*');
  }

  function processTextNode(textNode) {
    if (!isEnabled) {
      return;
    }
    const text = textNode.nodeValue;
    resetPattern();
    const matches = text.match(urlPattern);

    if (!matches) {
      return;
    }

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    resetPattern();
    text.replace(urlPattern, function(match, p1, p2, p3, offset) {
      if (offset > lastIndex) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex, offset)));
      }

      const link = document.createElement('a');
      let url = match;

      if (match.startsWith('www.')) {
        url = 'http://' + match;
      }

      link.href = url;
      link.textContent = match;
      link.className = 'linkified-url';
      link.dataset.linkified = 'true';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      fragment.appendChild(link);
      lastIndex = offset + match.length;

      return match;
    });

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }

    if (fragment.childNodes.length > 0) {
      textNode.parentNode.replaceChild(fragment, textNode);
    }
  }

  function processElement(element) {
    if (!isEnabled) {
      return;
    }
    if (!element || skipTags.has(element.tagName)) {
      return;
    }

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          if (!node.parentElement) {
            return NodeFilter.FILTER_REJECT;
          }
          if (skipTags.has(node.parentElement.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (node.parentElement.closest('a')) {
            return NodeFilter.FILTER_REJECT;
          }
          resetPattern();
          if (urlPattern.test(node.nodeValue)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    const nodesToProcess = [];
    let node;

    while ((node = walker.nextNode())) {
      nodesToProcess.push(node);
    }

    nodesToProcess.forEach(processTextNode);
  }

  function unwrapLinks() {
    const links = document.querySelectorAll('a.linkified-url[data-linkified="true"]');
    links.forEach(function(link) {
      const textNode = document.createTextNode(link.textContent);
      link.replaceWith(textNode);
    });
  }

  function handleMutations(mutations) {
    if (!isEnabled) {
      return;
    }
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (!isEnabled) {
          return;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          processElement(node);
        } else if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
          resetPattern();
          processTextNode(node);
        }
      });
    });
  }

  function enableLinkify() {
    const body = document.body;
    if (!body) {
      setTimeout(enableLinkify, 50);
      return;
    }
    if (isEnabled) {
      announceStatus();
      return;
    }
    isEnabled = true;
    processElement(body);
    if (!observer) {
      observer = new MutationObserver(handleMutations);
    }
    observer.observe(body, {
      childList: true,
      subtree: true
    });
    announceStatus();
  }

  function disableLinkify() {
    if (!isEnabled) {
      return;
    }
    isEnabled = false;
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    unwrapLinks();
    announceStatus();
  }

  function init() {
    enableLinkify();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('message', function(event) {
    if (event.source !== window) {
      return;
    }
    const data = event.data;
    if (!data || typeof data !== 'object') {
      return;
    }
    if (data.type === 'link-web-extension-toggle') {
      if (data.action === 'enable') {
        enableLinkify();
      } else if (data.action === 'disable') {
        disableLinkify();
      }
    } else if (data.type === 'link-web-extension-open-popup') {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        try {
          chrome.runtime.sendMessage({ type: 'link-web-extension-open-popup' }, function(response) {
            const runtimeError = typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime.lastError : null;
            const success = response && response.success && !runtimeError;
            const errorMessage = runtimeError ? runtimeError.message : (response && response.error) || '';
            window.postMessage({
              type: 'link-web-extension-popup-result',
              success: Boolean(success),
              error: errorMessage || null
            }, '*');
          });
        } catch (error) {
          window.postMessage({
            type: 'link-web-extension-popup-result',
            success: false,
            error: error && error.message ? error.message : 'sendMessage-failed'
          }, '*');
        }
      } else {
        window.postMessage({
          type: 'link-web-extension-popup-result',
          success: false,
          error: 'runtime-unavailable'
        }, '*');
      }
    } else if (data.type === 'link-web-extension-request-status') {
      announceStatus();
    }
  });
})();

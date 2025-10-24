/**
 * Content script to detect and convert plain text URLs to clickable links
 */

(function() {
  'use strict';

  // Regular expression to match URLs in text
  // Matches http://, https://, ftp://, and www. URLs
  const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

  // Elements to skip when processing text nodes
  const skipTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'A', 'CODE', 'PRE']);

  /**
   * Process a text node and replace URLs with clickable links
   */
  function processTextNode(textNode) {
    const text = textNode.nodeValue;
    const matches = text.match(urlPattern);
    
    if (!matches) {
      return;
    }

    // Create a temporary container to build the new content
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    
    // Replace each URL match with an actual link
    text.replace(urlPattern, function(match, p1, p2, p3, offset) {
      // Add text before the URL
      if (offset > lastIndex) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex, offset)));
      }
      
      // Create the link element
      const link = document.createElement('a');
      let url = match;
      
      // Add protocol if missing (for www. URLs)
      if (match.startsWith('www.')) {
        url = 'http://' + match;
      }
      
      link.href = url;
      link.textContent = match;
      link.className = 'linkified-url';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      fragment.appendChild(link);
      lastIndex = offset + match.length;
      
      return match;
    });
    
    // Add remaining text after the last URL
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }
    
    // Replace the text node with the fragment containing links
    if (fragment.childNodes.length > 0) {
      textNode.parentNode.replaceChild(fragment, textNode);
    }
  }

  /**
   * Walk through all text nodes in an element and process them
   */
  function processElement(element) {
    // Skip certain elements
    if (skipTags.has(element.tagName)) {
      return;
    }

    // Process all child nodes
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip if parent is in the skip list
          if (skipTags.has(node.parentElement.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Skip if already processed or inside a link
          if (node.parentElement.closest('a')) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Only accept nodes with URLs
          if (urlPattern.test(node.nodeValue)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    const nodesToProcess = [];
    let node;
    
    // Collect all text nodes first (to avoid issues with DOM modifications)
    while (node = walker.nextNode()) {
      nodesToProcess.push(node);
    }
    
    // Process each text node
    nodesToProcess.forEach(processTextNode);
  }

  /**
   * Initialize the extension
   */
  function init() {
    // Process the entire document
    processElement(document.body);
    
    // Observe for dynamic content changes
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            processElement(node);
          } else if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
            // Reset regex lastIndex
            urlPattern.lastIndex = 0;
            processTextNode(node);
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

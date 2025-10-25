# Link Web Extension

A browser extension that automatically converts plain-text URLs on websites into clickable links.

## Features

- Automatically detects plain-text URLs on webpages
- Converts detected URLs into clickable anchors
- Supports http://, https://, ftp://, and www. patterns
- Works with dynamic content injected after page load
- Lightweight and efficient

## Installation

### Chrome / Edge

1. Download or clone this repository.
2. Open Chrome or Edge and browse to `chrome://extensions/` (or `edge://extensions/`).
3. Enable **Developer mode** (top-right corner).
4. Click **Load unpacked**.
5. Select the folder containing these extension files.

### Firefox

1. Download or clone this repository.
2. Open Firefox and navigate to `about:debugging`.
3. Click **This Firefox**.
4. Click **Load Temporary Add-on**.
5. Select the `manifest.json` file from the extension directory.

## Usage

After installation the extension works automatically on every site you visit. Plain-text URLs are detected and turned into clickable links without requiring any interaction.

Examples of URLs that are recognized:
- `https://www.example.com`
- `http://example.com/path`
- `www.example.com`
- `ftp://files.example.com`

## Technical details

The extension consists of:
- `manifest.json` – Extension configuration
- `content.js` – Script that detects and transforms URLs
- `styles.css` – Styling applied to generated links
- `icons/` – Extension icons

## License

MIT
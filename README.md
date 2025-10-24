# Link Web Extension

Een browserextensie die automatisch alle URL's in platte tekst op websites klikbaar maakt.

## Functies

- Detecteert automatisch URL's in platte tekst op webpagina's
- Converteert gevonden URL's naar klikbare links
- Ondersteunt http://, https://, ftp:// en www. URL's
- Werkt met dynamische content die na het laden wordt toegevoegd
- Lichtgewicht en efficiënt

## Installatie

### Chrome/Edge

1. Download of clone deze repository
2. Open Chrome/Edge en ga naar `chrome://extensions/` (of `edge://extensions/`)
3. Schakel "Ontwikkelaarsmodus" in (rechtsboven)
4. Klik op "Uitgepakte extensie laden"
5. Selecteer de map met de extensiebestanden

### Firefox

1. Download of clone deze repository
2. Open Firefox en ga naar `about:debugging`
3. Klik op "Deze Firefox"
4. Klik op "Tijdelijke add-on laden"
5. Selecteer het `manifest.json` bestand uit de extensiemap

## Gebruik

Na installatie werkt de extensie automatisch op alle websites. URL's in platte tekst worden automatisch gedetecteerd en omgezet in klikbare links.

Voorbeelden van URL's die worden gedetecteerd:
- `https://www.example.com`
- `http://example.com/path`
- `www.example.com`
- `ftp://files.example.com`

## Technische details

De extensie bestaat uit:
- `manifest.json` - Extensie configuratie
- `content.js` - Hoofdscript dat URL's detecteert en omzet
- `styles.css` - Styling voor de gegenereerde links
- `icons/` - Extensie iconen

## Licentie

MIT
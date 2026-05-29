# 📌 Post-it que?

A browser-based sticky note app with a Windows 95 aesthetic. No frameworks, no build step — just HTML, CSS, and vanilla JavaScript. All data lives in `localStorage`.

![screenshot placeholder](./screenshot.png)

---

## Features

- **Multiple boards** — create, rename, reorder (drag-and-drop), and delete boards via the tab bar
- **Rich post-its** — bold, italic, underline, bullet lists, and inline image pasting
- **Full color picker** — HSL sliders + hex input + 12 quick presets
- **Drag to reposition** — move notes freely around the board; positions are auto-saved
- **Inline editing** — click the ✎ button on any note to edit title and body in place, with a mini formatting toolbar
- **Search** — live search across all boards with keyword highlighting; click a result to jump to that note
- **Persistent storage** — Save button writes everything to `localStorage`; unsaved changes blink a warning indicator
- **Keyboard shortcuts** — `N` opens the new note panel; `Ctrl+S` saves; `Ctrl+B/I/U` for formatting; `Esc` closes search or edit mode

---

## Project structure

```
post-it-que/
├── index.html      # App shell and markup
├── style.css       # All styles — Win95 design system, layout, components
├── script.js       # All logic — boards, notes, drag, search, color picker, storage
├── W95FA.otf       # Windows 95 FA bitmap font
├── save.png        # Toolbar save icon
├── search.png      # Toolbar search icon
├── close.png       # Board close icon (unused in current build, kept for compat)
└── edit.png        # Post-it edit icon (unused in current build, kept for compat)
```

> Note: The app references `./close.png` and `./edit.png` via the old build. The current version renders close (✕) and edit (✎) as text characters, so those images can be omitted.

---

## How to run

No build step needed. Just open `index.html` in a browser:

```bash
# Option 1 — open directly
open index.html

# Option 2 — local server (avoids any file:// quirks)
npx serve .
# or
python3 -m http.server 8080
```

---

## How to use

| Action | How |
|---|---|
| New note | Click **+ New Note** (top-right of board) or press `N` |
| Edit note | Click the **✎** button in the note's title bar |
| Delete note | Click the **✕** button in the note's title bar |
| Move note | Click and drag the note body |
| New board | Click **+** in the tab bar |
| Rename board | Click the active board's tab name |
| Reorder boards | Drag a tab left or right |
| Search | Click **Search** in the toolbar; type to search live |
| Save | Click **Save** or press `Ctrl+S` |

---

## Storage

Everything is stored in `localStorage` under two keys:

- `permanentContainer` — JSON object keyed by board ID, containing all note data (title, HTML content, color, x/y position)
- `boardOrder` — JSON array of board IDs in display order
- `lastActiveBoard` — ID of the last active board, restored on reload

Clearing site data in your browser will erase all notes.

---

## Browser support

Tested in Chrome and Firefox. Uses `document.execCommand` for rich text formatting (deprecated but universally supported). No polyfills required.

---

## Background

Built as a self-teaching project to practice vanilla DOM manipulation, drag-and-drop, `localStorage` persistence, and CSS layout — no libraries, no frameworks. The retro Windows 95 aesthetic is intentional: the chunky beveled borders, bitmap font (`W95FA`), and CRT scanline overlay are all hand-rolled in CSS.

---

## License

MIT — do whatever you like with it.

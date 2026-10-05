# Kinderwelt

A small, browser based collection of creative learning activities for children ages 4–6. The first version has no backend, accounts, tracking, ads, or external assets. Its production build caches app files for offline use after the first online load.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. For a production build, run `npm run build`.

## Activities

- **Malen / Draw:** freehand canvas, colors, brush sizes, undo, clear, and a local picture gallery.
- **Ausmalen / Color:** three tap-to-color SVG pictures. Coloring is remembered on the device.
- **Buchstaben / Letters:** A–Z, browser speech, a matching question, and a tracing pad.
- **Zahlen / Numbers:** 1–10, counting questions, browser speech, and a tracing pad.

All four activities live inside one React app so a play session and timer continue as the child moves between them. Each activity has its own component under `src/tools`. Shared UI and functionality live under `src/shared`. German and English text is centralized in `src/shared/i18n.ts`.

## Parent controls and local data

On first use, a parent creates a four digit PIN and chooses a 5, 10, 20, or 30 minute session. The same countdown applies to every activity. The deadline is stored locally, so reloading the page does not reset it. When it expires, activities are replaced by a break screen. The PIN is stored as a salted SHA-256 hash in local browser storage. It is a child facing gate, not a device security feature.

Preferences, the timer deadline, and coloring progress use `localStorage`. Saved drawings use `IndexedDB`. Data stays in this browser profile; clearing site data removes it. Letter and number audio uses the browser's speech synthesis, so voice availability and pronunciation depend on the device. The activities remain usable with sound off.

The parent area has an optional browser full screen button where the browser supports it. Full screen display does not prevent leaving the browser. A parent can use the device's Guided Access or screen pinning features for that purpose.

## Adding an activity

Create a new component in `src/tools`, add its display text to both languages in `src/shared/i18n.ts`, and register its card and component in `src/App.tsx`. Keep child facing controls large and use shared parent session settings rather than a per-tool timer.

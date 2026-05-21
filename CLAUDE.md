# Shabtai's Teaching Tools

A collection of small, hands-on tools used in courses. Built as a single Astro site that **vendors in** each tool — every tool lives in this repo (not iframed from elsewhere), shares one Tailwind setup, and gets its own page under `/tools/<slug>`.

## Stack

- **Astro 6** (static output)
- **React 19** via `@astrojs/react` — every tool mounts with `client:only="react"`
- **Tailwind v4** via `@tailwindcss/vite` — shared `src/styles/global.css`, theme tokens defined under `@theme`
- Per-tool deps as needed (konva, three/r3f, zustand, etc.) — installed at the root

## Project layout

```
src/
  data/tools.ts              # Single source of truth: categories + tools
  layouts/Layout.astro       # Sidebar + content shell
  components/Sidebar.astro
  pages/
    index.astro              # Home (reads from registry)
    tools/
      [slug].astro           # Stub for tools with status: 'coming-soon'
      <slug>.astro           # One file per live tool (overrides the dynamic stub)
  styles/global.css          # Tailwind import + design tokens
  tools/
    <slug>/                  # Vendored source for each tool
      index.jsx              # Thin wrapper: renders <App /> inside <div className="<slug>-root">
      App.jsx                # Original tool entry (lightly modified)
      ...                    # Original components, stores, utils
```

## Adding a new tool

1. **Register it** in `src/data/tools.ts` — add to an existing category or create a new one. Start with `status: 'coming-soon'` so the dynamic `[slug].astro` route serves a placeholder.

2. **Vendor the source.** Clone the original repo and copy its `src/` into `src/tools/<slug>/`. Drop `main.jsx`/`index.js` (the entry point is replaced by our wrapper) and any `index.html`.

3. **Install extra deps** at the project root (`npm install <pkg>`).

4. **Scope the tool's CSS** — see "CSS scoping" below. Most ports require this.

5. **Create the wrapper** `src/tools/<slug>/index.jsx`:
   ```jsx
   import './tool.css';  // if the tool has its own CSS
   import App from './App.jsx';
   export default function MyTool() {
     return <div className="<slug>-root"><App /></div>;
   }
   ```

6. **Create the page** `src/pages/tools/<slug>.astro` — mount with `client:only="react"`. Use the standard "card in a container" layout for contained tools, or the `h-screen` flex layout for fullscreen/canvas tools (see existing pages for templates).

7. **Flip the registry** entry to `status: 'live'`. The sidebar, index, and `[slug].astro`'s filter all update automatically — the explicit `<slug>.astro` page takes precedence over the dynamic stub.

8. **Rebuild and verify**: `npm run build` to type-check / catch issues, then `npm run dev` to test in the browser.

## CSS scoping (avoiding collisions)

**Tailwind utilities are safe** — they're idempotent, no collision risk. The danger is *semantic class names* that tools bring with them (`.card`, `.btn`, `.export-btn`, etc.).

**The convention:** every tool gets a root wrapper `<div className="<slug>-root">` and every non-Tailwind selector in its CSS is prefixed with that class.

Mechanical rewrite of a vendored CSS file:

| Original                          | Rewritten                                          |
|-----------------------------------|----------------------------------------------------|
| `.foo { ... }`                    | `.<slug>-root .foo { ... }`                        |
| `body { margin: 0; ... }`         | **delete** (would clobber the site)                |
| `* { box-sizing: border-box }`    | `.<slug>-root *, .<slug>-root *::before, ...`      |
| `@import "tailwindcss";`          | **delete** (we import it globally)                 |
| `100vh` / `100vw`                 | `100%` (sized to the tool's container, not the viewport) |
| `position: fixed`                 | `position: absolute` (relative to `.<slug>-root`)  |
| `calc(100vh - X)`                 | `calc(100% - X)`                                   |

`@media (prefers-color-scheme: dark)` rules are safe to keep — they're already scoped under the tool root and won't affect the rest of the site.

## Fullscreen / canvas tools

Tools built as single-page apps (`<Stage width={window.innerWidth} ...>`, fixed-position panels) need extra work:

- **Container-relative sizing:** replace `window.innerWidth/innerHeight` + window resize listeners with a `containerRef` + `ResizeObserver`. Initialize dimensions to `{ width: 0, height: 0 }` (not a fallback like 800×600 — the fallback will trigger any "fit on first measurement" logic before the real size arrives).
- **Use the `h-screen` page layout** so the tool fills viewport minus sidebar (see `tools/logic-gates.astro`).
- **Vite is stricter than CRA** about JSX-in-`.js` files. Rename any `App.js` containing JSX to `App.jsx`.

## After adding new dependencies

Restart `npm run dev` and hard-reload the browser. Vite caches dependency optimization, and a running dev server won't pick up new packages cleanly. If you see `Failed to fetch dynamically imported module: @astrojs/react/dist/client.js` (or similar), that's the symptom — fix:

```bash
rm -rf node_modules/.vite .astro
npm run dev
```

## Categories

The site groups tools under one-level categories defined in `src/data/tools.ts`. Current categories:

- **Photography and Computation** — Abacus, Perceptron, Logic Gates, Image Displacer
- **Digital Photo Lab** — (planned)

To add a category, append to the `categories` array. Empty categories render as "nothing here yet" in both sidebar and index — fine for placeholders.

## Conventions

- **No tracking, no logins, no analytics.** Site is meant for classroom + at-home student use.
- **Sans-serif body font** (Inter, defined in `global.css`). Monospace token is available via `--font-mono` if a tool wants it for code-style accents.
- **Tools should be self-contained on their page.** No cross-tool linking, no shared chrome beyond layout + breadcrumb.
- **Original tool source stays nearly untouched.** Modifications are limited to: import paths (`@/` → relative), CSS scoping, container sizing for fullscreen apps. The wrapper component absorbs everything else.

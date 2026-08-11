# Pro Studio

A browser-based 3D room layout editor. Pro Studio loads a furnished room as a GLB scene and lets you walk through it, rearrange furniture, restyle materials, and share the result — all client-side, no backend required.

Built with **React 19**, **Three.js** / **react-three-fiber**, and **Zustand**.

## Features

### Navigation & camera
- **First-person walkthrough** — look around with left-drag, pan with right-drag, move with the scroll wheel or `W A S D`.
- **Orbit and top-down (floor plan) modes**, switchable from the View menu.
- **Camera presets** — jump to Overview, Kitchen, Living, or Dining vantage points with a smooth animated flight between positions.
- **Camera settings popover** — fine-tune height, viewing angle (pitch), and field of view (shown as an equivalent focal length in mm).
- Camera movement is clamped to stay within the room bounds.

### Furniture & scene editing
- **Catalog sidebar** — browse available furniture pieces (parsed from the scene's product templates) and add them to the room with one click.
- **Architecture panel** — select fixed elements (walls, floor) to restyle them separately from furniture.
- **Transform gizmo** — move (`G`) or rotate (`R`) the selected object directly in the 3D view, plus a numeric panel for precise position/rotation/scale entry.
- **Duplicate** (`Ctrl/Cmd+D`) and **delete** (`Delete`/`Backspace`) objects.
- **Snap-to-surface** — pick a target object or the floor to snap the selected item onto it.
- **Collision detection** between placed objects.
- **Undo / redo** with up to 100 steps of history (`Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`).

### Materials & lighting
- **Material editor** — per-object color picker, roughness, and metalness sliders for every material on the selected item.
- **Day / Night lighting modes** with an independent toggle for light fixtures (e.g. pendant lights).

### Saving & sharing
- **Save / load layouts** to the browser's local storage.
- **Shareable links** — encode the entire layout and lighting state into a URL you can copy and send; opening it restores the exact scene.
- **Screenshot export** — download a PNG of the current 3D view.

### Interface
- Light / dark / system **theme toggle**.
- Built-in **keyboard shortcuts help menu**.

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| Click | Select an object |
| Left drag | Look around |
| Right drag | Pan the camera |
| Scroll | Move forward / back |
| `W A S D` | Walk |
| `G` | Move tool |
| `R` | Rotate tool |
| `Ctrl`/`⌘` `D` | Duplicate selection |
| `Delete` | Delete selection |
| `Ctrl`/`⌘` `Z` | Undo |
| `Ctrl`/`⌘` `⇧` `Z` | Redo |
| `Esc` | Cancel snap-to picking |

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for dev server and bundling
- [three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), and [@react-three/drei](https://github.com/pmndrs/drei) for the 3D scene
- [Zustand](https://zustand-demo.pmnd.rs/) for state management (scene objects, camera, undo/redo history)
- [Tailwind CSS v4](https://tailwindcss.com/) with [shadcn](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/) components
- [react-colorful](https://github.com/omgovich/react-colorful) for material color pickers
- [lucide-react](https://lucide.dev/) icons
- [oxlint](https://oxc.rs/) for linting

## Getting started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Lint the codebase:

```bash
npm run lint
```

## Deployment

The app deploys to GitHub Pages via [gh-pages](https://github.com/tschaub/gh-pages):

```bash
npm run deploy
```

This runs `npm run build` first (via `predeploy`) and publishes the `dist/` folder.

## Project structure

```
src/
  components/     UI panels, toolbar, canvas, and 3D scene components
  lib/            Scene parsing, persistence, share links, collision, screenshots
  store/          Zustand stores (scene objects, camera, theme, registries)
  types.ts        Shared TypeScript types
public/models/    The GLB scene asset (room + furniture)
```

The 3D scene is authored as a single GLB file. Top-level nodes named `Room_*` or `Wall_*` are treated as fixed architecture; every other top-level node becomes a catalog item that can be placed, duplicated, and restyled.

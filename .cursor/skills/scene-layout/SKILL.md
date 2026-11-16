---
name: scene-layout
description: Lay out the Martian Odyssey Phaser scene so it fits phones (375 px) through desktop, stays sharp, and has child-sized touch targets without hiding the choice cards. Use when changing Phaser scale settings, scene size, module positions, tap areas, or the page layout around the canvas.
---

# Scene layout

Plan: `.cursor/plans/new_game_layout_4b40858c.plan.md` (P1.4, P3.5, P3.6). Only implement a roadmap phase after the user explicitly says to.

## Page layout

- Phones: scene on top, choice cards below, page scrolls vertically. Desktop: scene above the cards at full content width.
- The canvas never covers or replaces the choice cards; cards are the accessible controls.
- No horizontal scroll at 375 px: `document.documentElement.scrollWidth <= 375`.
- Cap the scene height (about 45% of the viewport on phones) so at least one card is visible without scrolling.

## Phaser scale settings (in `src/scene/config.ts`)

- Use a fixed design size in game units (for example 960x540 landscape) with the Scale Manager in FIT mode and centred, parented to a container whose width is set by CSS.
- For portrait phones, either keep FIT (letterboxed) or switch module positions using a second layout in `config.ts`; never compute positions from magic numbers inside the scene.
- Keep the canvas sharp on high-density screens: render at device pixel ratio or use crisp vector-like art; check on a 2x screen.
- Re-layout on the Scale Manager `resize` event, not on `window.resize`.

## Touch targets

- Any tappable module must be at least 48x48 CSS pixels on screen at 375 px width. Game units are not CSS pixels: tap size on screen = game size x (displayed width / design width). Enlarge the hit area (not the art) when needed.
- Tapping a module only highlights the related cards; it never commits a choice.
- Every tap target in the canvas has a matching real button outside it (the cards), so keyboard and screen-reader players lose nothing.

## Verify

- `scene-verify` screenshots at 375x812 and 1280x800.
- Measure tap areas with the browser bounding boxes of the canvas and the known design size.
- Rotate a phone (or emulate) portrait and landscape: nothing is cut off, cards remain reachable.

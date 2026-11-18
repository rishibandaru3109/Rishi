# Motion redesign progress

## Milestone 1 — Scroll-driven hero

- Rebuilt the opening around a pinned hero, a projected 3D knot, and a particle wordmark. The sculpture responds to scroll and pointer movement.
- The external npm registry returned ENOTFOUND. The scene engine uses native browser APIs, canvas, and CSS. The particle and dither effects are local implementations.

## Milestone 2 — One-page portfolio and verification

- Moved all three case studies and demos into the homepage. Removed the separate case-study route. Retained the original artwork, project facts, contact details, and playground tools.
- Added different scroll choreography for STEREO, Viral Machine, and AirUPI, and a reversible sequence for the about, playground, and contact scenes.
- Rebuilt the gravity experiment with a full-width arena, visible floor, bumpers, and draggable shapes.
- Production build and standalone TypeScript checks passed. The build hit intermittent generated-directory EPERM errors in the Windows sandbox and passed on retry.
- Chromium at 1440 × 900 and 390 × 844 captured all seven scenes at 0%, 25%, 50%, 75%, and 100%. Reverse scrolling restored each previously measured transform. The contact, project demo, lab, keyboard, and reduced-motion checks passed.
- Chromium loaded the actual static export through Playwright request routing because the sandbox denied the localhost connection. Start the local server using the README instructions.

The captures and comparison sheets are under `qa/motion`. Next step: preview on a physical device or commit the source using the README commands.

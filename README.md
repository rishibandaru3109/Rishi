# Rishi Bandaru — The Digital Playground

The portfolio is a single statically exported Next.js page. Project details, demonstrations, about, experiments, and contact are all reachable through page anchors.

## Preview on Windows

From the project folder, with the dependencies already installed:

```powershell
npm.cmd run build
python -m http.server 4173 --bind 127.0.0.1 --directory .next-build
```

Open http://127.0.0.1:4173/. Keep the PowerShell window open. Stop the server with Ctrl+C. On a fresh checkout, install dependencies with `npm.cmd ci`. Use `npm.cmd run dev` for editing and open the local URL printed by Next.js.

## Edit the portfolio

- Edit `data/site.ts` for personal information and project content. See `RESEARCH.md` for project evidence.
- Update project artwork in `public/art`. The local canvas dither effect lives in `components/VisualEffects.tsx`.
- Scroll progress is calculated in `components/ScrollExperience.tsx`. Scene distances and transforms live in `app/motion.css`. The projected hero sculpture is in `components/SignalKnot.tsx`.
- `qa/smoke.cjs` exercises the production page with Playwright. Set `PORTFOLIO_CHROME` to an installed Chromium executable if needed. Set `PORTFOLIO_CAPTURES` to an output directory to capture the scroll checkpoints. To test directly from the static export without a listening socket, set `PORTFOLIO_EXPORT=1`.

## Deploy on Vercel

Import the project repository, select the Next.js preset, and use `npm ci` for install and `npm run build` for build. Set the output directory to `.next-build`. If the project is inside a larger repository, set the Vercel root to `digital-playground`. The portfolio needs no environment variables.

## First Git commit

The workspace already has a Git repository. Review the staged source before committing:

```powershell
git status --short
git add -- .gitignore app components data public qa/smoke.cjs components.json next.config.ts package.json package-lock.json tsconfig.json next-env.d.ts README.md PROGRESS.md COMPONENTS.md RESEARCH.md
git diff --cached --stat
git commit -m "Build scroll-driven digital playground"
```

See `PROGRESS.md` for verification status.

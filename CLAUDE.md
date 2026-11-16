# Wedding Timeline Builder

Create React App (React 18, JavaScript) that lets wedding clients build a
day-of timeline from template blocks. Owner: Media Potion.

Before working, read:

- [docs/HANDOFF.md](docs/HANDOFF.md) — current state, how to run, working rules
- [docs/ROADMAP.md](docs/ROADMAP.md) — the improvement plan and open decisions
- [docs/NOTES.md](docs/NOTES.md) — code map, confirmed problems, gotchas

Commands (npm, Node 18):

- Run: `npm start` (http://localhost:3000)
- Test: `CI=true npm test -- --watchAll=false`
- Build: `npm run build`

Rules:

- One roadmap phase per branch and pull request; do not commit to `main`.
- Timing and save/load changes in `src/lib/` need tests.
- Verify UI at 1366×800 and 375×812 (the desktop/phone breakpoint is 901 px).
- Old saved `.json` files must keep loading; bump `PROJECT_VERSION` and migrate.
- Event block names are lookup keys; search `src/` before renaming one.
- Update the three docs when a roadmap item lands or a new finding appears.

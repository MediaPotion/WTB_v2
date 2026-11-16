# Handoff

Last updated 2026-11-15, after the usability assessment. Read this first, then
[ROADMAP.md](ROADMAP.md) for what to build and [NOTES.md](NOTES.md) for evidence
and code references.

## What this app is

Wedding Timeline Builder, by Media Potion (photo and video). Couples build the
schedule for their wedding day from template blocks, each with a typical
duration (for example "Family photos, 5 groups — 20 min"). The studio, wedding
planners and other photographers or videographers need to see and adjust the
same timeline.

The owner's complaint: clients find it confusing. The assessment agreed and
traced it to three causes — no starting draft, the app leaves the time
arithmetic to the client, and nothing is shared.

## Where things stand

- **Code:** local `main` matches GitHub (`MediaPotion/WTB_v2`). The app code is
  the 2026-07-17 version (commit `7d4aed6`); nothing newer exists on GitHub.
- **Phase 0 is on branch `phase-0/housekeeping`** (not merged, not pushed).
  See the status under Phase 0 in ROADMAP. `main` still has only these
  documents and `CLAUDE.md` on top of the 2026-07-17 app code.
- **Dependencies are installed** (`node_modules`, via `npm ci`, Node 18).
- **It runs:** `npm start` serves the app; `npm run build` succeeds.
- **Tests:** on `main`, 5 of 7 pass; on the Phase 0 branch all pass.
- **Old local prototype** is preserved on the branch
  `backup/codesandbox-prototype`.

## Run it

```bash
npm start
```

Opens on http://localhost:3000. Or double-click
`Launch Wedding Timeline Builder.command`.

```bash
CI=true npm test -- --watchAll=false
```

```bash
npm run build
```

To see the phone layout, make the window narrower than 901 px.

## What to do next

1. **Phase 0** (ROADMAP) — four small fixes. Start with 0.1; it makes the test
   suite green and unblocks Phase 3.
2. **Phase 1** — timing. This is the core fix. Get the owner's answer on
   decision D1 (events that happen at the same time) before writing code.
3. **Phase 2** — adding and editing events.
4. **Phase 3**, then **Phase 4**, each after its open decision is settled.

## Decisions waiting on the owner

Listed with recommendations at the end of ROADMAP: D1 parallel events,
D2 wizard or quick-start, D3 where shared timelines live, D4 package manager,
D5 how the site is deployed.

## Working rules for this repo

- One roadmap phase per branch and pull request; never commit straight to `main`.
- Write or update a test for any change to timing or save/load logic
  (`src/lib/`), and run the suite before calling something done.
- Check UI changes in the browser at 1366×800 and 375×812.
- Saved client files must keep loading. If the save format changes, bump
  `PROJECT_VERSION` and migrate old files on load.
- Event block names are lookup keys — see NOTES "Gotchas" before renaming any.
- `hostinger/send-timeline.php` only takes effect when the owner uploads it.
- Keep these three documents current: tick off roadmap items, add new findings
  to NOTES, update "Where things stand" here.

## Starting a new chat

Open the new chat in this folder and paste:

> Read docs/HANDOFF.md, docs/ROADMAP.md and docs/NOTES.md. Then start Phase 0
> of the roadmap on a new branch, beginning with item 0.1. Tell me your plan
> before changing anything.

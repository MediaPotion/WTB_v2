# Handoff

Last updated 2026-11-16, after all roadmap phases were built. Read this first, then
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

- **Code:** local `main` matches GitHub (`MediaPotion/WTB_v2`): the 2026-07-17
  app code plus these documents. **All roadmap work is on local branches,
  not pushed and not merged.** Each is built on the one before, so merge
  them in this order:

| Order | Branch | What | Tests |
|---|---|---|---|
| 1 | `phase-0/housekeeping` | 0.1–0.4 (D4: npm only) | 10 |
| 2 | `phase-2/adding-editing` | 2.1–2.6, proposed labels | 24 |
| 3 | `phase-1/timing` | 1.1–1.5 (D1 as recommended) | 51 |
| 4 | `phase-3/quick-start` | 3.1–3.3 (D2 as recommended) | 58 |
| 5 | `phase-4/sharing` | 4.1–4.5 (D3 as recommended), switched off until set up | 70 |
| 6 | `phase-2.7/labels` | 2.7 — merging it approves the labels | 71 |

  Phase 2 went before Phase 1 because Phase 1's timing decision (D1) was
  still open when Phase 2 was built.
- **Decisions taken without the owner** (the owner asked for everything to be
  built): D1, D2, D3 as the roadmap recommended, D4 = npm. Each lives on its
  own branch, so it can be dropped before merging. **D5 (live address) is
  still open**; it blocks switching on sharing and the send endpoint's
  origin check.
- **Not run:** the PHP files (no PHP on this machine). `send-timeline.php`
  changed in Phases 0 and 4; `timeline-api.php` is new. Sharing was tested
  against `scripts/dev-timeline-api.js`, a Node stand-in.
- **Dependencies are installed** (`node_modules`, via `npm ci`, Node 18).
- **It runs:** `npm start` serves the app; `npm run build` succeeds on every
  branch.
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

1. **Owner review.** Try each branch (`git checkout <branch>`, `npm start`),
   confirm or change D1–D3 and the labels, then merge in the order above.
   `gh` is not installed, so push the branches and open the pull requests
   on GitHub, or install `gh`.
2. **Decide D5** (where the live site is). Then upload the PHP files and set
   up sharing (below), and fill in `ALLOWED_ORIGINS` in `send-timeline.php`.
3. Phase 5 ideas remain unscheduled.

## Setting up sharing (Phase 4)

Needs the live site's address (D5) and access to Hostinger.

1. hPanel → Databases → MySQL: create a database and a user.
2. Copy `hostinger/timeline-config.example.php` to `timeline-config.php`,
   fill in the database details and the site address in `allowed_origins`.
   Never commit it (it is in `.gitignore`).
3. Upload `timeline-api.php` and `timeline-config.php` to the same folder as
   `send-timeline.php` (e.g. `public_html/wtb/`), and re-upload
   `send-timeline.php` (it now includes the link).
4. Build the app with the API address, then deploy `build/`:

```bash
REACT_APP_TIMELINE_API=https://weddingpotion.com/wtb/timeline-api.php npm run build
```

5. Check: create a timeline, click Share, open both links in another browser.

## Decisions waiting on the owner

Listed at the end of ROADMAP. D1–D3 were built as recommended and need the
owner's confirmation; D4 is done (npm); D5 (how and where the site is
deployed) is still open.

## Working rules for this repo

- One roadmap phase per branch and pull request; never commit straight to `main`.
- Write or update a test for any change to timing or save/load logic
  (`src/lib/`), and run the suite before calling something done.
- Check UI changes in the browser at 1366×800 and 375×812.
- Saved client files must keep loading. If the save format changes, bump
  `PROJECT_VERSION` and migrate old files on load.
- Event block names are lookup keys — see NOTES "Gotchas" before renaming any.
- The `hostinger/` PHP files only take effect when the owner uploads them.
- Keep these three documents current: tick off roadmap items, add new findings
  to NOTES, update "Where things stand" here.

## Starting a new chat

Open the new chat in this folder and paste:

> Read docs/HANDOFF.md, docs/ROADMAP.md and docs/NOTES.md. Then pick up the
> next item under "What to do next". Tell me your plan before changing
> anything.

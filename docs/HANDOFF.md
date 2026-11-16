# Handoff

Last updated 2026-11-16, after all roadmap phases were merged. Read this first, then
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

- **Code:** **every roadmap phase (0–4 and 2.7) is merged into `main`** on
  GitHub (`MediaPotion/WTB_v2`, pull requests #1–#7, 2026-11-16). 71 tests
  pass and the build succeeds on `main`. The merged phase branches are still
  on GitHub and can be deleted; everything in them is in `main`.
- **Decisions:** all settled. The owner merged D1, D2 and D3 as the roadmap
  recommended, the 2.7 labels, and D4 (npm). D5: the owner confirmed the
  live app is **https://wtb-v2.vercel.app** (Vercel project `wtb-v2`, which
  redeploys whenever `main` changes).
- **Live now:** everything except sharing, which waits for the Hostinger
  setup below. "Send to Media Potion" still goes through the old
  `send-timeline.php` on the server until the new one is uploaded.
- **Vercel:** pull requests also build previews in four other projects
  (`wedding-timeline`, `wtb-v2-4b6h`, `wtb-v2-e5gv`, `wtb-v2-gqrf`). Only
  `wtb-v2` is the live one.
- **Not run:** the PHP files (no PHP on this machine). `send-timeline.php`
  changed in Phases 0 and 4; `timeline-api.php` is new. Sharing was tested
  against `scripts/dev-timeline-api.js`, a Node stand-in.
- **Dependencies are installed** (`node_modules`, via `npm ci`, Node 18).
- **It runs:** `npm start` serves the app; `npm run build` succeeds.
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

1. **Set up sharing** (below). The PHP has never been run, so try a shared
   timeline end to end on the live site before telling clients.
2. **Upload the new `send-timeline.php`** (rate limit, file checks, origin
   check, link in the email). It only accepts sends from
   https://wtb-v2.vercel.app, so a local `npm start` can no longer send.
3. Optional: delete the merged phase branches on GitHub, and the Vercel
   projects other than `wtb-v2`.
4. Phase 5 ideas remain unscheduled.

## Setting up sharing (Phase 4)

The app is on Vercel (project `wtb-v2`, https://wtb-v2.vercel.app); the
PHP files go on Hostinger next to the existing send endpoint
(`https://weddingpotion.com/wtb/`).

1. hPanel → Databases → MySQL: create a database and a user.
2. Copy `hostinger/timeline-config.example.php` to `timeline-config.php`,
   fill in the database details. `allowed_origins` already lists
   `https://wtb-v2.vercel.app`. Never commit it (it is in `.gitignore`).
3. Upload `timeline-api.php` and `timeline-config.php` to the same folder as
   `send-timeline.php` (e.g. `public_html/wtb/`), and re-upload
   `send-timeline.php` (it now includes the link).
4. Vercel → project `wtb-v2` → Settings → Environment Variables: add
   `REACT_APP_TIMELINE_API` = `https://weddingpotion.com/wtb/timeline-api.php`
   for Production, then redeploy (Deployments → latest → Redeploy). The
   variable is read at build time, so it has no effect until the redeploy.
5. Check: create a timeline, click Share, open both links in another browser.

## Decisions

None. D1–D5 are settled; see the end of ROADMAP.

## Working rules for this repo

- One roadmap phase per branch and pull request; never commit straight to `main`.
  Open each pull request against `main`, and only after the one before it is
  merged — a pull request based on another branch merges into that branch,
  not `main`.
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

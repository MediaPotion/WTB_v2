# Roadmap

Improvement plan from the usability assessment of 2026-11-15. Evidence and line
references for every problem named here are in [NOTES.md](NOTES.md).

**Goal:** a couple can produce a believable rough draft of their day in a few
minutes on a phone, and planners and other vendors can see and adjust the same
timeline without emailing files.

**Order matters.** Phases 0–2 need no backend and fix most of the confusion.
Phase 3 depends on a Phase 0 fix. Phase 4 is the largest and needs an owner
decision first.

Each phase ships on its own branch and pull request. "Done when" items are the
acceptance checks; verify UI items in the browser at 1366×800 and 375×812.

---

## Phase 0 — Housekeeping

Small fixes that unblock later phases.

| # | Change | Done when |
|---|---|---|
| 0.1 | Fix the crash in the draft generator: `src/lib/generateTimeline.js:653-654` use `photoCoverageHours` / `videoCoverageHours`, which are not defined (they are destructured as `wiz_photoCoverageHours` / `wiz_videoCoverageHours` at lines 170-171). | `CI=true npm test -- --watchAll=false` shows 7 of 7 passing (currently 5 of 7). |
| 0.2 | Harden the "Send to Media Potion" endpoint. A secret in browser JavaScript is public, so treat it as no protection: restrict `Access-Control-Allow-Origin` to the production site, add a per-IP rate limit, and check uploaded file types. | A request from another origin is refused; more than a few sends per minute from one IP are refused. Owner must upload the new PHP file to Hostinger. |
| 0.3 | Fix block-name typos: "Garder Belt Toss", "Rings,Invitations, & Accessories". **Event names are lookup keys** (see NOTES "Gotchas") — search the whole `src/` tree for the old string before renaming. | Old strings appear nowhere in `src/`; a file saved before the rename still loads and keeps its colours. |
| 0.4 | Remove `scripts/split-app.js` (one-time script; reads a file that no longer exists) and keep one lockfile (see open decision D4). | `npm ci && npm run build` still succeeds. |

**Status (branch `phase-0/housekeeping`):**

- 0.1 done — 7 of 7 tests pass.
- 0.2 done in code, not live. Rate limit (3 sends per minute per IP) and
  content checks (real PDF, real timeline JSON) are in. The origin check is in
  but switched off until the live address is known (D5): fill
  `ALLOWED_ORIGINS` in the PHP file. The owner must upload the file to
  Hostinger. Not run — there is no PHP on the dev machine.
- 0.3 done. Old names now appear in `src/` only in the rename table
  `src/lib/renamedEvents.js`, which maps them on load; tested.
- 0.4 done. D4 taken as recommended (npm): `pnpm-lock.yaml` removed and the
  CodeSandbox tasks switched to npm; `npm ci && npm run build` succeeds.

---

## Phase 1 — Timing that does the math

**Problem:** time behaves three different ways (duration edit moves nothing,
drag re-times the whole day, phone arrows swap times), so clients do the
arithmetic themselves and get red "!" badges.

**Target model:** row *order* is the source of truth. Each event starts when the
one before it ends, unless it is **pinned** to a clock time (ceremony, dinner,
anything the client sets by hand).

Needs decision **D1** (parallel events) before building.

| # | Change | Done when |
|---|---|---|
| 1.1 | Add a pure function in `src/lib/` that takes ordered rows and returns them with flowed start times, honouring pinned rows. Write its tests first. | Tests cover: lengthening a duration pushes later unpinned rows; pinned rows never move; reordering then flowing keeps the first row's start time. |
| 1.2 | Use it everywhere times change: duration edit, add, delete, drag reorder, phone arrows. Remove the no-op `recalculateTimes`, the time-swap in `handleMoveUp/Down`, and the ceremony special case in `cascadeTimesByOrder` (the ceremony becomes a pinned row). | Changing row 1 from 10 to 30 minutes moves every following unpinned row by 20; desktop drag and phone arrows give the same result for the same move. |
| 1.3 | Pin control on each row's time. Setting a time by hand pins the row; a lock icon shows and toggles it. The field `isTimeLocked` already exists in the data. | A pinned row keeps its time through edits above it; unpinning snaps it back into the flow. |
| 1.4 | Replace the red "!" overlap badge with plain statements on the pinned row: "Runs 20 min into Ceremony" (problem) or "20 min free before Ceremony" (information). | No "!" badge remains; overrun and free-time messages show the right minutes. |
| 1.5 | Migrate saved files. On load of a version-2 file, sort by time once, then pin any row whose start differs from the previous row's end, so old timelines open looking exactly as saved. Bump `PROJECT_VERSION` to 3. | A version-2 file with gaps and overlaps loads with identical times; a test covers this. |

**Status (branch `phase-1/timing`, stacked on Phase 2).** D1 taken as
recommended, with this control: "Same time as the event above" in a row's
options. Such a row starts with the row above, is indented, shows ⇉, gets no
warning, and the next row waits for whichever of the two ends later.

- 1.1 done — `src/lib/flow.js` (`flowTimes`, `pinnedNotices`), 18 tests.
- 1.2 done — every change goes through `commitRows` in `MobileApp.jsx`. The
  list shows rows in array order. Removed: `recalculateTimes`, the time swap
  in the arrows, `cascadeTimesByOrder`, and `lib/overlaps.js`. Coverage-start
  rows are created pinned. Seen: Hair & Makeup 10→30 moved the next two
  unpinned rows by 20 and left pinned rows alone; desktop drag and phone ↓
  gave identical times.
- 1.3 done — the lock beside the time toggles the pin (on phones it shows
  only when pinned, and "Pin time" is in the options). Setting a time, or
  picking a time in the event list, pins. Seen: unpinning snapped a row back
  into the flow.
- 1.4 done — "⚠ Runs 25 min into First Look: with Groom" / "5 min free before
  Wedding Party: Group Shots" above pinned rows; no "!" badge remains.
- 1.5 done — `src/lib/projectMigration.js`, `PROJECT_VERSION` 3. Ceremonies
  and coverage starts are pinned too, and 0-minute markers go first among
  rows that start at the same time. Tested, and seen: a scrambled version-2
  autosave opened with every time unchanged.

---

## Phase 2 — Adding and editing events

**Problem:** dropping a block overwrites a row; clients cannot type an event
name; three events fill a desktop screen; phone layout is clipped.

| # | Change | Done when |
|---|---|---|
| 2.1 | Adding never overwrites. The "+" between rows opens the event list and inserts a new row at that spot. A sidebar block dropped between rows inserts; dropped on an empty row fills it; dropped on a filled row inserts below it. | Dropping any block on a fresh timeline leaves the "Coverage Start" block intact. |
| 2.2 | Event name is typed in place. A separate "Change" control opens the list. The list's duration box starts from the row's own duration (today it is always 30: `EventBlockSelector.jsx:8`). | Clicking the name puts a cursor in it; renaming an event never changes its duration. |
| 2.3 | Compact rows: one line showing time, name, duration and small photo/video/indoor marks; tap to expand for notes and options. | At least 8 rows visible at 1366×800 and 5 at 375×812 (today about 3 and 1.5). |
| 2.4 | Delete removes the row at once and shows an "Undo" message, replacing the 2-second countdown that cannot be cancelled. | Delete then Undo restores the row and its times. |
| 2.5 | Phone fixes: Duration field no longer cut off in the event list; Save reachable without the gear menu; shorter header. | No horizontal clipping at 375 px wide; Save is one tap from the timeline. |
| 2.6 | Preview fits its panel width by default and no longer replaces the block list on desktop. | Preview text is readable without zooming at 1366×800. |
| 2.7 | Plain-language labels (see NOTES "Wording"). | Owner approves the label list before it is applied. |

**Status (branch `phase-2/adding-editing`, stacked on Phase 0):**

- 2.1 done. "+" between rows (it shows on hover on desktop and is always
  shown on phones) and the "+ Add Event" button open the list and insert. A
  sidebar block goes between rows, fills an empty row, or goes below a filled
  row. Logic is in `src/lib/rowInsert.js`, with tests. Seen: dropping on
  "Coverage Start" leaves it intact.
- 2.2 done. The name is a text field; "Change event…" (in the expanded row)
  opens the list, which now starts from the row's own duration. Seen:
  renaming keeps the duration, and "Use Custom Event" keeps time and duration.
- 2.3 done. Seen: 10 rows visible at 1366×800, 11 at 375×812.
- 2.4 done. Delete removes the row at once; a "Deleted … Undo" message shows
  for 6 seconds. Seen: Undo restores the row and its times.
- 2.5 done. Duration wraps under the time in the event list; Save is in the
  phone's bottom bar; the phone header is two short lines (102 px, was 192).
  Seen: no sideways scrolling at 375 px.
- 2.6 done. Desktop has a Preview button that opens a wide panel; the
  sidebar is the block list only. Seen: page shown at about 1.5×, readable.
- 2.7 **applied on its own branch, `phase-2.7/labels` (stacked on Phase 4),
  so the owner approves by merging it** (or drops the branch). Uses the list
  in NOTES "Wording", with one change: the ceremony names keep the
  "Ceremony: …" form, because colour, tier and sidebar grouping read the part
  before ": ". Old files map to the new names on load (tested). Seen: a
  version-2 file with old names opened with new names, same colours, the
  ceremony still pinned.

Not changed (Phase 1): times still don't flow, so inserting can create an
overlap "!", dragging still re-times the day, and the phone arrows still swap
times.

---

## Phase 3 — Quick-start draft

**Problem:** a new timeline is one block and 42 loose pieces. The old 7-step
wizard was switched off and asks far more than a couple can answer up front.

Needs 0.1 first, and decision **D2**.

| # | Change | Done when |
|---|---|---|
| 3.1 | A single short screen after "Create New Timeline": names and date, ceremony time and length, first look yes/no, one venue or two, coverage start and hours. Everything else uses defaults. | A full-day draft appears in the editor after at most 6 inputs. |
| 3.2 | Feed those answers to the existing `generateTimeline` with defaults for the rest; pin the ceremony. Add a test with the minimal answer set. | Test passes; generated rows are in order with the ceremony at the entered time. |
| 3.3 | Keep a "Start with a blank timeline" link. | Blank start still works. |

**Status (branch `phase-3/quick-start`, stacked on Phase 1).** D2 taken as
recommended: quick start only; the wizard code stays in place, switched off.

- 3.1 done — `src/screens/QuickStartScreen.jsx`, opened by "Create New
  Timeline". Seven questions, all pre-filled (names and date optional), so a
  draft needs 0–6 inputs. Seen: changing only the ceremony time (2 inputs)
  and clicking "Build my draft timeline" gave a 30-event day.
- 3.2 done — `src/lib/quickStart.js` feeds `generateTimeline` with defaults
  (cocktail hour 60 min, 20 min between venues, 5 family groups, usual
  reception events), then runs the version-2 migration so rows are in order
  and the ceremony is pinned. 7 tests. The coverage start is NOT passed to
  the generator: given one, the generator slides the whole day, ceremony
  included, to start at it (see NOTES). A pinned "Coverage Start" row is
  added instead.
- 3.3 done — "Start with a blank timeline instead" opens the old project
  settings screen; seen working.

---

## Phase 4 — Sharing and collaboration

**Problem:** sharing means emailing a `.json` file. No link, no roles, no
comments; two editors produce two diverging files.

Needs decision **D3** (where the data lives) before any work.

| # | Change | Done when |
|---|---|---|
| 4.1 | Store each timeline on a server under an unguessable id. Saving is automatic. | Closing the browser and opening the link on another device shows the same timeline. |
| 4.2 | Two links per timeline: one that can edit, one that can only view and comment. | The view link cannot change rows. |
| 4.3 | Comments on a row, with the commenter's name. | A planner can leave a note the couple sees on next open. |
| 4.4 | Guard against overwriting: each save carries a version number; if the server has a newer one, the app asks the person to reload. Show "last edited by … at …". | Two browsers editing the same timeline never silently lose a change. |
| 4.5 | Keep file export as a backup, and change "Send to Media Potion" to send the link. | Export still downloads; the email contains the link. |

**Status (branch `phase-4/sharing`, stacked on Phase 3).** D3 taken as
recommended: `hostinger/timeline-api.php` (PHP + MySQL via PDO; tables made
on first use), secret links, no logins. **Off until it is set up:** the app
shares only when built with `REACT_APP_TIMELINE_API` set to that file's URL,
so it is inert until D5 (the live address) is known and the owner follows
"Setting up sharing" in HANDOFF. **The PHP has not been run** (no PHP here). The
app was tested end to end against `scripts/dev-timeline-api.js`, a Node
stand-in with the same requests and responses.

- 4.1 done — a timeline with content gets its server copy and an
  `#edit=<key>` address; changes save automatically (1.2 s after the last
  one). Seen: the edit link in a second tab showed the same timeline.
- 4.2 done — "Share" shows an edit link and a view link. Seen: the view link
  has no editing controls, and the server refuses a save made with it (403).
- 4.3 done — comments under each event's options, with a name. Seen: a
  planner's comment from the view link showed for the couple on reopen.
- 4.4 done — saves send their base version; a stale save gets 409. Seen:
  the stale tab said "Ava changed this timeline at …", the server kept the
  other tab's edit, and Reload brought it in. "Saved online · last edited by
  … at …" shows under the header.
- 4.5 done in code — Save/Export unchanged; "Send to Media Potion" adds the
  edit link to the email (`send-timeline.php` must be re-uploaded). The link
  in the request is unit-tested; no real email was sent.

---

## Phase 5 — Later ideas (not scheduled)

- Day-at-a-glance view: a vertical clock with blocks sized by duration.
- Per-vendor output: photo-only and video-only views and PDFs.
- Template sets per package (for example 6-hour photo-only, 10-hour photo and video).

---

## Open decisions for the owner

| # | Question | Recommendation |
|---|---|---|
| D1 | Two shooters often cover bride and groom at the same time. How should parallel events appear in a one-after-another timeline? | Let a pinned row overlap its neighbours without warning when it is marked "at the same time as the previous event"; decide the exact control with a mock-up before building 1.1. **Taken as recommended (Phase 1 branch) — owner to confirm.** |
| D2 | Bring back the full 7-step wizard, or only the short quick-start? | Short quick-start only. Leave the old wizard code in place, switched off, until Phase 3 proves out. **Taken as recommended (Phase 3 branch) — owner to confirm.** |
| D3 | Where do shared timelines live? | A small PHP + MySQL service on the existing Hostinger account, with secret links and no logins. Alternative: a hosted database service (for example Supabase) if live co-editing is wanted later. **Taken as recommended (Phase 4 branch) — owner to confirm.** |
| D4 | The repo has both `package-lock.json` and `pnpm-lock.yaml`. Which package manager? | npm — the launcher script already uses it. **Taken (Phase 0).** |
| D5 | How is the live site deployed, and at what address? | Unknown — see NOTES "Unknowns". Needed before anything ships. |

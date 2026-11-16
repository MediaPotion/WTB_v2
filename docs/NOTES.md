# Notes

Reference material behind [ROADMAP.md](ROADMAP.md). Line numbers are for commit
`7d4aed6` (main, 2026-07-17) and will drift as code changes.

## How the assessment was done

On 2026-11-15 the app was run locally and used as a client would at 1366×800 and
375×812: create a timeline, drop blocks, change a duration, set a time, open the
event list, reorder by drag, open the preview, open the phone menu. Findings
marked **seen** were observed in the running app; **read** means from code only.

## Code map

Create React App, React 18, plain JavaScript, `@dnd-kit` for drag and drop,
`jspdf` for PDF. About 14,400 lines in `src/`.

| Path | What it is |
|---|---|
| `src/screens/MobileApp.jsx` | The whole app shell, desktop and phone (2,523 lines, 165 `useState` calls). Welcome → settings → timeline screens, all row logic, menus, modals. |
| `src/screens/WelcomeScreen.jsx` | First screen: Create / Load, autosave banner. |
| `src/components/timeline/TimelineRow.jsx` | One event row. Since Phase 2: a one-line row (time, name field, marks, duration, expand, delete) that expands for photo/video, indoors, "Change event…", phone up/down, notes, address. |
| `src/components/timeline/TimelineDnd.jsx` | Drag-and-drop setup and the rule for where things may drop. |
| `src/components/timeline/RowDropZone.jsx`, `AddRowButton.jsx` | The gap between rows: "+" to insert, and the drop target for reordering and for sidebar blocks. |
| `src/lib/rowInsert.js` | Where new rows go: start time for an inserted row, array position, and what a sidebar drop does (fill / insert). Tested. |
| `src/lib/renamedEvents.js` | Old block name → new name, applied when a file or autosave loads. |
| `src/components/timeline/EventBlockSelector.jsx` | The event list dialog: "Add Event" (insert) or "Change Event" (replace). |
| `src/components/timeline/TimePopover.jsx` | Hour / minute / AM-PM picker. |
| `src/components/sidebar/EventSidebar.jsx` | Desktop right panel: block palette only. The desktop preview is a panel opened from the toolbar (in `MobileApp.jsx`). |
| `src/constants/events.js` | The 42 template blocks as `"Category: Name::minutes"` strings. |
| `src/constants/colors.js`, `tiers.js` | Colour by name prefix; "hard / soft / flexible" by full name. |
| `src/constants/styles.js`, `theme.js` | All CSS, as JavaScript strings injected in a `<style>` tag. |
| `src/hooks/useProjectStorage.js` | Save to file, load from file, autosave to the browser. |
| `src/lib/exportPdf.js`, `exportTxt.js` | PDF / print / preview and text export. |
| `src/lib/sendToMediaPotion.js` + `hostinger/send-timeline.php` | Emails the PDF and JSON to the studio. |
| `src/screens/QuickStartScreen.jsx`, `src/lib/quickStart.js` | Phase 3 quick start: one screen of pre-filled questions → `generateTimeline` with defaults → a version-3 draft. Tested. |
| `src/lib/flow.js` | The timing model: `flowTimes` (row order → start times, honouring pins and "same time as above") and `pinnedNotices` (overrun / free minutes before pinned rows). Tested. |
| `src/lib/projectMigration.js` | Version 2 → 3 save-file migration (sort once, pin rows that don't follow on). Tested. |
| `src/lib/generateTimeline.js` | Builds a full day from wizard answers (694 lines). Currently crashes — see below. |
| `src/components/wizard/*`, `src/screens/WizardScreen.jsx`, `src/lib/calculateLogistics.js`, `logistics*.js`, `goldenHour.js` | The 7-step wizard and its "logistics check". Switched off; about 5,000 lines clients never see. |

## Data

A row (`userRows` in `MobileApp.jsx`):

```
id, type ("event" | "location" | "constraint"), event (name), time (minutes
from midnight), duration (minutes), notes, address, location, photo, video,
isOutdoor, isTimeLocked (pinned), withPrevious (same time as the row above,
version 3), color, tier, flexibilityMinutes
```

- **Since version 3 (Phase 1) array order is display order** and times are
  derived by `flowTimes`. Before that, the list was `userRows` sorted by time
  and array order meant nothing; version-2 files are migrated on load.
- Saved file (`useProjectStorage.js:109`): `version` (3), names, date, coverage
  start/end for photo and video, `userRows`, `fixedEvents`, `enteredViaWizard`.
- Autosave: `localStorage` key `wtb_autosave`, per browser, same shape plus
  `screen` and `nextId`.
- Wizard answers (the `wiz_*` state) are **not** saved in the file or autosave. (read)

## Confirmed problems

| # | Problem | Evidence | Where |
|---|---|---|---|
| 1 | No rough draft: a new timeline is one "Coverage Start" block. | seen | `MobileApp.jsx:1043` |
| 2 | A sidebar block can only drop on an existing row, snaps to the nearest one, and replaces it. First drop replaced "Coverage Start" and kept its note. No drop between rows. **Fixed in Phase 2.** | seen | `TimelineDnd.jsx:24`, `MobileApp.jsx:854` |
| 3 | Hint says "Drag a block onto a row" when there may be no empty row. **Fixed in Phase 2.** | seen | `EventSidebar.jsx:20` |
| 4 | Changing a duration moves nothing; both rows get a red "!". **Fixed in Phase 1.** | seen | `MobileApp.jsx:521` (function returns its input unchanged) |
| 5 | Dragging a row re-times everything from the moved row's old time; the day start went from 12:00 to 12:20. **Fixed in Phase 1.** | seen | `MobileApp.jsx:902`, `:597` |
| 6 | Phone up/down arrows swap the two rows' times. **Fixed in Phase 1.** | read | `MobileApp.jsx:669`, `:693` |
| 7 | "Lock time" and "snap to previous event" exist in logic with no button. **Phase 1: the lock is the pin; unpinning snaps back. `handleChainToPrevious` is still there with no caller.** | read | `isTimeLocked`; `MobileApp.jsx:642` has no caller |
| 8 | Clicking the event name opens a dialog; its duration box is always 30. "Use Custom Event" would save 30 over the row's duration. **Fixed in Phase 2.** | dialog seen; overwrite read, not clicked | `TimelineRow.jsx:338`, `EventBlockSelector.jsx:8` |
| 9 | About 3 rows per desktop screen and 1.5 per phone screen. **Phase 2: 10 and 11.** | seen | `TimelineRow.jsx` layout |
| 10 | Preview is unreadable at its default size and replaces the block palette. **Fixed in Phase 2.** | seen | `EventSidebar.jsx` tabs |
| 11 | Phone: event names cut off; Duration field clipped in the dialog; Save is inside the gear menu. **Phase 2 fixes the dialog and Save. Long names still end in "…" on a phone row; the whole name shows while editing it.** | seen | `EventBlockSelector.jsx:230`, `MobileApp.jsx:1776` |
| 12 | Delete starts a 2-second countdown that cannot be cancelled (Undo works afterwards). **Fixed in Phase 2.** | read | `TimelineRow.jsx:375-383` |
| 17 | Picking any event in the list also set the row's start time from the dialog, rounded to 5 minutes, so a 12:22 row moved to 12:20. Phase 2 sends a time only when it is changed in the dialog. | read | `EventBlockSelector.jsx` (before Phase 2) |
| 18 | Typing a name in the last row, or dropping a block on it, added an empty row below. Phase 2 removes this; rows are added with "+" instead. | read | `MobileApp.jsx` `handleEventBlur` (before Phase 2) |
| 20 | Given a coverage start, `generateTimeline` slides every block (ceremony included) earlier so the first block starts at it — the ceremony no longer matches the time entered. The quick start avoids it by not passing a coverage start. | test run | `generateTimeline.js` "coverageStartTargets" |
| 19 | The preview's fit-to-width subtracted the panel padding twice, so pages were drawn narrower than the panel. Fixed in Phase 2. | read | `exportPdf.js` `TimelinePreview` |
| 13 | No sharing: Save downloads a `.json`; others must load that file. | seen | `useProjectStorage.js` |
| 14 | Draft generator throws `ReferenceError: photoCoverageHours is not defined`; 2 of 7 tests fail because of it. **Fixed in Phase 0.** | test run | `generateTimeline.js:653-654` |
| 15 | The send secret is in the public JavaScript and the endpoint allows any origin. **Phase 0 adds a rate limit, content checks and an origin list (empty until D5); not uploaded.** | read | `sendToMediaPotion.js:8`, `send-timeline.php:27` |
| 16 | Typos in block names. **Fixed in Phase 0.** | seen | `events.js:3`, `:42` |

## Gotchas

- **Event names are keys.** Colour comes from the name's prefix (`colors.js`),
  "hard/soft" from the full name (`tiers.js`), the ceremony anchor from two exact
  names (`MobileApp.jsx:598`), and `generateTimeline.js` builds rows by name.
  Saved files store names. Renaming a block needs a search across `src/` and an
  entry in `src/lib/renamedEvents.js`, which maps old names when a file or
  autosave loads.
- **Desktop vs phone is one breakpoint:** 901 px (`constants/wizard.js`,
  `styles.js`). Below it: no sidebar, no drag, arrows instead.
- **Styles live in three places:** inline `style={{…}}` on almost everything,
  CSS strings in `constants/styles.js`, and Tailwind (configured, barely used).
- **Turning the wizard back on is not one line.** `WIZARD_ENABLED` is in
  `constants/wizard.js:2`, but nothing calls `setScreen("wizard")` any more; the
  welcome-screen button was removed in commit `39cfe19`. (read)
- **Two undo implementations:** `hooks/useUndoRedo.js` is unused; the live one is
  inline in `MobileApp.jsx`. History keeps 12 steps.
- **The PHP file is not deployed by git.** `hostinger/send-timeline.php` is
  uploaded by hand; its secret must match the one in the app. Its rate limit
  keeps a small file in the server's temp folder (`wtb_send_rate.json`).
- **No PHP on the dev machine,** so the endpoint can't be run locally.
- **`build/` is ignored by git** (it used to be committed).
- **Not part of the app:** `Claude Code.command` in the repo root is untracked
  and opens a different project.
- **The time picker is `position: fixed` inside the row.** Don't put a CSS
  `transform` on `.wtb-row-card` (for example a hover lift); that would make the
  picker position itself relative to the row.
- **`.claude/launch.json`** (untracked) starts `npm start` for the Claude Code
  browser preview.
- **Testing in the browser:** put a timeline in `localStorage` key
  `wtb_autosave`, reload, then click "Restore Timeline".
- **Every change that can move times goes through `commitRows`** in
  `MobileApp.jsx` (flow, then history). Typing a duration flows straight away
  and is saved to history on blur. After a reorder, pass the old day start
  (`dayStart(userRows)`) so the day keeps its start time.
- **Scripted tests in the preview browser:** when the page doesn't have
  focus, `blur` never fires, so typed edits don't reach Undo history. Use
  real clicks and typing to check history.
- **Undo for a delete** is the normal undo; the message's Undo only acts while
  the delete is still the latest change.

## Wording clients see today

Candidates for plainer labels (Phase 2.7): "Project Settings", "Save Project",
"Load Project" / "Load Existing Timeline", "Coverage", "Event Blocks",
"Bride (Pre-Dress)", "Bride (Dress On)", "Narration", "Audio/Video Setup",
"Ceremony: Average", "Location / Travel".

**Proposed labels — for the owner to approve, change or reject (2.7).** Not
applied. Rows marked *key* are event names or name prefixes: renaming them
also needs entries in `src/lib/renamedEvents.js` and updates to `colors.js`,
`tiers.js` and `generateTimeline.js` (see Gotchas).

| Today | Proposed | Where |
|---|---|---|
| Project Settings | Wedding details | Toolbar, phone menu, dialog title |
| Save Project | Save a copy | Toolbar, phone menu |
| Load Project / Load Existing Timeline | Open a saved timeline | Toolbar, phone menu, welcome screen |
| Photography / Videography Coverage Time | Photo hours / Video hours | Header |
| Event Blocks | Add events | Desktop sidebar title |
| Bride (Pre-Dress): … | Bride getting ready: … | *key* — block category |
| Bride (Dress On): … | Bride dressed: … | *key* — block category |
| Narration: … | Video messages: … | *key* — block category |
| Ceremony: Audio/Video Setup, Reception: Audio/Video Setup | Ceremony: Sound and camera setup, Reception: Sound and camera setup | *key* — block names |
| Ceremony: Average | Ceremony (about 30 min) | *key* — block name; also a ceremony anchor in `MobileApp.jsx` |
| Ceremony: Catholic | Ceremony, Catholic Mass (about 1 hr) | *key* — as above |
| Location / Travel | Travel to another place | Sidebar and event list |
| Use Custom Event | Use this name | Event list |
| Create Custom Event | Your own event | Event list |

## Repository state

- `main` matches `origin/main`. App code is unchanged since `7d4aed6`; later
  commits only add these documents.
- `backup/codesandbox-prototype` (local only) holds the two old prototype
  commits that used to be on local `main`. Safe to delete once the owner agrees.
- Remote branch `Mobile+Desktopv2` has one old commit not in main
  ("remove time arrows", 2025-08). The other remote branches are fully merged
  or older.
- No pull requests exist. The GitHub command-line tool (`gh`) is not installed
  on this machine.

## Unknowns

- How and where the live site is deployed. The send endpoint is on
  `weddingpotion.com/wtb/`, and the build assumes it is served from `/`, so the
  app may live elsewhere or need a `homepage` setting.
- Why the wizard was switched off for clients (commit message says only
  "for client-facing builds").
- The wizard was read but never run during the assessment.
- Whether clients mostly use phones or computers.

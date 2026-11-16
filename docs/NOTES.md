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
| `src/components/timeline/TimelineRow.jsx` | One event card (596 lines): time, name, duration, notes, photo/video, indoor/outdoor, delete, overlap badge. |
| `src/components/timeline/TimelineDnd.jsx` | Drag-and-drop setup and the rule for where things may drop. |
| `src/components/timeline/RowDropZone.jsx`, `AddRowButton.jsx` | The gap between rows: "+ Add Event" and the reorder drop target. |
| `src/components/timeline/EventBlockSelector.jsx` | The "Select or Create Event" dialog. |
| `src/components/timeline/TimePopover.jsx` | Hour / minute / AM-PM picker. |
| `src/components/sidebar/EventSidebar.jsx` | Desktop right panel: block palette and Preview tab. |
| `src/constants/events.js` | The 42 template blocks as `"Category: Name::minutes"` strings. |
| `src/constants/colors.js`, `tiers.js` | Colour by name prefix; "hard / soft / flexible" by full name. |
| `src/constants/styles.js`, `theme.js` | All CSS, as JavaScript strings injected in a `<style>` tag. |
| `src/hooks/useProjectStorage.js` | Save to file, load from file, autosave to the browser. |
| `src/lib/exportPdf.js`, `exportTxt.js` | PDF / print / preview and text export. |
| `src/lib/sendToMediaPotion.js` + `hostinger/send-timeline.php` | Emails the PDF and JSON to the studio. |
| `src/lib/generateTimeline.js` | Builds a full day from wizard answers (694 lines). Currently crashes — see below. |
| `src/components/wizard/*`, `src/screens/WizardScreen.jsx`, `src/lib/calculateLogistics.js`, `logistics*.js`, `goldenHour.js` | The 7-step wizard and its "logistics check". Switched off; about 5,000 lines clients never see. |

## Data

A row (`userRows` in `MobileApp.jsx`):

```
id, type ("event" | "location" | "constraint"), event (name), time (minutes
from midnight), duration (minutes), notes, address, location, photo, video,
isOutdoor, isTimeLocked, color, tier, flexibilityMinutes
```

- The list shown on screen is `userRows` **sorted by time** (`MobileApp.jsx:341`).
  Array order is not what the user sees.
- Saved file (`useProjectStorage.js:109`): `version` (2), names, date, coverage
  start/end for photo and video, `userRows`, `fixedEvents`, `enteredViaWizard`.
- Autosave: `localStorage` key `wtb_autosave`, per browser, same shape plus
  `screen` and `nextId`.
- Wizard answers (the `wiz_*` state) are **not** saved in the file or autosave. (read)

## Confirmed problems

| # | Problem | Evidence | Where |
|---|---|---|---|
| 1 | No rough draft: a new timeline is one "Coverage Start" block. | seen | `MobileApp.jsx:1043` |
| 2 | A sidebar block can only drop on an existing row, snaps to the nearest one, and replaces it. First drop replaced "Coverage Start" and kept its note. No drop between rows. | seen | `TimelineDnd.jsx:24`, `MobileApp.jsx:854` |
| 3 | Hint says "Drag a block onto a row" when there may be no empty row. | seen | `EventSidebar.jsx:20` |
| 4 | Changing a duration moves nothing; both rows get a red "!". | seen | `MobileApp.jsx:521` (function returns its input unchanged) |
| 5 | Dragging a row re-times everything from the moved row's old time; the day start went from 12:00 to 12:20. | seen | `MobileApp.jsx:902`, `:597` |
| 6 | Phone up/down arrows swap the two rows' times. | read | `MobileApp.jsx:669`, `:693` |
| 7 | "Lock time" and "snap to previous event" exist in logic with no button. | read | `isTimeLocked`; `MobileApp.jsx:642` has no caller |
| 8 | Clicking the event name opens a dialog; its duration box is always 30. "Use Custom Event" would save 30 over the row's duration. | dialog seen; overwrite read, not clicked | `TimelineRow.jsx:338`, `EventBlockSelector.jsx:8` |
| 9 | About 3 rows per desktop screen and 1.5 per phone screen. | seen | `TimelineRow.jsx` layout |
| 10 | Preview is unreadable at its default size and replaces the block palette. | seen | `EventSidebar.jsx` tabs |
| 11 | Phone: event names cut off; Duration field clipped in the dialog; Save is inside the gear menu. | seen | `EventBlockSelector.jsx:230`, `MobileApp.jsx:1776` |
| 12 | Delete starts a 2-second countdown that cannot be cancelled (Undo works afterwards). | read | `TimelineRow.jsx:375-383` |
| 13 | No sharing: Save downloads a `.json`; others must load that file. | seen | `useProjectStorage.js` |
| 14 | Draft generator throws `ReferenceError: photoCoverageHours is not defined`; 2 of 7 tests fail because of it. | test run | `generateTimeline.js:653-654` |
| 15 | The send secret is in the public JavaScript and the endpoint allows any origin. | read | `sendToMediaPotion.js:8`, `send-timeline.php:27` |
| 16 | Typos in block names. | seen | `events.js:3`, `:42` |

## Gotchas

- **Event names are keys.** Colour comes from the name's prefix (`colors.js`),
  "hard/soft" from the full name (`tiers.js`), the ceremony anchor from two exact
  names (`MobileApp.jsx:598`), and `generateTimeline.js` builds rows by name.
  Saved files store names. Renaming a block needs a search across `src/` and a
  thought about old files.
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
  uploaded by hand; its secret must match the one in the app.
- **`build/` is ignored by git** (it used to be committed).
- **Not part of the app:** `Claude Code.command` in the repo root is untracked
  and opens a different project.

## Wording clients see today

Candidates for plainer labels (Phase 2.7): "Project Settings", "Save Project",
"Load Project" / "Load Existing Timeline", "Coverage", "Event Blocks",
"Bride (Pre-Dress)", "Bride (Dress On)", "Narration", "Audio/Video Setup",
"Ceremony: Average", "Location / Travel".

## Repository state

- `main` matches `origin/main` at `7d4aed6`.
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

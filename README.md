# Intel Sustainability Summit: Event Check-in App

To get started, create a new Codespace from this repo and open the project in the editor.

## Quick start & preview

Open `Attendance.Generator.Thingy.html` (or `index.html`) in your editor and use Live Preview or open the file in a browser to see the check-in UI.

## Required element IDs

These elements must exist in the page for the script to work correctly:

- `checkInForm` — the form element wrapping the name input and team select.
- `attendeeName` — text input for attendee name.
- `teamSelect` — select element with team options (values: `water`, `zero`, `power`).
- `attendeeCount` — element that shows the total attendee count.
- `progressBar` — the progress-bar element whose width gets updated.
- `waterCount`, `zeroCount`, `powerCount` — elements that show counts per team.
- `greeting` — a short feedback message element.
- `resetAttendanceBtn` — (optional) a button that resets counts when clicked.

## Notes

- The app persists counts to `localStorage`, so numbers survive page refreshes.
- If you see a blank preview, make sure you're opening a real HTML file (e.g. `index.html`) and not a non-existent path.

\*\*\* End of README

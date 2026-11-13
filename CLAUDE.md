# Explorables

A public collection of interactive teaching pages for Aashish's students, served by GitHub Pages from the public repository `priye19/explorables` at https://priye19.github.io/explorables/. Created 2026-11-13. Work list: `bugs-and-features/LIST.md`.

## Decided (his words or choice, with date)

- 2026-11-13: One collection repository with one folder per explorable and a front page (`index.html` at the root) listing them all; GitHub Pages switched on once. Chosen over one repository per explorable and over a separate GitHub organisation.
- 2026-11-13: The collection is named "explorables".
- 2026-11-13 (his feedback on the first explorable), for every explorable:
  - One consistent design language across all explorables.
  - A light and dark mode toggle at the top of the page.
  - Main dials and knobs on the main page; advanced options in a Settings panel.
  - A control section at the top, tall enough for every main control, holding the settings, boundary and initial conditions and simulation parameters; the live results below it.
  - Results laid out so everything is visible together: the main picture on one half of the page, the plots stacked on the other half.
  - On the left of the control section: the explorable's main choice as a drop-down (for the random walk, the dimension), then a Notes button, then a Settings button. Notes holds the theory and explanation, with his lecture notes on the topic where there are any.
  - The random walk explorable: dimension as a drop-down (1D, 2D, 3D), 3D by default.

## The design language (the shared theme: `theme/explorables.css` and `theme/explorables.js`)

Built 2026-11-13 to carry out the decisions above; the details below are the implementation, which he has not separately approved.

- **Every explorable loads the shared theme** (`../theme/explorables.css` and `../theme/explorables.js` in `<head>`), never its own copy, so one change restyles all of them.
- **Page frame:** `.xp-app.fit` holds the header bar (`.xp-header`: back link "← Explorables", red title, theme button `.xp-theme`), the control deck (`.xp-controls`: first row = main drop-down, Notes, Settings, separator, Play / One step / Reset, status; second row = main dials `.xp-dial`), and the results (`.xp-results`: two columns `.xp-col` of `.card`s). On screens 1000 px and wider the page fits the window without scrolling; narrower screens stack everything in one column.
- **Panels:** Notes and Settings are `<aside class="xp-panel" id=...>`, opened by any button with `data-open="id"`, closed by `data-close`, the backdrop or Escape (`XP.init()` wires them). Settings options that apply only to some modes carry `data-dims` (or an equivalent) and are hidden otherwise.
- **Colour roles:** `--accent` (red, as his lecture headings) for titles and headings; `--primary` (blue) for anything pressed; `--measured` (orange, solid lines) for what the simulation measured; `--theory` (ink colour, always dashed) for what a formula predicts; `--c1` to `--c5` for further series, in that order. Canvases read the colours with `XP.palette()` and redraw on `XP.onTheme`, so plots follow the theme.
- **Plots:** drawn with `XP.plot`; the legend sits in rows above the plot, never over the data.
- **Theme choice:** follows the device's setting until the reader presses the toggle; the choice is remembered in the browser.
- **Notes:** headings in accent red, equations in `.eq` blocks, worked problems with the solution inside `<details>`; sources named at the end.

## Conventions

- A folder is named after the concept, never the course: lowercase words joined by hyphens (`random-walk-diffusion`).
- The front page groups explorables by subject; each entry has tags, one of them the course it was first used in.
- Nothing is loaded from the internet: the theme is a local file of the repository. To use the collection offline, download the whole repository, not one folder.
- Text inside the pages follows his writing rules (no em dashes, every term defined, no analogies) and refers to nothing outside the page (no "the ink drop slide").
- This repository is the one home of each explorable. Everything here is public: no student data, no grades, no personal details.

## Publishing a change

Test locally first (`python -m http.server` in this folder, then open http://127.0.0.1:8000/), at a wide and a phone-sized window, in light and dark mode. Commit and push to `main`; GitHub Pages rebuilds within a minute or two. Check the live page afterwards.

# Explorables

A public collection of interactive teaching pages for Aashish's students, served by GitHub Pages from the public repository `priye19/explorables` at https://priye19.github.io/explorables/. Created 2026-11-13. Work list: `bugs-and-features/LIST.md`.

## Decided (his words or choice, with date)

- 2026-11-13: One collection repository with one folder per explorable and a front page (`index.html` at the root) listing them all; GitHub Pages switched on once. Chosen over one repository per explorable and over a separate GitHub organisation.
- 2026-11-13: The collection is named "explorables".

## Conventions (recommended when the collection was set up; he did not object, but they are not separately decided)

- A folder is named after the concept, never the course: lowercase words joined by hyphens (`random-walk-diffusion`). Explorables will be used in more than one course.
- Each explorable is one self-contained `index.html` in its folder, loading nothing from the internet, so it works offline and never breaks when a library site changes.
- The front page groups explorables by subject; each entry has tags, one of them the course it was first used in.
- Every explorable links back to the front page (`../`).
- This repository is the one home of each explorable. Text inside the pages follows his writing rules (no em dashes, every term defined, no analogies).
- Everything here is public: no student data, no grades, no personal details.

## Publishing a change

Commit and push to `main`; GitHub Pages rebuilds within a minute or two. Check the live page afterwards.

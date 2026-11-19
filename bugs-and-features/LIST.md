# Explorables: work list

No open items.

## Done

- 2026-11-19: All pages: text grows with the window. Every font size in the shared stylesheet and the pages is a base size times a factor that is 1 below 1600 by 850 pixels, 1.15 from there, 1.3 from 1700 by 1050 and 1.45 from 2100 by 1250; the canvases magnify their drawing by the same factor, so plot labels grow too (his request: the text was too small on a 1900-pixel-wide window).

- 2026-11-19: Pendulum: the small-angle prediction is a Settings option, off by default, and is drawn only up to the present time of the run; a second option, also off, draws it for the whole run in advance (his correction: nothing may show what the run will do before it gets there).

- 2026-11-19: Pendulum in phase space (`pendulum-phase-space/index.html`), from the simple and double pendulum programs of the ChE 3020 dynamical systems lecture: simple or double pendulum, several runs started Δθ apart, phase space, angle and angular velocity against time, gap between two runs on a log scale, Notes with the theory. Shared plot helper gained a log scale (`ylog`), dots and line breaks at NaN. Published 2026-11-19 at https://priye19.github.io/explorables/pendulum-phase-space/ and checked live.

- 2026-11-13: Random walk 1D picture is now a number line with the molecules jumping left and right, matching 2D and 3D (his correction); the position-against-time picture is a choice in Settings.

- 2026-11-13: Shared theme (`theme/`) with light and dark mode, control deck, Notes and Settings panels; random walk rebuilt on it (dimension drop-down, 3D by default, picture and plots side by side); front page on the theme.

- 2026-11-13: Collection created with its front page and the random walk model of diffusion (`random-walk-diffusion/index.html`).

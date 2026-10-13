# Implementation

The game is a buildless static site. `index.html` defines the page and game
controls, `style.css` handles the responsive board, and `game.js` manages the
4 × 4 grid.

Each move packs tiles in the selected direction, merges equal neighbors once,
adds the resulting values to the score, and then places a new tile. The board,
score, and completion state are stored in browser local storage. Artwork is
bundled in `assets/`, so gameplay does not depend on the original site.

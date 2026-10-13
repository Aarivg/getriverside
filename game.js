(() => {
  "use strict";

  const schools = {
    2: { name: "Dominion", image: "dominion.png" },
    4: { name: "Loudoun County", image: "county.png" },
    8: { name: "Heritage", image: "heritage.jfif" },
    16: { name: "Stone Bridge", image: "stonebridge.jfif" },
    32: { name: "Tuscarora", image: "tusky.png" },
    64: { name: "Potomac Falls", image: "potfalls.jpg" },
    128: { name: "Freedom", image: "freedom.png" },
    256: { name: "Woodgrove", image: "woodgrove.png" },
    512: { name: "Independence", image: "independence.png" },
    1024: { name: "John Champe", image: "champe.png" },
    2048: { name: "Riverside!", color: "#d92930" }
  };
  const size = 4;
  const boardElement = document.getElementById("board");
  const scoreElement = document.getElementById("score");
  const bestElement = document.getElementById("best");
  const announcement = document.getElementById("announcement");
  const message = document.getElementById("game-message");
  const keepPlayingButton = document.getElementById("keep-playing");
  let board = Array(size * size).fill(0);
  let score = 0;
  let best = readNumber("getriverside-best");
  let won = false;
  let keepPlaying = false;
  let over = false;
  let animationIndex = -1;
  let animationType = "";

  function readNumber(key) {
    try { return Math.max(0, Number(localStorage.getItem(key)) || 0); } catch { return 0; }
  }
  function save() {
    try { localStorage.setItem("getriverside-game", JSON.stringify({ board, score, won, keepPlaying, over })); localStorage.setItem("getriverside-best", String(best)); } catch { /* Storage is optional. */ }
  }
  function load() {
    try {
      const state = JSON.parse(localStorage.getItem("getriverside-game"));
      if (!state || !Array.isArray(state.board) || state.board.length !== 16 || !state.board.every(v => Number.isInteger(v) && (v === 0 || (v >= 2 && (v & (v - 1)) === 0)))) return false;
      board = state.board;
      score = Number.isFinite(state.score) && state.score >= 0 ? state.score : 0;
      won = !!state.won;
      keepPlaying = !!state.keepPlaying;
      over = !!state.over;
      return true;
    } catch { return false; }
  }
  function emptyIndices() { return board.map((v, i) => v ? -1 : i).filter(i => i >= 0); }
  function addRandomTile() {
    const empty = emptyIndices();
    if (!empty.length) return;
    const index = empty[Math.floor(Math.random() * empty.length)];
    board[index] = Math.random() < .9 ? 2 : 4;
    animationIndex = index;
    animationType = "new";
  }
  function newGame() {
    board = Array(16).fill(0); score = 0; won = false; keepPlaying = false; over = false;
    addRandomTile(); addRandomTile();
    save(); render(); announce("New game started.");
  }
  function announce(text) { announcement.textContent = text; }
  function render() {
    const fragment = document.createDocumentFragment();
    board.forEach((value, index) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `Row ${Math.floor(index / 4) + 1}, column ${index % 4 + 1}: ${value ? (schools[value]?.name || `Level ${value}`) : "empty"}`);
      if (value) {
        const school = schools[value] || { name: `Level ${value}`, color: "#506484" };
        const tile = document.createElement("div");
        tile.className = "tile" + (index === animationIndex ? ` ${animationType}` : "");
        tile.style.setProperty("--tile-color", school.color || "#5a7aa8");
        tile.dataset.value = value;
        if (school.image) {
          const image = document.createElement("img");
          image.src = `./assets/${school.image}`;
          image.alt = school.name;
          image.draggable = false;
          tile.append(image);
        } else {
          const label = document.createElement("span");
          label.className = "tile-name";
          label.textContent = school.name;
          tile.append(label);
        }
        cell.append(tile);
      }
      fragment.append(cell);
    });
    boardElement.replaceChildren(fragment);
    scoreElement.textContent = score;
    bestElement.textContent = best;
    if (won && !keepPlaying) showMessage("You got Riverside!", "You combined your way to Riverside. Keep going or start again.", true);
    else if (over) showMessage("No moves left", "The board is full. Give it another try!", false);
    else message.hidden = true;
    animationIndex = -1;
    animationType = "";
  }
  function showMessage(title, copy, canContinue) {
    document.getElementById("message-title").textContent = title;
    document.getElementById("message-copy").textContent = copy;
    keepPlayingButton.hidden = !canContinue;
    message.hidden = false;
  }
  function lineIndices(direction, n) {
    const indices = [];
    for (let j = 0; j < size; j++) {
      if (direction === "left") indices.push(n * size + j);
      if (direction === "right") indices.push(n * size + (size - 1 - j));
      if (direction === "up") indices.push(j * size + n);
      if (direction === "down") indices.push((size - 1 - j) * size + n);
    }
    return indices;
  }
  function movesAvailable() {
    if (board.includes(0)) return true;
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
      const v = board[r * size + c];
      if (c < size - 1 && board[r * size + c + 1] === v) return true;
      if (r < size - 1 && board[(r + 1) * size + c] === v) return true;
    }
    return false;
  }
  function move(direction) {
    if (over || (won && !keepPlaying)) return;
    const before = board.slice();
    let points = 0;
    let mergedAt = -1;
    for (let n = 0; n < size; n++) {
      const indices = lineIndices(direction, n);
      const packed = indices.map(i => board[i]).filter(Boolean);
      const result = [];
      for (let i = 0; i < packed.length; i++) {
        if (packed[i] === packed[i + 1]) {
          const merged = packed[i] * 2;
          result.push(merged);
          points += merged;
          if (merged === 2048) won = true;
          mergedAt = indices[result.length - 1];
          i++;
        } else result.push(packed[i]);
      }
      indices.forEach((index, j) => { board[index] = result[j] || 0; });
    }
    if (before.every((value, index) => value === board[index])) return;
    score += points;
    best = Math.max(best, score);
    addRandomTile();
    if (mergedAt >= 0) { animationIndex = mergedAt; animationType = "merged"; }
    over = !movesAvailable();
    save(); render();
    if (won && !keepPlaying) announce("You reached Riverside!");
    else if (over) announce("No moves left. Game over.");
    else announce(points ? `Merged schools for ${points} points. Score ${score}.` : `Moved ${direction}.`);
  }

  document.getElementById("restart").addEventListener("click", newGame);
  document.getElementById("try-again").addEventListener("click", newGame);
  keepPlayingButton.addEventListener("click", () => { keepPlaying = true; save(); render(); announce("Keep playing."); });
  document.querySelectorAll("[data-direction]").forEach(button => button.addEventListener("click", () => move(button.dataset.direction)));
  window.addEventListener("keydown", event => {
    const directions = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" };
    if (event.code === "Space") { event.preventDefault(); newGame(); return; }
    const direction = directions[event.key];
    if (direction) { event.preventDefault(); move(direction); }
  });
  let touchStart = null;
  boardElement.addEventListener("touchstart", event => { touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }; }, { passive: true });
  boardElement.addEventListener("touchend", event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  }, { passive: true });
  if (load()) render(); else newGame();
})();

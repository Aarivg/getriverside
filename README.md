# GetRiverside!

An unofficial, playable recreation of Carson Amos's Riverside themed 2048 game.
Combine matching Loudoun County school tiles to reach Riverside High School.

[Play the game](https://aarivg.github.io/getriverside/) · [Original archived site](https://web.archive.org/web/20250301171057/https://getriverside.com/)

## How to play

Use the arrow keys or swipe to move tiles. Matching schools merge into the next
school and increase your score. Press Space or select **New game** to restart.
Your current board and best score are saved in your browser.

## School progression

Dominion → Loudoun County → Heritage → Stone Bridge → Tuscarora → Potomac Falls
→ Freedom → Woodgrove → Independence → John Champe → Riverside.

## Run locally

No build step or dependencies are needed. From this repository, run:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

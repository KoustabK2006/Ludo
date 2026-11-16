# Ludo

A responsive 2–4 player Ludo web game built from scratch using vanilla HTML5, CSS3, and modular object-oriented JavaScript, featuring custom token icons, glassmorphism UI, and live player statistics.
🎲 Ludo Game (@RAGE)

A responsive, browser-based 2–4 player Ludo web game built from scratch using vanilla HTML5, CSS3, and modular Object-Oriented JavaScript, featuring a frosted glassmorphism interface, customizable player token icons, synchronized dual dice controls, and live match analytics.

🔗 Play Live on GitHub Pages

✨ Features

2, 3, or 4 Player Modes: Switch effortlessly between 2P (balanced diagonal 1v1), 3P, and 4P before starting a match.

Custom Token Shapes: Each player can customize their 4 pawns before the match starts using 6 distinct icons (Heart, Sun, Moon, Paper Plane, Puzzle Piece, or Crown).

Dual Synchronized Dice Controls: Roll your turn using either your dedicated player card dice or the universal central dice at the heart of the board—both stay synchronized in face value, pulse animation, and active player color.

Intuitive Pawn Movement: Click a glowing movable pawn directly on the 15×15 board or select it from your side control panel, with hover highlighting linking both together.

Complete Classic Ludo Rules:

Roll a 6 to unlock a pawn from your home yard and earn a bonus roll.

Three consecutive 6s forfeit the turn automatically.

Land on opponent pieces to capture them (+50 pts) and earn a bonus roll, unless they are protected on a Star or Safe House tile.

Multi-pawn stacking renders up to 4 pawns cleanly on a single tile without hiding safe-zone landmarks.

Live Scoring & Player Analytics: Click the i info button on any active player card to view real-time stats (Killed Pawns, Got Captured, Got Saved, Three Sixes, Wasted Turns, Wasted Rolls) alongside a 1–6 dice roll frequency breakdown.

Responsive Glassmorphism UI: Adapts seamlessly across desktop, laptop, tablet, and mobile screens, with easy-to-tune CSS variables (--glass-alpha, --color-alpha, --glass-blur).

🛠️ Tech Stack

HTML5: Semantic layout for the 15×15 board grid, player panels, and analytics modals.

CSS3: CSS Grid & Flexbox, custom properties (:root), keyframe animations, and frosted glass (backdrop-filter) styling.

Vanilla JavaScript (ES6+): Modular OOP game engine with zero external frameworks.

Font Awesome 6 & Google Fonts: Crisp vector dice, pawn icons, and Karla / Barlow typography.

📂 Project Structure

Ludo-Game/
├── index.html # Main game layout, 15x15 board, player panels & modals
├── style.css # Glassmorphism theme, animations & responsive breakpoints
├── main.js # UI controller, board renderer, dual dice & input handling
├── background.jpg # Ambient board backdrop
├── README.md # Project documentation
└── backend-logic/
├── LudoVariables.js # Board coordinates, turn order, safe tiles & home mappings
├── LudoEventManager.js # Lightweight pub/sub event bus (LEM)
├── LudoPiece.js # Individual pawn movement, unlocking, captures & goal logic
└── LudoBoard.js # Match state, dice rolling, turn rotation & winner ranking

🚀 Running Locally

No build tools or dependencies are required:

Clone the repository:

git clone https://github.com/KoustabK2006/Ludo-Game.git

Open index.html directly in any modern web browser (or serve it with VS Code Live Server).

🎨 Customizing the Glass Theme

You can adjust the board's transparency and blur anytime at the top of style.css:

:root {
--glass-alpha: 0.1; /_ Tile & panel transparency _/
--color-alpha: 0.4; /_ Player room & path color opacity _/
--glass-blur: 20px; /_ Frosted glass blur intensity _/
}

📄 License

This project is open source and available for personal and educational use.

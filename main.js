// Ludo Game Mechanics & UI Controller

let LB = null;
let gameStarted = false;
let selectedPlayerCount = 4;

let hasRolled = false;
let rolledNumber = -1;
let movablePawns = [false, false, false, false];

let allTurns = [0, 0, 0, 0];
let allRolls = [0, 0, 0, 0];

const colors = ["red", "yellow", "blue", "green"];
const diceWords = ["one", "two", "three", "four", "five", "six"];

const starPoints = ["#pxl011", "#pxl050", "#pxl024", "#pxl037"];
const housePoints = ["#pxl003", "#pxl016", "#pxl029", "#pxl042"];

const tokenShapes = [
    "fa-solid fa-heart",
    "fa-regular fa-sun",
    "fa-regular fa-moon",
    "fa-regular fa-paper-plane",
    "fa-solid fa-puzzle-piece",
    "fa-solid fa-crown",
];

const THEME_COLORS = {
    red: {
        solid: "#ef4444",
        rgb: "239, 68, 68",
        glass: "rgba(239, 68, 68, 0.22)",
        popup: "rgba(254, 242, 242, 0.92)",
        glow: "rgba(239, 68, 68, 0.55)",
    },
    yellow: {
        solid: "#f59e0b",
        rgb: "245, 158, 11",
        glass: "rgba(245, 158, 11, 0.22)",
        popup: "rgba(255, 251, 235, 0.92)",
        glow: "rgba(245, 158, 11, 0.55)",
    },
    blue: {
        solid: "#2563eb",
        rgb: "37, 99, 235",
        glass: "rgba(37, 99, 235, 0.22)",
        popup: "rgba(239, 246, 255, 0.92)",
        glow: "rgba(37, 99, 235, 0.55)",
    },
    green: {
        solid: "#10b981",
        rgb: "16, 185, 129",
        glass: "rgba(16, 185, 129, 0.22)",
        popup: "rgba(236, 253, 245, 0.92)",
        glow: "rgba(16, 185, 129, 0.55)",
    },
};

const RGBPlayerColors = [
    THEME_COLORS.red.glass,
    THEME_COLORS.yellow.glass,
    THEME_COLORS.blue.glass,
    THEME_COLORS.green.glass,
];

const RGBDiceColors = [
    THEME_COLORS.red.solid,
    THEME_COLORS.yellow.solid,
    THEME_COLORS.blue.solid,
    THEME_COLORS.green.solid,
];

const RGBPopUpColors = [
    THEME_COLORS.red.popup,
    THEME_COLORS.yellow.popup,
    THEME_COLORS.blue.popup,
    THEME_COLORS.green.popup,
];

let killedPawns = [0, 0, 0, 0];
let gotCaptured = [0, 0, 0, 0];
let gotSaved = [0, 0, 0, 0];
let threeSixes = [0, 0, 0, 0];
let wastedTurns = [0, 0, 0, 0];
let wastedRolls = [0, 0, 0, 0];
let score = [0, 0, 0, 0];

let rollCounter = Array.from({ length: 4 }, () => Array(6).fill(0));

const defaultPawnProperties = {
    red: {
        classList: "fa-solid fa-heart",
        style: {
            color: THEME_COLORS.red.solid,
            filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5))",
        },
    },
    yellow: {
        classList: "fa-solid fa-crown",
        style: {
            color: THEME_COLORS.yellow.solid,
            filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.55))",
        },
    },
    blue: {
        classList: "fa-regular fa-paper-plane",
        style: {
            color: THEME_COLORS.blue.solid,
            filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5))",
        },
    },
    green: {
        classList: "fa-solid fa-puzzle-piece",
        style: {
            color: THEME_COLORS.green.solid,
            filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5))",
        },
    },
};

let pawnProperties = structuredClone(defaultPawnProperties);
let activePopUps = [false, false, false, false];
let lastStatusMessage = "";

function setStatus(htmlMessage) {
    lastStatusMessage = htmlMessage;
    const banner = document.getElementById("status-banner");
    if (banner) banner.innerHTML = htmlMessage;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getPlayersForCount(count) {
    if (count === 2) {
        return [
            { playerId: 1, color: "red" },
            { playerId: 3, color: "blue" },
        ];
    }
    if (count === 3) {
        return [
            { playerId: 1, color: "red" },
            { playerId: 2, color: "yellow" },
            { playerId: 3, color: "blue" },
        ];
    }
    return [
        { playerId: 1, color: "red" },
        { playerId: 2, color: "yellow" },
        { playerId: 3, color: "blue" },
        { playerId: 4, color: "green" },
    ];
}

function updateActivePlayerCards(count) {
    const activeIds = new Set(getPlayersForCount(count).map((p) => p.playerId));
    for (let id = 1; id <= 4; id++) {
        const panel = document.getElementById(`player${id}`);
        if (!panel) continue;
        panel.classList.toggle("inactive-player", !activeIds.has(id));
    }
}

// Player Count Selector & Pawn Icon Customizer

document.querySelectorAll(".count-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        if (gameStarted) return;
        document
            .querySelectorAll(".count-btn")
            .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        selectedPlayerCount = Number(btn.dataset.count);
        updateActivePlayerCards(selectedPlayerCount);
    });
});

colors.forEach((color, colorIdx) => {
    for (let i = 1; i <= 6; i++) {
        const shapeBtn = document.getElementById(`piece${i}-${color}`);
        if (!shapeBtn) continue;

        shapeBtn.addEventListener("click", () => {
            if (gameStarted) return;
            const playerId = colorIdx + 1;
            const chosenIcon = tokenShapes[i - 1];

            document
                .querySelectorAll(`#player${playerId} .pieces .piece`)
                .forEach((b) => b.classList.remove("active-shape"));
            shapeBtn.classList.add("active-shape");

            for (let j = 1; j <= 4; j++) {
                const pawnIcon = document.querySelector(
                    `#player${playerId} .pawns .pawn${j} i`,
                );
                if (pawnIcon) pawnIcon.className = chosenIcon;
            }
            pawnProperties[color].classList = chosenIcon;
        });
    }
});

// Start Game Button

document.getElementById("start-btn").addEventListener("click", () => {
    if (gameStarted) return;
    LEM.clear();
    activateEvents();
    LB = new LudoBoard();
    LB.init(getPlayersForCount(selectedPlayerCount));
});

function handleDiceRoll() {
    if (!gameStarted || !LB || LB.isGameOver || hasRolled) return;

    const currentColor = LB.currentTurn.color;
    const currentPlayerId = LB.currentTurn.playerId;

    const playerDiceBtn = document.getElementById(`dice-${currentColor}`);
    const playerDiceIcon = playerDiceBtn?.querySelector("i");
    const centerDiceBtn = document.getElementById("center-dice");
    const centerDiceIcon = centerDiceBtn?.querySelector("i");

    rolledNumber = LB.roll();
    hasRolled = true;

    // Trigger visual roll effect on central dice
    if (centerDiceBtn) {
        centerDiceBtn.classList.add("rolling");
        setTimeout(() => centerDiceBtn.classList.remove("rolling"), 350);
    }

    const faceClass =
        rolledNumber === 18
            ? "fa-solid fa-dice-one"
            : `fa-solid fa-dice-${diceWords[rolledNumber - 1]}`;

    if (playerDiceIcon) {
        playerDiceIcon.className = faceClass;
        playerDiceIcon.style.color = RGBDiceColors[currentPlayerId - 1];
    }
    if (centerDiceIcon) {
        centerDiceIcon.className = faceClass;
        centerDiceIcon.style.color = RGBDiceColors[currentPlayerId - 1];
    }

    const currentPieces = Object.values(LB.pieces[currentPlayerId]);
    movablePawns = currentPieces.map((pawn) =>
        rolledNumber === 18 ? false : pawn.isMovable(rolledNumber),
    );

    const oldTurn = { ...LB.currentTurn };

    // Handle Three-Sixes Penalty OR No Legal Moves Available
    if (rolledNumber === 18 || !movablePawns.includes(true)) {
        const reason =
            rolledNumber === 18
                ? `<strong>Player ${oldTurn.playerId} (${capitalize(oldTurn.color)})</strong> rolled three 6s in a row — Turn forfeited!`
                : `<strong>Player ${oldTurn.playerId} (${capitalize(oldTurn.color)})</strong> rolled <strong>${rolledNumber}</strong> — No valid moves!`;

        // Force availableTurns to 0 so a locked 6 never soft-locks the turn
        LB.currentTurn.availableTurns = 0;
        LB.rolledSixes = 0;
        wastedTurns[oldTurn.playerId - 1] += 1;

        if (playerDiceBtn) playerDiceBtn.classList.remove("blink");
        if (centerDiceBtn) centerDiceBtn.classList.remove("blink");

        LB.nextTurn();
        hasRolled = false;
        rolledNumber = -1;
        movablePawns = [false, false, false, false];

        highlightActivePlayer(
            oldTurn.playerId,
            LB.currentTurn.playerId,
            LB.currentTurn.color,
        );
        renderBoard();
        setStatus(
            `${reason} &nbsp;|&nbsp; <strong>Player ${LB.currentTurn.playerId} (${capitalize(LB.currentTurn.color)})</strong>'s turn to roll.`,
        );
        return;
    }

    allRolls[oldTurn.playerId - 1] += rolledNumber;
    updateTurnsRollsScore(oldTurn.playerId);

    // Stop dice blink on both dices and highlight movable pawns
    if (playerDiceBtn) playerDiceBtn.classList.remove("blink");
    if (centerDiceBtn) centerDiceBtn.classList.remove("blink");
    if (centerDiceIcon) {
        centerDiceIcon.style.color = RGBDiceColors[oldTurn.playerId - 1];
    }

    document
        .querySelectorAll(`#player${LB.currentTurn.playerId} .pawn-btn`)
        .forEach((btn, idx) => {
            const btnIcon = btn.querySelector("i");
            if (movablePawns[idx]) {
                btn.classList.add("blink");
                if (btnIcon)
                    btnIcon.style.color =
                        RGBDiceColors[LB.currentTurn.playerId - 1];
            } else {
                btn.classList.remove("blink");
                if (btnIcon)
                    btnIcon.style.color =
                        RGBDiceColors[LB.currentTurn.playerId - 1];
            }
        });

    renderBoard();
    setStatus(
        `<strong>Player ${LB.currentTurn.playerId} (${capitalize(LB.currentTurn.color)})</strong> rolled <strong>${rolledNumber}</strong> — Click a glowing pawn to move!`,
    );
}

// Player controller dice buttons
document.querySelectorAll(".dice").forEach((diceBtn) => {
    diceBtn.addEventListener("click", () => {
        const color = diceBtn.dataset.color;
        if (!gameStarted || !LB || LB.isGameOver) return;
        if (LB.currentTurn.color !== color || hasRolled) return;
        handleDiceRoll();
    });
});

// Universal central dice button
const universalCenterDice = document.getElementById("center-dice");
if (universalCenterDice) {
    universalCenterDice.addEventListener("click", () => {
        handleDiceRoll();
    });
}

// =========================================================
// Pawn Selection & Movement (Panel Buttons + Direct Board Click)
// =========================================================

let pawnButtonsBound = false;

function activatePawnButtons() {
    if (pawnButtonsBound) return;
    pawnButtonsBound = true;

    document.querySelectorAll(".pawn-btn").forEach((btn) => {
        const color = btn.dataset.color;
        const pawnName = btn.dataset.pawn;

        btn.addEventListener("mouseenter", () => {
            if (!gameStarted || !LB) return;
            const boardPawnEl = document.querySelector(
                `.board-pawn[data-pawn="${pawnName}"]`,
            );
            if (boardPawnEl) boardPawnEl.classList.add("highlight-pawn");
        });

        btn.addEventListener("mouseleave", () => {
            document
                .querySelectorAll(".board-pawn.highlight-pawn")
                .forEach((el) => el.classList.remove("highlight-pawn"));
        });

        btn.addEventListener("click", () => {
            executePawnMove(color, pawnName);
        });
    });
}

function executePawnMove(color, finalPawnName) {
    if (!gameStarted || !LB || LB.isGameOver) return;
    if (!hasRolled || LB.currentTurn.color !== color) return;

    const pawnIdx = Number(finalPawnName[1]) - 1;
    if (!movablePawns[pawnIdx]) return;

    const playerId = LB.currentTurn.playerId;
    const pawn = LB.pieces[playerId][finalPawnName];
    if (!pawn) return;

    const oldTurn = { ...LB.currentTurn };

    hasRolled = false;

    pawn.move(rolledNumber);
    updateTurnsRollsScore(playerId);

    document.querySelectorAll(`#player${playerId} .pawn-btn`).forEach((btn) => {
        btn.classList.remove("blink");
        const icon = btn.querySelector("i");
        if (icon) icon.style.color = RGBDiceColors[playerId - 1];
    });

    if (LB.currentTurn.availableTurns === 0) {
        allTurns[playerId - 1] += 1;
        updateTurnsRollsScore(playerId);
    }

    const hadBonusTurn =
        LB.currentTurn.availableTurns > 0 &&
        !LB.isGameOver &&
        LB.colorOwners[color];

    LB.nextTurn();
    rolledNumber = -1;
    movablePawns = [false, false, false, false];

    renderBoard();

    if (!LB.isGameOver) {
        highlightActivePlayer(
            oldTurn.playerId,
            LB.currentTurn.playerId,
            LB.currentTurn.color,
        );
        if (hadBonusTurn) {
            setStatus(
                `Bonus roll! <strong>Player ${LB.currentTurn.playerId} (${capitalize(LB.currentTurn.color)})</strong> — Roll the dice again!`,
            );
        } else {
            setStatus(
                `<strong>Player ${LB.currentTurn.playerId} (${capitalize(LB.currentTurn.color)})</strong>'s turn — Click your dice to roll!`,
            );
        }
    }
}

function highlightActivePlayer(oldPlayerId, newPlayerId, newColor) {
    for (let id = 1; id <= 4; id++) {
        const panel = document.getElementById(`player${id}`);
        const c = colors[id - 1];
        const diceBtn = document.getElementById(`dice-${c}`);
        const diceIcon = diceBtn?.querySelector("i");

        if (id === newPlayerId) {
            panel.style.backgroundColor = RGBPlayerColors[id - 1];
            panel.style.setProperty("--active-glow", THEME_COLORS[c].glow);
            panel.style.setProperty("--active-solid", THEME_COLORS[c].solid);
            panel.classList.add("active-turn");
            if (diceBtn) diceBtn.classList.add("blink");
            if (diceIcon) diceIcon.style.color = RGBDiceColors[id - 1];
        } else {
            panel.style.backgroundColor = "";
            panel.classList.remove("active-turn");
            if (diceBtn) diceBtn.classList.remove("blink");
            if (diceIcon) diceIcon.style.color = RGBDiceColors[id - 1];
        }
    }

    const centerDiceBtn = document.getElementById("center-dice");
    const centerDiceIcon = centerDiceBtn?.querySelector("i");
    if (centerDiceBtn && newPlayerId && newColor) {
        centerDiceBtn.classList.add("blink");
        centerDiceBtn.style.borderColor = THEME_COLORS[newColor].solid;
        centerDiceBtn.style.setProperty(
            "--active-glow",
            THEME_COLORS[newColor].glow,
        );
        centerDiceBtn.style.setProperty(
            "--active-solid",
            THEME_COLORS[newColor].solid,
        );
        if (centerDiceIcon) {
            centerDiceIcon.style.color = THEME_COLORS[newColor].solid;
        }
    }
}

// Full Board Renderer (Supports Multi-Pawn Stacks & Safe Tiles)

function renderBoard() {
    document.querySelectorAll(".pxls, .rooms > div").forEach((cell) => {
        cell.innerHTML = "";
        cell.classList.remove("safe-highlight");
    });

    const piecesByPos = {};
    if (gameStarted && LB) {
        for (const playerPieces of Object.values(LB.pieces)) {
            Object.values(playerPieces).forEach((pawn, idx) => {
                if (!piecesByPos[pawn.position])
                    piecesByPos[pawn.position] = [];
                piecesByPos[pawn.position].push({ pawn, idx });
            });
        }
    }

    starPoints.forEach((selector) => {
        const cell = document.querySelector(selector);
        if (!cell) return;
        const posNum = Number(selector.replace("#pxl", ""));
        const occupied = Boolean(piecesByPos[posNum]?.length);
        cell.classList.add("safe-highlight");

        const landmark = document.createElement("span");
        landmark.className = `tile-landmark${occupied ? " occupied" : ""}`;
        landmark.innerHTML = `<i class="fa-regular fa-star"></i>`;
        cell.appendChild(landmark);
    });

    housePoints.forEach((selector) => {
        const cell = document.querySelector(selector);
        if (!cell) return;
        const posNum = Number(selector.replace("#pxl", ""));
        const occupied = Boolean(piecesByPos[posNum]?.length);
        cell.classList.add("safe-highlight");

        const landmark = document.createElement("span");
        landmark.className = `tile-landmark${occupied ? " occupied" : ""}`;
        landmark.innerHTML = `<i class="fa-solid fa-house-chimney"></i>`;
        cell.appendChild(landmark);
    });

    for (const [posStr, entries] of Object.entries(piecesByPos)) {
        const cellId = `pxl${String(posStr).padStart(3, "0")}`;
        const cell = document.getElementById(cellId);
        if (!cell) continue;

        const stack = document.createElement("div");
        const countClass = Math.min(entries.length, 4);
        stack.className = `pawn-stack stack-${countClass}`;

        entries.forEach(({ pawn, idx }) => {
            const pawnEl = document.createElement("span");
            pawnEl.className = "board-pawn";
            pawnEl.dataset.pawn = pawn.name;
            pawnEl.dataset.color = pawn.color;

            const isCurrentMovable =
                hasRolled &&
                LB &&
                LB.currentTurn.color === pawn.color &&
                movablePawns[idx];

            if (isCurrentMovable) {
                pawnEl.classList.add("movable-pawn");
                pawnEl.title = `Move ${capitalize(pawn.color)} Pawn ${idx + 1}`;
                pawnEl.addEventListener("click", (e) => {
                    e.stopPropagation();
                    executePawnMove(pawn.color, pawn.name);
                });
            }

            const icon = document.createElement("i");
            icon.className = pawnProperties[pawn.color].classList;
            icon.style.color = pawnProperties[pawn.color].style.color;
            icon.style.filter = pawnProperties[pawn.color].style.filter;

            pawnEl.appendChild(icon);
            stack.appendChild(pawnEl);
        });

        cell.appendChild(stack);
    }
}

function updateTurnsRollsScore(playerId) {
    const label = document.querySelector(`#player${playerId} .texts h6`);
    if (!label) return;
    label.innerHTML = `Turns : ${allTurns[playerId - 1]}<br>Rolls : ${allRolls[playerId - 1]}<br>Score : ${score[playerId - 1]}`;
}

// Player Statistics & Victory Modals

function updateStats(playerId) {
    let totalRolledValue = 0;
    for (let i = 0; i < 6; i++) {
        totalRolledValue += (i + 1) * rollCounter[playerId - 1][i];
    }
    wastedRolls[playerId - 1] = Math.max(
        0,
        totalRolledValue - allRolls[playerId - 1],
    );

    const modal = document.getElementById(`pop-up${playerId}`);
    if (!modal) return;

    modal.querySelector(".stat-killed").textContent =
        `Killed Pawns: ${killedPawns[playerId - 1]}`;
    modal.querySelector(".stat-captured").textContent =
        `Got Captured: ${gotCaptured[playerId - 1]}`;
    modal.querySelector(".stat-saved").textContent =
        `Got Saved: ${gotSaved[playerId - 1]}`;
    modal.querySelector(".stat-sixes").textContent =
        `Three Sixes: ${threeSixes[playerId - 1]}`;
    modal.querySelector(".stat-wasted-turns").textContent =
        `Wasted Turns: ${wastedTurns[playerId - 1]}`;
    modal.querySelector(".stat-wasted-rolls").textContent =
        `Wasted Rolls: ${wastedRolls[playerId - 1]}`;

    for (let i = 1; i <= 6; i++) {
        modal.querySelector(`.counter-${i} b`).textContent =
            rollCounter[playerId - 1][i - 1];
    }
}

function closeAllModals() {
    const backdrop = document.getElementById("modal-backdrop");
    backdrop.classList.remove("open");

    for (let i = 1; i <= 4; i++) {
        document.getElementById(`pop-up${i}`).style.display = "none";
        document.getElementById(`cross-${i}`).style.display = "none";
        activePopUps[i - 1] = false;
    }

    document.getElementById("win-container").style.display = "none";
}

document.querySelectorAll(".player-info").forEach((infoBtn) => {
    infoBtn.addEventListener("click", () => {
        if (!gameStarted || !LB) return;
        const index = Number(infoBtn.dataset.player);
        const color = colors[index - 1];
        const wasOpen = activePopUps[index - 1];

        closeAllModals();

        if (!wasOpen) {
            const backdrop = document.getElementById("modal-backdrop");
            const modal = document.getElementById(`pop-up${index}`);
            const cross = document.getElementById(`cross-${index}`);

            modal.style.borderColor = RGBDiceColors[index - 1];
            modal.style.backgroundColor = RGBPopUpColors[index - 1];
            modal.querySelector("hr").style.borderColor =
                RGBDiceColors[index - 1];

            modal.querySelector("h1").innerHTML =
                `Player ${index} (${capitalize(color)}) <i class="${pawnProperties[color].classList}"></i>`;

            backdrop.classList.add("open");
            modal.style.display = "flex";
            cross.style.display = "flex";
            updateStats(index);
            activePopUps[index - 1] = true;
        }
    });
});

document.querySelectorAll(".cross-x").forEach((cross) => {
    cross.addEventListener("click", closeAllModals);
});

document.getElementById("modal-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-backdrop") {
        closeAllModals();
    }
});

function gameOver(board) {
    closeAllModals();
    const centerDiceBtn = document.getElementById("center-dice");
    if (centerDiceBtn) centerDiceBtn.classList.remove("blink");

    const backdrop = document.getElementById("modal-backdrop");
    const winModal = document.getElementById("win-container");
    const list = document.getElementById("leaderboard-list");

    const ranked = Object.values(board.winners).sort((a, b) => a.rank - b.rank);
    const medals = [
        "🥇 1st Place",
        "🥈 2nd Place",
        "🥉 3rd Place",
        "4th Place",
    ];

    list.innerHTML = ranked
        .map((entry) => {
            const pScore = score[entry.playerId - 1];
            const iconClass = pawnProperties[entry.color].classList;
            return `
                <div class="leaderboard-item" style="border-color: ${THEME_COLORS[entry.color].solid}">
                    <span>${medals[entry.rank - 1] || `#${entry.rank}`} — Player ${entry.playerId} (${capitalize(entry.color)}) <i class="${iconClass}" style="color: ${THEME_COLORS[entry.color].solid}"></i></span>
                    <span>${pScore} pts</span>
                </div>
            `;
        })
        .join("");

    backdrop.classList.add("open");
    winModal.style.display = "flex";
    setStatus(
        `🏆 Match complete! <strong>Player ${ranked[0].playerId} (${capitalize(ranked[0].color)})</strong> wins!`,
    );
}

// Reset / Play Again Flow

document.getElementById("play-again-btn").addEventListener("click", () => {
    closeAllModals();
    gameStarted = false;
    hasRolled = false;
    rolledNumber = -1;
    movablePawns = [false, false, false, false];
    LB = null;

    allTurns = [0, 0, 0, 0];
    allRolls = [0, 0, 0, 0];
    killedPawns = [0, 0, 0, 0];
    gotCaptured = [0, 0, 0, 0];
    gotSaved = [0, 0, 0, 0];
    threeSixes = [0, 0, 0, 0];
    wastedTurns = [0, 0, 0, 0];
    wastedRolls = [0, 0, 0, 0];
    score = [0, 0, 0, 0];
    rollCounter = Array.from({ length: 4 }, () => Array(6).fill(0));

    for (let id = 1; id <= 4; id++) {
        updateTurnsRollsScore(id);
        const panel = document.getElementById(`player${id}`);
        panel.style.backgroundColor = "";
        panel.classList.remove("active-turn");

        const infoBtn = document.getElementById(`player-info${id}`);
        if (infoBtn) infoBtn.style.display = "none";

        const piecesRow = panel.querySelector(".pieces");
        if (piecesRow) piecesRow.classList.remove("hidden-pieces");

        const diceBtn = panel.querySelector(".dice");
        const diceIcon = diceBtn?.querySelector("i");
        if (diceBtn) diceBtn.classList.remove("blink");
        if (diceIcon) {
            diceIcon.className = "fa-solid fa-dice";
            diceIcon.style.color = THEME_COLORS[colors[id - 1]].solid;
        }

        panel.querySelectorAll(".pawn-btn i").forEach((icon) => {
            icon.style.color = THEME_COLORS[colors[id - 1]].solid;
        });
    }

    const centerDiceBtn = document.getElementById("center-dice");
    const centerDiceIcon = centerDiceBtn?.querySelector("i");
    if (centerDiceBtn) {
        centerDiceBtn.style.display = "none";
        centerDiceBtn.classList.remove("blink");
        centerDiceBtn.classList.remove("rolling");
        centerDiceBtn.style.borderColor = "";
    }
    if (centerDiceIcon) {
        centerDiceIcon.className = "fa-solid fa-dice";
        centerDiceIcon.style.color = "";
    }

    updateActivePlayerCards(selectedPlayerCount);

    const startBtn = document.getElementById("start-btn");
    startBtn.style.display = "block";
    startBtn.style.opacity = "1";
    startBtn.style.backdropFilter = "blur(15px)";

    const countSelector = document.getElementById("player-count-selector");
    if (countSelector) countSelector.classList.remove("hidden-selector");

    renderBoard();
    setStatus(
        `Choose token icons &amp; players, then press <strong>START</strong>`,
    );
});

// Event Manager Subscriptions

function activateEvents() {
    LEM.on(LEMEvents.LudoBegin, (ludoBoard) => {
        gameStarted = true;
        activatePawnButtons();
        renderBoard();

        const startBtn = document.getElementById("start-btn");
        startBtn.style.backdropFilter = "blur(0px)";
        startBtn.style.opacity = "0";
        setTimeout(() => {
            startBtn.style.display = "none";
        }, 400);

        const centerDiceBtn = document.getElementById("center-dice");
        const centerDiceIcon = centerDiceBtn?.querySelector("i");
        if (centerDiceBtn) centerDiceBtn.style.display = "flex";
        if (centerDiceIcon) {
            centerDiceIcon.className = "fa-solid fa-dice";
            centerDiceIcon.style.color =
                THEME_COLORS[ludoBoard.currentTurn.color].solid;
        }

        const countSelector = document.getElementById("player-count-selector");
        if (countSelector) countSelector.classList.add("hidden-selector");

        document
            .querySelectorAll(".pieces")
            .forEach((el) => el.classList.add("hidden-pieces"));
        ludoBoard.players.forEach((p) => {
            const infoBtn = document.getElementById(`player-info${p.playerId}`);
            if (infoBtn) infoBtn.style.display = "flex";
        });

        highlightActivePlayer(
            null,
            ludoBoard.currentTurn.playerId,
            ludoBoard.currentTurn.color,
        );
        setStatus(
            `Game started! <strong>Player ${ludoBoard.currentTurn.playerId} (${capitalize(ludoBoard.currentTurn.color)})</strong> rolls first!`,
        );
    });

    LEM.on(LEMEvents.LudoKill, ({ killer, victim }) => {
        setStatus(
            `⚔️ <strong>Player ${killer.playerId} (${capitalize(killer.color)})</strong> captured <strong>Player ${victim.playerId} (${capitalize(victim.color)})</strong>! (+50 pts)`,
        );
    });

    LEM.on(LEMEvents.LudoGoal, ({ piece }) => {
        setStatus(
            `🎯 <strong>Player ${piece.playerId} (${capitalize(piece.color)})</strong> got a pawn home! (+100 pts)`,
        );
    });

    LEM.on(LEMEvents.LudoEnd, (board) => {
        gameOver(board);
    });
}

renderBoard();

function initLiveAtmosphericBackground() {
    let currentHue = 0;
    const cycleDurationMs = 60000;
    let previousTimestamp = performance.now();

    function updateLiveHue(timestamp) {
        const elapsed = timestamp - previousTimestamp;
        previousTimestamp = timestamp;

        currentHue = (currentHue + (elapsed / cycleDurationMs) * 255) % 255;
        document.documentElement.style.setProperty(
            "--bg-hue",
            currentHue.toFixed(3),
        );

        requestAnimationFrame(updateLiveHue);
    }

    requestAnimationFrame(updateLiveHue);
}

initLiveAtmosphericBackground();

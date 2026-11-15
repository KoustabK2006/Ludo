class LudoBoard {
    constructor() {
        this.pieces = {};
        this.players = [];
        this.colorOwners = {};
        this.playerColors = {};
        this.rolledSixes = 0;
        this.winners = {};
        this.currentTurn = {};
        this.oldTurn = {};
        this.isGameOver = false;
    }

    async init(playerData) {
        if (!playerData || !playerData.length) return;

        for (let item of playerData) {
            let { playerId, color } = item;
            if (!this.pieces || playerId in this.pieces) continue;

            this.pieces[playerId] = {};

            for (let i = 1; i <= 4; i++) {
                this.pieces[playerId][color[0] + i] = new LudoPiece(
                    color,
                    String(color[0]) + i,
                    playerId,
                    this
                );
            }

            this.players.push({ playerId, color });
            this.colorOwners[color] = playerId;
            this.playerColors[playerId] = color;
        }

        let rndPlayer = Math.floor(Math.random() * this.players.length);
        this.currentTurn = {
            playerId: this.players[rndPlayer].playerId,
            color: this.players[rndPlayer].color,
            availableTurns: 1
        };

        LEM.emit(LEMEvents.LudoBegin, this);
    }

    getPiece(name, playerId) {
        return this.pieces[playerId]?.[name] || null;
    }

    getPiecesOnPosition(num, playerId) {
        let pieces = [];
        if (playerId) {
            for (let piece of Object.values(this.pieces[playerId])) {
                if (piece.position === num) pieces.push(piece);
            }
        } else {
            for (let item of Object.values(this.pieces)) {
                for (let piece of Object.values(item)) {
                    if (piece.position === num) pieces.push(piece);
                }
            }
        }
        return pieces.length ? pieces : null;
    }

    nextTurn() {
        if (!this.currentTurn || this.isGameOver) return;
        if (this.currentTurn.availableTurns > 0) return;

        const activeColors = Object.keys(this.colorOwners);
        if (activeColors.length <= 1) {
            this.finishRemainingPlayers();
            return;
        }

        this.oldTurn = { ...this.currentTurn };

        const currentIndex = LudoTurnOrder.indexOf(this.currentTurn.color);
        let nextPlayer = null;
        let nextColor = null;

        for (let offset = 1; offset <= 4; offset++) {
            const candidateColor = LudoTurnOrder[(currentIndex + offset) % 4];
            if (this.colorOwners[candidateColor]) {
                nextColor = candidateColor;
                nextPlayer = this.colorOwners[candidateColor];
                break;
            }
        }

        if (!nextPlayer) return;

        this.currentTurn = {
            playerId: nextPlayer,
            color: nextColor,
            availableTurns: 1
        };

        this.rolledSixes = 0;
        LEM.emit(LEMEvents.LudoChangeTurn, this);
    }

    roll() {
        let roll = Math.ceil(Math.random() * 6);
        rollCounter[this.currentTurn.playerId - 1][roll - 1] += 1;
        this.currentTurn.availableTurns -= 1;

        if (roll === 6) {
            this.currentTurn.availableTurns += 1;
            this.rolledSixes += 1;
        }

        if (this.rolledSixes === 3) {
            this.currentTurn.availableTurns = 0;
            this.rolledSixes = 0;
            threeSixes[this.currentTurn.playerId - 1] += 1;
            roll = 18;
        }

        LEM.emit(LEMEvents.LudoRoll, { player: this.currentTurn, roll });
        return roll;
    }

    addWinner(color) {
        const playerId = this.colorOwners[color];
        if (!playerId) return;

        const rank = Object.keys(this.winners).length + 1;
        this.winners[color] = {
            playerId,
            color,
            rank,
            pieces: this.pieces[playerId]
        };

        delete this.colorOwners[color];
        delete this.playerColors[playerId];

        LEM.emit(LEMEvents.LudoWin, { playerId, color, rank, board: this });

        if (Object.keys(this.colorOwners).length <= 1) {
            this.finishRemainingPlayers();
        }
    }

    finishRemainingPlayers() {
        if (this.isGameOver) return;
        for (const [color, playerId] of Object.entries(this.colorOwners)) {
            const rank = Object.keys(this.winners).length + 1;
            this.winners[color] = {
                playerId,
                color,
                rank,
                pieces: this.pieces[playerId]
            };
            delete this.colorOwners[color];
            delete this.playerColors[playerId];
        }
        this.isGameOver = true;
        LEM.emit(LEMEvents.LudoEnd, this);
    }
}
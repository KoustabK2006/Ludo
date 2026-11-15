class LudoPiece {
    constructor(color, name, playerId, board) {
        this.name = name;
        this.color = color;
        this.board = board;
        this.playerId = playerId;
        this.position = LudoHomePositions[color][0];

        for (let pos of LudoHomePositions[color]) {
            if (!this.board.getPiecesOnPosition(pos)) {
                this.position = pos;
                break;
            }
        }

        this.isLocked = true;
        this.reachedGoal = false;
        this.isSafe = false;
        this.wasLastKill = false;
    }

    move(num) {
        if (!this.position || this.reachedGoal) return;

        // Only unlock on a 6 if locked
        if (this.isLocked) {
            if (num === 6) {
                this.unlock();
                score[this.playerId - 1] += 10;
                LEM.emit(LEMEvents.LudoMove, { piece: this, steps: num, unlocked: true });
            }
            return;
        }

        if (!this.isMovable(num)) return;

        if (this.wasLastKill) this.wasLastKill = false;

        for (let i = 1; i <= num; i++) {
            if (this.position === 52) {
                this.position = 0;
            }

            if (LudoEntrypoints[this.color] === this.position) {
                this.position = LudoWinningHallPositions[this.color][0];
                continue;
            }

            this.position += 1;

            // Check if piece reached the center goal
            if (!this.reachedGoal && LudoWinningPositions[this.color] === this.position) {
                this.reachedGoal = true;
                this.isSafe = true;
                this.board.currentTurn.availableTurns += 1;
                this.board.rolledSixes = 0;
                score[this.playerId - 1] += 100 + num;
                LEM.emit(LEMEvents.LudoGoal, { piece: this });
                this.checkPlayerCompleted();
                return;
            }
        }

        score[this.playerId - 1] += num;

        // Check if landing square is a safe star/house tile
        this.isSafe = LudoStarPositions.includes(this.position);

        // Check for enemy pieces on the destination square
        let tilePieces = this.board.getPiecesOnPosition(this.position);
        if (tilePieces && tilePieces.length) {
            for (let piece of tilePieces) {
                if (piece.color === this.color) continue;
                this.kill(piece);
                break;
            }
        }

        LEM.emit(LEMEvents.LudoMove, { piece: this, steps: num, unlocked: false });
    }

    unlock() {
        this.position = LudoUnlockPositions[this.color];
        this.isLocked = false;
        this.isSafe = true;
    }

    kill(target) {
        if (target.isSafe || LudoStarPositions.includes(target.position)) {
            gotSaved[target.playerId - 1] += 1;
            return;
        }

        target.lock();
        gotCaptured[target.playerId - 1] += 1;
        killedPawns[this.playerId - 1] += 1;
        score[this.playerId - 1] += 50;
        score[target.playerId - 1] = Math.max(0, score[target.playerId - 1] - 25);
        this.wasLastKill = true;
        this.board.currentTurn.availableTurns += 1;
        this.board.rolledSixes = 0;

        LEM.emit(LEMEvents.LudoKill, { killer: this, victim: target });
    }

    lock() {
        for (let pos of LudoHomePositions[this.color]) {
            if (!this.board.getPiecesOnPosition(pos, this.playerId)) {
                this.position = pos;
                this.isLocked = true;
                this.isSafe = false;
                break;
            }
        }
    }

    checkPlayerCompleted() {
        const playerPieces = Object.values(this.board.pieces[this.playerId]);
        const allFinished = playerPieces.every((p) => p.reachedGoal);
        if (allFinished) {
            // Player has no pawns left to use a bonus turn, so pass turn forward
            this.board.currentTurn.availableTurns = 0;
            this.board.rolledSixes = 0;
            this.board.addWinner(this.color);
        }
    }

    isMovable(num) {
        if (!this.position || this.reachedGoal) return false;
        if (this.isLocked && num !== 6) return false;
        if (
            this.position > 99 &&
            this.position < 150 &&
            this.position + num > LudoWinningPositions[this.color]
        ) {
            return false;
        }
        return true;
    }
}
const LEMEvents = {
    LudoBegin: "ludoBegin",
    LudoChangeTurn: "ludoChangeTurn",
    LudoEnd: "ludoEnd",
    LudoGoal: "ludoGoal",
    LudoKill: "ludoKill",
    LudoMove: "ludoMove",
    LudoSelect: "ludoSelect",
    LudoRoll: "ludoRoll",
    LudoUpdate: "ludoUpdate",
    LudoWin: "ludoWin",
    LudoPieceSingleClick: "LudoPieceSingleClick",
    LudoPieceDoubleClick: "LudoPieceDoubleClick"
};

class LudoEventManager {
    constructor() {
        this.events = {};
    }

    on(eventName, fn) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push({ run: fn, type: "on" });
    }

    once(eventName, fn) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push({ run: fn, type: "once" });
    }

    clear(eventName) {
        if (eventName) {
            delete this.events[eventName];
        } else {
            this.events = {};
        }
    }

    emit(eventName, ...data) {
        const listeners = this.events[eventName];
        if (!listeners || !listeners.length) return;

        const remaining = [];
        for (const listener of listeners) {
            listener.run(...data);
            if (listener.type !== "once") {
                remaining.push(listener);
            }
        }

        if (remaining.length) {
            this.events[eventName] = remaining;
        } else {
            delete this.events[eventName];
        }
    }
}

const LEM = new LudoEventManager();
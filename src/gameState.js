import { playAudio, stopAudio } from './audio';

export class GameStateManager {
    constructor() {
        this.gameState = null;
        this.nextGameState = null;
    }

    start() {
        this.gameState = jsEscobaNew({});
        return this.gameState;
    }

    runAction(action, callback) {
        if (this.gameState.turnPlayerID === 0) {
            if (!action || !action.name) {
                return this.gameState;
            }
            this.gameState = jsRunAction(action);
        } else {
            if (this.gameState.setJustStarted && !action.forceBotAction) {
                return null;
            }
            const changed = this.runBotAction();
            if (!changed) {
                return null;
            }
        }

        this.playSound();

        // If the game is not ended and it's the bot's turn, we run the bot action after a delay
        if (!this.gameState.isEnded && this.gameState.turnPlayerID !== 0) {
            let waitTimeSeconds = 2;
            window.setTimeout(() => {
                if (this.gameState.turnPlayerID === 0) {
                    return;
                }
                const result = this.runAction({}, callback);
                if (result) {
                    callback(result);
                }
            }, waitTimeSeconds * 1000);
        }

        return this.gameState;
    }

    runBotAction() {
        const _before = JSON.stringify(this.gameState);
        this.gameState = jsBotRunAction();
        const _after = JSON.stringify(this.gameState);
        return _before !== _after;
    }

    playSound() {
        if (!this.gameState.actions || this.gameState.actions.length === 0) {
            return;
        }
        stopAudio();

        const action = this.gameState.actions[this.gameState.actions.length - 1];

        switch (action.name) {
            case "throw_card":
                if (action.capturedTableCards && action.capturedTableCards.length > 0) {
                    if (this.gameState.tableCards.length === 0) {
                        playAudio('escoba'); // Special sound for escoba
                    } else {
                        playAudio('capture_cards'); // Sound for capturing cards
                    }
                } else {
                    playAudio('throw_card'); // Sound for just throwing a card
                }
                break;
            default:
                // For any other actions, play a generic sound
                playAudio('sfx');
                break;
        }
    }
}


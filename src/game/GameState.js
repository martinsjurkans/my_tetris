import { GAME_CONSTANTS } from '../utils/Constants.js';
import LeaderboardManager from './LeaderboardManager.js';

class GameState {
    constructor() {
        this.state = GAME_CONSTANTS.GAME_STATES.PLAYING;
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.isLocking = false;
        this.hasSubmittedScore = false;
        this.gameBoardArray = Array(GAME_CONSTANTS.BOARD.HEIGHT).fill().map(() => Array(GAME_CONSTANTS.BOARD.WIDTH).fill(0));
        this.leaderboardManager = new LeaderboardManager();
    }

    start() {
        this.state = GAME_CONSTANTS.GAME_STATES.PLAYING;
    }

    isPlaying() {
        return this.state === GAME_CONSTANTS.GAME_STATES.PLAYING;
    }

    isPaused() {
        return this.state === GAME_CONSTANTS.GAME_STATES.PAUSED;
    }

    togglePause() {
        if (this.state === GAME_CONSTANTS.GAME_STATES.PLAYING) {
            this.state = GAME_CONSTANTS.GAME_STATES.PAUSED;
        } else if (this.state === GAME_CONSTANTS.GAME_STATES.PAUSED) {
            this.state = GAME_CONSTANTS.GAME_STATES.PLAYING;
        }
    }

    setGameOver() {
        this.state = GAME_CONSTANTS.GAME_STATES.GAME_OVER;
    }

    isGameOver() {
        return this.state === GAME_CONSTANTS.GAME_STATES.GAME_OVER;
    }

    getGameSpeed() {
        return Math.max(
            GAME_CONSTANTS.GAME_SPEED.MIN,
            GAME_CONSTANTS.GAME_SPEED.INITIAL * Math.pow(GAME_CONSTANTS.GAME_SPEED.DECREASE_RATE, this.level - 1)
        );
    }

    addScore(lines) {
        if (lines > 0) {
            const pointsPerLine = GAME_CONSTANTS.POINTS.LINE_POINTS[lines] || 100;
            const levelMultiplier = 1 + (this.level - 1) * GAME_CONSTANTS.POINTS.LEVEL_MULTIPLIER;
            
            // Calculate total points: points per line × number of lines × level multiplier
            const totalPoints = pointsPerLine * lines * levelMultiplier;
            
            this.score += Math.floor(totalPoints);
            this.linesCleared += lines;
            this.level = Math.floor(this.linesCleared / 10) + 1;
        }
    }

    reset() {
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.state = GAME_CONSTANTS.GAME_STATES.PLAYING;
        this.isLocking = false;
        this.hasSubmittedScore = false;
        this.gameBoardArray = Array(GAME_CONSTANTS.BOARD.HEIGHT).fill().map(() => Array(GAME_CONSTANTS.BOARD.WIDTH).fill(0));
        this.start(); // Immediately starts the game when resetting
    }
}

export default GameState;

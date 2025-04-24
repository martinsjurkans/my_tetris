import { GAME_CONSTANTS } from '../utils/Constants.js';
import LeaderboardManager from './LeaderboardManager.js';
import SoundManager from '../audio/SoundManager.js';

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
        this.soundManager = new SoundManager();
    }

    start() {
        this.state = GAME_CONSTANTS.GAME_STATES.PLAYING;
        // Start playing background music
        this.soundManager.playBackgroundMusic();
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
            // Pause background music when game is paused
            this.soundManager.pauseBackgroundMusic();
        } else if (this.state === GAME_CONSTANTS.GAME_STATES.PAUSED) {
            this.state = GAME_CONSTANTS.GAME_STATES.PLAYING;
            // Resume background music when game is unpaused
            this.soundManager.playBackgroundMusic();
        }
    }

    setGameOver() {
        this.state = GAME_CONSTANTS.GAME_STATES.GAME_OVER;
        this.soundManager.play('gameOver');
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
            
            // Play line clear sound
            this.soundManager.play('lineClear');
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

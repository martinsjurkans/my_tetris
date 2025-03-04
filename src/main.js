import GameState from './game/GameState.js';
import Board from './game/Board.js';
import Renderer from './ui/Renderer.js';
import InputHandler from './controllers/InputHandler.js';
import { GAME_CONSTANTS } from './utils/Constants.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('my-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // canvas size
        this.canvas.width = GAME_CONSTANTS.CANVAS.WIDTH;
        this.canvas.height = GAME_CONSTANTS.CANVAS.HEIGHT;
        
        this.gameState = new GameState();
        this.board = new Board(this.gameState);
        this.renderer = new Renderer(this.canvas, this.gameState, this.board);
        this.inputHandler = new InputHandler(this.gameState, this.board, this.renderer, this.canvas);
        
        this.lastTime = performance.now();
        this.dropCounter = 0;
        
        // Starts game
        this.gameState.start();
        
        // Start game loop
        this.gameLoop = this.gameLoop.bind(this);
        requestAnimationFrame(this.gameLoop);

        // Enables click handling
        if (window.setGame) {
            window.setGame(this);
        }
    }
    
    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update game state
        if (this.gameState.isPlaying() && !this.gameState.isPaused()) {
            // Enables fast movement (when holding down a movement button)
            this.inputHandler.update();
            
            // Tetrimino downward movement (falling)
            this.dropCounter += deltaTime;
            if (this.dropCounter > this.gameState.getGameSpeed()) {
                this.board.moveCurrentPiece(0, 1);
                this.dropCounter = 0;
            }
        }
        
        this.renderer.render();
        
        requestAnimationFrame(this.gameLoop);
    }
}

// Start the game when the window loads
window.onload = () => {
    new Game();
};

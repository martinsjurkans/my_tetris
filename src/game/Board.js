import { GAME_CONSTANTS } from '../utils/Constants.js';
import Tetromino from './Tetromino.js';

class Board {
    constructor(gameState) {
        this.gameState = gameState;
        this.soundManager = gameState.soundManager;
        this.currentPiece = null;
        this.nextPiece = null;
        this.heldPiece = null;
        this.canHold = true;
        this.board = Array(GAME_CONSTANTS.BOARD.HEIGHT).fill().map(() => Array(GAME_CONSTANTS.BOARD.WIDTH).fill(0));
        this.initializeBoard();
    }

    initializeBoard() {
        this.generateNewPiece();
    }

    generateNewPiece() {
        this.currentPiece = this.nextPiece || new Tetromino('T'); // Start with T piece
        this.nextPiece = Tetromino.getRandomTetromino();
        this.canHold = true;

        // Center the piece
        if (this.currentPiece) {
            this.currentPiece.x = Math.floor((GAME_CONSTANTS.BOARD.WIDTH - this.currentPiece.shape[0].length) / 2);
            this.currentPiece.y = 0;
        }

        // Check for game over
        if (this.checkCollision(this.currentPiece)) {
            this.gameState.setGameOver();
        }
    }

    holdPiece() {
        console.log('holdPiece method called');
        if (!this.currentPiece || !this.canHold) {
            console.log('Cannot hold: currentPiece missing or canHold is false');
            return;
        }
        
        if (this.heldPiece === null) {
            // First hold - store current piece type and get next piece
            const currentType = this.currentPiece.type;
            this.heldPiece = new Tetromino(currentType);
            this.generateNewPiece();
        } else {
            // Swap current piece with held piece
            const currentType = this.currentPiece.type;
            const holdType = this.heldPiece.type;
            
            // Store the current piece temporarily
            const tempPiece = this.currentPiece;
            
            // Create a new piece of the held type
            this.currentPiece = new Tetromino(holdType);
            
            // Update the held piece
            this.heldPiece = new Tetromino(currentType);
            
            // Reset position of current piece
            this.currentPiece.x = Math.floor((GAME_CONSTANTS.BOARD.WIDTH - this.currentPiece.shape[0].length) / 2);
            this.currentPiece.y = 0;
        }
        
        // Can't hold again until piece is placed
        this.canHold = false;
        console.log('Hold complete, canHold set to false');
    }

    moveCurrentPiece(dx, dy) {
        if (!this.currentPiece) return false;

        this.currentPiece.x += dx;
        this.currentPiece.y += dy;

        if (this.checkCollision(this.currentPiece)) {
            // In case of collision, move back
            this.currentPiece.x -= dx;
            this.currentPiece.y -= dy;

            // Play wall collision sound if horizontal movement
            if (dx !== 0 && dy === 0) {
                this.soundManager.play('wall');
            }
            
            // If moving down caused collision, lock the piece and play land sound
            if (dy > 0) {
                this.soundManager.play('land');
                this.lockPiece();
                return true;
            }
            return false;
        }
        
        // Play move sound for horizontal movement
        if (dx !== 0 && dy === 0) {
            this.soundManager.play('move');
        }
        
        return true;
    }

    rotateCurrentPiece() {
        if (!this.currentPiece) return false;

        this.currentPiece.rotate();
        if (this.checkCollision(this.currentPiece)) {
            // Try wall kick
            const originalX = this.currentPiece.x;
            
            // Play wall collision sound
            this.soundManager.play('wall');
            
            // Try moving right
            this.currentPiece.x++;
            if (!this.checkCollision(this.currentPiece)) {
                // Successful wall kick
                this.soundManager.play('rotate');
                return true;
            }
            
            // Try moving left
            this.currentPiece.x = originalX - 1;
            if (!this.checkCollision(this.currentPiece)) {
                // Successful wall kick
                this.soundManager.play('rotate');
                return true;
            }
            
            // If both fail, rotate back
            this.currentPiece.x = originalX;
            this.currentPiece.rotateBack();
            return false;
        }
        
        // Successful rotation
        this.soundManager.play('rotate');
        return true;
    }

    checkCollision(piece) {
        if (!piece) return true;
        
        return piece.checkCollision(
            piece.x,
            piece.y,
            piece.shape,
            this.gameState.gameBoardArray
        );
    }

    hardDrop() {
        if (!this.currentPiece || this.gameState.isLocking) return;

        let dropDistance = 0;
        while (!this.checkCollision(this.currentPiece)) {
            this.currentPiece.moveDown();
            dropDistance++;
        }
        
        if (dropDistance > 0) {
            this.currentPiece.y--;
            try {
                this.gameState.isLocking = true;
                // Play land sound
                this.soundManager.play('land');
                this.lockPiece();
            } finally {
                this.gameState.isLocking = false;
            }
        }
    }

    lockPiece() {
        if (!this.currentPiece) return;

        // Play land sound if not already played by hardDrop
        if (!this.gameState.isLocking) {
            this.soundManager.play('land');
        }

        try {
            // Store the current piece info before clearing it
            const shape = this.currentPiece.shape;
            const color = this.currentPiece.color;
            const type = this.currentPiece.type;
            const pieceX = this.currentPiece.x;
            const pieceY = this.currentPiece.y;

            // Clear the current piece reference first
            this.currentPiece = null;

            // Add the piece to the game board
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        const boardY = pieceY + y;
                        const boardX = pieceX + x;
                        if (boardY >= 0 && boardY < GAME_CONSTANTS.BOARD.HEIGHT &&
                            boardX >= 0 && boardX < GAME_CONSTANTS.BOARD.WIDTH) {
                            this.gameState.gameBoardArray[boardY][boardX] = {
                                color: color,
                                type: type
                            };
                        }
                    }
                }
            }

            // Check for completed lines
            let linesCleared = 0;
            for (let y = GAME_CONSTANTS.BOARD.HEIGHT - 1; y >= 0; y--) {
                if (this.gameState.gameBoardArray[y].every(cell => cell !== 0)) {
                    // Remove the line and add a new empty line at the top
                    this.gameState.gameBoardArray.splice(y, 1);
                    this.gameState.gameBoardArray.unshift(Array(GAME_CONSTANTS.BOARD.WIDTH).fill(0));
                    linesCleared++;
                    y++; // Check the same line again as lines have shifted down
                }
            }

            // Update score based on lines cleared
            if (linesCleared > 0) {
                this.gameState.addScore(linesCleared);
            }

            // Generate new piece and reset hold state
            this.generateNewPiece();
            this.canHold = true;  // Reset hold state when piece is locked
        } catch (error) {
            console.error('Error during piece locking:', error);
            // Ensure game state is restored even if an error occurs
            this.gameState.isLocking = false;
            if (!this.currentPiece) {
                this.generateNewPiece();
            }
        }
    }

    reset() {
        // Reset board array
        this.board = Array(GAME_CONSTANTS.BOARD.HEIGHT).fill().map(() => Array(GAME_CONSTANTS.BOARD.WIDTH).fill(0));
        // Reset pieces
        this.currentPiece = null;
        this.nextPiece = null;
        this.heldPiece = null;
        // Reset hold state
        this.canHold = true;
        // Initialize new pieces
        this.initializeBoard();
    }
}

export default Board;

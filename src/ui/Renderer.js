import { GAME_CONSTANTS } from '../utils/Constants.js';

class Renderer {
    constructor(canvas, gameState, board) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameState = gameState;
        this.board = board;
        this.setupCanvas();
        this.showingLeaderboard = false;
        this.infoButtonBounds = null;
        this.leaderboardButtonBounds = null;
        this.isEnteringName = false;
        this.playerName = '';
    }

    setupCanvas() {
        const { BLOCK_SIZE, BORDER_WIDTH, HEIGHT, WIDTH } = GAME_CONSTANTS.BOARD;
        const totalWidth = (WIDTH * BLOCK_SIZE) + (BORDER_WIDTH * 2) + 200; // Extra space for UI
        const totalHeight = (HEIGHT * BLOCK_SIZE) + (BORDER_WIDTH * 2) + 16;
        
        this.canvas.width = totalWidth;
        this.canvas.height = totalHeight;
        
        // Board dimensions
        this.boardRect = {
            x: 8,
            y: 8,
            width: (WIDTH * BLOCK_SIZE) + (BORDER_WIDTH * 2),
            height: (HEIGHT * BLOCK_SIZE) + (BORDER_WIDTH * 2)
        };
    }

    drawBlock(x, y, color, isPlaced = false) {
        const { BLOCK_SIZE, BLOCK_RADIUS, BLOCK_BORDER } = GAME_CONSTANTS.BOARD;
        const blockX = this.boardRect.x + BLOCK_RADIUS + (x * BLOCK_SIZE);
        const blockY = this.boardRect.y + BLOCK_RADIUS + (y * BLOCK_SIZE);
        
        // Turn all placed tetriminos one color, moving tetriminos get their specified color
        const blockColor = isPlaced ? GAME_CONSTANTS.COLORS.PLACED_BLOCKS : color;
        
        // Draw tetromino block with rounded edges
        this.roundRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE, BLOCK_RADIUS);
        this.ctx.fillStyle = blockColor;
        this.ctx.fill();
        
        // Adds border to tetrimino block
        this.ctx.strokeStyle = GAME_CONSTANTS.COLORS.BLOCK_BORDER;
        this.ctx.lineWidth = BLOCK_BORDER;
        this.ctx.stroke();
    }

    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    drawCurrentPiece() {
        if (!this.board.currentPiece) return;
        
        const piece = this.board.currentPiece;
        const ghostY = piece.getGhostPosition(this.gameState.gameBoardArray);
        
        // Drawing ghost tetromino (landing position)
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.ctx.globalAlpha = 0.2;
                    this.drawBlock(piece.x + x, ghostY + y, piece.color);
                    this.ctx.globalAlpha = 1;
                }
            });
        });
        
        // Draw actual tetromino
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.drawBlock(piece.x + x, piece.y + y, piece.color);
                }
            });
        });
    }

    drawPlacedBlocks() {
        for (let y = 0; y < GAME_CONSTANTS.BOARD.HEIGHT; y++) {
            for (let x = 0; x < GAME_CONSTANTS.BOARD.WIDTH; x++) {
                const color = this.gameState.gameBoardArray[y][x];
                if (color) {
                    this.drawBlock(x, y, color, true);
                }
            }
        }
    }

    drawNextPiece() {
        if (!this.board.nextPiece) return;
        
        const { SIDE_PANEL_WIDTH, SIDE_PANEL_PADDING } = GAME_CONSTANTS.UI;
        const piece = this.board.nextPiece;
        const blockSize = GAME_CONSTANTS.BOARD.BLOCK_SIZE;
        
        // Calculate center position
        const pieceWidth = piece.shape[0].length * blockSize;
        const startX = this.boardRect.width + (SIDE_PANEL_WIDTH - pieceWidth) / 1.75;
        const startY = 50;
        
        this.ctx.fillStyle = GAME_CONSTANTS.UI.PRIMARY_COLOR;
        this.ctx.font = '20px ' + GAME_CONSTANTS.UI.FONT_FAMILY;
        this.ctx.textAlign = 'left';
        this.ctx.fillText('NEXT', this.boardRect.width + SIDE_PANEL_PADDING, startY - 10);
        
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.drawBlock(
                        x + ((startX - this.boardRect.x) / blockSize),
                        y + ((startY - this.boardRect.y) / blockSize),
                        piece.color
                    );
                }
            });
        });
    }

    drawHoldPiece() {
        if (!this.board.heldPiece) return;
        
        const { SIDE_PANEL_WIDTH, SIDE_PANEL_PADDING } = GAME_CONSTANTS.UI;
        const piece = this.board.heldPiece;
        const blockSize = GAME_CONSTANTS.BOARD.BLOCK_SIZE;
        
        // Calculate center position - same calculation as for next piece
        const pieceWidth = piece.shape[0].length * blockSize;
        const startX = this.boardRect.width + (SIDE_PANEL_WIDTH - pieceWidth) / 1.75;
        const startY = 150;
        
        this.ctx.fillStyle = GAME_CONSTANTS.UI.PRIMARY_COLOR;
        this.ctx.font = '20px ' + GAME_CONSTANTS.UI.FONT_FAMILY;
        this.ctx.textAlign = 'left';
        this.ctx.fillText('HOLD', this.boardRect.width + SIDE_PANEL_PADDING, startY - 10);
        
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.drawBlock(
                        x + ((startX - this.boardRect.x) / blockSize),
                        y + ((startY - this.boardRect.y) / blockSize),
                        this.board.canHold ? piece.color : 'gray'
                    );
                }
            });
        });
    }

    drawScore() {
        const { SIDE_PANEL_WIDTH, SIDE_PANEL_PADDING } = GAME_CONSTANTS.UI;
        const startX = this.boardRect.width + SIDE_PANEL_PADDING;
        const startY = 250;
        
        this.ctx.fillStyle = GAME_CONSTANTS.UI.PRIMARY_COLOR;
        this.ctx.font = '20px ' + GAME_CONSTANTS.UI.FONT_FAMILY;
        this.ctx.textAlign = 'left';
        
        this.ctx.fillText('SCORE', startX, startY);
        this.ctx.fillText(this.gameState.score.toString(), startX, startY + 30);
        
        this.ctx.fillText('LEVEL', startX, startY + 70);
        this.ctx.fillText(this.gameState.level.toString(), startX, startY + 100);
        
        // Draw level progress bar
        const progressBarWidth = SIDE_PANEL_WIDTH - (SIDE_PANEL_PADDING * 2);
        const progressBarHeight = 10;
        const progressBarX = startX;
        const progressBarY = startY + 110;
        
        // Background
        this.ctx.fillStyle = GAME_CONSTANTS.UI.PROGRESS_BAR_BG;
        this.ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
        
        // Progress
        const progress = (this.gameState.linesCleared % 10) / 10;
        this.ctx.fillStyle = GAME_CONSTANTS.UI.PROGRESS_BAR_COLOR;
        this.ctx.fillRect(progressBarX, progressBarY, progressBarWidth * progress, progressBarHeight);
        
        this.ctx.fillStyle = GAME_CONSTANTS.UI.PRIMARY_COLOR;
        this.ctx.fillText('LINES', startX, startY + 140);
        this.ctx.fillText(this.gameState.linesCleared.toString(), startX, startY + 170);
    }

    drawInfoButton() {
        const { BLOCK_SIZE, BORDER_WIDTH } = GAME_CONSTANTS.BOARD;
        const x = this.canvas.width - BORDER_WIDTH - BLOCK_SIZE;
        const y = this.canvas.height - BORDER_WIDTH - BLOCK_SIZE;
        
        // Draw block
        this.ctx.fillStyle = GAME_CONSTANTS.COLORS.PLACED_BLOCKS;
        this.roundRect(x, y, BLOCK_SIZE, BLOCK_SIZE, GAME_CONSTANTS.BOARD.BLOCK_RADIUS);
        this.ctx.fill();
        
        // Draw border
        this.ctx.strokeStyle = GAME_CONSTANTS.COLORS.BLOCK_BORDER;
        this.ctx.lineWidth = GAME_CONSTANTS.BOARD.BLOCK_BORDER;
        this.roundRect(x, y, BLOCK_SIZE, BLOCK_SIZE, GAME_CONSTANTS.BOARD.BLOCK_RADIUS);
        this.ctx.stroke();
        
        // Draw 'i'
        this.ctx.fillStyle = '#000';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('i', x + BLOCK_SIZE/2, y + BLOCK_SIZE/2);
        
        // Store button position for click detection
        this.infoButtonBounds = { x, y, width: BLOCK_SIZE, height: BLOCK_SIZE };
        return this.infoButtonBounds;
    }

    drawLeaderboardButton() {
        const { BLOCK_SIZE, BORDER_WIDTH } = GAME_CONSTANTS.BOARD;
        const x = this.canvas.width - BORDER_WIDTH - (BLOCK_SIZE * 2); // Position to the left of info button
        const y = this.canvas.height - BORDER_WIDTH - BLOCK_SIZE;
        
        // Draw block
        this.ctx.fillStyle = GAME_CONSTANTS.COLORS.PLACED_BLOCKS;
        this.roundRect(x, y, BLOCK_SIZE, BLOCK_SIZE, GAME_CONSTANTS.BOARD.BLOCK_RADIUS);
        this.ctx.fill();
        
        // Draw border
        this.ctx.strokeStyle = GAME_CONSTANTS.COLORS.BLOCK_BORDER;
        this.ctx.lineWidth = GAME_CONSTANTS.BOARD.BLOCK_BORDER;
        this.roundRect(x, y, BLOCK_SIZE, BLOCK_SIZE, GAME_CONSTANTS.BOARD.BLOCK_RADIUS);
        this.ctx.stroke();
        
        // Draw crown symbol
        this.ctx.fillStyle = '#FFD700'; // Gold color for crown
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('👑', x + BLOCK_SIZE/2, y + BLOCK_SIZE/2);
        
        // Store button position for click detection - shifted up and left
        this.leaderboardButtonBounds = { 
            x: x - 17, 
            y: y - 17, 
            width: BLOCK_SIZE, 
            height: BLOCK_SIZE 
        };
        return this.leaderboardButtonBounds;
    }

    drawLeaderboardModal() {
        if (!this.showingLeaderboard) return;
        
        // Semi-transparent background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Modal box dimensions
        const modalWidth = 250;
        const modalHeight = 350;
        const modalX = (this.canvas.width - modalWidth) / 2;
        const modalY = (this.canvas.height - modalHeight) / 2;
        const padding = 15;

        // Draw modal background
        this.ctx.fillStyle = '#93c0e6';
        this.ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
        
        // Draw border
        this.ctx.strokeStyle = '#01182b';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);
        
        // Title
        this.ctx.fillStyle = '#01182b';
        this.ctx.font = 'bold 16px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEADERBOARD', modalX + modalWidth/2, modalY + 30);

        // Headers
        this.ctx.fillStyle = '#01182b';
        this.ctx.font = '10px "Press Start 2P"';
        this.ctx.textAlign = 'left';
        const headerY = modalY + 55;
        this.ctx.fillText('RANK', modalX + padding, headerY);
        this.ctx.fillText('NAME', modalX + padding + 45, headerY);
        this.ctx.fillText('SCORE', modalX + padding + 120, headerY);

        // Scores
        const scores = this.gameState.leaderboardManager.getScores();
        const startY = headerY + 25;
        const lineHeight = 24;

        scores.forEach((score, index) => {
            const y = startY + (index * lineHeight);
            
            // Highlight current player's score
            if (score.name === this.playerName) {
                this.ctx.fillStyle = 'rgba(147, 192, 230, 0.2)';
                this.ctx.fillRect(modalX + 2, y - 12, modalWidth - 4, lineHeight);
            }
            
            this.ctx.fillText(`${index + 1}`, modalX + padding, y);
            this.ctx.fillText(score.name, modalX + padding + 45, y);
            this.ctx.fillText(score.score.toString(), modalX + padding + 120, y);
        });

        // Instructions
        this.ctx.fillStyle = '#01182b';
        this.ctx.font = '10px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PRESS SPACE TO CLOSE', modalX + modalWidth/2, modalY + modalHeight - 15);
    }

    drawNameEntryModal() {
        if (!this.isEnteringName) return;

        // Semi-transparent background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Modal dimensions
        const modalWidth = 300;
        const modalHeight = 150;
        const modalX = (this.canvas.width - modalWidth) / 2;
        const modalY = (this.canvas.height - modalHeight) / 2;
        const padding = 20;

        // Draw modal background with gradient
        const gradient = this.ctx.createLinearGradient(modalX, modalY, modalX, modalY + modalHeight);
        gradient.addColorStop(0, '#93c0e6');
        gradient.addColorStop(1, '#649fd1');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
        
        // Draw border
        this.ctx.strokeStyle = '#01182b';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(modalX, modalY, modalWidth, modalHeight);

        // Title
        this.ctx.fillStyle = '#01182b';
        this.ctx.font = 'bold 16px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('HIGH SCORE!', modalX + modalWidth/2, modalY + 40);

        // Score
        this.ctx.fillStyle = '#01182b';
        this.ctx.font = '12px "Press Start 2P"';
        this.ctx.fillText(`SCORE: ${this.gameState.score}`, modalX + modalWidth/2, modalY + 65);

        // Input box
        const inputY = modalY + 90;
        this.ctx.fillStyle = '#c7dced';
        this.ctx.fillRect(modalX + padding, inputY, modalWidth - padding * 2, 30);
        this.ctx.strokeStyle = '#01182b';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(modalX + padding, inputY, modalWidth - padding * 2, 30);

        // Name input
        this.ctx.fillStyle = '#01182b';
        this.ctx.font = '14px "Press Start 2P"';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(this.playerName + '▋', modalX + padding + 10, inputY + 20);

        // Instructions
        this.ctx.fillStyle = '#01182b';
        this.ctx.font = '10px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PRESS ENTER TO SUBMIT', modalX + modalWidth/2, modalY + modalHeight - 15);
    }

    drawGameState() {
        if (this.gameState.isPaused()) {
            this.drawOverlay('PAUSED', 'Press P or ESC to continue');
        } else if (this.gameState.isGameOver()) {
            const isHighScore = this.gameState.leaderboardManager.isHighScore(this.gameState.score);
            if (isHighScore && !this.isEnteringName && !this.gameState.hasSubmittedScore) {
                console.log('Showing name entry modal for high score');
                this.isEnteringName = true;
                this.playerName = '';
            }
            this.drawOverlay('GAME OVER', 'Press SPACE to restart');
        }
    }

    drawOverlay(text, subText) {
        const centerX = this.boardRect.x + (this.boardRect.width / 2);
        const centerY = this.boardRect.y + (this.boardRect.height / 2);
        
        // Save the current clipping region
        this.ctx.save();
        
        // Create a clipping region for just the game board
        this.ctx.beginPath();
        this.ctx.rect(
            this.boardRect.x,
            this.boardRect.y,
            this.boardRect.width,
            this.boardRect.height
        );
        this.ctx.clip();
        
        // Draw semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(
            this.boardRect.x,
            this.boardRect.y,
            this.boardRect.width,
            this.boardRect.height
        );
        
        // Draw text
        this.ctx.fillStyle = 'white';
        this.ctx.font = '25px ' + GAME_CONSTANTS.UI.FONT_FAMILY;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, centerX, centerY);
        
        // Draw sub-text
        this.ctx.font = '15px ' + GAME_CONSTANTS.UI.FONT_FAMILY;
        this.ctx.fillText(subText, centerX, centerY + 40);
        
        // Restore the previous clipping region
        this.ctx.restore();
        
        // Reset text alignment
        this.ctx.textAlign = 'left';
    }

    drawBoard() {
        const { BLOCK_SIZE, BORDER_WIDTH } = GAME_CONSTANTS.BOARD;
        
        // Clear the entire canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board background
        this.ctx.fillStyle = GAME_CONSTANTS.UI.BACKGROUND_COLOR;
        this.ctx.fillRect(
            this.boardRect.x,
            this.boardRect.y,
            this.boardRect.width,
            this.boardRect.height
        );
        
        // Draw grid
        this.ctx.strokeStyle = GAME_CONSTANTS.COLORS.GRID;
        for (let x = 0; x <= GAME_CONSTANTS.BOARD.WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(
                this.boardRect.x + BORDER_WIDTH + (x * BLOCK_SIZE),
                this.boardRect.y + BORDER_WIDTH
            );
            this.ctx.lineTo(
                this.boardRect.x + BORDER_WIDTH + (x * BLOCK_SIZE),
                this.boardRect.y + this.boardRect.height - BORDER_WIDTH
            );
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= GAME_CONSTANTS.BOARD.HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(
                this.boardRect.x + BORDER_WIDTH,
                this.boardRect.y + BORDER_WIDTH + (y * BLOCK_SIZE)
            );
            this.ctx.lineTo(
                this.boardRect.x + this.boardRect.width - BORDER_WIDTH,
                this.boardRect.y + BORDER_WIDTH + (y * BLOCK_SIZE)
            );
            this.ctx.stroke();
        }
    }

    render() {
        this.drawBoard();
        this.drawPlacedBlocks();
        this.drawCurrentPiece();
        this.drawNextPiece();
        this.drawHoldPiece();
        this.drawScore();
        this.drawGameState();
        this.drawLeaderboardModal();
        this.drawNameEntryModal();
        this.drawInfoButton();
        this.drawLeaderboardButton();
    }
}

export default Renderer;

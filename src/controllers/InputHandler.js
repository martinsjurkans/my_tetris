class InputHandler {
    constructor(gameState, board, renderer, canvas) {
        this.gameState = gameState;
        this.board = board;
        this.renderer = renderer;
        this.canvas = canvas;
        this.keyStates = new Map();
        this.lastMoveTime = new Map();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        // Get click coordinates in canvas space, accounting for any CSS scaling
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        if (this.renderer.showingLeaderboard) {
            // Check if clicking outside the modal
            const modalWidth = 250;
            const modalHeight = 350;
            const modalX = (this.canvas.width - modalWidth) / 2;
            const modalY = (this.canvas.height - modalHeight) / 2;

            if (x < modalX || x > modalX + modalWidth ||
                y < modalY || y > modalY + modalHeight) {
                this.renderer.showingLeaderboard = false;
                if (this.gameState.isGameOver()) {
                    this.gameState.reset();
                    this.board.reset();
                }
            }
            return;
        }

        // Handle leaderboard button click
        if (this.renderer.leaderboardButtonBounds) {
            const bounds = this.renderer.leaderboardButtonBounds;
            if (x >= bounds.x && x <= bounds.x + bounds.width &&
                y >= bounds.y && y <= bounds.y + bounds.height) {
                this.renderer.showingLeaderboard = !this.renderer.showingLeaderboard;
                return;
            }
        }
    }

    handleKeyDown(event) {
        // console.log('Key pressed:', event.code);
        
        // Prevent default for game control keys (no scrolling, using space for bottom etc)
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyC', 'KeyP', 'Escape', 'KeyA', 'KeyD', 'KeyS', 'KeyX'].includes(event.code)) {
            event.preventDefault();
        }
        
        // Handle name entry
        if (this.renderer.isEnteringName) {
            if (event.key === 'Enter' && this.renderer.playerName.trim()) {
                console.log('Submitting score:', this.renderer.playerName, this.gameState.score);
                this.gameState.leaderboardManager.addScore(
                    this.renderer.playerName,
                    this.gameState.score
                );
                this.renderer.isEnteringName = false;
                this.renderer.showingLeaderboard = true;
                
                // Reset game state to prevent multiple submissions
                if (this.gameState.isGameOver()) {
                    this.gameState.hasSubmittedScore = true;
                }
                
                event.preventDefault();
                return;
            } else if (event.key === 'Backspace') {
                this.renderer.playerName = this.renderer.playerName.slice(0, -1);
                event.preventDefault();
                return;
            } else if (event.key.length === 1) {
                if (this.renderer.playerName.length < 15) {
                    this.renderer.playerName += event.key;
                }
                event.preventDefault();
                return;
            }
            event.preventDefault();
            return;
        }

        // Handle leaderboard close with SPACE
        if (this.renderer.showingLeaderboard && event.code === 'Space') {
            this.renderer.showingLeaderboard = false;
            if (this.gameState.isGameOver()) {
                this.gameState.reset();
                this.board.reset();
            }
            event.preventDefault();
            return;
        }

        // Handle game over state
        if (this.gameState.isGameOver() && !this.renderer.isEnteringName && !this.renderer.showingLeaderboard) {
            if (event.code === 'Space') {
                this.renderer.isEnteringName = true;
                this.renderer.playerName = '';
                event.preventDefault();
            }
            return;
        }

        // Normal game input handling
        if (this.keyStates.get(event.code)) return;
        
        this.keyStates.set(event.code, true);
        this.lastMoveTime.set(event.code, Date.now());
        
        if (this.gameState.isPaused()) {
            if (event.code === 'KeyP' || event.code === 'Escape') {
                this.gameState.togglePause();
            }
            return;
        }

        this.processInput(event.code, true);
    }

    handleKeyUp(event) {
        this.keyStates.set(event.code, false);
        this.lastMoveTime.delete(event.code);
    }

    processInput(keyCode, isInitialPress = false) {
        console.log('Processing input:', keyCode, isInitialPress);  // Debug log
        
        if (this.gameState.isGameOver()) {
            if (keyCode === 'Space' && isInitialPress) {
                this.gameState.reset();
                this.board.reset();
            }
            return;
        }

        switch (keyCode) {
            case 'ArrowLeft':
            case 'KeyA':
                this.board.moveCurrentPiece(-1, 0);
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.board.moveCurrentPiece(1, 0);
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.board.moveCurrentPiece(0, 1);
                break;
            case 'ArrowUp':
                if (isInitialPress) {
                    this.board.rotateCurrentPiece();
                }
                break;
            case 'KeyX':
                if (isInitialPress) {
                    this.board.rotateCurrentPiece();
                }
                break;
            case 'Space':
                if (isInitialPress) {
                    this.board.hardDrop();
                }
                break;
            case 'KeyC':
                if (isInitialPress) {
                    console.log('KeyC pressed - Attempting to hold piece');  // Debug log
                    console.log('Current piece:', this.board.currentPiece ? this.board.currentPiece.type : 'none');
                    console.log('Can hold:', this.board.canHold);
                    console.log('Held piece:', this.board.heldPiece ? this.board.heldPiece.type : 'none');
                    this.board.holdPiece();
                    console.log('After hold - Current piece:', this.board.currentPiece ? this.board.currentPiece.type : 'none');
                    console.log('After hold - Held piece:', this.board.heldPiece ? this.board.heldPiece.type : 'none');
                }
                break;
            case 'KeyP':
            case 'Escape':
                if (isInitialPress) {
                    this.gameState.togglePause();
                }
                break;
        }
    }

    update() {
        if (this.gameState.isPaused() || this.gameState.isGameOver()) return;

        // Handle continuous movement
        for (const [key, isPressed] of this.keyStates) {
            if (!isPressed) continue;
            
            const now = Date.now();
            const lastMove = this.lastMoveTime.get(key) || 0;
            const moveDelay = key === 'Space' ? 50 : 100; // Faster drop for space

            if (now - lastMove >= moveDelay) {
                this.processInput(key, false);
                this.lastMoveTime.set(key, now);
            }
        }
    }
}

export default InputHandler;

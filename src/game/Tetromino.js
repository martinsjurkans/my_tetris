import { GAME_CONSTANTS } from '../utils/Constants.js';

class Tetromino {
    static SHAPES = {
        I: [[1, 1, 1, 1]],
        O: [[1, 1], [1, 1]],
        T: [[0, 1, 0], [1, 1, 1]],
        S: [[0, 1, 1], [1, 1, 0]],
        Z: [[1, 1, 0], [0, 1, 1]],
        J: [[1, 0, 0], [1, 1, 1]],
        L: [[0, 0, 1], [1, 1, 1]]
    };

    constructor(type) {
        this.type = type;
        this.shape = JSON.parse(JSON.stringify(Tetromino.SHAPES[type]));
        this.color = GAME_CONSTANTS.COLORS.TETROMINOS[type];
        this.x = Math.floor((GAME_CONSTANTS.BOARD.WIDTH - this.shape[0].length) / 2);
        this.y = 0;
    }

    rotate() {
        const newShape = Array(this.shape[0].length)
            .fill()
            .map(() => Array(this.shape.length).fill(0));

        for (let y = 0; y < this.shape.length; y++) {
            for (let x = 0; x < this.shape[y].length; x++) {
                newShape[x][this.shape.length - 1 - y] = this.shape[y][x];
            }
        }
        this.shape = newShape;
    }

    moveLeft() {
        this.x--;
    }

    moveRight() {
        this.x++;
    }

    moveDown() {
        this.y++;
    }

    getGhostPosition(board) {
        let ghostY = this.y;
        while (!this.checkCollision(this.x, ghostY + 1, this.shape, board)) {
            ghostY++;
        }
        return ghostY;
    }

    checkCollision(x, y, shape, board) {
        // Check each cell of the tetromino
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const boardX = x + col;
                    const boardY = y + row;

                    // Check boundaries
                    if (boardX < 0 || boardX >= GAME_CONSTANTS.BOARD.WIDTH) {
                        return true;
                    }

                    // Check bottom collision
                    if (boardY >= GAME_CONSTANTS.BOARD.HEIGHT) {
                        return true;
                    }

                    // Check collision with placed pieces (only if within board)
                    if (boardY >= 0 && board[boardY][boardX] !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    static getRandomTetromino() {
        const types = Object.keys(Tetromino.SHAPES);
        const randomType = types[Math.floor(Math.random() * types.length)];
        return new Tetromino(randomType);
    }
}

export default Tetromino;

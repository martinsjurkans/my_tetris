let canvas;
let ctx;
let gBArrayHeight = 20; // Height (in blocks)
let gBArrayWidth = 10;  // Width (in blocks)
let startX = 4;         // Starting X position
let startY = 0;         // Starting Y position
let score = 0;
let level = 1;
let linesCleared = 0;
let gameSpeed = 1000;
let winOrLose = "Playing";
let tetrisLogo;
let coordinateArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));
let curTetromino = [[1,0], [0,1], [1,1], [2,1]];

let tetrominos = [];
let tetrominoColor = ['cyan', 'yellow', 'purple', 'green', 'red', 'blue', 'orange'];
let curTetrominoColor;

let gameBoardArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));

let stoppedShapeArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));

let DIRECTION = {
    IDLE: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
};

let direction;

class Coordinates{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}

// game board dimensions
const BLOCK_SIZE = 23;
const BORDER_WIDTH = 3;
const BOARD_WIDTH = (BLOCK_SIZE * gBArrayWidth);
const BOARD_HEIGHT = (BLOCK_SIZE * gBArrayHeight);
const GRID_COLOR = 'rgba(128, 128, 128, 0.2)';
const BASE_POINTS = 100;
const COMBO_MULTIPLIER = 1.5;
let currentCombo = 0;

let activeAnimations = [];

// game states
const GAME_STATE = {
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

let currentGameState = GAME_STATE.PLAYING;

// Update UI style constants
const UI_STYLE = {
    primaryColor: 'rgb(26, 26, 26)',  // Changed from hex to rgb for consistency
    accentColor: 'rgb(52, 152, 219)', // Changed from hex to solid rgb
    textColor: 'rgb(236, 240, 241)',  // Changed from hex to solid rgb
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    progressBarColor: 'rgb(46, 204, 113)', // Changed from hex to solid rgb
    fontFamily: '"Segoe UI", sans-serif',
    fontSize: {
        large: '22px',
        medium: '20px',
        small: '16px',
        xsmall: '14px'
    },
    padding: {
        text: 15,
        panel: 10
    }
};

// Add board dimensions for overlay
const BOARD_RECT = {
    x: 8,
    y: 8,
    width: BOARD_WIDTH + (BORDER_WIDTH * 2),
    height: BOARD_HEIGHT + (BORDER_WIDTH * 2)
};

window.onload = function() {
    canvas = document.getElementById('my-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = BOARD_RECT.width + 200; // Add space for UI
    canvas.height = BOARD_RECT.height + 16; // Add small padding

    // Clear entire canvas with a transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw board border
    ctx.strokeStyle = 'black';
    ctx.strokeRect(BOARD_RECT.x, BOARD_RECT.y, BOARD_RECT.width, BOARD_RECT.height);

    // Draw main board background with slight transparency
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(BOARD_RECT.x + 1, BOARD_RECT.y + 1, BOARD_RECT.width - 2, BOARD_RECT.height - 2);

    // Create the array for the game board
    CreateCoordArray();
    
    // Draw initial grid
    DrawBoard();

    // Setup game UI
    SetupGameUI();

    // Create game elements
    CreateTetrominos();
    CreateTetromino();

    // Create the main game board array
    gameBoardArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));
    stoppedShapeArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));
    
    // Add event listeners
    document.addEventListener('keydown', HandleKeyPress);
    
    // Start game loop
    gameInterval = setInterval(MoveTetrominoDown, gameSpeed);
    
    AnimationLoop();
}

// Update SetupGameUI function
function SetupGameUI() {
    const PANEL_GAP = 30;
    let currentY = 32;
    
    // Next piece area
    ctx.fillStyle = UI_STYLE.primaryColor;
    ctx.font = `bold ${UI_STYLE.fontSize.large} ${UI_STYLE.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText("NEXT", BOARD_WIDTH + 110, currentY);
    DrawPanel(BOARD_WIDTH + 30, currentY + 5, 161, 70);
    currentY += 75;

    // Score area
    currentY += PANEL_GAP;
    ctx.fillStyle = UI_STYLE.primaryColor;
    ctx.font = `bold ${UI_STYLE.fontSize.large} ${UI_STYLE.fontFamily}`;
    ctx.fillText("SCORE", BOARD_WIDTH + 110, currentY);
    DrawPanel(BOARD_WIDTH + 30, currentY + 5, 161, 44);
    ctx.font = `bold ${UI_STYLE.fontSize.medium} ${UI_STYLE.fontFamily}`;
    ctx.fillStyle = UI_STYLE.primaryColor;
    ctx.textAlign = 'left';
    ctx.fillText(score.toString(), BOARD_WIDTH + 45, currentY + 35);
    currentY += 49;

    // Level area
    currentY += PANEL_GAP;
    ctx.fillStyle = UI_STYLE.primaryColor;
    ctx.font = `bold ${UI_STYLE.fontSize.large} ${UI_STYLE.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText("LEVEL", BOARD_WIDTH + 110, currentY);
    DrawPanel(BOARD_WIDTH + 30, currentY + 5, 161, 44);
    ctx.font = `bold ${UI_STYLE.fontSize.medium} ${UI_STYLE.fontFamily}`;
    ctx.fillStyle = UI_STYLE.primaryColor;
    ctx.textAlign = 'left';
    ctx.fillText(level.toString(), BOARD_WIDTH + 45, currentY + 35);
    
    // Progress bar
    DrawPanel(BOARD_WIDTH + 30, currentY + 49, 161, 14);
    currentY += 63;

    // Controls block
    currentY += PANEL_GAP;
    ctx.fillStyle = UI_STYLE.primaryColor;
    ctx.font = `bold ${UI_STYLE.fontSize.large} ${UI_STYLE.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText("CONTROLS", BOARD_WIDTH + 110, currentY);
    DrawPanel(BOARD_WIDTH + 30, currentY + 5, 161, 150);

    // Controls text with solid color
    ctx.font = `${UI_STYLE.fontSize.xsmall} ${UI_STYLE.fontFamily}`;
    ctx.fillStyle = UI_STYLE.primaryColor;
    ctx.textAlign = 'left';
    const controlsX = BOARD_WIDTH + 40;
    const controlsStartY = currentY + 25;
    const controlsSpacing = 22;
    
    ctx.fillText("← / A : Move Left", controlsX, controlsStartY);
    ctx.fillText("→ / D : Move Right", controlsX, controlsStartY + controlsSpacing);
    ctx.fillText("↓ / S : Move Down", controlsX, controlsStartY + controlsSpacing * 2);
    ctx.fillText("↑ / E : Rotate", controlsX, controlsStartY + controlsSpacing * 3);
    ctx.fillText("P : Pause", controlsX, controlsStartY + controlsSpacing * 4);
    ctx.fillText("ESC : Pause", controlsX, controlsStartY + controlsSpacing * 5);
    
    // Store positions for other functions
    UI_POSITIONS = {
        score: { y: 32 + 75 + PANEL_GAP + 35 },
        level: { y: 32 + 75 + PANEL_GAP + 49 + PANEL_GAP + 35 },
        progress: { y: 32 + 75 + PANEL_GAP + 49 + PANEL_GAP + 49 + 2 }
    };
}

// Panels
function DrawPanel(x, y, width, height) {
    // Fill the panel background with semi-transparency
    ctx.fillStyle = UI_STYLE.backgroundColor;
    ctx.fillRect(x, y, width, height);
    
    // Draw the border with a solid stroke
    ctx.strokeStyle = UI_STYLE.accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
}

// Update level progress bar with modern style
function UpdateLevelProgress() {
    const progressBarWidth = 157;
    const linesForNextLevel = 10;
    
    const currentLevelLines = linesCleared % linesForNextLevel;
    const progress = currentLevelLines / linesForNextLevel;
    
    ctx.fillStyle = UI_STYLE.backgroundColor;
    ctx.fillRect(BOARD_WIDTH + 32, UI_POSITIONS.progress.y, progressBarWidth - 2, 10);
    
    ctx.fillStyle = UI_STYLE.progressBarColor;
    ctx.fillRect(BOARD_WIDTH + 32, UI_POSITIONS.progress.y, Math.floor((progressBarWidth - 2) * progress), 10);
}

// Draw grid lines with consistent spacing
function DrawBoard() {
    for(let row = 0; row < gBArrayHeight; row++) {
        for(let col = 0; col < gBArrayWidth; col++) {
            let coorX = coordinateArray[row][col].x;
            let coorY = coordinateArray[row][col].y;
            DrawGridCell(coorX, coorY);
        }
    }
}

// Helper function to draw a grid cell
function DrawGridCell(x, y, color = null) {
    if(color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
    }
    ctx.beginPath();
    ctx.roundRect(x, y, BLOCK_SIZE - 1, BLOCK_SIZE - 1, 3); // 3px corner radius
    ctx.strokeStyle = 'rgba(240, 240, 240)';
    ctx.stroke();
}

function CreateCoordArray(){
    let xStart = 11;    // Starting X coordinate (8 + 3 for border padding)
    let yStart = 11;    // Starting Y coordinate (8 + 3 for border padding)
    
    for(let row = 0; row < gBArrayHeight; row++) {
        for(let col = 0; col < gBArrayWidth; col++) {
            coordinateArray[row][col] = new Coordinates(
                xStart + (BLOCK_SIZE * col),
                yStart + (BLOCK_SIZE * row)
            );
        }
    }
}

function DeleteTetromino() {
    for(let i = 0; i < curTetromino.length; i++) {
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;
        if(y >= 0 && y < gBArrayHeight && x >= 0 && x < gBArrayWidth) {
            gameBoardArray[y][x] = 0;
            let coorX = coordinateArray[y][x].x;
            let coorY = coordinateArray[y][x].y;
            DrawGridCell(coorX, coorY, 'white');
        }
    }
}

function DrawTetromino() {
    for(let i = 0; i < curTetromino.length; i++) {
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;
        if(y >= 0 && y < gBArrayHeight && x >= 0 && x < gBArrayWidth) {
            gameBoardArray[y][x] = 1;
            let coorX = coordinateArray[y][x].x;
            let coorY = coordinateArray[y][x].y;
            DrawGridCell(coorX, coorY, curTetrominoColor);
        }
    }
}

function HittingTheWall() {
    for(let i = 0; i < curTetromino.length; i++){
        let newX = curTetromino[i][0] + startX;
        if(direction === DIRECTION.LEFT && newX <= 0){
            return true;
        } else if(direction === DIRECTION.RIGHT && newX >= gBArrayWidth - 1){
            return true;
        }
    }
    return false;
}

function HandleKeyPress(key) {
    if (currentGameState === GAME_STATE.GAME_OVER) {
        if (key.keyCode === 13) { // Enter key
            ResetGame();
        }
        return;
    }
    
    if (key.keyCode === 27 || key.keyCode === 80) { // ESC or P key
        TogglePause();
        return;
    }
    
    if (currentGameState !== GAME_STATE.PLAYING) {
        return;
    }
    
    if(key.keyCode === 65 || key.keyCode === 37) { // A or Left arrow
        direction = DIRECTION.LEFT;
        if(!HittingTheWall() && !CheckForHorizontalCollision()) {
            DeleteTetromino();
            startX--;
            DrawTetromino();
        }
    } else if(key.keyCode === 68 || key.keyCode === 39) { // D or Right arrow
        direction = DIRECTION.RIGHT;
        if(!HittingTheWall() && !CheckForHorizontalCollision()) {
            DeleteTetromino();
            startX++;
            DrawTetromino();
        }
    } else if(key.keyCode === 83 || key.keyCode === 40) { // S or Down arrow
        MoveTetrominoDown();
    } else if(key.keyCode === 69 || key.keyCode === 38) { // E or Up arrow
        RotateTetromino();
    }
}

function MoveTetrominoDown(){
    if (currentGameState !== GAME_STATE.PLAYING) {
        return;
    }
    
    if (CheckForVerticalCollision()) {
        // Lock the piece in place
        for(let i = 0; i < curTetromino.length; i++) {
            let x = curTetromino[i][0] + startX;
            let y = curTetromino[i][1] + startY;
            stoppedShapeArray[y][x] = 1;
            
            // Draw the placed piece in grey immediately
            let coorX = coordinateArray[y][x].x;
            let coorY = coordinateArray[y][x].y;
            DrawGridCell(coorX, coorY, '#808080'); // Use grey color for placed pieces
        }
        
        DeleteCompleteRows();
        
        // Try to create new piece, game over if it fails
        if (!CreateTetromino()) {
            return; // Game over has been triggered in CreateTetromino
        }
        return;
    }
    
    // Move piece down
    DeleteTetromino();
    startY++;
    DrawTetromino();
}

function CreateTetrominos(){
    // Push T
    tetrominos.push([[1,0], [0,1], [1,1], [2,1]]);
    // Push I
    tetrominos.push([[0,0], [1,0], [2,0], [3,0]]);
    // Push J
    tetrominos.push([[0,0], [0,1], [1,1], [2,1]]);
    // Push Square
    tetrominos.push([[0,0], [1,0], [0,1], [1,1]]);
    // Push L
    tetrominos.push([[2,0], [0,1], [1,1], [2,1]]);
    // Push S
    tetrominos.push([[1,0], [2,0], [0,1], [1,1]]);
    // Push Z
    tetrominos.push([[0,0], [1,0], [1,1], [2,1]]);
    // Push Star (available from level 10)
    tetrominos.push([[1,0], [0,1], [1,1], [2,1], [1,2]]);
}

function CreateTetromino() {
    let randomTetromino;
    
    // Only include star piece if level >= 10
    let maxPieces = level >= 10 ? tetrominos.length : tetrominos.length - 1;
    
    randomTetromino = Math.floor(Math.random() * maxPieces);
    curTetromino = tetrominos[randomTetromino];
    
    // Assign color based on piece
    curTetrominoColor = randomTetromino === tetrominos.length - 1 ? 'gold' : 
        ['purple', 'cyan', 'blue', 'yellow', 'orange', 'green', 'red'][randomTetromino];
    
    // Reset position
    startX = 4;
    startY = 0;
    
    // Check if the new piece can be placed
    for(let i = 0; i < curTetromino.length; i++) {
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;
        
        // If there's already a block where we want to spawn the new piece
        if (y >= 0 && stoppedShapeArray[y][x] === 1) {
            ShowGameOver();
            return false;
        }
    }
    
    return true;
}

function CheckForHorizontalCollision() {
    let tetrominoCopy = curTetromino;
    let collision = false;

    for(let i = 0; i < tetrominoCopy.length; i++) {
        let square = tetrominoCopy[i];
        let x = square[0] + startX;
        let y = square[1] + startY;

        // Check collision with stopped pieces
        if(y >= 0) {
            if((direction === DIRECTION.LEFT && x > 0 && stoppedShapeArray[y][x - 1]) ||
               (direction === DIRECTION.RIGHT && x < gBArrayWidth - 1 && stoppedShapeArray[y][x + 1])) {
                collision = true;
                break;
            }
        }
    }
    return collision;
}

function CheckForVerticalCollision() {
    let tetrominoCopy = curTetromino;
    let collision = false;
    
    for(let i = 0; i < tetrominoCopy.length; i++) {
        let square = tetrominoCopy[i];
        let x = square[0] + startX;
        let y = square[1] + startY;
        
        if(y >= gBArrayHeight - 1) {
            collision = true;
            break;
        }
        if(y < gBArrayHeight - 1) {
            if(stoppedShapeArray[y + 1][x] === 1) {
                collision = true;
                break;
            }
        }
    }
    
    return collision;
}

function RotateTetromino() {
    let newRotation = [];
    let curTetrominoCopy = curTetromino;
    
    // Don't rotate square piece
    if(curTetrominoColor === 'yellow') {
        return;
    }
    
    // Find center of rotation based on piece type
    let centerX, centerY;
    
    if(curTetrominoColor === 'cyan') { // I piece
        // Calculate the center point dynamically for the I piece
        let minX = Math.min(...curTetrominoCopy.map(coord => coord[0]));
        let maxX = Math.max(...curTetrominoCopy.map(coord => coord[0]));
        let minY = Math.min(...curTetrominoCopy.map(coord => coord[1]));
        let maxY = Math.max(...curTetrominoCopy.map(coord => coord[1]));
        
        centerX = (minX + maxX) / 2;
        centerY = (minY + maxY) / 2;
    } else if(curTetrominoColor === 'orange' || curTetrominoColor === 'blue') { // L and J pieces
        centerX = 1;
        centerY = 1;
    } else if(curTetrominoColor === 'gold') { // Star piece
        centerX = curTetrominoCopy[2][0];
        centerY = curTetrominoCopy[2][1];
    } else if(curTetrominoColor === 'purple') { // T piece
        centerX = curTetrominoCopy[2][0];
        centerY = curTetrominoCopy[2][1];
    } else if(curTetrominoColor === 'green') { // S piece
        centerX = curTetrominoCopy[0][0]; // Use [1,0] as center
        centerY = curTetrominoCopy[0][1];
    } else if(curTetrominoColor === 'red') { // Z piece
        centerX = curTetrominoCopy[1][0];
        centerY = curTetrominoCopy[1][1];
    }
    
    // Rotate around center point
    for(let i = 0; i < curTetrominoCopy.length; i++) {
        let x = curTetrominoCopy[i][0] - centerX;
        let y = curTetrominoCopy[i][1] - centerY;
        let newX = -y;
        let newY = x;
        newRotation.push([Math.round(newX + centerX), Math.round(newY + centerY)]);
    }
    
    // Try rotation with wall kicks
    let rotationSuccessful = false;
    let wallKickOffsets = [0, 1, -1, 2, -2];
    
    for(let offset of wallKickOffsets) {
        let canRotate = true;
        let testX = startX + offset;
        
        for(let i = 0; i < newRotation.length; i++) {
            let x = newRotation[i][0] + testX;
            let y = newRotation[i][1] + startY;
            
            if(x < 0 || x >= gBArrayWidth || y >= gBArrayHeight || 
               (y >= 0 && stoppedShapeArray[y][x] === 1)) {
                canRotate = false;
                break;
            }
        }
        
        if(canRotate) {
            DeleteTetromino();
            startX = testX;
            curTetromino = newRotation;
            DrawTetromino();
            rotationSuccessful = true;
            break;
        }
    }
    
    if(!rotationSuccessful) {
        DrawTetromino();
    }
}

function DeleteCompleteRows() {
    console.log('Checking for complete rows');
    let rowsToDelete = [];
    
    // Check for complete rows
    for(let row = 0; row < gBArrayHeight; row++) {
        let isComplete = true;
        for(let col = 0; col < gBArrayWidth; col++) {
            if(stoppedShapeArray[row][col] !== 1) {
                isComplete = false;
                break;
            }
        }
        if(isComplete) {
            console.log(`Complete row found at row ${row}`);
            rowsToDelete.push(row);
        }
    }
    
    console.log(`Rows to delete: ${rowsToDelete}`);
    
    if(rowsToDelete.length > 0) {
        // Calculate points with new combo system
        let comboMultiplier = rowsToDelete.length > 1 ? Math.pow(COMBO_MULTIPLIER, rowsToDelete.length - 1) : 1;
        let levelMultiplier = level;
        let points = Math.floor(BASE_POINTS * rowsToDelete.length * comboMultiplier * levelMultiplier);
        
        console.log(`Deleting rows: ${rowsToDelete}, Points: ${points}`);
        
        // Add point animation
        activeAnimations.push(new PointAnimation(points));
        
        // Process row deletion
        for(let row of rowsToDelete) {
            for(let y = row; y > 0; y--) {
                for(let col = 0; col < gBArrayWidth; col++) {
                    stoppedShapeArray[y][col] = stoppedShapeArray[y-1][col];
                    gameBoardArray[y][col] = gameBoardArray[y-1][col];
                    let coorX = coordinateArray[y][col].x;
                    let coorY = coordinateArray[y][col].y;
                    DrawGridCell(coorX, coorY, stoppedShapeArray[y][col] ? '#808080' : 'white');
                }
            }
            
            // Clear top row
            for(let col = 0; col < gBArrayWidth; col++) {
                stoppedShapeArray[0][col] = 0;
                gameBoardArray[0][col] = 0;
                let coorX = coordinateArray[0][col].x;
                let coorY = coordinateArray[0][col].y;
                DrawGridCell(coorX, coorY, 'white');
            }
        }
        
        // Update score and progress
        score += points;
        linesCleared += rowsToDelete.length;
        
        // Update level
        let newLevel = Math.floor(linesCleared / 10) + 1;
        if(newLevel !== level) {
            level = newLevel;
            gameSpeed = Math.max(100, 1000 - (level - 1) * 100);
            clearInterval(gameInterval);
            gameInterval = setInterval(MoveTetrominoDown, gameSpeed);
            UpdateLevel();
        }
        
        // Update UI
        UpdateScore();
        UpdateLevelProgress();
        RedrawPanelBorders(); // Ensure borders are intact
        
        // Create new tetromino
        CreateTetromino();
    }
}

function UpdateScore() {
    // Clear score area with smaller width and height
    ctx.fillStyle = UI_STYLE.backgroundColor;
    ctx.fillRect(BOARD_WIDTH + 33, UI_POSITIONS.score.y - 17, 145, 23);
    
    // Redraw score
    ctx.fillStyle = UI_STYLE.primaryColor;
    ctx.font = `bold ${UI_STYLE.fontSize.medium} ${UI_STYLE.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText(score.toString(), BOARD_WIDTH + 45, UI_POSITIONS.score.y);
}

function UpdateLevel() {
    // Clear level area with smaller width and height
    ctx.fillStyle = UI_STYLE.backgroundColor;
    ctx.fillRect(BOARD_WIDTH + 33, UI_POSITIONS.level.y - 17, 145, 23);
    
    // Redraw level
    ctx.fillStyle = UI_STYLE.primaryColor;
    ctx.font = `bold ${UI_STYLE.fontSize.medium} ${UI_STYLE.fontFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText(level.toString(), BOARD_WIDTH + 45, UI_POSITIONS.level.y);
}

// Update AnimationLoop to maintain borders
function AnimationLoop() {
    // Only clear the score animation area
    const scoreAnimationArea = {
        x: BOARD_WIDTH + 120,
        y: 137,
        width: 70,
        height: 150
    };
    
    // Clear only the score animation area
    ctx.clearRect(scoreAnimationArea.x, scoreAnimationArea.y, 
                 scoreAnimationArea.width, scoreAnimationArea.height);
    
    // Update and draw animations
    activeAnimations = activeAnimations.filter(anim => {
        let isAlive = anim.update();
        if (isAlive && anim.opacity > 0.01) {
            anim.draw(ctx);
            return true;
        }
        return false;
    });
    
    // Only redraw score and level if there are active animations
    if (activeAnimations.length > 0) {
        ctx.fillStyle = UI_STYLE.primaryColor;
        ctx.font = `bold ${UI_STYLE.fontSize.medium} ${UI_STYLE.fontFamily}`;
        ctx.textAlign = 'left';
        ctx.fillText(score.toString(), BOARD_WIDTH + 45, UI_POSITIONS.score.y);
        ctx.fillText(level.toString(), BOARD_WIDTH + 45, UI_POSITIONS.level.y);
    }
    
    requestAnimationFrame(AnimationLoop);
}

// Update RedrawPanelBorders function
function RedrawPanelBorders() {
    ctx.strokeStyle = UI_STYLE.accentColor;
    ctx.lineWidth = 2;
    
    let y = 32; // Starting Y position
    
    // Next piece panel
    ctx.strokeRect(BOARD_WIDTH + 30, y + 5, 161, 70);
    y += 75;
    
    // Score panel
    y += PANEL_GAP;
    ctx.strokeRect(BOARD_WIDTH + 30, y + 5, 161, 44);
    y += 49;
    
    // Level panel
    y += PANEL_GAP;
    ctx.strokeRect(BOARD_WIDTH + 30, y + 5, 161, 44);
    
    // Progress bar (overlapping with level panel)
    ctx.strokeRect(BOARD_WIDTH + 30, y + 49, 161, 14);
    y += 63;
    
    // Controls panel
    ctx.strokeRect(BOARD_WIDTH + 30, y + 5, 161, 150);
    
    ctx.lineWidth = 1;
}

// Add game over screen
function ShowGameOver() {
    currentGameState = GAME_STATE.GAME_OVER;
    clearInterval(gameInterval);
    
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(BOARD_RECT.x, BOARD_RECT.y, BOARD_RECT.width, BOARD_RECT.height);
    
    // Calculate center positions
    const centerX = BOARD_RECT.x + (BOARD_RECT.width / 2);
    const centerY = BOARD_RECT.y + (BOARD_RECT.height / 2);
    
    // Create gradient for game over text
    const gradient = ctx.createLinearGradient(
        centerX - 100, centerY - 50,
        centerX + 100, centerY - 50
    );
    gradient.addColorStop(0, '#FF4E50');
    gradient.addColorStop(1, '#F9D423');
    
    // Draw game over text with padding and shadow
    ctx.fillStyle = gradient;
    ctx.font = `bold 48px ${UI_STYLE.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Add padding by reducing the text width
    const maxWidth = BOARD_RECT.width - (UI_STYLE.padding.text * 2);
    ctx.fillText('GAME OVER', centerX, centerY - 50, maxWidth);
    
    // Draw restart button with padding
    ctx.font = `${UI_STYLE.fontSize.medium} ${UI_STYLE.fontFamily}`;
    ctx.fillStyle = UI_STYLE.textColor;
    ctx.fillText('Press ENTER to Restart', centerX, centerY + 20, maxWidth);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.textAlign = 'left';
}

// Add pause screen
function TogglePause() {
    if (currentGameState === GAME_STATE.PLAYING) {
        currentGameState = GAME_STATE.PAUSED;
        clearInterval(gameInterval);
        
        // Draw semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(BOARD_RECT.x, BOARD_RECT.y, BOARD_RECT.width, BOARD_RECT.height);
        
        // Calculate center positions
        const centerX = BOARD_RECT.x + (BOARD_RECT.width / 2);
        const centerY = BOARD_RECT.y + (BOARD_RECT.height / 2);
        
        // Draw pause text with padding
        ctx.fillStyle = UI_STYLE.textColor;
        ctx.font = `bold 48px ${UI_STYLE.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        
        const maxWidth = BOARD_RECT.width - (UI_STYLE.padding.text * 2);
        ctx.fillText('PAUSED', centerX, centerY, maxWidth);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
    } else if (currentGameState === GAME_STATE.PAUSED) {
        currentGameState = GAME_STATE.PLAYING;
        gameInterval = setInterval(MoveTetrominoDown, gameSpeed);
        
        // Redraw the entire game state
        ctx.clearRect(BOARD_RECT.x, BOARD_RECT.y, BOARD_RECT.width, BOARD_RECT.height);
        
        // Redraw board border
        ctx.strokeStyle = 'black';
        ctx.strokeRect(BOARD_RECT.x, BOARD_RECT.y, BOARD_RECT.width, BOARD_RECT.height);
        
        // Redraw main board background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(BOARD_RECT.x + 1, BOARD_RECT.y + 1, BOARD_RECT.width - 2, BOARD_RECT.height - 2);
        
        // Redraw the grid and pieces
        DrawBoard();
        
        // Redraw stopped pieces in grey
        for(let row = 0; row < gBArrayHeight; row++) {
            for(let col = 0; col < gBArrayWidth; col++) {
                if(stoppedShapeArray[row][col] === 1) {
                    let coorX = coordinateArray[row][col].x;
                    let coorY = coordinateArray[row][col].y;
                    DrawGridCell(coorX, coorY, '#808080');
                }
            }
        }
        
        // Redraw current piece
        DrawTetromino();
    }
}

class PointAnimation {
    constructor(points) {
        this.points = points;
        this.opacity = 1;
        this.y = 167; // Align with score
        this.x = BOARD_WIDTH + 120; // Align with score position
        this.duration = 800;
        this.timer = 0;
        this.lastUpdate = Date.now();
    }

    update() {
        const now = Date.now();
        const delta = now - this.lastUpdate;
        this.lastUpdate = now;
        
        this.timer += delta;
        if (this.timer >= this.duration) {
            this.opacity = 0;
            return false;
        }
        
        this.opacity = Math.max(0, 1 - (this.timer / this.duration) * 1.2);
        
        return true;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#2ECC71';
        ctx.font = `${UI_STYLE.fontSize.medium} ${UI_STYLE.fontFamily}`;
        ctx.textAlign = 'left';
        ctx.fillText(`+${this.points}`, this.x, this.y);
        ctx.restore();
    }
}

// Reset game function
function ResetGame() {
    // Reset all game variables
    score = 0;
    level = 1;
    linesCleared = 0;
    gameSpeed = 1000;
    currentGameState = GAME_STATE.PLAYING;
    
    // Clear arrays
    gameBoardArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));
    stoppedShapeArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw board border
    ctx.strokeStyle = 'black';
    ctx.strokeRect(BOARD_RECT.x, BOARD_RECT.y, BOARD_RECT.width, BOARD_RECT.height);
    
    // Redraw main board background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(BOARD_RECT.x + 1, BOARD_RECT.y + 1, BOARD_RECT.width - 2, BOARD_RECT.height - 2);
    
    // Redraw grid
    DrawBoard();
    
    // Restore UI elements
    SetupGameUI();
    
    // Create new tetromino
    CreateTetromino();
    
    // Restart game interval
    clearInterval(gameInterval);
    gameInterval = setInterval(MoveTetrominoDown, gameSpeed);
}
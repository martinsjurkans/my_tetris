export const GAME_CONSTANTS = {
    CANVAS: {
        WIDTH: 800,
        HEIGHT: 600
    },
    BOARD: {
        HEIGHT: 20,
        WIDTH: 10,
        BLOCK_SIZE: 23,
        BORDER_WIDTH: 3,
        BLOCK_RADIUS: 3,
        BLOCK_BORDER: 1
    },
    DIRECTION: {
        IDLE: 0,
        DOWN: 1,
        LEFT: 2,
        RIGHT: 3
    },
    GAME_SPEED: {
        INITIAL: 1000,  // 1 second between drops
        MIN: 100,       // Maximum speed
        DECREASE_RATE: 0.8,
        SOFT_DROP_MULTIPLIER: 5,
        MOVEMENT_REPEAT_DELAY: 150
    },
    POINTS: {
        LINE_POINTS: {
            1: 100,  // 1 line = 100 points
            2: 120,  // 2 lines = 120 points per line
            3: 150,  // 3 lines = 150 points per line
            4: 200   // 4 lines = 200 points per line
        },
        LEVEL_MULTIPLIER: 0.1,  // +0.1x per level
        SOFT_DROP: 1,
        HARD_DROP: 2
    },
    COLORS: {
        GRID: 'rgba(128, 128, 128, 0.2)',
        PLACED_BLOCKS: '#d3d3d3',
        BLOCK_BORDER: '#999999',
        TETROMINOS: {
            I: '#B3FFF9',
            O: '#FFFFBA',
            T: '#FFB3FF',
            S: '#BAFFC9',
            Z: '#FFB3BA',
            J: '#BAE1FF',
            L: '#FFE4B3'
        }
    },
    UI: {
        PRIMARY_COLOR: '#1a1a1a',
        ACCENT_COLOR: '#3498db',
        TEXT_COLOR: '#ecf0f1',
        BACKGROUND_COLOR: '#ffffff',
        PROGRESS_BAR_COLOR: '#2ecc71',
        PROGRESS_BAR_BG: '#bdc3c7',
        FONT_FAMILY: '"Segoe UI", sans-serif',
        SIDE_PANEL_WIDTH: 200,
        SIDE_PANEL_PADDING: 20
    },
    GAME_STATES: {
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameOver'
    }
};

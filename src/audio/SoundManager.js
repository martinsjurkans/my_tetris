class SoundManager {
    constructor() {
        this.sounds = {};
        this.backgroundMusic = null;
        this.muted = false;
        this.musicMuted = false;
        this.initialized = false;
        this.userInteracted = false; // Flag to track if user has interacted
        this.loadSounds();
    }

    loadSounds() {
        // Define all the sounds we need
        const soundFiles = {
            rotate: 'rotate.mp3',
            move: 'move.mp3',
            land: 'land.mp3',
            wall: 'wall.mp3',
            lineClear: 'lineClear.mp3',
            gameOver: 'gameOver.mp3'
        };

        // Create audio elements for each sound
        for (const [name, file] of Object.entries(soundFiles)) {
            this.sounds[name] = new Audio(`sounds/${file}`);
            this.sounds[name].volume = 0.5; // Set default volume
        }
        
        // Load background music
        this.backgroundMusic = new Audio('sounds/backgroundMusic.mp3');
        this.backgroundMusic.loop = true; // Loop the background music
        this.backgroundMusic.volume = 0.3; // Lower volume for background music

        this.initialized = true;
        console.log('Sound manager initialized with sounds:', Object.keys(this.sounds));
    }

    play(soundName) {
        if (this.muted || !this.initialized) return;
        
        // Mark that user has interacted with the game
        this.userInteracted = true;
        
        const sound = this.sounds[soundName];
        if (sound) {
            // Stop and reset the sound before playing again
            sound.pause();
            sound.currentTime = 0;
            
            // Play the sound
            sound.play().catch(error => {
                console.warn(`Failed to play sound ${soundName}:`, error);
            });
        } else {
            console.warn(`Sound ${soundName} not found`);
        }
    }
    
    markUserInteraction() {
        this.userInteracted = true;
        // Try to play background music now that user has interacted
        this.playBackgroundMusic();
    }

    playBackgroundMusic() {
        // Only attempt to play if user has interacted and music is not muted
        if (this.userInteracted && !this.musicMuted && this.backgroundMusic) {
            this.backgroundMusic.play().catch(error => {
                console.warn('Failed to play background music:', error);
            });
        }
    }

    pauseBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }

    toggleBackgroundMusic() {
        if (this.backgroundMusic) {
            if (this.backgroundMusic.paused) {
                this.playBackgroundMusic();
            } else {
                this.pauseBackgroundMusic();
            }
        }
        return !this.backgroundMusic.paused;
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    toggleMusicMute() {
        this.musicMuted = !this.musicMuted;
        if (this.musicMuted) {
            this.pauseBackgroundMusic();
        } else {
            this.playBackgroundMusic();
        }
        return this.musicMuted;
    }

    setMute(muted) {
        this.muted = muted;
    }

    setMusicMute(muted) {
        this.musicMuted = muted;
        if (this.musicMuted) {
            this.pauseBackgroundMusic();
        } else {
            this.playBackgroundMusic();
        }
    }

    isMuted() {
        return this.muted;
    }
    
    isMusicMuted() {
        return this.musicMuted;
    }
}

export default SoundManager;

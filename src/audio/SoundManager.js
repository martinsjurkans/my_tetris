class SoundManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
        this.initialized = false;
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

        this.initialized = true;
        console.log('Sound manager initialized with sounds:', Object.keys(this.sounds));
    }

    play(soundName) {
        if (this.muted || !this.initialized) return;
        
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

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    setMute(muted) {
        this.muted = muted;
    }

    isMuted() {
        return this.muted;
    }
}

export default SoundManager;

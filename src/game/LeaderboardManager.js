class LeaderboardManager {
    constructor() {
        this.leaderboard = this.loadLeaderboard();
    }

    loadLeaderboard() {
        try {
            const savedData = localStorage.getItem('tetrisLeaderboard');
            return savedData ? JSON.parse(savedData) : [];
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            return [];
        }
    }

    saveLeaderboard() {
        try {
            localStorage.setItem('tetrisLeaderboard', JSON.stringify(this.leaderboard));
        } catch (error) {
            console.error('Error saving leaderboard:', error);
        }
    }

    isHighScore(score) {
        if (this.leaderboard.length < 10) return true;
        return score > this.leaderboard[this.leaderboard.length - 1].score;
    }

    addScore(name, score) {
        const entry = {
            name: name.substring(0, 15),
            score: score,
            date: new Date().toISOString()
        };

        // Remove any existing entries with the same name
        this.leaderboard = this.leaderboard.filter(e => e.name !== entry.name);
        
        // Add new entry
        this.leaderboard.push(entry);
        
        // Sort by score (highest first)
        this.leaderboard.sort((a, b) => b.score - a.score);
        
        // Keep only top 10
        if (this.leaderboard.length > 10) {
            this.leaderboard = this.leaderboard.slice(0, 10);
        }

        // Save immediately
        this.saveLeaderboard();
        return this.leaderboard;
    }

    getScores() {
        return this.leaderboard;
    }
}

export default LeaderboardManager;

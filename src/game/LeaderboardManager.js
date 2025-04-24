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

    // Fetch the global leaderboard from the API
    async fetchLeaderboard() {
        try {
            const res = await fetch('/api/leaderboard');
            if (!res.ok) throw new Error('Failed to fetch leaderboard');
            this.leaderboard = await res.json();
            return this.leaderboard;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
    }

    // Submit a new score to the global API
    async submitScore(name, score) {
        try {
            const res = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, score })
            });
            if (!res.ok) throw new Error('Failed to submit score');
            const newEntry = await res.json();
            // Optionally re-fetch leaderboard
            await this.fetchLeaderboard();
            return newEntry;
        } catch (error) {
            console.error('Error submitting score:', error);
            return null;
        }
    }

    // Check if a score is a high score (after fetching latest leaderboard)
    isHighScore(score) {
        if (this.leaderboard.length < 10) return true;
        return score > this.leaderboard[this.leaderboard.length - 1].score;
    }

    getScores() {
        return this.leaderboard;
    }
}

export default LeaderboardManager;

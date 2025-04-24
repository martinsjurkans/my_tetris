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
        console.log('Attempting to submit score to API:', { name, score });
        try {
            console.log('Fetching API endpoint at:', window.location.origin + '/api/leaderboard');
            const res = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, score })
            });
            
            console.log('API response status:', res.status);
            
            if (!res.ok) {
                try {
                    const errorData = await res.json();
                    console.error('API error response:', errorData);
                    throw new Error(`Failed to submit score: ${res.status} ${JSON.stringify(errorData)}`);
                } catch (jsonError) {
                    const errorText = await res.text();
                    console.error('API error response (text):', errorText);
                    throw new Error(`Failed to submit score: ${res.status} ${errorText}`);
                }
            }
            
            const newEntry = await res.json();
            console.log('Successfully submitted score to API:', newEntry);
            
            // Optionally re-fetch leaderboard
            await this.fetchLeaderboard();
            return newEntry;
        } catch (error) {
            console.error('Error submitting score:', error);
            console.log('Falling back to local storage');
            // Fall back to local storage if API fails
            this.addScoreLocally(name, score);
            return { name, score, date: new Date().toISOString() };
        }
    }

    // Add a score to local storage as fallback
    addScoreLocally(name, score) {
        try {
            // Get current leaderboard
            const leaderboard = this.loadLeaderboard();
            
            // Add new score
            const newEntry = {
                name: name,
                score: score,
                date: new Date().toISOString()
            };
            
            leaderboard.push(newEntry);
            
            // Sort by score (highest first)
            leaderboard.sort((a, b) => b.score - a.score);
            
            // Keep only top 10
            const topScores = leaderboard.slice(0, 10);
            
            // Save back to localStorage
            localStorage.setItem('tetrisLeaderboard', JSON.stringify(topScores));
            
            // Update the current leaderboard
            this.leaderboard = topScores;
            
            return newEntry;
        } catch (error) {
            console.error('Error saving score locally:', error);
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

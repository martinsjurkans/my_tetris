// Vercel serverless function for global leaderboard
// Simple implementation using serverless functions with in-memory storage

// In-memory storage for scores (persists between invocations as long as the function instance is alive)
// This is a simple solution - in a production app, you'd use a database
let globalScores = [
  { name: 'Champion', score: 10000, date: '2025-04-20T12:00:00Z' },
  { name: 'Runner', score: 8500, date: '2025-04-19T14:30:00Z' },
  { name: 'ThirdPlace', score: 7200, date: '2025-04-18T09:15:00Z' },
  { name: 'FourthBest', score: 6800, date: '2025-04-17T18:45:00Z' },
  { name: 'FifthStar', score: 5500, date: '2025-04-16T20:30:00Z' }
];

module.exports = async (req, res) => {
  try {
    console.log('API endpoint called');
    console.log('Request method:', req.method);
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request (for CORS preflight)
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'GET') {
      // Sort scores and add rank
      const sortedScores = [...globalScores].sort((a, b) => b.score - a.score);
      const leaderboard = sortedScores.slice(0, 10).map((entry, idx) => ({
        rank: idx + 1,
        name: entry.name,
        score: entry.score,
        date: entry.date
      }));
      
      console.log('Returning leaderboard data:', leaderboard);
      return res.status(200).json(leaderboard);
    } else if (req.method === 'POST') {
      // Handle score submission
      console.log('Received POST request body:', req.body);
      const { name, score } = req.body;
      
      if (!name) {
        console.log('Missing name in request');
        return res.status(400).json({ error: 'Name is required' });
      }
      
      if (typeof score !== 'number') {
        console.log('Invalid score type:', typeof score);
        return res.status(400).json({ error: 'Score must be a number' });
      }
      
      // Create new entry
      const newEntry = {
        name: name.substring(0, 15),
        score,
        date: new Date().toISOString()
      };
      
      console.log('New score entry:', newEntry);
      
      // Add the new score to our in-memory array
      globalScores.push(newEntry);
      
      // Sort scores and keep only top 20 to prevent memory issues
      globalScores = globalScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
      
      console.log('Updated global scores, now have:', globalScores.length);
      
      return res.status(201).json({
        success: true,
        message: 'Score submitted successfully',
        entry: newEntry
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message });
  }
};

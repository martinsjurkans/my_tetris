// Vercel serverless function for global leaderboard
// Simple implementation using serverless functions

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
    
    // Mock data for testing
    const mockLeaderboard = [
      { rank: 1, name: 'Champion', score: 10000, date: '2025-04-20T12:00:00Z' },
      { rank: 2, name: 'Runner', score: 8500, date: '2025-04-19T14:30:00Z' },
      { rank: 3, name: 'ThirdPlace', score: 7200, date: '2025-04-18T09:15:00Z' },
      { rank: 4, name: 'FourthBest', score: 6800, date: '2025-04-17T18:45:00Z' },
      { rank: 5, name: 'FifthStar', score: 5500, date: '2025-04-16T20:30:00Z' }
    ];

    if (req.method === 'GET') {
      // Return mock leaderboard data
      console.log('Returning mock leaderboard data');
      return res.status(200).json(mockLeaderboard);
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
      
      // In a real implementation, you would save this to a database
      // For now, we'll just return success
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

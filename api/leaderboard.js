const fetch = require('node-fetch');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const TABLE = 'leaderboard';

module.exports = async (req, res) => {
  // Log environment variables status (without revealing values)
  console.log('Supabase URL set:', !!SUPABASE_URL);
  console.log('Supabase Key set:', !!SUPABASE_KEY);
  console.log('Request method:', req.method);
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    res.status(500).json({ error: 'Supabase credentials not set' });
    return;
  }

  if (req.method === 'GET') {
    // Fetch top 10 scores
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=*&order=score.desc,date.asc&limit=10`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const data = await response.json();
    // Add rank
    const leaderboard = data.map((entry, idx) => ({
      rank: idx + 1,
      name: entry.name,
      score: entry.score,
      date: entry.date
    }));
    res.status(200).json(leaderboard);
  } else if (req.method === 'POST') {
    try {
      // Add a new score
      console.log('Received POST request body:', req.body);
      const { name, score } = req.body;
      
      if (!name) {
        console.log('Missing name in request');
        res.status(400).json({ error: 'Name is required' });
        return;
      }
      
      if (typeof score !== 'number') {
        console.log('Invalid score type:', typeof score);
        res.status(400).json({ error: 'Score must be a number' });
        return;
      }
      
      const entry = {
        name: name.substring(0, 15),
        score,
        date: new Date().toISOString()
      };
      
      console.log('Sending entry to Supabase:', entry);
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(entry)
      });
      
      console.log('Supabase response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase error:', errorText);
        res.status(500).json({ error: `Supabase error: ${errorText}` });
        return;
      }
      
      const data = await response.json();
      console.log('Supabase success response:', data);
      res.status(201).json(data[0]);
    } catch (error) {
      console.error('Server error in POST handler:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

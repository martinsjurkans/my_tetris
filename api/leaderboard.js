// Vercel serverless function for global leaderboard
// Requires SUPABASE_URL and SUPABASE_KEY in environment variables

const fetch = require('node-fetch');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const TABLE = 'leaderboard';

module.exports = async (req, res) => {
  try {
    // Basic diagnostics
    console.log('API endpoint called');
    console.log('Supabase URL set:', !!SUPABASE_URL);
    console.log('Supabase Key set:', !!SUPABASE_KEY);
    console.log('Request method:', req.method);
    
    // Check environment variables
    if (!SUPABASE_URL) {
      return res.status(500).json({ error: 'SUPABASE_URL not set' });
    }
    
    if (!SUPABASE_KEY) {
      return res.status(500).json({ error: 'SUPABASE_KEY not set' });
    }
    
    // Return environment info for debugging
    if (req.method === 'GET' && req.query.debug === 'true') {
      return res.status(200).json({
        success: true,
        message: 'Debug info',
        env: {
          supabaseUrlSet: !!SUPABASE_URL,
          supabaseKeySet: !!SUPABASE_KEY,
          nodeEnv: process.env.NODE_ENV,
          table: TABLE
        }
      });
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
      return res.status(200).json(leaderboard);
    } else if (req.method === 'POST') {
      // Add a new score
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
        return res.status(500).json({ error: `Supabase error: ${errorText}` });
      }
      
      const data = await response.json();
      console.log('Supabase success response:', data);
      return res.status(201).json(data[0]);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message });
  }
};

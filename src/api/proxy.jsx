export default async function handler(req, res) {
    const { path } = req.query;
    const url = `https://51.20.143.235.nip.io${path || ''}`;
    
    try {
      const fetchOptions = {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (req.method !== 'GET' && req.body) {
        fetchOptions.body = JSON.stringify(req.body);
      }
      
      const response = await fetch(url, fetchOptions);
      const data = await response.json();
      
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).json({ error: 'Failed to fetch from API' });
    }
  }
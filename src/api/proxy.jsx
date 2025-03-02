// /api/proxy.js
export default async function handler(req, res) {
    // Extract the path from query parameters
    const path = req.query.path || '';
    
    // Build the target URL
    const targetUrl = `https://51.20.143.235.nip.io${path}`;
    
    // Set up request options
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization if present
        ...(req.headers.authorization && { 
          'Authorization': req.headers.authorization 
        })
      }
    };
    
    // Add body for non-GET requests
    if (req.method !== 'GET' && req.body) {
      options.body = JSON.stringify(req.body);
    }
    
    try {
      // Make the request to the backend
      const response = await fetch(targetUrl, options);
      
      // Get response body as text first to handle both JSON and non-JSON responses
      const text = await response.text();
      
      // Try to parse as JSON, if it fails, return as text
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = text;
      }
      
      // Return status and data
      return res.status(response.status).json(data);
    } catch (error) {
      console.error('Proxy error:', error);
      return res.status(500).json({ 
        error: 'Failed to contact backend server',
        details: error.message
      });
    }
  }
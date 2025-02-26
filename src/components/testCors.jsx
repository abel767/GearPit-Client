import { useState } from 'react';
import axios from 'axios';

const TestCORS = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const testConnection = async () => {
    try {
      const response = await axios.get('https://51.20.143.235.nip.io/test-cors', {
      });
      setResult(response.data);
      setError(null);
    } catch (err) {
      setError(err.toString());
      setResult(null);
    }
  };
  
  return (
    <div>
      <button onClick={testConnection}>Test CORS Connection</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
      {error && <div style={{color: 'red'}}>{error}</div>}
    </div>
  );
};

export default TestCORS;
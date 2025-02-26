import { useState } from 'react';

const TestCORS = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    try {
      const response = await fetch('https://51.20.143.235.nip.io/test-cors', {
        credentials: 'include'
      });
      const data = await response.json();
      setResult(data);
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
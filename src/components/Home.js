import React, { useState } from 'react';
import Congratulations from './Congratulations';

function Home() {
  const [bondName, setBondName] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [totalMatches, setTotalMatches] = useState(0);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bondName) {
      setError('Please select a bond type');
      return;
    }

    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setTotalMatches(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bondType', bondName);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      if (data.success) {
        setResults(data.matches);
        setTotalMatches(data.totalMatches);
      } else {
        throw new Error(data.error || 'Processing failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setBondName('');
    setFile(null);
    setResults(null);
    setError(null);
    setTotalMatches(0);
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>🎰 Bond Matcher</h2>
      {!results && (
        <form onSubmit={handleSubmit}>
          <label>
            Bond Type:
            <select value={bondName} onChange={e => setBondName(e.target.value)} style={{ marginLeft: 8, padding: 8 }}>
              <option value="" disabled>Select bond</option>
              <option value="1500">1500</option>
              <option value="750">750</option>
              <option value="200">200</option>
              <option value="100">100</option>
            </select>
          </label>
          <br /><br />
          <label>
            Upload TXT File:
            <input 
              type="file" 
              accept=".txt" 
              onChange={handleFileChange}
              disabled={loading}
              style={{ marginLeft: 8, padding: 8 }} 
            />
          </label>
          <br /><br />
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer', backgroundColor: loading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: 4 }}>
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </form>
      )}

      {error && (
        <div style={{ marginTop: 20, padding: 15, backgroundColor: '#fee', color: '#c33', borderRadius: 4, border: '1px solid #f99' }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {results && (
        <Congratulations
          isWin={totalMatches > 0}
          bondNumber={totalMatches > 0 ? results[0].bond_number : ''}
          prize={totalMatches > 0 ? results[0].prize : ''}
          onReset={reset}
        />
      )}
    </div>
  );
}

export default Home;

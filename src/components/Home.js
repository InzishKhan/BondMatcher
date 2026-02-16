import React, { useState } from 'react';

function Home() {
  const [bondName, setBondName] = useState('1500');
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    alert(`Bond: ${bondName}\nFile: ${file ? file.name : 'No file selected'}`);
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Bond Form</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Bond Name:
          <select value={bondName} onChange={e => setBondName(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="1500">1500</option>
            <option value="750">750</option>
            <option value="200">200</option>
            <option value="100">100</option>
          </select>
        </label>
        <br /><br />
        <label>
          Upload TXT File:
          <input type="file" accept=".txt" onChange={e => setFile(e.target.files[0])} style={{ marginLeft: 8 }} />
        </label>
        <br /><br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Home;

import React, { useState, useCallback, useState as useReactStateAlias } from 'react';
import { useNavigate } from 'react-router-dom';
import HowItWorksSection from './HowItWorksSection';
import ExampleFileFormat from './ExampleFileFormat';

function Home() {
  const [bondName, setBondName] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isDragActive, setIsDragActive] = useReactStateAlias(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragActive(false);

      if (event.dataTransfer.files && event.dataTransfer.files[0]) {
        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile.name.toLowerCase().endsWith('.txt')) {
          setFile(droppedFile);
          setError(null);
        } else {
          setError('Please upload a .txt file');
        }
      }
    },
    [setFile, setError, setIsDragActive]
  );

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
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

        if (data.totalMatches > 0) {
          navigate('/results', {
            state: {
              results: data.matches,
              totalMatches: data.totalMatches,
              bondType: bondName,
            },
          });
        }
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

  const hasResults = results && results.length > 0;
  const hasCheckedNoResults = results && results.length === 0 && !loading && !error;

  return (
    <div>
      {/* Hero */}
      <section className="bm-hero">
        <div>
          <h1 className="bm-hero-heading">Check Your Prize Bonds Instantly</h1>
          <p className="bm-hero-subtext">
            Upload a simple text file with your bond numbers and let BondMatch
            tell you in seconds if any have won in the latest draw.
          </p>
          <div className="bm-hero-badges">
            <span className="bm-hero-badge">Secure local file processing</span>
            <span className="bm-hero-badge bm-hero-badge--success">No spreadsheets needed</span>
          </div>
          <div className="bm-hero-cta">
            <button
              type="button"
              className="bm-primary-btn"
              onClick={() => {
                const el = document.getElementById('bondmatch-tool');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              Check My Bonds
            </button>
            <div className="bm-secondary-text">
              Designed so anyone can check bonds in under 10 seconds.
            </div>
          </div>
        </div>

        <div className="bm-hero-card">
          <div className="bm-hero-card-header">
            <div className="bm-hero-card-title">Next draw check</div>
            <span className="bm-hero-card-tag">Latest official results</span>
          </div>
          <p className="bm-hero-subtext" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            Start from here or use the full tool below.
          </p>
        </div>
      </section>

      {/* Main tool */}
      <section id="bondmatch-tool" className="bm-tool-card">
        <form onSubmit={handleSubmit}>
          <div className="bm-field-group">
            <label className="bm-label" htmlFor="bondType">
              Bond category
            </label>
            <select
              id="bondType"
              value={bondName}
              onChange={(e) => setBondName(e.target.value)}
              className="bm-select"
              disabled={loading}
            >
              <option value="">Select bond category</option>
              <option value="100">Rs. 100</option>
              <option value="200">Rs. 200</option>
              <option value="750">Rs. 750</option>
              <option value="1500">Rs. 1500</option>
            </select>
          </div>

          <div className="bm-field-group">
            <label className="bm-label">
              Bond list (.txt)
            </label>
            <div
              className={`bm-dropzone ${isDragActive ? 'bm-dropzone--active' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="bm-dropzone-title">Drag &amp; drop your .txt file here</div>
              <div className="bm-dropzone-sub">or click below to browse from your computer</div>
              <input
                className="bm-file-input"
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                disabled={loading}
              />
              {file && (
                <div className="bm-file-name">
                  Selected file: <strong>{file.name}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="bm-tool-actions">
            <button
              type="submit"
              className="bm-primary-btn"
              disabled={loading}
            >
              {loading ? 'Checking bonds…' : 'Check Bonds'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bm-error">
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="bm-loading">
            <span className="bm-spinner" />
            <span>Checking the latest draw results...</span>
          </div>
        )}

        <div className="bm-results">
          {hasResults && (
            <>
              <div className="bm-results-header">
                <div className="bm-results-title">Winning bonds found</div>
                <div className="bm-results-count">
                  {totalMatches} match{totalMatches === 1 ? '' : 'es'}
                </div>
              </div>
              <div className="bm-results-grid">
                {results.map((match, index) => (
                  <div key={`${match.bond_number}-${index}`} className="bm-result-card">
                    <div className="bm-result-bond">Bond #{match.bond_number}</div>
                    <div className="bm-result-prize">{match.prize}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {hasCheckedNoResults && (
            <div className="bm-results-empty">
              No winning bonds found this draw. Double-check your bond category and file,
              or try again on the next draw.
            </div>
          )}
        </div>

        {(hasResults || hasCheckedNoResults) && (
          <div style={{ marginTop: '1.2rem' }}>
            <button
              type="button"
              className="bm-primary-btn"
              onClick={reset}
            >
              Check Another File
            </button>
          </div>
        )}
      </section>

      {/* Extra sections */}
      <section className="bm-sections">
        <HowItWorksSection />
        <ExampleFileFormat />
      </section>

      {/* About on main page, above footer */}
      <section id="about" className="bm-about">
        <h1>About BondMatch</h1>
        <p>
          BondMatch is a simple tool that helps you quickly check whether your
          government prize bonds have won in the latest draw. Upload a plain
          text file with one bond number per line, choose the correct bond
          category, and let BondMatch do the rest.
        </p>
        <p>
          Our goal is to make prize bond checking fast, transparent, and
          accessible for everyone &mdash; no spreadsheets, no manual searching,
          and no technical steps required.
        </p>
      </section>
    </div>
  );
}

export default Home;

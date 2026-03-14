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
  const [isFormHovered, setIsFormHovered] = useState(false);
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
              drawMeta: data.drawMeta || null,
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

        <div
          style={{
            marginLeft: '2.5rem',
          }}
        >
          <video
            src="/main_page.mp4"
            controls
            style={{
              width: '100%',
              maxWidth: '800px',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.18)',
              display: 'block',
              border: '3px solid #000',
            }}
          />
        </div>
      </section>

      {/* Main tool */}
      <section
        id="bondmatch-tool"
        className="bm-tool-card"
        style={{ marginTop: '3.5rem' }}
      >
        <div
          onMouseEnter={() => setIsFormHovered(true)}
          onMouseLeave={() => setIsFormHovered(false)}
          style={{
            borderRadius: '1.25rem',
            padding: '2.25rem 2.4rem',
            background:
              'radial-gradient(circle at top left, rgba(137, 182, 255, 0.13), transparent 55%), radial-gradient(circle at bottom right, rgba(16,185,129,0.16), transparent 55%),rgb(42, 137, 201)',
            boxShadow: isFormHovered
              ? '0 24px 50px rgba(60, 79, 123, 0.8)'
              : '0 18px 38px rgba(97, 131, 212, 0.65)',
            transform: isFormHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
            transition: 'transform 220ms ease, box-shadow 220ms ease',
            border: '1px solid rgba(148, 163, 184, 0.55)',
          }}
        >
        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
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
        </div>

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
            <div
              className="bm-results-empty"
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: 'red',
              }}
            >
              No winning bonds matched in this draw.
              <span
                style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: 400,
                  marginTop: '0.25rem',
                }}
              >
                Keep your bonds safe and check again on the next official result day.
              </span>
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
      <section
        className="bm-sections"
        style={{ marginTop: '3.5rem' }}
      >
        <HowItWorksSection />
        <ExampleFileFormat />
      </section>

      {/* About on main page, above footer */}
      <section
        id="about"
        className="bm-about"
        style={{ marginTop: '3.5rem' }}
      >
        {/* CTA Section above footer */}
        <section
          className="bm-cta"
          style={{
            marginTop: "3.5rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg, #2f6df6, #1fbf73)",
              borderRadius: "14px",
              padding: "3rem 2rem",
              textAlign: "center",
              color: "white",
              maxWidth: "900px",
              width: "100%",
            }}
          >
            <h2 style={{ fontSize: "1.9rem", marginBottom: "0.7rem" }}>
              Ready to Check Your Bonds?
            </h2>
        
            <p style={{ opacity: 0.9, marginBottom: "1.8rem" }}>
              Join thousands of users who trust BondMatch for their prize bond
              checking needs.
            </p>
        
            <button
              style={{
                background: "white",
                color: "#2563eb",
                border: "none",
                padding: "0.8rem 1.6rem",
                borderRadius: "10px",
                fontWeight: "600",
                cursor: "pointer",
              }}
              onClick={() => {
                const el = document.getElementById('bondmatch-tool');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              Get Started Now
            </button >
          </div>
        </section>
      </section>
    </div>
  );
}

export default Home;

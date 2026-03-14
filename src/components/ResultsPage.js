import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Congratulations from './Congratulations';

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const { results = [], totalMatches = 0, bondType, drawMeta } = state;

  const hasResults = results && results.length > 0;

  const handleReset = () => {
    navigate('/');
  };

  if (!location.state) {
    return (
      <section className="bm-tool-card">
        <p style={{ fontSize: '0.95rem', color: '#4b5563' }}>
          No result data found. Please go back and check your bonds again.
        </p>
        <div style={{ marginTop: '1rem' }}>
          <button type="button" className="bm-primary-btn" onClick={handleReset}>
            Back to BondMatch
          </button>
        </div>
      </section>
    );
  }

  return (
    <div>
      <section className="bm-tool-card">
        <div className="bm-results-header" style={{ marginBottom: '1.2rem' }}>
          <div className="bm-results-title">
            {hasResults ? 'Winning bonds found' : 'No winning bonds this draw'}
          </div>
          <div className="bm-results-count">
            {hasResults
              ? `${totalMatches} match${totalMatches === 1 ? '' : 'es'}`
              : bondType
              ? `Category: Rs. ${bondType}`
              : null}
          </div>
        </div>

        {drawMeta && (
          <div style={{ marginBottom: '1.2rem', fontSize: '0.85rem', color: '#6b7280' }}>
            <span>
              Showing results for the latest available draw on{' '}
              <strong>{drawMeta.draw_date}</strong>.
            </span>
            {drawMeta.is_fallback && (
              <span>
                {' '}
                The current year does not have a published draw yet, so we used the most recent
                previous draw automatically.
              </span>
            )}
          </div>
        )}

        {hasResults ? (
          <div className="bm-results-grid">
            {results.map((match, index) => (
              <div key={`${match.bond_number}-${index}`} className="bm-result-card">
                <div className="bm-result-bond">Bond #{match.bond_number}</div>
                <div className="bm-result-prize">{match.prize}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bm-results-empty">
            No winning bonds found this draw. Double-check your bond category and file,
            or try again on the next draw.
          </div>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <button type="button" className="bm-primary-btn" onClick={handleReset}>
            Check Another File
          </button>
        </div>
      </section>

      {hasResults && (
        <div style={{ marginTop: '1.5rem' }}>
          <Congratulations
            isWin={totalMatches > 0}
            bondNumber={totalMatches > 0 ? results[0].bond_number : ''}
            prize={totalMatches > 0 ? results[0].prize : ''}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
}

export default ResultsPage;


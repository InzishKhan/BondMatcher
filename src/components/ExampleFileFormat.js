import React from 'react';

function ExampleFileFormat({ compact = true }) {
  return (
    <section className="bm-section-card">
      <h2 className="bm-section-title">Example bond file format</h2>
      <div className="bm-file-example">
        <div className="bm-file-example-title">bonds.txt</div>
        <div>
          123456{'\n'}
          987654{'\n'}
          456789{'\n'}
          112233
        </div>
        <div className="bm-file-example-footer">
          One bond number per line. No commas, spaces, or extra text.
        </div>
      </div>
      {compact ? null : (
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.8rem' }}>
          You can export this list from a spreadsheet application or create it
          manually in any text editor and save it as a .txt file.
        </p>
      )}
    </section>
  );
}

export default ExampleFileFormat;


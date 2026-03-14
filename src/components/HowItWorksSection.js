import React from 'react';

function HowItWorksSection() {
  return (
    <section className="bm-section-card" id="how-it-works">
      <h2 className="bm-section-title">How It Works</h2>
      <div className="bm-steps">
        <div className="bm-step">
          <div className="bm-step-icon">1</div>
          <div>
            <div className="bm-step-content-title">Select your bond category</div>
            <div className="bm-step-content-text">
              Choose the correct denomination (Rs.100, 200, 750, or 1500) so we
              can look up the right draw results.
            </div>
          </div>
        </div>
        <div className="bm-step">
          <div className="bm-step-icon">2</div>
          <div>
            <div className="bm-step-content-title">Upload your bond list</div>
            <div className="bm-step-content-text">
              Upload a .txt file with one bond number per line. You can drag and
              drop or browse from your computer.
            </div>
          </div>
        </div>
        <div className="bm-step">
          <div className="bm-step-icon">3</div>
          <div>
            <div className="bm-step-content-title">See your results instantly</div>
            <div className="bm-step-content-text">
              BondMatch checks the latest official draw results and highlights
              any winning bonds for you.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;


import React from 'react';
import HowItWorksSection from './HowItWorksSection';
import ExampleFileFormat from './ExampleFileFormat';

function HowItWorksPage() {
  return (
    <div>
      <HowItWorksSection />
      <ExampleFileFormat compact={false} />
    </div>
  );
}

export default HowItWorksPage;


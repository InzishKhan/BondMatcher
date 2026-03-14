import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../components/Home';
import HowItWorksPage from '../components/HowItWorksPage';
import ResultsPage from '../components/ResultsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="results" element={<ResultsPage />} />
      </Route>
    </Routes>
  );
}

export default App;

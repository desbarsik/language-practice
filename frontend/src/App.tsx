import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { Home } from './pages/Home';
import { LearningSession } from './pages/LearningSession';
import { Statistics } from './pages/Statistics';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learning" element={<LearningSession />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

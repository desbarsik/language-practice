import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { Home } from './pages/Home';
import { LearningSession } from './pages/LearningSession';
import { Statistics } from './pages/Statistics';
import { MyCards } from './pages/MyCards';
import { ReviewErrors } from './pages/ReviewErrors';
import { AiTutor } from './pages/AiTutor';
import { AchievementNotification } from './components/common/AchievementNotification';

function App() {
  return (
    <BrowserRouter>
      <AchievementNotification />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learning" element={<LearningSession />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/my-cards" element={<MyCards />} />
          <Route path="/review-errors" element={<ReviewErrors />} />
          <Route path="/ai-tutor" element={<AiTutor />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

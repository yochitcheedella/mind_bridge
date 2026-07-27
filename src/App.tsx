import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout
import { Navbar } from './components/layout/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AIChat from './pages/AIChat';
import MoodTracker from './pages/MoodTracker';
import Journal from './pages/Journal';
import Appointments from './pages/Appointments';
import PsychologistDashboard from './pages/PsychologistDashboard';
import EmergencyResponse from './pages/EmergencyResponse';
import AdminAnalytics from './pages/AdminAnalytics';
import Community from './pages/Community';
import WellnessExercises from './pages/WellnessExercises';
import ProfileSettings from './pages/ProfileSettings';
import HabitTracker from './pages/HabitTracker';
import Assessments from './pages/Assessments';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student App */}
        <Route path="/"             element={<StudentDashboard />} />
        <Route path="/chat"         element={<AIChat />} />
        <Route path="/mood"         element={<MoodTracker />} />
        <Route path="/journal"      element={<Journal />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/community"    element={<Community />} />
        <Route path="/wellness"      element={<WellnessExercises />} />
        <Route path="/settings"      element={<ProfileSettings />} />
        <Route path="/habits"        element={<HabitTracker />} />
        <Route path="/assessments"   element={<Assessments />} />

        {/* Clinical / Admin */}
        <Route path="/clinical"   element={<PsychologistDashboard />} />
        <Route path="/emergency"  element={<EmergencyResponse />} />
        <Route path="/admin"      element={<AdminAnalytics />} />
      </Routes>

      {/* Bottom navigation bar — auto-hides on auth/clinical/admin routes */}
      <Navbar />
    </BrowserRouter>
  );
}

export default App;

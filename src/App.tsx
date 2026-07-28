import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { getAuth, applyPrimaryColor } from './utils/auth';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Landing from './pages/Landing';
import UniversityOnboarding from './pages/UniversityOnboarding';
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
import SleepTracker from './pages/SleepTracker';
import FollowUpPlan from './pages/FollowUpPlan';
import Notifications from './pages/Notifications';
import VoiceTherapist from './pages/VoiceTherapist';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
function App() {
  const location = useLocation();
  const hiddenPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/onboarding', '/clinical', '/emergency', '/admin', '/superadmin'];
  const showLayout = location.pathname !== '/' && !hiddenPaths.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    const auth = getAuth();
    if (auth?.primary_color) {
      applyPrimaryColor(auth.primary_color);
    }
  }, []);

  return (
    <>
      <Routes>
        {/* Auth */}
        {/* Auth */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Public */}
        <Route path="/"         element={<Landing />} />
        <Route path="/onboarding" element={<UniversityOnboarding />} />

        {/* Student App */}
        <Route path="/dashboard"    element={<StudentDashboard />} />
        <Route path="/chat"         element={<AIChat />} />
        <Route path="/mood"         element={<MoodTracker />} />
        <Route path="/journal"      element={<Journal />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/community"    element={<Community />} />
        <Route path="/wellness"      element={<WellnessExercises />} />
        <Route path="/settings"      element={<ProfileSettings />} />
        <Route path="/habits"        element={<HabitTracker />} />
        <Route path="/assessments"   element={<Assessments />} />
        <Route path="/sleep"         element={<SleepTracker />} />
        <Route path="/recovery-plan" element={<FollowUpPlan />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/voice-therapist" element={<VoiceTherapist />} />

        {/* Clinical / Admin */}
        <Route path="/clinical"   element={<PsychologistDashboard />} />
        <Route path="/emergency"  element={<EmergencyResponse />} />
        <Route path="/admin"      element={<AdminAnalytics />} />
        <Route path="/superadmin" element={<SuperAdminDashboard />} />
      </Routes>

      {/* Bottom navigation bar — auto-hides on auth/clinical/admin routes */}
      <Navbar />
    </>
  );
}

export default App;

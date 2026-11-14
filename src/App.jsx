import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import Navbar from './components/Navbar';
import AiTestPanel from './components/AiTestPanel';
import { VoiceAssistantProvider } from './context/VoiceAssistantContext';
import VoiceAssistantButton from './components/VoiceAssistantButton';
import ScrollToTop from './components/ScrollToTop';

// Pages
import HomePage from './pages/HomePage';
import ContactUs from './pages/ContactUs';
import PlayPage from './pages/PlayPage';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import EnrollmentForm from './pages/EnrollmentForm';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, role }) => {
  const { currentUser, dataLoading } = useContext(AppContext);
  if (dataLoading) {
    return <div role="status" className="p-8 text-center text-slate-600">Loading account...</div>;
  }
  if (!currentUser) return <Navigate to="/login" />;
  if (role && currentUser.role !== role) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/dashboard'} />;
  }
  return children;
};

function App() {
  const { dataLoading, dataError } = useContext(AppContext);

  return (
    <VoiceAssistantProvider>
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-50 via-blue-50 to-amber-50 dark:from-[#001a3d] dark:via-[#002a5e] dark:to-[#001530] text-slate-900 dark:text-blue-50 font-sans transition-all duration-500">
      <Navbar />
      {dataLoading && (
        <div role="status" className="fixed top-24 left-1/2 z-40 -translate-x-1/2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-lg">
          Loading matches and enrollments...
        </div>
      )}
      {dataError && (
        <div role="alert" className="fixed top-24 left-1/2 z-40 w-[min(90%,40rem)] -translate-x-1/2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800 shadow-lg">
          Could not load project data: {dataError}. Start the API server and check its MongoDB connection.
        </div>
      )}
      <ScrollToTop />
      <VoiceAssistantButton />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/login" element={<Login />} />

        <Route path="/ai-test" element={<AiTestPanel />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute role="user">
            <UserDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/enroll/:matchId" element={
          <ProtectedRoute role="user">
            <EnrollmentForm />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
    </VoiceAssistantProvider>
  );
}

export default App;

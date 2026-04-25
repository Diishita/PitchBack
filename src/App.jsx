import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import Navbar from './components/Navbar';

// Pages
import HomePage from './pages/HomePage';
import ContactUs from './pages/ContactUs';
import PlayPage from './pages/PlayPage';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import EnrollmentForm from './pages/EnrollmentForm';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, role }) => {
  const { currentUser } = useContext(AppContext);
  if (!currentUser) return <Navigate to="/login" />;
  if (role && currentUser.role !== role) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/dashboard'} />;
  }
  return children;
};

function App() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-50 via-blue-50 to-amber-50 dark:from-[#001a3d] dark:via-[#002a5e] dark:to-[#001530] text-slate-900 dark:text-blue-50 font-sans transition-all duration-500">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/login" element={<Login />} />
        
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
  );
}

export default App;

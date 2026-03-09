import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// We removed the global NavBar import from here because the individual 
// pages (UserDashboard, Profile) now render it inside their own CSS Grids!
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import './styles/global.css';

const HomeRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'Admin') return <Navigate to="/admin" replace />;
  if (user.role === 'Municipality Staff') return <Navigate to="/staff" replace />;
  return <Navigate to="/user" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* We removed the global NavBar and the wrapping container div. 
            Now, the pages take up the full screen using our CSS Grid! */}
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/staff" element={<StaffDashboard />} />
          
          {/* Added the missing map route so mobile bottom-nav doesn't throw a warning */}
          <Route path="/map" element={<UserDashboard />} /> 
          
          <Route path="/" element={<HomeRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
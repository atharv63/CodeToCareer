import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

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

// 👇 FIX: Smart Map Router 👇
// This ensures that when ANYONE clicks "City Map", they get the correct dashboard
const MapRedirect = () => {
  const { user } = useContext(AuthContext);
  if (user?.role === 'Admin') return <AdminDashboard />;
  if (user?.role === 'Municipality Staff') return <StaffDashboard />;
  return <UserDashboard />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          <Route path="/user" element={<ProtectedRoute allowedRoles={['User']}><UserDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRoles={['User', 'Admin', 'Municipality Staff']}><Profile /></ProtectedRoute>} />
          
          {/* 👇 FIX: The Map route is now allowed for everyone, and uses the Smart Router 👇 */}
          <Route path="/map" element={<ProtectedRoute allowedRoles={['User', 'Admin', 'Municipality Staff']}><MapRedirect /></ProtectedRoute>} /> 
          
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['Municipality Staff']}><StaffDashboard /></ProtectedRoute>} />
          
          <Route path="/" element={<HomeRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
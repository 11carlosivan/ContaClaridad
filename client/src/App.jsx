import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EstadoResultados from './pages/EstadoResultados';
import AdminDashboard from './pages/AdminDashboard';
import Header from './components/Header';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div className="spinner" style={spinnerStyle}></div>
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Cargando ContaClaridad...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header />
      <main className="animated-fade-in">
        {children}
      </main>
    </>
  );
};

// Admin Route Wrapper
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div className="spinner" style={spinnerStyle}></div>
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Cargando Panel Admin...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Header />
      <main className="animated-fade-in">
        {children}
      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/report" 
            element={
              <ProtectedRoute>
                <EstadoResultados />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />

          {/* Redirect all other routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Inline Styles for App loading screen
const loadingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: 'var(--bg-main)'
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '3px solid var(--border-color)',
  borderTop: '3px solid var(--primary)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

export default App;

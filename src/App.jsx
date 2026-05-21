import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Home from './pages/Home';
import { LogOut, BookOpen, User as UserIcon, Trophy, Sparkles } from 'lucide-react';

// Header Navbar Component
const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <header className="navbar">
        <Link to="/" className="logo animate-float" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen size={28} style={{ stroke: 'url(#logo-grad)' }} />
          <span>EduNexus</span>
        </Link>
        {/* SVG Gradient definition for lucide icon */}
        <svg width="0" height="0">
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </svg>

        <div className="nav-links">
          <Link to="/" style={{ fontSize: '0.95rem', fontWeight: 600, color: '#94a3b8' }}>Home</Link>
          <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Login
          </Link>
          <Link to="/login?mode=register" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Sign In
          </Link>
        </div>
      </header>
    );
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge badge-admin">Admin</span>;
      case 'teacher':
        return (
          <span className="badge badge-teacher">
            Teacher ({user.assignedSubject})
          </span>
        );
      case 'student':
        return <span className="badge badge-student">Class {user.classLevel}</span>;
      default:
        return null;
    }
  };

  return (
    <header className="navbar">
      <div className="logo animate-float">
        <BookOpen size={28} style={{ stroke: 'url(#logo-grad)' }} />
        <span>EduNexus</span>
        {/* SVG Gradient definition for lucide icon */}
        <svg width="0" height="0">
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </svg>
      </div>

      <div className="nav-links">
        {user.role === 'student' && (
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginRight: '16px', padding: '6px 16px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' }}>
                <Trophy size={14} />
                <span>Level {user.level}</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                XP: {user.xp} / {user.level * 300}
              </div>
            </div>
            {/* Real-time mini XP bar */}
            <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, (user.xp / (user.level * 300)) * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #f59e0b, #ec4899)',
                  transition: 'width 0.5s ease-out'
                }}
              />
            </div>
          </div>
        )}

        <div className="nav-user">
          {user.role === 'student' && (
            user.profilePic && user.profilePic.startsWith('data:image/') ? (
              <img
                src={user.profilePic}
                alt="Avatar"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--color-primary)',
                  display: 'block'
                }}
              />
            ) : (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem'
              }}>
                {{
                  avatar_1: '🚀',
                  avatar_2: '💻',
                  avatar_3: '📐',
                  avatar_4: '🧪',
                  avatar_5: '🧠',
                  avatar_6: '✍️'
                }[user.profilePic || 'avatar_1'] || '🚀'}
              </div>
            )
          )}
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</span>
          {getRoleBadge(user.role)}
          <button onClick={logout} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

// Route wrapper enforcing login
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#090a10', color: '#fff' }}>
        <div className="animate-float" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Sparkles size={48} className="animate-glow" style={{ color: '#8b5cf6' }} />
          <h2 style={{ fontFamily: 'Outfit' }}>Loading Quest...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized roles to their natural dashboard
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
    if (user.role === 'student') return <Navigate to="/student" replace />;
  }

  return children;
};

// Root redirection controller
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Home />;

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'teacher':
      return <Navigate to="/teacher" replace />;
    case 'student':
      return <Navigate to="/student" replace />;
    default:
      return <Home />;
  }
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;

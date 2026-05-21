import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User as UserIcon, Phone, FileText, CheckCircle, Sparkles, BookOpen } from 'lucide-react';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration States
  const [name, setName] = useState('');
  const [classLevel, setClassLevel] = useState('6');
  const [rollNo, setRollNo] = useState('');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync mode with query parameter
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsRegister(params.get('mode') === 'register');
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name || !email || !password || !classLevel || !rollNo) {
          throw new Error('Please fill in all required fields (Name, Email, Password, Class, and Roll No).');
        }
        await register(name, email, password, classLevel, rollNo, phone);
      } else {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 81px)',
      background: 'radial-gradient(circle at center, #110e24 0%, #06050b 100%)',
      padding: '20px'
    }}>
      <div className="glass-card animate-glow" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '40px',
        borderRadius: '24px',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Floating Space Particles Mock */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          background: 'rgba(139, 92, 246, 0.15)',
          filter: 'blur(30px)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '100px',
          height: '100px',
          background: 'rgba(59, 130, 246, 0.15)',
          filter: 'blur(35px)',
          borderRadius: '50%'
        }} />

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '12px',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '16px',
            color: '#8b5cf6',
            marginBottom: '16px'
          }} className="animate-float">
            <Sparkles size={32} />
          </div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800, marginBottom: '8px' }}>
            {isRegister ? 'Begin Your Quest' : 'Continue Your Quest'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            {isRegister 
              ? 'Create a student profile to play quizzes and unlock levels!' 
              : 'Log in to access your modules, chapters, and scoreboards.'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#f87171',
            fontSize: '0.9rem',
            marginBottom: '24px',
            textAlign: 'center'
          }} className="animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {isRegister && (
            <div className="form-group">
              <label>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input"
                  style={{ paddingLeft: '48px' }}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                className="glass-input"
                style={{ paddingLeft: '48px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input"
                style={{ paddingLeft: '48px' }}
                required
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Class Level *</label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="glass-input"
                    style={{ background: '#090a10', color: '#fff' }}
                  >
                    <option value="6">Class 6</option>
                    <option value="7">Class 7</option>
                    <option value="8">Class 8</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Roll Number *</label>
                  <div style={{ position: 'relative' }}>
                    <FileText size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="e.g. 42"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      className="glass-input"
                      style={{ paddingLeft: '48px' }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="glass-input"
                    style={{ paddingLeft: '48px' }}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isRegister ? 'Launch Journey 🚀' : 'Enter Portal 🔑'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#94a3b8'
        }}>
          {isRegister ? (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#8b5cf6', fontWeight: 600, cursor: 'pointer' }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Are you a student?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#8b5cf6', fontWeight: 600, cursor: 'pointer' }}
              >
                Create Account
              </button>
              <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#64748b' }}>
                Teachers & Admins use accounts created by the administrator.
              </div>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

export default Login;

import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile if token exists on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (error) {
          console.error('Failed to load user session profile', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Student registration handler
  const register = async (name, email, password, classLevel, rollNo, phone) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, classLevel, rollNo, phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Profile update handler
  const updateProfile = async (profileData) => {
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Profile update failed.');
      }

      setUser(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Sync user XP, level, and badges after quiz completions
  const updateGamifiedStats = (newXP, newLevel, newBadges) => {
    if (user) {
      setUser((prevUser) => ({
        ...prevUser,
        xp: newXP,
        level: newLevel,
        badges: newBadges,
      }));
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updateGamifiedStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

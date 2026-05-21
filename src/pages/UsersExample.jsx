import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

/**
 * UsersExample Component
 * Demonstrates fetching data from the backend, handling loading/error states,
 * and displaying the data in a responsive card layout.
 */
const UsersExample = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch from the mock /api/users endpoint we created in the backend
        const data = await api.get('/api/users');
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // UI - Loading State
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '1rem', color: '#666' }}>Loading backend data...</p>
      </div>
    );
  }

  // UI - Error State
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2>Connection Error</h2>
          <p>{error}</p>
          <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
            Hint: Ensure your backend is running and CORS is configured correctly.
          </p>
          <button onClick={() => window.location.reload()} style={styles.button}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // UI - Success State
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>API Integration Example</h1>
        <p style={{ margin: 0, opacity: 0.8 }}>Successfully connected to Render backend.</p>
      </header>
      
      <div style={styles.grid}>
        {users.map((user) => (
          <div key={user.id} style={styles.card}>
            <div style={styles.avatar}>{user.name.charAt(0)}</div>
            <div style={styles.cardInfo}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{user.name}</h3>
              <p style={{ margin: 0, color: '#666' }}>{user.email}</p>
              <span style={styles.badge}>{user.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Inline styles for quick implementation and visual excellence without external dependencies
const styles = {
  page: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Inter", "Segoe UI", sans-serif',
  },
  header: {
    backgroundColor: '#4F46E5', // Indigo primary color
    color: 'white',
    padding: '2rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    fontFamily: '"Inter", "Segoe UI", sans-serif',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f0f0f0',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginRight: '1rem',
  },
  cardInfo: {
    flex: 1,
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#F3F4F6',
    color: '#374151',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginTop: '0.5rem',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #F87171',
    color: '#B91C1C',
    padding: '2rem',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '500px',
  },
  button: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#B91C1C',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #EEF2FF',
    borderTop: '5px solid #4F46E5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
};

// Add keyframes for spinner using a style tag injected into head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default UsersExample;

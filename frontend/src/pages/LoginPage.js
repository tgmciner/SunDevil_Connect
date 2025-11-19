// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('student@asu.edu');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If already logged in, redirect away from login page
  if (user) {
    return <Navigate to="/clubs" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password || 'demo');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login (Phase II)</h2>
      <p>Use one of the seeded demo accounts:</p>
      <ul>
        <li>student@asu.edu (student)</li>
        <li>leader@asu.edu (leader)</li>
        <li>admin@asu.edu (admin)</li>
      </ul>

      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Email:{' '}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '250px' }}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <label>
            Password:{' '}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '250px' }}
              placeholder="Demo only (not checked)"
            />
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
    </div>
  );
}

export default LoginPage;

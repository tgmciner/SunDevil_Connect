import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:4000';

function MyClubsPage() {
  const { token } = useAuth(); // assuming useAuth() gives you { token, user, ... }
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authHeaders = token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    : { 'Content-Type': 'application/json' };

  useEffect(() => {
    const loadMyClubs = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/api/me/clubs`, {
          headers: authHeaders,
        });

        if (!res.ok) {
          const body = await res.text();
          console.error('/api/me/clubs error:', res.status, body);
          setError('Failed to load your clubs');
          setLoading(false);
          return;
        }

        const data = await res.json();
        // backend returns rows with: id, name, description, membershipStatus
        if (Array.isArray(data)) {
          setClubs(data);
        } else {
          console.error('Unexpected /api/me/clubs payload:', data);
          setError('Unexpected response format');
        }
      } catch (err) {
        console.error('MyClubs fetch error:', err);
        setError('Failed to load your clubs');
      } finally {
        setLoading(false);
      }
    };

    loadMyClubs();
  }, [token]); // reload if token changes

  if (loading) return <p>Loading your clubs...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>My Clubs</h2>

      {clubs.length === 0 ? (
        <p>You are not a member of any clubs yet.</p>
      ) : (
        <ul>
          {clubs.map((club) => (
            <li key={club.id} style={{ marginBottom: '0.75rem' }}>
              <Link to={`/clubs/${club.id}`}>
                <strong>{club.name}</strong>
              </Link>
              <div>{club.description}</div>
              {club.membershipStatus && (
                <div>
                  <em>Membership status: {club.membershipStatus}</em>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyClubsPage;

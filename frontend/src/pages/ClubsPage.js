import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:4000';

function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/clubs`);
        if (!res.ok) {
          setError('Failed to load clubs');
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setClubs(data);
        } else {
          setError('Unexpected response format');
        }
      } catch (err) {
        console.error('Fetch clubs error:', err);
        setError('Failed to load clubs');
      } finally {
        setLoading(false);
      }
    };
    loadClubs();
  }, []);

  if (loading) return <p>Loading clubs...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Clubs</h2>
      {clubs.length === 0 ? (
        <p>No clubs available.</p>
      ) : (
        <ul>
          {clubs.map((club) => (
            <li key={club.id}>
              <Link to={`/clubs/${club.id}`}>
                <strong>{club.name}</strong>
              </Link>
              <div>{club.description}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ClubsPage;

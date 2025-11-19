// src/pages/MyEventsPage.js
import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function MyEventsPage() {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMyEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/me/events`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMyEvents();
  }, [token]);

  if (loading) return <p>Loading your events...</p>;

  return (
    <div>
      <h2>My Events</h2>
      {events.length === 0 && <p>You are not registered for any events yet.</p>}
      <ul>
        {events.map((ev) => (
          <li key={ev.id}>
            <Link to={`/events/${ev.id}`}>{ev.title}</Link> ({ev.status})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyEventsPage;

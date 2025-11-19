import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:4000';

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');
  const [freeOnly, setFreeOnly] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sortBy) params.append('sortBy', sortBy);
      if (freeOnly) params.append('freeOnly', 'true');

      const res = await fetch(`${API_BASE}/api/events?${params.toString()}`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, freeOnly]);

  if (loading) return <p>Loading events...</p>;

  return (
    <div>
      <h2>Events</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Sort by:&nbsp;
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Date</option>
          </select>
        </label>
        <label style={{ marginLeft: '1rem' }}>
          <input
            type="checkbox"
            checked={freeOnly}
            onChange={(e) => setFreeOnly(e.target.checked)}
          />
          &nbsp;Free events only
        </label>
      </div>

      <ul>
        {events.map((ev) => (
          <li key={ev.id}>
            <Link to={`/events/${ev.id}`}>
              <strong>{ev.title}</strong>
            </Link>
            <div>
              {ev.date} – {ev.location} {ev.isFree ? '(Free)' : '(Paid)'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EventsPage;

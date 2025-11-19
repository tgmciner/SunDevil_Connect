// src/pages/LeaderDashboardPage.js
import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api/config';
import { useAuth } from '../context/AuthContext';

function LeaderDashboardPage() {
  const { token } = useAuth();
  const [myClubs, setMyClubs] = useState([]);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [newEvent, setNewEvent] = useState({
    clubId: '',
    title: '',
    date: '',
    location: '',
    description: '',
    price: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const clubsRes = await fetch(`${API_BASE}/api/leader/clubs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const clubs = await clubsRes.json();
        setMyClubs(clubs);

        const reqRes = await fetch(`${API_BASE}/api/leader/memberships/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const reqs = await reqRes.json();
        setMembershipRequests(reqs);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [token]);

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newEvent)
      });
      if (res.ok) {
        alert('Event created');
        setNewEvent({
          clubId: '',
          title: '',
          date: '',
          location: '',
          description: '',
          price: 0
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMembershipDecision = async (id, decision) => {
    try {
      const res = await fetch(`${API_BASE}/api/memberships/${id}/${decision}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMembershipRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Leader Dashboard</h2>

      <section>
        <h3>Create Event</h3>
        <form onSubmit={handleCreateEvent}>
          <label>
            Club:
            <select
              name="clubId"
              value={newEvent.clubId}
              onChange={handleEventChange}
              required
            >
              <option value="">Select a club</option>
              {myClubs.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <br />
          <input
            name="title"
            placeholder="Title"
            value={newEvent.title}
            onChange={handleEventChange}
            required
          />
          <br />
          <input
            type="date"
            name="date"
            value={newEvent.date}
            onChange={handleEventChange}
            required
          />
          <br />
          <input
            name="location"
            placeholder="Location"
            value={newEvent.location}
            onChange={handleEventChange}
            required
          />
          <br />
          <textarea
            name="description"
            placeholder="Description"
            value={newEvent.description}
            onChange={handleEventChange}
          />
          <br />
          <input
            type="number"
            name="price"
            value={newEvent.price}
            onChange={handleEventChange}
          />
          <span> Price (0 = free)</span>
          <br />
          <button type="submit">Create Event</button>
        </form>
      </section>

      <section>
        <h3>Membership Requests</h3>
        {membershipRequests.length === 0 && <p>No pending requests.</p>}
        <ul>
          {membershipRequests.map((r) => (
            <li key={r.id}>
              {r.studentName} → {r.clubName}{' '}
              <button onClick={() => handleMembershipDecision(r.id, 'approve')}>Approve</button>
              <button onClick={() => handleMembershipDecision(r.id, 'deny')}>Deny</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default LeaderDashboardPage;

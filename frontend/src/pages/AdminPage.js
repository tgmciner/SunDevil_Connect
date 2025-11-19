// src/pages/AdminPage.js
import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api/config';
import { useAuth } from '../context/AuthContext';

function AdminPage() {
  const { token } = useAuth();
  const [pendingClubs, setPendingClubs] = useState([]);

  useEffect(() => {
    const loadPending = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/clubs/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setPendingClubs(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadPending();
  }, [token]);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/clubs/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPendingClubs((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Admin – Pending Clubs</h2>
      {pendingClubs.length === 0 && <p>No pending clubs.</p>}
      <ul>
        {pendingClubs.map((c) => (
          <li key={c.id}>
            <strong>{c.name}</strong> – {c.description}{' '}
            <button onClick={() => handleApprove(c.id)}>Approve</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPage;

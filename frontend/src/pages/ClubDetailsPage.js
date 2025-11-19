import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:4000';

function ClubDetailsPage() {
  const { id } = useParams(); // /clubs/:id
  const { token } = useAuth(); // adjust name if your context exposes it differently
  const [club, setClub] = useState(null);
  const [membershipStatus, setMembershipStatus] = useState(null); // null | 'pending' | 'approved' | 'denied'
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // helper to build headers with JWT
  const authHeaders = token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    : {
        'Content-Type': 'application/json',
      };

  useEffect(() => {
    const loadClub = async () => {
      setLoading(true);
      setError(null);
      setMessage(null);

      try {
        // 1) club details (public)
        const resClub = await fetch(`${API_BASE}/api/clubs/${id}`);
        if (!resClub.ok) {
          const body = await resClub.text();
          console.error('Club details error:', resClub.status, body);
          setError('Failed to load club');
          setLoading(false);
          return;
        }
        const clubData = await resClub.json();
        setClub(clubData);

        // 2) membership status (requires auth)
        if (token) {
          try {
            const resMembership = await fetch(
              `${API_BASE}/api/clubs/${id}/membership`,
              { headers: authHeaders }
            );

            if (resMembership.ok) {
              const mData = await resMembership.json();
              // backend returns { status: null | 'pending' | 'approved' | 'denied' }
              setMembershipStatus(mData.status);
            } else {
              console.warn(
                'Membership status not ok:',
                resMembership.status,
                await resMembership.text()
              );
            }
          } catch (err) {
            console.error('Membership fetch error:', err);
          }
        }
      } catch (err) {
        console.error('Load club error:', err);
        setError('Failed to load club');
      } finally {
        setLoading(false);
      }
    };

    loadClub();
  }, [id, token]); // re-run if token or id changes

  const handleJoin = async () => {
    setJoinLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/clubs/${id}/join`, {
        method: 'POST',
        headers: authHeaders,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error('Join club error:', res.status, data);
        setMessage(data.error || 'Failed to request membership');
        return;
      }

      // expected: { id: ..., status: 'pending' }
      if (data.status) {
        setMembershipStatus(data.status);
      }
      setMessage('Membership request submitted!');
    } catch (err) {
      console.error('Join club exception:', err);
      setMessage('Failed to request membership');
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) return <p>Loading club...</p>;
  if (error) return <p>{error}</p>;
  if (!club) return <p>Club not found.</p>;

  const renderMembershipText = () => {
    if (membershipStatus === 'approved') return 'You are a member of this club.';
    if (membershipStatus === 'pending') return 'Your membership request is pending.';
    if (membershipStatus === 'denied') return 'Your membership request was denied.';
    return 'You are not a member yet.';
  };

  const showJoinButton =
    membershipStatus === null || membershipStatus === 'denied';

  return (
    <div>
      <h2>{club.name}</h2>
      <p>{club.description}</p>

      <section style={{ marginTop: '1rem' }}>
        <h3>Membership</h3>
        <p>{renderMembershipText()}</p>

        {showJoinButton && (
          <button onClick={handleJoin} disabled={joinLoading}>
            {joinLoading ? 'Submitting...' : 'Request to Join'}
          </button>
        )}

        {message && <p style={{ marginTop: '0.5rem' }}>{message}</p>}
      </section>
    </div>
  );
}

export default ClubDetailsPage;

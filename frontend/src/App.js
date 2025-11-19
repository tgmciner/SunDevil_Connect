import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ClubsPage from './pages/ClubsPage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import ClubDetailsPage from './pages/ClubDetailsPage';
import MyClubsPage from './pages/MyClubsPage';
import MyEventsPage from './pages/MyEventsPage';
import LeaderDashboardPage from './pages/LeaderDashboardPage';
import AdminPage from './pages/AdminPage';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';



function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div>
      <header style={{ padding: '1rem', background: '#660000', color: 'white' }}>
        <h1>SunDevil Connect</h1>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white' }}>Home</Link>
          <Link to="/clubs" style={{ color: 'white' }}>Clubs</Link>
          <Link to="/events" style={{ color: 'white' }}>Events</Link>
          {user && (
            <>
              <Link to="/my-clubs" style={{ color: 'white' }}>My Clubs</Link>
              <Link to="/my-events" style={{ color: 'white' }}>My Events</Link>
              {user.role === 'leader' && (
                <Link to="/leader" style={{ color: 'white' }}>Leader Dashboard</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" style={{ color: 'white' }}>Admin</Link>
              )}
              <span style={{ marginLeft: 'auto', marginRight: '1rem' }}>
                {user.email} ({user.role})
              </span>
              <button onClick={logout}>Logout</button>
            </>
          )}
        </nav>
      </header>

      <main style={{ padding: '1rem' }}>
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/clubs/:id" element={
            <ProtectedRoute>
              <ClubDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/my-clubs" element={
            <ProtectedRoute>
              <MyClubsPage />
            </ProtectedRoute>
          } />
          <Route path="/my-events" element={
            <ProtectedRoute>
              <MyEventsPage />
            </ProtectedRoute>
          } />
          <Route path="/leader" element={
            <ProtectedRoute roles={['leader']}>
              <LeaderDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import LostFound from './pages/LostFound';
import Feedback from './pages/Feedback';
import Clubs from './pages/Clubs';
import Announcements from './pages/Announcements';
import Profile from './pages/Profile';
import EventDetails from './pages/EventDetails';
import ClubDetails from './pages/ClubDetails';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {user && <Sidebar />}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        {user && <Navbar />}
        <Container maxWidth="xl" sx={{ mt: user ? 4 : 0, mb: 4 }}>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/events" element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            } />
            
            <Route path="/events/:id" element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/lost-found" element={
              <ProtectedRoute>
                <LostFound />
              </ProtectedRoute>
            } />
            
            <Route path="/feedback" element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            } />
            
            <Route path="/clubs" element={
              <ProtectedRoute>
                <Clubs />
              </ProtectedRoute>
            } />
            
            <Route path="/clubs/:id" element={
              <ProtectedRoute>
                <ClubDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/announcements" element={
              <ProtectedRoute>
                <Announcements />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
};

export default App;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import GoogleCallback from './pages/Auth/GoogleCallback';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/Events/CreateEvent';
import EditEvent from './pages/Events/EditEvent';
import Clubs from './pages/Clubs';
import ClubDetails from './pages/ClubDetails';
import CreateClub from './pages/Clubs/CreateClub';
import LostFound from './pages/LostFound';
import CreateLostFound from './pages/LostFound/CreateLostFound';
import Feedback from './pages/Feedback';
import CreateFeedback from './pages/Feedback/CreateFeedback';
import Announcements from './pages/Announcements';
import CreateAnnouncement from './pages/Announcements/CreateAnnouncement';
import Approvals from './pages/Admin/Approvals';
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
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            
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
            
            <Route path="/events/create" element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            } />
            
            <Route path="/events/:id/edit" element={
              <ProtectedRoute>
                <EditEvent />
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
            
            <Route path="/lost-found/create" element={
              <ProtectedRoute>
                <CreateLostFound />
              </ProtectedRoute>
            } />
            
            <Route path="/feedback" element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            } />
            
            <Route path="/feedback/submit" element={
              <ProtectedRoute>
                <CreateFeedback />
              </ProtectedRoute>
            } />
            
            <Route path="/clubs" element={
              <ProtectedRoute>
                <Clubs />
              </ProtectedRoute>
            } />
            
            <Route path="/clubs/create" element={
              <ProtectedRoute>
                <CreateClub />
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
            
            <Route path="/announcements/create" element={
              <ProtectedRoute>
                <CreateAnnouncement />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/approvals" element={
              <ProtectedRoute>
                <Approvals />
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

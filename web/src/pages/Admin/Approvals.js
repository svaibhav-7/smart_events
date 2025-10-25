import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Event,
  Groups,
  Person,
  CalendarToday,
  Schedule,
  LocationOn,
  Email,
} from '@mui/icons-material';
import { eventsAPI, clubsAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const Approvals = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingClubs, setPendingClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching pending items...');
      
      const [eventsResponse, clubsResponse] = await Promise.all([
        eventsAPI.getPendingEvents(),
        clubsAPI.getPendingClubs(),
      ]);
      
      console.log('Pending Events Response:', eventsResponse.data);
      console.log('Pending Clubs Response:', clubsResponse.data);
      
      setPendingEvents(eventsResponse.data.events || []);
      setPendingClubs(clubsResponse.data.clubs || []);
      
      console.log('Events count:', eventsResponse.data.events?.length || 0);
      console.log('Clubs count:', clubsResponse.data.clubs?.length || 0);
    } catch (err) {
      console.error('Error fetching pending items:', err);
      setError(err.response?.data?.message || 'Failed to load pending items');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId) => {
    try {
      setProcessing(eventId);
      await eventsAPI.approveEvent(eventId);
      setSuccess('Event approved successfully');
      await fetchPendingItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve event');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to reject this event? This action cannot be undone.')) {
      try {
        setProcessing(eventId);
        await eventsAPI.rejectEvent(eventId);
        setSuccess('Event rejected');
        await fetchPendingItems();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to reject event');
      } finally {
        setProcessing(null);
      }
    }
  };

  const handleApproveClub = async (clubId) => {
    try {
      setProcessing(clubId);
      await clubsAPI.approveClub(clubId);
      setSuccess('Club approved successfully');
      await fetchPendingItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve club');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClub = async (clubId) => {
    if (window.confirm('Are you sure you want to reject this club? This action cannot be undone.')) {
      try {
        setProcessing(clubId);
        await clubsAPI.rejectClub(clubId);
        setSuccess('Club rejected');
        await fetchPendingItems();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to reject club');
      } finally {
        setProcessing(null);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (user?.role !== 'admin' && user?.role !== 'faculty') {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Access denied. This page is only accessible to administrators and faculty.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Pending Approvals
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve pending events and clubs
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab 
            label={`Events (${pendingEvents.length})`} 
            icon={<Event />} 
            iconPosition="start"
          />
          <Tab 
            label={`Clubs (${pendingClubs.length})`} 
            icon={<Groups />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Pending Events */}
      {activeTab === 0 && (
        <Box>
          {pendingEvents.length === 0 ? (
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <Event sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No pending events
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {pendingEvents.map((event) => (
                <Grid item xs={12} key={event._id}>
                  <Card>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="h6" sx={{ mr: 2 }}>
                                {event.title}
                              </Typography>
                              <Chip 
                                label={event.category} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {event.description}
                            </Typography>
                          </Box>

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Person fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  {event.organizer?.firstName} {event.organizer?.lastName}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  {formatDate(event.startDate)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Schedule fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationOn fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  {event.venue}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'center' }}>
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => handleApproveEvent(event._id)}
                              disabled={processing === event._id}
                              fullWidth
                            >
                              {processing === event._id ? 'Processing...' : 'Approve'}
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<Cancel />}
                              onClick={() => handleRejectEvent(event._id)}
                              disabled={processing === event._id}
                              fullWidth
                            >
                              Reject
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Pending Clubs */}
      {activeTab === 1 && (
        <Box>
          {pendingClubs.length === 0 ? (
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <Groups sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No pending clubs
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {pendingClubs.map((club) => (
                <Grid item xs={12} key={club._id}>
                  <Card>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="h6" sx={{ mr: 2 }}>
                                {club.name}
                              </Typography>
                              <Chip 
                                label={club.category} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {club.description}
                            </Typography>
                          </Box>

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Person fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">
                                  Advisor: {club.advisor?.firstName} {club.advisor?.lastName}
                                </Typography>
                              </Box>
                              {club.contactEmail && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Email fontSize="small" sx={{ mr: 1 }} />
                                  <Typography variant="body2">
                                    {club.contactEmail}
                                  </Typography>
                                </Box>
                              )}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              {club.meetingSchedule && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <Schedule fontSize="small" sx={{ mr: 1 }} />
                                  <Typography variant="body2">
                                    {club.meetingSchedule.day} at {club.meetingSchedule.time}
                                  </Typography>
                                </Box>
                              )}
                              {club.maxMembers && (
                                <Typography variant="body2">
                                  Max Members: {club.maxMembers}
                                </Typography>
                              )}
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'center' }}>
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => handleApproveClub(club._id)}
                              disabled={processing === club._id}
                              fullWidth
                            >
                              {processing === club._id ? 'Processing...' : 'Approve'}
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<Cancel />}
                              onClick={() => handleRejectClub(club._id)}
                              disabled={processing === club._id}
                              fullWidth
                            >
                              Reject
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Approvals;

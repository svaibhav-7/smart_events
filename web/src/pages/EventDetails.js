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
  CircularProgress,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  Event,
  Person,
  CalendarToday,
  Schedule,
  LocationOn,
  Description,
  Group,
  CheckCircle,
  Cancel,
  Edit,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getEventById(id);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      await eventsAPI.registerForEvent(id);
      await fetchEventDetails(); // Refresh event data
    } catch (error) {
      console.error('Error registering for event:', error);
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    try {
      setRegistering(true);
      await eventsAPI.unregisterFromEvent(id);
      await fetchEventDetails(); // Refresh event data
    } catch (error) {
      console.error('Error unregistering from event:', error);
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Event not found
        </Alert>
        <Button onClick={() => navigate('/events')} sx={{ mt: 2 }}>
          Back to Events
        </Button>
      </Container>
    );
  }

  const isRegistered = event.attendees?.some(attendee => attendee.user === user?.id);
  const isEventFull = event.maxAttendees && event.attendees.length >= event.maxAttendees;
  const canEdit = event.organizer?._id === user?.id || user?.role === 'admin';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          onClick={() => navigate('/events')}
          sx={{ mb: 2 }}
        >
          ← Back to Events
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {event.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={event.category}
                color="primary"
                variant="outlined"
              />
              {isEventFull && (
                <Chip
                  label="Event Full"
                  color="error"
                />
              )}
            </Box>
          </Box>
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/events/${event._id}/edit`)}
            >
              Edit Event
            </Button>
          )}
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {event.description}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Event Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Event sx={{ mr: 1 }} />
                Event Details
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {formatDate(event.startDate)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Schedule fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {event.venue} - {event.location}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Organized by {event.organizer?.firstName} {event.organizer?.lastName}
                  </Typography>
                </Box>
              </Box>

              {event.registrationDeadline && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Registration deadline: {formatDate(event.registrationDeadline)}
                  </Typography>
                </Box>
              )}

              {event.maxAttendees && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Attendees: {event.attendees?.length || 0} / {event.maxAttendees}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Attendees List (for organizer or admin) */}
          {(canEdit && event.attendees && event.attendees.length > 0) && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Group sx={{ mr: 1 }} />
                  Registered Attendees ({event.attendees.length})
                </Typography>
                <List>
                  {event.attendees.map((attendee, index) => (
                    <React.Fragment key={attendee.user._id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            {attendee.user.firstName?.[0]}{attendee.user.lastName?.[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${attendee.user.firstName} ${attendee.user.lastName}`}
                          secondary={attendee.user.email}
                        />
                        <Chip
                          label={attendee.status}
                          size="small"
                          color={attendee.status === 'registered' ? 'success' : 'default'}
                        />
                      </ListItem>
                      {index < event.attendees.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Registration Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Registration
              </Typography>

              {isRegistered ? (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    You are registered for this event!
                  </Alert>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={handleUnregister}
                    disabled={registering}
                    startIcon={<Cancel />}
                  >
                    Unregister
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {isEventFull
                      ? 'This event is full'
                      : event.registrationDeadline && new Date() > new Date(event.registrationDeadline)
                      ? 'Registration deadline has passed'
                      : 'Register to attend this event'
                    }
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleRegister}
                    disabled={isEventFull || registering || (event.registrationDeadline && new Date() > new Date(event.registrationDeadline))}
                    startIcon={<CheckCircle />}
                  >
                    {registering ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Register for Event'
                    )}
                  </Button>
                </Box>
              )}

              {/* Event Stats */}
              <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Event Information
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Category:
                  </Typography>
                  <Typography variant="body2">
                    {event.category}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status:
                  </Typography>
                  <Typography variant="body2">
                    {event.maxAttendees && event.attendees?.length >= event.maxAttendees ? 'Full' : 'Open'}
                  </Typography>
                </Box>
                {event.club && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Club:
                    </Typography>
                    <Typography variant="body2">
                      {event.club.name}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventDetails;

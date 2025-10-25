import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Event,
  FindInPage,
  Feedback,
  Groups,
  Campaign,
  LocationOn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, lostFoundAPI, feedbackAPI, clubsAPI, announcementsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    events: 0,
    lostItems: 0,
    feedback: 0,
    clubs: 0,
    announcements: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching dashboard data...');
      
      // Fetch stats
      const [eventsRes, lostFoundRes, feedbackRes, clubsRes, announcementsRes] = await Promise.all([
        eventsAPI.getEvents({ limit: 1 }),
        lostFoundAPI.getItems({ limit: 1 }),
        feedbackAPI.getFeedback({ limit: 1 }),
        clubsAPI.getClubs({ limit: 1 }),
        announcementsAPI.getAnnouncements({ limit: 1 }),
      ]);

      console.log('Dashboard stats responses:', {
        events: eventsRes.data,
        announcements: announcementsRes.data,
      });

      setStats({
        events: eventsRes.data.total || 0,
        lostItems: lostFoundRes.data.total || 0,
        feedback: feedbackRes.data.total || 0,
        clubs: clubsRes.data.total || 0,
        announcements: announcementsRes.data.total || 0,
      });

      // Fetch recent events and announcements
      const [recentEventsRes, announcementsRes2] = await Promise.all([
        eventsAPI.getEvents({ limit: 5, sort: '-startDate' }),
        announcementsAPI.getAnnouncements({ limit: 5, sort: '-createdAt' }),
      ]);

      console.log('Recent data:', {
        events: recentEventsRes.data.events?.length || 0,
        announcements: announcementsRes2.data.announcements?.length || 0,
      });

      setRecentEvents(recentEventsRes.data.events || []);
      setRecentAnnouncements(announcementsRes2.data.announcements || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Set empty data on error to prevent undefined errors
      setStats({
        events: 0,
        lostItems: 0,
        feedback: 0,
        clubs: 0,
        announcements: 0,
      });
      setRecentEvents([]);
      setRecentAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Create Event',
      description: 'Organize a new campus event',
      icon: <Event />,
      path: '/events/create',
      color: 'primary',
      roles: ['faculty', 'admin'],
    },
    {
      title: 'Report Lost Item',
      description: 'Report lost or found items',
      icon: <FindInPage />,
      path: '/lost-found/create',
      color: 'warning',
    },
    {
      title: 'Submit Feedback',
      description: 'Share your suggestions',
      icon: <Feedback />,
      path: '/feedback/submit',
      color: 'info',
    },
    {
      title: 'Join Club',
      description: 'Explore student organizations',
      icon: <Groups />,
      path: '/clubs',
      color: 'success',
      roles: ['student'],
    },
    {
      title: 'Create Announcement',
      description: 'Post campus-wide announcement',
      icon: <Campaign />,
      path: '/announcements/create',
      color: 'secondary',
      roles: ['faculty', 'admin'],
    },
  ];

  const filteredQuickActions = quickActions.filter(
    action => !action.roles || action.roles.includes(user?.role)
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {filteredQuickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
                transition: 'all 0.3s ease',
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      backgroundColor: `${action.color}.light`,
                      borderRadius: 1,
                      p: 1,
                      mr: 2,
                    }}
                  >
                    {React.cloneElement(action.icon, {
                      sx: { color: `${action.color}.main` },
                    })}
                  </Box>
                  <Typography variant="h6">{action.title}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Event color="primary" />
                <Box sx={{ ml: 1 }}>
                  <Typography variant="h4">{stats.events}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Events
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FindInPage color="warning" />
                <Box sx={{ ml: 1 }}>
                  <Typography variant="h4">{stats.lostItems}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lost & Found
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Feedback color="info" />
                <Box sx={{ ml: 1 }}>
                  <Typography variant="h4">{stats.feedback}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Feedback Items
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Groups color="success" />
                <Box sx={{ ml: 1 }}>
                  <Typography variant="h4">{stats.clubs}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Clubs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Campaign color="secondary" />
                <Box sx={{ ml: 1 }}>
                  <Typography variant="h4">{stats.announcements}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Announcements
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Events</Typography>
                <Button size="small" onClick={() => navigate('/events')}>
                  View All
                </Button>
              </Box>
              <List>
                {recentEvents.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="No events yet"
                      secondary="Check back later for upcoming events"
                    />
                  </ListItem>
                ) : (
                  recentEvents.slice(0, 3).map((event, index) => (
                    <React.Fragment key={event._id}>
                      <ListItem
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/events/${event._id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <Event />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={event.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(event.startDate)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <LocationOn fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                {event.venue}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          size="small"
                          label={event.category}
                          color="primary"
                          variant="outlined"
                        />
                      </ListItem>
                      {index < 2 && index < recentEvents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Announcements</Typography>
                <Button size="small" onClick={() => navigate('/announcements')}>
                  View All
                </Button>
              </Box>
              <List>
                {recentAnnouncements.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="No announcements yet"
                      secondary="Check back later for campus updates"
                    />
                  </ListItem>
                ) : (
                  recentAnnouncements.slice(0, 3).map((announcement, index) => (
                    <React.Fragment key={announcement._id}>
                      <ListItem
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/announcements/${announcement._id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <Campaign />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={announcement.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {announcement.content.substring(0, 100)}...
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(announcement.createdAt)}
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          size="small"
                          label={announcement.priority}
                          color={announcement.priority === 'urgent' ? 'error' : 'default'}
                          variant="outlined"
                        />
                      </ListItem>
                      {index < 2 && index < recentAnnouncements.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

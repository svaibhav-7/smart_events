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
  Groups,
  Person,
  Email,
  Schedule,
  CalendarToday,
  CheckCircle,
  Cancel,
  Edit,
  Star,
  EmojiEvents,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { clubsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const ClubDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchClubDetails();
  }, [id]);

  const fetchClubDetails = async () => {
    try {
      setLoading(true);
      const response = await clubsAPI.getClubById(id);
      setClub(response.data.club);
    } catch (error) {
      console.error('Error fetching club details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      setJoining(true);
      await clubsAPI.joinClub(id);
      await fetchClubDetails(); // Refresh club data
    } catch (error) {
      console.error('Error joining club:', error);
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    try {
      setJoining(true);
      await clubsAPI.leaveClub(id);
      await fetchClubDetails(); // Refresh club data
    } catch (error) {
      console.error('Error leaving club:', error);
    } finally {
      setJoining(false);
    }
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

  if (!club) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Club not found
        </Alert>
        <Button onClick={() => navigate('/clubs')} sx={{ mt: 2 }}>
          Back to Clubs
        </Button>
      </Container>
    );
  }

  const isMember = club.members?.some(member => member.user._id === user?.id);
  const isAdvisor = club.advisor?._id === user?.id;
  const isPresident = club.president?._id === user?.id;
  const canEdit = isAdvisor || isPresident || user?.role === 'admin';
  const isFull = club.maxMembers && club.members.length >= club.maxMembers;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          onClick={() => navigate('/clubs')}
          sx={{ mb: 2 }}
        >
          ← Back to Clubs
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {club.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={club.category}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={club.isApproved ? 'Active' : 'Pending Approval'}
                color={club.isApproved ? 'success' : 'warning'}
              />
              {isFull && (
                <Chip
                  label="Club Full"
                  color="error"
                />
              )}
            </Box>
          </Box>
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/clubs/${club._id}/edit`)}
            >
              Edit Club
            </Button>
          )}
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {club.description}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Club Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Groups sx={{ mr: 1 }} />
                Club Information
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Members: {club.members?.length || 0}
                      {club.maxMembers && ` / ${club.maxMembers}`}
                    </Typography>
                  </Box>
                </Grid>

                {club.establishedYear && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Established: {club.establishedYear}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {club.meetingSchedule && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Schedule fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Meetings: {club.meetingSchedule.day} at {club.meetingSchedule.time} - {club.meetingSchedule.location}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {club.contactEmail && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Contact: {club.contactEmail}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Leadership */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Leadership
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        {club.advisor?.firstName?.[0]}{club.advisor?.lastName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {club.advisor?.firstName} {club.advisor?.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Faculty Advisor
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {club.president && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>
                          {club.president?.firstName?.[0]}{club.president?.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {club.president?.firstName} {club.president?.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            President
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* Achievements */}
              {club.achievements && club.achievements.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Star sx={{ mr: 1 }} />
                    Achievements
                  </Typography>
                  <List>
                    {club.achievements.map((achievement, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={achievement.title}
                          secondary={achievement.description}
                        />
                        <EmojiEvents color="warning" />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Membership Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Membership
              </Typography>

              {isMember ? (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    You are a member of this club!
                  </Alert>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={handleLeave}
                    disabled={joining}
                    startIcon={<Cancel />}
                  >
                    Leave Club
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {isFull
                      ? 'This club is currently full'
                      : !club.isApproved
                      ? 'This club is pending approval'
                      : 'Join this club to participate in activities and events'
                    }
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleJoin}
                    disabled={isFull || !club.isApproved || joining}
                    startIcon={<CheckCircle />}
                  >
                    {joining ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'Join Club'
                    )}
                  </Button>
                </Box>
              )}

              {/* Member List (for members) */}
              {isMember && club.members && club.members.length > 0 && (
                <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Members ({club.members.length})
                  </Typography>
                  <List dense>
                    {club.members.slice(0, 5).map((member, index) => (
                      <ListItem key={member.user._id}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 24, height: 24 }}>
                            {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${member.user.firstName} ${member.user.lastName}`}
                          secondary={member.role}
                        />
                      </ListItem>
                    ))}
                    {club.members.length > 5 && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
                        and {club.members.length - 5} more members...
                      </Typography>
                    )}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClubDetails;

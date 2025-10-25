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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Campaign,
  Add,
  Search,
  FilterList,
  Person,
  Schedule,
  Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { announcementsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const Announcements = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchAnnouncements();
  }, [categoryFilter, priorityFilter]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 20,
        sort: 'createdAt',
      };

      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }

      if (priorityFilter !== 'all') {
        params.priority = priorityFilter;
      }

      const response = await announcementsAPI.getAnnouncements(params);
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'normal':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const categories = ['all', 'academic', 'administrative', 'events', 'facilities', 'safety', 'other'];

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
          Campus Announcements
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Stay updated with the latest campus news and notifications
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  label="Priority"
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="all">All</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              {(user?.role === 'faculty' || user?.role === 'admin') && (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Add />}
                  onClick={() => navigate('/announcements/create')}
                >
                  Create
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Campaign sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No announcements found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || categoryFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Check back later for new announcements'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredAnnouncements.map((announcement) => (
            <Grid item xs={12} key={announcement._id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate(`/announcements/${announcement._id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ mr: 2 }}>
                          {announcement.title}
                        </Typography>
                        <Chip
                          label={announcement.category}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={announcement.priority}
                          size="small"
                          color={getPriorityColor(announcement.priority)}
                          sx={{ mx: 1 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {announcement.content}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                        {announcement.postedBy?.firstName?.[0]}{announcement.postedBy?.lastName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {announcement.postedBy?.firstName} {announcement.postedBy?.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(announcement.createdAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Visibility fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {announcement.views || 0} views
                      </Typography>
                    </Box>
                  </Box>

                  {announcement.expiresAt && (
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={`Expires: ${formatDate(announcement.expiresAt)}`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Announcements;

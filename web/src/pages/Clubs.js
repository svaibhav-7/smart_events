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
  Groups,
  Add,
  Search,
  FilterList,
  Person,
  Schedule,
  Email,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { clubsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const Clubs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchClubs();
  }, [categoryFilter]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 20,
        sort: 'name',
      };

      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }

      const response = await clubsAPI.getClubs(params);
      setClubs(response.data.clubs || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (isApproved) => {
    return isApproved ? 'success' : 'warning';
  };

  const categories = [
    'all',
    'academic',
    'cultural',
    'sports',
    'technical',
    'social',
    'arts',
    'volunteer',
    'professional'
  ];

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
          Student Clubs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover and join student organizations and activities
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Add />}
                onClick={() => navigate('/clubs/create')}
              >
                Create Club
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Clubs Grid */}
      {filteredClubs.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Groups sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No clubs found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Check back later for new clubs'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredClubs.map((club) => (
            <Grid item xs={12} md={6} lg={4} key={club._id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate(`/clubs/${club._id}`)}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Chip
                        label={club.category}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={club.isApproved ? 'Active' : 'Pending'}
                        color={getStatusColor(club.isApproved)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {club.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {club.description}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Person fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {club.members?.length || 0} members
                        {club.maxMembers && ` / ${club.maxMembers}`}
                      </Typography>
                    </Box>

                    {club.meetingSchedule && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Schedule fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {club.meetingSchedule.day} at {club.meetingSchedule.time}
                        </Typography>
                      </Box>
                    )}

                    {club.contactEmail && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Email fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {club.contactEmail}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        Advisor: {club.advisor?.firstName} {club.advisor?.lastName}
                      </Typography>
                      {club.establishedYear && (
                        <Typography variant="body2" color="text.secondary">
                          Est. {club.establishedYear}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Clubs;

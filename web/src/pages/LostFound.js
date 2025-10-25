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
} from '@mui/material';
import {
  FindInPage,
  Add,
  Search,
  FilterList,
  LocationOn,
  Schedule,
  Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { lostFoundAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const LostFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('open');

  useEffect(() => {
    fetchItems();
  }, [categoryFilter, statusFilter]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 20,
        sort: 'createdAt',
      };

      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await lostFoundAPI.getItems(params);
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching lost & found items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'primary';
      case 'claimed':
        return 'success';
      case 'resolved':
        return 'success';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const categories = ['all', 'lost', 'found'];

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
          Lost & Found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Report lost items or help find missing belongings
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search lost & found items..."
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
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="claimed">Claimed</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="all">All</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Add />}
                onClick={() => navigate('/lost-found/create')}
              >
                Report Item
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <FindInPage sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No items found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'open'
                  ? 'Try adjusting your search or filters'
                  : 'Check back later for new items'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item._id}>
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
                onClick={() => navigate(`/lost-found/${item._id}`)}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Chip
                        label={item.category}
                        color={item.category === 'lost' ? 'error' : 'success'}
                        size="small"
                      />
                      <Chip
                        label={item.status}
                        color={getStatusColor(item.status)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {item.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Schedule fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {item.category === 'lost' ? 'Lost' : 'Found'} on {formatDate(item.dateLostOrFound)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Posted {formatDate(item.createdAt)}
                    </Typography>
                    {item.reward && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Star fontSize="small" color="warning" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="warning.main">
                          {item.reward}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      Reported by {item.reportedBy?.firstName} {item.reportedBy?.lastName}
                    </Typography>
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

export default LostFound;

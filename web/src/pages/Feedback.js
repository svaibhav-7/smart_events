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
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Feedback,
  Add,
  Search,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { feedbackAPI } from '../utils/api';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [votingItem, setVotingItem] = useState(null);

  useEffect(() => {
    fetchFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, statusFilter]);

  const fetchFeedback = async () => {
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

      const response = await feedbackAPI.getFeedback(params);
      setFeedback(response.data.feedback || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedback = feedback.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'in-progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleVote = async (feedbackId, voteType) => {
    try {
      setVotingItem(feedbackId);
      await feedbackAPI.voteFeedback(feedbackId, voteType);
      
      // Refresh feedback to get updated vote counts
      await fetchFeedback();
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVotingItem(null);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'appreciation', label: 'Appreciation' },
    { value: 'bug-report', label: 'Bug Report' },
    { value: 'feature-request', label: 'Feature Request' },
    { value: 'other', label: 'Other' },
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
          Feedback & Suggestions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Share your thoughts and help improve campus services
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search feedback..."
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
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
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
                  <MenuItem value="in-progress">In Progress</MenuItem>
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
                onClick={() => navigate('/feedback/submit')}
              >
                Submit Feedback
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <Feedback sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No feedback found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to submit feedback!'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredFeedback.map((item) => (
            <Grid item xs={12} key={item._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ mr: 2 }}>
                          {item.title}
                        </Typography>
                        <Chip
                          label={item.category}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={item.status}
                          size="small"
                          color={getStatusColor(item.status)}
                          sx={{ mx: 1 }}
                        />
                        <Chip
                          label={item.priority}
                          size="small"
                          color={getPriorityColor(item.priority)}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                        {item.submittedBy?.firstName?.[0]}{item.submittedBy?.lastName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {item.submittedBy?.firstName} {item.submittedBy?.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(item.createdAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Tooltip title="Like this feedback">
                        <IconButton
                          size="small"
                          onClick={() => handleVote(item._id, 'up')}
                          disabled={votingItem === item._id}
                          color={item.upvotes?.some(v => v._id === votingItem) ? 'primary' : 'default'}
                        >
                          <ThumbUp fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="body2" color="text.secondary">
                        {item.upvotes?.length || 0}
                      </Typography>

                      <Tooltip title="Dislike this feedback">
                        <IconButton
                          size="small"
                          onClick={() => handleVote(item._id, 'down')}
                          disabled={votingItem === item._id}
                          color={item.downvotes?.some(v => v._id === votingItem) ? 'error' : 'default'}
                        >
                          <ThumbDown fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="body2" color="text.secondary">
                        {item.downvotes?.length || 0}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Responses */}
                  {item.responses && item.responses.length > 0 && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Responses ({item.responses.length})
                      </Typography>
                      {item.responses.map((response, index) => (
                        <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                              {response.respondedBy?.firstName?.[0]}{response.respondedBy?.lastName?.[0]}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {response.respondedBy?.firstName} {response.respondedBy?.lastName}
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            {response.response}
                          </Typography>
                        </Box>
                      ))}
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

export default FeedbackPage;

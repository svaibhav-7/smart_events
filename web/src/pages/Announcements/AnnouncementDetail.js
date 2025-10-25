import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Schedule,
  Visibility,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { announcementsAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const AnnouncementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    category: '',
    priority: '',
    targetAudience: '',
    expiresAt: '',
  });

  const categories = ['general', 'academic', 'administrative', 'emergency', 'event', 'maintenance', 'other'];
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const audiences = ['all', 'students', 'faculty', 'staff'];

  useEffect(() => {
    fetchAnnouncement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await announcementsAPI.getAnnouncementById(id);
      setAnnouncement(response.data.announcement);
      setEditFormData({
        title: response.data.announcement.title,
        content: response.data.announcement.content,
        category: response.data.announcement.category,
        priority: response.data.announcement.priority,
        targetAudience: response.data.announcement.targetAudience,
        expiresAt: response.data.announcement.expiresAt 
          ? new Date(response.data.announcement.expiresAt).toISOString().split('T')[0]
          : '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await announcementsAPI.deleteAnnouncement(id);
      navigate('/announcements');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete announcement');
    }
    setDeleteDialogOpen(false);
  };

  const handleEdit = async () => {
    try {
      setError('');
      const updateData = {
        ...editFormData,
        expiresAt: editFormData.expiresAt || undefined,
      };
      await announcementsAPI.updateAnnouncement(id, updateData);
      setEditDialogOpen(false);
      fetchAnnouncement();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update announcement');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
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
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const canEdit = user && announcement && (
    user._id === announcement.postedBy?._id || user.role === 'admin'
  );

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !announcement) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/announcements')}
          sx={{ mt: 2 }}
        >
          Back to Announcements
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => navigate('/announcements')}
        sx={{ mb: 3 }}
      >
        Back to Announcements
      </Button>

      <Card>
        <CardContent>
          {/* Header with Title and Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" gutterBottom>
                {announcement.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip
                  label={announcement.category}
                  variant="outlined"
                />
                <Chip
                  label={announcement.priority}
                  color={getPriorityColor(announcement.priority)}
                />
                <Chip
                  label={`Target: ${announcement.targetAudience}`}
                  variant="outlined"
                />
              </Box>
            </Box>
            {canEdit && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Edit />}
                  onClick={() => setEditDialogOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete
                </Button>
              </Box>
            )}
          </Box>

          {/* Posted By Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Avatar sx={{ width: 48, height: 48, mr: 2 }}>
              {announcement.postedBy?.firstName?.[0]}{announcement.postedBy?.lastName?.[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1">
                {announcement.postedBy?.firstName} {announcement.postedBy?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {announcement.postedBy?.email}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Schedule fontSize="small" sx={{ mr: 0.5 }} color="action" />
                <Typography variant="body2" color="text.secondary">
                  {formatDate(announcement.createdAt)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Visibility fontSize="small" sx={{ mr: 0.5 }} color="action" />
                <Typography variant="body2" color="text.secondary">
                  {announcement.views || 0} views
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Content */}
          <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-line', lineHeight: 1.8 }}>
            {announcement.content}
          </Typography>

          {/* Expiration Date */}
          {announcement.expiresAt && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Expires:</strong> {formatDate(announcement.expiresAt)}
              </Typography>
            </Alert>
          )}

          {/* Read By Count */}
          {announcement.readBy && announcement.readBy.length > 0 && (
            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Read by {announcement.readBy.length} {announcement.readBy.length === 1 ? 'person' : 'people'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Announcement?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this announcement? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Announcement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Title"
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={6}
                label="Content"
                name="content"
                value={editFormData.content}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditChange}
                  label="Category"
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={editFormData.priority}
                  onChange={handleEditChange}
                  label="Priority"
                >
                  {priorities.map(priority => (
                    <MenuItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Target Audience</InputLabel>
                <Select
                  name="targetAudience"
                  value={editFormData.targetAudience}
                  onChange={handleEditChange}
                  label="Target Audience"
                >
                  {audiences.map(audience => (
                    <MenuItem key={audience} value={audience}>
                      {audience.charAt(0).toUpperCase() + audience.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Expiration Date (optional)"
                name="expiresAt"
                value={editFormData.expiresAt}
                onChange={handleEditChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AnnouncementDetail;

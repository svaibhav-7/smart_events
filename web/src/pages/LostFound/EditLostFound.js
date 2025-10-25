import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { Save, Cancel, Delete } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { lostFoundAPI } from '../../utils/api';

const EditLostFound = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    category: 'lost',
    itemType: 'electronics',
    title: '',
    description: '',
    location: '',
    dateLostOrFound: '',
    contactInfo: {
      email: '',
      phone: '',
    },
    reward: '',
    isUrgent: false,
    status: 'open',
  });

  const itemTypes = [
    'electronics',
    'documents',
    'accessories',
    'clothing',
    'books',
    'keys',
    'wallet',
    'bag',
    'other'
  ];

  const statuses = [
    { value: 'open', label: formData.category === 'lost' ? 'Still Missing' : 'Not Claimed Yet' },
    { value: 'claimed', label: formData.category === 'lost' ? 'Found/Claimed' : 'Claimed by Owner' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'matched', label: 'Matched with Item' },
  ];

  useEffect(() => {
    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await lostFoundAPI.getItemById(id);
      const item = response.data.item;
      
      setFormData({
        category: item.category,
        itemType: item.itemType,
        title: item.title,
        description: item.description,
        location: item.location,
        dateLostOrFound: new Date(item.dateLostOrFound).toISOString().split('T')[0],
        contactInfo: item.contactInfo || { email: '', phone: '' },
        reward: item.reward || '',
        isUrgent: item.isUrgent || false,
        status: item.status,
      });
    } catch (err) {
      setError('Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    if (name === 'email' || name === 'phone') {
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [name]: value,
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await lostFoundAPI.updateItem(id, formData);
      navigate('/lost-found');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        setSubmitting(true);
        await lostFoundAPI.deleteItem(id);
        navigate('/lost-found');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete item');
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit {formData.category === 'lost' ? 'Lost' : 'Found'} Item
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formData.category === 'lost'
            ? 'Update your lost item details or mark it as found'
            : 'Update the found item details or mark it as claimed'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Item Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Black Wallet, iPhone 13"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide detailed description of the item"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Item Type</InputLabel>
                  <Select
                    name="itemType"
                    value={formData.itemType}
                    onChange={handleChange}
                    label="Item Type"
                  >
                    {itemTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    {statuses.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Date Lost"
                  name="dateLostOrFound"
                  value={formData.dateLostOrFound}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: new Date().toISOString().split('T')[0] }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Library 2nd Floor, Cafeteria"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Contact Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={handleChange}
                  placeholder="your.email@klh.edu.in"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reward (optional)"
                  name="reward"
                  value={formData.reward}
                  onChange={handleChange}
                  placeholder="e.g., $20, Coffee voucher"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isUrgent}
                      onChange={handleChange}
                      name="isUrgent"
                      color="error"
                    />
                  }
                  label="Mark as urgent (e.g., important documents, medical items)"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleDelete}
                    disabled={submitting}
                  >
                    Delete
                  </Button>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => navigate('/lost-found')}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={submitting}
                    >
                      {submitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EditLostFound;

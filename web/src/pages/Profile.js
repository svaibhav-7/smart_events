import React, { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  School,
  Badge,
  Work,
  CalendarToday,
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Delete,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        
        // Update profile with new image
        const result = await updateProfile({ profilePicture: base64Image });
        
        if (result.success) {
          setProfilePicture(base64Image);
          setSuccess('Profile picture updated successfully');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError('Failed to update profile picture');
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload image');
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setUploadingImage(true);
      const result = await updateProfile({ profilePicture: null });
      
      if (result.success) {
        setProfilePicture(null);
        setSuccess('Profile picture removed successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
      setUploadingImage(false);
    } catch (err) {
      setError('Failed to remove profile picture');
      setUploadingImage(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await updateProfile(formData);
    setLoading(false);

    if (result.success) {
      setEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      department: user?.department || '',
    });
    setEditing(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'faculty':
        return 'primary';
      case 'student':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account information and preferences
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

      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={profilePicture || user?.profilePicture}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    fontSize: '3rem',
                    bgcolor: 'primary.main'
                  }}
                >
                  {!profilePicture && !user?.profilePicture && (
                    <>{user?.firstName?.[0]}{user?.lastName?.[0]}</>
                  )}
                </Avatar>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                
                <Box sx={{ position: 'absolute', bottom: 16, right: -10 }}>
                  <Tooltip title="Upload photo">
                    <IconButton
                      color="primary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 2,
                        '&:hover': { bgcolor: 'background.paper' }
                      }}
                    >
                      {uploadingImage ? (
                        <CircularProgress size={20} />
                      ) : (
                        <PhotoCamera />
                      )}
                    </IconButton>
                  </Tooltip>
                  {(profilePicture || user?.profilePicture) && (
                    <Tooltip title="Remove photo">
                      <IconButton
                        color="error"
                        onClick={handleRemoveImage}
                        disabled={uploadingImage}
                        sx={{
                          bgcolor: 'background.paper',
                          boxShadow: 2,
                          ml: 1,
                          '&:hover': { bgcolor: 'background.paper' }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              <Typography variant="h5" gutterBottom>
                {user?.firstName} {user?.lastName}
              </Typography>

              <Chip
                label={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                color={getRoleColor(user?.role)}
                size="small"
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {user?.email}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Badge />
                  </ListItemIcon>
                  <ListItemText
                    primary="Student ID"
                    secondary={user?.studentId || 'Not provided'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Work />
                  </ListItemIcon>
                  <ListItemText
                    primary="Employee ID"
                    secondary={user?.employeeId || 'Not applicable'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <School />
                  </ListItemIcon>
                  <ListItemText
                    primary="Department"
                    secondary={user?.department || 'Not specified'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText
                    primary="Year"
                    secondary={user?.year || 'Not applicable'}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Profile Information
                </Typography>
                {!editing ? (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <Box>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSubmit}
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Save'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      disabled={!editing || loading}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      disabled={!editing || loading}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={user?.email || ''}
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      disabled={!editing || loading}
                      placeholder="Enter your phone number"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      disabled={!editing || loading}
                      placeholder="Enter your department"
                    />
                  </Grid>
                </Grid>
              </form>

              {/* Additional Information */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Role Information
                </Typography>
                <Grid container spacing={1}>
                  <Grid item>
                    <Chip
                      label={`Role: ${user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}`}
                      color={getRoleColor(user?.role)}
                      variant="outlined"
                    />
                  </Grid>
                  {user?.studentId && (
                    <Grid item>
                      <Chip
                        label={`Student ID: ${user.studentId}`}
                        variant="outlined"
                      />
                    </Grid>
                  )}
                  {user?.employeeId && (
                    <Grid item>
                      <Chip
                        label={`Employee ID: ${user.employeeId}`}
                        variant="outlined"
                      />
                    </Grid>
                  )}
                  {user?.year && (
                    <Grid item>
                      <Chip
                        label={`Year: ${user.year}`}
                        variant="outlined"
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {user?.eventsCount || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Events Attended
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success">
                      {user?.clubsCount || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Clubs Joined
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning">
                      {user?.feedbackCount || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Feedback Submitted
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info">
                      {user?.lostFoundCount || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lost & Found Items
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;

import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  School,
  Badge,
  Work,
  CalendarToday,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProfile(formData);
    setLoading(false);

    if (result.success) {
      setEditing(false);
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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return 'admin-panel-settings';
      case 'faculty':
        return 'school';
      case 'student':
        return 'person';
      default:
        return 'person';
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

      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  fontSize: '3rem',
                  bgcolor: 'primary.main'
                }}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>

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

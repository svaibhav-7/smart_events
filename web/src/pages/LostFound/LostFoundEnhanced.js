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
  Tab,
  Tabs,
  CircularProgress,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  FindInPage,
  Add,
  Search,
  LocationOn,
  Schedule,
  Phone,
  Email,
  Edit,
  Delete,
  Check,
  ContactMail,
  TrendingUp,
  Image,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { lostFoundAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import MatchingSuggestions from '../../components/LostFound/MatchingSuggestions';

const LostFoundEnhanced = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0); // 0: Lost, 1: Found
  const [selectedItem, setSelectedItem] = useState(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [matchingDialogOpen, setMatchingDialogOpen] = useState(false);
  const [matchingItemId, setMatchingItemId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [tabValue]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const category = tabValue === 0 ? 'lost' : 'found';
      const response = await lostFoundAPI.getItems({
        category,
        limit: 50,
        sort: '-createdAt',
      });
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewContact = (item) => {
    setSelectedItem(item);
    setContactDialogOpen(true);
  };

  const handleCloseContactDialog = () => {
    setContactDialogOpen(false);
    setSelectedItem(null);
  };

  const handleOpenMatching = (itemId) => {
    setMatchingItemId(itemId);
    setMatchingDialogOpen(true);
  };

  const handleCloseMatching = () => {
    setMatchingDialogOpen(false);
    setMatchingItemId(null);
  };

  const handleMatchSuccess = () => {
    fetchItems(); // Refresh the list
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await lostFoundAPI.deleteItem(id);
        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const filteredItems = items.filter(
    (item) =>
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
      case 'matched':
        return 'info';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getItemTypeIcon = (type) => {
    // Return appropriate icons based on item type
    return type.charAt(0).toUpperCase();
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Lost & Found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Help reunite lost items with their owners
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/lost-found/create')}
          size="large"
        >
          Report Item
        </Button>
      </Box>

      {/* Tabs for Lost/Found */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`Lost Items (${tabValue === 0 ? filteredItems.length : ''})`} />
          <Tab label={`Found Items (${tabValue === 1 ? filteredItems.length : ''})`} />
        </Tabs>
      </Card>

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder={`Search ${tabValue === 0 ? 'lost' : 'found'} items...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />,
            }}
          />
        </CardContent>
      </Card>

      {/* Items Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <FindInPage sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No {tabValue === 0 ? 'lost' : 'found'} items
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {searchTerm
                  ? 'Try adjusting your search'
                  : `Be the first to report a ${tabValue === 0 ? 'lost' : 'found'} item`}
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
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease',
                  },
                }}
              >
                {item.isUrgent && (
                  <Chip
                    label="URGENT"
                    color="error"
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Item Type Badge */}
                  <Avatar
                    sx={{
                      bgcolor: tabValue === 0 ? 'error.light' : 'success.light',
                      width: 48,
                      height: 48,
                      mb: 2,
                    }}
                  >
                    {getItemTypeIcon(item.itemType)}
                  </Avatar>

                  {/* Title & Status */}
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Chip
                    label={item.status}
                    color={getStatusColor(item.status)}
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {item.description.substring(0, 120)}
                    {item.description.length > 120 ? '...' : ''}
                  </Typography>

                  {/* Images Preview */}
                  {item.images && item.images.length > 0 && (
                    <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {item.images.slice(0, 3).map((image, idx) => (
                        <Box
                          key={idx}
                          component="img"
                          src={image}
                          alt={`${item.title} ${idx + 1}`}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.8 },
                          }}
                        />
                      ))}
                      {item.images.length > 3 && (
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 1,
                            bgcolor: 'action.hover',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            +{item.images.length - 3} more
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Location & Date */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {item.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Schedule fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(item.dateLostOrFound)}
                    </Typography>
                  </Box>

                  {/* Reward (if any) */}
                  {item.reward && (
                    <Chip
                      label={`Reward: ${item.reward}`}
                      color="warning"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}

                  {/* Reporter Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.875rem' }}>
                      {item.reportedBy?.firstName?.[0]}
                      {item.reportedBy?.lastName?.[0]}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      Reported by {item.reportedBy?.firstName} {item.reportedBy?.lastName}
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ContactMail />}
                      onClick={() => handleViewContact(item)}
                      sx={{ flex: 1, minWidth: '120px' }}
                    >
                      Contact
                    </Button>

                    {item.status === 'open' && (
                      <Button
                        variant="contained"
                        size="small"
                        color="secondary"
                        startIcon={<TrendingUp />}
                        onClick={() => handleOpenMatching(item._id)}
                        sx={{ flex: 1, minWidth: '120px' }}
                      >
                        Find Match
                      </Button>
                    )}

                    {user?._id === item.reportedBy?._id && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/lost-found/${item._id}/edit`)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(item._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Contact Info Dialog */}
      <Dialog open={contactDialogOpen} onClose={handleCloseContactDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Contact Information</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedItem.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedItem.description}
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Reporter Details:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ mr: 2 }}>
                  {selectedItem.reportedBy?.firstName?.[0]}
                  {selectedItem.reportedBy?.lastName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="body1">
                    {selectedItem.reportedBy?.firstName} {selectedItem.reportedBy?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedItem.reportedBy?.role}
                  </Typography>
                </Box>
              </Box>

              {selectedItem.contactInfo && (
                <>
                  {selectedItem.contactInfo.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Email color="action" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">{selectedItem.contactInfo.email}</Typography>
                      </Box>
                    </Box>
                  )}

                  {selectedItem.contactInfo.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Phone color="action" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">{selectedItem.contactInfo.phone}</Typography>
                      </Box>
                    </Box>
                  )}

                  {selectedItem.contactInfo.alternateContact && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <ContactMail color="action" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Alternate Contact
                        </Typography>
                        <Typography variant="body1">
                          {selectedItem.contactInfo.alternateContact}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContactDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Matching Suggestions Dialog */}
      <MatchingSuggestions
        open={matchingDialogOpen}
        onClose={handleCloseMatching}
        itemId={matchingItemId}
        onMatch={handleMatchSuccess}
      />
    </Container>
  );
};

export default LostFoundEnhanced;

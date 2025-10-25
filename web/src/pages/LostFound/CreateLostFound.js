import React, { useState } from 'react';
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
  RadioGroup,
  Radio,
  FormLabel,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import { Save, Cancel, CloudUpload, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { lostFoundAPI } from '../../utils/api';

const CreateLostFound = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    category: 'lost',
    itemType: 'electronics',
    title: '',
    description: '',
    location: '',
    dateLostOrFound: new Date().toISOString().split('T')[0],
    contactInfo: {
      email: '',
      phone: '',
    },
    reward: '',
    isUrgent: false,
    images: [], // Store image URLs
  });
  const [imageFiles, setImageFiles] = useState([]); // Store file objects for preview
  const [uploadingImages, setUploadingImages] = useState(false);

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 3 images
    if (imageFiles.length + files.length > 3) {
      setError('Maximum 3 images allowed');
      return;
    }

    // Validate file types and size
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        setError('Only image files are allowed');
        return false;
      }
      if (!isValidSize) {
        setError('Image size must be less than 5MB');
        return false;
      }
      return true;
    });

    setImageFiles(prev => [...prev, ...validFiles]);
    setError(''); // Clear any previous errors
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls = [];

    try {
      // Upload images to Cloudinary (you'll need to implement this endpoint)
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'smart_campus'); // Configure in Cloudinary
        
        // Using Cloudinary's upload API directly
        const response = await fetch(
          'https://api.cloudinary.com/v1_1/your-cloud-name/image/upload',
          {
            method: 'POST',
            body: formData,
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.secure_url);
        }
      }
    } catch (error) {
      console.error('Image upload error:', error);
      // For now, use base64 preview URLs as fallback
      const base64Urls = await Promise.all(
        imageFiles.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        })
      );
      uploadedUrls.push(...base64Urls);
    } finally {
      setUploadingImages(false);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Upload images first
      const imageUrls = await uploadImages();
      
      const itemData = {
        ...formData,
        images: imageUrls,
        reward: formData.reward || undefined,
      };

      await lostFoundAPI.createItem(itemData);
      navigate('/lost-found');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Report {formData.category === 'lost' ? 'Lost' : 'Found'} Item
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formData.category === 'lost' 
            ? 'Report a lost item with your contact details so finders can reach you'
            : 'Report a found item to help the owner locate it'}
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
              {/* Category Selection */}
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
                    What would you like to report? *
                  </FormLabel>
                  <RadioGroup
                    row
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <FormControlLabel 
                      value="lost" 
                      control={<Radio />} 
                      label="I Lost an Item" 
                    />
                    <FormControlLabel 
                      value="found" 
                      control={<Radio />} 
                      label="I Found an Item" 
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info" icon={formData.category === 'lost' ? '😢' : '😊'}>
                  {formData.category === 'lost' 
                    ? 'Fill in the details of the item you lost. We\'ll notify you if someone finds it!'
                    : 'Thank you for helping! Provide details about the item you found so the owner can claim it.'}
                </Alert>
              </Grid>

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
                <TextField
                  required
                  fullWidth
                  type="date"
                  label={formData.category === 'lost' ? 'Date Lost' : 'Date Found'}
                  name="dateLostOrFound"
                  value={formData.dateLostOrFound}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: new Date().toISOString().split('T')[0] }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label={formData.category === 'lost' ? 'Where did you lose it?' : 'Where did you find it?'}
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Library 2nd Floor, Cafeteria, Main Building"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Contact Information *
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {formData.category === 'lost'
                    ? 'Provide contact details so finders can reach you'
                    : 'Provide your contact details so the owner can reach you to claim the item'}
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

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={formData.category === 'lost' ? 'Reward (optional)' : 'Notes (optional)'}
                  name="reward"
                  value={formData.reward}
                  onChange={handleChange}
                  placeholder={formData.category === 'lost' 
                    ? 'e.g., $20, Coffee voucher' 
                    : 'e.g., Item is at security desk'}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isUrgent}
                      onChange={handleChange}
                      name="isUrgent"
                      color="error"
                    />
                  }
                  label={formData.category === 'lost' 
                    ? 'Mark as urgent (important documents, medical items)' 
                    : 'Mark as urgent (perishable, valuable)'}
                />
              </Grid>

              {/* Image Upload Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Upload Images (Optional)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add up to 3 photos to help identify the item (Max 5MB each)
                </Typography>
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  disabled={imageFiles.length >= 3}
                  sx={{ mb: 2 }}
                >
                  Upload Images ({imageFiles.length}/3)
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </Button>

                {imageFiles.length > 0 && (
                  <ImageList sx={{ width: '100%', maxHeight: 200 }} cols={3} rowHeight={150}>
                    {imageFiles.map((file, index) => (
                      <ImageListItem key={index}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          loading="lazy"
                          style={{ objectFit: 'cover', height: '100%' }}
                        />
                        <ImageListItemBar
                          actionIcon={
                            <IconButton
                              sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                              onClick={() => removeImage(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}

                {uploadingImages && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Uploading images...
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => navigate('/lost-found')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Report Item'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateLostFound;

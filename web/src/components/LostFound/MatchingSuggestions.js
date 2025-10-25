import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  LocationOn,
  Schedule,
  TrendingUp,
  CheckCircle,
} from '@mui/icons-material';
import { lostFoundAPI } from '../../utils/api';

const MatchingSuggestions = ({ open, onClose, itemId, onMatch }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(null);

  useEffect(() => {
    if (open && itemId) {
      fetchSuggestions();
    }
  }, [open, itemId]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await lostFoundAPI.getSuggestions(itemId);
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (matchedItemId) => {
    try {
      setMatching(matchedItemId);
      await lostFoundAPI.matchItems(itemId, matchedItemId);
      if (onMatch) {
        onMatch();
      }
      onClose();
    } catch (error) {
      console.error('Error matching items:', error);
      alert('Failed to match items. Please try again.');
    } finally {
      setMatching(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMatchScoreColor = (score) => {
    if (score >= 70) return 'success';
    if (score >= 40) return 'warning';
    return 'error';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TrendingUp sx={{ mr: 1 }} />
          Matching Suggestions
        </Box>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : suggestions.length === 0 ? (
          <Alert severity="info">
            No matching items found at the moment. Check back later or try adjusting your item details.
          </Alert>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Found {suggestions.length} potential match{suggestions.length !== 1 ? 'es' : ''} based on item type, location, and date.
            </Typography>
            {suggestions.map((suggestion) => (
              <Card key={suggestion._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      {/* Title & Match Score */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {suggestion.title}
                        </Typography>
                        <Chip
                          label={`${suggestion.matchScore}% Match`}
                          color={getMatchScoreColor(suggestion.matchScore)}
                          size="small"
                        />
                      </Box>

                      {/* Match Score Progress */}
                      <Box sx={{ mb: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={suggestion.matchScore}
                          color={getMatchScoreColor(suggestion.matchScore)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>

                      {/* Description */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {suggestion.description.substring(0, 150)}
                        {suggestion.description.length > 150 ? '...' : ''}
                      </Typography>

                      {/* Details */}
                      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">{suggestion.location}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Schedule fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">
                            {formatDate(suggestion.dateLostOrFound)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Reporter Info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar
                          sx={{ width: 24, height: 24, mr: 1, fontSize: '0.875rem' }}
                        >
                          {suggestion.reportedBy?.firstName?.[0]}
                          {suggestion.reportedBy?.lastName?.[0]}
                        </Avatar>
                        <Typography variant="caption" color="text.secondary">
                          Reported by {suggestion.reportedBy?.firstName}{' '}
                          {suggestion.reportedBy?.lastName}
                        </Typography>
                      </Box>

                      {/* Action Button */}
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={matching === suggestion._id ? <CircularProgress size={16} /> : <CheckCircle />}
                        onClick={() => handleMatch(suggestion._id)}
                        disabled={matching !== null}
                        color={getMatchScoreColor(suggestion.matchScore)}
                      >
                        {matching === suggestion._id ? 'Matching...' : 'Match This Item'}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={matching !== null}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MatchingSuggestions;

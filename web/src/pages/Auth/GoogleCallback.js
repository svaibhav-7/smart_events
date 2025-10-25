import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Container } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Authentication failed. Please try again.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }

      if (token && userParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userParam));
          const result = await handleGoogleCallback(token, userData);
          
          if (result.success) {
            navigate('/');
          } else {
            setError('Failed to process authentication. Please try again.');
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          }
        } catch (err) {
          console.error('Google callback error:', err);
          setError('Failed to process authentication. Please try again.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } else {
        setError('Invalid authentication response.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate, handleGoogleCallback]);

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {error ? (
          <>
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              Redirecting to login...
            </Typography>
          </>
        ) : (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Completing Google Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we sign you in...
            </Typography>
          </>
        )}
      </Box>
    </Container>
  );
};

export default GoogleCallback;

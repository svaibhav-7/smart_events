import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';

WebBrowser.maybeCompleteAuthSession();

const API_BASE_URL = 'http://localhost:5000/api';

export const googleAuth = async () => {
  try {
    // For Expo apps, we'll redirect to our backend's Google auth endpoint
    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
    });

    // Initiate Google OAuth through our backend
    const response = await axios.get(`${API_BASE_URL}/auth/google/mobile`, {
      params: { redirectUri }
    });

    if (response.data.authUrl) {
      const result = await AuthSession.startAsync({
        authUrl: response.data.authUrl,
        returnUrl: redirectUri,
      });

      if (result.type === 'success') {
        // Complete authentication with backend
        const tokenResponse = await axios.post(`${API_BASE_URL}/auth/google/mobile/callback`, {
          code: result.params.code,
          state: result.params.state,
          redirectUri: redirectUri,
        });

        if (tokenResponse.data.token) {
          return {
            success: true,
            token: tokenResponse.data.token,
            user: tokenResponse.data.user,
          };
        }
      }
    }

    return {
      success: false,
      error: 'Google authentication failed',
    };
  } catch (error) {
    console.error('Google auth error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Network error during Google authentication',
    };
  }
};

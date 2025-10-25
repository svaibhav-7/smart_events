import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Text,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(formData);
    setLoading(false);

    if (result.success) {
      // Navigation will be handled by AuthContext
    } else {
      setError(result.error);
      setSnackbarVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.header}>
                <Icon name="school" size={64} color="#1976d2" />
                <Title style={styles.title}>Smart Campus</Title>
                <Text style={styles.subtitle}>Sign in to your account</Text>
              </View>

              <TextInput
                label="Email Address"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
              />

              <TextInput
                label="Password"
                value={formData.password}
                onChangeText={(value) => handleChange('password', value)}
                mode="outlined"
                secureTextEntry
                autoComplete="password"
                style={styles.input}
              />

              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.loginButton}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator animating color="white" />
                ) : (
                  'Sign In'
                )}
              </Button>

              <View style={styles.linksContainer}>
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('Register')}
                  style={styles.linkButton}
                >
                  Don't have an account? Sign Up
                </Button>
                <Button
                  mode="text"
                  onPress={() => {/* Navigate to forgot password */}}
                  style={styles.linkButton}
                >
                  Forgot Password?
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    elevation: 4,
  },
  cardContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  linksContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkButton: {
    marginVertical: 4,
  },
});

export default LoginScreen;

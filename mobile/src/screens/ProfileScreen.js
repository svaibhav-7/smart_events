import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  TextInput,
  Button,
  Avatar,
  Chip,
  ActivityIndicator,
  List,
  Switch,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, updateProfile, logout } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });
  const [loading, setLoading] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    const result = await updateProfile(formData);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Profile updated successfully!');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: logout,
        },
      ]
    );
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#f44336';
      case 'faculty':
        return '#2196f3';
      case 'student':
        return '#4caf50';
      default:
        return '#666';
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
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Avatar.Text
            size={80}
            label={`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
            style={styles.avatar}
          />
          <Title style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Title>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleContainer}>
            <Chip
              style={[
                styles.roleChip,
                { backgroundColor: `${getRoleColor(user?.role)}20` }
              ]}
              textStyle={{ color: getRoleColor(user?.role) }}
            >
              <Icon name={getRoleIcon(user?.role)} size={16} />
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Profile Information */}
      <Card style={styles.infoCard}>
        <Card.Title title="Profile Information" />
        <Card.Content>
          <TextInput
            label="First Name"
            value={formData.firstName}
            onChangeText={(value) => handleChange('firstName', value)}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Last Name"
            value={formData.lastName}
            onChangeText={(value) => handleChange('lastName', value)}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Phone Number"
            value={formData.phone}
            onChangeText={(value) => handleChange('phone', value)}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            label="Department"
            value={formData.department}
            onChangeText={(value) => handleChange('department', value)}
            mode="outlined"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleUpdateProfile}
            style={styles.updateButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator animating color="white" />
            ) : (
              'Update Profile'
            )}
          </Button>
        </Card.Content>
      </Card>

      {/* Account Details */}
      <Card style={styles.detailsCard}>
        <Card.Title title="Account Details" />
        <Card.Content>
          <List.Item
            title="Student ID"
            description={user?.studentId || 'Not provided'}
            left={(props) => <List.Icon {...props} icon="badge" />}
          />
          <List.Item
            title="Employee ID"
            description={user?.employeeId || 'Not provided'}
            left={(props) => <List.Icon {...props} icon="work" />}
          />
          <List.Item
            title="Year"
            description={user?.year || 'Not applicable'}
            left={(props) => <List.Icon {...props} icon="calendar-today" />}
          />
          <List.Item
            title="Member Since"
            description={new Date(user?.createdAt).toLocaleDateString()}
            left={(props) => <List.Icon {...props} icon="date-range" />}
          />
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.settingsCard}>
        <Card.Title title="Settings" />
        <Card.Content>
          <List.Item
            title="Push Notifications"
            right={(props) => (
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
              />
            )}
          />
          <List.Item
            title="Change Password"
            onPress={() => {
              // Navigate to change password screen
            }}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            title="Privacy Settings"
            onPress={() => {
              // Navigate to privacy settings
            }}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </Card.Content>
      </Card>

      {/* Logout */}
      <Card style={styles.logoutCard}>
        <Card.Content>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor="#f44336"
          >
            <Icon name="logout" size={16} />
            Logout
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 10,
    elevation: 4,
  },
  headerContent: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  roleContainer: {
    alignItems: 'center',
  },
  roleChip: {
    borderWidth: 1,
  },
  infoCard: {
    margin: 10,
    marginTop: 0,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  updateButton: {
    marginTop: 16,
  },
  detailsCard: {
    margin: 10,
    marginTop: 0,
    elevation: 2,
  },
  settingsCard: {
    margin: 10,
    marginTop: 0,
    elevation: 2,
  },
  logoutCard: {
    margin: 10,
    marginTop: 0,
    elevation: 2,
  },
  logoutButton: {
    borderColor: '#f44336',
  },
});

export default ProfileScreen;

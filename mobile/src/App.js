import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import EventsScreen from './src/screens/EventsScreen';
import EventDetailsScreen from './src/screens/EventDetailsScreen';
import LostFoundScreen from './src/screens/LostFoundScreen';
import CreateLostFoundScreen from './src/screens/CreateLostFoundScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import ClubsScreen from './src/screens/ClubsScreen';
import ClubDetailsScreen from './src/screens/ClubDetailsScreen';
import AnnouncementsScreen from './src/screens/AnnouncementsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Dashboard') {
          iconName = 'dashboard';
        } else if (route.name === 'Events') {
          iconName = 'event';
        } else if (route.name === 'LostFound') {
          iconName = 'find-in-page';
        } else if (route.name === 'Feedback') {
          iconName = 'feedback';
        } else if (route.name === 'Clubs') {
          iconName = 'groups';
        } else if (route.name === 'Announcements') {
          iconName = 'campaign';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#1976d2',
      tabBarInactiveTintColor: 'gray',
      headerStyle: {
        backgroundColor: '#1976d2',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Events" component={EventsScreen} />
    <Tab.Screen name="LostFound" component={LostFoundScreen} />
    <Tab.Screen name="Feedback" component={FeedbackScreen} />
    <Tab.Screen name="Clubs" component={ClubsScreen} />
    <Tab.Screen name="Announcements" component={AnnouncementsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
    <Stack.Screen name="ClubDetails" component={ClubDetailsScreen} />
    <Stack.Screen name="CreateLostFound" component={CreateLostFoundScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <PaperProvider>
        <StatusBar backgroundColor="#1976d2" barStyle="light-content" />
        <AppNavigator />
      </PaperProvider>
    </AuthProvider>
  );
};

export default App;

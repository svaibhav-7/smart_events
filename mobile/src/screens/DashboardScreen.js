import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  FAB,
  Chip,
  Avatar,
  List,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import {
  eventsAPI,
  lostFoundAPI,
  feedbackAPI,
  clubsAPI,
  announcementsAPI,
} from '../../services/api';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    events: 0,
    lostItems: 0,
    feedback: 0,
    clubs: 0,
    announcements: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const [eventsRes, lostFoundRes, feedbackRes, clubsRes, announcementsRes1] = await Promise.all([
        eventsAPI.getEvents({ limit: 1 }),
        lostFoundAPI.getItems({ limit: 1 }),
        feedbackAPI.getFeedback({ limit: 1 }),
        clubsAPI.getClubs({ limit: 1 }),
        announcementsAPI.getAnnouncements({ limit: 1 }),
      ]);

      setStats({
        events: eventsRes.data.total || 0,
        lostItems: lostFoundRes.data.total || 0,
        feedback: feedbackRes.data.total || 0,
        clubs: clubsRes.data.total || 0,
        announcements: announcementsRes1.data.total || 0,
      });

      // Fetch recent data
      const [recentEventsRes, recentAnnouncementsRes] = await Promise.all([
        eventsAPI.getEvents({ limit: 3, sort: 'startDate' }),
        announcementsAPI.getAnnouncements({ limit: 3 }),
      ]);

      setRecentEvents(recentEventsRes.data.events || []);
      setRecentAnnouncements(recentAnnouncementsRes.data.announcements || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      title: 'Create Event',
      icon: 'event',
      color: '#1976d2',
      onPress: () => navigation.navigate('Events'),
      roles: ['faculty', 'admin'],
    },
    {
      title: 'Report Lost Item',
      icon: 'find-in-page',
      color: '#ff9800',
      onPress: () => navigation.navigate('CreateLostFound'),
    },
    {
      title: 'Submit Feedback',
      icon: 'feedback',
      color: '#2196f3',
      onPress: () => navigation.navigate('Feedback'),
    },
    {
      title: 'Join Club',
      icon: 'groups',
      color: '#4caf50',
      onPress: () => navigation.navigate('Clubs'),
      roles: ['student'],
    },
  ];

  const filteredQuickActions = quickActions.filter(
    action => !action.roles || action.roles.includes(user?.role)
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.firstName}!
          </Text>
          <Chip
            icon={() => <Icon name="person" size={16} />}
            style={styles.roleChip}
          >
            {user?.role}
          </Chip>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {filteredQuickActions.map((action, index) => (
            <Card
              key={index}
              style={[styles.quickActionCard, { backgroundColor: action.color }]}
              onPress={action.onPress}
            >
              <Card.Content style={styles.quickActionContent}>
                <Icon name={action.icon} size={32} color="white" />
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <Card.Content style={styles.statsContent}>
              <Icon name="event" size={24} color="#1976d2" />
              <View style={styles.statsText}>
                <Text style={styles.statsNumber}>{stats.events}</Text>
                <Text style={styles.statsLabel}>Events</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statsCard}>
            <Card.Content style={styles.statsContent}>
              <Icon name="find-in-page" size={24} color="#ff9800" />
              <View style={styles.statsText}>
                <Text style={styles.statsNumber}>{stats.lostItems}</Text>
                <Text style={styles.statsLabel}>Lost & Found</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statsCard}>
            <Card.Content style={styles.statsContent}>
              <Icon name="feedback" size={24} color="#2196f3" />
              <View style={styles.statsText}>
                <Text style={styles.statsNumber}>{stats.feedback}</Text>
                <Text style={styles.statsLabel}>Feedback</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statsCard}>
            <Card.Content style={styles.statsContent}>
              <Icon name="groups" size={24} color="#4caf50" />
              <View style={styles.statsText}>
                <Text style={styles.statsNumber}>{stats.clubs}</Text>
                <Text style={styles.statsLabel}>Clubs</Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Events */}
        <Card style={styles.sectionCard}>
          <Card.Title title="Recent Events" />
          <Card.Content>
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <List.Item
                  key={event._id}
                  title={event.title}
                  description={`${formatDate(event.startDate)} • ${event.venue}`}
                  left={(props) => <List.Icon {...props} icon="event" />}
                  right={(props) => (
                    <Chip {...props} mode="outlined">
                      {event.category}
                    </Chip>
                  )}
                  onPress={() => navigation.navigate('EventDetails', { eventId: event._id })}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No recent events</Text>
            )}
            <Button
              mode="text"
              onPress={() => navigation.navigate('Events')}
              style={styles.viewAllButton}
            >
              View All Events
            </Button>
          </Card.Content>
        </Card>

        {/* Recent Announcements */}
        <Card style={styles.sectionCard}>
          <Card.Title title="Recent Announcements" />
          <Card.Content>
            {recentAnnouncements.length > 0 ? (
              recentAnnouncements.map((announcement) => (
                <List.Item
                  key={announcement._id}
                  title={announcement.title}
                  description={announcement.content.substring(0, 100) + '...'}
                  left={(props) => <List.Icon {...props} icon="campaign" />}
                  right={(props) => (
                    <Chip
                      {...props}
                      mode="outlined"
                      style={{
                        backgroundColor:
                          announcement.priority === 'urgent' ? '#ffebee' : 'transparent',
                      }}
                    >
                      {announcement.priority}
                    </Chip>
                  )}
                  onPress={() => navigation.navigate('Announcements')}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No recent announcements</Text>
            )}
            <Button
              mode="text"
              onPress={() => navigation.navigate('Announcements')}
              style={styles.viewAllButton}
            >
              View All Announcements
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          // Show action sheet or navigate to create screen
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roleChip: {
    backgroundColor: '#e3f2fd',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  quickActionCard: {
    width: (width - 40) / 2,
    margin: 5,
    elevation: 4,
  },
  quickActionContent: {
    alignItems: 'center',
    padding: 20,
  },
  quickActionTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  statsCard: {
    width: (width - 40) / 2,
    margin: 5,
    elevation: 2,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  statsText: {
    marginLeft: 15,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
  },
  sectionCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  viewAllButton: {
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
});

export default DashboardScreen;

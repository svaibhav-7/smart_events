import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Chip,
  FAB,
  Searchbar,
  Menu,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { eventsAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const EventsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const categories = [
    { label: 'All', value: 'all' },
    { label: 'Academic', value: 'academic' },
    { label: 'Cultural', value: 'cultural' },
    { label: 'Sports', value: 'sports' },
    { label: 'Workshop', value: 'workshop' },
    { label: 'Seminar', value: 'seminar' },
  ];

  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
    }, [selectedCategory, selectedStatus])
  );

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 20,
        sort: 'startDate',
      };

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const response = await eventsAPI.getEvents(params);
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;

    if (now > startDate) {
      return '#4caf50'; // Past event - green
    } else if (registrationDeadline && now > registrationDeadline) {
      return '#f44336'; // Registration closed - red
    } else if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return '#ff9800'; // Full - orange
    } else {
      return '#2196f3'; // Open - blue
    }
  };

  const getStatusText = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;

    if (now > startDate) {
      return 'Completed';
    } else if (registrationDeadline && now > registrationDeadline) {
      return 'Registration Closed';
    } else if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return 'Full';
    } else {
      return 'Open';
    }
  };

  const renderEventCard = ({ item }) => (
    <Card
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetails', { eventId: item._id })}
    >
      <Card.Content>
        <View style={styles.eventHeader}>
          <Title style={styles.eventTitle}>{item.title}</Title>
          <Chip
            mode="outlined"
            style={{
              backgroundColor: `${getStatusColor(item)}20`,
              borderColor: getStatusColor(item),
            }}
            textStyle={{ color: getStatusColor(item) }}
          >
            {getStatusText(item)}
          </Chip>
        </View>

        <Text style={styles.eventDescription}>
          {item.description.substring(0, 100)}...
        </Text>

        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Icon name="schedule" size={16} color="#666" />
            <Text style={styles.detailText}>
              {formatDate(item.startDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.detailText}>{item.venue}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="category" size={16} color="#666" />
            <Text style={styles.detailText}>{item.category}</Text>
          </View>

          {item.maxAttendees && (
            <View style={styles.detailRow}>
              <Icon name="people" size={16} color="#666" />
              <Text style={styles.detailText}>
                {item.attendees.length}/{item.maxAttendees} attendees
              </Text>
            </View>
          )}
        </View>

        <View style={styles.eventFooter}>
          <Chip mode="outlined">{item.category}</Chip>
          <Button
            mode="contained"
            compact
            onPress={() => navigation.navigate('EventDetails', { eventId: item._id })}
          >
            View Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search events..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setFilterMenuVisible(true)}
              style={styles.filterButton}
            >
              <Icon name="filter-list" size={16} />
              Filter
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setSelectedCategory('all');
              setFilterMenuVisible(false);
            }}
            title="All Categories"
          />
          {categories.slice(1).map((category) => (
            <Menu.Item
              key={category.value}
              onPress={() => {
                setSelectedCategory(category.value);
                setFilterMenuVisible(false);
              }}
              title={category.label}
            />
          ))}
        </Menu>
      </View>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEventCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="event-note" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No events found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Check back later for new events'}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      {(user?.role === 'faculty' || user?.role === 'admin') && (
        <FAB
          icon="add"
          style={styles.fab}
          onPress={() => {
            // Navigate to create event screen
          }}
        />
      )}
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
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    marginRight: 10,
  },
  filterButton: {
    borderColor: '#1976d2',
  },
  listContainer: {
    padding: 10,
  },
  eventCard: {
    marginBottom: 10,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    flex: 1,
    marginRight: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  eventDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
});

export default EventsScreen;

import React, { useState, useEffect } from 'react';
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
  Button,
  Chip,
  Avatar,
  ActivityIndicator,
  List,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { eventsAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const EventDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getEventById(eventId);
      setEvent(response.data.event);
    } catch (error) {
      console.error('Error fetching event details:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    Alert.alert(
      'Register for Event',
      `Are you sure you want to register for "${event?.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: async () => {
            try {
              setRegistering(true);
              await eventsAPI.registerForEvent(eventId);
              Alert.alert('Success', 'Successfully registered for the event!');
              fetchEventDetails(); // Refresh event data
            } catch (error) {
              Alert.alert('Error', 'Failed to register for event');
            } finally {
              setRegistering(false);
            }
          },
        },
      ]
    );
  };

  const handleUnregister = async () => {
    Alert.alert(
      'Unregister from Event',
      `Are you sure you want to unregister from "${event?.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unregister',
          onPress: async () => {
            try {
              setRegistering(true);
              await eventsAPI.unregisterFromEvent(eventId);
              Alert.alert('Success', 'Successfully unregistered from the event!');
              fetchEventDetails(); // Refresh event data
            } catch (error) {
              Alert.alert('Error', 'Failed to unregister from event');
            } finally {
              setRegistering(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isRegistered = event?.attendees?.some(attendee => attendee.user === user?.id);
  const isEventFull = event?.maxAttendees && event.attendees.length >= event.maxAttendees;
  const isRegistrationOpen = event && (!event.registrationDeadline ||
    new Date() <= new Date(event.registrationDeadline));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color="#f44336" />
        <Text style={styles.errorText}>Event not found</Text>
        <Button onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Event Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <Title style={styles.eventTitle}>{event.title}</Title>
            <View style={styles.categoryContainer}>
              <Chip mode="outlined" style={styles.categoryChip}>
                {event.category}
              </Chip>
              {isEventFull && (
                <Chip mode="outlined" style={styles.fullChip}>
                  Full
                </Chip>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Event Details */}
      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text style={styles.description}>{event.description}</Text>

          <List.Item
            title="Date & Time"
            description={`${formatDate(event.startDate)} (${formatTime(event.startTime)} - ${formatTime(event.endTime)})`}
            left={(props) => <List.Icon {...props} icon="calendar-today" />}
          />

          <List.Item
            title="Location"
            description={`${event.venue}, ${event.location}`}
            left={(props) => <List.Icon {...props} icon="location-on" />}
          />

          <List.Item
            title="Organizer"
            description={event.organizer?.firstName + ' ' + event.organizer?.lastName}
            left={(props) => <List.Icon {...props} icon="person" />}
          />

          {event.maxAttendees && (
            <List.Item
              title="Attendees"
              description={`${event.attendees.length}/${event.maxAttendees}`}
              left={(props) => <List.Icon {...props} icon="people" />}
            />
          )}

          {event.registrationDeadline && (
            <List.Item
              title="Registration Deadline"
              description={formatDate(event.registrationDeadline)}
              left={(props) => <List.Icon {...props} icon="schedule" />}
            />
          )}
        </Card.Content>
      </Card>

      {/* Registration Section */}
      <Card style={styles.registrationCard}>
        <Card.Content>
          <Title>Registration</Title>
          {isRegistered ? (
            <View>
              <Text style={styles.registeredText}>You are registered for this event!</Text>
              <Button
                mode="outlined"
                onPress={handleUnregister}
                disabled={registering}
                style={styles.unregisterButton}
              >
                Unregister
              </Button>
            </View>
          ) : (
            <View>
              <Text style={styles.registrationStatus}>
                {isEventFull ? 'Event is full' :
                 !isRegistrationOpen ? 'Registration closed' :
                 'Registration is open'}
              </Text>
              <Button
                mode="contained"
                onPress={handleRegister}
                disabled={isEventFull || !isRegistrationOpen || registering}
                style={styles.registerButton}
              >
                {registering ? (
                  <ActivityIndicator animating color="white" />
                ) : (
                  'Register for Event'
                )}
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Attendees List (if user is organizer or admin) */}
      {(user?.role === 'admin' || user?.role === 'faculty') && event.attendees.length > 0 && (
        <Card style={styles.attendeesCard}>
          <Card.Title title="Registered Attendees" />
          <Card.Content>
            {event.attendees.map((attendee) => (
              <List.Item
                key={attendee.user}
                title={attendee.user?.firstName + ' ' + attendee.user?.lastName}
                description={attendee.user?.email}
                left={(props) => (
                  <Avatar.Text
                    {...props}
                    size={40}
                    label={`${attendee.user?.firstName?.[0] || ''}${attendee.user?.lastName?.[0] || ''}`}
                  />
                )}
                right={(props) => (
                  <Chip {...props} mode="outlined">
                    {attendee.status}
                  </Chip>
                )}
              />
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginTop: 16,
    marginBottom: 20,
  },
  headerCard: {
    margin: 10,
    elevation: 4,
  },
  headerContent: {
    alignItems: 'center',
    padding: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  categoryChip: {
    marginHorizontal: 4,
  },
  fullChip: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  detailsCard: {
    margin: 10,
    marginTop: 0,
    elevation: 2,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#333',
  },
  registrationCard: {
    margin: 10,
    marginTop: 0,
    elevation: 2,
  },
  registeredText: {
    fontSize: 16,
    color: '#4caf50',
    marginBottom: 16,
    textAlign: 'center',
  },
  registrationStatus: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  registerButton: {
    marginTop: 8,
  },
  unregisterButton: {
    borderColor: '#f44336',
  },
  attendeesCard: {
    margin: 10,
    marginTop: 0,
    elevation: 2,
  },
});

export default EventDetailsScreen;

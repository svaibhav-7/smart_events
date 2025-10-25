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
import { clubsAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const ClubDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { clubId } = route.params;
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchClubDetails();
  }, [clubId]);

  const fetchClubDetails = async () => {
    try {
      setLoading(true);
      const response = await clubsAPI.getClubById(clubId);
      setClub(response.data.club);
    } catch (error) {
      console.error('Error fetching club details:', error);
      Alert.alert('Error', 'Failed to load club details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async () => {
    Alert.alert(
      'Join Club',
      `Are you sure you want to join "${club?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: async () => {
            try {
              setJoining(true);
              await clubsAPI.joinClub(clubId);
              Alert.alert('Success', 'Successfully joined the club!');
              fetchClubDetails(); // Refresh club data
            } catch (error) {
              Alert.alert('Error', 'Failed to join club');
            } finally {
              setJoining(false);
            }
          },
        },
      ]
    );
  };

  const handleLeaveClub = async () => {
    Alert.alert(
      'Leave Club',
      `Are you sure you want to leave "${club?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          onPress: async () => {
            try {
              setJoining(true);
              await clubsAPI.leaveClub(clubId);
              Alert.alert('Success', 'Successfully left the club!');
              fetchClubDetails(); // Refresh club data
            } catch (error) {
              Alert.alert('Error', 'Failed to leave club');
            } finally {
              setJoining(false);
            }
          },
        },
      ]
    );
  };

  const isMember = club?.members?.some(member => member.user === user?.id);
  const isFull = club?.maxMembers && club.members.length >= club.maxMembers;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  if (!club) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color="#f44336" />
        <Text style={styles.errorText}>Club not found</Text>
        <Button onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Club Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <Title style={styles.clubTitle}>{club.name}</Title>
            <Text style={styles.clubCategory}>{club.category}</Text>
            <Text style={styles.memberCount}>
              {club.members.length} members
              {club.maxMembers && ` / ${club.maxMembers}`}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Club Description */}
      <Card style={styles.descriptionCard}>
        <Card.Content>
          <Text style={styles.description}>{club.description}</Text>

          {club.establishedYear && (
            <List.Item
              title="Established"
              description={club.establishedYear}
              left={(props) => <List.Icon {...props} icon="calendar-today" />}
            />
          )}

          {club.meetingSchedule && (
            <List.Item
              title="Meeting Schedule"
              description={`${club.meetingSchedule.day} at ${club.meetingSchedule.time} - ${club.meetingSchedule.location}`}
              left={(props) => <List.Icon {...props} icon="schedule" />}
            />
          )}

          {club.contactEmail && (
            <List.Item
              title="Contact"
              description={club.contactEmail}
              left={(props) => <List.Icon {...props} icon="email" />}
            />
          )}
        </Card.Content>
      </Card>

      {/* Leadership */}
      <Card style={styles.leadershipCard}>
        <Card.Title title="Leadership" />
        <Card.Content>
          <List.Item
            title="Advisor"
            description={club.advisor?.firstName + ' ' + club.advisor?.lastName}
            left={(props) => (
              <Avatar.Text
                {...props}
                size={40}
                label={`${club.advisor?.firstName?.[0] || ''}${club.advisor?.lastName?.[0] || ''}`}
              />
            )}
          />

          {club.president && (
            <List.Item
              title="President"
              description={club.president?.firstName + ' ' + club.president?.lastName}
              left={(props) => (
                <Avatar.Text
                  {...props}
                  size={40}
                  label={`${club.president?.firstName?.[0] || ''}${club.president?.lastName?.[0] || ''}`}
                />
              )}
            />
          )}
        </Card.Content>
      </Card>

      {/* Achievements */}
      {club.achievements && club.achievements.length > 0 && (
        <Card style={styles.achievementsCard}>
          <Card.Title title="Achievements" />
          <Card.Content>
            {club.achievements.map((achievement, index) => (
              <List.Item
                key={index}
                title={achievement.title}
                description={achievement.description}
                left={(props) => <List.Icon {...props} icon="star" />}
              />
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Join/Leave Section */}
      <Card style={styles.joinCard}>
        <Card.Content>
          {isMember ? (
            <View>
              <Text style={styles.memberText}>You are a member of this club!</Text>
              <Button
                mode="outlined"
                onPress={handleLeaveClub}
                disabled={joining}
                style={styles.leaveButton}
              >
                Leave Club
              </Button>
            </View>
          ) : (
            <View>
              <Text style={styles.joinStatus}>
                {isFull ? 'Club is full' : 'Join this club to participate in activities'}
              </Text>
              <Button
                mode="contained"
                onPress={handleJoinClub}
                disabled={isFull || joining}
                style={styles.joinButton}
              >
                {joining ? (
                  <ActivityIndicator animating color="white" />
                ) : (
                  'Join Club'
                )}
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Members List (for club members) */}
      {isMember && club.members.length > 0 && (
        <Card style={styles.membersCard}>
          <Card.Title title="Members" />
          <Card.Content>
            {club.members.slice(0, 5).map((member) => (
              <List.Item
                key={member.user}
                title={member.user?.firstName + ' ' + member.user?.lastName}
                description={member.role}
                left={(props) => (
                  <Avatar.Text
                    {...props}
                    size={40}
                    label={`${member.user?.firstName?.[0] || ''}${member.user?.lastName?.[0] || ''}`}
                  />
                )}
              />
            ))}
            {club.members.length > 5 && (
              <Text style={styles.moreMembersText}>
                and {club.members.length - 5} more members...
              </Text>
            )}
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
  clubTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  clubCategory: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  memberCount: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  descriptionCard: {
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
  leadershipCard: {
    margin: 10,
    marginTop: 0,
    elevation: 2,
  },
  achievementsCard: {
    margin: 10,
    marginTop: 0,
    elevation: 2,
  },
  joinCard: {
    margin: 10,
    marginTop: 0,
    elevation: 2,
  },
  memberText: {
    fontSize: 16,
    color: '#4caf50',
    marginBottom: 16,
    textAlign: 'center',
  },
  joinStatus: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  joinButton: {
    marginTop: 8,
  },
  leaveButton: {
    borderColor: '#f44336',
  },
  membersCard: {
    margin: 10,
    marginTop: 0,
    elevation: 2,
  },
  moreMembersText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
});

export default ClubDetailsScreen;

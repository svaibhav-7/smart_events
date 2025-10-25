import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  FAB,
  Chip,
  Avatar,
  IconButton,
  ActivityIndicator,
  Searchbar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { feedbackAPI } from '../services/api';

const FeedbackScreen = () => {
  const navigation = useNavigation();
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [votingItem, setVotingItem] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await feedbackAPI.getFeedback({ limit: 50 });
      setFeedback(response.data.feedback || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeedback();
  };

  const handleVote = async (feedbackId, voteType) => {
    try {
      setVotingItem(feedbackId);
      await feedbackAPI.voteFeedback(feedbackId, voteType);
      await fetchFeedback();
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVotingItem(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return '#2196f3';
      case 'in-progress':
        return '#ff9800';
      case 'resolved':
        return '#4caf50';
      case 'closed':
        return '#9e9e9e';
      default:
        return '#757575';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return '#d32f2f';
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredFeedback = feedback.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search feedback..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredFeedback.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="feedback" size={64} color="#bdbdbd" />
              <Title style={styles.emptyTitle}>No Feedback Found</Title>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Be the first to submit feedback!'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredFeedback.map((item) => (
            <Card key={item._id} style={styles.feedbackCard}>
              <Card.Content>
                {/* Header with title and chips */}
                <View style={styles.headerRow}>
                  <Title style={styles.feedbackTitle} numberOfLines={2}>
                    {item.title}
                  </Title>
                </View>

                <View style={styles.chipsRow}>
                  <Chip
                    style={[styles.chip, { backgroundColor: getStatusColor(item.status) + '20' }]}
                    textStyle={{ color: getStatusColor(item.status), fontSize: 11 }}
                  >
                    {item.status}
                  </Chip>
                  <Chip
                    style={[styles.chip, { backgroundColor: getPriorityColor(item.priority) + '20' }]}
                    textStyle={{ color: getPriorityColor(item.priority), fontSize: 11 }}
                  >
                    {item.priority}
                  </Chip>
                  <Chip
                    style={styles.chip}
                    textStyle={{ fontSize: 11 }}
                  >
                    {item.category}
                  </Chip>
                </View>

                {/* Description */}
                <Text style={styles.description} numberOfLines={3}>
                  {item.description}
                </Text>

                {/* User info and votes */}
                <View style={styles.footerRow}>
                  <View style={styles.userInfo}>
                    <Avatar.Text
                      size={32}
                      label={`${item.submittedBy?.firstName?.[0] || ''}${item.submittedBy?.lastName?.[0] || ''}`}
                      style={styles.avatar}
                    />
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>
                        {item.submittedBy?.firstName} {item.submittedBy?.lastName}
                      </Text>
                      <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                    </View>
                  </View>

                  {/* Like/Dislike buttons */}
                  <View style={styles.votingRow}>
                    <TouchableOpacity
                      onPress={() => handleVote(item._id, 'up')}
                      disabled={votingItem === item._id}
                      style={styles.voteButton}
                    >
                      <Icon
                        name="thumb-up"
                        size={20}
                        color={votingItem === item._id ? '#bdbdbd' : '#2196f3'}
                      />
                      <Text style={styles.voteCount}>{item.upvotes?.length || 0}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleVote(item._id, 'down')}
                      disabled={votingItem === item._id}
                      style={styles.voteButton}
                    >
                      <Icon
                        name="thumb-down"
                        size={20}
                        color={votingItem === item._id ? '#bdbdbd' : '#f44336'}
                      />
                      <Text style={styles.voteCount}>{item.downvotes?.length || 0}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Responses count */}
                {item.responses && item.responses.length > 0 && (
                  <View style={styles.responsesRow}>
                    <Icon name="comment" size={16} color="#757575" />
                    <Text style={styles.responsesText}>
                      {item.responses.length} {item.responses.length === 1 ? 'Response' : 'Responses'}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // Navigate to submit feedback screen
          // navigation.navigate('SubmitFeedback');
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
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 12,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
  },
  feedbackCard: {
    marginHorizontal: 12,
    marginVertical: 6,
    elevation: 2,
  },
  emptyCard: {
    margin: 20,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    color: '#757575',
    textAlign: 'center',
  },
  headerRow: {
    marginBottom: 8,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    marginRight: 6,
    marginBottom: 6,
    height: 28,
  },
  description: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 8,
    backgroundColor: '#1976d2',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#212121',
  },
  date: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  votingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  voteCount: {
    fontSize: 14,
    marginLeft: 4,
    color: '#424242',
    fontWeight: '500',
  },
  responsesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  responsesText: {
    fontSize: 13,
    color: '#757575',
    marginLeft: 6,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
});

export default FeedbackScreen;

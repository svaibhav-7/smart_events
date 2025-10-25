import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Chip,
  FAB,
  Searchbar,
  ActivityIndicator,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { lostFoundAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const LostFoundScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useFocusEffect(
    React.useCallback(() => {
      fetchItems();
    }, [selectedCategory, selectedType])
  );

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 20,
        sort: 'createdAt',
      };

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (selectedType !== 'all') {
        params.itemType = selectedType;
      }

      const response = await lostFoundAPI.getItems(params);
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching lost & found items:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return '#2196f3';
      case 'claimed':
        return '#4caf50';
      case 'resolved':
        return '#4caf50';
      case 'expired':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'claimed':
        return 'Claimed';
      case 'resolved':
        return 'Resolved';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  const handleClaimItem = (item) => {
    Alert.alert(
      'Claim Item',
      `Are you sure you want to claim "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Claim',
          onPress: async () => {
            try {
              await lostFoundAPI.claimItem(item._id);
              Alert.alert('Success', 'Item claimed successfully!');
              fetchItems();
            } catch (error) {
              Alert.alert('Error', 'Failed to claim item');
            }
          },
        },
      ]
    );
  };

  const renderItemCard = ({ item }) => (
    <Card style={styles.itemCard}>
      <Card.Content>
        <View style={styles.itemHeader}>
          <Title style={styles.itemTitle}>{item.title}</Title>
          <View style={styles.statusContainer}>
            <Chip
              mode="outlined"
              style={{
                backgroundColor: `${getStatusColor(item.status)}20`,
                borderColor: getStatusColor(item.status),
              }}
              textStyle={{ color: getStatusColor(item.status) }}
            >
              {getStatusText(item.status)}
            </Chip>
            <Chip
              mode="outlined"
              style={styles.categoryChip}
            >
              {item.category}
            </Chip>
          </View>
        </View>

        <Text style={styles.itemDescription}>
          {item.description}
        </Text>

        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Icon name="category" size={16} color="#666" />
            <Text style={styles.detailText}>{item.itemType}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="schedule" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.category === 'lost' ? 'Lost' : 'Found'} on {formatDate(item.dateLostOrFound)}
            </Text>
          </View>

          {item.reward && (
            <View style={styles.detailRow}>
              <Icon name="star" size={16} color="#ff9800" />
              <Text style={styles.detailText}>Reward: {item.reward}</Text>
            </View>
          )}
        </View>

        <View style={styles.itemFooter}>
          <Text style={styles.dateText}>
            Posted {formatDate(item.createdAt)}
          </Text>
          {item.status === 'open' && item.category === 'found' && (
            <Button
              mode="contained"
              compact
              onPress={() => handleClaimItem(item)}
            >
              Claim Item
            </Button>
          )}
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
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search lost & found items..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Chip
          selected={selectedCategory === 'all'}
          onPress={() => setSelectedCategory('all')}
          style={styles.filterChip}
        >
          All Items
        </Chip>
        <Chip
          selected={selectedCategory === 'lost'}
          onPress={() => setSelectedCategory('lost')}
          style={styles.filterChip}
        >
          Lost
        </Chip>
        <Chip
          selected={selectedCategory === 'found'}
          onPress={() => setSelectedCategory('found')}
          style={styles.filterChip}
        >
          Found
        </Chip>
      </View>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItemCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="find-in-page" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'Check back later for new items'}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateLostFound')}
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
  searchContainer: {
    padding: 10,
  },
  searchBar: {
    elevation: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 10,
  },
  itemCard: {
    marginBottom: 10,
    elevation: 2,
  },
  itemHeader: {
    marginBottom: 8,
  },
  itemTitle: {
    flex: 1,
    marginRight: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    marginLeft: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  itemDetails: {
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
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
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

export default LostFoundScreen;

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  FAB,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AnnouncementsScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Icon name="campaign" size={64} color="#ff9800" style={styles.icon} />
            <Title style={styles.title}>Announcements</Title>
            <Text style={styles.subtitle}>
              Stay updated with campus news and notifications
            </Text>

            <Button
              mode="contained"
              onPress={() => {
                // Navigate to all announcements
              }}
              style={styles.button}
            >
              View All Announcements
            </Button>

            <Button
              mode="outlined"
              onPress={() => {
                // Navigate to urgent announcements
              }}
              style={styles.button}
            >
              Urgent Notices
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          // Navigate to create announcement (for faculty/admin)
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
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 20,
    elevation: 4,
  },
  cardContent: {
    alignItems: 'center',
    padding: 40,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    marginVertical: 5,
    width: '100%',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
});

export default AnnouncementsScreen;

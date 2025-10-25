import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Text,
  RadioButton,
  Chip,
  ActivityIndicator,
  Portal,
  Modal,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { lostFoundAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const CreateLostFoundScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'lost',
    itemType: '',
    location: '',
    dateLostOrFound: new Date().toISOString().split('T')[0],
    contactInfo: {
      email: user?.email || '',
      phone: user?.phone || '',
    },
    reward: '',
    tags: '',
    isUrgent: false,
  });
  const [loading, setLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const itemTypes = [
    'Electronics',
    'Documents',
    'Clothing',
    'Accessories',
    'Books',
    'Keys',
    'Wallet',
    'Other',
  ];

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.itemType || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      await lostFoundAPI.createItem(submitData);
      Alert.alert(
        'Success',
        'Your item has been posted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to post item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderImagePicker = () => (
    <Modal
      visible={imageModalVisible}
      onDismiss={() => setImageModalVisible(false)}
      contentContainerStyle={styles.modalContainer}
    >
      <Card>
        <Card.Title title="Add Photos" />
        <Card.Content>
          <Text>
            Camera integration will be implemented here. For now, you can continue without images.
          </Text>
          <Button
            mode="contained"
            onPress={() => setImageModalVisible(false)}
            style={styles.modalButton}
          >
            Continue
          </Button>
        </Card.Content>
      </Card>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Title style={styles.title}>Report Lost/Found Item</Title>
            <Text style={styles.subtitle}>
              Help the campus community by reporting lost or found items
            </Text>

            {/* Category Selection */}
            <Text style={styles.label}>Category *</Text>
            <RadioButton.Group
              value={formData.category}
              onValueChange={(value) => handleChange('category', value)}
            >
              <View style={styles.radioOption}>
                <RadioButton value="lost" />
                <Text style={styles.radioLabel}>Lost Item</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="found" />
                <Text style={styles.radioLabel}>Found Item</Text>
              </View>
            </RadioButton.Group>

            {/* Title */}
            <TextInput
              label="Item Title *"
              value={formData.title}
              onChangeText={(value) => handleChange('title', value)}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Blue Backpack, iPhone 12"
            />

            {/* Description */}
            <TextInput
              label="Description *"
              value={formData.description}
              onChangeText={(value) => handleChange('description', value)}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
              placeholder="Provide detailed description of the item..."
            />

            {/* Item Type */}
            <Text style={styles.label}>Item Type *</Text>
            <View style={styles.chipContainer}>
              {itemTypes.map((type) => (
                <Chip
                  key={type}
                  selected={formData.itemType === type}
                  onPress={() => handleChange('itemType', type)}
                  style={styles.typeChip}
                >
                  {type}
                </Chip>
              ))}
            </View>

            {/* Location */}
            <TextInput
              label="Location *"
              value={formData.location}
              onChangeText={(value) => handleChange('location', value)}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., Library, Block A, Cafeteria"
            />

            {/* Date */}
            <TextInput
              label={formData.category === 'lost' ? 'Date Lost' : 'Date Found'}
              value={formData.dateLostOrFound}
              onChangeText={(value) => handleChange('dateLostOrFound', value)}
              mode="outlined"
              style={styles.input}
              placeholder="Select date"
            />

            {/* Contact Information */}
            <Title style={styles.sectionTitle}>Contact Information</Title>
            <TextInput
              label="Email"
              value={formData.contactInfo.email}
              onChangeText={(value) => handleChange('contactInfo.email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Phone Number"
              value={formData.contactInfo.phone}
              onChangeText={(value) => handleChange('contactInfo.phone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />

            {/* Reward */}
            <TextInput
              label="Reward (Optional)"
              value={formData.reward}
              onChangeText={(value) => handleChange('reward', value)}
              mode="outlined"
              style={styles.input}
              placeholder="e.g., $50, Coffee, etc."
            />

            {/* Tags */}
            <TextInput
              label="Tags (Optional)"
              value={formData.tags}
              onChangeText={(value) => handleChange('tags', value)}
              mode="outlined"
              style={styles.input}
              placeholder="Separate tags with commas"
            />

            {/* Urgent Flag */}
            <View style={styles.urgentContainer}>
              <Chip
                selected={formData.isUrgent}
                onPress={() => handleChange('isUrgent', !formData.isUrgent)}
                style={formData.isUrgent ? styles.urgentChip : styles.normalChip}
              >
                <Icon name="warning" size={16} />
                Mark as Urgent
              </Chip>
            </View>

            {/* Images */}
            <Button
              mode="outlined"
              onPress={() => setImageModalVisible(true)}
              style={styles.imageButton}
            >
              <Icon name="camera-alt" size={16} />
              Add Photos (Coming Soon)
            </Button>

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator animating color="white" />
              ) : (
                'Post Item'
              )}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Image Picker Modal */}
      {renderImagePicker()}
    </KeyboardAvoidingView>
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
    margin: 10,
    elevation: 4,
  },
  cardContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  typeChip: {
    margin: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
  },
  urgentContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  urgentChip: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  normalChip: {
    backgroundColor: '#f5f5f5',
    borderColor: '#666',
  },
  imageButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalButton: {
    marginTop: 16,
  },
});

export default CreateLostFoundScreen;

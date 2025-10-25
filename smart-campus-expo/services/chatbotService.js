import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class ChatbotService {
  async sendMessage(message, token) {
    try {
      const response = await axios.post(`${API_BASE_URL}/chatbot`, {
        message
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Chatbot service error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send message to chatbot'
      };
    }
  }
}

export default new ChatbotService();

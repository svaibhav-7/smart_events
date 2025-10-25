import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class FeedbackService {
  async getFeedback(token, params = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/feedback`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Feedback service error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch feedback'
      };
    }
  }

  async createFeedback(token, feedbackData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/feedback`, feedbackData, {
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
      console.error('Create feedback error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create feedback'
      };
    }
  }

  async updateFeedback(token, feedbackId, updateData) {
    try {
      const response = await axios.put(`${API_BASE_URL}/feedback/${feedbackId}`, updateData, {
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
      console.error('Update feedback error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update feedback'
      };
    }
  }

  async deleteFeedback(token, feedbackId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/feedback/${feedbackId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Delete feedback error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete feedback'
      };
    }
  }

  async getPublicFeedback() {
    try {
      const response = await axios.get(`${API_BASE_URL}/feedback/public`);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Public feedback error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch public feedback'
      };
    }
  }

  async addResponse(token, feedbackId, response) {
    try {
      const responseData = await axios.post(`${API_BASE_URL}/feedback/${feedbackId}/response`, {
        response
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: responseData.data
      };
    } catch (error) {
      console.error('Add response error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add response'
      };
    }
  }

  async voteFeedback(token, feedbackId, voteType) {
    try {
      const response = await axios.post(`${API_BASE_URL}/feedback/${feedbackId}/vote`, {
        voteType
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
      console.error('Vote feedback error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to vote on feedback'
      };
    }
  }
}

export default new FeedbackService();

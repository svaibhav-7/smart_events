class ChatbotController {
  constructor() {
    // Google Generative AI integration (optional)
    this.genAI = null;
    this.model = null;
    this.useAI = false;

    // Try to initialize if package is available
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      if (process.env.GEMINI_API_KEY) {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        this.useAI = true;
        console.log('✓ Gemini AI initialized successfully');
      } else {
        console.log('⚠ Gemini API key not found, using fallback responses');
      }
    } catch (error) {
      console.log('⚠ Google Generative AI package not available:', error.message);
      console.log('  Using fallback responses');
    }
  }

  async sendMessage(req, res) {
    try {
      const { message } = req.body;

      console.log('Chatbot request received:', message);

      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }

      // Check if Gemini AI is available and initialized
      if (this.useAI && this.model) {
        try {
          console.log('Using Gemini AI for response');
          // Use Gemini API
          const campusPrompt = `
You are a helpful campus assistant for KLH University. You help students, faculty, and staff with:
- Campus information and navigation
- Event schedules and registration
- Lost and found items
- Club activities and meetings
- Academic policies and procedures
- Feedback and complaints
- General campus services

Please provide helpful, accurate, and concise responses. If you don't know something specific, suggest contacting the appropriate department.

User query: ${message}

Please respond in a friendly, professional manner as a campus assistant.`;

          const result = await this.model.generateContent(campusPrompt);
          const response = await result.response;
          const text = response.text();

          console.log('Gemini AI response generated successfully');

          return res.json({
            message: text,
            timestamp: new Date().toISOString(),
            source: 'ai',
            user: req.user ? {
              id: req.user._id,
              name: `${req.user.firstName} ${req.user.lastName}`,
              role: req.user.role
            } : null
          });
        } catch (aiError) {
          console.error('Gemini AI error:', aiError.message);
          console.log('Falling back to predefined responses');
          // Fall through to fallback responses
        }
      }
      // Fallback responses for common campus queries
      console.log('Using fallback responses');
      const fallbackResponse = this.getFallbackResponse(message);

      return res.json({
        message: fallbackResponse,
        timestamp: new Date().toISOString(),
        source: 'fallback',
        user: req.user ? {
          id: req.user._id,
          name: `${req.user.firstName} ${req.user.lastName}`,
          role: req.user.role
        } : null
      });

    } catch (error) {
      console.error('Chatbot error:', error.message);
      console.error('Stack:', error.stack);

      // Fallback response if everything fails
      const fallbackResponses = [
        "I'm sorry, I'm having trouble connecting to the campus information system right now. Please try again later or contact the campus administration office for assistance.",
        "I apologize, but I'm currently unable to process your request. Please reach out to the relevant department directly for help with your inquiry.",
        "There seems to be a technical issue with my connection. Please try asking again in a few moments, or contact campus support for immediate assistance."
      ];

      const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

      return res.status(500).json({
        message: fallbackResponse,
        timestamp: new Date().toISOString(),
        error: 'Chatbot service temporarily unavailable',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Event-related queries
    if (lowerMessage.includes('event') || lowerMessage.includes('schedule')) {
      return "I can help you find information about campus events. Please check the Events section in the app or visit the campus notice board for the latest event schedules.";
    }

    // Lost and found queries
    if (lowerMessage.includes('lost') || lowerMessage.includes('found') || lowerMessage.includes('missing')) {
      return "For lost and found items, please visit the Lost & Found section in the app or contact the campus security office. You can report lost items or check if your missing item has been found.";
    }

    // Club-related queries
    if (lowerMessage.includes('club') || lowerMessage.includes('organization') || lowerMessage.includes('society')) {
      return "You can find information about student clubs and organizations in the Clubs section. There are many active clubs for different interests including academic, cultural, sports, and technical activities.";
    }

    // Feedback queries
    if (lowerMessage.includes('feedback') || lowerMessage.includes('complaint') || lowerMessage.includes('suggestion')) {
      return "You can submit feedback, suggestions, or complaints through the Feedback section in the app. Your input helps us improve campus services and facilities.";
    }

    // Academic queries
    if (lowerMessage.includes('academic') || lowerMessage.includes('class') || lowerMessage.includes('grade')) {
      return "For academic-related questions, please contact your department office or academic advisor. You can also check the academic calendar and policies in the student handbook.";
    }

    // General campus information
    if (lowerMessage.includes('campus') || lowerMessage.includes('university') || lowerMessage.includes('klh')) {
      return "KLH University provides various services including academic support, student activities, campus facilities, and administrative services. Please visit the respective sections in the app for specific information.";
    }

    // Default response
    return "I'm here to help with campus-related questions. You can ask me about events, lost & found items, clubs, feedback, or general campus information. For specific questions, please contact the relevant department directly.";
  }
}

module.exports = new ChatbotController();

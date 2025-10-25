# Smart Campus Ecosystem

A unified digital platform for campus life activities, connecting students, faculty, and administration through a comprehensive web application and mobile app.

## 🌟 Features

### Core Modules
- **Lost & Found Management** - Report and claim lost items with photo uploads
- **Event Management** - Create, manage, and attend campus events
- **Feedback System** - Submit suggestions, complaints, and appreciation
- **Club Dashboards** - Manage student organizations and activities
- **Announcements** - Campus-wide communication system
- **Real-time Updates** - Live notifications and updates via WebSocket

### User Roles
- **Students** - Participate in events, join clubs, submit feedback
- **Faculty** - Create events, manage clubs, respond to feedback
- **Administrators** - Full system management and oversight

### Mobile Features
- **Push Notifications** - Real-time alerts for events and announcements
- **Camera Integration** - Upload photos for lost & found items
- **Offline Support** - Basic functionality without internet
- **Location Services** - GPS tagging for lost & found reports

## 🚀 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for database
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Cloudinary** for image storage
- **Nodemailer** for email notifications

### Web Frontend
- **React.js** with Material-UI
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for form handling
- **Socket.io Client** for real-time updates

### Mobile App
- **React Native** with React Native Paper
- **React Navigation** for navigation
- **AsyncStorage** for local storage
- **React Native Camera** for photo uploads
- **React Native Push Notifications** for alerts

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Android Studio (for mobile development)
- Xcode (for iOS development)

## 🛠️ Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update environment variables in `.env`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
CLIENT_URL=http://localhost:3000
# Add other required variables
```

5. Start the backend server:
```bash
npm run dev
```

### Web Frontend Setup

1. Navigate to the web directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The web application will be available at `http://localhost:3000`

### Mobile App Setup

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. For Android:
```bash
npm run android
```

4. For iOS:
```bash
npm run ios
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/smart-campus

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Client
CLIENT_URL=http://localhost:3000

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Push Notifications
FCM_SERVER_KEY=your-fcm-server-key
```

## 📱 Mobile App Features

### Core Screens
- **Dashboard** - Overview of campus activities
- **Events** - Browse and register for events
- **Lost & Found** - Report and claim items
- **Feedback** - Submit and track feedback
- **Clubs** - Join and manage clubs
- **Announcements** - View campus notices
- **Profile** - Manage user account

### Mobile-Specific Features
- Camera integration for photo uploads
- Push notifications for real-time updates
- Offline caching for basic functionality
- Location services for lost & found
- Native calendar integration

## 🌐 Web App Features

### Dashboard Views
- **Student Dashboard** - Events, clubs, and activities
- **Faculty Dashboard** - Event management, feedback responses
- **Admin Dashboard** - System management, user oversight

### Management Interfaces
- Event creation and management
- Club approval and oversight
- Feedback response system
- User management (Admin only)
- Announcement broadcasting

## 🔐 Authentication

The system supports three user roles:

1. **Students** - Can join events, clubs, and submit feedback
2. **Faculty** - Can create events, manage clubs, and respond to feedback
3. **Administrators** - Full system access and management capabilities

## 📊 Database Schema

### Core Models
- **Users** - Authentication and profile information
- **Events** - Campus events and registrations
- **LostFound** - Lost and found item reports
- **Feedback** - Suggestions and complaints
- **Clubs** - Student organizations
- **Announcements** - Campus-wide communications

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment variables
2. Use a process manager like PM2
3. Set up MongoDB in production
4. Configure SSL certificates

### Web Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to hosting platforms like:
   - **Render** (Recommended)
   - **Vercel**
   - **Netlify**
   - **Heroku**

### Mobile App Deployment
1. Generate release builds
2. Submit to app stores:
   - **Google Play Store** for Android
   - **App Store** for iOS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic authentication system
- ✅ Core modules (Events, Lost & Found, Feedback, Clubs)
- ✅ Web and mobile applications
- ✅ Real-time notifications

### Phase 2 (Planned)
- 🔄 Advanced search and filtering
- 🔄 Calendar integration
- 🔄 Offline mobile support
- 🔄 Chatbot integration (Gemini API)

### Phase 3 (Future)
- 🔄 AI-powered recommendations
- 🔄 Advanced analytics dashboard
- 🔄 Multi-campus support
- 🔄 Third-party integrations

## 📞 Contact

For any inquiries or support:
- Email: support@smartcampus.com
- Website: https://smartcampus.com
- Documentation: https://docs.smartcampus.com

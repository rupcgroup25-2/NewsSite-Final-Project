# NewsSite Final Project

A comprehensive news website with advanced features including real-time chat, text-to-speech, interactive world map, and push notifications system.

## 🚀 Features

### Core Functionality
- **Article Management**: Browse, read, save, and share news articles
- **User Authentication**: Registration, login, and profile management with image upload
- **Admin Panel**: Administrative dashboard for content and user management
- **Category Filtering**: Filter articles by different news categories
- **Search Functionality**: Guardian API integration for archive search
- **Responsive Design**: Mobile-friendly Bootstrap 5 interface

### Advanced Features
- **Text-to-Speech (TTS)**: Read articles aloud with multiple English voice options, pause/resume functionality
- **Real-time Chat**: Firebase-powered chat system for article discussions
- **Interactive World Map**: JQVMap integration with country selection and tooltips
- **Push Notifications**: Firebase Cloud Messaging (FCM) for real-time notifications
- **Profile System**: Complete user profiles with following system and activity tracking
- **Article Reporting**: Report inappropriate content with categorization
- **Dark/Light Theme**: Automatic and manual theme switching

## 📁 Project Structure
NewsSite-Final-Project/ ├── client/ │ └── news-moty/ │ ├── css/ │ │ ├── index.css # Main homepage styles │ │ ├── articlePage.css # Article reading page styles │ │ ├── profile.css # Profile page animations and styles │ │ ├── admin.css # Admin dashboard styles │ │ ├── notifications.css # Notification system styles │ │ └── login.css # Authentication modal styles │ ├── js/ │ │ ├── index.js # Homepage functionality and map │ │ ├── articlePage.js # Article reading, TTS, and chat │ │ ├── profile.js # User profiles and following system │ │ ├── admin.js # Admin dashboard management │ │ ├── notifications.js # FCM push notifications system │ │ ├── login.js # Login page functionality │ │ ├── saved.js # Saved articles management │ │ ├── firebaseConfig.js # Firebase configuration │ │ ├── countryCodesToNames.js # Country mapping for world map │ │ ├── vector_map_labels.js # Map labels configuration │ │ └── shared/ │ │ ├── auth.js # Authentication modals │ │ ├── navbar.js # Navigation bar component │ │ ├── footer.js # Footer component │ │ ├── ajaxCalls.js # AJAX communication with server │ │ └── articleActions.js # Article interaction functions │ ├── pages/ │ │ ├── article.html # Article reading page │ │ ├── admin.html # Admin dashboard │ │ ├── profile.html # User profile page │ │ ├── saved.html # Saved articles page │ │ └── about.html # About page │ ├── index.html # Main homepage │ ├── firebase-messaging-sw.js # Service worker for notifications │ └── package.json # Client dependencies └── Newsite-Server/ # C# .NET Server ├── Controllers/ # API controllers ├── BL/ # Business logic layer ├── DAL/ # Data access layer │ └── DBservices.cs # Database operations ├── Program.cs # Main server entry point ├── appsettings.json # Server configuration ├── firebase-service-account.json # Firebase admin credentials └── Newsite-Server.csproj # Server project file
## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3**: Modern semantic markup and styling
- **JavaScript (ES6+)**: Client-side functionality with async/await
- **jQuery 3.7.1**: DOM manipulation and AJAX requests
- **Bootstrap 5.3.2**: Responsive UI framework with dark mode support
- **JQVMap 1.5.1**: Interactive world map with country tooltips
- **Firebase SDK 12.0.0**: Real-time database and push notifications

### Backend
- **ASP.NET Core**: C# web API framework
- **SQL Server**: Database with stored procedures
- **Firebase Admin SDK**: Server-side Firebase operations
- **Entity Framework**: Database ORM

### External APIs & Services
- **Firebase Firestore**: Real-time chat message storage
- **Firebase Cloud Messaging (FCM)**: Push notifications
- **Cloudinary**: Profile image hosting and management
- **Web Speech API**: Text-to-speech functionality

## 🔧 Installation & Setup

### Prerequisites
- Visual Studio 2022 or VS Code
- SQL Server
- Firebase project setup

### Server Setup (.NET)
1. Open the solution in Visual Studio:
```bash
cd Newsite-Server
start Newsite-Server.sln

Configure appsettings.json:
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your_server;Database=myProjDB;Trusted_Connection=true;"
  },
  "Firebase": {
    "ProjectId": "your-firebase-project-id"
  }
}

Set up Firebase service account:

Download Firebase service account JSON
Place as firebase-service-account.json in project root
Run the server (F5 in Visual Studio)

Client Setup
Configure Firebase in js/firebaseConfig.js:

const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

Set up VAPID key for notifications in the same file:
const vapidKey = "your-vapid-key";
Serve the client files using a local server (Live Server extension in VS Code)
Database Setup
Use SQL Server Management Studio
Run the provided stored procedures:
sp_GetUserByEmailFinal
sp_GetUserByIdFinal
sp_GetUserNameByIdFinal
🎯 Key Features Implementation
Text-to-Speech System
Multi-voice Support: English voices (US, UK, AU) with visual indicators
Resume Functionality: Fixed resume issues for non-default voices by tracking text position
Word Highlighting: Visual feedback during speech with boundary events
Voice Selection: Dropdown with voice icons and region flags
Real-time Chat System
Firebase Integration: Firestore for message persistence
Article-specific Rooms: Unique chat rooms per article using unified IDs
User Authentication: Integrated with main user system
Message Timestamps: Real-time message ordering
Interactive World Map
JQVMap Integration: Vector-based world map with hover tooltips
Country Selection: Click functionality with fallback country list
Responsive Design: Modal-based map display
Country Code Mapping: ISO Alpha-2 to full country names
Push Notifications
FCM Integration: Firebase Cloud Messaging for cross-platform notifications
User Subscription: Automatic token management and server synchronization
Background Notifications: Service worker for background message handling
Notification Preferences: User-configurable notification settings
Profile System
Image Upload: Cloudinary integration with cache-busting
Following System: User-to-user following with activity feeds
Activity Tracking: Recent user actions and interactions
Profile Generation: AI-powered profile image generation
🔄 API Endpoints
User Management
GET /api/Users/GetUserByEmail - Get user by email
GET /api/Users/GetUserById - Get user by ID
POST /api/Users/Register - User registration
POST /api/Users/Login - User authentication
Articles
GET /api/Articles - Fetch articles with pagination
GET /api/Articles/{id} - Get specific article
POST /api/Articles/Save - Save article for user
DELETE /api/Articles/Unsave - Remove saved article
Notifications
POST /api/Notifications/SaveFCMToken - Save FCM token for user
POST /api/Notifications/SendTestNotification - Send test notification
POST /api/Notifications/TestDirectToken - Direct token testing
Admin
GET /api/Admin/GetAllUsers - User management
GET /api/Admin/GetUsersCount - Dashboard statistics
PUT /api/Admin/ToggleUserStatus - User activation/deactivation
🎨 UI/UX Features
Theme System
Bootstrap 5 Dark Mode: Native dark theme support
CSS Custom Properties: Dynamic color switching
User Preference: Persistent theme selection
System Detection: Automatic theme based on OS preference
Responsive Design
Mobile-First: Optimized for all screen sizes
Touch-Friendly: Large buttons and touch targets
Progressive Enhancement: Works without JavaScript
Animations
CSS Keyframes: Smooth slide-in animations for profile cards
Transition Effects: Hover states and loading indicators
Loading States: Visual feedback for async operations
🔒 Security Features
Authentication
JWT Tokens: Secure API authentication
Password Hashing: Server-side password security
Session Management: Automatic token refresh
Input Validation
Client-side: Real-time form validation
Server-side: Stored procedure parameter validation
XSS Prevention: Input sanitization
API Security
CORS Configuration: Controlled cross-origin requests
Rate Limiting: Protection against abuse
Admin Authorization: Protected administrative endpoints
📱 Browser Support
Required Features
ES6+ Support: Modern JavaScript features
Web Speech API: For text-to-speech functionality
Service Workers: For push notifications
Firebase Compatibility: Modern browser support
Tested Browsers
Chrome 88+
Firefox 85+
Safari 14+
Edge 88+
🐛 Known Issues & Solutions
Text-to-Speech Resume
Issue: Resume only worked with default voice
Solution: Implemented text position tracking and utterance recreation
Code: pausedAtIndex tracking in articlePage.js lines 803-824
Map Tooltips Z-Index
Issue: Tooltips appearing behind modal
Solution: Increased z-index and changed overflow settings
Code: CSS modifications in index.css for .country-map-container
FCM Token Persistence
Issue: Token not saving correctly to server
Solution: Added token save progress tracking and retry logic
Code: tokenSaveInProgress flag in notifications.js lines 583-607
🚀 Deployment
Production Configuration
Firebase: Update configuration for production project
Database: Configure production SQL Server connection
HTTPS: Ensure SSL certificates for notifications
CDN: Optimize static asset delivery
Environment Variables
{
  "Production": {
    "ConnectionStrings": {
      "DefaultConnection": "production-connection-string"
    },
    "Firebase": {
      "ProjectId": "production-project-id"
    }
  }
}
📊 Performance Optimizations
Client-Side
Lazy Loading: Deferred loading of non-critical scripts
Image Optimization: Cloudinary automatic optimization
Caching: Browser caching for static assets
Minification: Compressed CSS and JavaScript
Server-Side
Stored Procedures: Optimized database queries
Connection Pooling: Efficient database connections
Response Compression: Gzip compression for API responses
🤝 Development Guidelines
Code Structure
Modular JavaScript: Separate files for different functionality
Shared Components: Reusable navbar, footer, and auth components
CSS Organization: Feature-based stylesheet organization
Best Practices
Error Handling: Comprehensive try-catch blocks
Logging: Console logging for debugging
Documentation: Inline code comments in Hebrew and English
Version Control: Git with meaningful commit messages
📄 License
This project is an educational final project demonstrating full-stack web development capabilities.

👥 Technical Implementation Highlights
Real-time Communication: Firebase integration for chat and notifications
Advanced TTS: Multi-voice support with resume functionality
Interactive Mapping: Vector-based world map with country selection
Responsive UI: Modern Bootstrap 5 with dark mode support
Security: JWT authentication with role-based access control
Performance: Optimized database queries and client-side caching
Note: This project demonstrates comprehensive full-stack development skills including frontend JavaScript frameworks, backend .NET Core APIs, real-time database integration, push notification systems, and modern web development practices.

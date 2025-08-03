# NewsSite Final Project

A news website featuring user management, article reading, real-time chat, text-to-speech, interactive world map, push notifications, and more.

---

## 🚀 Main Features

### Core Functionality
- **Article Management**: Browse, read, save, and share news articles.
- **User Authentication**: Registration, login, and profile management with image upload.
- **Admin Panel**: Dashboard for managing users and content.
- **Category Filtering**: Filter articles by category.
- **Search Functionality**: Archive search (with Guardian API integration).
- **Responsive Design**: Mobile-friendly with Bootstrap 5.

### Advanced Features
- **Text-to-Speech (TTS)**: Read articles aloud with multiple English voices, including pause/resume.
- **Real-time Chat**: Article-specific chat using Firebase Firestore.
- **Interactive World Map**: JQVMap with country selection and tooltips.
- **Push Notifications**: Firebase Cloud Messaging (FCM) for real-time notifications.
- **Profile System**: Full user profiles, following system, and activity tracking.
- **Article Reporting**: Report inappropriate content.
- **Dark/Light Theme**: Automatic and manual theme switching.

---

## 📁 Project Structure

NewsSite-Final-Project/ ├── client/ │ └── news-moty/ │ ├── css/ │ │ ├── index.css │ │ ├── articlePage.css │ │ ├── profile.css │ │ ├── admin.css │ │ ├── notifications.css │ │ └── login.css │ ├── js/ │ │ ├── index.js │ │ ├── articlePage.js │ │ ├── profile.js │ │ ├── admin.js │ │ ├── notifications.js │ │ ├── login.js │ │ ├── saved.js │ │ ├── firebaseConfig.js │ │ ├── countryCodesToNames.js │ │ ├── vector_map_labels.js │ │ └── shared/ │ │ ├── auth.js │ │ ├── navbar.js │ │ ├── footer.js │ │ ├── ajaxCalls.js │ │ └── articleActions.js │ ├── pages/ │ │ ├── article.html │ │ ├── admin.html │ │ ├── profile.html │ │ ├── saved.html │ │ └── about.html │ ├── index.html │ ├── firebase-messaging-sw.js │ └── package.json └── Newsite-Server/ ├── Controllers/ ├── BL/ ├── DAL/ │ └── DBservices.cs ├── Program.cs ├── appsettings.json ├── firebase-service-account.json └── Newsite-Server.csproj
## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3**
- **JavaScript (ES6+)**
- **jQuery 3.7.1**
- **Bootstrap 5.3.2**
- **JQVMap 1.5.1**
- **Firebase SDK 12.0.0**

### Backend
- **ASP.NET Core (C#)**
- **SQL Server** (with stored procedures)
- **Firebase Admin SDK**
- **Entity Framework**

### External Services
- **Firebase Firestore** (chat)
- **Firebase Cloud Messaging** (notifications)
- **Cloudinary** (profile image storage)
- **Web Speech API** (TTS)

---

## 🔧 Installation & Setup

### Prerequisites
- Visual Studio 2022 or VS Code
- SQL Server
- Firebase project

### Server Setup
1. Open the solution in Visual Studio:
    ```bash
    cd Newsite-Server
    start Newsite-Server.sln
    ```
2. Edit `appsettings.json`:
    ```json
    {
      "ConnectionStrings": {
        "DefaultConnection": "Server=your_server;Database=myProjDB;Trusted_Connection=true;"
      },
      "Firebase": {
        "ProjectId": "your-firebase-project-id"
      }
    }
    ```
3. Download your Firebase service account JSON and place it as `firebase-service-account.json` in the server root.
4. Run the server (F5 in Visual Studio).

### Client Setup
1. Edit `js/firebaseConfig.js`:
    ```javascript
    const firebaseConfig = {
        apiKey: "your-api-key",
        authDomain: "your-project.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "123456789",
        appId: "your-app-id"
    };
    const vapidKey = "your-vapid-key";
    ```
2. Serve the client files using a static server (e.g., Live Server in VS Code).

### Database Setup
- Use SQL Server Management Studio.
- Run the provided stored procedures:
  - `sp_GetUserByEmailFinal`
  - `sp_GetUserByIdFinal`
  - `sp_GetUserNameByIdFinal`

---

## 🎯 Key Feature Implementation

- **TTS**: Multi-voice English support, resume for non-default voices (tracks text position).
- **Chat**: Firestore, per-article rooms, integrated with user system.
- **Interactive Map**: JQVMap, country names, selection, fallback country list.
- **Push Notifications**: FCM, token saving, user preferences.
- **Profile System**: Image upload (Cloudinary), following, recent activity.
- **UI/UX**: Bootstrap 5, dark/light mode, responsive, CSS animations.

---

## 🔄 API Examples

- `GET /api/Users/GetUserByEmail`
- `GET /api/Users/GetUserById`
- `POST /api/Users/Register`
- `POST /api/Users/Login`
- `GET /api/Articles`
- `GET /api/Articles/{id}`
- `POST /api/Articles/Save`
- `DELETE /api/Articles/Unsave`
- `POST /api/Notifications/SaveFCMToken`
- `POST /api/Notifications/SendTestNotification`
- `GET /api/Admin/GetAllUsers`
- `PUT /api/Admin/ToggleUserStatus`

---

## 🎨 UI/UX

- Bootstrap 5 with dark mode
- Fully responsive design
- CSS animations
- Progressive loading of assets

---

## 🔒 Security

- JWT for user authentication
- Client and server-side validation
- Admin route protection
- Secure session management

---

## 📱 Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+
- Requires: ES6, Web Speech API, Service Workers


---

## 📄 License

This project is an educational final project. All rights reserved.




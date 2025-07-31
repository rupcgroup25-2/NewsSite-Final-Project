# Firebase FCM 404 Error - פתרון שגיאה

## הבעיה
שגיאת 404 Not Found ב-Firebase Cloud Messaging מעידה על בעיה בחיבור לפרויקט Firebase או ב-API.

## פתרונות מומלצים (בסדר עדיפות):

### 1. ✅ בדיקת Firebase Console
- גש ל-[Firebase Console](https://console.firebase.google.com/)
- ודא שהפרויקט `newspapersite-ruppin` קיים ופעיל
- בדוק שה-Cloud Messaging API מופעל תחת **Project Settings > Cloud Messaging**

### 2. ✅ בדיקת Google Cloud Console
- גש ל-[Google Cloud Console](https://console.cloud.google.com/)
- בחר את הפרויקט `newspapersite-ruppin`
- עבור ל-**APIs & Services > Enabled APIs**
- ודא שה-APIs הבאים מופעלים:
  - Firebase Cloud Messaging API
  - Firebase Admin SDK API
  - Identity and Access Management (IAM) API

### 3. ✅ בדיקת Service Account
```bash
# בדוק את תוכן הקובץ
Get-Content "firebase-service-account.json" | ConvertFrom-Json | Select-Object project_id, client_email
```

### 4. ✅ בדיקת הרשאות Service Account
ב-Google Cloud Console:
- עבור ל-**IAM & Admin > IAM**
- חפש את ה-service account: `firebase-adminsdk-fbsvc@newspapersite-ruppin.iam.gserviceaccount.com`
- ודא שיש לו את התפקידים:
  - Firebase Admin SDK Administrator Service Agent
  - Cloud Messaging Service Agent (אם קיים)

### 5. ✅ בדיקת Billing
- ודא שהפרויקט מחובר לחשבון חיוב פעיל
- בפרויקטים עם שימוש גבוה, FCM דורש חיוב מופעל

### 6. ✅ בדיקה אם הפרויקט לא נמחק
לפעמים פרויקטים נמחקים ונשארים ב-"לוח המחזור":
- עבור ל-[Firebase Console](https://console.firebase.google.com/)
- לחץ על "View deleted projects"
- אם הפרויקט שם, שחזר אותו

### 7. ✅ בדיקת מפתח API
```javascript
// בדוק ב-firebaseConfig.js שה-API Key תקין
const firebaseConfig = {
    apiKey: "AIzaSyBNmhr9BYmpGC0jLG9TFCoR3rCNKI8IPIM", // ודא שזה נכון
    projectId: "newspapersite-ruppin"
};
```

### 8. ✅ יצירת Service Account חדש (אם נדרש)
אם הבעיה נמשכת:
1. עבור לGoogle Cloud Console
2. **IAM & Admin > Service Accounts**
3. צור service account חדש עם התפקיד Firebase Admin SDK Administrator
4. הורד מפתח חדש ועדכן את `firebase-service-account.json`

## בדיקות נוספות

### בדיקה 1: Test API Endpoint
```bash
# בדוק אם ה-API נגיש
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://fcm.googleapis.com/v1/projects/newspapersite-ruppin/messages:send"
```

### בדיקה 2: רץ את הcontroller החדש
1. הפעל את השרת
2. גש ל-`http://localhost:YOUR_PORT/api/FirebaseTest/test-connection`
3. בדוק את התוצאה

### בדיקה 3: לוגים מפורטים
הוסף את הקוד הבא ל-Program.cs:
```csharp
// הוספה לתחילת הקובץ
using Google.Cloud.Diagnostics.Common;

// לפני builder.Build()
builder.Logging.SetMinimumLevel(LogLevel.Debug);
```

## אם כלום לא עוזר
1. צור פרויקט Firebase חדש זמנית
2. צור service account חדש
3. בדוק אם זה עובד עם הפרויקט החדש
4. אם כן, הבעיה בפרויקט המקורי

## קישורים שימושיים
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Service Account Documentation](https://cloud.google.com/iam/docs/service-accounts)

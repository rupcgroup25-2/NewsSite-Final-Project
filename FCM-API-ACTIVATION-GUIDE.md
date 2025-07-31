# 🔥 Firebase FCM API Activation Guide

## הפעלת FCM API ב-Google Cloud Console

### שלב 1: כניסה ל-Google Cloud Console
1. לך ל: https://console.cloud.google.com/
2. וודא שהפרויקט הנבחר הוא: **newspapersite-ruppin**

### שלב 2: הפעלת Firebase Cloud Messaging API
1. לך ל: https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=newspapersite-ruppin
2. לחץ על **"ENABLE"** כדי להפעיל את ה-API
3. חכה עד שהסטטוס יתעדכן ל-"Enabled"

### שלב 3: הפעלת Firebase Management API (נוסף)
1. לך ל: https://console.cloud.google.com/apis/library/firebase.googleapis.com?project=newspapersite-ruppin
2. לחץ על **"ENABLE"** כדי להפעיל את ה-API
3. חכה עד שהסטטוס יתעדכן ל-"Enabled"

### שלב 4: בדיקת Billing (חשוב!)
1. לך ל: https://console.cloud.google.com/billing?project=newspapersite-ruppin
2. וודא שהפרויקט מחובר לחשבון billing פעיל
3. אם אין - צרף חשבון billing (Firebase דורש billing account)

### שלב 5: בדיקת הרשאות Service Account
1. לך ל: https://console.cloud.google.com/iam-admin/iam?project=newspapersite-ruppin
2. חפש את ה-service account: `firebase-adminsdk-...@newspapersite-ruppin.iam.gserviceaccount.com`
3. וודא שיש לו את התפקידים:
   - **Firebase Admin SDK Administrator Service Agent**
   - **Cloud Messaging Admin** (אם קיים)

### שלב 6: אימות במסוף Firebase
1. לך ל: https://console.firebase.google.com/project/newspapersite-ruppin
2. לך ל **Project settings > Cloud Messaging**
3. וודא שיש **Server key** ו-**Sender ID**
4. וודא שה-VAPID key תואם לזה שבקוד

### שלב 7: המתן להפצה
⏳ **חשוב**: אחרי הפעלת ה-APIs, חכה 5-10 דקות עד שהשינויים יתפשטו בכל השרתים של Google.

## 🧪 בדיקה אחרי ההפעלה
1. חזור לכלי הדיאגנוסטיקה
2. הרץ את "Test Notification"
3. בדוק את הלוגים לשגיאות

## ⚠️ אם עדיין יש בעיות
- בדוק שה-service account key עדיין תקף
- נסה ליצור service account key חדש
- וודא שהפרויקט לא הושעה או נחסם

## 📞 קישורים מהירים
- Firebase Console: https://console.firebase.google.com/project/newspapersite-ruppin
- Google Cloud Console: https://console.cloud.google.com/?project=newspapersite-ruppin
- FCM API: https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=newspapersite-ruppin

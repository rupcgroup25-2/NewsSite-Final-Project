using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using Newtonsoft.Json;
using Newsite_Server.DAL;
using Google.Apis.Auth.OAuth2;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;

namespace Newsite_Server.Services
{
    public class NotificationService
    {
        private readonly DBservices dbServices;
        private static bool isFirebaseInitialized = false;

        public NotificationService()
        {
            dbServices = new DBservices();
            
            // אתחול Firebase Admin SDK אם עדיין לא אותחל
            if (!isFirebaseInitialized)
            {
                try
                {
                    Console.WriteLine("🔥 Initializing Firebase Admin SDK...");
                    
                    // בדוק אם יש כבר FirebaseApp
                    if (FirebaseApp.DefaultInstance == null)
                    {
                        var serviceAccountPath = Path.Combine(Directory.GetCurrentDirectory(), "firebase-service-account.json");
                        
                        if (!File.Exists(serviceAccountPath))
                        {
                            throw new FileNotFoundException($"Firebase service account file not found at: {serviceAccountPath}");
                        }
                        
                        Console.WriteLine($"📁 Loading service account from: {serviceAccountPath}");
                        var credential = GoogleCredential.FromFile(serviceAccountPath);
                        
                        // הוספת ProjectId מפורש - זה קריטי!
                        var options = new AppOptions()
                        {
                            Credential = credential,
                            ProjectId = "newspapersite-ruppin"  // Project ID מפורש
                        };
                        
                        FirebaseApp.Create(options);
                        Console.WriteLine($"✅ Firebase Admin SDK initialized successfully for project: {options.ProjectId}");
                    }
                    else
                    {
                        Console.WriteLine("✅ Firebase Admin SDK already initialized");
                        Console.WriteLine($"📍 Project ID: {FirebaseApp.DefaultInstance.Options.ProjectId}");
                    }
                    isFirebaseInitialized = true;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error initializing Firebase Admin SDK: {ex.Message}");
                    Console.WriteLine($"📋 Stack trace: {ex.StackTrace}");
                }
            }
        }

        // בדיקת חיבור ל-Firebase
        private async Task TestFirebaseConnection()
        {
            try
            {
                Console.WriteLine("🔍 Testing Firebase connection...");
                
                // יצירת הודעה בסיסית לבדיקה
                var testMessage = new Message()
                {
                    Token = "test-token-that-will-fail", // טוקן מזויף לבדיקה
                    Notification = new Notification()
                    {
                        Title = "Test Connection",
                        Body = "Testing Firebase connectivity"
                    }
                };

                try
                {
                    // נסיון שליחה (צפוי להיכשל אבל יבדוק את החיבור)
                    await FirebaseMessaging.DefaultInstance.SendAsync(testMessage);
                }
                catch (FirebaseMessagingException ex)
                {
                    // אם זה שגיאת טוקן לא תקין, אז החיבור תקין
                    if (ex.Message.Contains("registration-token-not-registered") || 
                        ex.Message.Contains("invalid-registration-token"))
                    {
                        Console.WriteLine("✅ Firebase connection test successful (invalid token as expected)");
                        return;
                    }
                    else if (ex.Message.Contains("404") || ex.Message.Contains("Not Found"))
                    {
                        Console.WriteLine("❌ Firebase 404 error - possible project issues:");
                        Console.WriteLine("   1. Check if Firebase project 'newspapersite-ruppin' exists");
                        Console.WriteLine("   2. Verify FCM API is enabled in Firebase Console");
                        Console.WriteLine("   3. Check service account permissions");
                        throw new Exception($"Firebase project not found or FCM API disabled: {ex.Message}");
                    }
                    else
                    {
                        Console.WriteLine($"❌ Firebase connection test failed: {ex.Message}");
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Firebase connection test error: {ex.Message}");
                throw;
            }
        }

        // שלח התראה למשתמש ספציפי
        public async Task<bool> SendNotificationToUser(int userId, string title, string body, Dictionary<string, string> data = null)
        {
            var tokens = dbServices.GetFCMTokensForUsers(new List<int> { userId });
            return await SendNotificationToTokens(tokens, title, body, data);
        }

        // שלח התראה לרשימת משתמשים
        public async Task<bool> SendNotificationToUsers(List<int> userIds, string title, string body, Dictionary<string, string> data = null)
        {
            if (userIds == null || userIds.Count == 0)
                return false;

            var tokens = dbServices.GetFCMTokensForUsers(userIds);
            return await SendNotificationToTokens(tokens, title, body, data);
        }

        // שלח התראה לטוקנים ספציפיים
        private async Task<bool> SendNotificationToTokens(List<string> tokens, string title, string body, Dictionary<string, string> data = null)
        {
            if (tokens == null || tokens.Count == 0)
            {
                Console.WriteLine("No FCM tokens found");
                return false;
            }

            try
            {
                Console.WriteLine($"🚀 Sending notification to {tokens.Count} tokens");
                Console.WriteLine($"📋 Title: {title}");
                Console.WriteLine($"📋 Body: {body}");
                
                // בדיקה שFirebase מאותחל כמו שצריך
                if (FirebaseApp.DefaultInstance == null)
                {
                    Console.WriteLine("❌ Firebase not initialized!");
                    return false;
                }
                
                Console.WriteLine($"✅ Firebase Project ID: {FirebaseApp.DefaultInstance.Options.ProjectId}");
                
                // בדיקת חיבור Firebase לפני שליחה
                await TestFirebaseConnection();
                
                var message = new MulticastMessage()
                {
                    Tokens = tokens,
                    Notification = new Notification()
                    {
                        Title = title,
                        Body = body
                        // הסרנו את ImageUrl כדי למנוע שגיאות עם נתיבים יחסיים
                    },
                    Data = data ?? new Dictionary<string, string>(),
                    Android = new AndroidConfig()
                    {
                        Notification = new AndroidNotification()
                        {
                            ClickAction = "FCM_PLUGIN_ACTIVITY",
                            Icon = "newsSite" // שם האייקון בלבד, לא נתיב מלא
                        }
                    },
                    Webpush = new WebpushConfig()
                    {
                        Notification = new WebpushNotification()
                        {
                            Icon = "/news-moty/public/newsSite.png",
                            Badge = "/news-moty/public/newsSite.png"
                        }
                    }
                };

                Console.WriteLine($"📦 Message prepared. Sending to Firebase...");
                Console.WriteLine($"🎯 Sample tokens: {string.Join(", ", tokens.Take(2))}...");
                
                var response = await FirebaseMessaging.DefaultInstance.SendMulticastAsync(message);
                
                Console.WriteLine($"📨 Firebase Response - Success: {response.SuccessCount}, Failures: {response.FailureCount}");
                
                if (response.SuccessCount > 0)
                {
                    Console.WriteLine($"✅ Notification sent successfully to {response.SuccessCount} devices");
                    
                    // הדפסת שגיאות אם יש
                    if (response.FailureCount > 0)
                    {
                        Console.WriteLine($"⚠️ Some failures occurred:");
                        for (int i = 0; i < response.Responses.Count; i++)
                        {
                            if (!response.Responses[i].IsSuccess)
                            {
                                Console.WriteLine($"  ❌ Token {i}: {response.Responses[i].Exception?.Message}");
                            }
                        }
                    }
                    return true;
                }
                else
                {
                    Console.WriteLine($"❌ Failed to send notification. All {response.FailureCount} attempts failed");
                    
                    // הדפסת כל השגיאות
                    for (int i = 0; i < response.Responses.Count; i++)
                    {
                        if (!response.Responses[i].IsSuccess)
                        {
                            Console.WriteLine($"  ❌ Token {i}: {response.Responses[i].Exception?.Message}");
                        }
                    }
                    return false;
                }
            }
            catch (FirebaseMessagingException fex)
            {
                Console.WriteLine($"🔥 Firebase Messaging Exception: {fex.Message}");
                Console.WriteLine($"📋 Error Code: {fex.ErrorCode}");
                Console.WriteLine($"📋 Stack Trace: {fex.StackTrace}");
                
                // בדיקה ספציפית לשגיאת 404
                if (fex.Message.Contains("404") || fex.Message.Contains("Not Found"))
                {
                    Console.WriteLine("❌ Firebase 404 Error Detected!");
                    Console.WriteLine("🔧 Possible solutions:");
                    Console.WriteLine("   1. Verify Firebase project 'newspapersite-ruppin' exists and is active");
                    Console.WriteLine("   2. Check that Cloud Messaging API (FCM) is enabled in Google Cloud Console");
                    Console.WriteLine("   3. Verify service account has proper permissions (Firebase Admin SDK Admin Service Agent)");
                    Console.WriteLine("   4. Check if billing is enabled for the Firebase project");
                    Console.WriteLine("   5. Ensure the project ID in service account matches the actual project");
                }
                
                if (fex.InnerException != null)
                {
                    Console.WriteLine($"🔍 Inner Exception: {fex.InnerException.Message}");
                    if (fex.InnerException.InnerException != null)
                    {
                        Console.WriteLine($"🔍 Inner Inner Exception: {fex.InnerException.InnerException.Message}");
                    }
                }
                
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ General Exception in SendNotificationToTokens: {ex.Message}");
                Console.WriteLine($"📋 Type: {ex.GetType().Name}");
                Console.WriteLine($"📋 Stack Trace: {ex.StackTrace}");
                
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"🔍 Inner Exception: {ex.InnerException.Message}");
                    Console.WriteLine($"🔍 Inner Type: {ex.InnerException.GetType().Name}");
                }
                
                return false;
            }
        }

        // התראה על תגובה חדשה
        public async Task NotifyNewComment(int articleId, string articleTitle, int commenterId, string commenterName)
        {
            var interestedUsers = dbServices.GetUsersWhoCommentedOnArticle(articleId, commenterId);
            
            if (interestedUsers.Count > 0)
            {
                var data = new Dictionary<string, string>
                {
                    {"type", "new_comment"},
                    {"articleId", articleId.ToString()},
                    {"url", $"/article.html?id={articleId}"}
                };

                await SendNotificationToUsers(
                    interestedUsers,
                    "New Comment",
                    $"{commenterName} commented on \"{articleTitle}\"",
                    data
                );
            }
        }

        // התראה על שיתוף כתבה
        public async Task NotifyArticleShared(int sharerId, string sharerName, string articleTitle, List<int> followerIds)
        {
            if (followerIds != null && followerIds.Count > 0)
            {
                var data = new Dictionary<string, string>
                {
                    {"type", "article_shared"},
                    {"sharerId", sharerId.ToString()},
                    {"url", "/shared.html"}
                };

                await SendNotificationToUsers(
                    followerIds,
                    "New Shared Article",
                    $"{sharerName} shared: \"{articleTitle}\"",
                    data
                );
            }
        }

        // התראה על עדכון מערכת
        public async Task NotifySystemUpdate(string title, string message, List<int> userIds = null)
        {
            var data = new Dictionary<string, string>
            {
                {"type", "system_update"},
                {"url", "/"}
            };

            if (userIds != null && userIds.Count > 0)
            {
                await SendNotificationToUsers(userIds, title, message, data);
            }
            else
            {
                var allActiveUsers = dbServices.GetAllActiveUserIds();
                await SendNotificationToUsers(allActiveUsers, title, message, data);
            }
        }
    }
}
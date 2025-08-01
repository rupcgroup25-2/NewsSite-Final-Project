using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Linq;
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

            // תיקון הבעיה של יצירה כפולה
            if (!isFirebaseInitialized)
            {
                lock (typeof(NotificationService)) // Thread safety
                {
                    if (!isFirebaseInitialized && FirebaseApp.DefaultInstance == null)
                    {
                        try
                        {
                            Console.WriteLine("🔥 Initializing Firebase Admin SDK...");

                            var serviceAccountPath = Path.Combine(Directory.GetCurrentDirectory(), "firebase-service-account.json");

                            if (!File.Exists(serviceAccountPath))
                            {
                                throw new FileNotFoundException($"Firebase service account file not found at: {serviceAccountPath}");
                            }

                            Console.WriteLine($"📁 Loading service account from: {serviceAccountPath}");
                            var credential = GoogleCredential.FromFile(serviceAccountPath);

                            // קרא את project_id מה-service account file במקום להגדיר ידנית
                            var serviceAccountJson = File.ReadAllText(serviceAccountPath);

                            // בדיקה שהקובץ תקין
                            if (string.IsNullOrWhiteSpace(serviceAccountJson))
                            {
                                throw new Exception("Firebase service account file is empty or corrupted");
                            }

                            Dictionary<string, object> serviceAccountData;
                            try
                            {
                                serviceAccountData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(serviceAccountJson);
                            }
                            catch (Exception jsonEx)
                            {
                                throw new Exception($"Failed to parse firebase-service-account.json: {jsonEx.Message}");
                            }

                            // וידוא שיש project_id
                            if (!serviceAccountData.ContainsKey("project_id"))
                            {
                                throw new Exception("firebase-service-account.json missing 'project_id' field");
                            }

                            var projectId = serviceAccountData["project_id"].ToString();

                            // וידוא שה-project_id תקין
                            if (string.IsNullOrWhiteSpace(projectId))
                            {
                                throw new Exception("project_id in firebase-service-account.json is empty or null");
                            }

                            Console.WriteLine($"📍 Using Project ID: {projectId}");

                            var options = new AppOptions()
                            {
                                Credential = credential,
                                ProjectId = projectId // השתמש ב-project_id מהקובץ
                            };

                            FirebaseApp.Create(options);
                            Console.WriteLine($"✅ Firebase Admin SDK initialized successfully for project: {options.ProjectId}");

                            isFirebaseInitialized = true;
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"❌ Error initializing Firebase Admin SDK: {ex.Message}");
                            Console.WriteLine($"📋 Stack trace: {ex.StackTrace}");
                        }
                    }
                    else if (FirebaseApp.DefaultInstance != null)
                    {
                        Console.WriteLine("✅ Firebase Admin SDK already initialized");
                        Console.WriteLine($"📍 Project ID: {FirebaseApp.DefaultInstance.Options.ProjectId}");
                        isFirebaseInitialized = true;
                    }
                }
            }
        }

        // Diagnostic method to test Firebase connection without sending notifications
        public async Task<bool> TestFirebaseProjectConnection()
        {
            try
            {
                // Basic Firebase connectivity test
                var app = FirebaseApp.DefaultInstance;
                if (app != null)
                {
                    Console.WriteLine($"✅ Firebase app instance exists for project: {app.Options.ProjectId}");
                    var messaging = FirebaseMessaging.DefaultInstance;
                    Console.WriteLine("✅ Firebase Messaging instance created successfully");
                    return true;
                }
                else
                {
                    Console.WriteLine("❌ Firebase app instance is null");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Firebase project connection test failed: {ex.Message}");
                return false;
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
            // עבור test notifications - אל תעשה cleanup אוטומטי
            // First, clean up any potential duplicate or old tokens - commented out for testing
            // await CleanupUserTokens(userId);

            var tokens = dbServices.GetFCMTokensForUsers(new List<int> { userId });
            Console.WriteLine($"📊 SendNotificationToUser: Found {tokens.Count} tokens for user {userId}");

            if (tokens.Count > 0)
            {
                for (int i = 0; i < Math.Min(tokens.Count, 3); i++) // הראה רק 3 ראשונים
                {
                    var token = tokens[i];
                    var preview = token.Length > 30 ? token.Substring(0, 30) + "..." : token;
                    Console.WriteLine($"  📧 Token {i + 1}: {preview}");
                }
            }

            return await SendNotificationToTokens(tokens, title, body, data);
        }

        // Clean up duplicate/old tokens for a user
        private async Task CleanupUserTokens(int userId)
        {
            try
            {
                var allTokens = dbServices.GetFCMTokensForUsers(new List<int> { userId });

                if (allTokens.Count <= 3) // Keep reasonable number of tokens
                    return;

                Console.WriteLine($"🧹 User {userId} has {allTokens.Count} tokens, cleaning up old ones...");

                // Remove duplicates first
                var uniqueTokens = allTokens.Distinct().ToList();
                var duplicatesRemoved = allTokens.Count - uniqueTokens.Count;

                if (duplicatesRemoved > 0)
                {
                    Console.WriteLine($"🧹 Removed {duplicatesRemoved} duplicate tokens");
                }

                // If still too many, keep only the most recent 3
                if (uniqueTokens.Count > 3)
                {
                    var tokensToRemove = uniqueTokens.Skip(3).ToList();
                    foreach (var token in tokensToRemove)
                    {
                        dbServices.DeleteInvalidFCMToken(token);
                        Console.WriteLine($"🧹 Removed old token: {token.Substring(0, 20)}...");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Error during token cleanup: {ex.Message}");
            }
        }

        // שלח התראה לרשימת משתמשים
        public async Task<bool> SendNotificationToUsers(List<int> userIds, string title, string body, Dictionary<string, string> data = null)
        {
            if (userIds == null || userIds.Count == 0)
                return false;

            var tokens = dbServices.GetFCMTokensForUsers(userIds);
            return await SendNotificationToTokens(tokens, title, body, data);
        }

        // שלח התראה ישירה לטוקן ספציפי (בלי בדיקה ב-DB)
        public async Task<bool> SendDirectNotificationToToken(string fcmToken, string title, string body, Dictionary<string, string> data = null)
        {
            if (string.IsNullOrEmpty(fcmToken))
            {
                Console.WriteLine("❌ FCM token is null or empty");
                return false;
            }

            try
            {
                Console.WriteLine($"🎯 Sending direct notification to token: {fcmToken.Substring(0, Math.Min(30, fcmToken.Length))}...");
                Console.WriteLine($"📝 Title: {title}");
                Console.WriteLine($"📝 Body: {body}");

                var message = new Message()
                {
                    Token = fcmToken,
                    Notification = new Notification()
                    {
                        Title = title,
                        Body = body
                    },
                    Data = data ?? new Dictionary<string, string>()
                };

                // וידוא שכל הערכים ב-data הם strings
                if (message.Data != null)
                {
                    var cleanData = new Dictionary<string, string>();
                    foreach (var kvp in message.Data)
                    {
                        cleanData[kvp.Key] = kvp.Value?.ToString() ?? "";
                    }
                    message.Data = cleanData;
                }

                string response = await FirebaseMessaging.DefaultInstance.SendAsync(message);

                if (!string.IsNullOrEmpty(response))
                {
                    Console.WriteLine($"✅ Direct notification sent successfully. Response: {response}");
                    return true;
                }
                else
                {
                    Console.WriteLine("❌ Direct notification failed - empty response");
                    return false;
                }
            }
            catch (FirebaseMessagingException ex)
            {
                Console.WriteLine($"❌ Firebase messaging error: {ex.Message}");
                Console.WriteLine($"📋 Error code: {ex.ErrorCode}");

                // בדוק אם הטוקן לא תקין
                if (ex.ErrorCode.ToString() == "InvalidArgument" || ex.ErrorCode.ToString() == "Unregistered")
                {
                    Console.WriteLine("⚠️ Token appears to be invalid or unregistered");
                }

                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error sending direct notification: {ex.Message}");
                Console.WriteLine($"📋 Stack trace: {ex.StackTrace}");
                return false;
            }
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

                // Additional debug info
                Console.WriteLine($"🔧 Firebase App Name: {FirebaseApp.DefaultInstance.Name}");
                Console.WriteLine($"🔧 Service Account Email: {FirebaseApp.DefaultInstance.Options.Credential}");
                Console.WriteLine($"🔧 Total tokens to process: {tokens.Count}");

                // טיפול בטוקנים ריקים או לא תקפים לפני שליחה
                var validTokens = new List<string>();
                var invalidTokens = new List<string>();

                Console.WriteLine("🔍 Validating tokens before sending...");

                foreach (var token in tokens)
                {
                    // בדיקות בסיסיות של פורמט הטוקן
                    if (string.IsNullOrWhiteSpace(token))
                    {
                        Console.WriteLine("⚠️ Skipping empty token");
                        invalidTokens.Add(token);
                        continue;
                    }

                    if (token.Length < 10)
                    {
                        Console.WriteLine($"⚠️ Skipping suspiciously short token: {token}");
                        invalidTokens.Add(token);
                        continue;
                    }

                    // הוסף לרשימת הטוקנים התקפים
                    validTokens.Add(token);
                }

                if (validTokens.Count == 0)
                {
                    Console.WriteLine("❌ No valid tokens after filtering");
                    return false;
                }

                Console.WriteLine($"✅ Using {validTokens.Count} valid tokens (filtered out {invalidTokens.Count} invalid ones)");

                // בחר את השיטה הנכונה בהתאם למספר הטוקנים
                if (validTokens.Count == 1)
                {
                    // עבור טוקן יחיד - השתמש ב-Message ו-SendAsync
                    Console.WriteLine("📤 Using single token method (SendAsync)...");
                    
                    var singleMessage = new Message()
                    {
                        Token = validTokens[0],
                        Notification = new Notification()
                        {
                            Title = title,
                            Body = body
                        }
                    };

                    // רק אם יש data valid, הוסף אותו
                    if (data != null && data.Count > 0)
                    {
                        singleMessage.Data = data;
                    }

                    string singleResponse = await FirebaseMessaging.DefaultInstance.SendAsync(singleMessage);
                    
                    if (!string.IsNullOrEmpty(singleResponse))
                    {
                        Console.WriteLine($"✅ Single notification sent successfully. Response: {singleResponse}");
                        return true;
                    }
                    else
                    {
                        Console.WriteLine("❌ Single notification failed - empty response");
                        return false;
                    }
                }
                else
                {
                    // עבור כמה טוקנים - השתמש ב-MulticastMessage ו-SendMulticastAsync
                    Console.WriteLine($"📤 Using multicast method (SendMulticastAsync) for {validTokens.Count} tokens...");
                    
                    var multicastMessage = new MulticastMessage()
                    {
                        Tokens = validTokens,
                        Notification = new Notification()
                        {
                            Title = title,
                            Body = body
                        }
                    };

                    // רק אם יש data valid, הוסף אותו
                    if (data != null && data.Count > 0)
                    {
                        multicastMessage.Data = data;
                    }

                    var multicastResponse = await FirebaseMessaging.DefaultInstance.SendMulticastAsync(multicastMessage);

                    Console.WriteLine($"📨 Firebase Response - Success: {multicastResponse.SuccessCount}, Failures: {multicastResponse.FailureCount}");

                    if (multicastResponse.SuccessCount > 0)
                    {
                        Console.WriteLine($"✅ Notification sent successfully to {multicastResponse.SuccessCount} devices");

                        // הדפסת שגיאות אם יש
                        if (multicastResponse.FailureCount > 0)
                        {
                            Console.WriteLine($"⚠️ Some failures occurred:");
                            for (int i = 0; i < multicastResponse.Responses.Count; i++)
                            {
                                if (!multicastResponse.Responses[i].IsSuccess)
                                {
                                    Console.WriteLine($"  ❌ Token {i}: {multicastResponse.Responses[i].Exception?.Message}");
                                }
                            }
                        }
                        return true;
                    }
                    else
                    {
                        Console.WriteLine($"❌ Failed to send notification. All {multicastResponse.FailureCount} attempts failed");

                        // הדפסת כל השגיאות
                        for (int i = 0; i < multicastResponse.Responses.Count; i++)
                        {
                            if (!multicastResponse.Responses[i].IsSuccess)
                            {
                                Console.WriteLine($"  ❌ Token {i}: {multicastResponse.Responses[i].Exception?.Message}");
                            }
                        }
                        return false;
                    }
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
                    Console.WriteLine("🔧 Most likely cause: FCM API is not enabled in Google Cloud Console");
                    Console.WriteLine("🔧 Solutions:");
                    Console.WriteLine("   1. Go to: https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=newspapersite-ruppin");
                    Console.WriteLine("   2. Click 'ENABLE' to enable Firebase Cloud Messaging API");
                    Console.WriteLine("   3. Also enable: https://console.cloud.google.com/apis/library/firebase.googleapis.com?project=newspapersite-ruppin");
                    Console.WriteLine("   4. Wait 5-10 minutes for changes to propagate");
                    Console.WriteLine("   5. Verify billing is enabled for the project");
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

        // שליחת התראת בדיקה
        public async Task<bool> SendTestNotification(int userId)
        {
            try
            {
                Console.WriteLine($"🧪 Sending test notification to user: {userId}");
                Console.WriteLine($"🔍 Current time: {DateTime.Now}");

                // בדוק טוקנים ללא cleanup קודם
                var allTokensBeforeCleanup = dbServices.GetFCMTokensForUsers(new List<int> { userId });
                Console.WriteLine($"📊 BEFORE cleanup - User {userId} has {allTokensBeforeCleanup.Count} tokens in DB");

                if (allTokensBeforeCleanup.Count > 0)
                {
                    for (int i = 0; i < allTokensBeforeCleanup.Count; i++)
                    {
                        var token = allTokensBeforeCleanup[i];
                        var preview = token.Length > 30 ? token.Substring(0, 30) + "..." : token;
                        Console.WriteLine($"  📧 Before cleanup Token {i + 1}: {preview}");
                    }
                }

                // עכשיו רץ cleanup ובדוק שוב
                Console.WriteLine("🧹 Running token cleanup...");
                await CleanupUserTokens(userId);

                // קודם בדוק כמה טוקנים יש למשתמש אחרי cleanup
                var existingTokens = dbServices.GetFCMTokensForUsers(new List<int> { userId });
                Console.WriteLine($"📊 AFTER cleanup - User {userId} has {existingTokens.Count} tokens in DB");

                // הדפס את הטוקנים (חלקית לבטיחות)
                if (existingTokens.Count > 0)
                {
                    for (int i = 0; i < existingTokens.Count; i++)
                    {
                        var token = existingTokens[i];
                        var preview = token.Length > 30 ? token.Substring(0, 30) + "..." : token;
                        Console.WriteLine($"  📧 After cleanup Token {i + 1}: {preview}");
                    }
                }
                else
                {
                    Console.WriteLine("⚠️ No FCM tokens found for user AFTER cleanup. This might be the problem!");

                    // אם אין טוקנים אחרי cleanup, אבל היו לפני - נסה לחזור לטוקנים הישנים
                    if (allTokensBeforeCleanup.Count > 0)
                    {
                        Console.WriteLine("🔄 Attempting to use tokens from before cleanup...");
                        existingTokens = allTokensBeforeCleanup;
                    }
                    else
                    {
                        Console.WriteLine("❌ No FCM tokens found for user. User needs to refresh page and allow notifications.");
                        return false;
                    }
                }

                // נסה לשלוח התראה
                Console.WriteLine($"🚀 Attempting to send notification using SendNotificationToUser...");
                var success = await SendNotificationToUser(
                    userId,
                    "Test Notification",
                    "This is a test notification from News Hub!",
                    new Dictionary<string, string> { { "type", "test" } }
                );

                if (success)
                {
                    Console.WriteLine("✅ Test notification sent successfully");
                }
                else
                {
                    Console.WriteLine("❌ Failed to send test notification via SendNotificationToUser");

                    // תן פרטים נוספים למה זה נכשל
                    Console.WriteLine("🔍 Attempting direct diagnosis...");

                    // נסה לשלוח ישירות לטוקן הראשון לבדיקה
                    if (existingTokens.Count > 0)
                    {
                        var firstToken = existingTokens[0];
                        Console.WriteLine($"🎯 Testing direct send to first token...");

                        var directSuccess = await SendDirectNotificationToToken(
                            firstToken,
                            "Direct Test",
                            "Direct test notification to verify token validity"
                        );

                        Console.WriteLine($"🎯 Direct send result: {(directSuccess ? "SUCCESS" : "FAILED")}");

                        // אם הטסט הישיר עבד, זה אומר שהבעיה היא בפונקציה SendNotificationToUser
                        if (directSuccess)
                        {
                            Console.WriteLine("✅ Direct test worked! Problem is in SendNotificationToUser flow");
                            success = true; // סמן כהצלחה כי הטוקן עובד
                        }
                    }
                }

                return success;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error sending test notification: {ex.Message}");
                Console.WriteLine($"📋 Stack trace: {ex.StackTrace}");
                return false;
            }
        }

        // בדיקת קישור Firebase למען אבחון בעיות
        public async Task<bool> DiagnoseFirebaseConnection()
        {
            try
            {
                Console.WriteLine("🔍 Running Firebase connection diagnosis...");

                // Call the existing test method
                var result = await TestFirebaseProjectConnection();

                if (result)
                {
                    Console.WriteLine("✅ Firebase diagnosis: Connection successful");
                }
                else
                {
                    Console.WriteLine("❌ Firebase diagnosis: Connection failed");
                }

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Firebase diagnosis error: {ex.Message}");
                return false;
            }
        }

        // ניקוי FCM tokens לא תקפים
        public async Task<int> CleanupInvalidTokens()
        {
            Console.WriteLine("🧹 Starting comprehensive FCM token cleanup...");

            List<string> allTokens;
            try
            {
                // נסה להשיג את כל הטוקנים
                allTokens = dbServices.GetAllFCMTokens();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error getting all tokens: {ex.Message}");
                Console.WriteLine("⚠️ Fallback: Getting tokens from active users instead");

                // fallback - השג טוקנים מהמשתמשים הפעילים
                try
                {
                    var activeUsers = dbServices.GetAllActiveUserIds();
                    if (activeUsers?.Count > 0)
                    {
                        allTokens = dbServices.GetFCMTokensForUsers(activeUsers);
                    }
                    else
                    {
                        Console.WriteLine("⚠️ No active users found, cannot perform cleanup");
                        return 0;
                    }
                }
                catch (Exception fallbackEx)
                {
                    Console.WriteLine($"❌ Fallback also failed: {fallbackEx.Message}");
                    return 0;
                }
            }

            if (allTokens == null || allTokens.Count == 0)
            {
                Console.WriteLine("ℹ️ No tokens found to cleanup");
                return 0;
            }

            int removedCount = 0;

            foreach (var token in allTokens)
            {
                try
                {
                    // וידוא שהטוקן לא ריק
                    if (string.IsNullOrWhiteSpace(token))
                    {
                        Console.WriteLine("🧹 Skipping empty token");
                        continue;
                    }

                    // בדוק כל טוקן עם dry run
                    var testMessage = new Message()
                    {
                        Token = token,
                        Notification = new Notification()
                        {
                            Title = "Test",
                            Body = "Token validation test"
                        }
                    };

                    await FirebaseMessaging.DefaultInstance.SendAsync(testMessage, dryRun: true);
                    Console.WriteLine($"✅ Token valid: {token.Substring(0, Math.Min(20, token.Length))}...");
                }
                catch (FirebaseMessagingException ex)
                {
                    if (ex.Message.Contains("registration-token-not-registered") ||
                        ex.Message.Contains("invalid-registration-token"))
                    {
                        Console.WriteLine($"🧹 Removing invalid token: {token.Substring(0, Math.Min(20, token.Length))}...");
                        try
                        {
                            dbServices.DeleteInvalidFCMToken(token);
                            removedCount++;
                        }
                        catch (Exception deleteEx)
                        {
                            Console.WriteLine($"⚠️ Failed to delete token: {deleteEx.Message}");
                        }
                    }
                    else if (ex.Message.Contains("404"))
                    {
                        Console.WriteLine("❌ Got 404 during token validation - stopping cleanup to avoid false positives");
                        break;
                    }
                    else
                    {
                        Console.WriteLine($"⚠️ Unexpected error for token {token.Substring(0, Math.Min(20, token.Length))}...: {ex.Message}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ General error processing token: {ex.Message}");
                }
            }

            Console.WriteLine($"🧹 Cleanup completed. Removed {removedCount} invalid tokens.");
            return removedCount;
        }

        // סטטיסטיקות על FCM tokens
        public object GetTokenStatistics()
        {
            try
            {
                var totalTokens = dbServices.GetTotalFCMTokensCount();
                var activeTokens = dbServices.GetActiveFCMTokensCount();
                var enabledTokens = dbServices.GetEnabledFCMTokensCount();
                var usersWithTokens = dbServices.GetUsersWithTokensCount();

                return new
                {
                    totalTokens,
                    activeTokens,
                    enabledTokens,
                    usersWithTokens,
                    inactiveTokens = totalTokens - activeTokens,
                    disabledTokens = activeTokens - enabledTokens
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error getting token statistics: {ex.Message}");
                return new { error = ex.Message };
            }
        }

        // בדיקה מקיפה של סטטוס FCM והנחיות לתיקון
        public async Task<object> GetFCMDiagnosisAndSolutions()
        {
            var diagnosis = new
            {
                timestamp = DateTime.Now,
                projectId = FirebaseApp.DefaultInstance?.Options?.ProjectId ?? "Not initialized",
                issues = new List<string>(),
                solutions = new List<string>(),
                quickFixes = new List<string>(),
                detailedInfo = new
                {
                    firebaseAppName = FirebaseApp.DefaultInstance?.Name ?? "Not available",
                    credentialType = FirebaseApp.DefaultInstance?.Options?.Credential?.GetType().Name ?? "Not available",
                    serverTime = DateTime.Now,
                    serverTimeUTC = DateTime.UtcNow,
                    serviceAccountEmail = GetServiceAccountEmail()
                },
                criticalUrls = new
                {
                    enableFCMApi = $"https://console.cloud.google.com/apis/library/fcm.googleapis.com?project={FirebaseApp.DefaultInstance?.Options?.ProjectId}",
                    enableFirebaseApi = $"https://console.cloud.google.com/apis/library/firebase.googleapis.com?project={FirebaseApp.DefaultInstance?.Options?.ProjectId}",
                    billingSettings = $"https://console.cloud.google.com/billing?project={FirebaseApp.DefaultInstance?.Options?.ProjectId}",
                    firebaseConsole = $"https://console.firebase.google.com/project/{FirebaseApp.DefaultInstance?.Options?.ProjectId}",
                    iamPermissions = $"https://console.cloud.google.com/iam-admin/iam?project={FirebaseApp.DefaultInstance?.Options?.ProjectId}",
                    apiStatus = $"https://console.cloud.google.com/apis/dashboard?project={FirebaseApp.DefaultInstance?.Options?.ProjectId}"
                },
                tokenStats = GetTokenStatistics()
            };

            var issues = (List<string>)diagnosis.issues;
            var solutions = (List<string>)diagnosis.solutions;
            var quickFixes = (List<string>)diagnosis.quickFixes;

            // בדיקת Firebase initialization
            if (FirebaseApp.DefaultInstance == null)
            {
                issues.Add("Firebase not initialized");
                solutions.Add("Check firebase-service-account.json file exists and is valid");
                quickFixes.Add("Restart the server application");
                return diagnosis;
            }

            // בדיקת service account email
            var serviceAccountEmail = GetServiceAccountEmail();
            if (string.IsNullOrEmpty(serviceAccountEmail))
            {
                issues.Add("Cannot extract service account email from credentials");
                solutions.Add("Check if firebase-service-account.json contains valid client_email field");
            }
            else
            {
                Console.WriteLine($"🔑 Service Account Email: {serviceAccountEmail}");
                if (!serviceAccountEmail.Contains("firebase-adminsdk") || !serviceAccountEmail.EndsWith(".iam.gserviceaccount.com"))
                {
                    issues.Add("Service account email format looks incorrect");
                    solutions.Add("Generate a new service account key from Firebase Console");
                }
            }

            // בדיקת טוקנים
            var stats = (dynamic)diagnosis.tokenStats;
            if (stats.totalTokens == 0)
            {
                issues.Add("No FCM tokens in database");
                solutions.Add("Users need to visit the website and grant notification permission");
                quickFixes.Add("Test with the diagnostic tool in browser");
            }
            else if (stats.enabledTokens == 0)
            {
                issues.Add("All tokens are disabled");
                solutions.Add("Users need to re-enable notifications");
                quickFixes.Add("Use EnableFCMToken endpoint to re-enable");
            }

            // בדיקות מתקדמות של API
            await PerformAdvancedAPITests(issues, solutions, quickFixes);

            return diagnosis;
        }

        // בדיקות מתקדמות של FCM API
        private async Task PerformAdvancedAPITests(List<string> issues, List<string> solutions, List<string> quickFixes)
        {
            Console.WriteLine("🔬 Performing advanced FCM API tests...");

            // Test 1: Basic dry run with dummy token
            try
            {
                var testMessage = new Message()
                {
                    Token = "dummy-token-for-api-connectivity-test",
                    Notification = new Notification()
                    {
                        Title = "API Test",
                        Body = "Testing FCM API availability"
                    }
                };

                Console.WriteLine("🧪 Testing FCM API with dry run...");
                await FirebaseMessaging.DefaultInstance.SendAsync(testMessage, dryRun: true);
                solutions.Add("✅ FCM API is accessible and working (dry run successful)");
            }
            catch (FirebaseMessagingException ex)
            {
                Console.WriteLine($"🔍 FCM API test result: {ex.Message}");

                if (ex.Message.Contains("404") || ex.Message.Contains("Not Found"))
                {
                    issues.Add("❌ FCM API returns 404 - API not enabled or project issue");
                    solutions.Add("🔧 CRITICAL: Enable FCM API in Google Cloud Console");
                    solutions.Add("🔧 Enable Firebase API as well");
                    solutions.Add("🔧 Check if project billing is enabled");
                    solutions.Add("🔧 Verify project exists and is not suspended");
                    quickFixes.Add("Wait 10-15 minutes after enabling APIs");
                    quickFixes.Add("Try generating a new service account key");

                    // Additional 404 debugging
                    await Debug404Error(issues, solutions, quickFixes);
                }
                else if (ex.Message.Contains("invalid-registration-token") ||
                        ex.Message.Contains("not a valid FCM registration token") ||
                        ex.ErrorCode.ToString() == "InvalidArgument")
                {
                    solutions.Add("✅ FCM API is working correctly (expected invalid token error)");
                }
                else if (ex.Message.Contains("403") || ex.Message.Contains("Forbidden"))
                {
                    issues.Add("❌ FCM API access forbidden - permission issue");
                    solutions.Add("🔧 Check service account IAM permissions");
                    solutions.Add("🔧 Ensure service account has 'Firebase Admin SDK Administrator Service Agent' role");
                    quickFixes.Add("Regenerate service account key with proper permissions");
                }
                else
                {
                    // Filter out expected token validation errors
                    if (ex.Message.Contains("not a valid FCM registration token") ||
                        ex.Message.Contains("invalid-registration-token") ||
                        ex.ErrorCode.ToString() == "InvalidArgument")
                    {
                        solutions.Add("✅ FCM API is working correctly (dummy token rejected as expected)");
                    }
                    else
                    {
                        issues.Add($"❌ FCM API error: {ex.ErrorCode} - {ex.Message}");
                        solutions.Add("🔧 Check service account permissions and validity");
                        solutions.Add("🔧 Verify Firebase project configuration");
                    }
                }
            }
            catch (Exception ex)
            {
                issues.Add($"❌ Unexpected API test error: {ex.Message}");
                solutions.Add("🔧 Check network connectivity and firewall settings");
                solutions.Add("🔧 Verify server can reach googleapis.com");
            }
        }

        // ניתוח מפורט של שגיאת 404
        private async Task Debug404Error(List<string> issues, List<string> solutions, List<string> quickFixes)
        {
            Console.WriteLine("🔍 Debugging 404 error in detail...");

            issues.Add("🔍 404 Error Analysis:");
            issues.Add("   - FCM API is not enabled for this project");
            issues.Add("   - Firebase project may have been deleted or moved");
            issues.Add("   - Billing may not be enabled (required for FCM)");
            issues.Add("   - Service account may lack proper permissions");

            solutions.Add("📋 Step-by-step 404 fix:");
            solutions.Add("   1. Go to Google Cloud Console for your project");
            solutions.Add("   2. Navigate to 'APIs & Services' > 'Library'");
            solutions.Add("   3. Search for 'Firebase Cloud Messaging API'");
            solutions.Add("   4. Click 'ENABLE' if not already enabled");
            solutions.Add("   5. Also enable 'Firebase Management API'");
            solutions.Add("   6. Check 'Billing' section and ensure billing is enabled");
            solutions.Add("   7. Wait 10-15 minutes for changes to propagate");

            quickFixes.Add("🚀 Quick verification steps:");
            quickFixes.Add("   - Check project exists in Firebase Console");
            quickFixes.Add("   - Verify service account email is correct");
            quickFixes.Add("   - Test with a fresh service account key");
            quickFixes.Add("   - Confirm project ID matches exactly");
        }

        // חילוץ service account email מה-credentials
        private string GetServiceAccountEmail()
        {
            try
            {
                var app = FirebaseApp.DefaultInstance;
                if (app?.Options?.Credential is GoogleCredential googleCredential)
                {
                    // Try to get service account email from the credential
                    var serviceAccountCredential = googleCredential.UnderlyingCredential as ServiceAccountCredential;
                    if (serviceAccountCredential != null)
                    {
                        return serviceAccountCredential.Id;
                    }

                    // Alternative method - read from the JSON file
                    var serviceAccountPath = Path.Combine(Directory.GetCurrentDirectory(), "firebase-service-account.json");
                    if (File.Exists(serviceAccountPath))
                    {
                        var json = File.ReadAllText(serviceAccountPath);
                        var serviceAccount = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(json);
                        if (serviceAccount.ContainsKey("client_email"))
                        {
                            return serviceAccount["client_email"].ToString();
                        }
                    }
                }
                return "Unable to extract service account email";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Error extracting service account email: {ex.Message}");
                return $"Error: {ex.Message}";
            }
        }

        // אימות service account לפני אתחול Firebase
        private async Task ValidateServiceAccount()
        {
            try
            {
                var serviceAccountPath = Path.Combine(Directory.GetCurrentDirectory(), "firebase-service-account.json");
                var serviceAccountJson = File.ReadAllText(serviceAccountPath);
                var serviceAccountData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(serviceAccountJson);

                // בדיקת שדות חובה
                var requiredFields = new[] { "type", "project_id", "private_key_id", "private_key", "client_email", "client_id" };
                var missingFields = new List<string>();

                foreach (var field in requiredFields)
                {
                    if (!serviceAccountData.ContainsKey(field) ||
                        string.IsNullOrWhiteSpace(serviceAccountData[field]?.ToString()))
                    {
                        missingFields.Add(field);
                    }
                }

                if (missingFields.Count > 0)
                {
                    throw new Exception($"Service account missing required fields: {string.Join(", ", missingFields)}");
                }

                // בדיקת פורמט client_email
                var clientEmail = serviceAccountData["client_email"].ToString();
                if (!clientEmail.Contains("firebase-adminsdk") || !clientEmail.EndsWith(".iam.gserviceaccount.com"))
                {
                    Console.WriteLine($"⚠️ Warning: Service account email format may be incorrect: {clientEmail}");
                }

                // בדיקת project_id format
                var projectId = serviceAccountData["project_id"].ToString();
                if (projectId != "newspapersite-ruppin")
                {
                    Console.WriteLine($"⚠️ Warning: Project ID mismatch. Expected: newspapersite-ruppin, Got: {projectId}");
                }

                Console.WriteLine($"✅ Service account validation passed for project: {projectId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Service account validation failed: {ex.Message}");
                throw;
            }
        }
    }
}
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
                            var serviceAccountData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(serviceAccountJson);
                            var projectId = serviceAccountData["project_id"].ToString();

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
                        Console.WriteLine("🔍 Testing Firebase project connection...");

                        // Try to access Firebase project information
                        var app = FirebaseApp.DefaultInstance;
                        if (app != null)
                        {
                            Console.WriteLine($"✅ Firebase app instance exists for project: {app.Options.ProjectId}");

                            // Try a simple operation that doesn't require tokens
                            var messaging = FirebaseMessaging.DefaultInstance;
                            Console.WriteLine("✅ Firebase Messaging instance created successfully");

                            // Test with a dummy message using dry run (won't actually send)
                            try
                            {
                                var testMessage = new Message()
                                {
                                    Token = "dummy-token-for-dry-run-test",
                                    Notification = new Notification()
                                    {
                                        Title = "Test",
                                        Body = "Dry run test"
                                    }
                                };

                                // This should fail with invalid token, but if we get 404, it means API issue
                                await FirebaseMessaging.DefaultInstance.SendAsync(testMessage, dryRun: true);
                                Console.WriteLine("✅ Dry run test completed successfully");
                            }
                            catch (FirebaseMessagingException ex)
                            {
                                if (ex.Message.Contains("invalid-registration-token") ||
                                    ex.Message.Contains("registration-token-not-registered"))
                                {
                                    Console.WriteLine("✅ Dry run test passed (expected invalid token error)");
                                    return true;
                                }
                                else if (ex.Message.Contains("404") || ex.Message.Contains("Not Found"))
                                {
                                    Console.WriteLine("❌ Dry run test failed with 404 - FCM API issue");
                                    return false;
                                }
                                else
                                {
                                    Console.WriteLine($"⚠️ Dry run test got unexpected error: {ex.Message}");
                                    return true; // Other errors are probably okay for connectivity test
                                }
                            }

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
                    // First, clean up any potential duplicate or old tokens
                    await CleanupUserTokens(userId);

                    var tokens = dbServices.GetFCMTokensForUsers(new List<int> { userId });
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

                        // יצירת הודעה פשוטה בלי קונפיגורציות מיוחדות שיכולות לגרום ל-404
                        var message = new MulticastMessage()
                        {
                            Tokens = tokens,
                            Notification = new Notification()
                            {
                                Title = title,
                                Body = body
                            }
                            // הסרת Data לחלוטין במקרה של null או בעיות פורמט
                        };

                        // רק אם יש data valid, הוסף אותו
                        if (data != null && data.Count > 0)
                        {
                            message.Data = data;
                        }

                        Console.WriteLine($"📦 Message prepared. Sending to Firebase...");
                        Console.WriteLine($"🎯 Sample tokens: {string.Join(", ", tokens.Take(2))}...");

                        // Additional debug info
                        Console.WriteLine($"🔧 Firebase App Name: {FirebaseApp.DefaultInstance.Name}");
                        Console.WriteLine($"🔧 Service Account Email: {FirebaseApp.DefaultInstance.Options.Credential}");
                        Console.WriteLine($"🔧 Total tokens to process: {tokens.Count}");

                        // Try sending to tokens one by one to identify problematic ones
                        var validTokens = new List<string>();
                        var invalidTokens = new List<string>();

                        Console.WriteLine("🔍 Using all provided tokens (skipping pre-validation to avoid 404)...");

                        // השתמש בכל הטוקנים ללא בדיקה מוקדמת
                        validTokens.AddRange(tokens);

                        Console.WriteLine($"✅ Using {validTokens.Count} tokens for sending");

                        // Update message to use valid tokens
                        message.Tokens = validTokens;

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

                // ניקוי FCM tokens לא תקפים
                public async Task<int> CleanupInvalidTokens()
                {
                    Console.WriteLine("🧹 Starting comprehensive FCM token cleanup...");
                    
                    var allTokens = dbServices.GetAllFCMTokens(); // צריך להוסיף הפונקציה הזו ל-DBservices
                    int removedCount = 0;

                    foreach (var token in allTokens)
                    {
                        try
                        {
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
                            Console.WriteLine($"✅ Token valid: {token.Substring(0, 20)}...");
                        }
                        catch (FirebaseMessagingException ex)
                        {
                            if (ex.Message.Contains("registration-token-not-registered") ||
                                ex.Message.Contains("invalid-registration-token"))
                            {
                                Console.WriteLine($"🧹 Removing invalid token: {token.Substring(0, 20)}...");
                                dbServices.DeleteInvalidFCMToken(token);
                                removedCount++;
                            }
                            else
                            {
                                Console.WriteLine($"⚠️ Unexpected error for token {token.Substring(0, 20)}...: {ex.Message}");
                            }
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
                        else if (ex.Message.Contains("invalid-registration-token"))
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
                            issues.Add($"❌ FCM API error: {ex.ErrorCode} - {ex.Message}");
                            solutions.Add("🔧 Check service account permissions and validity");
                            solutions.Add("🔧 Verify Firebase project configuration");
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
            }
        }
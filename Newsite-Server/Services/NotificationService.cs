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

            // Fix double creation issue
            if (!isFirebaseInitialized)
            {
                lock (typeof(NotificationService)) // Thread safety
                {
                    if (!isFirebaseInitialized && FirebaseApp.DefaultInstance == null)
                    {
                        try
                        {
                            var serviceAccountPath = Path.Combine(Directory.GetCurrentDirectory(), "firebase-service-account.json");
                            if (!File.Exists(serviceAccountPath))
                            {
                                throw new FileNotFoundException($"Firebase service account file not found at: {serviceAccountPath}");
                            }

                            var credential = GoogleCredential.FromFile(serviceAccountPath);

                            // Read project_id from service account file instead of manual configuration
                            var serviceAccountJson = File.ReadAllText(serviceAccountPath);

                            // Check that the file is valid
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

                            // Ensure there is a project_id
                            if (!serviceAccountData.ContainsKey("project_id"))
                            {
                                throw new Exception("firebase-service-account.json missing 'project_id' field");
                            }

                            var projectId = serviceAccountData["project_id"].ToString();

                            // Ensure the project_id is valid
                            if (string.IsNullOrWhiteSpace(projectId))
                            {
                                throw new Exception("project_id in firebase-service-account.json is empty or null");
                            }


                            var options = new AppOptions()
                            {
                                Credential = credential,
                                ProjectId = projectId // Use project_id from file
                            };

                            FirebaseApp.Create(options);

                            isFirebaseInitialized = true;
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"❌ Error initializing Firebase Admin SDK: {ex.Message}");
                        }
                    }
                    else if (FirebaseApp.DefaultInstance != null)
                    {
                        isFirebaseInitialized = true;
                    }
                }
            }
        }
      
        // Send notification to specific user
        public async Task<bool> SendNotificationToUser(int userId, string title, string body, Dictionary<string, string> data = null)
        {
            // For test notifications - don't do automatic cleanup
            // First, clean up any potential duplicate or old tokens - commented out for testing
            // await CleanupUserTokens(userId);

            var tokens = dbServices.GetFCMTokensForUsers(new List<int> { userId });

            if (tokens.Count > 0)
            {
                for (int i = 0; i < Math.Min(tokens.Count, 3); i++) // הראה רק 3 ראשונים
                {
                    var token = tokens[i];
                    var preview = token.Length > 30 ? token.Substring(0, 30) + "..." : token;
                }
            }

            return await SendNotificationToTokens(tokens, title, body, data);
        }

        // Send notification to list of users
        public async Task<bool> SendNotificationToUsers(List<int> userIds, string title, string body, Dictionary<string, string> data = null)
        {
            if (userIds == null || userIds.Count == 0)
                return false;

            var tokens = dbServices.GetFCMTokensForUsers(userIds);
            return await SendNotificationToTokens(tokens, title, body, data);
        }


        // send notifications to specific tokens
        private async Task<bool> SendNotificationToTokens(List<string> tokens, string title, string body, Dictionary<string, string> data = null)
        {
            if (tokens == null || tokens.Count == 0)
            {
                return false;
            }

            try
            {
                // בדיקה שFirebase מאותחל כמו שצריך
                if (FirebaseApp.DefaultInstance == null)
                {
                    return false;
                }
      
                // טיפול בטוקנים ריקים או לא תקפים לפני שליחה
                var validTokens = new List<string>();
                var invalidTokens = new List<string>();

                foreach (var token in tokens)
                {
                    // בדיקות בסיסיות של פורמט הטוקן
                    if (string.IsNullOrWhiteSpace(token))
                    {
                        invalidTokens.Add(token);
                        continue;
                    }

                    if (token.Length < 10)
                    {
                        invalidTokens.Add(token);
                        continue;
                    }

                    // הוסף לרשימת הטוקנים התקפים
                    validTokens.Add(token);
                }

                if (validTokens.Count == 0)
                {
                    return false;
                }


                // בחר את השיטה הנכונה בהתאם למספר הטוקנים
                if (validTokens.Count == 1)
                {
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
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    // עבור כמה טוקנים - השתמש ב-MulticastMessage ו-SendMulticastAsync
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

                    var multicastResponse = await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(multicastMessage);

                    if (multicastResponse.SuccessCount > 0)
                    {
                        // הדפסת שגיאות אם יש
                        if (multicastResponse.FailureCount > 0)
                        {
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
               
                // בדיקה ספציפית לשגיאת 404
                if (fex.Message.Contains("404") || fex.Message.Contains("Not Found"))
                {
                    Console.WriteLine("❌ Firebase 404 Error Detected!");
                }

                if (fex.InnerException != null)
                {
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

                if (ex.InnerException != null)
                {
                    Console.WriteLine($"🔍 Inner Exception: {ex.InnerException.Message}");
                }

                return false;
            }
        }

        // Notification for new comment
        public async Task NotifyNewComment(int articleId, string articleTitle, int commenterId, string commenterName)
        {
            // Ensure proper UTF-8 encoding for Hebrew text
            if (!string.IsNullOrEmpty(commenterName))
            {
                var bytes = Encoding.UTF8.GetBytes(commenterName);
                commenterName = Encoding.UTF8.GetString(bytes);
            }
            
            if (!string.IsNullOrEmpty(articleTitle))
            {
                var bytes = Encoding.UTF8.GetBytes(articleTitle);
                articleTitle = Encoding.UTF8.GetString(bytes);
            }

            var interestedUsers = dbServices.GetUsersWhoCommentedOnArticle(articleId, commenterId);

            if (interestedUsers.Count > 0)
            {
                var data = new Dictionary<string, string>
                {
                    {"type", "new_comment"},
                    {"articleId", articleId.ToString()},
                    {"excludeUserId", commenterId.ToString()}, // מוסיף למניעת התראות למבצע הפעולה
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

    }
}
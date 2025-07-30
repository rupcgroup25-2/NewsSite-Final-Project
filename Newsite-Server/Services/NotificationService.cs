using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newsite_Server.DAL;

namespace Newsite_Server.Services
{
    public class NotificationService
    {
        private readonly HttpClient httpClient;
        private readonly DBservices dbServices;
        private readonly string serverKey;

        public NotificationService()
        {
            httpClient = new HttpClient();
            dbServices = new DBservices();
            
            // קרא את ה-server key מהקובץ (צור קובץ firebase-server-key.txt בroot של הפרויקט)
            try
            {
                serverKey = System.IO.File.ReadAllText("firebase-server-key.txt").Trim();
                httpClient.DefaultRequestHeaders.Add("Authorization", $"key={serverKey}");
                httpClient.DefaultRequestHeaders.Add("Content-Type", "application/json");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading Firebase server key: {ex.Message}");
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

            var payload = new
            {
                registration_ids = tokens,
                notification = new
                {
                    title = title,
                    body = body,
                    icon = "/public/newsSite.png",
                    click_action = "FCM_PLUGIN_ACTIVITY"
                },
                data = data ?? new Dictionary<string, string>()
            };

            try
            {
                var json = JsonConvert.SerializeObject(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync("https://fcm.googleapis.com/fcm/send", content);
                
                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine("Notification sent successfully");
                    return true;
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Error sending notification: {error}");
                    return false;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception sending notification: {ex.Message}");
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
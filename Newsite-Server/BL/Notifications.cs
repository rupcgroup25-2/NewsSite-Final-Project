using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newsite_Server.DAL;
using Newsite_Server.Services;

namespace Newsite_Server.BL
{
    public class Notifications
    {
        private readonly DBservices dbs;
        private readonly NotificationService notificationService;

        public Notifications()
        {
            dbs = new DBservices();
            notificationService = new NotificationService();
        }

        // בדיקת חיבור לבסיס נתונים
        public bool TestDatabaseConnection()
        {
            try
            {
                return dbs.TestConnection();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Database connection test failed: {ex.Message}");
                return false;
            }
        }

        // שמירת FCM Token
        public int SaveFCMToken(int userId, string fcmToken)
        {
            return dbs.SaveFCMToken(userId, fcmToken);
        }

        // ביטול התראות
        public int DisableFCMToken(int userId)
        {
            return dbs.DisableFCMToken(userId);
        }

        // הפעלת התראות
        public int EnableFCMToken(int userId)
        {
            return dbs.EnableFCMToken(userId);
        }

        // בדיקת סטטוס התראות
        public bool IsUserNotificationsEnabled(int userId)
        {
            return dbs.IsUserNotificationsEnabled(userId);
        }

        // שליחת התראת בדיקה
        public async Task<bool> SendTestNotification(int userId)
        {
            Console.WriteLine($"🧪 BL SendTestNotification called for userId: {userId}");
            
            try
            {
                bool result = await notificationService.SendNotificationToUser(
                    userId,
                    "Test Notification",
                    "This is a test notification from News Hub!"
                );
                
                Console.WriteLine($"🧪 BL SendTestNotification result: {result}");
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in BL SendTestNotification: {ex.Message}");
                throw;
            }
        }

        // התראה על תגובה חדשה
        public async Task NotifyNewComment(int articleId, string articleTitle, int commenterId, string commenterName)
        {
            await notificationService.NotifyNewComment(articleId, articleTitle, commenterId, commenterName);
        }

        // התראה על שיתוף כתבה לעוקבים
        public async Task NotifyArticleSharedToFollowers(int sharerId, string sharerName, string articleTitle)
        {
            var followers = dbs.GetUserFollowers(sharerId);
            if (followers.Count > 0)
            {
                var data = new Dictionary<string, string>
                {
                    {"type", "article_shared"},
                    {"sharerId", sharerId.ToString()},
                    {"url", "/shared.html"}
                };

                await notificationService.SendNotificationToUsers(
                    followers,
                    "New Shared Article",
                    $"{sharerName} shared a new article: \"{articleTitle}\"",
                    data
                );
            }
        }

        // התראה על עוקב חדש
        public async Task NotifyNewFollower(int followedUserId, string followerName)
        {
            var data = new Dictionary<string, string>
            {
                {"type", "new_follower"},
                {"url", "/profile.html"}
            };

            await notificationService.SendNotificationToUser(
                followedUserId,
                "New Follower",
                $"{followerName} started following you!",
                data
            );
        }

        // התראה לאדמין על דיווח חדש
        public async Task NotifyAdminNewReport(string reportType, string reportedContent, string reporterName)
        {
            var adminUsers = dbs.GetAllUsersWithNotifications();
            if (adminUsers.Count > 0)
            {
                var data = new Dictionary<string, string>
                {
                    {"type", "new_report"},
                    {"reportType", reportType},
                    {"url", "/admin.html"}
                };

                await notificationService.SendNotificationToUsers(
                    adminUsers,
                    "New Report",
                    $"New {reportType} report by {reporterName}: {reportedContent}",
                    data
                );
            }
        }


        // התראה על עדכון מערכת לכל המשתמשים
        public async Task NotifySystemUpdate(string title, string message)
        {
            var data = new Dictionary<string, string>
            {
                {"type", "system_update"},
                {"url", "/"}
            };

            var allActiveUsers = dbs.GetAllActiveUserIds();
            await notificationService.SendNotificationToUsers(allActiveUsers, title, message, data);
        }

        // התראה על יום הולדת למשתמש
        public async Task NotifyBirthday(int userId, string userName)
        {
            var data = new Dictionary<string, string>
            {
                {"type", "birthday"},
                {"url", "/profile.html"}
            };

            await notificationService.SendNotificationToUser(
                userId,
                "Happy Birthday!",
                $"Happy Birthday {userName}! 🎉",
                data
            );
        }
    }
}
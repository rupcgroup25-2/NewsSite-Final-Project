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
            
            try
            {
                // שליחה ללא data כדי למנוע בעיות פורמט
                bool result = await notificationService.SendNotificationToUser(
                    userId,
                    "Test Notification",
                    "This is a test notification from News Hub!",
                    null // ללא data
                );
                
                return result;
            }
            catch (Exception ex)
            {
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

        // Diagnostic method for Firebase connection
        public async Task<bool> DiagnoseFirebaseConnection()
        {
            try
            {
                return await notificationService.TestFirebaseProjectConnection();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Firebase diagnosis failed: {ex.Message}");
                return false;
            }
        }

        // ניקוי FCM tokens לא תקפים
        public async Task<int> CleanupInvalidTokens()
        {
            try
            {
                return await notificationService.CleanupInvalidTokens();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Token cleanup failed: {ex.Message}");
                return 0;
            }
        }

        // סטטיסטיקות על FCM tokens
        public object GetTokenStatistics()
        {
            try
            {
                return notificationService.GetTokenStatistics();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Token statistics failed: {ex.Message}");
                return new { error = ex.Message };
            }
        }

        // דיאגנוזה מקיפה עם פתרונות
        public async Task<object> GetComprehensiveDiagnosis()
        {
            try
            {
                return await notificationService.GetFCMDiagnosisAndSolutions();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Comprehensive diagnosis failed: {ex.Message}");
                return new { error = ex.Message, timestamp = DateTime.Now };
            }
        }
    }
}
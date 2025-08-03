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

        // Test database connection
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

        //// Test Firebase APIs connection
        //public async Task<bool> TestFirebaseConnection()
        //{
        //    try
        //    {
        //        return await notificationService.TestFirebaseProjectConnection();
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"❌ Firebase connection test failed: {ex.Message}");
        //        return false;
        //    }
        //}

        // Save FCM Token
        public int SaveFCMToken(int userId, string fcmToken)
        {
            return dbs.SaveFCMToken(userId, fcmToken);
        }

        // Clear specific FCM token on logout
        public int ClearSpecificFCMToken(int userId, string fcmToken)
        {
            return dbs.ClearSpecificFCMToken(userId, fcmToken);
        }

        // Disable notifications
        public int DisableFCMToken(int userId)
        {
            return dbs.DisableFCMToken(userId);
        }

        // Enable notifications
        public int EnableFCMToken(int userId)
        {
            return dbs.EnableFCMToken(userId);
        }

        // Check notifications status
        public bool IsUserNotificationsEnabled(int userId)
        {
            return dbs.IsUserNotificationsEnabled(userId);
        }

        // Send test notification
        public async Task<bool> SendTestNotification(int userId)
        {
            try
            {
                bool result = await notificationService.SendNotificationToUser(
                    userId,
                    "Test Notification",
                    "This is a test notification from News Hub!",
                    null // Without data
                );

                return result;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        //// Send direct notification to specific token (without DB check)
        //public async Task<bool> SendDirectTokenNotification(string fcmToken, string title, string body)
        //{
        //    try
        //    {
        //        Console.WriteLine($"🎯 Sending direct notification to token: {fcmToken?.Substring(0, Math.Min(30, fcmToken?.Length ?? 0))}...");

        //        bool result = await notificationService.SendDirectNotificationToToken(fcmToken, title, body);

        //        if (result)
        //        {
        //            Console.WriteLine("✅ Direct token notification sent successfully");
        //        }
        //        else
        //        {
        //            Console.WriteLine("❌ Failed to send direct token notification");
        //        }

        //        return result;
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"❌ Error sending direct token notification: {ex.Message}");
        //        throw;
        //    }
        //}

        // Notification for new comment
        public async Task NotifyNewComment(int articleId, string articleTitle, int commenterId, string commenterName)
        {
            await notificationService.NotifyNewComment(articleId, articleTitle, commenterId, commenterName);
        }

        // Notification for article shared to followers
        public async Task NotifyArticleSharedToFollowers(int sharerId, string sharerName, string articleTitle)
        {
            var followers = dbs.GetUserFollowers(sharerId);

            // Remove the sharing user from the list so they don't receive notification for their own action
            followers.RemoveAll(followerId => followerId == sharerId);

            if (followers.Count > 0)
            {
                var data = new Dictionary<string, string>
                {
                    {"type", "article_shared"},
                    {"sharerId", sharerId.ToString()},
                    {"excludeUserId", sharerId.ToString()}, // Add to prevent notifications to action performer
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

        // Notification for new follower
        public async Task NotifyNewFollower(int followedUserId, string followerName, int followerId)
        {
            // Ensure user doesn't receive notification for following themselves
            if (followedUserId == followerId)
            {
                return; // Don't send notification if user follows themselves
            }

            var data = new Dictionary<string, string>
            {
                {"type", "new_follower"},
                {"excludeUserId", followerId.ToString()}, // Add to prevent notifications to action performer
                {"url", "/profile.html"}
            };

            await notificationService.SendNotificationToUser(
                followedUserId,
                "New Follower",
                $"{followerName} started following you!",
                data
            );
        }

        // Notification to admin for new report - updated to not send to reporter
        public async Task NotifyAdminNewReport(string reportType, string reportedContent, string reporterName, int reporterId)
        {
            var adminUsers = dbs.GetAllUsersWithNotifications();

            // Remove the reporting user from the list so they don't receive notification for their own action
            adminUsers.RemoveAll(userId => userId == reporterId);

            if (adminUsers.Count > 0)
            {
                var data = new Dictionary<string, string>
                {
                    {"type", "new_report"},
                    {"reportType", reportType},
                    {"excludeUserId", reporterId.ToString()}, // Add to prevent notifications to action performer
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


        // Notification for system update to all users
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

        // Notification for system update to all users except action performer
        public async Task NotifySystemUpdateExcludingUser(string title, string message, int excludeUserId)
        {
            var data = new Dictionary<string, string>
            {
                {"type", "system_update"},
                {"excludeUserId", excludeUserId.ToString()}, // Add to prevent notifications to action performer
                {"url", "/"}
            };

            var allActiveUsers = dbs.GetAllActiveUserIds();

            // Remove the user performing the action
            allActiveUsers.RemoveAll(userId => userId == excludeUserId);

            if (allActiveUsers.Count > 0)
            {
                await notificationService.SendNotificationToUsers(allActiveUsers, title, message, data);
            }
        }

        // Birthday notification for user
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

        //// Diagnostic method for Firebase connection
        //public async Task<bool> DiagnoseFirebaseConnection()
        //{
        //    try
        //    {
        //        return await notificationService.TestFirebaseProjectConnection();
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"❌ Firebase diagnosis failed: {ex.Message}");
        //        return false;
        //    }
        //}

        // Cleanup invalid FCM tokens
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

        //// Statistics for FCM tokens
        //public object GetTokenStatistics()
        //{
        //    try
        //    {
        //        return notificationService.GetTokenStatistics();
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"❌ Token statistics failed: {ex.Message}");
        //        return new { error = ex.Message };
        //    }
        //}

        //// Comprehensive diagnosis with solutions
        //public async Task<object> GetComprehensiveDiagnosis()
        //{
        //    try
        //    {
        //        return await notificationService.GetFCMDiagnosisAndSolutions();
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"❌ Comprehensive diagnosis failed: {ex.Message}");
        //        return new { error = ex.Message, timestamp = DateTime.Now };
        //    }
        //}
    }
}
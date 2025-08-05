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
    }
}
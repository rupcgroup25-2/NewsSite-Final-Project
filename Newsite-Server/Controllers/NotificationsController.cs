using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newsite_Server.BL;

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class NotificationsController : ControllerBase
    {
        private readonly Notifications notifications;

        public NotificationsController()
        {
            notifications = new Notifications();
        }

        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            try
            {
                Console.WriteLine("🔧 Status endpoint called");
                
                // בדיקת חיבור לבסיס נתונים
                var dbStatus = notifications.TestDatabaseConnection();
                
                return Ok(new { 
                    status = "healthy", 
                    timestamp = DateTime.Now,
                    message = "Notification server is running",
                    database = dbStatus ? "connected" : "disconnected"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Exception in status: {ex.Message}");
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpGet("firebase-status")]
        public async Task<IActionResult> GetFirebaseStatus()
        {
            try
            {
                Console.WriteLine("🔍 Checking Firebase API status...");
                
                var result = await notifications.TestFirebaseConnection();
                
                return Ok(new { 
                    status = result ? "fcm-api-enabled" : "fcm-api-disabled", 
                    timestamp = DateTime.Now,
                    message = result ? "Firebase APIs are enabled and working" : "Firebase FCM API is not enabled - check Google Cloud Console",
                    projectId = "newspapersite-ruppin",
                    instructions = result ? null : new {
                        step1 = "Go to https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=newspapersite-ruppin",
                        step2 = "Click 'ENABLE' to enable Firebase Cloud Messaging API", 
                        step3 = "Also enable https://console.cloud.google.com/apis/library/firebase.googleapis.com?project=newspapersite-ruppin",
                        step4 = "Verify billing is enabled for the project",
                        step5 = "Wait 5-10 minutes and try again"
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Exception in firebase-status: {ex.Message}");
                return StatusCode(500, new { 
                    status = "error", 
                    message = ex.Message,
                    timestamp = DateTime.Now
                });
            }
        }

        [HttpPost("SaveFCMToken")]
        public IActionResult SaveFCMToken(int userId, string fcmToken)
        {
            try
            {
                Console.WriteLine($"🔧 SaveFCMToken called for user {userId}");
                Console.WriteLine($"📧 Token: {fcmToken?.Substring(0, Math.Min(30, fcmToken?.Length ?? 0))}...");
                
                if (string.IsNullOrEmpty(fcmToken))
                {
                    Console.WriteLine("❌ FCM token is null or empty");
                    return BadRequest("FCM token cannot be empty");
                }

                int result = notifications.SaveFCMToken(userId, fcmToken);

                if (result > 0)
                {
                    Console.WriteLine($"✅ FCM token saved successfully for user {userId}");
                    
                    // אמת שהטוקן נשמר בפועל
                    Console.WriteLine($"🔍 Verifying token was saved...");
                    bool isEnabled = notifications.IsUserNotificationsEnabled(userId);
                    Console.WriteLine($"📊 User {userId} notifications enabled: {isEnabled}");
                    
                    return Ok(new { 
                        message = "FCM token saved successfully",
                        userId = userId,
                        notificationsEnabled = isEnabled
                    });
                }
                else
                {
                    Console.WriteLine($"⚠️ SaveFCMToken returned 0 for user {userId}");
                    return StatusCode(500, "Failed to save FCM token");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Exception in SaveFCMToken: {ex.Message}");
                Console.WriteLine($"📋 Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpPut("DisableFCMToken")]
        public IActionResult DisableFCMToken(int userId)
        {
            try
            {
                int result = notifications.DisableFCMToken(userId);

                if (result > 0)
                {
                    return Ok("Notifications disabled successfully");
                }
                else
                {
                    return StatusCode(500, "Failed to disable notifications");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpPut("EnableFCMToken")]
        public IActionResult EnableFCMToken(int userId)
        {
            try
            {
                int result = notifications.EnableFCMToken(userId);

                if (result > 0)
                {
                    return Ok("Notifications enabled successfully");
                }
                else
                {
                    return StatusCode(500, "Failed to enable notifications");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpGet("NotificationStatus")]
        public IActionResult GetNotificationStatus(int userId)
        {
            try
            {
                bool isEnabled = notifications.IsUserNotificationsEnabled(userId);
                return Ok(new { notificationsEnabled = isEnabled });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpPost("TestNotification")]
        public async Task<IActionResult> TestNotification(int userId)
        {
            try
            {
                Console.WriteLine($"🧪 TestNotification endpoint called for userId: {userId}");
                
                // בדוק אם יש FCM tokens לאותו משתמש
                Console.WriteLine($"🔍 Checking if user {userId} has FCM tokens...");
                
                bool success = await notifications.SendTestNotification(userId);

                if (success)
                {
                    Console.WriteLine("✅ Test notification sent successfully");
                    return Ok("Test notification sent successfully");
                }
                else
                {
                    Console.WriteLine("❌ Failed to send test notification - no tokens or sending failed");
                    return StatusCode(500, "Failed to send test notification - check if you have notification tokens. Try refreshing the page and allowing notifications first.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in TestNotification endpoint: {ex.Message}");
                Console.WriteLine($"📋 Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpPost("TestDirectToken")]
        public async Task<IActionResult> TestDirectToken(string fcmToken, string title = "Test Notification", string body = "This is a direct token test notification!")
        {
            try
            {
                Console.WriteLine($"🎯 TestDirectToken endpoint called");
                Console.WriteLine($"📧 FCM Token: {fcmToken?.Substring(0, Math.Min(30, fcmToken?.Length ?? 0))}...");
                Console.WriteLine($"📝 Title: {title}");
                Console.WriteLine($"📝 Body: {body}");
                
                if (string.IsNullOrEmpty(fcmToken))
                {
                    Console.WriteLine("❌ FCM token is null or empty");
                    return BadRequest("FCM token is required");
                }

                bool success = await notifications.SendDirectTokenNotification(fcmToken, title, body);

                if (success)
                {
                    Console.WriteLine("✅ Direct token test notification sent successfully");
                    return Ok("Direct token test notification sent successfully");
                }
                else
                {
                    Console.WriteLine("❌ Failed to send direct token test notification");
                    return StatusCode(500, "Failed to send direct token test notification");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in TestDirectToken endpoint: {ex.Message}");
                Console.WriteLine($"📋 Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpPost("SystemUpdate")]
        public async Task<IActionResult> SendSystemUpdate(string title, string message)
        {
            try
            {
                await notifications.NotifySystemUpdate(title, message);
                return Ok("System update notification sent successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpGet("DiagnoseFirebase")]
        public async Task<IActionResult> DiagnoseFirebase()
        {
            try
            {
                Console.WriteLine("🔧 Firebase diagnostic endpoint called");
                
                var result = await notifications.DiagnoseFirebaseConnection();
                
                return Ok(new { 
                    firebaseConnectionTest = result,
                    message = result ? "Firebase connection successful" : "Firebase connection failed - check logs for details"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Firebase diagnostic error: {ex.Message}");
                return StatusCode(500, $"Error during Firebase diagnosis: {ex.Message}");
            }
        }

        [HttpPost("CleanupInvalidTokens")]
        public async Task<IActionResult> CleanupInvalidTokens()
        {
            try
            {
                Console.WriteLine("🧹 Starting cleanup of invalid FCM tokens...");
                
                var result = await notifications.CleanupInvalidTokens();
                
                return Ok(new { 
                    tokensRemoved = result,
                    message = $"Cleanup completed. Removed {result} invalid tokens."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Token cleanup error: {ex.Message}");
                return StatusCode(500, $"Error during token cleanup: {ex.Message}");
            }
        }

        [HttpGet("GetTokenStats")]
        public IActionResult GetTokenStats()
        {
            try
            {
                var stats = notifications.GetTokenStatistics();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Token stats error: {ex.Message}");
                return StatusCode(500, $"Error getting token stats: {ex.Message}");
            }
        }

        [HttpGet("GetComprehensiveDiagnosis")]
        public async Task<IActionResult> GetComprehensiveDiagnosis()
        {
            try
            {
                Console.WriteLine("🔍 Running comprehensive FCM diagnosis...");
                
                var diagnosis = await notifications.GetComprehensiveDiagnosis();
                
                return Ok(diagnosis);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Comprehensive diagnosis error: {ex.Message}");
                return StatusCode(500, $"Error during comprehensive diagnosis: {ex.Message}");
            }
        }

        [HttpGet("QuickHealthCheck")]
        public async Task<IActionResult> QuickHealthCheck()
        {
            try
            {
                Console.WriteLine("⚡ Running quick health check...");
                
                var result = new
                {
                    timestamp = DateTime.Now,
                    firebase = new
                    {
                        initialized = FirebaseAdmin.FirebaseApp.DefaultInstance != null,
                        projectId = FirebaseAdmin.FirebaseApp.DefaultInstance?.Options?.ProjectId ?? "Not available"
                    },
                    database = notifications.TestDatabaseConnection(),
                    tokens = notifications.GetTokenStatistics(),
                    recommendations = new List<string>()
                };

                var recommendations = (List<string>)result.recommendations;

                if (!result.firebase.initialized)
                {
                    recommendations.Add("❌ Firebase not initialized - check service account file");
                }

                if (!result.database)
                {
                    recommendations.Add("❌ Database connection failed - check connection string");
                }

                var tokenStats = (dynamic)result.tokens;
                if (tokenStats.totalTokens == 0)
                {
                    recommendations.Add("⚠️ No FCM tokens found - users need to subscribe to notifications");
                }

                if (recommendations.Count == 0)
                {
                    recommendations.Add("✅ Basic health check passed - try comprehensive diagnosis for detailed analysis");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Quick health check error: {ex.Message}");
                return StatusCode(500, $"Error during health check: {ex.Message}");
            }
        }

    }
}
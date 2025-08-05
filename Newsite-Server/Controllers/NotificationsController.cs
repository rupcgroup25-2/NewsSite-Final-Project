using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newsite_Server.BL;

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly Notifications notifications;

        public NotificationsController()
        {
            notifications = new Notifications();
        }

        // Saves FCM token for push notifications
        [HttpPost("SaveFCMToken")]
        public IActionResult SaveFCMToken(int userId, string fcmToken)
        {
            try
            {
                if (string.IsNullOrEmpty(fcmToken))
                {
                    return BadRequest("FCM token cannot be empty");
                }

                int result = notifications.SaveFCMToken(userId, fcmToken);

                if (result > 0)
                {
                    // Verify that the token was actually saved
                    bool isEnabled = notifications.IsUserNotificationsEnabled(userId);
                    return Ok(new { 
                        message = "FCM token saved successfully",
                        userId = userId,
                        notificationsEnabled = isEnabled
                    });
                }
                else
                {
                    return StatusCode(500, "Failed to save FCM token");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // Clears specific FCM token on logout
        [HttpDelete("ClearSpecificFCMToken")]
        public IActionResult ClearSpecificFCMToken(int userId, string fcmToken)
        {
            try
            {
                if (string.IsNullOrEmpty(fcmToken))
                {
                    return BadRequest("FCM token cannot be empty");
                }

                int result = notifications.ClearSpecificFCMToken(userId, fcmToken);

                if (result > 0)
                {
                    return Ok("FCM token cleared successfully");
                }
                else
                {
                    return Ok("No token to clear (already removed)");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // Disables FCM notifications for a user
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

        // Enables FCM notifications for a user
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

        [HttpPost("SystemUpdate")]
        [Authorize(Roles = "Admin")] 
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
    }
}
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newsite_Server.BL;
using Newsite_Server.Services;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Security.Claims;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private TokenService _tokenService;
        private readonly Notifications notifications;


        public UsersController()
        {
            _tokenService = new TokenService();
            notifications = new Notifications();
        }

        [HttpPost("Login")]
        [AllowAnonymous]
        public IActionResult Login([FromBody] User user)
        {

            User NewUser = user.LoginUser();

            if (NewUser == null)
            {
                return BadRequest(new { message = "Invalid email or password" });
            }

            if (!NewUser.Active)
            {
                return Unauthorized(new { message = "The user is blocked because of violations of the site!" });
            }

            NewUser.TrackDailyLogin(NewUser.Id);
            string role = NewUser.Email == "admin@newshub.com" ? "Admin" : "User";
            string token = _tokenService.GenerateToken(NewUser.Email, role);

            return Ok(new
            {
                token,
                NewUser.Name,
                NewUser.Id,
                NewUser.Email,
                NewUser.Tags
            });
        }

        // POST api/<UsersController>
        [HttpPost("Register")]
        [AllowAnonymous]
        public IActionResult Register([FromBody] User user)
        {
            if (user.Register() == 0)
            {
                return BadRequest("Invalid input - name or password does not meet the requirements.");
            }

            return Ok(new { message = "Success" });
        }

        [HttpGet]
        [Route("AllEmails")]
        public IActionResult GetAllUsersEmails()
        {
            User user = new User();
            List<string> emails = user.GetAllEmails();
            if (emails.Any())
                return Ok(emails);
            else
                return BadRequest("Server error.");
        }

        [HttpGet]
        [Route("GetFollowedUsers")]
        public IActionResult GetMyFollowedUsersDetails(int userId)
        {
            User user = new User();
            List<string> details = user.GetMyFollowedUsersDetails(userId);

            if (details.Any())
                return Ok(details);
            else
                return BadRequest("Server error.");
        }

        [HttpPost("Follow")]
        public async Task<IActionResult> FollowUser(int followerId, string followedEmail)
        {
            var userClaims = User.Claims.ToList();
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            foreach (var claim in userClaims)
            {
                Console.WriteLine($"   - {claim.Type}: {claim.Value}");
            }

            // בדיקה אם זה Admin
            bool isAdmin = User.IsInRole("Admin");

            User user = new User();
            int result = user.FollowUser(followerId, followedEmail);

            if (result > 0)
            {
                // הוסף התראה על עוקב חדש - משופר עם הפונקציות החדשות
                try
                {
                    string followerName = user.GetUserNameById(followerId);
                    User followedUser = user.GetUserByEmail(followedEmail);

                    if (!string.IsNullOrEmpty(followerName) && followedUser != null)
                    {
                        // שלח התראה למשתמש שעליו עוקבים
                        await notifications.NotifyNewFollower(followedUser.Id, followerName);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to send follow notification: {ex.Message}");
                }

                return Ok("Follow successfully");
            }
            else
                return BadRequest("Already following or failed to add follow");
        }


        [HttpDelete("Unfollow")]
        public IActionResult UnfollowUser(int followerId,  string followedEmail)
        {
            User user = new User();
            int result = user.UnFollowUser(followerId, followedEmail);

            if (result > 0)
                return Ok("Unfollowed successfully");
            else
                return BadRequest("Failed to unfollow");
        }

        [HttpPut("UpdateProfile")]
        public IActionResult UpdateProfile(int userId, [FromBody] string newName)
        {
            User user = new User();
            int result = user.ChangeUserName(userId, newName);

            if (result == 1)
                return BadRequest("Failed to update username.");

            return Ok(new { message = "Profile updated successfully." });
        }

        [HttpPut("ChangePassword")]
        public IActionResult UpdatePassword(int userId, [FromBody] string newPass)
        {
            User user = new User();
            int result = user.ChangePassword(userId, newPass);

            if (result == 1)
                return BadRequest("Failed to update username.");

            return Ok(new { message = "Profile updated successfully." });
        }

        [HttpGet]
        [Route("AllActivities")]
        public IActionResult GetAllUserActivities(int userId, int count)
        {
            User u = new User();
            List<Dictionary<string, object>> activities = u.GetActivitiesForUser(userId, count);

            if (activities != null && activities.Any())
                return Ok(activities);
            else
                return BadRequest("No activities found or server error.");
        }

        [HttpPost("SaveFCMTokenAlt")]
        public IActionResult SaveFCMTokenAlt(int userId, string fcmToken)
        {
            try
            {
                int result = notifications.SaveFCMToken(userId, fcmToken);

                if (result > 0)
                {
                    return Ok("FCM token saved successfully");
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
    }
}

using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newsite_Server.BL;
using Newsite_Server.Services;
using Newtonsoft.Json;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Security.Claims;
using System.Text;
using CloudinaryDotNet; // For FileDescription
using CloudinaryDotNet.Actions;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private TokenService _tokenService;
        private readonly Notifications notifications;
        private readonly CloudinaryService _cloudinaryService;
        private readonly string _huggingFaceApiKey;


        public UsersController(IConfiguration config)
        {
            _tokenService = new TokenService();
            notifications = new Notifications();
            _cloudinaryService = new CloudinaryService(config);
            _huggingFaceApiKey = config["ApiKeys:HuggingFace"];
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

                    if (followedUser != null && followerId == followedUser.Id)
                    {
                        return BadRequest("You cannot follow yourself.");
                    }

                    if (!string.IsNullOrEmpty(followerName) && followedUser != null)
                    {
                        // שלח התראה למשתמש שעליו עוקבים
                        await notifications.NotifyNewFollower(followedUser.Id, followerName, followerId);
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

        [HttpPost("UploadProfileImage")]
        public async Task<IActionResult> UploadProfileImage([FromForm] UploadProfileImageRequest request)
        {
            if (request.ImageFile == null || request.ImageFile.Length == 0)
                return BadRequest("No image file provided");

            var imageUrl = await _cloudinaryService.UploadImageAsync(request.ImageFile, request.UserId.ToString());

            if (string.IsNullOrEmpty(imageUrl))
                return BadRequest("Failed to upload image");

            return Ok(new { ImageUrl = imageUrl });
        }

        [HttpPost("GenerateProfileImage")]
        public async Task<IActionResult> GenerateProfileImage([FromBody] GenerateProfileImageRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Prompt))
                return BadRequest("Prompt is required.");

            // קריאת המפתח מקובץ טקסט (כמו אצלך ב-ArticlesController)
            string huggingFaceApiKey;
            try
            {
                huggingFaceApiKey = _huggingFaceApiKey;
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Failed to read HuggingFace API key: " + ex.Message);
            }

            // קריאה ל-HuggingFace Stable Diffusion
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", huggingFaceApiKey);

            var payload = new { inputs = req.Prompt };
            var json = System.Text.Json.JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync(
                "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                string error = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, error);
            }

            // קבלת התמונה כ-byte[]
            var imageBytes = await response.Content.ReadAsByteArrayAsync();

            // העלאה ל-Cloudinary
            using var ms = new MemoryStream(imageBytes);
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription("generated.png", ms),
                Folder = "profile_pics",
                PublicId = $"profile_pics/{req.UserId}"
            };
            var uploadResult = await _cloudinaryService.UploadRawStreamAsync(uploadParams);

            if (uploadResult == null || string.IsNullOrEmpty(uploadResult.SecureUrl?.ToString()))
                return StatusCode(500, "Failed to upload generated image to Cloudinary.");

            // אפשרות: עדכן את כתובת התמונה בפרופיל המשתמש במסד הנתונים כאן

            return Ok(new { imageUrl = uploadResult.SecureUrl.ToString() });
        }
    }
}

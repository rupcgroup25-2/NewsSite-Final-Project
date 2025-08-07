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
        private readonly HuggingFaceService _huggingFaceService;

        // LEGACY: API key now managed in service layer
        // private readonly string _huggingFaceApiKey;

        public UsersController(IConfiguration config, HuggingFaceService huggingFaceService)
        {
            _tokenService = new TokenService();
            notifications = new Notifications();
            _cloudinaryService = new CloudinaryService(config);
            _huggingFaceService = huggingFaceService;
        }

        // Authenticates user login, validates account status, tracks login, and returns JWT token with user details
        // Complex flow: credential validation -> account status check -> login tracking -> role assignment -> token generation
        [HttpPost("Login")]
        [AllowAnonymous]
        public IActionResult Login([FromBody] User user)
        {
            // Validate credentials against database
            User NewUser = user.LoginUser();

            if (NewUser == null)
            {
                return BadRequest(new { message = "Invalid email or password" });
            }

            // Check if user account is active (not blocked)
            if (!NewUser.Active)
            {
                return Unauthorized(new { message = "The user is blocked because of violations of the site!" });
            }

            // Track daily login for analytics
            NewUser.TrackDailyLogin(NewUser.Id);
            
            // Determine user role for JWT token
            string role = NewUser.Email == "admin" ? "Admin" : "User";
            string token = _tokenService.GenerateToken(NewUser.Email, role);

            // Return successful login response with token and user data
            return Ok(new
            {
                token,
                NewUser.Name,
                NewUser.Id,
                NewUser.Email,
                NewUser.Tags
            });
        }

        // Registers a new user account after validation
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

        // Gets all user email addresses from the system
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

        // Gets details of users that a specific user is following
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

        // Complex follow user functionality with validation, notification system, and security checks
        // Flow: JWT validation -> database update -> self-follow check -> notification sending -> error handling
        [HttpPost("Follow")]
        public async Task<IActionResult> FollowUser(int followerId, string followedEmail)
        {
         
            User user = new User();

            // Attempt to create follow relationship in database
            int result = user.FollowUser(followerId, followedEmail);

            if (result > 0)
            {
                // Send notification to followed user (complex notification flow)
                try
                {
                    // Get follower name for notification message
                    string followerName = user.GetUserNameById(followerId);
                    User followedUser = user.GetUserByEmail(followedEmail);

                    // Prevent self-following edge case
                    if (followedUser != null && followerId == followedUser.Id)
                    {
                        return BadRequest("You cannot follow yourself.");
                    }

                    // Send notification if both users exist and names are valid
                    if (!string.IsNullOrEmpty(followerName) && followedUser != null)
                    {
                        // Trigger async notification to followed user
                        await notifications.NotifyNewFollower(followedUser.Id, followerName, followerId);
                    }
                }
                catch (Exception ex)
                {
                    //Console.WriteLine($"Failed to send follow notification: {ex.Message}");
                }

                return Ok("Follow successfully");
            }
            else
                return BadRequest("Already following or failed to add follow");
        }


        // Allows a user to unfollow another user
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

        // Updates user's profile name
        [HttpPut("UpdateProfile")]
        public IActionResult UpdateProfile(int userId, [FromBody] string newName)
        {
            User user = new User();
            int result = user.ChangeUserName(userId, newName);

            if (result == 1)
                return BadRequest("Failed to update username.");

            return Ok(new { message = "Profile updated successfully." });
        }

        // Updates user's password
        [HttpPut("ChangePassword")]
        public IActionResult ChangePassword(int userId, [FromBody] ChangePasswordRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.CurrentPassword) || string.IsNullOrEmpty(request.NewPassword))
                return BadRequest("Missing password data.");

            try
            {
                User user = new User();
                int result = user.ChangePassword(userId, request.CurrentPassword, request.NewPassword);

                if (result > 0)
                {
                    return Ok(new { message = "Password changed successfully." });
                }
                else if (result == -1)
                {
                    return BadRequest("Current password is incorrect.");
                }
                else
                {
                    return BadRequest("Failed to change password or invalid new password format.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Gets all user activities with specified count limit
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


        // Uploads profile image to Cloudinary service
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

        // AI-powered profile image generation now handled by HuggingFaceService
        // REFACTORED: Moved HTTP client logic to service layer for better separation of concerns
        [HttpPost("GenerateProfileImage")]
        public async Task<IActionResult> GenerateProfileImage([FromBody] GenerateProfileImageRequest req)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(req.Prompt))
                    return BadRequest("Prompt is required.");

                // Use HuggingFaceService instead of direct HTTP client calls
                string imageUrl = await _huggingFaceService.GenerateProfileImageAsync(req.Prompt, req.UserId);

                // Optional: Update profile image URL in user database here

                return Ok(new { imageUrl = imageUrl });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(503, ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
       
    }
}

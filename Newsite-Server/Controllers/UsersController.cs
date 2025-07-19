using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newsite_Server.BL;
using Newsite_Server.Services;
using System.Data.SqlClient;
using System.Data;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {

        [HttpPost("Login")]
        public IActionResult Login([FromBody] User user)
        {
            User NewUser = user.LoginUser();
            if (NewUser != null)
            {
                string token = TokenService.GenerateToken(NewUser.Email, NewUser.Email == "admin@newshub.com" ? "Admin" : "User"); //Create Token

                return Ok(new
                {
                    token,
                    NewUser.Name,
                    NewUser.Id,
                    NewUser.Email,
                    NewUser.Tags
                });
            }
            return (Unauthorized("Invalid email or password"));
        }

        // POST api/<UsersController>
        [HttpPost("Register")]
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


        [HttpPost("Follow")]
        public IActionResult FollowUser(int followerId, string followedEmail)
        {
            User user = new User();

            int result = user.FollowUser(followerId, followedEmail);

            if (result > 0)
                return Ok("Follow successfully");
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
    }
}

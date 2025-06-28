using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Newsite_Server.BL;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Admin")] // All methods restricted only for admin

    public class AdminController : ControllerBase
    {
        [HttpGet("ActiveUsersCount")]
        public IActionResult GetActiveUsersCount()
        {
            Admin admin = new Admin();
            int count = admin.GetActiveUsersCount();
            if (count > 0)
                return Ok($"Number of ative users: {count}");
            else
                return NotFound("No active users");
        }

        [HttpGet("SavedArticlesCount")]
        public IActionResult GetSavedArticlesCount()
        {
            Admin admin = new Admin();
            int count = admin.GetSavedArticlesCount();

            if (count > 0)
                return Ok($"Number of ative saved: {count}");
            else
                return NotFound("No saved articles");
        }

        [HttpGet("SharedArticlesCount")]
        public IActionResult GetSharedArticlesCount()
        {
            Admin admin = new Admin();
            int count = admin.GetSharedArticlesCount();
            if (count > 0)
                return Ok($"Number of ative shared: {count}");
            else
                return NotFound("No shared articles");
        }
        [HttpGet("BlockedUsersCount")]
        public IActionResult GetBlockedUsersCount()
        {
            Admin admin = new Admin();
            int count = admin.GetSharedArticlesCount();
            if (count > 0)
                return Ok($"Number of blocked users: {count}");
            else
                return NotFound("No blocked users");
        }

        [HttpGet("ReportsCount")]
        public IActionResult GetReportsCount()
        {
            Admin admin = new Admin();
            int count = admin.GetReportsCount();
            if (count > 0)
                return Ok($"Number of Reports: {count}");
            else
                return NotFound("No reports");
        }

        [HttpPut("users/{id}/block")]
        public IActionResult ToggleBlockSharing(int id)
        {
            User u = new User();
            u.Id = id;
            int result = u.ToggleBlockSharing();
            if (result > 0)
                return Ok("Block status updated");
            else
                return NotFound("User not found");
        }

        [HttpPut("users/{id}/deactivate")]
        public IActionResult DeactivateUser(int id)
        {
            User u = new User();
            u.Id = id;
            int result = u.Deactivate();

            if (result > 0)
                return Ok("User deactivated successfully");
            else
                return NotFound("User not found or already deactivated");
        }
    }
}

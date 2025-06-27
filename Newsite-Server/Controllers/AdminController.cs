using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Newsite_Server.BL;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // All methods restricted only for admin

    public class AdminController : ControllerBase
    {
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

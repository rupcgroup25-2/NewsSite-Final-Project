using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newsite_Server.BL;
using Newsite_Server.Services;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        // GET: api/<UsersController>
        [HttpGet]
        public IEnumerable<User> Get()
        {
            User user = new User();
            return user.GetAllUsers();
        }

        // GET api/<UsersController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }
        

        [HttpPost("Login")]
        public IActionResult Login([FromBody] User user)
        {
            User NewUser = user.LoginUser();
            if (NewUser != null)
            {
                string token = TokenService.GenerateToken(NewUser.Email, NewUser.Email == "admin@gmail.com" ? "Admin" : "User"); //Create Token

                return Ok(new
                {
                    token, NewUser.Name, NewUser.Id });
            }
            return (Unauthorized("Invalid email or password"));
        }

        // POST api/<UsersController>
        [HttpPost("Register")]
        public IActionResult Post([FromBody] User user)
        {
            if (user.Register() == 0)
            {
                return BadRequest("Invalid input - name or password does not meet the requirements.");
            }

            return Ok(new { message = "Success" });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("admin/users/{id}/block")]
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

        //[Authorize(Roles = "Admin")]
        [HttpPut("admin/users/{id}/deactivate")]
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
        // PUT api/<UsersController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<UsersController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}

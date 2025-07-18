using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newsite_Server.BL;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TagsController : ControllerBase
    {
        // GET: api/<TagsController>
        [HttpGet]
        public IEnumerable<Tag> Get()
        {
            Tag tag = new Tag();
            return tag.GetAllTags();
        }

        // POST api/<TagsController>
        [HttpPost]
        public IActionResult CreateTag([FromBody] Tag tag)
        {

            int result = tag.CreateTag();
            if (result > 0)
                return Ok("Tag created");
            else
            {
                return BadRequest("Tag already exists or error occurred");
            }
        }

        [HttpPost("assign/userId/{userId}/tagName/{tagName}")]
        public IActionResult AssignTagToUser(int userId, string tagName)
        {
            Tag tag = new Tag { Name = tagName };
            int tagId = tag.AssignToUser(userId);

            if (tagId > 0)
                return Ok(new { TagId = tagId, Message = "Tag assigned to user successfully." });
            else
                return BadRequest("Failed to assign tag to user (duplicate or error).");
        }

        [HttpDelete("RemoveFromUser/userId/{userId}/tagId/{tagId}")]
        public IActionResult RemoveTagFromUser(int userId, int tagId)
        {
            Tag tag = new Tag();
            int result = tag.RemoveTagFromUser(userId, tagId);

            if (result > 0)
                return Ok($"Tag '{tagId}' removed from user {userId}.");
            else
                return NotFound("Tag not found or not associated with this user.");
        }


        // DELETE api/<TagsController>/5
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public IActionResult DeleteTag(int id)
        {
            Tag t = new Tag();
            int result = t.DeleteTag(id);

            if (result == 1)
                return Ok(new { message = "Tag deleted successfully" });
            else
                return NotFound("Tag not found or could not be deleted");
        }
    }
}
 
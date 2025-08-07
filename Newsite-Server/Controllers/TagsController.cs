using FirebaseAdmin.Messaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newsite_Server.BL;
using Newsite_Server.Services;
using System.Text.Json;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TagsController : ControllerBase
    {
        private readonly TwitterService _twitterService;

        public TagsController(TwitterService twitterService)
        {
            _twitterService = twitterService;
        }


        // Gets all available tags from the database
        [HttpGet]
        public IEnumerable<Tag> Get()
        {
            Tag tag = new Tag();
            return tag.GetAllTags();
        }

        // Twitter trends now handled by TwitterService
        [HttpGet("twitterTrends/{location}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTwitterTrends(string location)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(location))
                    return BadRequest("Location is required.");

                var result = await _twitterService.GetTwitterTrendsAsync(location);
                
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (FileNotFoundException ex)
            {
                return StatusCode(500, ex.Message);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(503, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        // Creates a new tag in the database
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

        // Assigns a tag to a specific user by tag name
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

        // Removes a tag from a specific user
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


        // Deletes a tag from the system (admin only)
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
 
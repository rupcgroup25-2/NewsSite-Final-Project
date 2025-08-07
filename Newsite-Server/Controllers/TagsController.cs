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
        // LEGACY: Moved HTTP client functionality to service layer for better separation of concerns
        // private static Dictionary<string, string>? _twitterLocationMap = null;
        // private static DateTime _lastLocationLoadTime;
        // private static readonly object _locationMapLock = new();
        // private readonly string _twitter;

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
        // REFACTORED: Moved HTTP client logic to service layer for better separation of concerns
        [HttpGet("twitterTrends/{location}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTwitterTrends(string location)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(location))
                    return BadRequest("Location is required.");

                // Use TwitterService instead of direct HTTP client calls
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

        /* LEGACY CODE - Replaced with TwitterService
        [HttpGet("twitterTrends/{location}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTwitterTrends(string location)
        {
            if (string.IsNullOrWhiteSpace(location))
                return BadRequest("Location is required.");

            // Thread-safe location map loading with 12-hour cache refresh for performance optimization
            lock (_locationMapLock)
            {
                // Check if cache is empty or expired (12-hour refresh cycle)
                if (_twitterLocationMap == null || DateTime.Now - _lastLocationLoadTime > TimeSpan.FromHours(12))
                {
                    try
                    {
                        // Load location-to-ID mapping from local JSON file
                        var jsonText = System.IO.File.ReadAllText("twitter-api-locations.json");
                        _twitterLocationMap = JsonSerializer.Deserialize<Dictionary<string, string>>(jsonText);
                        _lastLocationLoadTime = DateTime.Now;
                    }
                    catch (Exception ex)
                    {
                        return StatusCode(500, "Failed to load Twitter locations file: " + ex.Message);
                    }
                }
            }

            if (!_twitterLocationMap.TryGetValue(location, out var locationId))
                return BadRequest($"Unknown location: {location}");

            string apiKey;
            try
            {
                apiKey = _twitter;
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Failed to read Twitter API key: " + ex.Message);
            }

            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri($"https://twitter-trends-by-location.p.rapidapi.com/location/{locationId}"),
                Headers =
        {
            { "x-rapidapi-key", apiKey },
            { "x-rapidapi-host", "twitter-trends-by-location.p.rapidapi.com" },
        },
            };

            using var client = new HttpClient();
            try
            {
                var response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var body = await response.Content.ReadAsStringAsync();
                return Ok(JsonDocument.Parse(body)); // or just return Ok(body) if you prefer raw string
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(503, "Failed to fetch Twitter trends: " + ex.Message);
            }
        }
        */


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
 
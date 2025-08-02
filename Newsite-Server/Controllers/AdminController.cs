using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Newsite_Server.BL;
using System.Security.Claims;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] // All methods restricted only for admin
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
            int count = admin.GetBlockedUsersCount();
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
        [HttpGet("ArticlePullRequestsCount")]
        public IActionResult ArticlePullRequestsCount(string apiName)
        {
            Admin admin = new Admin();
            int count = admin.GetPullRequestsCount(apiName);
            if (count > 0)
                return Ok($"Number of Reports: {count}");
            else
                return NotFound("No reports");
        }

        [HttpGet("DailyLogins")]
        public IActionResult GetDailyLoginsNumber()
        {
            Admin admin = new Admin();
            int count = admin.GetTotalDailyUserLogins();
            if (count > 0)
                return Ok($"Number of Logins Today: {count}");
            else
                return NotFound("No Logins yet");
        }

        [HttpGet("GetTopMostCommonTags")]
        public IActionResult GetTopMostCommonTags(int topCount)
        {
            Admin admin = new Admin();
            var rawResult = admin.GetTopMostCommonTags(topCount); // List<(string TagName, int TagCount)>

            if (rawResult.Any())
            {
                var result = rawResult.Select(t => new { TagName = t.TagName, TagCount = t.TagCount });
                return Ok(result);
            }
            else
            {
                return NotFound("No tags found");
            }
        }


        [HttpPut("{id}/block")]
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

        [HttpPut("{id}/deactivate")]
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

        [HttpGet("GetAllUsers")]
        public IEnumerable<User> Get()
        {
            User user = new User();
            return user.GetAllUsers();
        }

        [HttpDelete("DeleteAllComments/{articleId}")]
        public IActionResult DeleteAllComments(int articleId)
        {
            try
            {
                Comment c = new Comment();
                int result = c.DeleteAllCommentsForArticle(articleId);

                if (result > 0)
                    return Ok("All comments deleted successfully.");
                else
                    return NotFound("No comments found for this article.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("DeleteReport")]
        public IActionResult DeleteReport(int articleId, int userId)
        {
            try
            {
                User user = new User();
                int result = user.DeleteReportByArticleAndUserId(articleId, userId);
                if (result > 0)
                    return Ok("Report deleted");
                else
                    return NotFound("Report not found.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpDelete("DeleteArticle/{articleId}")]
        public IActionResult DeleteArticle(int articleId)
        {
            try
            {
                User user = new User();
                int result = user.DeleteArticleById(articleId);
                if (result > 0)
                    return Ok("Article deleted");
                else
                    return NotFound("Article not found.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }




    }
}

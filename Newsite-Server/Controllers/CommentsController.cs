using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newsite_Server.BL;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly Notifications notifications;


        public CommentsController(IConfiguration con)
        {
            notifications = new Notifications();

        }

        // Adds a new comment to an article and sends notifications
        [HttpPost("Addcomment")]
        public async Task<IActionResult> AddComment([FromBody] CommentWithArticleDto dto)
        {
            if (dto.comment == null || dto.comment.CommentText == null || dto.comment.CommentText.Trim().Length == 0)
                return BadRequest("Comment text cannot be empty.");

            try
            {
                Comment c = new Comment();
                int articleId = dto.article.InsertArticleIfNotExists();

                int result = c.AddComment(articleId, dto.comment.UserId, dto.comment.CommentText);

                if (result == 0)
                    return Conflict("User has already commented on this article.");

                // Send notification about new comment
                try
                {
                    User userHandler = new User();
                    string commenterName = userHandler.GetUserNameById(dto.comment.UserId);

                    if (!string.IsNullOrEmpty(commenterName))
                    {
                        await notifications.NotifyNewComment(
                            articleId,
                            dto.article.Title ?? "Article",
                            dto.comment.UserId,
                            commenterName
                        );
                    }
                }
                catch (Exception ex)
                {
                    //Console.WriteLine($"Failed to send comment notification: {ex.Message}");
                }

                return Ok("Comment added successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Deletes a comment by user and article IDs
        [HttpDelete("DeleteCommentByArticleAndUser")]
        public IActionResult DeleteCommentByArticleAndUser(int userId, int articleId)
        {
            try
            {
                Comment c = new Comment();
                int result = c.DeleteComment(userId, articleId);

                if (result > 0)
                    return Ok("Comment deleted successfully");
                else
                    return BadRequest("Failed to delete comment");
            }

            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        // Gets all comments for a specific article
        [HttpGet("GetAllCommentsForarticle/{articleId}")]
        [AllowAnonymous]
        public IActionResult GetCommentsByArticle(int articleId)
        {
            if (articleId <= 0)
                return BadRequest("Invalid article ID.");

            try
            {
                Comment c = new Comment();
                List<Comment> comments = c.GetCommentsByArticle(articleId);
                return Ok(comments);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

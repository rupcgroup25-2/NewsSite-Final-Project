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
        [HttpPost("Addcomment")]
        public IActionResult AddComment([FromBody] CommentWithArticleDto dto)
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

                return Ok("Comment added successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("article/{articleId}")]
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

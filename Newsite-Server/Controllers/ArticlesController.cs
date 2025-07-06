using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newsite_Server.BL;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArticlesController : ControllerBase
    {
        [AllowAnonymous]
        [HttpGet]
        //[Authorize(Roles = "Admin")] // All methods restricted only for admin
        public IEnumerable<Article> GetAllArticles()
        {
            Article article = new Article();
            return article.GetAllArticles();
        }

        [HttpGet("saved/{userId}")]
        public IActionResult GetSavedArticles(int userId)
        {
            List<Article> articles = new Article().GetSavedArticlesForUser(userId);

            if (articles.Count == 0)
                return NotFound("No saved articles found for this user");

            return Ok(articles);
        }

        [HttpGet("singleSaved/userId/{userId}/articleId/{articleId}")]
        public IActionResult GetSingleSavedArticles(int userId, int articleId)
        {
            Article article = new Article().GetSingleSavedArticlesForUser(userId, articleId);

            if (article == null)
                return NotFound("Article not found for this user");

            return Ok(article);
        }

        [HttpGet("shared/{userId}")]
        public IActionResult GetSharedArticles(int userId)
        {
            List<Article> articles = new Article().GetSharedArticlesForUser(userId);

            if (articles.Count == 0)
                return NotFound("No shared articles found for this user");

            return Ok(articles);
        }

        [HttpGet("singleShared/userId/{userId}/articleId/{articleId}")]
        public IActionResult GetSingleSharedArticles(int userId, int articleId)
        {
            Article article = new Article().GetSingleSharedArticlesForUser(userId, articleId);

            if (article == null)
                return NotFound("Article not found for this user");

            return Ok(article);
        }

        [HttpGet("search")]
        public IActionResult SearchSavedArticles([FromQuery] int userId, [FromQuery] string word)
        {
            if (string.IsNullOrWhiteSpace(word))
                return BadRequest("Search term cannot be null");

            List<Article> articles = new Article().GetSavedArticlesBySearch(userId, word);

            if (articles == null || articles.Count == 0)
                return NotFound("No matching saved articles found.");

            return Ok(articles);
        }

        // POST api/<ArticlesController>
        [HttpPost]
        public IActionResult AddArticle([FromBody] Article article)
        {
            int result = article.InsertArticleIfNotExists();

            if (result > 0)
                return Ok("Article Inserted successfully");
            else
                return Ok("Article already exists");
        }

        [HttpPost("AssignTagToArticle")]
        public IActionResult AssignTagToArticle(int articleId, int tagId)
        {
            if (articleId <= 0 || tagId <= 0)
                return BadRequest("Invalid IDs");

            Article article = new Article();
            int result = article.AssignArticleTag(articleId, tagId);
            if (result > 0)
                return Ok("Tag assigned to the article");
            else
            {
                return BadRequest("Couldn't assign tag to the article");
            }
        }

        [HttpPost("SaveArticle")]
        public IActionResult SaveArticle(int userId, [FromBody] Article article)
        {

            int result = article.SaveArticleForUser(userId, article.Id);

            if (result > 0)
                return Ok("Article saved successfully");
            else
                return Ok("Article already saved");
        }

        [HttpPost("ShareArticle")]
        public IActionResult ShareArticle(int userId, [FromBody] Article article)
        {
            int result = article.ShareArticleWithComment(userId, article.Id, article.Comment);

            if (result > 0)
                return Ok("Article shared successfully");
            else
                return Ok("Article already shared");
        }

        [HttpDelete("unsave")]
        public IActionResult DeleteSaved(int userId, int articleId)
        {
            Article article = new Article();
            article.Id = articleId;

            int result = article.DeleteSavedForUser(userId);
            return result > 0 ? Ok("Removed from saved") : NotFound("Not found");
        }

        [HttpDelete("unshare")]
        public IActionResult DeleteShared(int userId, int articleId)
        {
            Article article = new Article();
            article.Id = articleId;

            int result = article.DeleteSharedForUser(userId);
            return result > 0 ? Ok("Removed from shared") : NotFound("Not found");
        }

        [HttpDelete("RemoveTagFromArticle")]
        public IActionResult RemoveTagFromArticle(int articleId, int tagId)
        {
            int result = new Article().RemoveTag(articleId, tagId);
            return result > 0 ? Ok("Tag removed from article") : NotFound("Tag not found on article");
        }

    }
}

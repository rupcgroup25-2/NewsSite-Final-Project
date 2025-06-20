using Microsoft.AspNetCore.Mvc;
using Newsite_Server.BL;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArticlesController : ControllerBase
    {
        // GET: api/<ArticlesController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<ArticlesController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
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
        public IActionResult SaveArticle(int userId, int articleId)
        {
            Article article = new Article();

            int result = article.SaveArticleForUser(userId, articleId);

            if (result > 0)
                return Ok("Article saved successfully");
            else
                return Ok("Article already saved");
        }

        [HttpPost("ShareArticle")]
        public IActionResult ShareArticle(int userId, int articleId,string comment)
        {
            Article article = new Article();

            int result = article.ShareArticleWithComment(userId, articleId,comment);

            if (result > 0)
                return Ok("Article shared successfully");
            else
                return Ok("Article already shared");
        }

        // PUT api/<ArticlesController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<ArticlesController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}

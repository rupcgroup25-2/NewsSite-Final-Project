using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newsite_Server.BL;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text;


// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class ArticlesController : ControllerBase
    {

        const int MIN_SUMMARY_LENGTH = 100;
        const int MAX_SUMMARY_LENGTH = 200;
        const int MAX_TEXT_LENGTH = 3000;

        [HttpGet]
        [Authorize(Roles = "Admin")] // All methods restricted only for admin
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
        [HttpGet("singleReported/userId/{userId}/articleId/{articleId}")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetSingleReportedArticles(int userId, int articleId)
        {
            Article article = new Article().GetSingleReportedArticlesForUser(userId, articleId);

            if (article == null)
                return NotFound("Article not found for this user");

            return Ok(article);
        }

        [HttpGet("singleShared/articleId/{articleId}")]
        public IActionResult GetSharedArticleById(int articleId)
        {
            Article article = new Article().GetSharedArticleById(articleId);

            if (article == null)
                return NotFound("Article not found for this user");

            return Ok(article);
        }

        [HttpGet("singleArticleByUrl")]
        [AllowAnonymous]
        public IActionResult GetSingleArticleByUrl([FromQuery] string url)
        {
            Article article = new Article().GetSingleArticleByUrl(url);

            if (article == null)
                return NotFound("Article not found in DB");

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

        //[HttpPost("AssignTagToArticle")]
        //public IActionResult AssignTagToArticle(int articleId, int tagId)
        //{
        //    if (articleId <= 0 || tagId <= 0)
        //        return BadRequest("Invalid IDs");

        //    Article article = new Article();
        //    int result = article.AssignArticleTag(articleId, tagId);
        //    if (result > 0)
        //        return Ok("Tag assigned to the article");
        //    else
        //    {
        //        return BadRequest("Couldn't assign tag to the article");
        //    }
        //}

        [HttpPost("SaveArticle")]
        public IActionResult SaveArticle(int userId, [FromBody] Article article)
        {
            int result = article.SaveArticleForUser(userId, article.Id);

            if (result > 0)
                return Ok(article.Id);
            else
                return Ok(0);
        }

        [HttpPost("ShareArticle")]
        public IActionResult ShareArticle(int userId, [FromBody] Article article)
        {
            int result = article.ShareArticleWithComment(userId, article.Id, article.Comment);

            if (result > 0)
                return Ok("Article shared successfully");
            else if (result == -1) 
                return Ok("The user is blocked sharing");
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

        [HttpGet("extract")]
        [AllowAnonymous]
        public async Task<IActionResult> Extract(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return BadRequest("URL is required.");

            var content = await ArticleExtractor.ExtractArticleAsync(url);

            if (string.IsNullOrWhiteSpace(content))
                return NotFound("Could not extract article content.");

            return Ok(new { content = content });
        }

        [HttpPost("summarize")]
        [AllowAnonymous]
        public async Task<IActionResult> Summarize([FromBody] JsonElement requestBody)
         {
            if (!requestBody.TryGetProperty("text", out JsonElement textElement) || string.IsNullOrWhiteSpace(textElement.GetString()))
            {
                return BadRequest("Text is required for summarization.");
            }

            string text = textElement.GetString();

            // ✂️ הגבלה על אורך הטקסט - נחתוך אם ארוך מדי
            if (text.Length > MAX_TEXT_LENGTH)
            {
                text = text.Substring(0, MAX_TEXT_LENGTH);
            }

            string huggingFaceApiToken = System.IO.File.ReadAllText("huggingface-key.txt");


            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", huggingFaceApiToken);

            var payload = new
            {
                inputs = text,
                parameters = new { min_length = MIN_SUMMARY_LENGTH, max_length = MAX_SUMMARY_LENGTH},
                options = new { wait_for_model = true }
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", content);

            if (!response.IsSuccessStatusCode)
            {
                string error = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, error);
            }

            var responseString = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(responseString);
            var root = doc.RootElement;

            if (root.ValueKind != JsonValueKind.Array || root.GetArrayLength() == 0 || !root[0].TryGetProperty("summary_text", out JsonElement summaryElement))
            {
                return BadRequest("No summary returned from HuggingFace API.");
            }

            var firstSummary = summaryElement.GetString();

            return Ok(new { summary = firstSummary });
        }

        [HttpGet("top-headlines/pageSize/{pageSize}/language/{language}/country/{country}/category/{category?}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTopHeadlines(int pageSize, string language, string country, string? category = null)
        {
            string newsApiKey;
            try
            {
                newsApiKey = System.IO.File.ReadAllText("newsapi-key.txt").Trim();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Failed to read NewsAPI key: " + ex.Message);
            }

            string url = $"https://newsapi.org/v2/top-headlines?apiKey={newsApiKey}&pageSize={pageSize}&language={language}&country={country}";

            if (!string.IsNullOrWhiteSpace(category))
            {
                url += $"&category={category}";
            }


            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("NewsHubServer/1.0");


            HttpResponseMessage response;
            try
            {
                response = await httpClient.GetAsync(url);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error calling NewsAPI: " + ex.Message);
            }

            if (!response.IsSuccessStatusCode)
            {
                string error = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, error);
            }

            string jsonResponse = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(jsonResponse);
            var root = doc.RootElement;

            if (!root.TryGetProperty("articles", out JsonElement articlesElement))
            {
                return BadRequest("No articles returned from NewsAPI.");
            }

            var articles = JsonSerializer.Deserialize<List<object>>(articlesElement.GetRawText());
            
            Article temp = new Article();//in order to increase the api calls counter of NewsAPI
            temp.increaseNewsApiCounter();

            return Ok(new { articles });

        }

        [HttpGet("searchArticles/{query}/{from?}/{to?}")]
        [AllowAnonymous]

        public async Task<IActionResult> SearchArticles(string query, string? from = null, string? to = null)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query is required.");

            string newsApiKey;
            try
            {
                newsApiKey = System.IO.File.ReadAllText("newsapi-key.txt").Trim();
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Failed to read NewsAPI key: " + ex.Message);
            }

            var baseUrl = "https://newsapi.org/v2/everything";
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("NewsHubServer/1.0");

            var urlBuilder = new StringBuilder($"{baseUrl}?apiKey={newsApiKey}&q={Uri.EscapeDataString(query)}&language=en&sortBy=relevancy&pageSize=20");

            if (!string.IsNullOrEmpty(from))
                urlBuilder.Append($"&from={Uri.EscapeDataString(from)}");
            if (!string.IsNullOrEmpty(to))
                urlBuilder.Append($"&to={Uri.EscapeDataString(to)}");

            var response = await httpClient.GetAsync(urlBuilder.ToString());
            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, "Failed to fetch articles.");

            var jsonString = await response.Content.ReadAsStringAsync();
            var json = JsonDocument.Parse(jsonString);
            var rawArticles = json.RootElement.GetProperty("articles");
            var filteredArticles = rawArticles.EnumerateArray()
    .Where(a =>
        a.TryGetProperty("title", out _) &&
        (a.TryGetProperty("description", out _) || a.TryGetProperty("content", out _)) &&
        a.TryGetProperty("urlToImage", out _));

            var articles = filteredArticles
                .Select((a, index) =>
                {
                    var source = a.GetProperty("source").GetProperty("name").GetString();
                    Console.WriteLine($"Article Source: {source}");

                    return new
                    {
                        id = $"search_{query}_{index}",
                        title = a.GetProperty("title").GetString(),
                        content = a.TryGetProperty("content", out var content) ? content.GetString() : null,
                        description = a.TryGetProperty("description", out var desc) ? desc.GetString() : null,
                        publishedAt = a.TryGetProperty("publishedAt", out var date) ? date.GetString() : null,
                        urlToImage = a.GetProperty("urlToImage").GetString(),
                        url = a.GetProperty("url").GetString(),
                        source = source,
                    };
                }).ToList();


            Article temp = new Article();//in order to increase the api calls counter of NewsAPI
            temp.increaseNewsApiCounter();

            return Ok(articles);
        }

    }

}


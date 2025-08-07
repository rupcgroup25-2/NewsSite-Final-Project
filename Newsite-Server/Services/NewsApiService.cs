using System.Text;
using System.Text.Json;

namespace Newsite_Server.Services
{
    /// <summary>
    /// Service for handling all NewsAPI integration - manages HTTP client calls for news articles
    /// Centralizes API key management and provides clean interface for controllers
    /// </summary>
    public class NewsApiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _newsApiKey;

        public NewsApiService(IConfiguration config, HttpClient httpClient)
        {
            _httpClient = httpClient;
            _newsApiKey = config["ApiKeys:NewsApi"];
            
            // Configure HTTP client with standard headers
            _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("NewsHubServer/1.0");
        }

        /// <summary>
        /// Gets recommended articles based on user's tags from NewsAPI
        /// Complex personalization workflow: tag validation → query building → API call → data filtering → content transformation
        /// </summary>
        /// <param name="tags">List of tags to search for</param>
        /// <param name="pageSize">Number of articles to return</param>
        /// <param name="language">Language code for articles</param>
        /// <returns>List of recommended articles</returns>
        public async Task<object> GetRecommendedArticlesAsync(List<string> tagNames, int pageSize, string language)
        {
            if (tagNames == null || !tagNames.Any())
                throw new ArgumentException("At least one tag is required.");

            // Create OR query from tags
            string query = string.Join(" OR ", tagNames);

            var baseUrl = "https://newsapi.org/v2/everything";
            var urlBuilder = new StringBuilder($"{baseUrl}?apiKey={_newsApiKey}&q={Uri.EscapeDataString(query)}");
            urlBuilder.Append($"&language={Uri.EscapeDataString(language)}");
            urlBuilder.Append($"&sortBy=publishedAt&pageSize={pageSize}");

            var response = await _httpClient.GetAsync(urlBuilder.ToString());
            
            if (!response.IsSuccessStatusCode)
                throw new HttpRequestException($"NewsAPI request failed with status {response.StatusCode}");

            var jsonString = await response.Content.ReadAsStringAsync();
            var json = JsonDocument.Parse(jsonString);
            var rawArticles = json.RootElement.GetProperty("articles");

            var articles = rawArticles.EnumerateArray()
                .Where(a =>
                    a.TryGetProperty("title", out _) &&
                    (a.TryGetProperty("description", out _) || a.TryGetProperty("content", out _)) &&
                    a.TryGetProperty("urlToImage", out _))
                .Select((a, index) => new
                {
                    id = $"recommended_{index}",
                    title = a.GetProperty("title").GetString(),
                    content = a.TryGetProperty("content", out var content) ? content.GetString() : null,
                    description = a.TryGetProperty("description", out var desc) ? desc.GetString() : null,
                    publishedAt = a.TryGetProperty("publishedAt", out var date) ? date.GetString() : null,
                    urlToImage = a.GetProperty("urlToImage").GetString(),
                    url = a.GetProperty("url").GetString(),
                    source = a.GetProperty("source").GetProperty("name").GetString(),
                }).ToList();

            return articles;
        }

        /// <summary>
        /// Searches articles by query with optional date range from NewsAPI
        /// </summary>
        /// <param name="query">Search query</param>
        /// <param name="from">Optional start date</param>
        /// <param name="to">Optional end date</param>
        /// <returns>List of search results</returns>
        public async Task<object> SearchArticlesAsync(string query, string? from = null, string? to = null)
        {
            if (string.IsNullOrWhiteSpace(query))
                throw new ArgumentException("Query is required.");

            var baseUrl = "https://newsapi.org/v2/everything";
            var urlBuilder = new StringBuilder($"{baseUrl}?apiKey={_newsApiKey}&q={Uri.EscapeDataString(query)}&language=en&sortBy=relevancy&pageSize=20");

            if (!string.IsNullOrEmpty(from))
                urlBuilder.Append($"&from={Uri.EscapeDataString(from)}");
            if (!string.IsNullOrEmpty(to))
                urlBuilder.Append($"&to={Uri.EscapeDataString(to)}");

            var response = await _httpClient.GetAsync(urlBuilder.ToString());
            
            if (!response.IsSuccessStatusCode)
                throw new HttpRequestException($"NewsAPI search request failed with status {response.StatusCode}");

            var jsonString = await response.Content.ReadAsStringAsync();
            var json = JsonDocument.Parse(jsonString);
            var rawArticles = json.RootElement.GetProperty("articles");
            
            var articles = rawArticles.EnumerateArray()
                .Where(a =>
                    a.TryGetProperty("title", out _) &&
                    (a.TryGetProperty("description", out _) || a.TryGetProperty("content", out _)) &&
                    a.TryGetProperty("urlToImage", out _))
                .Select((a, index) => new
                {
                    id = $"search_{query}_{index}",
                    title = a.GetProperty("title").GetString(),
                    content = a.TryGetProperty("content", out var content) ? content.GetString() : null,
                    description = a.TryGetProperty("description", out var desc) ? desc.GetString() : null,
                    publishedAt = a.TryGetProperty("publishedAt", out var date) ? date.GetString() : null,
                    urlToImage = a.GetProperty("urlToImage").GetString(),
                    url = a.GetProperty("url").GetString(),
                    source = a.GetProperty("source").GetProperty("name").GetString(),
                }).ToList();

            return articles;
        }

        /// <summary>
        /// Gets top headlines from NewsAPI with optional filtering
        /// </summary>
        /// <param name="pageSize">Number of articles to return</param>
        /// <param name="category">Required category filter</param>
        /// <param name="language">Optional language filter</param>
        /// <param name="country">Optional country filter</param>
        /// <param name="page">Page number for pagination</param>
        /// <returns>Raw JSON response from NewsAPI</returns>
        public async Task<string> GetTopHeadlinesAsync(int pageSize, string category, string? language = null, string? country = null, int page = 0)
        {
            if (string.IsNullOrWhiteSpace(category))
                throw new ArgumentException("Category is required.");

            // Build dynamic URL based on parameters
            var url = $"https://newsapi.org/v2/top-headlines?pageSize={pageSize}&page={page}&apiKey={_newsApiKey}&category={category}";

            if (!string.IsNullOrWhiteSpace(language))
                url += $"&language={language}";

            if (!string.IsNullOrWhiteSpace(country))
                url += $"&country={country}";

            var response = await _httpClient.GetAsync(url);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new HttpRequestException($"NewsAPI top headlines request failed with status {response.StatusCode}: {content}");

            return content;
        }
    }
}

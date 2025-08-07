using System.Text.Json;

namespace Newsite_Server.Services
{
    /// <summary>
    /// Service for handling Twitter API integration - manages trending hashtags by location
    /// Centralizes Twitter API key management and location mapping logic
    /// </summary>
    public class TwitterService
    {
        private readonly HttpClient _httpClient;
        private readonly string _twitterApiKey;
        private static Dictionary<string, string>? _twitterLocationMap = null;
        private static DateTime _lastLocationLoadTime;
        private static readonly object _locationMapLock = new();

        public TwitterService(IConfiguration config, HttpClient httpClient)
        {
            _httpClient = httpClient;
            _twitterApiKey = config["ApiKeys:Twitter"];
        }

        /// <summary>
        /// Gets Twitter trending topics for a specific location
        /// Complex Twitter trends fetching with location mapping, caching, and external API integration
        /// Multi-step process: location validation → file caching → location ID lookup → API call → response parsing
        /// </summary>
        /// <param name="location">Location name to get trends for</param>
        /// <returns>JSON document containing trending topics</returns>
        public async Task<JsonDocument> GetTwitterTrendsAsync(string location)
        {
            if (string.IsNullOrWhiteSpace(location))
                throw new ArgumentException("Location is required.");

            // Thread-safe location map loading with 12-hour cache refresh for performance optimization
            lock (_locationMapLock)
            {
                // Check if cache is empty or expired (12-hour refresh cycle)
                if (_twitterLocationMap == null || DateTime.Now - _lastLocationLoadTime > TimeSpan.FromHours(12))
                {
                    try
                    {
                        // Load location-to-ID mapping from local JSON file
                        var jsonText = File.ReadAllText("twitter-api-locations.json");
                        _twitterLocationMap = JsonSerializer.Deserialize<Dictionary<string, string>>(jsonText);
                        _lastLocationLoadTime = DateTime.Now;
                    }
                    catch (Exception ex)
                    {
                        throw new FileNotFoundException("Failed to load Twitter locations file: " + ex.Message);
                    }
                }
            }

            if (!_twitterLocationMap.TryGetValue(location, out var locationId))
                throw new ArgumentException($"Unknown location: {location}");

            // Configure request with Twitter API headers
            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Get,
                RequestUri = new Uri($"https://twitter-trends-by-location.p.rapidapi.com/location/{locationId}"),
                Headers =
                {
                    { "x-rapidapi-key", _twitterApiKey },
                    { "x-rapidapi-host", "twitter-trends-by-location.p.rapidapi.com" },
                },
            };

            try
            {
                var response = await _httpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var body = await response.Content.ReadAsStringAsync();
                return JsonDocument.Parse(body);
            }
            catch (HttpRequestException ex)
            {
                throw new HttpRequestException("Failed to fetch Twitter trends: " + ex.Message);
            }
        }
    }
}

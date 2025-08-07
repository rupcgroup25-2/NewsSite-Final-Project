using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace Newsite_Server.Services
{
    /// <summary>
    /// Service for handling HuggingFace AI API integration - manages text summarization and image generation
    /// Centralizes HuggingFace API key management and provides clean interface for AI operations
    /// </summary>
    public class HuggingFaceService
    {
        private readonly HttpClient _httpClient;
        private readonly string _huggingFaceApiKey;
        private readonly CloudinaryService _cloudinaryService;

        // Constants for summarization parameters
        private const int MIN_SUMMARY_LENGTH = 100;
        private const int MAX_SUMMARY_LENGTH = 200;
        private const int MAX_TEXT_LENGTH = 3000;

        public HuggingFaceService(IConfiguration config, HttpClient httpClient, CloudinaryService cloudinaryService)
        {
            _httpClient = httpClient;
            _huggingFaceApiKey = config["ApiKeys:HuggingFace"];
            _cloudinaryService = cloudinaryService;
        }

        /// <summary>
        /// Complex AI-powered text summarization using HuggingFace transformer models
        /// Multi-step process: input validation → text truncation → API authentication → AI processing → response parsing → length validation
        /// </summary>
        /// <param name="text">Text to summarize</param>
        /// <returns>Summarized text</returns>
        public async Task<string> SummarizeTextAsync(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                throw new ArgumentException("Text is required for summarization.");

            // Apply text length limit to prevent API overload (max 3000 characters)
            if (text.Length > MAX_TEXT_LENGTH)
            {
                text = text.Substring(0, MAX_TEXT_LENGTH);
            }

            // Configure HTTP client with Bearer token authentication for HuggingFace API
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _huggingFaceApiKey);

            var payload = new
            {
                inputs = text,
                parameters = new { min_length = MIN_SUMMARY_LENGTH, max_length = MAX_SUMMARY_LENGTH },
                options = new { wait_for_model = true }
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", content);

            if (!response.IsSuccessStatusCode)
            {
                string error = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"HuggingFace summarization request failed with status {response.StatusCode}: {error}");
            }

            var responseString = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(responseString);
            var root = doc.RootElement;

            if (root.ValueKind != JsonValueKind.Array || root.GetArrayLength() == 0 || !root[0].TryGetProperty("summary_text", out JsonElement summaryElement))
            {
                throw new InvalidOperationException("No summary returned from HuggingFace API.");
            }

            var summary = summaryElement.GetString();
            if (string.IsNullOrWhiteSpace(summary))
                throw new InvalidOperationException("Empty summary returned from HuggingFace API.");

            return summary;
        }

        /// <summary>
        /// Complex AI-powered profile image generation using HuggingFace Stable Diffusion API
        /// Multi-step process: prompt validation → API authentication → AI image generation → cloud storage → URL return
        /// </summary>
        /// <param name="prompt">Text prompt for image generation</param>
        /// <param name="userId">User ID for image organization</param>
        /// <returns>URL of the generated and uploaded image</returns>
        public async Task<string> GenerateProfileImageAsync(string prompt, int userId)
        {
            if (string.IsNullOrWhiteSpace(prompt))
                throw new ArgumentException("Prompt is required.");

            // Configure HTTP client with Bearer token authentication
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _huggingFaceApiKey);

            var payload = new { inputs = prompt };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(
                "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                string error = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"HuggingFace image generation request failed with status {response.StatusCode}: {error}");
            }

            // Get the image as byte array
            var imageBytes = await response.Content.ReadAsByteArrayAsync();

            // Upload to Cloudinary
            using var ms = new MemoryStream(imageBytes);
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription("generated.png", ms),
                Folder = "profile_pics",
                PublicId = $"profile_pics/{userId}"
            };

            var uploadResult = await _cloudinaryService.UploadRawStreamAsync(uploadParams);

            if (uploadResult == null || string.IsNullOrEmpty(uploadResult.SecureUrl?.ToString()))
                throw new InvalidOperationException("Failed to upload generated image to Cloudinary.");

            return uploadResult.SecureUrl.ToString();
        }
    }
}

using HtmlAgilityPack;
using System;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

public static class ArticleExtractor
{
    private static readonly HttpClient httpClient = new();

    public static async Task<string> ExtractArticleAsync(string url)
    {
        try
        {
            var html = await httpClient.GetStringAsync(url);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // Remove scripts and styles
            RemoveNoiseNodes(doc);

            // Search content area with extended criteria
            HtmlNode contentNode =
                doc.DocumentNode.SelectSingleNode("//article") ??
                doc.DocumentNode.SelectSingleNode("//main") ??
                doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'content') or contains(@class, 'article') or contains(@class, 'entry') or contains(@class, 'post') or contains(@class, 'story')]") ??
                doc.DocumentNode.SelectSingleNode("//div[contains(@id, 'content') or contains(@id, 'article') or contains(@id, 'main') or contains(@id, 'story')]") ??
                doc.DocumentNode.SelectSingleNode("//section[contains(@class, 'content') or contains(@class, 'article')]");

            // fallback: find element with most paragraphs
            if (contentNode == null)
            {
                contentNode = doc.DocumentNode
                    .SelectNodes("//div | //section")
                    ?.Where(node => node.SelectNodes(".//p")?.Count >= 3)
                    .OrderByDescending(node => node.SelectNodes(".//p")?.Count ?? 0)
                    .ThenByDescending(node => node.InnerText.Length)
                    .FirstOrDefault();
            }

            // last fallback: div with most text
            if (contentNode == null)
            {
                contentNode = doc.DocumentNode
                    .SelectNodes("//div")
                    ?.OrderByDescending(div => div.InnerText.Length)
                    .FirstOrDefault();
            }

            if (contentNode == null)
                return null;

            // Clean text
            string rawText = HtmlEntity.DeEntitize(contentNode.InnerText);
            string cleanedText = CleanText(rawText);

            return cleanedText;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error extracting article: {ex.Message}");
            return null;
        }
    }

    private static void RemoveNoiseNodes(HtmlDocument doc)
    {
        var noiseXpaths = new[]
        {
            "//script", "//style", "//nav", "//footer", "//aside", "//form", "//noscript",
            "//header[@class='site-header' or @id='header']", "//div[@class='sidebar' or @class='widget']",
            "//div[contains(@class, 'comment') or contains(@class, 'social') or contains(@class, 'share')]"
        };

        foreach (var xpath in noiseXpaths)
        {
            var nodes = doc.DocumentNode.SelectNodes(xpath);
            if (nodes == null) continue;
            foreach (var node in nodes)
                node.Remove();
        }
    }

    private static string CleanText(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return "";

        // Replace multiple spaces, tabs, empty lines
        string cleaned = Regex.Replace(input, @"\s{2,}", " ");
        cleaned = Regex.Replace(cleaned, @"(\r?\n\s*){2,}", "\n\n"); // Preserve paragraphs
        return cleaned.Trim();
    }
}


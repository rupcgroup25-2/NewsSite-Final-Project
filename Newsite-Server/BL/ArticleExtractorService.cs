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

            // הסרה של סקריפטים וסטיילים
            RemoveNoiseNodes(doc);

            // חיפוש אזור תוכן לפי article / main / class/id
            HtmlNode contentNode =
                doc.DocumentNode.SelectSingleNode("//article") ??
                doc.DocumentNode.SelectSingleNode("//main") ??
                doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'content')]") ??
                doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'article')]") ??
                doc.DocumentNode.SelectSingleNode("//div[contains(@id, 'main')]");

            // fallback: חפש div עם הכי הרבה טקסט
            if (contentNode == null)
            {
                contentNode = doc.DocumentNode
                    .SelectNodes("//div")
                    ?.OrderByDescending(div => div.InnerText.Length)
                    .FirstOrDefault();
            }

            if (contentNode == null)
                return null;

            // ניקוי טקסט
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
            "//script", "//style", "//nav", "//footer", "//aside", "//form", "//noscript"
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

        // החלפת רווחים מרובים, טאבים, שורות ריקות
        string cleaned = Regex.Replace(input, @"\s{2,}", " ");
        cleaned = Regex.Replace(cleaned, @"(\r?\n\s*){2,}", "\n\n"); // שמירה על פסקאות
        return cleaned.Trim();
    }
}
using HtmlAgilityPack;
using System;
using System.Net.Http;
using System.Threading.Tasks;

public static class SimpleArticleExtractor
{
    private static readonly HttpClient httpClient = new();

    public static async Task<string> ExtractAsync(string url)
    {
        try
        {
            var html = await httpClient.GetStringAsync(url);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            // חיפוש גמיש לפי article או divים נפוצים
            var articleNode =
                doc.DocumentNode.SelectSingleNode("//article") ??
                doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'article')]") ??
                doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'content')]") ??
                doc.DocumentNode.SelectSingleNode("//main") ??
                doc.DocumentNode.SelectSingleNode("//div[contains(@id, 'main')]") ??
                doc.DocumentNode.SelectSingleNode("//div[string-length(normalize-space(text())) > 200]") ??
                doc.DocumentNode.SelectSingleNode("//body");

            if (articleNode == null)
                return null;

            var text = HtmlEntity.DeEntitize(articleNode.InnerText).Trim();

            return text;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error extracting article: {ex.Message}");
            return null;
        }
    }
}

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

//using HtmlAgilityPack;
//using System;
//using System.Linq;
//using System.Net.Http;
//using System.Text.RegularExpressions;
//using System.Threading.Tasks;

//public static class ArticleExtractor
//{
//    private static readonly HttpClient httpClient = new();

//    public static async Task<string> ExtractArticleAsync(string url)
//    {
//        try
//        {
//            var html = await httpClient.GetStringAsync(url);
//            var doc = new HtmlDocument();
//            doc.LoadHtml(html);

//            RemoveNoiseNodes(doc);

//            HtmlNode contentNode =
//                doc.DocumentNode.SelectSingleNode("//article") ??
//                doc.DocumentNode.SelectSingleNode("//main") ??
//                doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'content')]") ??
//                doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'article')]") ??
//                doc.DocumentNode.SelectSingleNode("//div[contains(@id, 'main')]");

//            if (contentNode == null)
//            {
//                contentNode = doc.DocumentNode
//                    .SelectNodes("//div")
//                    ?.OrderByDescending(div => div.InnerText.Length)
//                    .FirstOrDefault();
//            }

//            if (contentNode == null)
//                return null;

//            CleanHtmlNode(contentNode);

//            // טיפול נוסף לאחר הרכבת HTML
//            string finalHtml = $"<div>{contentNode.InnerHtml}</div>";
//            finalHtml = Regex.Replace(finalHtml, @"(\r?\n){2,}", "\n"); // הופך 2+ שורות לשורה אחת
//            finalHtml = finalHtml.Trim(); // מסיר התחלה/סיום

//            return finalHtml;
//        }
//        catch (Exception ex)
//        {
//            Console.WriteLine($"Error extracting article: {ex.Message}");
//            return null;
//        }
//    }

//    private static void RemoveNoiseNodes(HtmlDocument doc)
//    {
//        var noiseXpaths = new[]
//        {
//            "//script", "//style", "//nav", "//aside", "//form", "//noscript",
//            "//header", "//svg", "//button", "//input", "//iframe"
//        };

//        foreach (var xpath in noiseXpaths)
//        {
//            var nodes = doc.DocumentNode.SelectNodes(xpath);
//            if (nodes == null) continue;
//            foreach (var node in nodes)
//                node.Remove();
//        }
//    }

//    private static void CleanHtmlNode(HtmlNode node)
//    {
//        string[] allowedTags = { "p", "strong", "b", "em", "ul", "ol", "li", "div", "br" };

//        foreach (var descendant in node.Descendants().ToList())
//        {
//            if (!allowedTags.Contains(descendant.Name.ToLower()))
//            {
//                if (descendant.NodeType == HtmlNodeType.Element)
//                {
//                    descendant.ParentNode.ReplaceChild(HtmlTextNode.CreateNode(descendant.InnerText), descendant);
//                }
//            }
//            else
//            {
//                descendant.Attributes.RemoveAll();
//            }
//        }

//        foreach (var textNode in node.DescendantsAndSelf()
//                                     .Where(n => n.NodeType == HtmlNodeType.Text)
//                                     .Cast<HtmlTextNode>())
//        {
//            string cleanedText = Regex.Replace(textNode.Text, @"(\r?\n){2,}", "\n");
//            textNode.Text = cleanedText;
//        }
//    }
//}

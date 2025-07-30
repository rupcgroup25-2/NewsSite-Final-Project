namespace Newsite_Server.BL
{
    using HtmlAgilityPack;
    using System.Net.Http;
    using System.Threading.Tasks;
    using System.Collections.Generic;
    using Microsoft.Playwright;

    public class GoogleTrendsScraper
    {
        private static readonly HttpClient httpClient = new();

        public static async Task<List<string>> GetTrendingTopicsWithPlaywrightAsync(string countryCode = "US")
        {
            var url = $"https://trends.google.com/trending?geo={countryCode}&hours=168";
            var titles = new List<string>();

            using var playwright = await Playwright.CreateAsync();
            await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
            {
                Headless = true
            });

            var page = await browser.NewPageAsync();
            await page.GotoAsync(url, new PageGotoOptions { WaitUntil = WaitUntilState.NetworkIdle });

            var elements = await page.QuerySelectorAllAsync(".mZ3RIc");

            foreach (var element in elements)
            {
                var text = await element.InnerTextAsync();
                if (!string.IsNullOrWhiteSpace(text))
                    titles.Add(text.Trim());
            }

            return titles;
        }


        public static async Task<List<string>> GetTrendingTopicsAsync(string countryCode = "US")
        {
            var url = $"https://trends.google.com/trending?geo={countryCode}&hours=168";

            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("User-Agent", "Mozilla/5.0"); // Required to avoid bot detection

            var response = await httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var html = await response.Content.ReadAsStringAsync();

            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var titles = new List<string>();

            // Find trending topic titles by class
            var nodes = doc.DocumentNode.SelectNodes("//div[@class='mZ3RIc']"); //mZ3RIc is the class of titles in google trends

            if (nodes != null)
            {
                foreach (var node in nodes)
                {
                    var text = node.InnerText.Trim();
                    if (!string.IsNullOrWhiteSpace(text))
                        titles.Add(text);
                }
            }

            return titles;
        }
    }
}

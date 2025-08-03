using Newsite_Server.DAL;

namespace Newsite_Server.BL
{
    public class Article
    {
        int id;
        string title;
        string description;
        string url;
        string urlToImage;
        DateTime publishedAt;
        string sourceName;
        string author;
        string comment;
        List<string> tags;

        public Article()
        {
            tags = new List<string>();
        }

        public Article(int id, string title, string description, string url, string urlToImage, DateTime publishedAt, string sourceName, string author, List<string> tags)
        {
            this.Id = id;
            this.Title = title;
            this.Description = description;
            this.Url = url;
            this.UrlToImage = urlToImage;
            this.PublishedAt = publishedAt;
            this.SourceName = sourceName;
            this.Author = author;
            this.Tags = new List<string>();
        }

        public string Comment { get => comment; set => comment = value; }

        public int Id { get => id; set => id = value; }
        public string Title { get => title; set => title = value; }
        public string Description { get => description; set => description = value; }
        public string Url { get => url; set => url = value; }
        public string UrlToImage { get => urlToImage; set => urlToImage = value; }
        public DateTime PublishedAt { get => publishedAt; set => publishedAt = value; }
        public string SourceName { get => sourceName; set => sourceName = value; }
        public string Author { get => author; set => author = value; }
        public int SharedById { get; set; }
        public string SharedByName { get; set; }
        public List<string> Tags { get; set; }


        DBservices dbs = new DBservices();

        // Inserts article to database if it doesn't exist, returns article ID
        public int InsertArticleIfNotExists()
        {
            Article existing = dbs.GetArticleByUrl(this.Url);
            int articleId;

            if (existing != null)
            {
                articleId = existing.Id;
            }
            else
            {
                int newId = dbs.InsertArticle(this);
                if (newId <= 0)
                    return -1;

                this.Id = newId;
                articleId = newId;
            }

            if (Tags != null && Tags.Count > 0)
            {
                AssignTagsToArticle(articleId, Tags);
            }

            return articleId;
        }

        // Assigns a tag to an article
        public int AssignArticleTag(int articleId, string tag) //Assign tag to article
        {
            return dbs.AssignTagToArticle(articleId, tag);
        }

        // Assigns multiple tags to an article
        public void AssignTagsToArticle(int articleId, List<string> tags)
        {
            if (tags == null || tags.Count == 0)
                return;

            foreach (string tag in tags)
            {
                AssignArticleTag(articleId, tag);
            }
        }

        // Saves an article for a specific user
        public int SaveArticleForUser(int userId, int articleId)
        {
            // check if already exist or just inserted and got an id
            int insertResult = InsertArticleIfNotExists();
            if (insertResult != this.id)
                return dbs.SaveArticleForUser(userId, insertResult);
            else
                return dbs.SaveArticleForUser(userId, this.Id);
        }

        // Shares an article with a comment by a user
        public int ShareArticleWithComment(int userId, int articleId, string comment)
        {
            int watchSharedPermission = dbs.GetWatchSharedPermission(userId);

            if (watchSharedPermission == 0)
            {// blockSharing is 0
                int insertResult = InsertArticleIfNotExists();

                //  SharedArticles insert to the table
                return dbs.ShareArticleForUser(userId, insertResult, comment);
            }
            else return -1;
        }

        // Gets all saved articles for a specific user
        public List<Article> GetSavedArticlesForUser(int userId)
        {
            return dbs.GetSavedArticlesForUser(userId);
        }

        // Gets a single saved article for a user
        public Article GetSingleSavedArticlesForUser(int userId, int articleId)
        {
            return dbs.GetSingleSavedArticlesForUser(userId, articleId);
        }

        // Gets all shared articles for a specific user
        public List<Article> GetSharedArticlesForUser(int userId)
        {
            int watchSharedPermission = dbs.GetWatchSharedPermission(userId);
            if (watchSharedPermission == 0 || watchSharedPermission == 1)
            {
                return dbs.GetSharedArticlesForUser(userId);
            }

            return new List<Article>();
        }

        public Article GetSingleSharedArticlesForUser(int userId, int articleId)
        {
            return dbs.GetSingleSharedArticlesForUser(userId, articleId);
        }
        public Article GetSingleReportedArticlesForUser(int userId, int articleId)
        {
            return dbs.GetSingleReportedArticlesForUser(userId, articleId);
        }
        public Article GetSharedArticleById(int articleId)
        {
            return dbs.GetSingleSharedArticleByArticleId(articleId);
        }

        public Article GetSingleArticleByUrl(string url)
        {
            return dbs.GetArticleByUrl(url);
        }


        public int DeleteSavedForUser(int userId)
        {
            return dbs.DeleteSavedArticle(userId, this.Id);
        }

        public int DeleteSharedForUser(int userId)
        {
            return dbs.DeleteSharedArticle(userId, this.Id);
        }

        public int RemoveTag(int articleId, int tagId)
        {
            return dbs.RemoveTagFromArticle(articleId, tagId);
        }

        public List<Article> GetAllArticles()
        {
            return dbs.GetAllArticles();
        }

        public List<Article> GetSavedArticlesBySearch(int userId, string word)
        {
            return dbs.SearchSavedArticles(userId, word);
        }

        // Increases the NewsAPI counter for tracking API usage
        public int increaseNewsApiCounter()
        {
            return dbs.IncreaseApiCounter("NewsApiCalls");
        }
    }
}

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

        public Article() { }

        public Article(int id, string title, string description, string url, string urlToImage, DateTime publishedAt, string sourceName, string author)
        {
            this.Id = id;
            this.Title = title;
            this.Description = description;
            this.Url = url;
            this.UrlToImage = urlToImage;
            this.PublishedAt = publishedAt;
            this.SourceName = sourceName;
            this.Author = author;
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

        DBservices dbs = new DBservices();

        public int InsertArticleIfNotExists()
        {
            Article existing = dbs.GetArticleByUrl(this.Url);
            if (existing != null)
            {
                this.Id = existing.Id;
                return 0; // exists
            }

            int newId = dbs.InsertArticle(this);
            if (newId > 0)
                this.Id = newId; // new Id return from the db

            return newId;
        }

        public int AssignArticleTag(int articleId, int tagId) //Assign tag to article
        {
            return dbs.AssignTagToArticle(articleId, tagId);
        }

        public int SaveArticleForUser(int userId, int articleId)
        {
            // check if already exist or just inserted and got an id
            int insertResult = InsertArticleIfNotExists();

            return dbs.SaveArticleForUser(userId, this.Id);
        }

        public int ShareArticleWithComment(int userId, int articleId, string comment)
        {
            int insertResult = InsertArticleIfNotExists();

            //  SharedArticles insert to the table
            return dbs.ShareArticleForUser(userId, this.Id, comment);
        }

        public List<Article> GetSavedArticlesForUser(int userId)
        {
            return dbs.GetSavedArticlesForUser(userId);
        }

        public List<Article> GetSharedArticlesForUser(int userId)
        {
            return dbs.GetSharedArticlesForUser(userId);
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

    }
}

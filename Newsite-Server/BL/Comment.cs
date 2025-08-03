using Newsite_Server.DAL;

namespace Newsite_Server.BL
{
    public class Comment
    {
        int id;
        int articleId;
        int userId;
        string username;
        string commentText;
        DateTime createdAt;

        public int Id { get => id; set => id = value; }
        public int ArticleId { get => articleId; set => articleId = value; }
        public int UserId { get => userId; set => userId = value; }
        public string Username { get => username; set => username = value; }
        public string CommentText { get => commentText; set => commentText = value; }
        public DateTime CreatedAt { get => createdAt; set => createdAt = value; }

        public Comment(int id, int articleId, int userId, string username, string commentText, DateTime createdAt)
        {
            this.Id = id;
            this.ArticleId = articleId;
            this.UserId = userId;
            this.Username = username;
            this.CommentText = commentText;
            this.CreatedAt = createdAt;
        }

        public Comment() { }

        // Adds a new comment to an article
        public int AddComment(int articleId, int userId, string commentText)
        {
            DBservices dbs = new DBservices();
            return dbs.AddComment(articleId, userId, commentText);
        }

        // Gets all comments for a specific article
        public List<Comment> GetCommentsByArticle(int articleId)
        {
            DBservices dbs = new DBservices();
            return dbs.GetCommentsByArticle(articleId);
        }

        // Deletes a specific comment by user and article
        public int DeleteComment(int userId, int articleId)
        {
            DBservices dbs = new DBservices();
            return dbs.DeleteComment(userId, articleId);
        }

        // Deletes all comments for a specific article
        public int DeleteAllCommentsForArticle(int articleId)
        {
            DBservices dbs = new DBservices();
            return dbs.DeleteAllCommentsForArticle(articleId);
        }
    }

}

using Newsite_Server.DAL;

namespace Newsite_Server.BL
{
    public class Report
    {
        int id;
        int reporterId;
        int? articleId;
        int? sharedArticleId;
        string comment;
        DateTime reportedAt;

        public Report() { }

        public Report(int reporterId, int? articleId, int? sharedArticleId, string comment)
        {
            this.ReporterId = reporterId;
            this.ArticleId = articleId;
            this.SharedArticleId = sharedArticleId;
            this.Comment = comment;
            this.ReportedAt = DateTime.Now;
        }

        public int Id { get => id; set => id = value; }
        public int ReporterId { get => reporterId; set => reporterId = value; }
        public int? ArticleId { get => articleId; set => articleId = value; }
        public int? SharedArticleId { get => sharedArticleId; set => sharedArticleId = value; }
        public string Comment { get => comment; set => comment = value; }
        public DateTime ReportedAt { get => reportedAt; set => reportedAt = value; }

        DBservices dbs = new DBservices();

        public int SubmitReport()
        {
            return dbs.ReportArticles(ReporterId, ArticleId, SharedArticleId, Comment);
        }
        public List<Report> GetAllReports()
        {
            return dbs.GetAllReports();
        }

    }
}
using Newsite_Server.DAL;

namespace Newsite_Server.BL
{
    public class Report
    {
        int id;
        int reporterId;
        int? articleId;
        int? sharerId;
        string comment;
        DateTime reportedAt;

        public Report() { }

        public Report(int reporterId, int? articleId, int? sharerId, string comment)
        {
            this.ReporterId = reporterId;
            this.ArticleId = articleId;
            this.sharerId = sharerId;
            this.Comment = comment;
            this.ReportedAt = DateTime.Now;
        }

        public int Id { get => id; set => id = value; }
        public int ReporterId { get => reporterId; set => reporterId = value; }
        public int? ArticleId { get => articleId; set => articleId = value; }
        public int? SharerId { get => sharerId; set => sharerId = value; }
        public string Comment { get => comment; set => comment = value; }
        public DateTime ReportedAt { get => reportedAt; set => reportedAt = value; }

        DBservices dbs = new DBservices();

        // Submits a new report to the database
        public int SubmitReport()
        {
            return dbs.ReportArticles(ReporterId, ArticleId, sharerId, Comment);
        }
        // Gets all reports from the database
        public List<Object> GetAllReports()
        {
            return dbs.GetAllReportsOnArticle();
        }

    }
}
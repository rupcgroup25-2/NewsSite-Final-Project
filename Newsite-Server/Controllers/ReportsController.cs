using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newsite_Server.BL;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly Notifications notifications;

        public ReportsController()
        {
            notifications = new Notifications();
        }

        [HttpPost]
        public async Task<IActionResult> SubmitReport([FromBody] ReportWithArticleDto dto)
        {

            int resultSavingArticle = dto.Article.InsertArticleIfNotExists();

            dto.Report.ArticleId = resultSavingArticle;
            int resultSavingReport = dto.Report.SubmitReport();

            if (resultSavingReport > 0)
            {
                // שלח התראה רק לאדמינים, לא למשתמש שמדווח
                try
                {
                    // קבל את שם המדווח
                    User user = new User();
                    string reporterName = user.GetUserNameById(dto.Report.ReporterId) ?? "Unknown User";
                    
                    await notifications.NotifyAdminNewReport(
                        "Article Report", 
                        dto.Article.Title ?? "Unknown Article", 
                        reporterName,
                        dto.Report.ReporterId
                    );
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to send report notification: {ex.Message}");
                }

                return Ok("Report submitted successfully.");
            }
            else
                return BadRequest("Similar report has been already sumbitted.");

        }

        [HttpGet]
        [Authorize(Roles = "Admin")] // All methods restricted only for admin
        public IEnumerable<Object> GetAllReportAndArticles()
        {
            Report report = new Report();
            return report.GetAllReports();
        }
    }
}

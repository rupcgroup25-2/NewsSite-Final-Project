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

        // Submits a new report for an article and notifies admins
        // Complex workflow: article validation → report creation → admin notification → duplicate prevention
        // Process: article insertion → report validation → database insertion → reporter name lookup → admin notification dispatch
        [HttpPost]
        public async Task<IActionResult> SubmitReport([FromBody] ReportWithArticleDto dto)
        {

            int resultSavingArticle = dto.Article.InsertArticleIfNotExists();

            dto.Report.ArticleId = resultSavingArticle;
            int resultSavingReport = dto.Report.SubmitReport();

            if (resultSavingReport > 0)
            {
                // Send notification only to admins, not to the reporting user
                try
                {
                    Console.WriteLine($"🔍 Report submitted: Sending admin notification");
                    Console.WriteLine($"   Reporter ID: {dto.Report.ReporterId}");
                    Console.WriteLine($"   Article: {dto.Article.Title}");
                    
                    // Get the reporter's name
                    User user = new User();
                    string reporterName = user.GetUserNameById(dto.Report.ReporterId) ?? "Unknown User";
                    Console.WriteLine($"   Reporter name: {reporterName}");
                    
                    await notifications.NotifyAdminNewReport(
                        "Article Report", 
                        dto.Article.Title ?? "Unknown Article", 
                        reporterName,
                        dto.Report.ReporterId
                    );
                    
                    Console.WriteLine($"✅ Admin notification sent successfully");
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

        // Gets all reports and articles for admin review
        [HttpGet]
        [Authorize(Roles = "Admin")] // All methods restricted only for admin
        public IEnumerable<Object> GetAllReportAndArticles()
        {
            Report report = new Report();
            return report.GetAllReports();
        }
    }
}

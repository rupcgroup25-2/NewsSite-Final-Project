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
        //// GET: api/<ReportsController>
        //[HttpGet]
        //public IEnumerable<string> Get()
        //{
        //    return new string[] { "value1", "value2" };
        //}

        // POST api/<ReportsController>
        [HttpPost]
        public IActionResult SubmitReport([FromBody] ReportWithArticleDto dto)
        {
            int resultSavingArticle = dto.Article.InsertArticleIfNotExists();
            dto.Report.ArticleId = resultSavingArticle;
            int resultSavingReport = dto.Report.SubmitReport();

            if (resultSavingReport > 0)
                return Ok("Report submitted successfully.");
            else
                return BadRequest("Similar report already submitted.");
        }

        [AllowAnonymous]
        [HttpGet]
        //[Authorize(Roles = "Admin")] // All methods restricted only for admin
        public IEnumerable<Object> GetAllReportAndArticles()
        {
            Report report = new Report();
            return report.GetAllReports();
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newsite_Server.BL;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Newsite_Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly Notifications notifications;

        public CommentsController()
        {
            notifications = new Notifications();
        }

        [HttpPost("Addcomment")]
        public async Task<IActionResult> AddComment([FromBody] CommentWithArticleDto dto)
        {
            if (dto.comment == null || dto.comment.CommentText == null || dto.comment.CommentText.Trim().Length == 0)
                return BadRequest("Comment text cannot be empty.");

            try
            {
                Comment c = new Comment();
                int articleId = dto.article.InsertArticleIfNotExists();

                int result = c.AddComment(articleId, dto.comment.UserId, dto.comment.CommentText);

                if (result == 0)
                    return Conflict("User has already commented on this article.");

                // שלח התראה על תגובה חדשה
                try
                {
                    User userHandler = new User();
                    string commenterName = userHandler.GetUserNameById(dto.comment.UserId);

                    if (!string.IsNullOrEmpty(commenterName))
                    {
                        await notifications.NotifyNewComment(
                            articleId,
                            dto.article.Title ?? "Article",
                            dto.comment.UserId,
                            commenterName
                        );
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to send comment notification: {ex.Message}");
                }

                return Ok("Comment added successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("debug/notification-recipients/{articleId}")]
        [AllowAnonymous]
        public IActionResult GetNotificationRecipients(int articleId, int excludeUserId = 0)
        {
            try
            {
                Comment c = new Comment();
                var dbServices = new DAL.DBservices();
                
                // קבל את כל המשתמשים שהגיבו על המאמר
                var usersWhoCommented = dbServices.GetUsersWhoCommentedOnArticle(articleId, excludeUserId);
                
                // קבל את כל התגובות על המאמר
                var allComments = c.GetCommentsByArticle(articleId);
                
                // קבל את כל FCM Tokens של משתמשים שהגיבו
                var usersFromComments = allComments.Select(comment => comment.UserId).Distinct().ToList();
                var fcmTokensForCommenters = dbServices.GetFCMTokensForUsers(usersFromComments);
                
                var result = new
                {
                    ArticleId = articleId,
                    ExcludeUserId = excludeUserId,
                    UsersWhoWillReceiveNotifications = usersWhoCommented,
                    AllCommentsOnArticle = allComments.Select(comment => new { 
                        UserId = comment.UserId, 
                        CommentText = comment.CommentText,
                        Date = comment.CreatedAt
                    }),
                    UsersFromAllComments = usersFromComments,
                    FCMTokensForCommenters = fcmTokensForCommenters,
                    TotalNotificationRecipients = usersWhoCommented.Count,
                    TotalCommentsOnArticle = allComments.Count,
                    TotalUniqueCommenters = usersFromComments.Count,
                    CommentersWithFCMTokens = fcmTokensForCommenters.Count
                };
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpGet("debug/fcm-analysis/{articleId}")]
        [AllowAnonymous]
        public IActionResult GetFCMAnalysis(int articleId, int excludeUserId = 0)
        {
            try
            {
                Comment c = new Comment();
                var dbServices = new DAL.DBservices();
                
                // קבל את כל התגובות על המאמר
                var allComments = c.GetCommentsByArticle(articleId);
                var uniqueCommenters = allComments.Select(comment => comment.UserId).Distinct().ToList();
                
                // בדוק FCM Tokens עבור כל המגיבים
                var analysis = new List<object>();
                foreach (var userId in uniqueCommenters)
                {
                    if (userId != excludeUserId)
                    {
                        var userTokens = dbServices.GetFCMTokensForUsers(new List<int> { userId });
                        analysis.Add(new
                        {
                            UserId = userId,
                            HasFCMToken = userTokens.Count > 0,
                            FCMTokenCount = userTokens.Count,
                            WillReceiveNotification = userTokens.Count > 0
                        });
                    }
                }
                
                var result = new
                {
                    ArticleId = articleId,
                    ExcludeUserId = excludeUserId,
                    TotalCommenters = uniqueCommenters.Count,
                    CommentersExcludingRequester = uniqueCommenters.Where(id => id != excludeUserId).Count(),
                    CommentersWithFCMTokens = analysis.Count(a => (bool)a.GetType().GetProperty("HasFCMToken").GetValue(a)),
                    FCMAnalysis = analysis
                };
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

              
        [HttpGet("article/{articleId}")]
        [AllowAnonymous]
        public IActionResult GetCommentsByArticle(int articleId)
        {
            if (articleId <= 0)
                return BadRequest("Invalid article ID.");

            try
            {
                Comment c = new Comment();
                List<Comment> comments = c.GetCommentsByArticle(articleId);
                return Ok(comments);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}

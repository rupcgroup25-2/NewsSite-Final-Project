using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;

namespace Newsite_Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous] // For testing purposes
    public class FirebaseTestController : ControllerBase
    {
        [HttpGet("test-connection")]
        public async Task<IActionResult> TestFirebaseConnection()
        {
            try
            {
                // Test Firebase initialization
                if (FirebaseApp.DefaultInstance == null)
                {
                    return BadRequest("Firebase is not initialized");
                }

                var projectId = FirebaseApp.DefaultInstance.Options.ProjectId;
                Console.WriteLine($"Firebase Project ID: {projectId}");

                // Test sending to a dummy token (this will fail but show us if Firebase connection works)
                var message = new Message()
                {
                    Token = "dummy-token-for-testing",
                    Notification = new Notification()
                    {
                        Title = "Test",
                        Body = "Testing Firebase connection"
                    }
                };

                try
                {
                    var response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
                    return Ok($"Firebase connection successful. Project: {projectId}");
                }
                catch (FirebaseMessagingException ex)
                {
                    // Expected to fail with invalid token, but this tells us if Firebase is reachable
                    if (ex.Message.Contains("registration-token-not-registered") || 
                        ex.Message.Contains("invalid-registration-token"))
                    {
                        return Ok($"Firebase connection successful (dummy token failed as expected). Project: {projectId}");
                    }
                    else
                    {
                        return BadRequest($"Firebase error: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpGet("project-info")]
        public IActionResult GetProjectInfo()
        {
            try
            {
                if (FirebaseApp.DefaultInstance == null)
                {
                    return BadRequest("Firebase is not initialized");
                }

                var projectId = FirebaseApp.DefaultInstance.Options.ProjectId;
                var credential = FirebaseApp.DefaultInstance.Options.Credential;
                
                return Ok(new
                {
                    ProjectId = projectId,
                    CredentialType = credential?.GetType().Name,
                    IsInitialized = true
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }
    }
}

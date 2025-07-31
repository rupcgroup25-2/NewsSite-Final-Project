namespace Newsite_Server.BL
{
    public class GenerateProfileImageRequest
    {
        public int UserId { get; set; }
        public string Prompt { get; set; }
    }
}
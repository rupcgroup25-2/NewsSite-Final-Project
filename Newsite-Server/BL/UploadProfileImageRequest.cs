namespace Newsite_Server.BL
{
    public class UploadProfileImageRequest
    {
        public int UserId { get; set; }
        public IFormFile ImageFile { get; set; }
    }
}

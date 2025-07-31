using Microsoft.AspNetCore.Http; // IFormFile
using Microsoft.Extensions.Configuration; // IConfiguration
using CloudinaryDotNet; // Cloudinary, Account
using CloudinaryDotNet.Actions; // ImageUploadParams, FileDescription
using System.Threading.Tasks;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration config)
    {
        var acc = new Account(
            config["Cloudinary:CloudName"],
            config["Cloudinary:ApiKey"],
            config["Cloudinary:ApiSecret"]
        );
        _cloudinary = new Cloudinary(acc);
    }

    public async Task<string> UploadImageAsync(IFormFile file, string userId)
    {
        using (var stream = file.OpenReadStream())
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                PublicId = $"newspapersite/{userId}", // שמירה לפי מזהה המשתמש
                Folder = "newspapersite",
                Overwrite = true
            };

            var result = await _cloudinary.UploadAsync(uploadParams);
            return result.SecureUrl.ToString(); // URL לתמונה
        }
    }
    public async Task<ImageUploadResult> UploadRawStreamAsync(ImageUploadParams uploadParams)
    {
        return await _cloudinary.UploadAsync(uploadParams);
    }
}
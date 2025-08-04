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

    // Uploads profile image to Cloudinary cloud storage
    public async Task<string> UploadImageAsync(IFormFile file, string userId)
    {
        using (var stream = file.OpenReadStream())
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                PublicId = $"profile_pics/{userId}", // Save by user ID
                Folder = "profile_pics",
                Overwrite = true,
            };

            var result = await _cloudinary.UploadAsync(uploadParams);
            return result.SecureUrl.ToString(); // URL for the image
        }
    }
    // Uploads raw image stream to Cloudinary with custom parameters
    public async Task<ImageUploadResult> UploadRawStreamAsync(ImageUploadParams uploadParams)
    {
        uploadParams.Overwrite = true;  
        return await _cloudinary.UploadAsync(uploadParams);
    }
}
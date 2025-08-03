using Newsite_Server.DAL;
using System.Diagnostics.CodeAnalysis;
using System.Diagnostics.Eventing.Reader;
using System.Text.RegularExpressions;
using static BCrypt.Net.BCrypt;
using System.Linq;
namespace Newsite_Server.BL
{
    public class User
    {
        int id;
        string name;
        string email;
        string password;
        bool active;
        bool blockSharing;
        List<Tag> tags;

        public User() { }
        public User(string email, string password)
        {
            this.email = email;
            this.password = password;
        }
        public User(int id, string name, string email, string password, bool active, bool blockSharing)
        {
            this.Id = id;
            this.Name = name;
            this.Email = email;
            this.Password = password;
            this.Active = active;
            this.BlockSharing = blockSharing;
        }

        public int Id { get => id; set => id = value; }
        public string Name { get => name; set => name = value; }
        public string Email { get => email; set => email = value; }
        public string Password { get => password; set => password = value; }
        public bool Active { get => active; set => active = value; }
        public bool BlockSharing { get => blockSharing; set => blockSharing = value; }
        public List<Tag> Tags { get => tags; set => tags = value ?? new List<Tag>(); }

        DBservices dbs = new DBservices();

        // Gets all users from the database
        public List<User> GetAllUsers() //Get all users from db
        {
            DBservices dbs = new DBservices();
            return dbs.SelectUsers();
        }

        // Authenticates user login with email and password
        public User LoginUser()
        {
            return dbs.LoginUser(this.Email, this.password);
        }

        // Registers a new user after validation and password hashing
        public int Register() //Post user
        {
            if (ValidationCheck())
            {
                this.password = HashPassword(this.password);
                int result = dbs.InsertUser(this);
                return result;
            }
            return 0;
        }
        // Validates user input for name and password requirements
        public bool ValidationCheck()
        {
            // name not null / atleast two chars, only letters / spaces allowed
            if (string.IsNullOrWhiteSpace(this.name) ||
                !Regex.IsMatch(this.name, @"^[A-Za-z\s]{2,}$"))
            {
                return false;
            }

            //password regex check
            if (string.IsNullOrWhiteSpace(this.password) ||
                this.password.Length < 8 ||
                !Regex.IsMatch(this.password, @"[A-Z]") ||         // Big letter
                !Regex.IsMatch(this.password, @"[a-z]") ||         // small letter
                !Regex.IsMatch(this.password, @"\d") ||            // number
                !Regex.IsMatch(this.password, @"[^\w\d\s]"))       // speical char
            {
                return false;
            }

            return true;
        }
        
        // Validates new password format with specific requirements (8+ chars, uppercase, lowercase, number, special char)
        public bool newPasswordValidation(string newPass)
        {
            if (string.IsNullOrWhiteSpace(newPass) ||
              newPass.Length < 8 ||
              !Regex.IsMatch(newPass, @"[A-Z]") ||         // Big letter
              !Regex.IsMatch(newPass, @"[a-z]") ||         // small letter
              !Regex.IsMatch(newPass, @"\d") ||            // number
              !Regex.IsMatch(newPass, @"[^\w\d\s]"))       // speical char
            {
                return false;
            }

            return true;
        }
        
        // Toggles the sharing block status for this user
        public int ToggleBlockSharing()
        {
            return dbs.ToggleBlockSharing(this.Id);
        }
        
        // Deactivates/activates the user account
        public int Deactivate()
        {
            return dbs.ToggleDeactivateUser(this.Id);
        }

        // Gets all user email addresses from the system
        public List<string> GetAllEmails()
        {
            return dbs.SelectAllUsersEmail();
        }

        // Creates a follow relationship between two users
        public int FollowUser(int followerId, string followedEmail)
        {
            return dbs.FollowUser(followerId, followedEmail);
        }
        
        // Removes a follow relationship between two users
        public int UnFollowUser(int followerId, string followedEmail)
        {
            return dbs.UnfollowUser(followerId, followedEmail);
        }
        
        // Records daily login activity for analytics tracking
        public int TrackDailyLogin(int userId)
        {
            return dbs.TrackUserLogin(userId);
        }
        
        // Gets details of all users that a specific user is following
        public List<string> GetMyFollowedUsersDetails(int userId)
        {
            return dbs.GetFollowedUsersByUserId(userId);
        }

        // Updates the user's display name
        public int ChangeUserName(int userId, string newName)
        {
            int rowsAffected = dbs.UpdateUserName(userId, newName);
            return rowsAffected;
        }

        // Changes user password after validation and hashing
        public int ChangePassword(int userId, string newPass)
        {
            if (newPasswordValidation(newPass))
            {
                newPass = HashPassword(newPass);
                int result = dbs.UpdateUserPassword(userId, newPass);
                return result;
            }
            return 0;
        }

        // Gets recent user activities with specified limit for activity feed display
        public List<Dictionary<string, object>> GetActivitiesForUser(int userId, int numOfActivities)
        {
            List<Dictionary<string, object>> recentActivities = dbs.GetRecentActivities(userId, numOfActivities);
            return recentActivities;
        }
        
        // Retrieves user details by unique user ID
        public User GetUserById(int userId)
        {
            return dbs.SelectUserById(userId);
        }

        // Retrieves user details by email address
        public User GetUserByEmail(string email)
        {
            return dbs.SelectUserByEmail(email);
        }

        // Gets only the user's display name by user ID for quick lookups
        public string GetUserNameById(int userId)
        {
            return dbs.SelectUserNameById(userId);
        }

        // Deletes an article from the system (admin functionality)
        public int DeleteArticleById(int articleId)
        {
            return dbs.DeleteArticle(articleId);
        }

        // Removes a specific report filed by a user against an article
        public int DeleteReportByArticleAndUserId(int articleId, int userId)
        {
            return dbs.DeleteReport(articleId, userId);
        }

        // Function to check if user is admin by email
        public bool IsAdmin()
        {
            return this.Email == "admin@newshub.com";
        }

        // Static function to check if email is admin
        public static bool IsAdminEmail(string email)
        {
            return email == "admin@newshub.com";
        }
    }
}

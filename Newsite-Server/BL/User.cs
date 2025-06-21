using Newsite_Server.DAL;
using System.Diagnostics.CodeAnalysis;
using System.Diagnostics.Eventing.Reader;
using System.Text.RegularExpressions;
using static BCrypt.Net.BCrypt;
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

        DBservices dbs = new DBservices();

        public List<User> GetAllUsers() //Get all users from db
        {
            DBservices dbs = new DBservices();
            return dbs.SelectUsers();
        }

        public User LoginUser()
        {
            return dbs.LoginUser(this.Email, this.password);
        }

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
        public int ToggleBlockSharing()
        {
            return dbs.ToggleBlockSharing(this.Id);
        }
        public int Deactivate()
        {
            return dbs.ToggleDeactivateUser(this.Id);
        }
    }
}

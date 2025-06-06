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
    }
}

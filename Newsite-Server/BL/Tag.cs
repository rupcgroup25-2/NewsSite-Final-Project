using Newsite_Server.DAL;

namespace Newsite_Server.BL
{
    public class Tag
    {
        int id;
        string name;

        public Tag() { }
        public Tag(int id, string name)
        {
            this.id = id;
            this.name = name;
        }

        public int Id { get => id; set => id = value; }
        public string Name { get => name; set => name = value; }

        DBservices dbs = new DBservices();

        // Creates a new tag in the database
        public int CreateTag()
        {
            return dbs.InsertTag(this.name);
        }
        // Gets all tags from database
        public List<Tag> GetAllTags() //Get all users from db
        {
            return dbs.SelectAllTags();
        }

        // Gets all tags assigned to a specific user
        public List<Tag> GetTagsForUser(int userId)
        {
            return dbs.GetTagsForUser(userId);
        }

        // Assigns this tag to a specific user
        public int AssignToUser(int userId)
        {
            DBservices dbs = new DBservices();
            return dbs.AssignTagToUser(this.Name, userId);
        }

        // Removes a tag from a specific user
        public int RemoveTagFromUser(int userId, int tagId)
        {
            DBservices dbs = new DBservices();
            return dbs.RemoveTageFromUser(userId, tagId);
        }

        // Deletes a tag from the database
        public int DeleteTag(int tagId)
        {
            return dbs.DeleteTag(tagId);
        }
    }
}

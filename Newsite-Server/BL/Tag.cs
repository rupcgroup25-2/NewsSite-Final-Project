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

        public int CreateTag()
        {
            return dbs.InsertTag(this.name);
        }
        public List<Tag> GetAllTags() //Get all users from db
        {
            return dbs.SelectAllTags();
        }

        public List<Tag> GetTagsForUser(int userId)
        {
            return dbs.GetTagsForUser(userId);
        }


        public int AssignToUser(int userId)
        {
            DBservices dbs = new DBservices();
            return dbs.AssignTagToUser(this.Name, userId);
        }

        public int DeleteTag(int tagId)
        {
            return dbs.DeleteTag(tagId);
        }
    }
}

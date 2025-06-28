using Newsite_Server.DAL;

namespace Newsite_Server.BL
{
    public class Admin
    {
        DBservices dbs = new DBservices();
       public Admin() { }

        public int GetActiveUsersCount()
        {
            return dbs.GetCountOfActiveUsers();
        }
        public int GetSavedArticlesCount()
        {
            return dbs.GetSavedArticlesCount();
        }
        public int GetSharedArticlesCount()
        {
            return dbs.GetSharedArticlesCount();
        }
        public int GetBlockedUsersCount()
        {
            return dbs.GetCountBlockedUsers();
        }
        public int GetReportsCount()
        {
            return dbs.GetReportsCount();
        }
    }
}

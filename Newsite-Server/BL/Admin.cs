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
            return dbs.GetCountReports();
        }
        public int GetTotalDailyUserLogins()
        {
            return dbs.TotalDailyUserLogins();
        }

        public List<(string TagName, int TagCount)> GetTopMostCommonTags(int topCount)
        {
            return dbs.GetTopMostCommonTags(topCount);
        }

        public int GetPullRequestsCount(string apiName)
        {
            return dbs.SelectPullRequestsCount(apiName);
        }
    }
}

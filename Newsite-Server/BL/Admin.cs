using Newsite_Server.DAL;

namespace Newsite_Server.BL
{
    public class Admin
    {
        DBservices dbs = new DBservices();
       public Admin() { }

        // Gets count of active users in the system
        public int GetActiveUsersCount()
        {
            return dbs.GetCountOfActiveUsers();
        }
        // Gets count of saved articles in the system
        public int GetSavedArticlesCount()
        {
            return dbs.GetSavedArticlesCount();
        }
        // Gets count of shared articles in the system
        public int GetSharedArticlesCount()
        {
            return dbs.GetSharedArticlesCount();
        }
        // Gets count of blocked users in the system
        public int GetBlockedUsersCount()
        {
            return dbs.GetCountBlockedUsers();
        }
        // Gets count of reports in the system
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

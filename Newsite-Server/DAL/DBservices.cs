
using Newsite_Server.BL;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Reflection.PortableExecutable;
using System.Xml.Linq;
using static BCrypt.Net.BCrypt;

namespace Newsite_Server.DAL
{
    public class DBservices
    {
        public DBservices()
        {

        }

        //--------------------------------------------------------------------------------------------------
        // This method creates a connection to the database according to the connectionString name in the appsettings.json 
        //--------------------------------------------------------------------------------------------------
        public SqlConnection connect(String conString)
        {

            // read the connection string from the configuration file
            IConfigurationRoot configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json").Build();
            string cStr = configuration.GetConnectionString("myProjDB");
            SqlConnection con = new SqlConnection(cStr);
            con.Open();
            return con;
        }



        //===============User===============================================================================

        public List<Dictionary<string, object>> GetRecentActivities(int userId, int numOfActivities)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                throw (ex);
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);
            paramDic.Add("@numOfActivities", numOfActivities);

            cmd = CreateCommandWithStoredProcedureGeneral("SP_GetRecentUserActivitiesFinal", con, paramDic);

            List<Dictionary<string, object>> activities = new List<Dictionary<string, object>>();

            try
            {
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    Dictionary<string, object> activity = new Dictionary<string, object>();
                    activity["ActivityType"] = reader["ActivityType"].ToString();
                    activity["ActivityDate"] = Convert.ToDateTime(reader["ActivityDate"]);
                    activities.Add(activity);
                }
                return activities;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Execution Exception: " + ex.Message);
                return null;
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }

        // פונקציה לקבלת משתמש ספציפי לפי Email
        public User SelectUserByEmail(string email)
        {
            SqlConnection con;
            SqlCommand cmd;
            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@email", email);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetUserByEmailFinal", con, paramDic);         // create the command
            User user = null;

            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            try
            {
                if (dataReader.Read())
                {
                    user = new User();
                    user.Id = Convert.ToInt32(dataReader["Id"]);
                    user.Name = dataReader["Name"].ToString();
                    user.Email = dataReader["Email"].ToString();
                    user.Password = dataReader["Password"].ToString();
                    user.Active = Convert.ToBoolean(dataReader["Active"]);
                    user.BlockSharing = Convert.ToBoolean(dataReader["BlockSharing"]);
                }
                return user;
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }

        // פונקציה לקבלת משתמש ספציפי לפי ID
        public User SelectUserById(int userId)
        {
            SqlConnection con;
            SqlCommand cmd;
            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@userId", userId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetUserByIdFinal", con, paramDic);         // create the command
            User user = null;

            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            try
            {
                if (dataReader.Read())
                {
                    user = new User();
                    user.Id = Convert.ToInt32(dataReader["Id"]);
                    user.Name = dataReader["Name"].ToString();
                    user.Email = dataReader["Email"].ToString();
                    user.Password = dataReader["Password"].ToString();
                    user.Active = Convert.ToBoolean(dataReader["Active"]);
                    user.BlockSharing = Convert.ToBoolean(dataReader["BlockSharing"]);
                }
                return user;
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            finally
            {
                if (con != null)
                {

                    // close the db connection
                    con.Close();
                }
            }
        }

        // פונקציה לקבלת שם משתמש לפי ID (מהיר יותר)
        public string SelectUserNameById(int userId)
        {
            SqlConnection con;
            SqlCommand cmd;
            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@userId", userId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetUserNameByIdFinal", con, paramDic);         // create the command
            string userName = null;

            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            try
            {
                if (dataReader.Read())
                {
                    userName = dataReader["Name"].ToString();
                }
                return userName;
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method selects all Users from the UsersTable 
        //--------------------------------------------------------------------------------------------------
        public List<User> SelectUsers()
        {
            SqlConnection con;
            SqlCommand cmd;
            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            cmd = CreateCommandWithStoredProcedureGeneral("sp_SelectUsersFinal", con, null);         // create the command
            List<User> users = new List<User>();

            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            try
            {
                while (dataReader.Read())
                {
                    User u = new User();
                    u.Id = Convert.ToInt32(dataReader["Id"]);
                    u.Name = dataReader["Name"].ToString();
                    u.Email = dataReader["Email"].ToString();
                    u.Password = dataReader["Password"].ToString();
                    u.Active = Convert.ToBoolean(dataReader["Active"]);
                    u.BlockSharing = Convert.ToBoolean(dataReader["BlockSharing"]);
                    users.Add(u);
                }
                return users;
            }

            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }

        }

        //--------------------------------------------------------------------------------------------------
        // This method selects all Users emails from the UsersTable 
        //--------------------------------------------------------------------------------------------------
        public List<string> SelectAllUsersEmail()
        {
            SqlConnection con;
            SqlCommand cmd;
            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetAllUserEmailsFinal", con, null);         // create the command
            List<string> emails = new List<string>();

            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            try
            {
                while (dataReader.Read())
                {
                    emails.Add(dataReader.GetString(0));
                }
                return emails;
            }

            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method inserts a User into the UsersTable 
        //--------------------------------------------------------------------------------------------------
        public int InsertUser(User user)
        {

            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@name", user.Name);
            paramDic.Add("@email", user.Email);
            paramDic.Add("@password", user.Password);
            paramDic.Add("@active", user.Active);
            paramDic.Add("@blockSharing", user.BlockSharing);


            cmd = CreateCommandWithStoredProcedureGeneral("sp_InsertUserFinal", con, paramDic);         // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }

        }

        //--------------------------------------------------------------------------------------------------
        // This method updates username in UsersTable 
        //--------------------------------------------------------------------------------------------------

        public int UpdateUserName(int userId, string newName)
        {
            SqlConnection con = connect("myProjDB");
            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);
            paramDic.Add("@NewName", newName);

            SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("sp_UpdateUserNameFinal", con, paramDic);

            try
            {
                int rowsAffected = cmd.ExecuteNonQuery();
                return rowsAffected; // 0 = לא עודכן, >0 = עודכן בהצלחה
            }
            finally
            {
                con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method updates user Password
        //--------------------------------------------------------------------------------------------------

        public int UpdateUserPassword(int userId, string newPassword)
        {
            SqlConnection con = connect("myProjDB");
            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);
            paramDic.Add("@NewPassword", newPassword);

            SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("sp_UpdateUserPasswordFinal", con, paramDic);

            try
            {
                cmd.ExecuteNonQuery();
                // אם לא הייתה חריגה, נחשב הצלחה
                return 1;
            }
            catch
            {
                // אם הייתה חריגה, נחשב כישלון
                return 0;
            }
            finally
            {
                con.Close();
            }
        }
    
        //--------------------------------------------------------------------------------------------------
        // This method Login a User 
        //--------------------------------------------------------------------------------------------------
        public User LoginUser(string email, string pass)
        {

            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return null;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@Email", email);
            cmd = CreateCommandWithStoredProcedureGeneral("sp_LoginUserFinal", con, paramDic);         // create the command

            try
            {
                SqlDataReader dr = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                if (dr.Read())
                {
                    string hashedPassword = dr["password"].ToString();

                    if (Verify(pass, hashedPassword))
                    {
                        User u = new User();
                        u.Id = Convert.ToInt32(dr["Id"]);
                        u.Name = dr["Name"].ToString();
                        u.Email = dr["Email"].ToString();
                        u.Password = hashedPassword;
                        u.Active = Convert.ToBoolean(dr["Active"]);
                        u.BlockSharing = Convert.ToBoolean(dr["BlockSharing"]);
                        u.Tags = GetTagsForUser(u.Id);
                        return u;
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return null;
            }

            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method count number of daily logins 
        //--------------------------------------------------------------------------------------------------
        public int TrackUserLogin(int userId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_TrackDailyUserLoginFinal", con, paramDic);

            try
            {
                int numEffected = cmd.ExecuteNonQuery();
                return numEffected;
            }
            catch (SqlException ex)
            {
                //Console.WriteLine("Execution Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                con.Close();
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method get the sum of the number of daily logins 
        //--------------------------------------------------------------------------------------------------
        public int TotalDailyUserLogins()
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Exception: " + ex.Message);
                return 0;
            }

            // לא צריך פרמטרים לפונקציה הזו כי היא לא מקבלת userId אלא סופרת את כל המשתמשים להיום
            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetTotalDailyLoginsByDateFinal", con, null);
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            int totalLoginCount = 0;
            try
            {
                if (dataReader.Read())
                {
                    // בדיקה אם הערך הוא DBNull לפני ההמרה
                    object totalLoginsValue = dataReader["TotalLogins"];
                    if (totalLoginsValue != DBNull.Value)
                    {
                        totalLoginCount = Convert.ToInt32(totalLoginsValue);
                    }
                    else
                    {
                        totalLoginCount = 0; // ברירת מחדל אם הערך הוא NULL
                    }
                }
                return totalLoginCount;
            }
            catch (SqlException ex)
            {
                //Console.WriteLine("Execution Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method gets the top N most common tag names and their usage count
        //--------------------------------------------------------------------------------------------------
        public List<(string TagName, int TagCount)> GetTopMostCommonTags(int topCount)
        {
            SqlConnection con;
            SqlCommand cmd;
            List<(string TagName, int TagCount)> topTags = new List<(string, int)>();

            try
            {
                con = connect("myProjDB"); // Replace with your actual DB name
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Exception: " + ex.Message);
                return topTags;
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("@TopCount", topCount);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetTopMostCommonTagsFinal", con, parameters);

            try
            {
                SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

                while (dataReader.Read())
                {
                    string tagName = dataReader["Name"].ToString();
                    int tagCount = Convert.ToInt32(dataReader["TagCount"]);
                    topTags.Add((tagName, tagCount));
                }

                return topTags;
            }
            catch (SqlException ex)
            {
                //Console.WriteLine("Execution Exception: " + ex.Message);
                return topTags;
            }
            finally
            {
                con.Close();
            }
        }


        //--------------------------------------------------------------------------------------------------
        // Insert Followed user to follower 
        //--------------------------------------------------------------------------------------------------
        public int FollowUser(int followerId, string followedEmail)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            // מילון פרמטרים
            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@FollowerId", followerId);
            paramDic.Add("@FollowedEmail", followedEmail);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_FollowUserByEmailFinal", con, paramDic);

            try
            {
                int result = cmd.ExecuteNonQuery();
                return result;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method to unfollow user
        //--------------------------------------------------------------------------------------------------
        public int UnfollowUser(int followerId, string followedEmail)
        {
            SqlConnection con;
            SqlCommand cmd;
            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@FollowerId", followerId);
            paramDic.Add("@FollowedEmail", followedEmail);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_UnfollowUserByEmailFinal", con, paramDic);

            try
            {
                int result = cmd.ExecuteNonQuery();
                return result;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }

        //===============Tag===============================================================================

        //--------------------------------------------------------------------------------------------------
        // This method create a new tag 
        //--------------------------------------------------------------------------------------------------\

        public int InsertTag(String name)
        {

            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@Name", name);


            cmd = CreateCommandWithStoredProcedureGeneral("sp_InsertTagFinal", con, paramDic);         // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }

        }

        //--------------------------------------------------------------------------------------------------
        // This method assigns a tag to a user. If the tag does not exist, it creates the tag first.
        // Calls stored procedure: sp_AddUserTagByNameFinal
        //--------------------------------------------------------------------------------------------------
        public int AssignTagToUser(string tagName, int userId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // open DB connection
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Error: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);
            paramDic.Add("@TagName", tagName);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_InsertUser-TagPair", con, paramDic); // create command

            try
            {
                object result = cmd.ExecuteScalar(); // get the TagId from SQL

                if (result != null && int.TryParse(result.ToString(), out int tagId))
                {
                    return tagId;
                }
                else
                {
                    //Console.WriteLine("Failed to retrieve TagId.");
                    return 0;
                }
            }
            catch (SqlException ex)
            {
                // Handles RAISERROR from SQL
                //Console.WriteLine("SQL Exception: " + ex.Message);
                return 0;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method removes a tag from the user.
        //--------------------------------------------------------------------------------------------------
        public int RemoveTageFromUser(int userId, int tagId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // open DB connection
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Error: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);
            paramDic.Add("@TagId", tagId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_RemoveUserTagFinal", con, paramDic); // your SP name here

            try
            {
                int rowsAffected = cmd.ExecuteNonQuery();
                return rowsAffected;
            }
            catch (SqlException ex)
            {
                //Console.WriteLine("SQL Exception: " + ex.Message);
                return 0;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method to select all tags
        //--------------------------------------------------------------------------------------------------
        public List<Tag> SelectAllTags()
        {

            SqlConnection con;
            SqlCommand cmd;
            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            cmd = CreateCommandWithStoredProcedureGeneral("sp_SelectTagsFinal", con, null);         // create the command
            List<Tag> tags = new List<Tag>();

            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            try
            {
                while (dataReader.Read())
                {
                    Tag t = new Tag();
                    t.Id = Convert.ToInt32(dataReader["Id"]);
                    t.Name = dataReader["Name"].ToString();
                    tags.Add(t);
                }
                return tags;
            }

            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method get all tags for a specific user
        //--------------------------------------------------------------------------------------------------

        public List<Tag> GetTagsForUser(int userId)
        {
            SqlConnection con;
            SqlCommand cmd;
            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("@UserId", userId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetTagsForUserFinal", con, parameters); // create the command
            List<Tag> tags = new List<Tag>();

            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            try
            {
                while (dataReader.Read())
                {
                    Tag t = new Tag();
                    t.Id = Convert.ToInt32(dataReader["Id"]);
                    t.Name = dataReader["Name"].ToString();
                    tags.Add(t);
                }
                return tags;
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }


        //--------------------------------------------------------------------------------------------------
        // This method assign tag to an article 
        //--------------------------------------------------------------------------------------------------
        public int AssignTagToArticle(int articleId, string tag)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // יצירת החיבור
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@ArticleId", articleId);
            paramDic.Add("@TagName", tag);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_AssignTagToArticle", con, paramDic);

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // הרצת הפרוסידר
                return numEffected;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                {
                    con.Close(); // סגירת החיבור
                }
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method Delete entire tag from all the tags
        //--------------------------------------------------------------------------------------------------
        public int DeleteTag(int tagId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // יצירת חיבור למסד
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@TagId", tagId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_DeleteTagsFinal", con, paramDic);

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // ביצוע הפקודה
                return numEffected;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Execution Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                {
                    con.Close(); // סגירת חיבור
                }
            }
        }

        //===============Article===============================================================================

        //--------------------------------------------------------------------------------------------------
        // This method deletes a comment for a given user and article
        //--------------------------------------------------------------------------------------------------
        public int DeleteComment(int userId, int articleId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);
            paramDic.Add("@ArticleId", articleId);

            cmd = CreateCommandWithStoredProcedureGeneral("SP_DeleteCommentByUserAndArticleFinal", con, paramDic);

            try
            {
                int numEffected = cmd.ExecuteNonQuery();
                return numEffected;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Execution Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method deletes all comments for a given article
        //--------------------------------------------------------------------------------------------------
        public int DeleteAllCommentsForArticle(int articleId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@ArticleId", articleId);

            cmd = CreateCommandWithStoredProcedureGeneral("SP_DeleteAllCommentsForArticleFinal", con, paramDic);

            try
            {
                int numEffected = cmd.ExecuteNonQuery();
                return numEffected;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Execution Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method deletes report for a given article and user id
        //--------------------------------------------------------------------------------------------------

        public int DeleteReport(int articleId, int userId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@ArticleId", articleId);
            paramDic.Add("@UserId", userId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_DeleteReportByArticleAndUserFinal", con, paramDic);

            try
            {
                int numEffected = cmd.ExecuteNonQuery();
                return numEffected;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Execution Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method deletes article with all its reports by id
        //--------------------------------------------------------------------------------------------------
        public int DeleteArticle(int articleId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // יצירת חיבור למסד הנתונים
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@ArticleId", articleId);

            cmd = CreateCommandWithStoredProcedureGeneral("SP_DeleteArticleAndReportsFinal", con, paramDic);

            try
            {
                object result = cmd.ExecuteScalar(); // קריאה שמחזירה ערך בודד מה-SP
                if (result != null && int.TryParse(result.ToString(), out int deleted))
                {
                    return deleted; // 1 אם נמחקה כתבה, 0 אם לא נמצאה כתבה
                }
                return 0;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Execution Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                {
                    con.Close(); // סגירת חיבור
                }
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method adds comment to article
        //--------------------------------------------------------------------------------------------------
        public int AddComment(int articleId, int userId, string commentText)
        {
            SqlConnection con = connect("myProjDB");
            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@ArticleId", articleId);
            paramDic.Add("@UserId", userId);
            paramDic.Add("@CommentText", commentText);

            SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("sp_AddCommentFinal", con, paramDic);

            try
            {
                object result = cmd.ExecuteScalar();
                return Convert.ToInt32(result); // 0 = כבר הגיב, 1 = הצלחה
            }
            finally
            {
                con.Close();
            }
        }

        ////--------------------------------------------------------------------------------------------------
        //// This method to get all comments by article id
        ////--------------------------------------------------------------------------------------------------

        public List<Comment> GetCommentsByArticle(int articleId)
        {
            SqlConnection con = connect("myProjDB");
            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@ArticleId", articleId);

            SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("sp_GetCommentsByArticleFinal", con, paramDic);

            List<Comment> comments = new List<Comment>();
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            try
            {
                while (reader.Read())
                {
                    Comment c = new Comment();
                    {
                        c.Id = Convert.ToInt32(reader["Id"]);
                        c.ArticleId = Convert.ToInt32(reader["ArticleId"]);
                        c.UserId = Convert.ToInt32(reader["UserId"]);
                        c.Username = reader["Username"].ToString();
                        c.CommentText = reader["CommentText"].ToString();
                        c.CreatedAt = Convert.ToDateTime(reader["CreatedAt"]);
                    }
                    ;
                    comments.Add(c);
                }
                return comments;
            }
            finally
            {
                con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method to get all articles 
        //--------------------------------------------------------------------------------------------------
        public List<Article> GetAllArticles()
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                throw ex;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            // כאן אין פרמטרים כי לוקחים את כל המאמרים

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetAllArticlesFinal", con, paramDic);

            List<Article> articles = new List<Article>();
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            try
            {
                while (reader.Read())
                {
                    Article a = new Article();
                    a.Id = Convert.ToInt32(reader["Id"]);
                    a.Title = reader["Title"]?.ToString();
                    a.Description = reader["Description"]?.ToString();
                    a.Url = reader["Url"]?.ToString();
                    a.UrlToImage = reader["UrlToImage"]?.ToString();
                    a.PublishedAt = Convert.ToDateTime(reader["PublishedAt"]);
                    a.SourceName = reader["SourceName"]?.ToString();
                    a.Author = reader["Author"]?.ToString();
                    articles.Add(a);
                }
                return articles;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method add new article 
        //--------------------------------------------------------------------------------------------------
        public int InsertArticle(Article article)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@Title", article.Title);
            paramDic.Add("@Description", article.Description);
            paramDic.Add("@Url", article.Url);
            paramDic.Add("@UrlToImage", article.UrlToImage);
            paramDic.Add("@PublishedAt", article.PublishedAt);
            paramDic.Add("@SourceName", article.SourceName);
            paramDic.Add("@Author", article.Author);


            cmd = CreateCommandWithStoredProcedureGeneral("sp_InsertArticleFinal", con, paramDic);         // create the command

            try
            {
                int newId = Convert.ToInt32(cmd.ExecuteScalar());
                return newId; ;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }

        }

        //--------------------------------------------------------------------------------------------------
        // This method check if this article is already exists
        //--------------------------------------------------------------------------------------------------
        public Article GetArticleByUrl(string url)
        {
            SqlConnection con;
            SqlCommand cmd;
            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Error: " + ex.Message);
                return null;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@Url", url);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetArticleByUrlFinal", con, paramDic);

            try
            {
                SqlDataReader dr = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                if (dr.Read())
                {
                    Article a = new Article();
                    a.Id = Convert.ToInt32(dr["Id"]);
                    a.Title = dr["Title"].ToString();
                    a.Description = dr["Description"].ToString();
                    a.Url = dr["Url"].ToString();
                    a.UrlToImage = dr["UrlToImage"].ToString();
                    a.PublishedAt = Convert.ToDateTime(dr["PublishedAt"]);
                    a.SourceName = dr["SourceName"].ToString();
                    a.Author = dr["Author"].ToString();
                    return a;
                }
                return null;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Execution Error: " + ex.Message);
                return null;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method save an article for user in the SavedArticlesTable
        //--------------------------------------------------------------------------------------------------
        public int SaveArticleForUser(int userId, int articleId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);
            paramDic.Add("@ArticleId", articleId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_SaveArticleForUserFinal", con, paramDic);

            try
            {
                int rowsAffected = cmd.ExecuteNonQuery();
                return rowsAffected;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Execution Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method share an article with a comment to SharedArticlesTable
        // Returns: 0 = already shared, 1 = successfully shared
        //--------------------------------------------------------------------------------------------------
        public int ShareArticleForUser(int userId, int articleId, string comment)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Error: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);
            paramDic.Add("@ArticleId", articleId);
            paramDic.Add("@Comment", comment);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_ShareArticleFinal", con, paramDic);

            try
            {
                object result = cmd.ExecuteScalar();
                int resultValue = result != null ? Convert.ToInt32(result) : 0;
                return resultValue; // 0 = already shared, 1 = successfully shared
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Execution Error: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method select all saved articles for a user
        //--------------------------------------------------------------------------------------------------
        public List<Article> GetSavedArticlesForUser(int userId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                throw ex;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetSavedArticlesWithTagsFinal", con, paramDic); // שם חדש

            Dictionary<int, Article> articleDict = new Dictionary<int, Article>();
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            try
            {
                while (reader.Read())
                {
                    int articleId = Convert.ToInt32(reader["ArticleId"]);

                    if (!articleDict.ContainsKey(articleId))
                    {
                        Article a = new Article();
                        a.Id = articleId;
                        a.Title = reader["Title"].ToString();
                        a.Description = reader["Description"].ToString();
                        a.Url = reader["Url"].ToString();
                        a.UrlToImage = reader["UrlToImage"].ToString();
                        a.PublishedAt = Convert.ToDateTime(reader["PublishedAt"]);
                        a.SourceName = reader["SourceName"].ToString();
                        a.Author = reader["Author"].ToString();
                        a.Tags = new List<string>();

                        articleDict[articleId] = a;
                    }

                    string tagName = reader["TagName"] != null ? reader["TagName"].ToString() : null;

                    if (string.IsNullOrWhiteSpace(tagName))
                        tagName = "General";

                    if (!articleDict[articleId].Tags.Contains(tagName))
                        articleDict[articleId].Tags.Add(tagName);
                }

                return articleDict.Values.ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method select single saved article by id for a user
        //--------------------------------------------------------------------------------------------------
        public Article GetSingleSavedArticlesForUser(int userId, int articleId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                throw ex;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);
            paramDic.Add("@ArticleId", articleId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetSingleSavedArticleForUserFinal", con, paramDic);

            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            try
            {
                Article article = null;

                while (reader.Read())
                {
                    if (article == null)
                    {
                        article = new Article
                        {
                            Id = Convert.ToInt32(reader["Id"]),
                            Title = reader["Title"].ToString(),
                            Description = reader["Description"].ToString(),
                            Url = reader["Url"].ToString(),
                            UrlToImage = reader["UrlToImage"].ToString(),
                            PublishedAt = Convert.ToDateTime(reader["PublishedAt"]),
                            SourceName = reader["SourceName"].ToString(),
                            Author = reader["Author"].ToString(),
                            Tags = new List<string>()
                        };
                    }

                    string tagName = reader["TagName"] != null ? reader["TagName"].ToString() : null;

                    if (string.IsNullOrWhiteSpace(tagName))
                        tagName = "General";

                    if (!article.Tags.Contains(tagName))
                        article.Tags.Add(tagName);
                }

                return article;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method select single saved article by id for a user
        //--------------------------------------------------------------------------------------------------
        public Article GetSingleSharedArticleByArticleId(int articleId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                throw ex;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@ArticleId", articleId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetSharedArticleByIdFinal", con, paramDic);

            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            try
            {
                Article article = null;

                while (reader.Read())
                {
                    if (article == null)
                    {
                        article = new Article
                        {
                            Id = Convert.ToInt32(reader["Id"]),
                            Title = reader["Title"].ToString(),
                            Description = reader["Description"].ToString(),
                            Url = reader["Url"].ToString(),
                            UrlToImage = reader["UrlToImage"].ToString(),
                            PublishedAt = Convert.ToDateTime(reader["PublishedAt"]),
                            SourceName = reader["SourceName"].ToString(),
                            Author = reader["Author"].ToString(),
                            Tags = new List<string>(),
                        };
                    }

                    string tagName = reader["TagName"] != null ? reader["TagName"].ToString() : null;
                    if (string.IsNullOrWhiteSpace(tagName))
                        tagName = "General";

                    if (!article.Tags.Contains(tagName))
                        article.Tags.Add(tagName);
                }

                return article;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method select all shared articles for a user with his comments
        //--------------------------------------------------------------------------------------------------
        public List<Article> GetSharedArticlesForUser(int userId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                throw ex;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetSharedArticlesWithTagsFinal", con, paramDic);

            Dictionary<int, Article> articleDict = new Dictionary<int, Article>();
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            try
            {
                while (reader.Read())
                {
                    int articleId = Convert.ToInt32(reader["ArticleId"]);

                    if (!articleDict.ContainsKey(articleId))
                    {
                        Article a = new Article();
                        a.Id = articleId;
                        a.Title = reader["Title"].ToString();
                        a.Description = reader["Description"].ToString();
                        a.Url = reader["Url"].ToString();
                        a.UrlToImage = reader["UrlToImage"].ToString();
                        a.PublishedAt = Convert.ToDateTime(reader["PublishedAt"]);
                        a.SourceName = reader["SourceName"].ToString();
                        a.Author = reader["Author"].ToString();
                        a.Tags = new List<string>();
                        a.Comment = reader["Comment"].ToString(); // מהשיתוף
                        a.SharedById = Convert.ToInt32(reader["SharedByUserId"]);
                        a.SharedByName = reader["SharedByName"].ToString();

                        articleDict[articleId] = a;
                    }

                    string tagName = reader["TagName"] != null ? reader["TagName"].ToString() : null;

                    if (string.IsNullOrWhiteSpace(tagName))
                        tagName = "General";

                    if (!articleDict[articleId].Tags.Contains(tagName))
                        articleDict[articleId].Tags.Add(tagName);
                }

                return articleDict.Values.ToList();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method check if the user is blocked or not for watching shared articles
        //--------------------------------------------------------------------------------------------------
        public int GetWatchSharedPermission(int userId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                throw ex;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetUserBlockSharingFinal", con, paramDic);

            try
            {
                SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

                if (reader.Read())
                {
                    int blockSharing = Convert.ToInt32(reader["BlockSharing"]);
                    return blockSharing;
                }
                else
                {
                    //not found
                    return -1;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method search in savedArticlesTable
        //--------------------------------------------------------------------------------------------------
        public List<Article> SearchSavedArticles(int userId, string searchText)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                throw ex;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);
            paramDic.Add("@SearchText", searchText);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_SearchSavedArticlesFinal", con, paramDic);

            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            List<Article> savedArticles = new List<Article>();

            try
            {
                while (reader.Read())
                {
                    Article a = new Article();
                    a.Id = Convert.ToInt32(reader["Id"]);
                    a.Title = reader["Title"].ToString();
                    a.Description = reader["Description"].ToString();
                    a.Url = reader["Url"].ToString();
                    a.UrlToImage = reader["UrlToImage"].ToString();
                    a.PublishedAt = Convert.ToDateTime(reader["PublishedAt"]);
                    a.SourceName = reader["SourceName"].ToString();
                    a.Author = reader["Author"].ToString();

                    savedArticles.Add(a);
                }

                return savedArticles;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method select single shared article by id for a user
        //--------------------------------------------------------------------------------------------------
        public Article GetSingleSharedArticlesForUser(int userId, int articleId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                throw ex;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);
            paramDic.Add("@ArticleId", articleId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetSingleSharedArticleForUserFinal", con, paramDic);

            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            try
            {
                Article article = null;

                while (reader.Read())
                {
                    if (article == null)
                    {
                        article = new Article
                        {
                            Id = Convert.ToInt32(reader["Id"]),
                            Title = reader["Title"].ToString(),
                            Description = reader["Description"].ToString(),
                            Url = reader["Url"].ToString(),
                            UrlToImage = reader["UrlToImage"].ToString(),
                            PublishedAt = Convert.ToDateTime(reader["PublishedAt"]),
                            SourceName = reader["SourceName"].ToString(),
                            Author = reader["Author"].ToString(),
                            Tags = new List<string>()
                        };
                    }

                    string tagName = reader["TagName"] != DBNull.Value && reader["TagName"] != null ? reader["TagName"].ToString() : null;

                    if (string.IsNullOrWhiteSpace(tagName))
                        tagName = "General";

                    if (!article.Tags.Contains(tagName))
                        article.Tags.Add(tagName);
                }

                return article;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method select single reported article by id for a user
        //--------------------------------------------------------------------------------------------------
        public Article GetSingleReportedArticlesForUser(int userId, int articleId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                throw ex;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);
            paramDic.Add("@ArticleId", articleId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetSingleReportedArticleForUserFinal", con, paramDic);

            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            try
            {
                Article article = null;

                while (reader.Read())
                {
                    if (article == null)
                    {
                        article = new Article
                        {
                            Id = Convert.ToInt32(reader["Id"]),
                            Title = reader["Title"].ToString(),
                            Description = reader["Description"].ToString(),
                            Url = reader["Url"].ToString(),
                            UrlToImage = reader["UrlToImage"].ToString(),
                            PublishedAt = Convert.ToDateTime(reader["PublishedAt"]),
                            SourceName = reader["SourceName"].ToString(),
                            Author = reader["Author"].ToString(),
                            Tags = new List<string>()
                        };
                    }

                    string tagName = reader["TagName"] != null ? reader["TagName"].ToString() : null;

                    if (string.IsNullOrWhiteSpace(tagName))
                        tagName = "General";

                    if (!article.Tags.Contains(tagName))
                        article.Tags.Add(tagName);
                }

                return article;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method delete saved articles for user
        //--------------------------------------------------------------------------------------------------
        public int DeleteSavedArticle(int userId, int articleId)
        {
            SqlConnection con = connect("myProjDB");

            Dictionary<string, object> paramDic = new Dictionary<string, object>
    {
        { "@UserId", userId },
        { "@ArticleId", articleId }
    };

            SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("sp_DeleteSavedArticleFinal", con, paramDic);

            try
            {
                return cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Error: " + ex.Message);
                return 0;
            }
            finally { con.Close(); }
        }
        //--------------------------------------------------------------------------------------------------
        // This method Get you followed users details
        //--------------------------------------------------------------------------------------------------
        public List<string> GetFollowedUsersByUserId(int userId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                throw ex;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@FollowerId", userId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetFollowedUsersFinal", con, paramDic);

            List<string> followedUsers = new List<string>();

            try
            {
                SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

                while (reader.Read())
                {
                    string id = reader["Id"].ToString();
                    string name = reader["Name"].ToString();
                    string email = reader["Email"].ToString();
                    string active = reader["Active"].ToString();

                    followedUsers.Add(id);
                    followedUsers.Add(name);
                    followedUsers.Add(email);
                    followedUsers.Add(active);


                }

                return followedUsers;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method delete shared articles for user
        //--------------------------------------------------------------------------------------------------

        public int DeleteSharedArticle(int userId, int articleId)
        {
            SqlConnection con = connect("myProjDB");

            Dictionary<string, object> paramDic = new Dictionary<string, object>
    {
        { "@UserId", userId },
        { "@ArticleId", articleId }
    };

            SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("sp_DeleteSharedArticleFinal", con, paramDic);

            try
            {
                return cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Error: " + ex.Message);
                return 0;
            }
            finally { con.Close(); }
        }

        //--------------------------------------------------------------------------------------------------
        // This method remove tags from article 
        //--------------------------------------------------------------------------------------------------
        public int RemoveTagFromArticle(int articleId, int tagId)
        {
            SqlConnection con = connect("myProjDB");

            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                { "@ArticleId", articleId },
                { "@TagId", tagId }
            };

            SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("sp_DeleteTagFromArticleFinal", con, paramDic);

            try
            {
                return cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Error: " + ex.Message);
                return 0;
            }
            finally { con.Close(); }
        }

        //===============Report===========================================================================

        //--------------------------------------------------------------------------------------------------
        // This method to insert new report on shared article or regular article
        //--------------------------------------------------------------------------------------------------
        public int ReportArticles(int reporterId, int? articleId, int? sharedArticleId, string comment)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@ReporterId", reporterId);
            paramDic.Add("@ArticleId", (object?)articleId ?? DBNull.Value);
            paramDic.Add("@SharerId", (object?)sharedArticleId ?? DBNull.Value);
            paramDic.Add("@Comment", comment);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_ReportArticleFinal", con, paramDic);

            try
            {
                int numEffected = cmd.ExecuteNonQuery();
                return numEffected;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Execution Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method to get all reports 
        //--------------------------------------------------------------------------------------------------
        public List<object> GetAllReportsOnArticle()
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                throw ex;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetAllReportsOnArticlesFinal", con, paramDic);

            List<object> reports = new List<object>();
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            try
            {
                while (reader.Read())
                {
                    Dictionary<string, object> report = new Dictionary<string, object>();

                    for (int i = 0; i < reader.FieldCount; i++)
                    {
                        string columnName = reader.GetName(i);
                        object value = reader.IsDBNull(i) ? null : reader.GetValue(i);
                        report[columnName] = value;
                    }

                    reports.Add(report);
                }

                return reports; // 🔹 זו הייתה חסרה
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        //===============Admin===========================================================================

        //--------------------------------------------------------------------------------------------------
        // This method block the user by admin
        //--------------------------------------------------------------------------------------------------
        public int ToggleBlockSharing(int userId)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // יצירת החיבור
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);


            cmd = CreateCommandWithStoredProcedureGeneral("sp_ToggleBlockSharingFinal", con, paramDic);

            try
            {
                int numEffected = cmd.ExecuteNonQuery();
                return numEffected;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method increase the api counter
        //--------------------------------------------------------------------------------------------------
        public int IncreaseApiCounter(string apiName)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // יצירת החיבור
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@ApiName", apiName);

            // כאן קוראים לפרוצדורה המאחסנת או מגדילה את המונה
            cmd = CreateCommandWithStoredProcedureGeneral("sp_IncreaseApiCounterFinal", con, paramDic);

            try
            {
                int numEffected = cmd.ExecuteNonQuery();
                return numEffected;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method select the count of pull requests
        //--------------------------------------------------------------------------------------------------
        public int SelectPullRequestsCount(string apiName)
        {
            SqlConnection con = null;
            SqlCommand cmd;
            int count = 0;

            try
            {
                con = connect("myProjDB"); // יצירת החיבור
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@ApiName", apiName);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_SelectApiCounterValueFinal", con, paramDic);

            try
            {
                using (SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection))
                {
                    if (reader.Read())
                    {
                        object countValue = reader["CounterValue"]; // שם השדה שפרוצדורה מחזירה
                        if (countValue != DBNull.Value)
                        {
                            count = Convert.ToInt32(countValue);
                        }
                    }
                }
                return count;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method deactivate the user by admin
        //--------------------------------------------------------------------------------------------------
        public int ToggleDeactivateUser(int userId)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // יצירת החיבור
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);


            cmd = CreateCommandWithStoredProcedureGeneral("sp_ToggleDeactivateUserFinal", con, paramDic);

            try
            {
                int numEffected = cmd.ExecuteNonQuery();
                return numEffected;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                {
                    con.Close();
                }
            }
        }

        //--------------------------------------------------------------------------------------------------
        // This method get total number of active users the 
        //--------------------------------------------------------------------------------------------------
        public int GetCountOfActiveUsers()
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                throw ex;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetActiveUsersCountFinal", con, paramDic);
            int count = 0;
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            try
            {
                if (reader.Read())
                {
                    object countValue = reader["CountActiveUsers"];
                    if (countValue != DBNull.Value)
                    {
                        count = Convert.ToInt32(countValue);
                    }
                }
                return count;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method get total number of saved articles 
        //--------------------------------------------------------------------------------------------------
        public int GetSavedArticlesCount()
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Error: " + ex.Message);
                return 0;
            }

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetSavedArticlesCountFinal", con, null);
            int count = 0;
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            try
            {
                if (reader.Read())
                {
                    object countValue = reader["Count"];
                    if (countValue != DBNull.Value)
                    {
                        count = Convert.ToInt32(countValue);
                    }
                }
                return count;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Execution Error: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method get total number of shared articles 
        //--------------------------------------------------------------------------------------------------
        public int GetSharedArticlesCount()
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Error: " + ex.Message);
                return 0;
            }

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetSharedArticlesCountFinal", con, null);
            int count = 0;
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            try
            {
                if (reader.Read())
                {
                    object countValue = reader["Count"];
                    if (countValue != DBNull.Value)
                    {
                        count = Convert.ToInt32(countValue);
                    }
                }
                return count;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Execution Error: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method get total number of blocked users 
        //--------------------------------------------------------------------------------------------------
        public int GetCountBlockedUsers()
        {
            SqlConnection con = connect("myProjDB");

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Error: " + ex.Message);
                return 0;
            }
            SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("sp_CountBlockedUsersFinal", con, null);
            int count = 0;
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            try
            {
                if (reader.Read())
                {
                    object countValue = reader["BlockedUsersCount"];
                    if (countValue != DBNull.Value)
                    {
                        count = Convert.ToInt32(countValue);
                    }
                }
                return count;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("CountBlockedUsers error: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }
        //--------------------------------------------------------------------------------------------------
        // This method get total number of blocked users 
        //--------------------------------------------------------------------------------------------------
        public int GetCountReports()
        {
            SqlConnection con = connect("myProjDB");

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Error: " + ex.Message);
                return 0;
            }
            SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("sp_GetReportsCountFinal", con, null);
            int count = 0;
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            try
            {
                if (reader.Read())
                {
                    object countValue = reader["CountReports"];
                    if (countValue != DBNull.Value)
                    {
                        count = Convert.ToInt32(countValue);
                    }
                }
                return count;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("CountBlockedUsers error: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        //===============Notifications-FCM===============================================================================

        //--------------------------------------------------------------------------------------------------
        // Save FCM Token for user
        //--------------------------------------------------------------------------------------------------
        public int SaveFCMToken(int userId, string fcmToken)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                return 0;
            }

            try
            {
                Dictionary<string, object> paramDic = new Dictionary<string, object>();
                paramDic.Add("@UserId", userId);
                paramDic.Add("@FCMToken", fcmToken);

                // יש להניח שה-SP מבצע UPSERT (הכנסה או עדכון)
                cmd = CreateCommandWithStoredProcedureGeneral("sp_SaveFCMTokenFinal", con, paramDic);

                int result = cmd.ExecuteNonQuery();
                return result > 0 ? 1 : 0;
            }
            catch (SqlException sqlEx)
            {
                // טיפול בשגיאת ייחודיות (אם צריך)
                if (sqlEx.Number == 2627 || sqlEx.Number == 2601)
                {
                    return 1;
                }
                else
                {
                    return 0;
                }
            }
            catch (Exception ex)
            {
                return 0;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // Disable FCM Token notifications for user
        //--------------------------------------------------------------------------------------------------
        public int DisableFCMToken(int userId)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_DisableFCMTokenFinal", con, paramDic);

            try
            {
                int result = cmd.ExecuteNonQuery();
                return result;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // Enable FCM Token notifications for user
        //--------------------------------------------------------------------------------------------------
        public int EnableFCMToken(int userId)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_EnableFCMTokenFinal", con, paramDic);

            try
            {
                int result = cmd.ExecuteNonQuery();
                return result;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // Clear specific FCM token for a user on logout
        //--------------------------------------------------------------------------------------------------
        public int ClearSpecificFCMToken(int userId, string fcmToken)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);
            paramDic.Add("@FCMToken", fcmToken);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_ClearSpecificFCMTokenFinal", con, paramDic);

            try
            {
                int result = cmd.ExecuteNonQuery();
                //Console.WriteLine($"🗑️ Cleared FCM token for user {userId}, affected rows: {result}");
                return result;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // Get FCM Tokens for specific users
        //--------------------------------------------------------------------------------------------------
        public List<string> GetFCMTokensForUsers(List<int> userIds)
        {
            SqlConnection con = null;
            SqlCommand cmd;
            List<string> tokens = new List<string>();

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return tokens;
            }

            string userIdsString = string.Join(",", userIds);
            //Console.WriteLine($"🔍 Getting FCM tokens for users: {userIdsString}");

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserIds", userIdsString);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetFCMTokensForUsersFinal", con, paramDic);

            try
            {
                SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                while (reader.Read())
                {
                    string token = reader["FCMToken"].ToString();
                    tokens.Add(token);
                    //Console.WriteLine($"📱 Found token: {token.Substring(0, Math.Min(20, token.Length))}...");
                }

                //Console.WriteLine($"📊 Total tokens retrieved: {tokens.Count}");

                // בדיקת כפילויות נוספת ברמת הקוד
                var uniqueTokens = tokens.Distinct().ToList();
                if (uniqueTokens.Count != tokens.Count)
                {
                    //Console.WriteLine($"⚠️ Found duplicates! Original: {tokens.Count}, Unique: {uniqueTokens.Count}");
                    tokens = uniqueTokens;
                }

                return tokens;
            }
            catch (Exception ex)
            {
                //Console.WriteLine($"❌ Exception in GetFCMTokensForUsers: {ex.Message}");
                return tokens;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // Check if user has notifications enabled
        //--------------------------------------------------------------------------------------------------
        public bool IsUserNotificationsEnabled(int userId)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception)
            {
                return false;
            }

            try
            {
                Dictionary<string, object> paramDic = new Dictionary<string, object>();
                paramDic.Add("@UserId", userId);

                cmd = CreateCommandWithStoredProcedureGeneral("sp_IsUserNotificationsEnabled", con, paramDic);

                object result = cmd.ExecuteScalar();
                int count = result != null ? Convert.ToInt32(result) : 0;
                return count > 0;
            }
            catch (Exception)
            {
                return false;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // Get all active user IDs with notifications enabled
        //--------------------------------------------------------------------------------------------------
        public List<int> GetAllActiveUserIds()
        {
            SqlConnection con = null;
            SqlCommand cmd;
            List<int> userIds = new List<int>();

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return userIds;
            }

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetAllActiveUserIdsWithNotificationsFinal", con, new Dictionary<string, object>());

            try
            {
                SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                while (reader.Read())
                {
                    userIds.Add((int)reader["UserId"]);
                }
                return userIds;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return userIds;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // Get users who commented on article (excluding specific user)
        //--------------------------------------------------------------------------------------------------
        public List<int> GetUsersWhoCommentedOnArticle(int articleId, int excludeUserId)
        {
            //Console.WriteLine($"🔍 GetUsersWhoCommentedOnArticle called - ArticleId: {articleId}, ExcludeUserId: {excludeUserId}");

            SqlConnection con = null;
            SqlCommand cmd;
            List<int> userIds = new List<int>();

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return userIds;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@ArticleId", articleId);
            paramDic.Add("@ExcludeUserId", excludeUserId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetUsersWhoCommentedOnArticleFinal", con, paramDic);

            try
            {
                //Console.WriteLine($"📊 Executing SP: sp_GetUsersWhoCommentedOnArticleFinal with ArticleId={articleId}, ExcludeUserId={excludeUserId}");

                SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                while (reader.Read())
                {
                    int userId = (int)reader["UserId"];
                    userIds.Add(userId);
                    //Console.WriteLine($"👤 Found user who commented: {userId}");
                }
                reader.Close();

                //Console.WriteLine($"📊 Total users found: {userIds.Count}");
                return userIds;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return userIds;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }
        //--------------------------------------------------------------------------------------------------
        // Get user followers with notifications enabled
        //--------------------------------------------------------------------------------------------------
        public List<int> GetUserFollowers(int userId)
        {
            SqlConnection con = null;
            SqlCommand cmd;
            List<int> followers = new List<int>();

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return followers;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetUserFollowersFinal", con, paramDic);

            try
            {
                SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                while (reader.Read())
                {
                    followers.Add((int)reader["FollowerId"]);
                }
                return followers;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return followers;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // Get only admin users with notifications enabled (for reports and admin notifications)
        //--------------------------------------------------------------------------------------------------
        public List<int> GetAllUsersWithNotifications()
        {
            SqlConnection con = null;
            SqlCommand cmd;
            List<int> userIds = new List<int>();

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return userIds;
            }

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetAllUsersWithNotificationsFinal", con, new Dictionary<string, object>());

            try
            {
                SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                while (reader.Read())
                {
                    int userId = (int)reader["Id"];
                    userIds.Add(userId);
                    //Console.WriteLine($"   Found user ID: {userId}");
                }
                return userIds;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return userIds;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        private SqlCommand CreateCommandWithStoredProcedureGeneral(String spName, SqlConnection con, Dictionary<string, object> paramDic)
        {

            SqlCommand cmd = new SqlCommand(); // create the command object

            cmd.Connection = con;              // assign the connection to the command object

            cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

            cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text

            if (paramDic != null)
                foreach (KeyValuePair<string, object> param in paramDic)
                {
                    cmd.Parameters.AddWithValue(param.Key, param.Value);

                }


            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        // Delete invalid FCM Token
        //--------------------------------------------------------------------------------------------------
        public int DeleteInvalidFCMToken(string fcmToken)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Connection Exception: " + ex.Message);
                return 0;
            }

            try
            {
                string query = "DELETE FROM FCMTokensFinal WHERE FCMToken = @FCMToken";
                cmd = new SqlCommand(query, con);
                cmd.Parameters.AddWithValue("@FCMToken", fcmToken);

                int result = cmd.ExecuteNonQuery();
                //Console.WriteLine($"✅ Deleted {result} invalid FCM token(s)");
                return result;
            }
            catch (Exception ex)
            {
                //Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }

        //--------------------------------------------------------------------------------------------------
        // Get all FCM Tokens for cleanup
        //--------------------------------------------------------------------------------------------------
        public List<string> GetAllFCMTokens()
        {
            SqlConnection con = null;
            SqlCommand cmd;
            List<string> tokens = new List<string>();

            try
            {
                con = connect("myProjDB");
                string query = "SELECT DISTINCT FCMToken FROM FCMTokensFinal WHERE IsActive = 1";
                cmd = new SqlCommand(query, con);

                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    tokens.Add(reader["FCMToken"].ToString());
                }
            }
            catch (Exception ex)
            {
                //Console.WriteLine("Exception getting all FCM tokens: " + ex.Message);
            }
            finally
            {
                if (con != null) con.Close();
            }

            return tokens;
        }

        //--------------------------------------------------------------------------------------------------
        // Get FCM Token Statistics
        //--------------------------------------------------------------------------------------------------
        //public int GetTotalFCMTokensCount()
        //{
        //    SqlConnection con = null;
        //    SqlCommand cmd;

        //    try
        //    {
        //        con = connect("myProjDB");
        //        string query = "SELECT COUNT(*) FROM FCMTokensFinal";
        //        cmd = new SqlCommand(query, con);
        //        return (int)cmd.ExecuteScalar();
        //    }
        //    catch (Exception ex)
        //    {
        //        //Console.WriteLine("Exception getting total FCM tokens count: " + ex.Message);
        //        return 0;
        //    }
        //    finally
        //    {
        //        if (con != null) con.Close();
        //    }
        //}

        //public int GetActiveFCMTokensCount()
        //{
        //    SqlConnection con = null;
        //    SqlCommand cmd;

        //    try
        //    {
        //        con = connect("myProjDB");
        //        string query = "SELECT COUNT(*) FROM FCMTokensFinal WHERE IsActive = 1";
        //        cmd = new SqlCommand(query, con);
        //        return (int)cmd.ExecuteScalar();
        //    }
        //    catch (Exception ex)
        //    {
        //        //Console.WriteLine("Exception getting active FCM tokens count: " + ex.Message);
        //        return 0;
        //    }
        //    finally
        //    {
        //        if (con != null) con.Close();
        //    }
        //}

        //public int GetEnabledFCMTokensCount()
        //{
        //    SqlConnection con = null;
        //    SqlCommand cmd;

        //    try
        //    {
        //        con = connect("myProjDB");
        //        string query = "SELECT COUNT(*) FROM FCMTokensFinal WHERE IsActive = 1 AND NotificationsEnabled = 1";
        //        cmd = new SqlCommand(query, con);
        //        return (int)cmd.ExecuteScalar();
        //    }
        //    catch (Exception ex)
        //    {
        //        //Console.WriteLine("Exception getting enabled FCM tokens count: " + ex.Message);
        //        return 0;
        //    }
        //    finally
        //    {
        //        if (con != null) con.Close();
        //    }
        //}

        //public int GetUsersWithTokensCount()
        //{
        //    SqlConnection con = null;
        //    SqlCommand cmd;

        //    try
        //    {
        //        con = connect("myProjDB");
        //        string query = "SELECT COUNT(DISTINCT UserId) FROM FCMTokensFinal WHERE IsActive = 1";
        //        cmd = new SqlCommand(query, con);
        //        return (int)cmd.ExecuteScalar();
        //    }
        //    catch (Exception ex)
        //    {
        //        //Console.WriteLine("Exception getting users with tokens count: " + ex.Message);
        //        return 0;
        //    }
        //    finally
        //    {
        //        if (con != null) con.Close();
        //    }
        //}

    }
}
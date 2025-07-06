
using System.Data;
using System.Data.SqlClient;
using System.Xml.Linq;
using Newsite_Server.BL;
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

        //--------------------------------------------------------------------------------------------------
        // This method selects all Users from the UsersTable 
        //--------------------------------------------------------------------------------------------------

        //===============User===============================================================================

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
                Console.WriteLine("General Exception: " + ex.Message);
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
                Console.WriteLine("General Exception: " + ex.Message);
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
                Console.WriteLine("General Exception: " + ex.Message);
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
                        return u;
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine("General Exception: " + ex.Message);
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
                Console.WriteLine("General Exception: " + ex.Message);
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
                Console.WriteLine("General Exception: " + ex.Message);
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
        // This method assign tag to an article 
        //--------------------------------------------------------------------------------------------------
        public int AssignTagToArticle(int articleId, int tagId)
        {
            SqlConnection con = null;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // יצירת החיבור
            }
            catch (Exception ex)
            {
                Console.WriteLine("General Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@ArticleId", articleId);
            paramDic.Add("@TagId", tagId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_AssignTagToArticle", con, paramDic);

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // הרצת הפרוסידר
                return numEffected;
            }
            catch (Exception ex)
            {
                Console.WriteLine("General Exception: " + ex.Message);
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
                Console.WriteLine("Connection Exception: " + ex.Message);
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
                Console.WriteLine("Execution Exception: " + ex.Message);
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
                Console.WriteLine("General Exception: " + ex.Message);
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
                Console.WriteLine("General Exception: " + ex.Message);
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
                Console.WriteLine("Connection Error: " + ex.Message);
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
                Console.WriteLine("Execution Error: " + ex.Message);
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
                Console.WriteLine("Connection Exception: " + ex.Message);
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
                Console.WriteLine("Execution Exception: " + ex.Message);
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
                Console.WriteLine("Connection Error: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserId", userId);
            paramDic.Add("@ArticleId", articleId);
            paramDic.Add("@Comment", comment);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_ShareArticleFinal", con, paramDic);

            try
            {
                return cmd.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Execution Error: " + ex.Message);
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

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetSavedArticlesForUserFinal", con, paramDic);

            List<Article> articles = new List<Article>();
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
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
                reader.Read();
                Article a = new Article();
                a.Id = Convert.ToInt32(reader["Id"]);
                a.Title = reader["Title"].ToString();
                a.Description = reader["Description"].ToString();
                a.Url = reader["Url"].ToString();
                a.UrlToImage = reader["UrlToImage"].ToString();
                a.PublishedAt = Convert.ToDateTime(reader["PublishedAt"]);
                a.SourceName = reader["SourceName"].ToString();
                a.Author = reader["Author"].ToString();
                return a;
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

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetSharedArticlesForUser", con, paramDic);

            List<Article> articles = new List<Article>();
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
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
                    a.Comment = reader["Comment"].ToString(); // מהשיתוף
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
                    // לא נמצאה שורה - אפשר להחליט להחזיר -1 או לזרוק שגיאה
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
                reader.Read();
                Article a = new Article();
                a.Id = Convert.ToInt32(reader["Id"]);
                a.Title = reader["Title"].ToString();
                a.Description = reader["Description"].ToString();
                a.Url = reader["Url"].ToString();
                a.UrlToImage = reader["UrlToImage"].ToString();
                a.PublishedAt = Convert.ToDateTime(reader["PublishedAt"]);
                a.SourceName = reader["SourceName"].ToString();
                a.Author = reader["Author"].ToString();
                return a;
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
                Console.WriteLine("Error: " + ex.Message);
                return 0;
            }
            finally { con.Close(); }
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
                Console.WriteLine("Error: " + ex.Message);
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
                Console.WriteLine("Error: " + ex.Message);
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
                Console.WriteLine("Connection Exception: " + ex.Message);
                return 0;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@ReporterId", reporterId);
            paramDic.Add("@ArticleId", (object?)articleId ?? DBNull.Value);
            paramDic.Add("@SharedArticleId", (object?)sharedArticleId ?? DBNull.Value);
            paramDic.Add("@Comment", comment);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_ReportArticleFinal", con, paramDic);

            try
            {
                int numEffected = cmd.ExecuteNonQuery();
                return numEffected;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Execution Exception: " + ex.Message);
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
                Console.WriteLine("General Exception: " + ex.Message);
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
                Console.WriteLine("General Exception: " + ex.Message);
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
                Console.WriteLine("General Exception: " + ex.Message);
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
                Console.WriteLine("General Exception: " + ex.Message);
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
                    count = Convert.ToInt32(reader["CountActiveUsers"]);
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
                Console.WriteLine("Connection Error: " + ex.Message);
                return 0;
            }

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetSavedArticlesCountFinal", con, null);
            int count = 0;
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            try
            {
                if (reader.Read())
                {
                    count = Convert.ToInt32(reader["Count"]);
                }
                return count;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Execution Error: " + ex.Message);
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
                Console.WriteLine("Connection Error: " + ex.Message);
                return 0;
            }

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetSharedArticlesCountFinal", con, null);
            int count = 0;
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            try
            {
                if (reader.Read())
                {
                    count = Convert.ToInt32(reader["Count"]);
                }
                return count;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Execution Error: " + ex.Message);
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
                Console.WriteLine("Connection Error: " + ex.Message);
                return 0;
            }
            SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("sp_CountBlockedUsersFinal", con, null);
            int count = 0;
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            try
            {
                if (reader.Read())
                {
                    count = Convert.ToInt32(reader["BlockedUsersCount"]);
                }
                return count;
            }
            catch (Exception ex)
            {
                Console.WriteLine("CountBlockedUsers error: " + ex.Message);
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
                Console.WriteLine("Connection Error: " + ex.Message);
                return 0;
            }
            SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("sp_GetReportsCountFinal", con, null);
            int count = 0;
            SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            try
            {
                if (reader.Read())
                {
                    count = Convert.ToInt32(reader["CountReports"]);
                }
                return count;
            }
            catch (Exception ex)
            {
                Console.WriteLine("CountBlockedUsers error: " + ex.Message);
                return 0;
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

    }
}

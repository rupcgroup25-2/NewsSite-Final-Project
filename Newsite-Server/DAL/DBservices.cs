
using System.Data;
using System.Data.SqlClient;
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

        //--------------------------------------------------------------------------------------------------
        // This method create a new tag 
        //--------------------------------------------------------------------------------------------------

        //===============Tag===============================================================================

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

            cmd = CreateCommandWithStoredProcedureGeneral("sp_AssignTagToArticle", con, paramDic); // יצירת הפקודה

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

            cmd = CreateCommandWithStoredProcedureGeneral("sp_GetArticleByUrl", con, paramDic);

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

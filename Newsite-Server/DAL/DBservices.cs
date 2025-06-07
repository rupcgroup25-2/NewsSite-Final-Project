
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

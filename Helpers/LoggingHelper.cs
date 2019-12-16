using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace DataEntry.Helpers
{
    public class LoggingHelper
    {
        public static void LogError(Exception ex)
        {
            string ConnectionString = ConfigurationManager.ConnectionStrings["DataEntryConnectionString"].ConnectionString;
            var db = new DataEntryDataContext(ConnectionString);
            db.CommandTimeout = 99999;

            var UserName = System.Web.HttpContext.Current.User.Identity.Name;

            db.InsertError(UserName, ex.Message, ex.StackTrace, ex.Source);
        }
    }
}
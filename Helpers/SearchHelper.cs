using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace DataEntry.Helpers
{
    public class SearchHelper
    {
        public static List<GetCategoriesResult> GetCategories(Guid? ParentID)
        {
            string ConnectionString = ConfigurationManager.ConnectionStrings["DataEntryConnectionString"].ConnectionString;
            DataEntryDataContext db = new DataEntryDataContext(ConnectionString);
            db.CommandTimeout = 99999;
            return db.GetCategories(ParentID).ToList();
        }

        public static void DecodeModel(object model)
        {
            try
            {
                // Get the type of the object
                Type type = model.GetType();

                // For each property of this object, html decode it if it is of type string
                foreach (System.Reflection.PropertyInfo propertyInfo in type.GetProperties())
                {
                    var prop = propertyInfo.GetValue(model);
                    if (prop != null && prop.GetType() == typeof(string))
                    {
                        propertyInfo.SetValue(model, Uri.UnescapeDataString((string)prop));
                    }
                }
            }
            catch { }
        }
    }
}
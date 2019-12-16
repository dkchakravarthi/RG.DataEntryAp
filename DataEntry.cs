using System.Configuration;

namespace DataEntry
{
    partial class DataEntryDataContext
    {
        partial void OnCreated()
        {
            this.Connection.ConnectionString = ConfigurationManager.ConnectionStrings["DataEntryConnectionString"].ConnectionString;
            this.CommandTimeout = 99999;
        }
    }
}
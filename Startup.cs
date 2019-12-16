using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(DataEntry.Startup))]
namespace DataEntry
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}

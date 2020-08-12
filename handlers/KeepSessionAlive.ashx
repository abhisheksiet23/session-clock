<%@ WebHandler Language="C#" Class="KeepSessionAlive" %>

using System;
using System.Web;
using System.Web.SessionState;
using Newtonsoft.Json;

public class KeepSessionAlive : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        context.Response.Cache.SetNoStore();

        string action = Convert.ToString(context.Request.QueryString["action"]);
        HttpSessionState session = HttpContext.Current.Session;

        if (action != null && action.Equals("KillSession", StringComparison.CurrentCultureIgnoreCase))
        {
            session.Abandon();
        }
        else if (action != null && action.Equals("GetSessionParameters", StringComparison.CurrentCultureIgnoreCase))
        {
            string warningInterval = "5"; //setting warning interval to 0 will not initiate the clock.

            var response = new { Timeout = Convert.ToString(context.Session.Timeout), WarningInterval = warningInterval };
            context.Response.Write(JsonConvert.SerializeObject(response));
        }
        else
        {
            context.Response.Write(context.Session["SessionStartTime"] == null ? "0" : "1");
        }
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}
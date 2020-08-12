<%@ WebHandler Language="C#" Class="CheckSessionStatus" %>

using System;
using System.Web;

public class CheckSessionStatus : IHttpHandler, System.Web.SessionState.IReadOnlySessionState
{
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        context.Response.Cache.SetNoStore();

        context.Response.Write(context.Session["SessionStartTime"] == null ? "0" : "1");
    }

    public bool IsReusable {
        get {
            return false;
        }
    }
}
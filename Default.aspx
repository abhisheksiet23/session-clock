<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="session_clock.Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml" lang="en-us">
<head runat="server">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <title>Session Clock Demo</title>

    <style type="text/css">
        * {
            box-sizing: border-box;
        }

        body {
            font-family: Arial;
            margin: 0;
        }

        .header {
            padding: 60px;
            text-align: center;
            background: #1abc9c;
            color: white;
        }

        .row, .container {
            display: flex;
            flex-wrap: wrap;
        }

        .side {
            flex: 30%;
            padding: 20px;
        }

        .main {
            flex: 30%;
            padding: 20px;
        }

        .footer {
            position: absolute;
            bottom: 0;
            width: 100%;
            padding: 5px;
            text-align: center;
            background: #ddd;
        }
    </style>
</head>
<body>
    <form id="form1" runat="server">
        <div class="header">
            <h1>Session Clock</h1>
            A pure javascript utility to display remaining session time.
        </div>
        <div class="container">
            <div class="side">
                <span id="lblSessionTime"></span>
            </div>
            <div class="main">
                <p>1. Include these two files</p>
                <p><code>&lt;script src=&quot;js/core.js&quot;&gt;&lt;/script&gt;</code></p>
                <p><code>&lt;script src=&quot;js/KeepSessionAlive.js&quot;&gt;&lt;/script&gt;</code></p>
                <br />
                <p>2. Add the following listeners as required</p>
                <p><code>document.addEventListener(&#39;SessionClock_TickEvent&#39;, callback);</code></p>
                <p><code>document.addEventListener(&#39;SessionClock_WarningEvent&#39;, callback);</code></p>
                <p><code>document.addEventListener(&#39;SessionClock_SessionExpiredEvent&#39;, callback);</code></p>
            </div>
        </div>
        <div class="footer">
            <p>MIT License</p>
        </div>
    </form>

    <script src="js/core.js"></script>
    <script src="js/KeepSessionAlive.js"></script>
    <script type="text/javascript">
        document.addEventListener('SessionClock_TickEvent', function (e) { document.getElementById('lblSessionTime').innerText = e.detail.formattedTime; });
        //if (document.getElementById('lblSessionTime') !== null) {
        //    document.getElementById('lblSessionTime').innerText = sessionTimer.getTime();
        //}
        //if (document.getElementById('lblSessionTimeW') !== null) {
        //    document.getElementById('lblSessionTimeW').innerText = sessionTimer.getTime();
        //}
        //if (document.getElementById('lblSessionTime1') !== null) {
        //    document.getElementById('lblSessionTime1').innerText = sessionTimer.getTime();
        //}

        //var dvAnimate = document.getElementById('dvAnimate');
        //if (dvAnimate !== null) {
        //    var timeTotal = sessionTime * 60;
        //    var warningIntervalPercentage = ((sessionTime - warningInterval) / sessionTime) * 100;

        //    var timePercentage = Math.floor((sessionTimer.time * 100) / timeTotal);
        //    dvAnimate.style.background = timePercentage <= warningIntervalPercentage ? 'red' : timePercentage <= 30 ? 'yellow' : '#5cb85c';

        //    var progressBarWidth = Math.floor((100 * timePercentage) / 100);
        //    dvAnimate.style.width = progressBarWidth + '%';
        //}

        function setWrapperStyle(display) {
            var wrapper = document.getElementById('SessionWarningWrapper');
            if (wrapper !== null && wrapper !== undefined)
                wrapper.style.display = display;
        }

        function showSessionExpirePopUp() { //showSessionExpirePopUp
            if (document.getElementById('dialog_alert') !== null)
                window.location = core.navigator.getBaseURL() + '/newuserlogin.aspx?message=' + ('You have been logged off due to inactivity. Please log in again.');
            else
                window.close();
        }

        function hideSessionExpirePopUp() {
            if (document.getElementById('dialog_alert1') !== null)
                document.getElementById('dialog_alert1').style.display = 'none';
        }

        function showSessionWarningPopUp() { //showSessionWarningPopUp
            if (document.getElementById('dialog_alert') !== null)
                document.getElementById('dialog_alert').style.display = 'block';

            if (document.getElementById('btnSessionContinue') !== null) {
                document.getElementById("btnSessionContinue").disabled = false;
                document.getElementById("btnSessionContinue").focus();
            }

            //setWrapperStyle('block');  
        }

        function hideSessionWarningPopUp() {
            if (document.getElementById('dialog_alert') !== null)
                document.getElementById('dialog_alert').style.display = 'none';

            setWrapperStyle('none');
        }

    </script>
</body>
</html>

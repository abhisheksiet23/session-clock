<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="session_clock.Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml" lang="en-us">
<head runat="server">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <title>Session Clock Demo</title>
</head>
<body>
    <form id="form1" runat="server">
        <div>
            <span  id="lblSessionTime"></span>
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

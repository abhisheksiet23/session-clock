function Timer() {}
Timer.prototype.reset = function() {
    sessionTimer.time = parseInt(sessionTime) * 60;
};
Timer.prototype.timeToAdjust = function () {
    var currentTime = new Date().getTime();
    var delta = (currentTime - absoluteTime) - 1000;
    absoluteTime = currentTime - delta;

    return delta;
};
Timer.prototype.tick = function() {
    if (sessionTimer.time > 0) {
        sessionTimer.time--;
        setTimeout(sessionTimer.tick, (1000 - sessionTimer.timeToAdjust()));

        raiseSessionClockTickEvent();
    } else {
        core.cookie.set(cookieName, 0);
        core.logger.log(LogLevels.debug, 'sessionTimer reached 0. killing session. setting cookie to 0');

        window.location = core.navigator.getBaseURL() + "/handlers/KeepSessionAlive.ashx?action=KillSession";
    }
};
Timer.prototype.getTime = function() {
    var mins = parseInt(Math.floor(sessionTimer.time / 60), 10);
    var secs = parseInt(Math.floor(sessionTimer.time % 60), 10);

    return pad(mins, 2) + ':' + pad(secs, 2);
};
Timer.prototype.start = function() {
    absoluteTime = new Date().getTime();
    this.reset();
    setTimeout(sessionTimer.tick, 1000);

    raiseSessionClockTickEvent();
};

function raiseSessionClockTickEvent() {
    document.dispatchEvent(new CustomEvent('SessionClock_TickEvent', {
        detail: { time: sessionTimer.time, formattedTime: sessionTimer.getTime() }, bubbles: true
    }));
    core.logger.log(LogLevels.info, 'Session Clock Tick event raised. formatted time = ' + sessionTimer.getTime());
}

function raiseSessionExpiredEvent() {
    document.dispatchEvent(new CustomEvent('SessionClock_SessionExpiredEvent', {
        detail: {}, bubbles: true
    }));
    core.logger.log(LogLevels.info, 'Session Clock Session Expired event raised.');
}

function raiseSessionWarningEvent() { //showSessionWarningPopUp
    document.dispatchEvent(new CustomEvent('SessionClock_WarningEvent', {
        detail: { time: sessionTimer.time, formattedTime: sessionTimer.getTime() }, bubbles: true
    }));
    core.logger.log(LogLevels.info, 'Session Clock Warning event raised. formatted time = ' + sessionTimer.getTime());
}

var sessionTimer = null;
var cookieName = core.navigator.getClientName() + '_isrefreshed';
var currentTabsCount = 0;
var checkServerStatusIntervalID;
var checkCookieStatusIntervalID;
var sessionWarningTimeOutID;

function expireSession() {
    currentTabsCount = 0;
    
    clearInterval(checkCookieStatusIntervalID);
    clearInterval(checkServerStatusIntervalID);

    raiseSessionExpiredEvent();
}

function resetSession() {
    sessionTimer.reset();
    currentTabsCount = parseInt(core.cookie.get(cookieName));
    
    clearTimeout(sessionWarningTimeOutID);
    sessionWarningTimeOutID = setTimeout(function () { raiseSessionWarningEvent();}, parseInt(warningInterval) * 60 * 1000);

    hideSessionWarningPopUp();
    hideSessionExpirePopUp();
}

function checkCookieStatus() {
    var cookieValue = parseInt(core.cookie.get(cookieName));

    if (cookieValue === 0) {
        core.logger.log(LogLevels.debug, 'Cookie recieved 0 in routine cookie check. Expiring session in current page.');
        expireSession();
    } else if (cookieValue !== parseInt(currentTabsCount)) {
        core.logger.log(LogLevels.debug, 'Cookie is updated by some other tab as recieved different from curerntTabsCount. cookieValue = ' + cookieValue + ', currentTabsCount = ' + currentTabsCount + '. Restarting clock on this Tab.');
        resetSession();
    }
}

function checkServerStatus() {
    core.logger.log(LogLevels.info, 'Checking server status as scheduled. Important parameters before ajax call: sessionTimer = ' + sessionTimer.time + ', cookie value = ' + parseInt(core.cookie.get(cookieName)) + '.');

    var url = core.navigator.getBaseURL() + '/handlers/CheckSessionStatus.ashx';
    core.ajax.post(url, null, processSessionStatus, true);
}

function processSessionStatus(data, status) {
    if(status === 200) {
        if (parseInt(data) === 0) {
            core.cookie.set(cookieName, 0);
            core.logger.log(LogLevels.debug, 'Server session status recieved expired in check server status request. Expiring session and informing all tabs by updating cookie to 0');
            expireSession();
        } else {
            core.logger.log(LogLevels.info, 'Server session status recieved active as expected. Session Clock is running fine.');
        }
    } else if (status === 304) {
        core.logger.log(LogLevels.error, 'Server status response recieved from cache.');
    } else if (status === 503) {
        core.logger.log(LogLevels.error, 'Service unavailable.');
    }
}

function processKeepAlive(data, status) {
    if(status === 200) {
        if (parseInt(data) === 0) {
            core.cookie.set(cookieName, 0);
            core.logger.log(LogLevels.debug, 'Though we sent keep alive request but session was already expired on server. Expiring session in current page and informing all tabs by updating cookie to 0');
            
            expireSession();
        } else if (parseInt(data) === 1) {
            var cookieValue = parseInt(core.cookie.get(cookieName));
            core.cookie.set(cookieName, cookieValue + 1);
            core.logger.log(LogLevels.info, 'Session reset sucessful on server via keep alive request. To inform other tabs, updating cookie to ' + parseInt(core.cookie.get(cookieName)) + '.');

            resetSession();
        }
    }
}

function SessionExpiredOk() {
    window.location = core.navigator.getBaseURL() + "/handlers/KeepSessionAlive.ashx?action=KillSession";
}

function SessionWarning_Cancel() {
    hideSessionWarningPopUp();
}

function SessionWarning_Continue() {
    core.logger.log(LogLevels.info, 'User opts to continue Session. Sending keep alive request.');
    keepAlive();

    document.getElementById("btnSessionContinue").disabled = true;
    hideSessionWarningPopUp();
}

function keepAlive() {
    var cookieValue = parseInt(core.cookie.get(cookieName));
    if (cookieValue !== 0) {
        var url = core.navigator.getBaseURL() + '/handlers/KeepSessionAlive.ashx';
        core.ajax.post(url, null, processKeepAlive, true);
    }
}

function removeClockInPage() {
    var clockInterface = document.getElementById('SessionTimerClock');
    if (clockInterface !== null)
        clockInterface.style.display = 'none';
}

function startSessionClockForPage(data, status) {
    try {
        data = JSON.parse(data);
    } catch (e) {
        removeClockInPage();

        core.logger.log(LogLevels.error, 'incorrect session parameters recieved. raw data = ' + data);
        return 0;
    }

    sessionTime = parseInt(data.Timeout, 10);
    warningInterval = parseInt(data.Timeout, 10) - parseInt(data.WarningInterval, 10);

    core.logger.log(LogLevels.debug, 'Session parameters recieved: sessionTime = ' + sessionTime + ', warningInterval = ' + warningInterval + '.');
    if (sessionTime === warningInterval) {
        removeClockInPage();

        core.logger.log(LogLevels.debug, 'Session clock functionality is disabled as warning interval configuration recieved as 0');
        return 0;
    }

    var cookieValue = parseInt(core.cookie.get(cookieName));
    cookieValue = isNaN(cookieValue) ? 0 : cookieValue;

    currentTabsCount = cookieValue + 1;
    core.logger.log(LogLevels.debug, 'Session clock initiated on page. Cookie recieved ' + cookieValue + '. Updating cookie to ' + currentTabsCount + '.');
    core.cookie.set(cookieName, currentTabsCount);

    sessionTimer = new Timer();
    sessionTimer.start();

    sessionWarningTimeOutID = setTimeout(function () { raiseSessionWarningEvent(); }, parseInt(warningInterval) * 60 * 1000);

    checkCookieStatusIntervalID = setInterval(function () { checkCookieStatus(); }, 300);
    checkServerStatusIntervalID = setInterval(function () { checkServerStatus(); }, 30000);

    var pnlSessionTimer = document.getElementById('SessionTimerClock');
    if (pnlSessionTimer) {
        pnlSessionTimer.style.cursor = 'pointer';
        pnlSessionTimer.addEventListener('click', keepAlive);
    }
}

var sessionTime, warningInterval;
function initiateSessionClock() {
    var url = core.navigator.getBaseURL() + '/handlers/KeepSessionAlive.ashx?action=GetSessionParameters';
    core.ajax.post(url, null, startSessionClockForPage, true);
}

core.event.addEvent(window, 'load', initiateSessionClock);
window.console = window.console || { log: function () { } };
var LogLevels = { error: 1, warning: 2, debug: 3, info: 4 };
var currentLogLevel = LogLevels.debug;

var core = {
    navigator: {
        browser: function () {
            var ua = navigator.userAgent, tem,
                M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if (/trident/i.test(M[1])) {
                tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
                return { name: 'IE', version: (tem[1] || '') };
            }
            if (M[1] === 'Chrome') {
                tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
                if (tem != null) return { name: tem[1].replace('OPR', 'Opera'), version: tem[2] };
            }
            M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
            if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
            return { name: M[0], version: M[1] };
        }(),
        disableBackButton: function () {
            history.pushState(null, null);
            window.addEventListener('popstate', function () { history.pushState(null, null); });
        },
        getClientName: function () {
            var url = location.href;
            if (url.indexOf('localhost:') > -1)
                return '/';

            var pathname = location.pathname;
            var index1 = pathname.indexOf("/");
            var index2 = pathname.indexOf("/", index1 + 1);

            return pathname.substr(index1 + 1, index2 - 1).toLowerCase();
        },
        getBaseURL: function () {
            var url = location.href;
            var index1 = url.indexOf(location.pathname);
            var index2 = url.indexOf("/", index1 + 1);
            var baseLocalUrl = url.substr(0, index2);

            if (url.indexOf('localhost:') > -1)
                baseLocalUrl = url.substr(0, index1 + 1);

            return baseLocalUrl.toLowerCase();
        }
    },
    cookie : {
        set: function (name, value) {
            document.cookie = name + "=" + encodeURIComponent(value) + "; path=/; SameSite=Strict;";
        },
        get: function (name) {
            var i = document.cookie.indexOf(name);
            return i >= 0 ? document.cookie.substr(i + name.length + 1).split(';')[0] : null;
        }
    },
    ajax : {
        encode: function (data) {
            var query = [];
            for (var key in data) 
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            
            return query;
        },
        send: function (url, callback, method, data, async, contentType) {
            async = async || true;
            contentType = contentType || 'application/json';

            var x = new XMLHttpRequest();
            x.open(method, url, async);
            x.onreadystatechange = function () {
                if (x.readyState == 4) { callback(x.responseText, x.status); }
            };

            if (method == 'POST') {
                x.setRequestHeader('Content-Type', contentType);
            }

            x.send(data);
        },
        get: function (url, data, callback, async) {
            var query = core.ajax.encode(data);
            core.ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, async);
        },
        post: function (url, data, callback, async) {
            var query = core.ajax.encode(data);
            core.ajax.send(url, callback, 'POST', query.join('&'), async);
        }
    },
    http: {
        post: function (url, payload, target) {
            var f = document.createElement('form');

            f.action = getBaseURL() + (url.charAt(0) == '/' ? '' : '/') + url;
            f.method = 'POST';
            f.target = target == null || target == undefined ? '_self' : target;

            for (var j = 0; payload != null && payload != undefined && j < payload.length; j++) {
                var i = document.createElement('input');
                i.type = 'hidden';
                i.name = payload[j].name;
                i.value = payload[j].value;
                f.appendChild(i);
            }

            document.body.appendChild(f);
            f.submit();
        },
        redirect: function (url) {
            window.location = getBaseURL() + (url.charAt(0) == '/' ? '' : '/') + url;
        }
    },
    logger: {
        log: function (logLevel, msg) {
            if (currentLogLevel >= logLevel) {
                if (logLevel == LogLevels.error && console.error)
                    console.error(msg);
                else if (logLevel == LogLevels.warning && console.warn)
                    console.warn(msg);
                else if (logLevel == LogLevels.debug && console.debug)
                    console.debug(msg);
                else if (logLevel == LogLevels.info && console.info)
                    console.info(msg);
                else
                    console.log(msg);
            }
        }
    },
    event: {
        addEvent: function (element, event, fn) {
            if (element == null || element == undefined) {
                core.logger.log(LogLevels.debug, element + ' not available to attach ' + event + ' event.');
                return;
            }

            if (element.addEventListener) {
                element.addEventListener(event, fn, false);
            } else {
                element.attachEvent("on" + event, function () { return (fn.call(element, window.event)); });
            }

            core.logger.log(LogLevels.info, (fn.name || 'function') + ' attached to ' + (element.id || element.tagName || 'unknown element') + ' on ' + event + ' event.');
        },

    }
};

function trim(x) { return x.replace(/^\s+|\s+$/g, ''); }

function pad(n, w) { //n -> number, w-> width
    n = n + '';
    return n.length < w ? new Array(w - n.length + 1).join('0') + n : n;
}
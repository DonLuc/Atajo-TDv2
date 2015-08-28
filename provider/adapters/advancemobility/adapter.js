var config = require('./config');
var request = require('request');

var am = {
    authorise : function (username, password, cb) {
        am.request("users/authorise?login="+username+"&password="+password, function (response) {
            if (response) {
                cb(response.id, response);
            } else {
                cb(false, []);
            }
        });
    },
    callcycles : function (id, cb) {
        am.request("callcycles/runlist/"+id, function (response) {
            if (response) {
                cb(response);
            } else {
                cb(false);
            }
        });
    },
    request : function (url, cb) {
        var conParams = config.conParams[GLOBAL.RELEASE];
        request("http://"+conParams.host + ":" + conParams.port + "/" + conParams.url + "/" + url, function(err, resp, body) {
            if (err) {
                _log.d("REQUEST ERROR : " + err);
                cb(false);
            } else {
                _log.d("REQUEST RESPONSE : " + JSON.stringify(resp));
                if (resp.statusCode == 200) {
                    _log.d("REQUEST BODY : " + JSON.stringify(body));
                    cb(JSON.parse(body));
                } else {
                    _log.d("REQUEST ERROR : " + JSON.stringify(resp));
                    cb(false);
                }

            }
        });
    }
}

module.exports = am;
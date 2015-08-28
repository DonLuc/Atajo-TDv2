var config = require('./config');
var http = require('http');
var https = require('https');
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
        _log.d("TOKEN : " + id);
        am.request("callcycles/runlist/"+id, function (response) {
            _log.d("response : " + response);
            if (response) {
                cb(response);
            } else {
                cb(false);
            }
        });
    },
    post: function (url, apitoken, obj, cb) {

        var conParams = config.conParams[GLOBAL.RELEASE];

        var objString = JSON.stringify(obj);

        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': objString.length
        };

        var options = {
            host: conParams.host,
            port: conParams.port,
            path: conParams.url+url,
            method: 'POST',
            headers: headers
        };

        var req = http.request(options, function (res) {
            res.setEncoding('utf-8');

            var responseString = '';

            res.on('data', function (data) {
                responseString += data;
            });

            res.on('end', function () {
                //_log.d(responseString);

                try {

                    cb(JSON.parse(responseString));

                } catch (e) {

                    _log.e("Could not parse: " + responseString + " | " + e);
                    cb(false);

                }

            });
        });

        req.on('error', function (e) {

            _log.e("Error on post: " + e);
            cb(false);

        });

        req.write(objString);
        req.end();

    },
    get: function (url, apitoken, obj, cb) {

    var conParams = config.conParams[GLOBAL.RELEASE];

    var objString = JSON.stringify(obj);

    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': objString.length
    };

    var options = {
        host: conParams.host,
        port: conParams.port,
        path: conParams.url+url,
        method: 'GET',
        headers: headers
    };

    var req = http.request(options, function (res) {
        res.setEncoding('utf-8');

        var responseString = '';

        res.on('data', function (data) {
            responseString += data;
        });

        res.on('end', function () {
            //_log.d(responseString);

            try {

                cb(JSON.parse(responseString));

            } catch (e) {

                _log.e("Could not parse: " + responseString + " | " + e);
                cb(false);

            }

        });
    });

    req.on('error', function (e) {

        _log.e("Error on post: " + e);
        cb(false);

    });

    req.write(objString);
    req.end();

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
var config = require('./config');
var http = require('http');
var https = require('https');

var am = {
    authorise : function (username, password, cb) {
        am.get("users/authorise?login="+username+"&password="+password, "", "", function (response) {
            _log.d("response : " + JSON.stringify(response));
            if (response) {
                cb(response.id, response);
            } else {
                cb(false, []);
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

}

}

module.exports = am;
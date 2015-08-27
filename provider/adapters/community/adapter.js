var config = require('./config')
var _log = require('../../lib/log');

var http = require('http');

var community = {

    community: null,

    loginToken: function (username, password, cb) {

        var conParams = config.conParams[GLOBAL.RELEASE];

        var credentials = {
            username: username,
            password: password,
            communityKey: conParams.communityKey
        };

        var credString = JSON.stringify(credentials);

        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': credString.length
        };

        var options = {
            host: conParams.host,
            port: conParams.port,
            path: '/loginToken',
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
                _log.d(responseString);
                var token = res.headers["apitoken"];
                _log.d("token returned for login.");
                if (token) {

                    try {

                        cb(token, JSON.parse(responseString));

                    } catch (e) {

                        _log.e("Could not parse: " + responseString + " | " + e);
                        cb(false);

                    }

                } else {
                    cb(false);
                }
            });
        });

        req.on('error', function (e) {

            _log.e("Error on token login: " + e);
            cb(false);

        });

        req.write(credString);
        req.end();

    },


    post: function (url, apitoken, obj, cb) {

        var conParams = config.conParams[GLOBAL.RELEASE];

        var objString = JSON.stringify(obj);

        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': objString.length,
            'apitoken': apitoken
        };

        var options = {
            host: conParams.host,
            port: conParams.port,
            path: url,
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
                _log.d(responseString);

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


    put: function (url, apitoken, obj, cb) {

        var conParams = config.conParams[GLOBAL.RELEASE];

        var objString = JSON.stringify(obj);

        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': objString.length,
            'apitoken': apitoken
        };

        var options = {
            host: conParams.host,
            port: conParams.port,
            path: url,
            method: 'PUT',
            headers: headers
        };

        var req = http.request(options, function (res) {
            res.setEncoding('utf-8');

            var responseString = '';

            res.on('data', function (data) {
                responseString += data;
            });

            res.on('end', function () {
                _log.d(responseString);

                try {

                    cb(JSON.parse(responseString));

                } catch (e) {

                    _log.e("Could not parse: " + responseString + " | " + e);
                    cb(false);

                }

            });
        });

        req.on('error', function (e) {

            _log.e("Error on put: " + e);
            cb(false);

        });

        req.write(objString);
        req.end();

    },


    delete: function (url, apitoken, cb) {

        var conParams = config.conParams[GLOBAL.RELEASE];

        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': 0,
            'apitoken': apitoken
        };

        var options = {
            host: conParams.host,
            port: conParams.port,
            path: url,
            method: 'DELETE',
            headers: headers
        };

        var req = http.request(options, function (res) {
            res.setEncoding('utf-8');

            var responseString = '';

            res.on('data', function (data) {
                responseString += data;
            });

            res.on('end', function () {
                _log.d(responseString);

                try {

                    cb(JSON.parse(responseString));

                } catch (e) {

                    _log.e("Could not parse: " + responseString + " | " + e);
                    cb(false);

                }

            });
        });

        req.on('error', function (e) {
            _log.e("Error on delete: " + e);
            cb(false);
        });

        req.write("");
        req.end();

    },


    get: function (url, apitoken, cb) {

        var conParams = config.conParams[GLOBAL.RELEASE];

        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': 0,
            'apitoken': apitoken
        };

        var options = {
            host: conParams.host,
            port: conParams.port,
            path: url,
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
                _log.d(responseString);

                try {

                    cb(JSON.parse(responseString));

                } catch (e) {

                    _log.e("Could not parse: " + responseString + " | " + e);
                    cb(false);

                }

            });
        });

        req.on('error', function (e) {
            _log.e("Error on get: " + e);
            cb(false);
        });

        req.write("");
        req.end();

    },


    checkCommunity: function (token, cb) {

        if (this.community) {

            cb(this.community);

        } else {

            var conParams = config.conParams[GLOBAL.RELEASE];
            var url = '/api/v1/communities?key=' + conParams.communityKey;

            this.get(
                url,
                token,
                function (communities) {

                    try {

                        if (communities.length > 0) {
                            cb(communities[0]);
                        } else {
                            cb(false);
                        }

                    } catch (e) {

                        cb(false);

                    }

                }
            );

        }

    },


    getSurveys: function (token, cb) {

        var that = this;

        this.checkCommunity(token, function (community) {

            if (community) {

                var url = "/api/v1/surveys?_communityId=" + community._id;

                that.get(url, token, function (surveys) {

                    if (surveys) {

                        cb(surveys);

                    } else {

                        cb(false);

                    }

                })

            } else {

                cb(false);

            }

        });

    }

}

module.exports = community;





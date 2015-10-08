var am = require('../provider/adapters/advancemobility/adapter');
var _log = require('../provider/lib/log');
var fs = require('fs');
var path = require('path');

function mapEntities_write(token, entities,cb) {
    var data = {
        userId : token,
        entities : entities
    }
    if (!fs.existsSync(__dirname + "/userstore/")) {
        fs.mkdirSync(__dirname + "/userstore/");
    }
    fs.writeFile(__dirname + "/userstore/user_"+token+".json", JSON.stringify(data), function(err) {
        if (err) {
            console.log("Error writing user file: " + err);
            cb();
        } else {
            console.log("Wrote user file");
            cb();
        }
    });
}

exports.req = function(obj, cb) {
    am.callcycles(obj.token, function(results) {
        mapEntities_write(obj.token, results, function () {
            _log.d("RUN LIST : " + JSON.stringify(results));
            obj.RESPONSE = results;
            cb(obj);
        });
    });
}

var am = require('../provider/adapters/advancemobility/adapter');
var _log = require('../provider/lib/log');
var fs = require('fs');
var path = require('path');
var moment = require('moment');

function mapEntities_read(token,cb) {
    fs.readFile(__dirname + "/userstore/user_"+token+".json", function(err, data) {
        if (err) {
            console.log("Error writing user file: " + err);
            cb([]);
        } else {
            var callCycle = JSON.parse(data);
            _log.d("FETCHED CALL CYCLE : " + JSON.stringify(callCycle.entities));
            cb(callCycle.entities);
        }
    });
}
function mapModules_write(token, modules,cb) {
    var data = {
        userId : token,
        modules : modules
    }
    if (!fs.existsSync(__dirname + "/modulestore/")) {
        fs.mkdirSync(__dirname + "/modulestore/");
    }
    fs.writeFile(__dirname + "/modulestore/user_"+token+".json", JSON.stringify(data), function(err) {
        if (err) {
            console.log("Error writing user file: " + err);
            cb();
        } else {
            console.log("Wrote user file");
            cb();
        }
    });
}
function goFish (a, obj, callCycle, returnObj, cb) {
    var currDate = moment().format("YYYYMMDD");
    am.datagen(currDate+"000000", obj.token, callCycle[a].entityId, function(results) {
        returnObj.push({"entityId" : callCycle[a].entityId ,"data": results});
        if (returnObj.length == callCycle.length) {
            mapModules_write(obj.token, returnObj, function() {
                _log.d("RETURNING MODULE DATA FOR USER : " + obj.token);
                obj.RESPONSE = returnObj;
                cb(obj);
            });
        }
    });
}

exports.req = function(obj, cb) {
    mapEntities_read(obj.token, function (callCycle) {
        var returnObj = [];
        if (callCycle.length == 0) {
            mapModules_write(obj.token, returnObj, function() {
                _log.d("RETURNING MODULE DATA FOR USER : " + obj.token);
                obj.RESPONSE = returnObj;
                cb(obj);
            });
        } else {
            for(var a in callCycle) {
                goFish(a, obj, callCycle, returnObj, cb);
            }
        }
    });
}

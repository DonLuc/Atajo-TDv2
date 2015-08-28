var am = require('../provider/adapters/advancemobility/adapter');
var _log = require('../provider/lib/log');

exports.req = function(obj, cb) {
    am.callcycles(obj.token, function(results) {
        _log.d("RUN LIST : " + JSON.stringify(results));
        obj.RESPONSE = results;
        cb(obj);
    });
}

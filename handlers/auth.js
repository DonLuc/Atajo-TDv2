var am = require('../provider/adapters/advancemobility/adapter');
var _log = require('../provider/lib/log');

exports.req = function (obj, cb) {
	am.authorise(obj.credentials.username, obj.credentials.password, function(token, userObj) {
		if(token) {
			if(userObj.mobileUser) {
				_log.d("SUCCESSFUL AUTH FOR USER : " + obj.credentials.username);
				obj.RESPONSE = token;
				obj.ROLES = [ { role : "mobileUser", data : { userObj : userObj }, id : token } ];
				cb(obj);
			} else {
				_log.d("FAILED AUTH FOR USER : " + obj.credentials.username);
				obj.RESPONSE = false;
				obj.ROLES = [ { role : "user", data : { userObj : userObj }, id : token } ];
				cb(obj);
			}
		} else {
			_log.d("FAILED AUTH FOR USER : " + obj.credentials.username);
			obj.RESPONSE = false;
			obj.ROLES = [ { role : "user", data : { userObj : userObj }, id : token } ];
			cb(obj);
		}
	});
}
var am = require('../provider/adapters/advancemobility/adapter');
var _log = require('../provider/lib/log');

exports.req = function (obj, cb) {
	am.authorise(obj.credentials.username, obj.credentials.password, function(token, userObj) {
		if(token) {
			if(userObj.mobileUser) {
				obj.RESPONSE = token;
				obj.ROLES = [ { role : "mobileUser", data : { userObj : userObj }, id : token } ];
				cb(obj);
			} else {
				obj.RESPONSE = token;
				obj.ROLES = [ { role : "user", data : { userObj : userObj }, id : token } ];
				cb(obj);
			}
		} else {
			obj.RESPONSE = token;
			obj.ROLES = [ { role : "user", data : { userObj : userObj }, id : token } ];
			cb(obj);
		}
	});
}
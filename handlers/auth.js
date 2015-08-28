var am = require('../provider/adapters/advancemobility/adapter');
var _log = require('../provider/lib/log');

exports.req = function (obj, cb) {
	am.authorise(obj.credentials.username, obj.credentials.password, function(token, userObj) {
		if(userObj.mobileUser) {
			obj.RESPONSE = token;
			obj.ROLES = [ { role : "mobileUser", data : { userObj : userObj }, SessionID : token } ];
			cb(obj);
		} else {
			cb(false);
		}
	});
}
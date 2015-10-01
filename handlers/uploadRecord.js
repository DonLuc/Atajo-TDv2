var am = require('../provider/adapters/advancemobility/adapter');
var _log = require('../provider/lib/log');

exports.req = function(obj, cb) {
	
	console.log("UPLOAD RECORD");
	am.upload(obj.data,function(results)
	{
		result = { req : obj.data, res : "GOOD", msg : "GOOD"  };
    	obj.RESPONSE = { jobID:obj.jobID, statusCode:10, result:result};
		cb(obj);
	});

    // am.uploadRecord(obj.token, function(results) {
    //     mapEntities_write(obj.token, results, function () {
    //         _log.d("RUN LIST : " + JSON.stringify(results));
    //         obj.RESPONSE = results;
    //         cb(obj);
    //     });
    // });
}

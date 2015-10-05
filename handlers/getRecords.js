var _log = require('../provider/lib/log');
var moduleBuilder = require('./moduleBuilder');
var fs = require('fs');

function mapModules_read(token, cb) {
    fs.readFile(__dirname + "/modulestore/user_" + token + ".json", function (err, data) {
        if (err) {
            console.log("Error reading user file: " + err);
            cb([]);
        } else {
            var moduleData = JSON.parse(data);
            cb(moduleData.modules);
        }
    });
}

exports.req = function (obj, cb) {
    var modulesList = [];

    mapModules_read(obj.token, function (entities) {

        var returnArray = [];
        if (entities.length == 0) {
            _log.d("RETURNING MODULE ITEMS DATA FOR USER : " + obj.token);
            obj.RESPONSE = modulesList;
            cb(obj);

        } else {

        	for(var j in entities)
        	{
        		var entity = entities[j].data;
        		var moduleRecords = entity.moduleRecords;
        		_log.d("MODULE RECORDS : " + moduleRecords.length);
        		for(var i in moduleRecords)
        		{
        			modulesList.push(moduleRecords[i]);
        		}
        	}
        	obj.RESPONSE = modulesList;
            cb(obj);
        }
    });
}


// "moduleRecordTcInstanceId": module.moduleRecordTcInstanceId,
// "copyType": module.copyType,
// "isEditableOnDevice": module.isEditableOnDevice,
// "isRemovableOnDevice": module.isRemovableOnDevice,
// "isDatasourceOnDevice": module.isDatasourceOnDevice,
// "overlayItemsFromProjects": module.overlayItemsFromProjects,
// "isRemovableOnDevice": module.isRemovableOnDevice,
// "maxScore": module.maxScore,
// "moduleRecordTcKeepOnDevice": module.moduleRecordTcKeepOnDevice,
// "compulsory": module.compulsory,
// "groupItemsIntoOneCategory": module.groupItemsIntoOneCategory,
// "instructionId": module.instructionId,
// "closed": module.closed,
// "behaviour": module.behaviour,
// "moduleRecordTcIsHistoric": module.moduleRecordTcIsHistoric,
// "projectId": module.projectId,
// "showOnEntityScore": module.showOnEntityScore,
// "startDate": module.startDate


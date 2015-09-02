var _log = require('../provider/lib/log');
var moduleBuilder = require('./moduleBuilder');
var fs = require('fs');
function mapModules_read(token,cb) {
    fs.readFile(__dirname + "/modulestore/user_"+token+".json", function(err, data) {
        if (err) {
            console.log("Error writing user file: " + err);
            cb([]);
        } else {
            var callCycle = JSON.parse(data);
            _log.d("FETCHED MODULES : " + JSON.stringify(callCycle.modules));
            cb(callCycle.modules);
        }
    });
}



exports.req = function(obj, cb) {
    var modulesList=[];


    mapModules_read(obj.token, function (entities) {
        var returnObj = [];
        if (entities.length == 0) {
            _log.d("RETURNING MODULE ITEMS DATA FOR USER : " + obj.token);
            obj.RESPONSE = modulesList;
            cb(obj);

        } else {
            for(var k=0;k<entities.length;k++){
                var entity=entities[k].data;
                console.log("modules length"+entity.modules.length);
                for(var t=0;t<entity.modules.length;t++){
                    var module=entity.modules[t];
                    if(module.headerFields.length>0){
                        console.log("fields exist:"+module.name);
                        var newmoduleHtml=moduleBuilder.process(module, 'questions', 'surveySectionFront');
                        module.html=newmoduleHtml;
                        entity.modules[t]=module;
                        entities[k]=entity;
                        var modulObj={"moduleId":module.id,"html":newmoduleHtml,"model":""};
                        modulesList.push(modulObj);
                    }
                }
                if(k==entities.length-1){
                    _log.d("RETURNING MODULE ITEMS DATA FOR USER : " + obj.token);
                    obj.RESPONSE = modulesList;
                    cb(obj);
                }
            }

        }
    });
}
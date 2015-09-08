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
    var catList=[];

    mapModules_read(obj.token, function (entities) {
        var returnObj = [];
        if (entities.length == 0) {
            _log.d("RETURNING MODULE ITEMS DATA FOR USER : " + obj.token);
            obj.RESPONSE = modulesList;
            cb(obj);

        } else {
            var modulObj={};
            for(var k=0;k<entities.length;k++){
                var entity=entities[k].data;

                console.log("modules length"+entity.modules.length);

                //if(entity.tcCategories.length){
                //    console.log("cat L:"+entity.tcCategories.length);
                //    entity.tcCategories.sort(function(a, b){
                //        var x = a.moduleId;
                //        var y = b.moduleId;
                //
                //        if (x < y) //sort string ascending
                //            return 1
                //        if (x > y)
                //            return -1
                //        return 0 //default return value (no sorting)
                //    })
                //}

                for(var t=0;t<entity.modules.length;t++){
                    var module=entity.modules[t];
                    if(module.headerFields.length>0){
                        console.log("fields exist:"+module.name);
                        var newmoduleHtml=moduleBuilder.process(module, 'headerItems', 'surveySectionFront');
                        module.html=newmoduleHtml;
                        entity.modules[t]=module;
                        entities[k]=entity;
                         modulObj={"moduleId":module.id,"moduleName":module.name,"html":newmoduleHtml,"model":module.headerFields};
                        modulesList.push(modulObj);
                    }
                }


                console.log("cat L:"+entity.tcCategories.length);

                for(var j=0;j<entity.tcCategories.length;j++){
                    console.log("cat LL:"+entity.tcCategories.length);
                    //
                var catObj={"moduleId":entity.tcCategories[j].moduleId||0,
                    "name":entity.tcCategories[j].name||'',
                    "path":entity.tcCategories[j].path||'',
                    "hasItems":entity.tcCategories[j].hasItems||'',
                    "moduleCategories":entity.tcCategories[j].moduleCategories||''};
                    catList.push(catObj);
                    console.log("cat LLO :"+catList.length);
                    //if(){
                    //     modulObj.cat=catList;
                    //}

                }
                if(k==entities.length-1){
                    _log.d("RETURNING MODULE ITEMS DATA FOR USER : " + obj.token);
                    obj.RESPONSE = catList;
                    cb(obj);
                }
            }

        }
    });
}
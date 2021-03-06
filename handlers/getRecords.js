var _log = require('../provider/lib/log');
var moduleBuilder = require('./moduleBuilder');
var fs = require('fs');
function mapModules_read(token, cb) {
    fs.readFile(__dirname + "/modulestore/user_" + token + ".json", function (err, data) {
        if (err) {
            console.log("Error writing user file: " + err);
            cb([]);
        } else {
            var moduleData = JSON.parse(data);
            _log.d("FETCHED MODULES : " + JSON.stringify(moduleData.modules));
            cb(moduleData.modules);
        }
    });
}

//to do add user specific module id=-5
exports.req = function (obj, cb) {
    var modulesList = [];
    var catList = [];

    mapModules_read(obj.token, function (entities) {
        var returnArray = [];
        if (entities.length == 0) {
            _log.d("RETURNING MODULE ITEMS DATA FOR USER : " + obj.token);
            obj.RESPONSE = modulesList;
            cb(obj);

        } else {


            (builModule = function (j) {
                var entity = entities[j].data;
                for(var i in entity.moduleRecords)
                {
                    var moduleRecord = entity.moduleRecords[i];
                    var recordLines = moduleRecord.lines;

                    // var tcItems = entity.tcItems;
                    // console.log("items before sort: " + JSON.stringify(recordLines));

                   // getTcItems(tcItems, function (items) {

                        getCategories(entity.tcCategories, recordLines, function (categ) {
                            // console.log("finished cat: " + JSON.stringify(categ));
                            getHtml(moduleRecord, categ,recordLines, function (responseHtml) {
                                // console.log("finished loading modules :" + JSON.stringify(responseHtml));


                                var temp = returnArray.concat(responseHtml);
                                returnArray = temp;
                            })
                     //   })

                    })
                }
                if (j == entities.length - 1) {
                    obj.RESPONSE = returnArray;
                    cb(obj);
                } else {
                    builModule(j + 1);
                }

            } ) (0);

        }
    });

// all items list per entity
    function getTcItems(items, cbItems) {
        var masterCatList = [];

        if (items.length > 0) {
            _log.d("Got items");
            ///sort items by category id
            items.sort(function (a, b) {
                var x = a.catId;
                var y = b.catId;

                if (x < y) //sort string ascending
                    return 1
                if (x > y)
                    return -1
                return 0 //default return value (no sorting)
            })
            var prevCat = items[0].catId;
            console.log(items.length + "--first cat :" + prevCat);

            var itemsPerCat = [];
            for (var p = 0; p < items.length; p++) {
                console.log("in item :" + items[p].catId);
                if (prevCat == items[p].catId) {
                    console.log("matching")
                    itemsPerCat.push(items[p]);

                    if (p == items.length - 1) {
                        var itemPCatObj = {"catId": items[p].catId, "items": itemsPerCat};
                        masterCatList.push(itemPCatObj);

                        cbItems(masterCatList);
                    }

                } else {
                    console.log("not matching")
                    var itemPCatObj = {"catId": items[p - 1].catId, "items": itemsPerCat};
                    masterCatList.push(itemPCatObj);
                    itemsPerCat = [];
                    itemsPerCat.push(items[p]);
                    prevCat = items[p].catId;
                    if (p == items.length - 1) {
                        var itemPCatObj = {"catId": items[p].catId, "items": itemsPerCat};
                        masterCatList.push(itemPCatObj);

                        cbItems(masterCatList);
                    }

                }

            }
        } else {
            _log.d("NO items found");
            cbItems(masterCatList);
        }
    }

    //get categories
    function getCategories(cat, items, cbCat) {
        var masterCat = [];
        console.log("sorting cats");
        if (cat.length > 0) {
            cat.sort(function (a, b) {
                var x = a.id;
                var y = b.id;

                if (x < y) //sort string ascending
                    return 1
                if (x > y)
                    return -1
                return 0 //default return value (no sorting)
            })

            for (var y = 0; y < cat.length; y++) {

                var catPath = cat[y].path;
                catPath = catPath.split(":");
                console.log("cat split :" + JSON.stringify(catPath));
                if (catPath.length > 0) {
                    var subObj = cat[y];
                    subObj.parent = catPath[catPath.length - 2];
                    // var subObj = {"parent": catPath[catPath.length - 2], "cat": cat[y]};
                    //for (var i = 0; i < items.length; i++) {
                    //    if (items[i].catId == cat[y].id) {
                    //        subObj.items = items[i].items;
                    //    }
                    //    if (i == items.length - 1) {
                            masterCat.push(subObj);
                    //    }
                    //}


                } else {
                    var subObj = cat[y];
                    //subObj.parent= -1;
                    //  var subObj = {"parent": -1, "cat": cat[y]};
                    //for (var i = 0; i < items.length; i++) {
                    //    if (items[i].catId == cat[y].id) {
                    //        subObj.items = items[i].items;
                    //    }
                    //    if (i == items.length - 1) {
                            masterCat.push(subObj);
                    //    }
                    //}
                }
                if (y == cat.length - 1) {
                    cbCat(masterCat);

                }
            }


        }
        else {
            _log.d("NO CATEGORIES found");
            cbCat(masterCat);
        }
    }

    // call methods to generate html for entity per module
    function getHtml(modules, cats,items, cbHtml) {
        var modulesList = [];

            var module = modules;
            getHeader(module, function (header) {
                getFooter(module, function (footer) {
                    getLineItems(module, function (line) {

                        var lineData  = []; //JSON.parse(JSON.stringify(module.module.lineFields));
                        var moduleCats = JSON.parse(JSON.stringify(cats));
                        var newItems = JSON.parse(JSON.stringify(items));

                        // console.log("lineData " + JSON.stringify(lineData));
                        // console.log("moduleCats " + JSON.stringify(moduleCats));
                        // console.log("newItems " + JSON.stringify(newItems));
                        for (var s  in items) {
                            var tempData = JSON.parse(JSON.stringify(module.module.lineFields));
                            lineData.push(tempData);
                        }


                         var modulObj = {
                            "moduleId": module.module.id,
                            "moduleName": module.module.name,
                            "htmlHeader": header,
                            "htmlLine": line,
                            "htmlFooter": footer,
                            "modelHeader": module.module.headerFields,
                            "modelLine": lineData,
                            "modelFooter": module.module.footerFields,
                            "categories": moduleCats,
                            "items":newItems,
                            "moduleRecord" : module,
                            "projectId" : module.projectId
                        };
                        cbHtml(modulObj);

                        // var moduleCats = [];
                        // if (cats.length > 0) {
                        //     //loop through all the categories and add them to the relevant module for this entity
                        //     for (var f = 0; f < cats.length; f++) {
                        //         console.log(cats.length + "adding cats to list:" + f);
                        //         if (module.id == cats[f].moduleId) {
                        //             moduleCats.push(cats[f]);
                        //         }
                        //         if (f == cats.length - 1) {

                        //             var lineData = [];
                        //         if(items.length==0) {
                        //             console.log("creating module without line itesm ");
                        //             var modulObj = {
                        //                 "moduleId": module.id,
                        //                 "moduleName": module.name,
                        //                 "htmlHeader": header,
                        //                 "htmlLine": line,
                        //                 "htmlFooter": footer,
                        //                 "modelHeader": module.headerFields,
                        //                 "modelLine": lineData,
                        //                 "modelFooter": module.footerFields,
                        //                 "categories": moduleCats,
                        //                 "items":items
                        //             };
                        //             modulesList.push(modulObj);
                        //             if (q < modules.length - 1) {
                        //                 callGenHtml(q + 1);
                        //             } else {
                        //                 cbHtml(modulesList);
                        //             }
                        //         }else{
                        //             //loop through all line items and build data object
                        //             for (var s = 0; s < items.length; s++) {

                        //                 lineData.push(module.lineFields);

                        //                 if (s == items.length - 1) {
                        //                     console.log("creating module object with line items");
                        //                     var modulObj = {
                        //                         "moduleId": module.id,
                        //                         "moduleName": module.name,
                        //                         "htmlHeader": header,
                        //                         "htmlLine": line,
                        //                         "htmlFooter": footer,
                        //                         "modelHeader": module.headerFields,
                        //                         "modelLine": lineData,
                        //                         "modelFooter": module.footerFields,
                        //                         "categories": moduleCats,
                        //                         "items":items
                        //                     };
                        //                     modulesList.push(modulObj);
                        //                     if (q < modules.length - 1) {
                        //                         callGenHtml(q + 1);
                        //                     } else {
                        //                         cbHtml(modulesList);
                        //                     }

                        //                 }

                        //             }
                        //         }
                        //         }


                        //     }

                        // } else {
                        //     // if all three do not have data do not add object
                        //     if (header == "" && line == "" && footer) {
                        //         if (q < modules.length - 1) {
                        //             callGenHtml(q + 1);
                        //         } else {
                        //             cbHtml(modulesList);
                        //         }
                        //     } else {
                        //         var modulObj = {
                        //             "moduleId": module.id,
                        //             "moduleName": module.name,
                        //             "htmlHeader": header,
                        //             "htmlLine": line,
                        //             "htmlFooter": footer,
                        //             "modelHeader": module.headerFields,
                        //             "modelLine": module.lineFields,
                        //             "modelFooter": module.footerFields,
                        //             "categories": moduleCats,
                        //             "items":items
                        //         };
                        //         modulesList.push(modulObj);

                        //         if (q < modules.length - 1) {
                        //             callGenHtml(q + 1);
                        //         } else {
                        //             cbHtml(modulesList);
                        //         }
                        //     }


                        // }
                    })
                });
            });
    }

    //create actual html
    function getHeader(module, cbHeader) {
        var headerHtml = "";
        if (module.module.headerFields.length > 0) {
            _log.d("PROCESSING HEADER ITEMS FOR MODULE:" + module.name);
            var headerHtml = moduleBuilder.process(module.module.headerFields, 'headerItems', 'sectionFront');
            cbHeader(headerHtml);
        }
        else {
            _log.d("PROCESSING HEADER ITEMS FOR MODULE(NONE FOUND):" + module.name);
            cbHeader(headerHtml);

        }
    }

    //create actual html
    function getFooter(module, cbFooter) {
        var footerHtml = "";
        if (module.module.footerFields.length > 0) {
            _log.d("PROCESSING FOOTER ITEMS FOR MODULE:" + module.name);
            var footerHtml = moduleBuilder.process(module.module.footerFields, 'footerItems', 'sectionFront');

            cbFooter(footerHtml);
        }
        else {
            _log.d("PROCESSING FOOTER ITEMS FOR MODULE(NONE FOUND):" + module.name);
            cbFooter(footerHtml);

        }
    }

    //create actual html
    function getLineItems(module, cbLine) {
        var lineItemsHtml = "";
        if (module.module.lineFields.length > 0) {
            _log.d("PROCESSING  LINE ITEMS FOR MODULE :" + module.name);
            var lineItemsHtml = moduleBuilder.process(module.module.lineFields, 'lineItems', 'sectionFront');
            _log.d("PROCESSING  LINE ITEMS FOR MODULE :" + lineItemsHtml);
            cbLine(lineItemsHtml);
        }
        else {
            _log.d("PROCESSING  LINE ITEMS FOR MODULE (NONE FOUND):" + module.name);
            cbLine(lineItemsHtml);

        }
    }
}
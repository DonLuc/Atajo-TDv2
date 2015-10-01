String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

_moduleContainer = {

    model: [],
    surveys: {},
    models: {},
    sectionNames: {},
    xmls: {},


    createResource: function (img) {

        var resource = {

            filename: "",
            description: "Photo for question",
            mime: "image/jpeg",
            data: img,
            gps: {
                lon: 0.0,
                lat: 0.0
            }

        }

        return resource;

    },


    parseResponse: function (model, sid, name) {

        _log.d("PARSE: " + sid + " " + name);

        model = (typeof model == 'undefined') ? _moduleContainer.model : model;
        sid = (typeof sid == 'undefined') ? _moduleContainer.currSID : sid;

        var answers = []


        for (var i in model) {
            //_log.d("name: " + JSON.stringify(i));

            var value = "";

            // Get value for different controls
            if (i.endsWith("_SELECTED") || i.endsWith("_PHOTO_0") || i.endsWith("_PHOTO_1") || i.endsWith("_PHOTO_2") || i.endsWith("_COMMENT")) {

                continue;

            } else if (model.hasOwnProperty(i + "_SELECTED")) {

                value = model[i + "_SELECTED"].name;

            } else {

                value = model[i];

            }

            var comment = "";
            var resources = [];

            if (model.hasOwnProperty(i + "_COMMENT")) {
                comment = model[i + "_COMMENT"]
            }

            if (model.hasOwnProperty(i + "_PHOTO_0")) {
                var img = model[i + "_PHOTO_0"];
                if (img != "img/placeholder.png") {
                    resources.push(_moduleContainer.createResource(img));
                }
            }

            if (model.hasOwnProperty(i + "_PHOTO_1")) {
                var img = model[i + "_PHOTO_1"];
                if (img != "img/placeholder.png") {
                    resources.push(_moduleContainer.createResource(img));
                }
            }

            if (model.hasOwnProperty(i + "_PHOTO_2")) {
                var img = model[i + "_PHOTO_2"];
                if (img != "img/placeholder.png") {
                    resources.push(_moduleContainer.createResource(img));
                }
            }

            var answer = {

                name: i,
                value: value,
                comment: comment,
                resources: resources

            }

            answers.push(answer);

        }

        var section = {

            name: name,
            questions: answers

        }

        //_log.d("RETURNING SECTION");
        //_log.d(JSON.stringify(section));

        return section;

    },


    _currCard: null,


    // This fixes reference links for the select and its selected value
    // to ensure that angular points to the correct property.
    referenceFix: function (model) {


        for (var p in model) {

            if (model.hasOwnProperty(p + "_SELECTED")) {

                var options = model[p];
                var selected = false;


                for (var o in options) {

                    if (options[o].name == model[p + "_SELECTED"].name) {

                        _log.d("REFERENCE FIX: " + options[o].name);
                        selected = options[o];


                    }

                }


                if (selected) {

                    model[p + "_SELECTED"] = selected;

                }


            }

        }


    },


    signature: function (text) {

        var modal = atajo.modal;
        console.log("incoming text:" + text);
        //alert("after ok 2");
        modal.signature(
            {
                icon: 'fa-pencil-square-o',  	// icon which will appear top left  - default : fa-warning
                title: 'SIGNATURE',     	// title which will appear top right - default : notice

                canCancel: 'true', 		       // show cancel button - default: false
                onOk: function (data) {
                    console.log("returned data from modal" + data);
                    var dt = data;
                    console.log("after ok");


                    if (!data) {
                        console.log("no data image");

                        return;

                    }


                }, // callback with signature data

                content: text              // content of the modal below the signature pad


            });
    },
    scan: function () {
        _scanner.scan(function (data) {
            console.log("scanned:" + data);
        })
    },
    addPic: function (elm, model, attachElm) {

        _log.d("ADDING PIC TO : " + model);

        _camera.getPic(function (imageData) {


            _log.d("GOT IMAGE : " + imageData);

            _log.d("searching for " + model);


            $(elm).attr("src", imageData);
            //for (var i in _moduleBuilder.currentForms) {
            //    _log.d("Current form index: " + i);
            //
            //    var form = _moduleBuilder.currentForms[i];
            //
            //    for (var x in form.model) {
            //
            //        _log.d("DOES " + x + " == " + model);
            //        if (x == model) {
            //            _log.d("IT DOES ! --> " + attachElm);
            //            //console.log("image location"+_location.currLat);
            //            form.model[x] = {
            //                "data": imageData,
            //                "latitude": _location.currLat,
            //                "longitude": _location.currLon
            //            };
            //            layout.attach('#' + attachElm);
            //
            //            break;
            //        }
            //
            //    }
            //
            //}


            //  $(elm).attr('src', imageData);

        }, 384, 216);
    },
    removePic: function (elm, model, attachElm) {

        _log.d("REMOVING PIC FROM : " + model);


        _log.d("searching for " + model);
        $(elm).attr("src", 'img/placeholder.png');

        //for (var i in _moduleBuilder.currentForms) {
        //    _log.d("Current form index: " + i);
        //
        //    var form = _moduleBuilder.currentForms[i];
        //
        //    for (var x in form.model) {
        //
        //        _log.d("DOES " + x + " == " + model);
        //        if (x == model) {
        //            _log.d("IT DOES ! --> " + attachElm);
        //
        //            form.model[x] = {"data": 'img/placeholder.png'};
        //
        //            layout.attach('#' + attachElm);
        //
        //            break;
        //        }
        //
        //    }
        //
        //}


    },


    showNext: function (face) {
        console.log("navigate to next section of module..");
        if (!_moduleContainer.showLine && _moduleContainer.hasLine) {
            _moduleContainer.showLine = true;
            _moduleContainer.showHeader = false;
            $(".moduleHeader").hide();
            $(".moduleFooter").hide();
            $(".moduleLine").show();
            return _moduleContainer.moduleHeadingL;
        } else if (!_moduleContainer.showFooter && _moduleContainer.hasFooter) {
            _moduleContainer.showFooter = true;
            _moduleContainer.showHeader = false;
            _moduleContainer.showLine = false;
            $(".moduleHeader").hide();
            $(".moduleLine").hide();
            $(".moduleFooter").show();
            var e = document.getElementById('moduleListSmallViewer__FACE');
            var scope = angular.element(e).scope();
            scope.$apply();
            return _moduleContainer.moduleHeadingF;
        }
        var e = document.getElementById('moduleListSmallViewer__FACE');
        var scope = angular.element(e).scope();
        scope.$apply();


        //layout.attach("#"+face,true);
    },
    showPrev: function (face) {
        if (_moduleContainer.showLine && _moduleContainer.hasLine) {
            $(".moduleHeader").show();
            $(".moduleFooter").hide();
            $(".moduleLine").hide();
            _moduleContainer.showLine = false;
            _moduleContainer.showHeader = true;
            return _moduleContainer.moduleHeadingH;
        } else if (_moduleContainer.showFooter && _moduleContainer.hasFooter) {
            $(".moduleHeader").hide();
            $(".moduleFooter").hide();
            $(".moduleLine").show();
            _moduleContainer.showFooter = false;
            _moduleContainer.showLine = true;
            return _moduleContainer.moduleHeadingL;
        }
    }
    ,
    generateUploadObject: function(moduleItem,entityId,userId)
    {
        var date = new Date();
        var timeStamp = (date.getYear() + 1990) +''+ ('0' + date.getMonth()).slice(-2) +''+ ('0' +date.getDate()).slice(-2) +''+('0' +date.getHours()).slice(-2) +''+ ('0' +date.getMinutes()).slice(-2)+''+('0' +date.getSeconds()).slice(-2);

        var uploadObject = 
        {
            activity:[],
            mobile_version : "7.4",
            auditRecords : [],
            mobile_build : "07271304",
            moduleRecords : [],
            visit : {},
            gps : [],
            client_name : _login.credentials.username,//What must be here?
            generated_time : timeStamp
        };

        var moduleRecord = {};

        moduleRecord.moduleRecordTcInstanceId = '1';
        moduleRecord.endDate = "";
        moduleRecord.showScore = false;
        moduleRecord.captureEndDate = timeStamp;
        moduleRecord.headerAnswers = [];
        moduleRecord.score = 0;
        moduleRecord.moduleVersion = timeStamp;
        moduleRecord.copyType = 0;
        moduleRecord.isDatasourceOnDevice = true;
        moduleRecord.id = moduleItem.id;//what id is this?
        moduleRecord.moduleId = moduleItem.id;
        moduleRecord.lines = [];
        moduleRecord.overlayItemsFromProjects = false;
        moduleRecord.isRemovableOnDevice = false;
        moduleRecord.maxScore = 0;
        moduleRecord.moduleRecordTcKeepOnDevice = true;
        moduleRecord.isEditableOnDevice = true;
        moduleRecord.timeTaken = 20;
        moduleRecord.compulsory = false;
        moduleRecord.footerAnswers = [];
        moduleRecord.groupItemsIntoOneCategory = false;
        moduleRecord.name = moduleItem.name;
        moduleRecord.instructionId = -1;
        moduleRecord.closed = false;
        moduleRecord.behaviour = 0;
        moduleRecord.captureDate = timeStamp;
        moduleRecord.moduleRecordTcIsHistoric = false;
        moduleRecord.projectId = 103;
        moduleRecord.showOnEntityScore = false;
        moduleRecord.startDate = "";
        moduleRecord.captureStartDate = timeStamp;

        //Add Line Items
        for(var i in moduleItem.items)
        {
            var item = moduleItem.items[i];
            var modelLine = moduleItem.modelLine[i];
            var newItem = {};

            newItem.itemId = item.id;
            newItem.lineTClinesAreCompulsory = item.compulsory;
            newItem.score = 0;
            newItem.itemName = item.name;
            newItem.itemStock = item.stock;
            newItem.itemCode = item.code;
            newItem.answers = [];
            newItem.itemPrice = item.price;
            newItem.completed = true;
            newItem.maxScore = 0;
            newItem.categoryId = item.catId;


            for(var j in modelLine)
            {
                var field = modelLine[j];
                var answer = {};
                answer.score = field.score;
                answer.defaultValue = false;
                answer.optionId = 0;
                answer.behaviour = 0;
                answer.id = 0;
                answer.decisionId = 0;
                answer.value = 0;
                if(typeof field.value != 'undefined') answer.value = field.value;
                answer.order = 0;
                answer.fieldId = field.id;

                newItem.answers.push(answer);
            }

            moduleRecord.lines.push(newItem);
        }

        //Add Header Items
        for(var i in moduleItem.modelHeader)
        {
            var field = moduleItem.modelHeader[i];
            var answer = {};
            answer.score = field.score;
            answer.defaultValue = field.defaultValue;
            answer.optionId = 0;
            answer.behaviour = 0;
            answer.id = 0;
            answer.decisionId = 0;
            if(typeof field.value != 'undefined') answer.value = field.value;
            answer.order = field.order;
            answer.fieldId = field.id;

            moduleRecord.headerAnswers.push(answer);
        }

        //Add Footer Items
        for(var i in moduleItem.modelFooter)
        {
            var field = moduleItem.modelFooter[i];
            var answer = {};
            answer.score = field.score;
            answer.defaultValue = field.defaultValue;
            answer.optionId = 0;
            answer.behaviour = 0;
            answer.id = 0;
            answer.decisionId = 0;
            if(typeof field.value != 'undefined') answer.value = field.value;
            answer.order = field.order;
            answer.fieldId = field.id;

            moduleRecord.footerAnswers.push(answer);
        }

        uploadObject.moduleRecords.push(moduleRecord);

        var visit = {};
        visit.actualScore = 0;
        visit.uploaded = timeStamp;
        visit.lastExit = timeStamp;
        visit.visitTimeTakenAsSec = 17;
        visit.entityId = entityId;
        visit.firstEntry = timeStamp;
        visit.maxScore = 0;
        visit.userId = userId;
        visit.downloaded = timeStamp;

        uploadObject.visit = visit;

        _log.d(JSON.stringify(uploadObject));

        return uploadObject;
    }
};
;;;
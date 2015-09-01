String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

_moduleContainer = {

    model: [],
    surveys: {},
    models: {},
    sectionNames: {},
    xmls: {},


    onExit: function (view, state) {

        // Strangely on exit is being called when the camera is opened...
        _log.d("SURVEY SECTION: ON EXIT")

        if (state == "fg") {

            _log.d("SURVEY SECTION: ON EXIT, foreground event, do cleanup")

            _moduleContainer.model = [];
            _moduleContainer.surveys = {};
            _moduleContainer.models = {};
            _moduleContainer.sectionNames = {};
            _moduleContainer.xmls = {};

        }
        else if (state == "bg") {

            setTimeout(function () {

                _log.d("ADDITIONALS, testing photo save");

                layout.sendMessage('surveySectionList', {recalculate: true});

            }, 200);

        }


    },


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
    onLoaded: function (view, card) {

        this._currCard = card;
    },


    onMessage: function (data) {

        _moduleContainer.currSID = sectionID = data.id;

        var xml;


        if (typeof _moduleContainer.surveys[sectionID] == 'undefined') {
            _log.d("FIELDS DO NOT EXIST --> CREATING");
            _moduleContainer.surveys[sectionID] = data;

            var sections = _moduleBuilder.process([data], 'questions', 'surveySectionFront');

            // Check if this has been loaded before first
            if (!_moduleContainer.models.hasOwnProperty(sectionID)) {
                _moduleContainer.models[sectionID] = sections[0].model;
            } else {


                // See if this sorts out the binding issue.

                for (var v in sections[0].model) {
                    //_moduleContainer.models[sectionID][v] = sections[0].model[v]
                    sections[0].model[v] = _moduleContainer.models[sectionID][v];
                }


                _moduleContainer.models[sectionID] = sections[0].model;


            }

            _moduleContainer.model = data.headerFields//_moduleContainer.models[sectionID];// = sections[0].model;
            _moduleBuilder.currentForms[0].model = _moduleContainer.model;
            //    _moduleContainer.referenceFix(_moduleContainer.model);
            _moduleContainer.sectionName = _moduleContainer.sectionNames[sectionID] = data.name;
            xml = _moduleContainer.xmls[sectionID] = _cardEngine.processTagsFromXML(sections[0].data, 'surveySectionFront');


        }
        else {
            _log.d("FIELDS EXIST --> LOADING");
            _moduleContainer.model = data.headerFields;
            _moduleBuilder.currentForms[0].model = _moduleContainer.model;
            //  _moduleContainer.referenceFix(_moduleContainer.model);
            _moduleContainer.sectionName = _moduleContainer.sectionNames[sectionID];
            xml = _moduleContainer.xmls[sectionID];
        }


        var target = $('#moduleContainerFront__FACE').find('.sectionQuestions');
        target.html(xml);


        layout.attach('#moduleContainerFront', true);

        //TODO --> MOVE TO CORE HANDLER (ITS DIRTY);
        this._currCard.initScroll($('#moduleContainer'), 'front');


    },


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


    //ANGULARJS CONTROLLERS


    surveySectionCtrl: function ($scope) {


        $scope.questions = _moduleContainer.model;

        //TODO: wondering if there is some kind of threading context issue happening here where _moduleContainer.model no longer exists
        _log.d("FIELDS MODEL FOR BUILDER : " + JSON.stringify(_moduleBuilder.currentForms[0].model));
        _log.d("FIELDS MODEL IS : " + JSON.stringify($scope.questions));


        $scope.selectChange = function (nam) {

            _log.d('select changed : ' + nam);

            //TODO: since we aren't really showing the survey section totals we probably don't need to send this
            // message every time anymore. So we can save some cycles.

           // layout.sendMessage('surveySectionList', {recalculate: true});
            _moduleContainer._currCard.currScroll.refresh();


        };

        $scope.inputChange = function (nam) {

            _log.d("ADDITIONALS, testing comment save");
            _log.d('input changed : ' + nam);

            //TODO: since we aren't really showing the survey section totals we probably don't need to send this
            // message every time anymore. So we can save some cycles.

            //  layout.sendMessage('surveySectionList', { recalculate: true });
            //_moduleContainer._currCard.currScroll.refresh();


        };

        $scope.sizeChange = function () {

            //alert("SizeChange, lets do stuff here");

            setTimeout(function () {

                _moduleContainer._currCard.currScroll.refresh();

            }, 100);

        };

        $scope.survey = _moduleContainer.survey;

    },

    signature : function(text){

        var modal = atajo.modal;
    console.log("incoming text:"+text);
        //alert("after ok 2");
        modal.signature(
            {
                icon 	: 'fa-pencil-square-o',  	// icon which will appear top left  - default : fa-warning
                title 	: 'SIGNATURE',     	// title which will appear top right - default : notice

                canCancel : 'true', 		       // show cancel button - default: false
                onOk      : function(data) {
                    console.log("returned data from modal"+data);
                    var dt=data;
                    console.log("after ok");


                    if(!data)
                    {
                        console.log("no data image");

                        return;

                    }






                }, // callback with signature data

                content   : text              // content of the modal below the signature pad



            });
    },
    scan:function(){
        _scanner.scan(function(data){
            console.log("scanned:"+data);
        })
    }



    /*
     addPic : function(imageData) {

     _log.d("_moduleContainer.model ADDPIC : " + JSON.stringify(_moduleContainer.model));

     }
     */


};
;
;
;
;
;;
/**
 * Created by ntuthuko.hlela on 2015/03/02.
 */

_repair = {

    model: [],
    codes: [],
    image: false,

    onExit: function (view, state) {
        if(state == 'fg') {
            //_repair.model = [];
            _repair.codes = [];
            _repair.image = false;
        }
    },


    onLoaded: function () {

    },


    onMessage: function (data) {

        _log.d(JSON.stringify(data));
        _repair.model = data;

        var parentMapping = _repair.damageTypeParentMappings[_repair.model.EquipmentType__c];
        _log.d("Getting breakdown codes for damage type parent mapping: " + parentMapping);

        _model.get("breakdownCodes", { "Parent_Code__c" : parentMapping }, function (codes) {

            _log.d("loaded breakdown codes:" + JSON.stringify(codes));

            _repair.codes = codes;
            layout.attach('#repairFront');

            _repair.formScroller = _scroll.add($('#repair-details-scroll')[0]);


        });

    },


    Ctrl: function ($scope) {

        $scope.record = _repair.model;
        $scope.codes = _repair.codes;
        $scope.currImg = _repair.image;

        $scope.addPic = function () {

            _camera.getPic(function (imageData) {
                _repair.image =imageData;
                layout.attach('#repairFront');
            }, 320, 480);
        },

        $scope.delPic = function() {
            var xml = "<p>Discard the current image?</p>";
            _modal.show('warning', 'DISCARD CAPTURED IMAGE', xml, true, function () {
                _repair.image = false;
                layout.attach('#repairFront');
                _modal.hide();
            }, function () {
                _modal.hide();
            }, false);

        },

        $scope.repairSave = function () {

            _log.d("$scope.repairSave");
            _log.d("For equipment: " + _repair.model.EquipmentId__c)

            if ($scope.codeBreakdown == undefined || $scope.codeBreakdown == '') {
                _modal.show("warning", "Repair", "Please select a breakdown code. ", true, function () {
                    //do something when ok is pressed

                    _modal.hide();

                })
            } else if ($scope.subject==undefined||$scope.subject=='') {
                _modal.show("warning", "Repair", "Please enter a subject.. ", true, function () {
                    //do something when ok is pressed
                    _modal.hide();
                })

            } else {

                var asset = {

                    EquipmentNumber : 1,
                    CustomerId : _repair.model.customerId,
                    EquipmentId : _repair.model.EquipmentId__c,
                    BreakdownCode : $scope.codeBreakdown.Code__c,
                    Priority : 'Low',
                    SubjectLine : $scope.subject,
                    BreakdownDatetime : moment().format("YYYY-MM-DDTHH:mm:ssZ")

                }

                _log.d("Sending asset repair task: " + JSON.stringify(asset));

                var assetList = {'lst_EquipmentType': [asset]};

                var imageJob = {
                    CustomerId : _repair.model.customerId,
                    EquipmentId : _repair.model.EquipmentId__c,
                    imageData: _repair.image,
                    listType: 'lst_EquipmentType',
                    imageUriField: 'SFDC_ImageId',
                    data: assetList
                }


                var jobName = "Equipment Repair";
                var jobDesc = _customer.model.Name;
                var jobData = {action: 'submitEquipmentRepair', data: imageJob};


                _log.d("Adding job: " + JSON.stringify(jobData));

                //jobQueue.addJob(jobName, jobDesc, jobData, false, false, false);
                jobQueue.add({

                    jobName : jobName,
                    jobDesc : jobDesc,
                    data : jobData,
                    allowDuplicate : false,
                    clearOnDone : false,
                    lockUI : false

                });

                //This should propagate all the way back to the previous model
              //  alert(_repair.model.EquipmentStatus__c);

                if(_repair.model.EquipmentStatus__c == "Verified")
                {
                  _repair.model.EquipmentStatus__c = "Verified, Broken";
                }
                else
                {
                  _repair.model.EquipmentStatus__c = "Broken";
                }

                _model.get ("equipment", _repair.model.customerId, function (equipments) {

                    for(var e = 0; e < equipments.Equipment__r.records.length; e++) {
                        console.log("Equipment :" + equipments.Equipment__r.records[e]);
                        if(equipments.Equipment__r.records[e].EquipmentId__c == _repair.model.EquipmentId__c){

                            _log.d("Found match");

                            equipments.Equipment__r.records[e].EquipmentStatus__c = _repair.model.EquipmentStatus__c;

                            _model.set('equipment', equipments, function (equipments) {

                                _log.d("Equipment status saved");

                            });

                        }

                    }

                });

                layout.goBack();
                layout.attach('#equipmentFront', true);

            }

        }

    },


    formOpen: true,
    toggleForm: function() { var _ = _repair;


      L1 = _.formOpen ? -420 : 0;
      _.formOpen = _.formOpen ? false : true;
      btnChar = _.formOpen ? '&#xf00d;' : '&#xf03a;';
      $('#repair-details-simple-view').animate({
        left: L1,
        duration: 300
      });
      $('#btnFormToggle').find('.gui-extra').html(btnChar);
    },


    damageTypeParentMappings : {

        "COOLER"   : "TSCLRDMG",
        "VENDING"  : "TSVENDMG",
        "FOUNTAIN" : "TSFTNDMG",

        /*
         From Stephen Moore - 2013-09-04

         Hi Paul

         We only picked this ourselves recently

         Please treat the following equipment types as ‘COOLER’

         ·         COOLER_IMP

         ·         COOLER CO

         ·         COOLER BI


         Regards

         Stephen
         */
        "COOLER_IMP" 	: "TSCLRDMG",
        "COOLER CO" 	: "TSCLRDMG",
        "COOLER BI" 	: "TSCLRDMG",

    }

};

;;

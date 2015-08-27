_equipment = {

    model: null,
    tagShow: true,
    serial: false,
    barcode: false,
    record: '',
    coolerNumber: '',
    coolerType: '',
    customerId: '',
    msg: '',
    coolerTypes: [{"value": "Equipment Serial Number", "dbName": "EquipmentSerialNumber__c", "name": "Tag No"},
        {"value": "Manufacturer Serial Number", "dbName": "ManufacturerSerialNumber__c", "name": "Manif. Serial No"},
        {"value": "Technical Identification", "dbName": "TechnicalIdentification__c", "name": "Barcode"}],
    scanCoolerType: '',
    equipmentSearch : '',
    equipmentTypes : [
        { value : "Equipment Serial Number", name : "Tag Number" },
        { value : "Manufacturer Serial Number", name : "Manufacturer Serial Number" },
        { value : "Technical Identification", name: "Barcode" }
    ],
    equipmentTypeSelected : null,

    onExit: function () {
        var _ = this;
    },


    onLoaded: function () {

    },


    repairShow: function () {

        var record = _equipment.record;
        record.customerId = _equipment.customerId;
        layout.sendMessage('repair', record);

    },


    onMessage: function (msg) {

        _equipment.msg = msg;
        _equipment.customerId = msg.CustomerId__c;
        _model.getKey("equipment", msg.CustomerId__c, function (equipment) {

            _log.d("GOT EQUIPMENT : " + JSON.stringify(equipment));
            _model.getAll("equipmentVerificationFrequency", function(equipmentVerificationFrequency) {
                _log.d("GOT EQUIPMENT VERIFICATION FREQUENCY: " + JSON.stringify(equipmentVerificationFrequency));
                if (equipmentVerificationFrequency[0].Frequency__c) {
                    _equipment.processEquipment(equipment, equipmentVerificationFrequency[0].Frequency__c);
                } else {
                    _equipment.processEquipment(equipment, "4");
                }
            });

        });

    },


    scan: function () {

        _log.d('LOADING SCANNER');

        _scanner.scan(function (data) {

            if (data.cancelled === 0 && data.text !== "") {
                _log.d("scanned successful :");
                //try and check for a match in the current list
                //Automatically check and mark
                var check = _equipment.automaticTypeCheck(data);
                if (check != "No Match found") {
                    _equipment.scanCoolerType = check;
                    data.searchType = _equipment.scanCoolerType;
                    var asset = _equipment.equipmentExists(data);
                    if (asset) {
                        _equipment.scannedInput = true;
                        _equipment.record = asset;
                        _cardEngine.flip("equipment", "assetView", function(release) {

                          layout.attach('#assetView');
                          setTimeout(function() { release(); }, 500);

                        });
                    } else {
                    //TYPE MODAL
                    xml = "<div id='modalScroll' style='height:250px; width: 60%; margin-left: 20%; margin-right: 20%;'>" +
                          "<p id='coolerTypeDescription'>"+data.text+" detected as a "+check+".  Please confirm the type below and tap OK to submit.</p><ul class='coolerNumberType'>";

                        for (var i in _equipment.coolerTypes) {
                            if (_equipment.coolerTypes[i].value == check) {
                                xml += "<li><table style='border-bottom: 1px solid rgba(0,0,0,0.2); padding: 10px;'><tr style='color:#000; font-size:16pt;' onclick=\"_equipment.changeReason(\'" + _equipment.coolerTypes[i].value + "\', this);\"><td width='80%' class='reason'>" + _equipment.coolerTypes[i].name + "</td><td class='gui-extra reasonGui' width='20%' align='right'>&#xf00c;</td></tr></table></li>";
                            } else {
                                xml += "<li><table style='border-bottom: 1px solid rgba(0,0,0,0.2); padding: 10px;'><tr style='color:#000;font-size:16pt;' onclick=\"_equipment.changeReason(\'" + _equipment.coolerTypes[i].value + "\', this);\"><td width='80%' class='reason'>" + _equipment.coolerTypes[i].name + "</td><td class='gui-extra reasonGui' width='20%' align='right'>&#xf00d;</td></tr></table></li>";
                            }
                        }

                    xml += "</ul></div>";

                    _modal.show('warning', 'COOLER NUMBER TYPE', xml, true, function () {
                        if (_equipment.scanCoolerType !== "") {
                            _modal.hide();
                            data.searchType = _equipment.scanCoolerType;
                            var asset = _equipment.equipmentExists(data);
                            if (asset) {
                                _equipment.scannedInput = true;
                                _equipment.record = asset;
                                _cardEngine.flip("equipment", "assetView", function(release) {

                                  layout.attach('#assetView');
                                  setTimeout(function() { release(); }, 500);

                                });
                            } else {
                                _equipment.coolerType = _equipment.scanCoolerType;
                                _equipment.coolerNumber = data.text;
                                _cardEngine.flip("equipment", "addAsset", function(release) {

                                  layout.attach('#addAsset');
                                  setTimeout(function() { release(); }, 500);

                                });
                            }
                        } else {
                            $('p#coolerTypeDescription').css({color: '#aa2222'}).animate({
                                color: "#000000"
                            }, 1500);
                        }

                    }, function () {
                        _log.d("ERROR");
                        _routes.scanCoolerType = "";
                        _modal.hide();
                    }, false);
                }
                } else {
                         //TYPE MODAL
                    xml = "<div id='modalScroll' style='height:250px; width: 60%; margin-left: 20%; margin-right: 20%;'>" +
                          "<p id='coolerTypeDescription'>Type detection unsuccessful for "+data.text+".  Please select a type below and tap OK to submit.</p><ul class='coolerNumberType'>";

                    for (var i in _equipment.coolerTypes) {
                        xml += "<li><table style='border-bottom: 1px solid rgba(0,0,0,0.2); padding: 5px;'><tr style='color:#000;' onclick=\"_equipment.changeReason(\'" + _equipment.coolerTypes[i].value + "\', this);\"><td width='80%' class='reason'>" + _equipment.coolerTypes[i].name + "</td><td class='gui-extra reasonGui' width='20%' align='right'>&#xf00d;</td></tr></table></li>";
                    }
                    xml += "</ul></div>";

                    _modal.show('warning', 'COOLER NUMBER TYPE', xml, true, function () {


                        if (_equipment.scanCoolerType !== "") {
                            _modal.hide();
                            data.searchType = _equipment.scanCoolerType;
                            var asset = _equipment.equipmentExists(data);
                            if (asset) {
                                _equipment.scannedInput = true;
                                _equipment.record = asset;
                                _cardEngine.flip("equipment", "assetView", function(release) {

                                  layout.attach('#assetView');
                                  setTimeout(function() { release(); }, 500);

                                });
                                layout.attach('#assetView');
                            } else {
                                _equipment.coolerType = _equipment.scanCoolerType;
                                _equipment.coolerNumber = data.text;
                                _cardEngine.flip("equipment", "addAsset", function(release) {

                                  layout.attach('#addAsset');
                                  setTimeout(function() { release(); }, 500);

                                });
                            }
                        } else {
                            $('p#coolerTypeDescription').css({color: '#aa2222'}).animate({
                                color: "#000000"
                            }, 1500);
                        }

                    }, function () {
                        _log.d("ERROR");
                        _routes.scanCoolerType = "";
                        _modal.hide();
                    }, false);
                }


            } else if (data.cancelled == 1) {
                //do something user cancelled the scanning

            } else {
                _modal.show("warning", "Scanner", "Scanning failed. ", true, function () {
                    //do something when ok is pressed
                    _modal.hide();

                });
            }

        });


    },

    addCooler: function (verificationMethod, dataObject) {

      //  _cardEngine.flip("equipment", "equipmentFront", function(release) {

      _cardEngine.flip("equipment", "equipmentFront");


        var lbl;
        switch (verificationMethod) {

            case "SCAN" :
                lbl = "Verified Cooler";
                break;
            case "MISS" :
                lbl = "Missing Cooler";
                break;
            case "ADDN" :
                lbl = "Adding Cooler";
                break;
            default     :
                lbl = "Add Cooler";


        }
        _log.d("preparing data"+ JSON.stringify(dataObject));
        var curr = {'lst_CoolerVerify': [dataObject]};

        _log.d("after object");
        jobName = lbl;
        jobDesc = _customer.model.Name + " : " + dataObject.CoolerNumber;
        jobData = {action: 'submitCooler', data: curr};
        _log.d("job data : " + JSON.stringify(dataObject) + lbl);

        jobQueue.addJob(jobName, jobDesc, jobData, true, false, false);

        _log.d("APEXOBJECTFACTORY ADDING TO QUEUE :  ");

        layout.attach('#equipmentFront');
      //  setTimeout(function() { release(); }, 500);



      //  });


    },

    Ctrl: function ($scope) {

        _log.d("In controller");

        _equipment.scannedInput = false;

        $scope.customerName = _customer.model.Name;
        $scope.searchTypeList = _equipment.coolerTypes;
        $scope.searchType = $scope.searchTypeList[0];
        $scope.tagShow = _equipment.tagShow;
        $scope.serial = _equipment.serial;
        $scope.barcode = _equipment.barcode;

        $scope.equipmentSearch = _equipment.equipmentSearch;

        $scope.equipmentTypes = _equipment.equipmentTypes;
        $scope.equipmentTypeSelected = _equipment.equipmentTypeSelected;

        $scope.changeType = function () {
            _log.d("Changing");
            if ($scope.searchType.value == "Equipment Serial Number") {
                $scope.tagShow = true;
                $scope.serial = false;
                $scope.barcode = false;
                _equipment.tagShow = true;
                _equipment.serial = false;
                _equipment.barcod = false;
            } else if ($scope.searchType.value == "Manufacturer Serial Number") {
                $scope.tagShow = false;
                $scope.serial = true;
                $scope.barcode = false;
                _equipment.tagShow = false;
                _equipment.serial = true;
                _equipment.barcod = false;
            } else if ($scope.searchType.value == "Technical Identification") {
                $scope.tagShow = false;
                $scope.serial = false;
                $scope.barcode = true;
                _equipment.tagShow = false;
                _equipment.serial = false;
                _equipment.barcod = true;
            }
        };


        $scope.equipmentSelec = function (record) {

            if (record.EquipmentStatus__c == 'ADDN') {
                _log.d("DO NOTHING");
            }
            else if(record.EquipmentStatus__c != 'INST') {


                /* _modal.show("warning", "ALREADY VERIFIED", "This asset has already been processed", false, function () {
                 //do something when ok is pressed
                 _modal.hide();

                 });*/
                _equipment.scannedInput = false;
                _log.d("selected ....");
                _equipment.record = record;
                _cardEngine.flip("equipment", "assetView", function(release) {

                  layout.attach('#assetView');
                  setTimeout(function() { release(); }, 500);

                });

            } else {

                _equipment.scannedInput = false;
                _log.d("selected ....");
                _equipment.record = record;
                _cardEngine.flip("equipment", "assetView", function(release) {

                  layout.attach('#assetView');
                  setTimeout(function() { release(); }, 500);
                });

            }

        };

        $scope.equipmentR = _equipment.model;

        $scope.scan = function () {


        };

        $scope.find = function (create) {
            _equipment.equipmentSearch = $scope.equipmentSearch;

            var searchVal = _equipment.equipmentSearch;

            _log.d("searchVal: " + searchVal);

            if(create && (!searchVal || searchVal === '')) {

                _modal.show("warning", "NOTHING TO ADD", "Please select the tag type you want to add and enter its number in the search box above before adding it", false, function () {
                    //do something when ok is pressed
                    _modal.hide();

                });

                return;

            }

            var asset = _equipment.equipmentExists( { text : searchVal, searchType : $scope.equipmentTypeSelected.value } );

            if (asset) {

                 _equipment.scannedInput = true;
                 _equipment.record = asset;
                 _cardEngine.flip("equipment", "assetView", function(release) {

                   layout.attach('#assetView');
                   setTimeout(function() { release(); }, 500);

                 });


            } else {

                if (create) {

                    _equipment.coolerType = $scope.equipmentTypeSelected.value;
                    _equipment.coolerNumber = searchVal;
                    _cardEngine.flip("equipment", "addAsset", function(release) {

                      layout.attach('#addAsset');
                      setTimeout(function() { release(); }, 500);


                    });

                }

            }

        };

    },


    equipmentExists: function (data) {

        _log.d("_equipment.equipmentExists");

        var searchType = data.searchType;

        _log.d("searchType: " + searchType);
        _log.d("text: " + data.text);

        for (var k = 0; k < _equipment.model.length; k++) {

            _log.d("searching in outer rec:");

            if (_equipment.model[k].Equipment__r !== null) {

                _log.d("searching equipment not null");

                for (var i = 0; i < _equipment.model[k].Equipment__r.records.length; i++) {

                    var currSearchValue = '';

                    if (searchType == "Equipment Serial Number") {

                        _log.d("Found equipment serial number, aka Tag Number?");
                        currSearchValue = _equipment.model[k].Equipment__r.records[i].EquipmentSerialNumber__c;

                    } else if (searchType == "Manufacturer Serial Number") {

                        _log.d("Found manufacturer serials number");
                        currSearchValue = _equipment.model[k].Equipment__r.records[i].ManufacturerSerialNumber__c;

                    } else {

                        _log.d("Found technical identification");
                        currSearchValue = _equipment.model[k].Equipment__r.records[i].TechnicalIdentification__c;

                    }

                    _log.d("Testing against: " + currSearchValue);

                    if (currSearchValue == data.text) {

                        _log.d("match found" + JSON.stringify(_equipment.model[k].Equipment__r.records[i]));
                        return _equipment.model[k].Equipment__r.records[i];

                    }

                }

            }

        }

        _log.d(_equipment.model.length + "NO MATCH FOUND:" + k);
        return false;

    },

    assetViewCtrl: function ($scope) {
        $scope.record = _equipment.record;
        $scope.scannedInput = _equipment.scannedInput;


        //$scope.repairShow = function () {
        //    alert("changing page");
        //    _modal.signatureTitle("<td align='center'><h2 style='color: #000;'>Hello world</h2></td>", function (signatureData) {
        //        _modal.hide();
        //    })
        //}


        $scope.CoolerStatus = function (method) {
            if(method=='MISS') {
                _modal.show('warning', "COOLER VERIFICATION",
                    "Please confirm that you would like to flag the cooler as missing?",
                    true,
                    function () {
                        _modal.hide();
                        _log.d("in missing");
                        var curr = {};

                        var status="Missing";
                        if(method=="SCAN"){
                            status="Verified";
                        }
                        var coolerNumber='';
                        var coolerType='';

                        if (_equipment.record.TechnicalIdentification__c !== null || _equipment.record.TechnicalIdentification__c !== undefined)
                        {
                            coolerNumber=_equipment.record.TechnicalIdentification__c;
                            coolerType=_equipment.coolerTypes[2].value;

                        }else if (_equipment.record.EquipmentSerialNumber__c !== null ||_equipment.record.EquipmentSerialNumber__c !== undefined) {
                            coolerNumber=_equipment.record.EquipmentSerialNumber__c;
                            coolerType=_equipment.coolerTypes[0].value;
                        } else if (_equipment.record.ManufacturerSerialNumber__c !== null || _equipment.record.ManufacturerSerialNumber__c !== undefined) {
                            coolerNumber=_equipment.record.ManufacturerSerialNumber__c;
                            coolerType=_equipment.coolerTypes[1].value;
                        }
                        // else

                        _model.getKey("equipment",_equipment.customerId, function (equipment) {
                            var equipments=equipment;



                            _log.d("searching equip: "+equipments);
                            for(var j=0;j< equipments.Equipment__r.records.length;j++) {
                                _log.d(equipments.Equipment__r.records[j].EquipmentId__c);
                                if(equipments.Equipment__r.records[j].EquipmentId__c==_equipment.record.EquipmentId__c){

                                    _log.d("Found match");
                                    equipments.Equipment__r.records[j].EquipmentStatus__c=status;
                                    var arr = [equipments];
                                    _log.d("array to be inserted ---:" + JSON.stringify(equipments));
                                    _model.set('equipment', equipments, function (data) {
                                        _equipment.model=[equipments];


                                        //  _log.d("insert :"+JSON.stringify(data));

                                        curr.NotificationNumber = 2;
                                        curr.CustomerId = _equipment.customerId;
                                        curr.VerificationMethod = method;
                                        curr.EquipmentId = _equipment.record.EquipmentId__c;
                                        curr.CoolerNumberType = coolerType;
                                        curr.CoolerNumber = coolerNumber;
                                        _equipment.addCooler(method, curr);

                                    });

                                }

                            }


                        });
                    },
                    function () {
                        _modal.hide();
                    }
                );
            } else {
                _log.d("in missing");
                var curr = {};

                var status="Missing";
                if(method=="SCAN"){
                    status="Verified";
                }
                var coolerNumber='';
                var coolerType='';

                if (_equipment.record.TechnicalIdentification__c !== null || _equipment.record.TechnicalIdentification__c !== undefined)
                {
                    coolerNumber=_equipment.record.TechnicalIdentification__c;
                    coolerType=_equipment.coolerTypes[2].value;

                }else if (_equipment.record.EquipmentSerialNumber__c !== null ||_equipment.record.EquipmentSerialNumber__c !== undefined) {
                    coolerNumber=_equipment.record.EquipmentSerialNumber__c;
                    coolerType=_equipment.coolerTypes[0].value;
                } else if (_equipment.record.ManufacturerSerialNumber__c !== null ||_equipment.record.ManufacturerSerialNumber__c !== undefined) {
                    coolerNumber=_equipment.record.ManufacturerSerialNumber__c;
                    coolerType=_equipment.coolerTypes[1].value;
                }
                // else

                _model.getKey("equipment",_equipment.customerId, function (equipment) {
                    var equipments=equipment;



                    _log.d("searching equip: "+equipments);
                    for(var j=0;j< equipments.Equipment__r.records.length;j++) {
                        _log.d(equipments.Equipment__r.records[j].EquipmentId__c);
                        if(equipments.Equipment__r.records[j].EquipmentId__c==_equipment.record.EquipmentId__c){

                            _log.d("Found match");
                            equipments.Equipment__r.records[j].EquipmentStatus__c=status;
                            if(status == "Verified") {
                                equipments.Equipment__r.records[j].Verification_Status__c = status;
                            }
                            var arr = [equipments];
                            _log.d("array to be inserted ---:" + JSON.stringify(equipments));
                            _model.set('equipment', equipments, function (data) {
                                _equipment.model=[equipments];


                                //  _log.d("insert :"+JSON.stringify(data));

                                curr.NotificationNumber = 2;
                                curr.CustomerId = _equipment.customerId;
                                curr.VerificationMethod = method;
                                curr.EquipmentId = _equipment.record.EquipmentId__c;
                                curr.CoolerNumberType = coolerType;
                                curr.CoolerNumber = coolerNumber;
                                _equipment.addCooler(method, curr);

                            });

                        }

                    }


                });

            }
        };
    },

    addCtrl: function ($scope) {
        _log.d("adding cooler");
        $scope.coolerType = _equipment.coolerType;
        $scope.coolerNumber = _equipment.coolerNumber;

        _log.d("COOLER.ADDCTRL : "+_equipment.coolerType+" // "+_equipment.coolerNumber);

        $scope.addCooler = function () {

            _equipment.validateAssetCode(_equipment.coolerNumber, _equipment.coolerType, function (returnData) {

                _log.d("Bar code is :" + returnData);

                _model.getKey("equipment", _equipment.customerId, function (equipment) {

                    if (equipment.Equipment__r === null) {

                        equipment.Equipment__r = { records: [] };

                    }

                    _log.d("GOT EQUIPMENT : " + JSON.stringify(equipment.Equipment__r.records));

                    var currRecord = [];
                    currRecord = equipment.Equipment__r.records;

                    var coolerObj  = null;
                    if (_equipment.coolerType == _equipment.coolerTypes[0].value) {
                        coolerObj = {"EquipmentSerialNumber__c": _equipment.coolerNumber, EquipmentStatus__c : "Added, Verified"};

                        currRecord.push(coolerObj);

                        _log.d("object to be inserted :" + JSON.stringify(coolerObj));
                        equipment.Equipment__r.records = currRecord;

                    } else if (_equipment.coolerType == _equipment.coolerTypes[1].value) {

                        coolerObj = {"ManufacturerSerialNumber__c": _equipment.coolerNumber, EquipmentStatus__c : "Added, Verified"};
                        currRecord.push(coolerObj);
                        equipment.Equipment__r.records = currRecord;
                    }
                    else {
                        coolerObj = {"TechnicalIdentification__c": _equipment.coolerNumber, EquipmentStatus__c : "Added, Verified"};
                        currRecord.push(coolerObj);
                        equipment.Equipment__r.records = currRecord;
                    }

                    var arr = [equipment];
                    _log.d("array to be inserted   :" + JSON.stringify(arr));

                    _model.batch('equipment', arr, function () {

                        _equipment.model=arr;

                        if (returnData === true) {

                            _log.d("adding cooler");

                            var curr = {};
                            curr.NotificationNumber = 1;
                            curr.CustomerId = _equipment.customerId;
                            curr.VerificationMethod = "ADDN";
                            curr.CoolerNumberType = _equipment.coolerType;
                            curr.CoolerNumber = _equipment.coolerNumber;
                            _log.d("JSON Obj:" + JSON.stringify(curr));
                            _equipment.addCooler("ADDN", curr);

                        } else {

                            _modal.show("warning", "Asset", returnData, true, function () {
                                //do something when ok is pressed
                                _modal.hide();
                            });

                        }

                        _log.d("updated the records Tag  " + JSON.stringify(equipment.Equipment__r.records));
                        //  layout.sendMessage('equipment', equipment.msg);

                    });

                });

            });

        };

    },


    validateAssetCode: function (barcode, type, callBack) {

        _log.d("EQUIPMENT.validateAssetCode : "+type+" // "+barcode);

        // Check for lengths:
        // Taken from spreadsheet FieldMapping1 07-08-2013 -> Equipment page.
        var maxlengths = [];
        maxlengths['Equipment Serial Number'] = {_max: 18, label: 'Tag Number'};
        maxlengths['Manufacturer Serial Number'] = {_max: 30, label: 'Manufacturer Serial Number'};
        maxlengths['Technical Identification'] = {_max: 25, label: 'Barcode'};

        if (typeof maxlengths[type] == 'undefined') {

            callBack("Invalid Equipment Number Type.");

        }

        if (typeof barcode == 'undefined' || barcode.length <= 1) return "Invalid " + maxlengths[type].label;

        var maxlength = maxlengths[type]._max;

        _log.d("Max Length: " + maxlength);

        if (barcode.length > maxlength) {

            callBack(maxlengths[type].label + " may not be longer than " + maxlengths[type]._max + " characters.");

        }

        // Check for invalid characters
        var invalid_chars = false;
        switch (type) {

            case 'Equipment Serial Number' :
                if (barcode.match(/[^a-zA-Z0-9]/)) invalid_chars = true;
                break;
            case 'Manufacturer Serial Number' :
                if (barcode.match(/[^a-zA-Z0-9]/)) invalid_chars = true;
                break;
            case 'Technical Identification' :
                if (barcode.match(/[^a-zA-Z0-9]/)) invalid_chars = true;
                break;

        }

        if (invalid_chars) callBack("Invalid character(s) found for " + maxlengths[type].label);

        // No errors found.
        callBack(true);

    },
    changeReason : function (reason, elm) {
        _equipment.scanCoolerType =  reason;
        $("td.reasonGui").html("&#xf00d;");
        $(elm).children("td.gui-extra").html("&#xf00c;");
    },
    ToggleKeyboardGracefully : function () {
        formToggleTimer = setTimeout(function () {

            window.scrollTo(0,350);

        }, 300);
    },
    automaticTypeCheck : function(data) {
        var test = data.text;
        if (test.length == 6) {
            return "Technical Identification";
        } else if (test.length == 5) {
            return "Equipment Serial Number";
        } else if ((test.length == 11) || (test.length == 10)) {
            return "Manufacturer Serial Number";
        } else {
            return "No Match found";
        }
    },
    find : function (create) {
        _equipment._Ctrl(function () {
            var searchVal = _equipment.equipmentSearch;

            _log.d("searchVal: " + searchVal);

            if(create && (!searchVal || searchVal === '')) {

                _modal.show("warning", "NOTHING TO ADD", "Please select the tag type you want to add and enter its number in the search box above before adding it", false, function () {
                    //do something when ok is pressed
                    _modal.hide();

                });

                return;

            }

            var asset = _equipment.equipmentExists( { text : searchVal, searchType : _equipment.equipmentTypeSelected.value } );

            if (asset) {

                _equipment.scannedInput = true;
                _equipment.record = asset;
                _cardEngine.flip("equipment", "assetView", function(release) {

                    layout.attach('#assetView');
                    setTimeout(function() { release(); }, 500);

                });


            } else {

                if (create) {

                    _equipment.coolerType = _equipment.equipmentTypeSelected.value;
                    _equipment.coolerNumber = searchVal;
                    _cardEngine.flip("equipment", "addAsset", function(release) {

                        layout.attach('#addAsset');
                        setTimeout(function() { release(); }, 500);


                    });

                }

            }
        });

    },
    _Ctrl : function (cb) {
        var e = document.getElementById('equipmentFront__FACE');
        var scope = angular.element(e).scope();

        scope.$apply(function () {
            _equipment.equipmentSearch = scope.equipmentSearch;
            cb();
        });
    },
    setType : function () {
        var e = document.getElementById('equipmentFront__FACE');
        var scope = angular.element(e).scope();
        setTimeout(function () {
            _equipment.equipmentTypeSelected = scope.equipmentTypeSelected;
            _log.d("CHANGE THE FUCKER! : " + scope.equipmentTypeSelected.name + " | " + _equipment.equipmentTypeSelected.name);
            _equipment.find(false);
        }, 1000);

    },
    resetSearch : function () {
        var e = document.getElementById('equipmentFront__FACE');
        var scope = angular.element(e).scope();
        _equipment.equipmentSearch = "";
        scope.$apply(function () {
             scope.equipmentSearch = _equipment.equipmentSearch;
        });
    },
    processEquipment : function (equipment, Frequency__c) {
        for (var a in equipment.Equipment__r.records) {
            if (equipment.Equipment__r.records[a].Last_Verified_Date__c){ // Asset has been verified before
                var now = moment();
                var last_verified = moment(equipment.Equipment__r.records[a].Last_Verified_Date__c);
                var difference = now.diff(last_verified, 'weeks');
                _log.d("-- Asset found: Last verified: " + equipment.Equipment__r.records[a].Last_Verified_Date__c + " Difference: " + difference);
                if (difference >= Frequency__c){
                    equipment.Equipment__r.records[a].showMandatory = true;
                } else {
                    equipment.Equipment__r.records[a].showMandatory = false;
                }
            } else {
                equipment.Equipment__r.records[a].showMandatory = true;
            }
        }
        _equipment.model = [equipment];
        _equipment.equipmentSearch = '';
        _equipment.equipmentTypeSelected = _equipment.equipmentTypes[0];
        layout.attach('#equipmentFront', true);
    }

};
;;

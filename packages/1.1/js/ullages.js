_ullages = {

    ullageCodes: null,
    products: null,
    you_may_continue: false,
    currRecord: [],
    CustomerId__c: "",
    customerModel: null,
    Purchase_Order_No_Required__c: false,
    calOptions: null,
    canExitGracefully : true,


    onExit : function(view, state) {

    if((state == 'fg') && (_ullages.canExitGracefully)) {


        _keypad.killNumpad(function () {
            _log.d("Keypad go bye bye");
            _ullages.ullageCodes = null;
            _ullages.products = null;
            _ullages.currRecord = null;
            _ullages.customerModel = null;
            _ullages.calOptions = null;
        });

      }

    },

    onTabChange : function() {

  //    _log.d("ORDER TAB CHANGED");


      _keypad.killNumpad(function () {
        _keypad.buildFaceKeypad("ullagesFront");
      });



    },



    onLoaded: function (view, card) { var _ = this;


    },

    lockCB : false,
    onMessage : function(data, lock) {

        var _ = this;

        _ullages.CustomerId__c = data.CustomerId__c;
        _model.getAll("ullageCodes", function (ullageCodes) {
            _ullages.ullageCodes = ullageCodes;
            _model.getAll("products", function (products) {
                _ullages.groupItems(products);
                _model.get("accounts", {
                    "CustomerId__c": _ullages.CustomerId__c
                }, function(account) {
                    _calendar.getOptions(function(options) {

                        _ullages.calOptions = options;

                        _log.d("CAL OPTIONS ARE "+JSON.stringify(options));

                        account = account[0];
                        _log.d("LOADING CUSTOMER : " + JSON.stringify(account));
                        layout.attach("#ullagesFront");

                        _ullages.customerModel = account;
                        _ullages.Purchase_Order_No_Required__c = _ullages.customerModel.Purchase_Order_No_Required__c;
                        _ullages.canExitGracefully = false;


                        setTimeout(function() {

                          _cardEngine.switchTab( $('#ullagesFront__FACE').find('.tabSetTab')[0], 'ullages', 'ullagesFront__FACE', _ullages.onTabChange );


                        }, 1000);


                    });

                });

            });
        });
    },
    ullagesCtrl: function($scope) {
        $scope.products = _ullages.currRecord;
        $scope.ullageCodes = _ullages.ullageCodes;
        $scope.customerName = _customer.model.Name;
        $scope.change = function() {
            //iterate through this values group siblings and set the group active value
            var returnVal = false;
            for(var b in this.group.records) {
                for (var a in this.group.records[b].reasonsets) {
                    if (this.group.records[b].reasonsets[a].name != "") {
                        _log.d("FOUND A ULLAGE: " + this.group.records[b].reasonsets[a].name);
                        this.group.records[b].reasonsetactive = true;
                        returnVal = true;
                    }
                    if (returnVal) {break;}
                }
                if (returnVal) {break;}
            }
            this.group.active = returnVal;
        }
        $scope.groupNeeded = function() {
            //iterate through this values group siblings and set the group active value
            var returnVal = false;
            for(var b in this.group.records) {
                for (var a in this.group.records[b].reasonsets) {
                    if (this.group.records[b].reasonsets[a].quantity != 0) {
                        _log.d("FOUND A ULLAGE: " + this.group.records[b].reasonsets[a].quantity);
                        this.group.records[b].reasonsetactive = true;
                        returnVal = true;
                    }
                    if (returnVal) {break;}
                }
                if (returnVal) {break;}
            }
            this.group.active = returnVal;
            return returnVal;
        }
        $scope.recordNeeded = function() {
            //iterate through this values group siblings and set the group active value
            var returnVal = false;
            for (var a in this.record.reasonsets) {
                if (this.record.reasonsets[a].quantity != 0) {
                    _log.d("FOUND A ULLAGE: " + this.record.reasonsets[a].quantity);
                    //this.group.records[b].reasonsetactive = true;
                    returnVal = true;
                }
                if (returnVal) {break;}
            }
            //this.group.active = returnVal;
            return returnVal;
        }
        $scope.toggleReason = function() {
            var blankreason = {
                name: _ullages.ullageCodes[0],
                quantity: 0
            }
            this.record.reasonsets.push(blankreason);

            setTimeout(function() { _ullages.onTabChange(); }, 500); 

        }
        $scope.totalQty = function() {

            _log.d("Calculating total quantity")

            var total = 0;

            for (var i in _ullages.currRecord) {
                for (var j in  _ullages.currRecord[i].records) {
                    for (var k in  _ullages.currRecord[i].records[j].reasonsets) {
                        total += parseInt(_ullages.currRecord[i].records[j].reasonsets[k].quantity);
                    }
                }
            }
            return total;
        }
        $scope.inFilter = function (record) {
            var filter = _ullages.currRecord.ullagesFilter.toLowerCase();
            if (filter == "") return true;

            //_log.d("contains: " + filter);

            var productId = record.ProductId__c.toLowerCase();
            var longDescription = record.LongDescription__c.toLowerCase();

            //_log.d("and comparing to: " + productId + " and " + longDescription);

            if (productId.indexOf(filter) > -1) return true;
            if (longDescription.indexOf(filter) > -1) return true;

            return false;

        };
        $scope.clearFilter = function () {
            _ullages.currRecord.ullagesFilter = "";
            _keypad.killNumpad(function () {
                _keypad.buildFaceKeypad("ullagesFront");
                _.currScrolls[0].refresh()
            });
        }
        $scope.keypadHack = function () {
            setTimeout( function () {
                _keypad.killNumpad(function () {
                    _keypad.buildFaceKeypad("ullagesFront");
                    _.currScrolls[0].refresh()
                });
            },500);
        }
    },
    groupItems : function(record) {
        var groups = [];
        for (var r in record) {
            var rec = record[r];
            // Determine if we need to create the group
            var group = false;
            for (var g in groups) {
                if (groups[g].name == rec.ProductGroup__r.Name) {
                    rec.reasonsetactive = false;
                    rec.reasonsets = [];
                    group = groups[g].records.push(rec);
                    break;
                }
            }
            // Ensure that there is a group entry for this record
            if (!group) {
                group = {
                    name: rec.ProductGroup__r.Name,
                    active: false,
                    records: [],
                    showOnly: function () {

                        var filter = _ullages.currRecord.ullagesFilter.toLowerCase();

                        for (var r in this.records) {
                            if (filter == "") return true;

                            var productId = this.records[r].ProductId__c.toLowerCase();
                            var longDescription = this.records[r].LongDescription__c.toLowerCase();
                            if (productId.indexOf(filter) > -1) return true;
                            if (longDescription.indexOf(filter) > -1) return true;
                        }
                        return false;
                    }
                }
                rec.reasonsetactive = false;
                rec.reasonsets = [];
                group.records.push(rec);

                groups.push(group);
                _log.d("ADDED GROUP: " + rec.ProductGroup__r.Name);
            }
        }
        _ullages.currRecord = groups;
        _ullages.currRecord.ullagesFilter = "";
    },
    proceed : function () {
        var po = $('#dataPONumber').val();
        var mustPO = _ullages.Purchase_Order_No_Required__c;
        if(mustPO && $.trim(po) == '') {
            $('div.contentWrapper #dataPONumber').css({backgroundColor: '#aa2222'});
            setTimeout(function () {
                    $('div.contentWrapper #dataPONumber').css({backgroundColor: ''})
                },
                1500);
            return false;
        } else {
            $("#ullagesfinaliseText").hide();
            $("#ullagesfinaliseLoader").show();
            return true;
        }
    },
    submitUllages : function () {

        var po = $('#dataPONumber').val();
        var date = $('#ullageDelDate').val();
        //date = "2015-03-09";
        date = moment(date).format("YYYY-MM-DD");

        var ullageItems = [];
        var UllageItemNumber = 1;
        for (var r in _ullages.currRecord) {
            for (var s in _ullages.currRecord[r].records) {
                for(var t in _ullages.currRecord[r].records[s].reasonsets) {
                    if (_ullages.currRecord[r].records[s].reasonsets[t].quantity != 0) {
                        var obj = {
                            "UllageNumber":"1",
                            "UllageItemNumber": UllageItemNumber.toString(),
                            "SFDC_UllageId":"",
                            "SFDC_UllageItemId":"",
                            "UllageQty": _ullages.currRecord[r].records[s].reasonsets[t].quantity.toString(),
                            "SAP_ProductId":_ullages.currRecord[r].records[s].ProductId__c.toString(),
                            "ItemReasonCode": _ullages.currRecord[r].records[s].reasonsets[t].name.Code__c
                        }
                        var pushorpull = false;
                        for(var a in ullageItems) {
                            if((ullageItems[a].SAP_ProductId == _ullages.currRecord[r].records[s].ProductId__c.toString()) && (ullageItems[a].ItemReasonCode == _ullages.currRecord[r].records[s].reasonsets[t].name.Code__c)) {
                                var temp = parseInt(ullageItems[a].UllageQty) + parseInt(_ullages.currRecord[r].records[s].reasonsets[t].quantity);
                                ullageItems[a].UllageQty = temp.toString();
                                pushorpull = true;
                            }
                        }
                        if (!pushorpull) {
                            UllageItemNumber = UllageItemNumber + 1;
                            ullageItems.push(obj);
                        }
                    }
                }
            }
        }
        var currentCredentials = JSON.parse(window.localStorage.getItem('credentials'));
        var sessionId = currentCredentials.sessionId;

        var tmp_date = new Date();  //needed to generate the MobileUllageId
        var model = {
            "UllageNumber": "1",
            "SAP_CustomerId": _ullages.CustomerId__c,
            "SFDC_UllageId": "",
            "UllageReasonCode": "Z01",
            "PurchaseOrderNo": po.toString(),
            "ScheduledDeliveryDate": date,
            "LineItems": ullageItems,
            "MobileUllageId": $.md5(sessionId + tmp_date.getTime())
        }
        var apexObj = { 'lst_Ullage' : [model] };
        var jobData = {action: 'submitUllages', data: apexObj};
        jobQueue.addJob("Ullage Submission",  _customer.model.Name, jobData, true, false, false);
        _log.d("APEX OBJECT: " + JSON.stringify(apexObj));
        $("#ullagesfinaliseText").show();
        $("#ullagesfinaliseLoader").hide();
    },
    submitCtrl: function($scope) {

        _log.d("SUBMIT DEFAULT DATE IS "+_ullages.calOptions.defaultDate);

        var _date = moment(_ullages.calOptions.defaultDate).format("YYYY-MM-DD" );
        _log.d("SUBMIT DEL DATE IS "+_date);

        $scope.date = _date;
        _ullages.calOptions.position = "bottom right";
        $scope.customerName = _customer.model.Name;
        $scope.calOptions = _ullages.calOptions;
    },
    addToObj : function() {

    },
    submit : function () {
        if(_ullages.proceed()) {

            //return to customer
            _ullages.submitUllages();
            _ullages.canExitGracefully = true;
            layout.sendMessage('customer', { CustomerId__c : _ullages.CustomerId__c } );
        }
    },
    submitUllagesBtn : function () {
        $("#ullagessubmitText").hide();
        $("#ullagessubmitLoader").show();


        _log.d("$scope.submitUllages");


        for(var a in _ullages.currRecord) {
            if(_ullages.currRecord[a].active == true) {
                _ullages.you_may_continue = true;
            }
            if (_ullages.you_may_continue) {break;}
        }

        if(_ullages.you_may_continue)
        {

            _log.d("Ullage found, continue");
            //_keypad.killNumpad(function () {
            //_log.d("Keypad go bye bye");
            _keypad.hide();
            _cardEngine.flip("ullages", "ullagesSubmit");
            layout.attach('#ullagesSubmit');
            //});

            /*
             //show the finalize modal
             var xml = $('#ullageModal').html();
             var today = new Date();
             var tomorrow = new Date();
             tomorrow.setDate(today.getDate()+1);
             xml = xml.replace("DATEGOESHERE", moment(tomorrow).format("YYYY-MM-DD"));
             xml = xml.replace(/xid/g, 'id');
             _calendar.getOptions(function(options) {

             _ullages.calOptions = options;

             log.d("Showing ullages modal");
             var formToggleTimer = setTimeout(function () {
             _ullages.calOptions.field = $("#dataDelDate")[0];
             var picker = new Pikaday(

             _ullages.calOptions

             );

             }, 4000);
             _modal.show('warning', 'FINALIZE ULLAGES', xml, true, function() {
             if(_ullages.proceed()) {
             //return to customer
             _ullages.submitUllages();
             layout.sendMessage('customer', { CustomerId__c : _ullages.CustomerId__c } );
             _modal.hide();
             }
             },function() {
             _log.d("ERROR");
             _modal.hide();
             },false);

             });
             */

        }
        else
        {
            //inventory NOT taken... state reason..
            var xml = "you need to add at least one ullage to continue.";
            _modal.show('warning', 'NO ULLAGES TAKEN', xml, false, function() { _modal.hide(); });
        }
        $("#ullagessubmitText").show();
        $("#ullagessubmitLoader").hide();
    }
};
;;

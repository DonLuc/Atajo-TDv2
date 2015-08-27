_inventory = {

    model: [],
    capturedInventoryVar : false,

    onExit: function (view, state) {


        _inventory.currRecord.key = _inventory.currRecord.Id;
        _model.batch("inventory", [_inventory.currRecord], function (inventory) {

            if(state == 'fg')
            {

              _keypad.killNumpad(function () {
                  _log.d("Keypad go bye bye");
              });

               _inventory.currRecord = null;
               _inventory.model = {};


            }

        });
    },

    debugTimer : 0,
    logTime : function(msg) {

        var now = new Date().getTime();
        _log.d("TIMER LOG [ "+msg+" ] @ "+now+" ( "+(now-_.debugTimer)+")");
        _.debugTimer = now;

    },

    onTabChange : function() {

       _log.d("INVENTORY TAB CHANGED");

      _keypad.killNumpad(function () {
        _keypad.buildFaceKeypad("inventoryFront");
      });


    },




    onLoaded: function () {
        _log.d("inventory - onLoaded");

        /*
         _inventory.customerID = "125463"; // SAP customer ID aka CustomerId__c
         _inventory.Id         = "0011100000H8bMmAAJ"            // SF customer ID  aka Customer__c , do not confuse with the customer id above.
         _inventory.getModel(_inventory.Id);
         */

    },


    onMessage: function (data, lock) {

      _inventory.lockCB = lock;
      _inventory.lockCB('lock');


        _log.d("inventory - onMessage, CustomerId__c: " + data.CustomerId__c + " , Customer__c: " + data.Id);
        _inventory.customerID = data.CustomerId__c; // SAP customer ID aka CustomerId__c
        _inventory.Id = data.Id;            // SF customer ID  aka Customer__c , do not confuse with the customer id above.


        _model.getAll("noInventoryReasons", function (reasons) {

            _inventory.noInventoryReasons = reasons;


            _inventory.getModel(_inventory.Id);



        });



    },


    Ctrl: function ($scope) {
        $scope.inventory = _inventory.currRecord;
        $scope.customerName = _customer.model.Name;

        $scope.keypadHack = function () {
            setTimeout( function () {
                _keypad.killNumpad(function () {
                    _keypad.buildFaceKeypad("inventoryFront");
                    _.currScrolls[0].refresh()
                });
            },500);
        }

        $scope.inFilter = function (record) {

            var filter = _inventory.currRecord.inventoryFilter.toLowerCase();
            if (filter == "") return true;

            _log.d("contains: " + filter);

            var productId = record.Product__r.ProductId__c.toLowerCase();
            var longDescription = record.Product__r.LongDescription__c.toLowerCase();

            if (productId.indexOf(filter) > -1) return true;
            if (longDescription.indexOf(filter) > -1) return true;

            return false;

        }


        $scope.totalQty = function() {

            _log.d("Calculating total quantity");

            var total = 0;
            try
            {
            for (var i in _inventory.currRecord.Inventory_Items__r.records) {
                total += parseInt(_inventory.currRecord.Inventory_Items__r.records[i].Quantity__c);
            }
            }
            catch (e)
            {
              total = 0;
            }
            _inventory.capturedInventoryVar = _inventory.capturedInventory(_inventory.currRecord);
            return total;

        };
        $scope.clearFilter = function () {
            _inventory.currRecord.inventoryFilter = "";
            _keypad.killNumpad(function () {
                _keypad.buildFaceKeypad("inventoryFront");
                _.currScrolls[0].refresh()
            });
        };

    },


    capturedInventory: function (inventory) {

        for (var r in inventory.Inventory_Items__r.records) {

            if (inventory.Inventory_Items__r.records[r].Quantity__c > 0) return true;

        }

        return false;

    },

    placeOrder : function() {

      if (_inventory.capturedInventoryVar) {
          layout.showLoader();
          //_inventory.currRecord.Status__c = "Complete";
          _inventory.currRecord.Reason_for_no_Inventory_count__c = '';
          _inventory.currRecord.key = _inventory.currRecord.Id;





          _model.set("inventory", _inventory.currRecord, function (inventory) {

              _log.d("Inventory Save");

              _log.d("Starting order for: " + _inventory.customerID + " | " + _inventory.Id);
              _keypad.killNumpad(function () {
                  // _log.d("Keypad go bye bye");
                   _inventory.currRecord.key = _inventory.currRecord.Id;
                   layout.sendMessage('order', {CustomerId__c: _inventory.customerID, Id: _inventory.Id, Inventory: _inventory.currRecord });
              });

          });

      } else {
          _keypad.hide();
          _cardEngine.flip("inventory", "noInventory");
          layout.attach('#noInventory');
      }


    },


    getModel: function (Id) {

        _log.d("inventory.getModel for: " + Id);


        _model.get("inventory", {"Customer__c": Id}, function (inventory) {

            //_log.d("Got inventory: " + JSON.stringify(inventory));

            _inventory.model = inventory;

            _log.d("Inventory count: "  + inventory.length);
            if (inventory.length == 0) {

                _log.d("No inventory found, so go with out of sequence order");

                var message = "This is an out of sequence order. <br /><br />The Inventory list will be compiled from the Product list. <br /><br />You will see no recent items, or other indicators.";
                _inventory.showMessage('OUT OF SEQUENCE', message, function () {

                    _inventory.handleNewInventoryItem(null, function (resultModel) {
                        _inventory.showInventory(resultModel);
                    });

                });

            } else {

                //LOAD THE LAST RECORD...
                _inventory.currRecord = inventory[inventory.length - 1];

                //LAST STATUS
                var lastStatus = _inventory.currRecord.Status__c;

                if (lastStatus == "Complete" || lastStatus == "No Inventory Counted") {

                    _log.d("Additional order");

                    // INVENTORY ALREADY PLACED --> CLONE FOR SECONDARY ORDER

                    message = "This is an additional order";
                    _inventory.showMessage('ADDITIONAL ORDER', message, function () {

                        _inventory.handleNewInventoryItem(null, function (resultModel) {
                            _inventory.showInventory(resultModel);
                        });


                    });


                } else {

                    var controlBlank = false;

                    if (_inventory.currRecord.Inventory_Items__r) {
                        if (_inventory.currRecord.Inventory_Items__r.records) {
                            _log.d("Inventory item count : " + _inventory.currRecord.Inventory_Items__r.records.length);
                        } else {
                            _log.d("Inventory item count : 0");
                            controlBlank = true;
                        }
                    } else {
                        _log.d("Inventory item count : 0");
                        controlBlank = true;
                    }
                    _log.d("BLANK INVENTORY IS : " + controlBlank);

                    if (controlBlank) {
                        _log.d("No inventory found, so go with out of sequence order");

                        var message = "This is an out of sequence order. <br /><br />The Inventory list will be compiled from the Product list. <br /><br />You will see no recent items, or other indicators.";
                        _inventory.showMessage('OUT OF SEQUENCE', message, function () {

                            _inventory.handleNewInventoryItem(null, function (resultModel) {
                                _inventory.showInventory(resultModel);
                            });

                        });
                    } else {
                        //THERE IS BOTH A HEADER AND ITEMS...
                        _log.d("NORMAL INVENTORY WITH HEADER AND ITEMS --> CONTINUING");
                        _inventory.showInventory(_inventory.currRecord);
                    }


                }


            }


        });

    },


    showMessage: function (heading, message, cb) {

        _modal.show('warning', heading, message,
            false,
            function () {
                _modal.hide();
                cb();

            },
            function () {
                _modal.hide();
                cb();
            }
        );


    },


    handleNewInventoryItem: function (partialObj, cb) {

        _log.d("_inventory.handleNewInventoryItem");

        if (partialObj == null) {

            //build header

            partialObj =
            {
                Id: _inventory.Id + "_", // LDP: This was previously used to determine which was the last record, now it is just used to keep the Id unique while still having a reference to the previous id if needed.
                Scheduled_Visit_Date__c: _util.getDate(),
                Reason_for_no_Inventory_count__c: "",
                Status__c: "Load Inventory Item",
                Inventory_Items__r: null,
                Customer__c: _inventory.Id,
                AdditionalInv: true

            };


            _model.getAll("products", function (productModel) {

                partialObj.Inventory_Items__r = {};
                partialObj.Inventory_Items__r.records = [];


                var cnt = 0;
                for (var p in productModel) {
                    if (productModel[p].LongDescription__c == '' || productModel[p].LongDescription__c == null) {
                        continue;
                    }

                    var newInvItem =
                    {
                        Id: "",
                        Quantity__c: "0",
                        Product__r: {
                            ProductId__c: productModel[p].ProductId__c,
                            LongDescription__c: productModel[p].LongDescription__c
                        },
                        Recent__c: true,
                        Product_Group__c: ( (productModel[p].ProductGroup__r == null) ? '' : productModel[p].ProductGroup__r.Name),
                        Name: "InvIt-" + cnt,   // OLD: because everything needs a name... and... used as identifier for function qtyChanged
                                                // LDP: Replaced with angular double binding, so it may or may not still be useful
                        Product__c: productModel[p].Id
                    };
/*
                    if (cnt < 10) {
                        _log.d(JSON.stringify(newInvItem));
                    }
*/
                    partialObj.Inventory_Items__r.records.push(newInvItem);

                    cnt++;
                }

                cb(partialObj);


            });


        }

    },


    showInventory: function (record) {
        that = this;



        _log.d("SHOW INVENTORY");

        record.inventoryFilter = "";
        _inventory.groupItems(record);
        _inventory.currRecord = record;

        layout.attach('#inventoryFront', true);



        setTimeout(function() {

          _log.d("Before keypad attach");
          _keypad.buildFaceKeypad("inventoryFront");


          _inventory.lockCB('release');
          _cardEngine.switchTab( $('#inventoryFront__FACE').find('.tabSetTab')[0], 'inventory' );

          }, 1000);

    },
    groupItems: function (record) {

        _log.d("_inventory.groupItems");

        if (record.Inventory_Items__r && record.Inventory_Items__r.records) {

            _log.d("Records: " + record.Inventory_Items__r.records.length);

            // Create a groups lookup, this would have been an object dictionary {}, but
            // the Product Groups can contain spaces, so I'm not sure that would work too well.
            record.groups = []

            for (var r in record.Inventory_Items__r.records) {

                var rec = record.Inventory_Items__r.records[r];

                // Determine if we need to create the group
                var group = false;
                for (var g in record.groups) {
                    if (record.groups[g].name == rec.Product_Group__c) {
                        group = record.groups[g];
                        break;
                    }
                }

                // Ensure that there is a group entry for this record
                if (!group) {

                    group = {
                        name: rec.Product_Group__c,
                        records: [],

                        showRecent: function () {

                            var filter = _inventory.currRecord.inventoryFilter.toLowerCase();

                            for (var r in this.records) {
                                if (this.records[r].Recent__c) {

                                    if (filter == "") return true;

                                    var productId = this.records[r].Product__r.ProductId__c.toLowerCase();
                                    var longDescription = this.records[r].Product__r.LongDescription__c.toLowerCase();
                                    if (productId.indexOf(filter) > -1) return true;
                                    if (longDescription.indexOf(filter) > -1) return true;

                                }
                            }

                            return false;

                        },

                        showOnly: function () {

                            var filter = _inventory.currRecord.inventoryFilter.toLowerCase();

                            for (var r in this.records) {
                                if (this.records[r].Quantity__c > 0) {

                                    if (filter == "") return true;

                                    var productId = this.records[r].Product__r.ProductId__c.toLowerCase();
                                    var longDescription = this.records[r].Product__r.LongDescription__c.toLowerCase();
                                    if (productId.indexOf(filter) > -1) return true;
                                    if (longDescription.indexOf(filter) > -1) return true;

                                }
                            }

                            return false;

                        },

                        showAll: function () {

                            var filter = _inventory.currRecord.inventoryFilter.toLowerCase();
                            if (filter == "") return true;

                            _log.d("filter: " + filter);

                            for (var r in this.records) {

                                var productId = this.records[r].Product__r.ProductId__c.toLowerCase();
                                var longDescription = this.records[r].Product__r.LongDescription__c.toLowerCase();
                                if (productId.indexOf(filter) > -1) return true;
                                if (longDescription.indexOf(filter) > -1) return true;

                            }

                            return false;

                        }


                    }

                    record.groups.push(group);

                    _log.d("ADDED GROUP: " + rec.Product_Group__c);

                }

                // Push by reference should keep mapping intact on this object.
                group.records.push(rec);


            }

        }

    },

/*
    groupItems: function (record) {

        _log.d("_inventory.groupItems");

        if(record.isGrouped) {

          _log.d("_inventory.groupItems --> ALREADY GROUPED --> CONTINUING");

        }

        if (record.Inventory_Items__r && record.Inventory_Items__r.records  && !record.isGrouped ) {

          _log.d("THERE ARE " + record.Inventory_Items__r.records.length+" INVENTORY ITEMS");

          // Create a groups lookup, this would have been an object dictionary {}, but
          // the Product Groups can contain spaces, so I'm not sure that would work too well.
          record.groups = {};

          for (var r in record.Inventory_Items__r.records)
          {

              var rec = record.Inventory_Items__r.records[r];

              // Determine if we need to create the group

              if(typeof record.groups[rec.Product_Group__c] == 'undefined')
              {
                record.groups[rec.Product_Group__c] =
                {
                    name: rec.Product_Group__c,
                    records: [rec],

                    showRecent: function () {

                        var filter = _inventory.currRecord.inventoryFilter.toLowerCase();

                        for (var r in this.records) {
                            if (this.records[r].Recent__c) {

                                if (filter == "") return true;

                                var productId = this.records[r].Product__r.ProductId__c.toLowerCase();
                                var longDescription = this.records[r].Product__r.LongDescription__c.toLowerCase();
                                if (productId.indexOf(filter) > -1) return true;
                                if (longDescription.indexOf(filter) > -1) return true;

                            }
                        }

                        return false;

                    },

                    showOnly: function () {

                        var filter = _inventory.currRecord.inventoryFilter.toLowerCase();

                        for (var r in this.records) {
                            if (this.records[r].Quantity__c > 0) {

                                if (filter == "") return true;

                                var productId = this.records[r].Product__r.ProductId__c.toLowerCase();
                                var longDescription = this.records[r].Product__r.LongDescription__c.toLowerCase();
                                if (productId.indexOf(filter) > -1) return true;
                                if (longDescription.indexOf(filter) > -1) return true;

                            }
                        }

                        return false;

                    },

                    showAll: function () {

                        var filter = _inventory.currRecord.inventoryFilter.toLowerCase();
                        if (filter == "") return true;

                        _log.d("filter: " + filter);

                        for (var r in this.records) {

                            var productId = this.records[r].Product__r.ProductId__c.toLowerCase();
                            var longDescription = this.records[r].Product__r.LongDescription__c.toLowerCase();
                            if (productId.indexOf(filter) > -1) return true;
                            if (longDescription.indexOf(filter) > -1) return true;

                        }

                        return false;

                    }


                }
              }
              else
              {
                 record.groups[rec.Product_Group__c].records.push(rec);
              }


            record.isGrouped = true;

          }




        }

    },
*/



    NoInventoryCtrl: function ($scope) {

        _log.d("_inventory.NoInventoryCtrl: " + _inventory.noInventoryReasons.length);

        $scope.noInventoryReasons = _inventory.noInventoryReasons;
        $scope.customerName = _customer.model.Name;

        $scope.selectReason = function (reason) {
            layout.showLoader();
            _log.d("Setting no inventory with reason: " + reason.Id);

            //_inventory.currRecord.Status__c = "No Inventory Counted";
            _inventory.currRecord.Reason_for_no_Inventory_count__c = reason.Name;





            _model.set("inventory", _inventory.currRecord, function(inventory) {
                _keypad.killNumpad(function () {
                    _log.d("Keypad go bye bye");
                    layout.sendMessage('order', {CustomerId__c: _inventory.customerID, Id: _inventory.Id, Inventory : _inventory.currRecord});
                });
            });

        };

    }


};
;
;;;

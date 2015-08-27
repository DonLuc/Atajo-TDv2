


_order = {

    model: [],
    orderHistory : [],
    promotionDetails : null,
    promotionItem : null,
    acceptedArray : [],
    priceMutationSubscriber : null,
    previousCust : "",
    purchaseOrderRequired : false,
    finaliseLoader : false,
    mypos : null,
    canExitGracefully : true,
    finaliseTimeoutControl : true,
    currTotal : 0,
    reasonSubmitted : false,
    navigatedAway : false,


    onExit: function (view, state) {
        _order.currRecord.key = _order.currRecord.Id;
        if(state == 'fg'){
            //SAVE THE CURR ORDER
            //we need to update the suggested orders here...
            _model.batch("orders", [  _order.currRecord ], function (inventory) {
                if (_order.canExitGracefully) {
                    _keypad.killNumpad(function () {
                        _order.currRecord = {};
                        _order.model = {};
                        _order.promotionDetails = null;
                        _order.orderHistory = [];
                        _order.promotionItem = null;
                        _order.currTotal = 0;
                        _log.d("Keypad go bye bye");
                    });
                }
            });
        }
        _order.navigatedAway = true;
    },


    onLoaded: function () {
    },

    onTabChange : function() {

      _log.d("ORDER TAB CHANGED");


      setTimeout(function() {
        _keypad.killNumpad(function () {
           _keypad.buildFaceKeypad("orderFront");
        });

      }, 1000);




    },


    debugTimer : 0,
    logTime : function(msg) {

        var now = new Date().getTime();
        _log.d("TIMER LOG [ "+msg+" ] @ "+now+" ( "+(now-_.debugTimer)+")");
        _.debugTimer = now;

    },

    onMessage: function (data, lock) { var _ = this;

        _order.logTime('onMessage');

        _log.d("order - onMessage");

        _order.lockCB = lock;
        _order.lockCB('lock');

        _order.customerID = data.CustomerId__c; // SAP customer ID aka CustomerId__c
        _order.Id = data.Id;            // SF customer ID  aka Customer__c , do not confuse with the customer id above.

        _order.isAdditional = false;
        _order.outOfSequence = false;
        _order.finaliseTimeoutControl = true;




        //_order.noExit           = false;

        _model.getAll("noOrderReasons", function (noOrderReasons) {


          _order.logTime('GOT NO ORDER REASONS - GETTING CALENDAR OPTIONS');


            _calendar.getOptions(function(options) {


              _order.logTime('GOT CALENDAR OPTIONS');


                _order.calOptions = options;

                _order.noOrderReasons = noOrderReasons;
                _order.getModel(_inventory.Id);
                _order.loadPromotionInfo(data.CustomerId__c);
                if(_order.previousCust != data.CustomerId__c) {
                    _order.previousCust = data.CustomerId__c;
                    _order.acceptedArray = [];
                }


                _order.canExitGracefully = false;
                _order.reasonSubmitted = false;
                _order.navigatedAway = false;

            });



        });


    },

    Ctrl: function ($scope) {

        $scope.order = _order.currRecord;

    //    _log.d("BINDING ORDER : "+JSON.stringify(_order.currRecord.Order_Items__r.records));

        $scope.activeItem = _order.acceptedArray;
        $scope.customerName = _customer.model.Name;
        $scope.total = 0;
        //alert("price after bind: " + _order.currRecord.Live_Price__c);

        /*
        <div class="grid">
            <div class="unit w-13-16 align-left"></div>
            <div class="unit w-2-16 align-left">Total</div>
            <div class="unit w-1-16 align-left">{{totalQty()}}</div>
        </div>
        */

        $scope.keypadHack = function () {
            setTimeout( function () {
                _keypad.killNumpad(function () {
                    _keypad.buildFaceKeypad("orderFront");
                    _.currScrolls[0].refresh()
                });
            },500);
        }

        $scope.inFilter = function (record) {

            //_log.d("_order.inFilter");

            var filter = _order.currRecord.orderFilter.toLowerCase();
            if (filter == "") return true;

            //_log.d("contains: " + filter);

            var productId = record.SKU.toLowerCase();
            var longDescription = record.Product_Name__c.toLowerCase();

            //_log.d("and comparing to: " + productId + " and " + longDescription);

            if (productId.indexOf(filter) > -1) return true;
            if (longDescription.indexOf(filter) > -1) return true;

            return false;

        };


        $scope.inventory = function () {
            _keypad.killNumpad(function () {
                _log.d("Keypad go bye bye");
                layout.sendMessage('inventory', {CustomerId__c: _order.customerID, Id: _order.Id});
            });

        };
        $scope.finaliseLoader = _order.finaliseLoader;

        $scope.onlinePricing = _order.getOnlinePricing;


        $scope.loadOrderHistory = function ($event, recordObj) {

          //   _log.d("LOADING ORDER HISTORY FOR : "+JSON.stringify(recordObj));

            _order.orderHistory = recordObj;
            //_keypad.killNumpad(function () {
                //_log.d("Keypad go bye bye");
                _keypad.hide();
                _order.mypos = $event; // Keep track of SKU
                _cardEngine.flip("order", "orderHistory", function(release) {

                  //GET THE HISTORY FOR THIS CUSTOMER
                  _model.get("orderHistory", {Customer__c: _order.Id}, function(history)
                  {
                    if(typeof history[0] == 'undefined')
                    {
                      _log.d("COULD NOT FIND HISTORY");
                      _order.orderHistory = false;
                    }
                    else if( !history[0] || ( typeof history[0].Order_Items__r == 'undefined') || (typeof history[0].Order_Items__r.records == 'undefined') || history[0].Order_Items__r.records.length === 0)
                    {
                      _log.d("COULD NOT FIND HISTORY");
                      _order.orderHistory = false;
                    }
                    else
                    {
                      history = history[0];
                      for(var h in history.Order_Items__r.records)
                      {
                        var curr = history.Order_Items__r.records[h];
                    //    _log.d("CHECKING IF "+curr.ProductId__c+" == "+recordObj.ProductId__c);
                        if(curr.ProductId__c == recordObj.ProductId__c)
                        {
                           _log.d("FOUND HISTORY FOR "+curr.ProductId__c);
                           curr.Product_Name__c = recordObj.Product_Name__c;
                           curr.SKU             = recordObj.SKU;
                           _order.orderHistory = curr;
                           break;
                        }
                      }


                    }

                    layout.attach('#orderHistory');
                    release();


                  });



                });
            //});


        };
        $scope.loadPromo = function(SKU, On_Promo__c) {
            if((On_Promo__c == true) || (this.On_Promo__c == "Y")) {
                _order.loadPromotionItem(SKU);
            }
        }

        $scope.totalQty = function() {

            _log.d("Calculating total quantity");

            var total = 0;

            for (var i in _order.currRecord.Order_Items__r.records) {
                if(!_order.currRecord.Order_Items__r.records[i].isSuggested) {
                    total += parseInt(_order.currRecord.Order_Items__r.records[i].OrderQty__c);
                }
            }

            _order.currTotal = total;

            return total;
        };
        $scope.acceptMe = function (record) {
            record.isSuggested = false;
            if ((record.OrderQty__c === 0) || (record.OrderQty__c === '')) {
                record.accepted = false;
            } else {
                record.accepted = true;
            }

            $scope.total = $scope.totalQty();

        };
        $scope.clearFilter = function () {
            _order.currRecord.orderFilter = "";
            _keypad.killNumpad(function () {
                _keypad.buildFaceKeypad("orderFront");
                _.currScrolls[0].refresh()
            });
        };

    },
    orderPromotionCtrl : function ($scope) {
        $scope.promotionItem = _order.promotionItem;
    },

    FinalizeCtrl: function ($scope) {

        _log.d("_order.FinalizeCtrl");

        _order.calOptions.position = "bottom right";

        $scope.calOptions = _order.calOptions;
        $scope.customerName = _customer.model.Name;

        $scope.order = _order.currRecord;

        _model.get("accounts", {CustomerId__c: _order.customerID}, function (accounts) {

            if (accounts.length > 0) {

                //TODO: Handle this from the ui perspective.
                _order.purchaseOrderRequired = accounts[0].Purchase_Order_No_Required__c;

            }

        });



    },

    confirmOrder: function (getPO, noOrderReason) {
        if(!_order.finaliseTimeoutControl) {
            return;
        } else {
            _order.finaliseTimeoutControl = false;
        }
        $("#orderconfirmText").hide();
        $("#orderconfirmLoader").show();
        getPO = (typeof getPO == 'undefined') ? true : getPO;
        noOrderReason = (typeof noOrderReason == 'undefined') ? "" : noOrderReason;


        _log.d("_order.confirm: " + noOrderReason);

        if (getPO) {
            var po = "";
            if (_order.currRecord.Purchase_Order_No__c != null) {
                po = _order.currRecord.Purchase_Order_No__c.substring(0, 34);
            } else {
                po = _order.currRecord.Purchase_Order_No__c;
            }

            _log.d("po: " + po);
        }
        if ((_order.purchaseOrderRequired) && ((po == null) || (po == ""))) {
            $('div.contentWrapper #orderPONumber').css({backgroundColor: '#aa2222'});
            setTimeout(function () {
                    $('div.contentWrapper #orderPONumber').css({backgroundColor: ''})
                },
                1500);
            $("#orderconfirmText").show();
            $("#orderconfirmLoader").hide();
            _order.finaliseTimeoutControl = true;
            return;
        }

        if (noOrderReason) {

            _log.d("Setting status to No Order");

            _order.currRecord.Order_Status__c = 'No Order';
        } else {

            _order.currRecord.Order_Status__c = 'Finalized';

            //UPDATE THE ROUTE
            _log.d("ORDER FINALIZED -> UPDATING ROUTE WITH TOTALS");

            _model.getAll("routes", function (routes) {

              for (var i in routes) {

                   var _route = routes[i];
                   var route = _route.Customers__r.records;

                   for(var r in route)
                   {
                      var currCustomer = route[r];
                      var cid = currCustomer.Id;


                      _log.d("DOES "+cid+" == "+_order.Id+" || "+cid+" == "+_order.Customer__c);
                      if( (cid == _order.Id) )
                      {
                        _log.d("FOUND CUSTOMER IN ROUTE. UPDATING");

                         if(typeof currCustomer.casesTotal == 'undefined')
                          {
                           currCustomer.casesTotal = 0;
                          }

                         if(typeof currCustomer.orderTotal == 'undefined')
                          {
                            currCustomer.orderTotal = 0;
                          }

                        _log.d(" 1. "+currCustomer.casesTotal+" += "+_order.currTotal);
                        currCustomer.casesTotal += _order.currTotal;

                        currCustomer.orderTotal  = (currCustomer.orderTotal === 0) ? 1 : ( parseInt(currCustomer.orderTotal) + 1);

                        _log.d(" 2. ORDER TOTAL = "+currCustomer.orderTotal);

                        currCustomer.Live_Price__c =  _order.currRecord.Live_Price__c;

                        _log.d(" 3. LIVE PRICE = "+currCustomer.Live_Price__c);


                        break;
                      }


                   }


                   _model.set("routes", _route);


              }





            });




        }

        _order.currRecord.Reason_For_No_Order__c = noOrderReason;
        _order.currRecord.Quantity__c = _order.currRecord.Order_Qty__c + "";

        _log.d("Getting inventory");

        _model.get("inventory", {Customer__c: _order.Id}, function (inventories) {

            if (inventories.length > 0) {
                var inventory = inventories[0];

                // Ensure that we have the latest inventory
                for (var i in inventories) {
                    if (inventories[i]._at > inventory._at) {
                        inventory = inventories[i];
                    }
                }

                // Putting this back in here
                if (inventory.Reason_for_no_Inventory_count__c !== '') {
                    inventory.Status__c = "No Inventory Counted";
                } else {
                    inventory.Status__c = "Complete";
                }

                _log.d("Sending inventory with status: " + inventory.Status__c);

                _order.addInventoryToQueue(inventory, _order.customerID);

                _log.d("Saving inventory");

                _model.set("inventory", inventory, function (inventory) {

                    /* if (_order.pricingBuffer != '') {

                        // TODO: Test this when we do live pricing
                        _order.currRecord.Live_Price__c = _order.pricingBuffer;

                    } */

                    _log.d("Saving order");

                    _model.set("orders", _order.currRecord, function (order) {

                        _log.d("Sending order: " + order.Order_Status__c);

                        _order.addOrderToQueue(order, _order.customerID);

                        //UPDATE ROUTES


                        _keypad.killNumpad(function () {
                            _log.d("Keypad go bye bye");
                            $("#orderconfirmText").show();
                            $("#orderconfirmLoader").hide();
                            _order.canExitGracefully = true;
                            //LOAD CUSTOMER VIEW
                            layout.sendMessage('customer', {CustomerId__c: _order.customerID, Id: _order.Id});
                        });



                    });

                });

            }

        });

    },


    hasQuantity : function(model, cb) {


    //  _log.d("HASQUANTITY CALLED FOR "+JSON.stringify(model));


      var records = model.Order_Items__r.records;


      for(var i in records)
      {
            //SHAHID : 2015/05/18 Need to check if it has been accepted too, as it could be a suggested order item
          if((records[i].OrderQty__c > 0) && (records[i].isSuggested == false))
          {
            cb(true);
            return;
          }


      }

      cb(false);



    },


    // This is specific functionality that was requested by the customer.
    checkForDuplicates: function (model, cb) {

        _model.get("orders", {Customer__c: _order.Id}, function (orders) {

            _log.d('_order.checkForDuplicates - There are ' + orders.length + ' orders');

            for (var i in orders) {
                _log.d("Found order object with Id : " + orders[i].Id);
            }


            if (orders.length == 0) {

                _log.d("There are no orders for the customer yet");
                cb(false);
                return;

            } else {

                if (model.Order_Items__r.records.length == 0) {

                    _log.d("No order items counts as not a comparable");

                    cb(false);
                    return;

                }


                // Got through the orders and compare the line items.
                for (var o in orders) {



                    // Don't compare if this is just a saved version of the same order.
                    if (orders[o].Id != model.Id) {

                        _log.d("CHECKING IF MAP MATCHES ORDER " + orders[o].Id);

                        if (_order.findMatch(orders[o], model)) {

                            cb(true)
                            return;

                        }


                    }

                }

                // No matches were found, we can return false
                cb(false);
                return;


            }

        });

    },


    findMatch: function (o1, o2) {

        for (var i1 in o1.Order_Items__r.records) {

            for (var i2 in o2.Order_Items__r.records) {

                if (o1.Order_Items__r.records[i1].ProductId__c == o2.Order_Items__r.records[i2].ProductId__c) {

                    _log.d("ORDER FINDMATCH -> DOES "+o1.Order_Items__r.records[i1].OrderQty__c + " != "+ o2.Order_Items__r.records[i2].OrderQty__c);

                    if (o1.Order_Items__r.records[i1].OrderQty__c != o2.Order_Items__r.records[i2].OrderQty__c) {

                        // Items mismatch, this is not a duplicate.
                        return false;

                    }

                }

            }

        }

        return true;

    },


    getModel: function (Id) {


        _log.d("order.getModel for: " + Id);

        _model.get("orders", {"Customer__c": Id}, function (orders) {

            if (orders.length === 0) {

              _log.d("HEADER DOES NOT EXISTS --> NEW ITEM ");


                _log.d("No orders found");

                _order.outOfSequence = true;
                _order.isAdditional = true;

                _order.handleNewOrderItem(null, function (resultModel) {

                  _order.logTime('GETMODEL 3');


                    _order.showOrder(resultModel);

                });


            } else {

                var order = orders[orders.length - 1];

                if (order.Order_Status__c == 'Finalized' || order.Order_Status__c == 'No Order') {

                    _log.d("HEADER EXISTS BUT IS FINALIZED --> CLONING ");

                    _order.isAdditional = true;
                    //SHAHID: Treat as a new order item to get around SF concatenation on sync
                    /*_order.handleNewOrderItem(null, function (resultModel) {

                        _order.showOrder(resultModel);

                    });*/


                    //CLONE THE ORDERHEADER AND ORDER ITEMS OF THE FIRST ORDER...
                    _order.cloneOrder(
                        order,
                        function (clonedModel) {



                          // _log.d("CLONED MODEL IS : "+JSON.stringify(clonedModel));

                            _order.isAdditional = true;
                            _order.mergeOrder(clonedModel, function(mergedModel) {
                                mergedModel.Purchase_Order_No__c = '';
                                mergedModel.Live_Price__c = '';
                                _order.showOrder(mergedModel, true);
                            });
                        },
                        orders.length // The amount of order objects.
                    );



                } else {

                   _log.d("HEADER EXISTS AND IS NOT FINALIZED --> CHECKING ITEMS ");

                    _log.d("ITEMS ARE : " + JSON.stringify(order.Order_Items__r));

                    if (order.Order_Items__r) {
                        if (order.Order_Items__r.records.length > 0) {

                            _log.d("HEADER EXISTS AND IS NOT FINALIZED AND HAS ITEMS --> SHOWING ");

                            _order.showOrder(order, true);

                        }
                        else {

                            _log.d("HEADER EXISTS AND HAS NO ITEMS --> SHOWING ");

                            _order.outOfSequence = true;
                            _order.isAdditional = true;
                            _order.handleNewOrderItem(orders, function (resultModel) {

                                _order.showOrder(resultModel);

                            });

                        }
                    } else {
                        _log.d("HEADER EXISTS AND HAS NO ITEMS --> SHOWING ");

                        _order.outOfSequence = true;
                        _order.isAdditional = true;
                        _order.handleNewOrderItem(orders, function (resultModel) {

                            _order.showOrder(resultModel);

                        });
                    }

                }

            }

        });

    },


    handleNewOrderItem: function (partialObj, cb) {

        _log.d("_order.handleNewOrderItem");

        var newOrder = false;

        if (partialObj == null) {

            _log.d("No partial Object, creating one..")

            newOrder = true;

            partialObj = {
                Id: (new Date().getTime()) + "",
                ScheduledDeliveryDate__c: moment(_order.calOptions.defaultDate).format("YYYY-MM-DD"), // needs to be next avail date as per scheduled... was prev _util.getDate()
                Reason_for_no_Inventory_count__c: null,
                Planner_Message__c: "",
                Order_Items__r: null,
                Customer__c: _order.Id,
                Order_Status__c: "Out Of Sequence",
                Order_Qty__c: 0
            };

            _log.d("Creating a new partial order");


        }
        else if (typeof partialObj[0] != 'undefined') {
            partialObj = partialObj[0];

            _log.d("Use an existing partial order");
        }

        //add order number..
        if (partialObj.Id == "") {

            var orderNumber = new Date().getTime();
            partialObj.Id = orderNumber;
            partialObj.key = orderNumber;

        }
        else {
            var orderNumber = partialObj.Id;
            partialObj.key = orderNumber;

        }

        var today = new Date();
        partialObj.dayAdded = today.getDate();

        _order.generatedOrderNumber = orderNumber;

        _log.d("Getting products");

        _model.getAll("products", function (products) {

            _log.d("Got products: " + products.length);

            partialObj.Order_Items__r = {records: []};

            //productModel = pModel.records;
            dummyID = new Date().getTime();


            _log.d("Adding products to partial order");

            for (var p = 0; p < products.length; p++) {

                var newOrdItem =
                {
                    Id: (dummyID++) + "_",
                    OrderQty__c: "",
                    ProductId__c: products[p].Id,
                    SKU: products[p].ProductId__c,
                    Product_Name__c: products[p].LongDescription__c,
                    Discount__c: "0",
                    Product_Group__c: ( (products[p].ProductGroup__r == null) ? '' : products[p].ProductGroup__r.Name),
                    Name: "OrdIt-" + p,  //because everything needs a name... and... used as identifier for function qtyChanged
                    Previous_Inventory__c: 0,
                    Previous_Delivery__c: 0,
                    Previous_Order__c: 0,
                    On_Promo__c: "N",
                    Is_Strategic_Pack__c: false,
                    Product_on_Hold__c: false,
                    New_Product__c: "N",
                    OrderNumber__c: _order.generatedOrderNumber,
                    isSuggested: false,
                    NetValue__c: products[p].Base_Price__c // Shahid : Needs to be present in additional as well


                };

                newOrdItem.key = newOrdItem.Id;

                partialObj.Order_Items__r.records.push(newOrdItem);

            }

            //TODO: is this something we want?, can't we just use what we pass back, instead of putting this here.
            _order.generatedOrderItemCache = partialObj.Order_Items__r.records;

            // Save all the data to orders in one go...
            _model.set("orders", partialObj, function (order) {

                _log.d("Finished partial order, with order items added: " + order.Order_Items__r.records.length);

                cb(order);

            })

        });

    },


    //TODO: Once this has been tested a bit, clean out all the commented out chunks.

    cloneOrder: function (order, cb, orderCount) {

        _log.d("_order.cloneOrder");

        if (typeof orderCount == 'undefined' || orderCount < 1) {
            orderCount = 1
        } // Init


        //clone the header...
        var newOrder = $.extend(true, {}, order);
        newOrder.Order_Items__r.records = [];

        //change order number + id
        var orderID = order.Id + '_';
        newOrder.Id = orderID;
        newOrder.key = newOrder.Id;
        newOrder.Order_Status__c = 'Additional';
        newOrder.Planner_Message__c = null;
        newOrder.Live_Price__c = null;
        newOrder.Purchase_Order_No__c = "";


        _log.d("==============================================================================================");
        _log.d("CLONED ORDER WITH ID " + newOrder.Id);
        _log.d("==============================================================================================");

        if (order.Order_Items__r.records.length == 0) {
            _model.getAll("products", function (products) {

                var dummyID = new Date().getTime();

                for (var p = 0; p < products.length; p++) {

                    var newOrdItem =
                    {
                        Id: (dummyID++) + "_newOrder",
                        OrderQty__c: 0,
                        Quantity__c: 0,
                        ProductId__c: product[p].Id,
                        Product_Name__c: product[p].LongDescription__c,
                        Discount__c: 0,
                        Product_Group__c: ( (product[p].ProductGroup__r == null) ? '' : produc[p].ProductGroup__r.Name),
                        Name: "OrdIt-" + p,  //because everything needs a name... and... used as identifier for function qtyChanged
                        Previous_Inventory__c: 0,
                        Previous_Delivery__c: 0,
                        Previous_Order__c: 0,
                        On_Promo__c: "N",
                        Is_Strategic_Pack__c: false,
                        Product_on_Hold__c: false,
                        New_Product__c: "N",
                        OrderNumber__c: orderID,
                        isSuggested: false


                    };

                    newOrdItem.key = newOrdItem.Id;

                    newOrder.Order_Items__r.records.push(newOrdItem);

                }

                cb(newOrder);

            });


        }
        else {
            var orderItems = $.extend(true, {}, order.Order_Items__r.records);

            dummyID = new Date().getTime();

            for (var item in orderItems) {

                //update the id / key to be unique
                orderItems[item].Id = ( orderItems[item].Id === '' ) ? (dummyID++) + "" : orderItems[item].Id + "_";


                orderItems[item].key = orderItems[item].Id;

                orderItems[item].OrderQty__c = 0;
                orderItems[item].Quantity__c = 0;
                orderItems[item].OrderNumber__c = orderID;

                _log.d("ITEM IS IS : " + orderItems[item].Id+' ( '+orderItems[item].OrderQty__c+' / '+orderItems[item].Quantity__c+')');



                newOrder.Order_Items__r.records.push(orderItems[item]);


            }

          //  _log.d("ORDER CLONED AS : " + JSON.stringify(newOrder));
            cb(newOrder);

        }

    },



    showOrder: function (order, forceGrouping) {

        if(typeof forceGrouping == 'undefined')
        {
          forceGrouping = false;
        }

        _log.d("ORDER.SHOWORDER :");

        _log.d("ORDER IS BEFORE INV "+JSON.stringify(order));



            _log.d("ORDER.SHOWORDER -> LOADING INVENTORY");

            _order.loadInventory(order, function (order) {


              _log.d("ORDER.SHOWORDER -> ORDER LOADED -> SHOWING");


                 order.orderFilter = "";

                   _log.d("ORDER IS AFTER INV "+JSON.stringify(order));


                 //ADD SKUS...
                 for (var o in order.Order_Items__r.records)
                 {
                    var curr = order.Order_Items__r.records[o];
                  //  _log.d("CURR SKU IS "+JSON.stringify(curr.Product__r.ProductId__c));

                    if(curr.SKU) { break; }
                    else
                    {
                      if(curr.ProductId__r && curr.ProductId__r.ProductId__c)
                      {
                        _log.d("SETTING SKU "+curr.ProductId__r.ProductId__c);
                        curr.SKU = curr.ProductId__r.ProductId__c;
                      }
                      else
                      {
                        curr.SKU = '';
                      }
                    }

                 }

                 _log.d("GROUPING");

                _order.groupItems(order, forceGrouping );


                 _log.d("SHOWING ORDER");


                _order.currRecord = order;


                layout.attach('#orderFront', true);

                setTimeout(function() {


                  _cardEngine.switchTab( $('#orderFront__FACE').find('.tabSetTab')[0], 'order' );
                  _order.lockCB('release');



                }, 1000);


                setTimeout(function() {
                    _log.d("Before keypad attach");
                    _keypad.buildFaceKeypad("orderFront");
                }, 500);

            });


    },

    loadInventory: function (order, cb) {

        _log.d("ORDER.LOADINVENTORY --> GETTING CUSTOMER");

        _order.getCustomerForOrder(order, function (customer) {

          _log.d("ORDER.LOADINVENTORY --> CONFIGURING SUGGESTED ORDER RULES");


            var ruleApply   = customer.Disable_Suggested_Order_Rule__c;
            var ruleFactor  = customer.Suggested_Order_Rule__c;
            ruleApply       = (ruleApply == false) ? true : false;
            ruleFactor      = (ruleFactor == null) ? 0 : parseFloat(ruleFactor);


            _log.d("ORDER.LOADINVENTORY --> RULE APPLY IS  : " + ruleApply);
            _log.d("ORDER.LOADINVENTORY --> RULE FACTOR IS : " + ruleFactor);


          //  _log.d('STARTED =====> ' + ( new Date().getTime() ));

            _log.d("ORDER.LOADINVENTORY --> FETCHING INVENTORY FOR : " + _order.Id);


            _model.get("inventory", {Customer__c: _order.Id}, function (inventory) {

                _log.d("ORDER.LOADINVENTORY --> GOT " + inventory.length+ " INVENTORY RECORDS");

              //  _log.d(JSON.stringify(inventory));

                var invCount = inventory.length - 1 ;

              //  _log.d("Inspecting inventory: " + JSON.stringify(inventory[invCount].Inventory_Items__r));

                var inv = inventory[invCount].Inventory_Items__r.records;

                for (var o in order.Order_Items__r.records) {

                    _log.d("Checking order item: " + o);

                    var orderItem = order.Order_Items__r.records[o];
                    var pid = orderItem.ProductId__c;

                    orderItem.On_Promo__c = (orderItem.On_Promo__c == "Y" || orderItem.On_Promo__c === true) ? true : false;
                    orderItem.New_Product__c = (orderItem.New_Product__c == "Y") ? true : false;

                    //get the inventory for this
                    var qty = 0;

                    for (var i in inv) {

                        if (inv[i].Product__c == pid) {

                            qty = inv[i].Quantity__c;
                            break;

                        }

                    }

                    orderItem.Quantity__c = qty;
                    orderItem.isSuggested = ( orderItem.isSuggested == 'undefined' ) ? false : orderItem.isSuggested;

                    if (orderItem.OrderQty__c != 0 && !orderItem.isSuggested) {
                        continue;
                    }

                    // ONLY DO THE CALC IF THE VALUE IF THE QUANTITY HAS NOT ALREADY BEEN UPDATED..
                    if (ruleApply && ruleFactor != 0 && !_order.isAdditional) {
                        //DO CALC...
                        //( (PI + PD - INV) x 1.5 ) - INV = ORDER

                        var PI = (orderItem.Previous_Inventory__c == '') ? 0 : parseInt(orderItem.Previous_Inventory__c);
                        var PD = (orderItem.Previous_Delivery__c == '') ? 0 : parseInt(orderItem.Previous_Delivery__c);
                        var INV = (orderItem.Quantity__c == '') ? 0 : parseInt(orderItem.Quantity__c);

                        if (PI == 0 && PD == 0 && INV == 0) {
                            _log.d("SUGGESTED ORDER IS 0");

                            orderItem.OrderQty__c = "0";
                            orderItem.isSuggested = false;

                        }
                        else {

                            var ORDER = (  (PI + PD - INV) * ruleFactor ) - INV;
                            ORDER = (ORDER < 0) ? 0 : ORDER;
                            ORDER = Math.round(ORDER);

                            _log.d("SUGGESTED ORDER IS : (  (" + PI + " + " + PD + " - " + INV + ") * " + ruleFactor + " ) - " + INV + " = " + ORDER);
                            orderItem.OrderQty__c = ORDER;
                            if (ORDER != 0) {
                                orderItem.isSuggested = true;
                            } else {
                                orderItem.isSuggested = false;
                            }

                        }

                    }
                    else {

                        orderItem.isSuggested = false;
                        orderItem.OrderQty__c = "0";

                    }

                }

                _log.d('ENDED =====> ' + ( new Date().getTime() ));
                cb(order);

            }, function (err) {

                _log.d('F ENDED =====> ' + ( new Date().getTime() ));
                cb(order);

            });

        });

    },


    // This is not particularly efficient since we store entire routes as records, at least it doesn't
    // seem like the amount of data for routes gets too large, so for now we will just live with it.
    getCustomerForOrder: function (order, cb) {

        _log.d("_order.getCustomerForOrder")

        _model.getAll("routes", function (routes) {

            _log.d("Got routes: " + routes.length);

            for (var r in routes) {

                _log.d("Digging through route customers: " + routes[r].Customers__r.records.length);

                for (var c in routes[r].Customers__r.records) {

                    //_log.d("Checking customer: " + JSON.stringify(routes[r].Customers__r.records[c]));

                    //_log.d("Comparing: " + routes[r].Customers__r.records[c].Id + " to: " + _order.Id);

                    if (routes[r].Customers__r.records[c].Id == _order.Id) {

                      //  _log.d("Returning customer: " + JSON.stringify(routes[r].Customers__r.records[c]));

                        cb(routes[r].Customers__r.records[c]);
                        return;

                    }


                }

            }

        });

    },

    groupItems: function (record, force) {

        if(typeof force == 'undefined')
        {
           force = false;
        }

        _log.d("_order.groupItems");

        if(record.isGrouped && !force) {

          _log.d("_order.groupItems --> ALREADY GROUPED --> CONTINUING");
          return;

        }

        if (record.Order_Items__r && record.Order_Items__r.records /* && !record.isGrouped */ ) {

            _log.d("Records: " + record.Order_Items__r.records.length);

            record.groups = [];

            for (var r in record.Order_Items__r.records) {

                var rec = record.Order_Items__r.records[r];

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

                        showOnly: function () {

                          return  _order.showOnly(this.records);

                        },

                        showStrategic: function () {

                          return  _order.showStrategic(this.records);

                        },


                        showPromo: function () {

                          return _order.showPromo(this.records);

                        },


                        showAll: function () {


                          return _order.showAll(this.records);


                        }


                    }

                    record.groups.push(group);

                    _log.d("ADDED GROUP: " + rec.Product_Group__c);

                }

                // Push by reference should keep mapping intact on this object.
                group.records.push(rec);


            }

            record.isGrouped = true;

        }

    },


    showOnly: function (records) {

        var filter = _order.currRecord.orderFilter.toLowerCase();

        for (var r in records) {
            if ((records[r].OrderQty__c > 0) && (records[r].accepted)) {

                if (filter == "") return true;

                var productId = records[r].SKU.toLowerCase();
                var longDescription = records[r].Product_Name__c.toLowerCase();
                if (productId.indexOf(filter) > -1) return true;
                if (longDescription.indexOf(filter) > -1) return true;

            }
        }

        return false;

    },

    showStrategic: function (records) {

        var filter = _order.currRecord.orderFilter.toLowerCase();

        for (var r in records) {

            if (records[r].Is_Strategic_Pack__c) {

                if (filter == "") return true;

                var productId = records[r].SKU.toLowerCase();
                var longDescription = records[r].Product_Name__c.toLowerCase();
                if (productId.indexOf(filter) > -1) return true;
                if (longDescription.indexOf(filter) > -1) return true;

            }
        }

        return false;

    },

    showPromo: function (records) {

        var filter = _order.currRecord.orderFilter.toLowerCase();

        for (var r in records) {

            if (records[r].On_Promo__c == "Y") {

                if (filter == "") return true;

                var productId = records[r].SKU.toLowerCase();
                var longDescription = records[r].Product_Name__c.toLowerCase();
                if (productId.indexOf(filter) > -1) return true;
                if (longDescription.indexOf(filter) > -1) return true;

            }
        }

        return false;

    },


    showAll: function (records) {

        var filter = _order.currRecord.orderFilter.toLowerCase();
        if (filter == "") return true;

        //_log.d("filter: " + filter);

        for (var r in records) {

            var productId = records[r].SKU.toLowerCase();
            var longDescription = records[r].Product_Name__c.toLowerCase();
            if (productId.indexOf(filter) > -1) return true;
            if (longDescription.indexOf(filter) > -1) return true;

        }

        return false;

    },




    addInventoryToQueue: function (inventory, customerID) {

        _log.d("_order.addInventoryToQueue called for SAP customer : " + customerID);

        var date = inventory.Scheduled_Visit_Date__c;   // YYYY-MM-DD
        date = moment(date).format("DD/MM/YYYY");

        _log.d("Creating inventory object to send to apex");

        var invObj = {

            InventoryNumber: "1",
            SAP_CustomerId: customerID + "",
            SFDC_InventoryId: ((inventory.Id.indexOf('_') > -1) ? "" : inventory.Id),
            ScheduledVisitDate: date,
            InventoryStatus: inventory.Status__c,
            ReasonforNoInventoryCount: ((inventory.Reason_for_no_Inventory_count__c == null) ? "" : inventory.Reason_for_no_Inventory_count__c),
            LineItems: []

        }

      //  _log.d("Inventory object to send: " + JSON.stringify(invObj));

        var itemNumber = 1;

        if (invObj.ReasonforNoInventoryCount == "") {


            _log.d("There should be an inventory, so we are going to add line items.")

            _log.d("Creating from inventory data: " + JSON.stringify(inventory));

            for (var item in inventory.Inventory_Items__r.records) {

                var currItem = inventory.Inventory_Items__r.records[item];
                if (currItem.Quantity__c == 0) {
                    continue;
                }

                var apexItem = {
                    "InventoryNumber": invObj.InventoryNumber + "",
                    "InventoryItemName": itemNumber + "",
                    "SFDC_InventoryId": invObj.SFDC_InventoryId,
                    "SFDC_InventoryItemId": currItem.Id,
                    "OrderQty": currItem.Quantity__c + "",
                    "SAP_ProductId": currItem.Product__r.ProductId__c
                }

                _log.d("ADDING INVENTORY LINE ITEM : " + JSON.stringify(apexItem));

                invObj.LineItems.push(apexItem);

            }

        }

        _log.d("Sending inventory: " + JSON.stringify(invObj));

        var invList = {'lst_New_Inventory': [invObj]};

        var jobName = "Inventory Submission";
        var jobDesc = _customer.model.Name;
        var jobData = {action: 'submitInventory', data: invList};
        jobQueue.addJob(jobName, jobDesc, jobData, true, false, false);

        //TODO : Set INVENTORY STATUS TO COMPLETE AND SAVE
        //                if (lastStatus == "Complete" || lastStatus == "No Inventory Counted") {


        //TODO: handler for SubmitInventoryToSFDC

    },


    addOrderToQueue: function (order, customerID) {

        _log.d("_order.addOrder called for SAP customer : " + customerID + ", Order Id is: " + order.Id);

        //process date
        var date = order.ScheduledDeliveryDate__c;   // YYYY-MM-DD
        var date = moment(date).format("DD/MM/YYYY");

        var orderObj = {

            OrderNumber: "1",
            SAP_CustomerId: customerID + "",
            SFDC_OrderId: "",
            ScheduledDeliveryDate: date,
            PurchaseOrderNo: order.Purchase_Order_No__c,
            PlannerMessage: order.Planner_Message__c ? order.Planner_Message__c : "",
            OrderStatus: order.Order_Status__c,
            ReasonforNoOrder: order.Reason_For_No_Order__c,
            LineItems: []

        }

        _log.d("order object to send to apex: " + JSON.stringify(orderObj));

        if (typeof order.Id != 'undefined' && order.Id && order.Id.length == 18) {

            orderObj.SFDC_OrderId = order.Id;

        }

        // Paul - 2013-10-10:
        // Added unique transaction ID. User ID + time in milliseconds should be
        // pretty unique for an order.
        // NB! The web service won't allow you to send both. Either the Order ID
        // or the MobileOrderId must be sent. So for scheduled orders no MobileOrderId
        // should be sent.
        // Louis 0 2015-03-04
        // Change this to use the customerID instead, since we probably won't be doing different
        // orders at exactly the same time at the same customer.
        if (orderObj.SFDC_OrderId == "") {

            var tmp_date = new Date();
            orderObj.MobileOrderId = $.md5(customerID + tmp_date.getTime());

        }


        _log.d("Order item records");

        for (var item in order.Order_Items__r.records) {

            var currItem = order.Order_Items__r.records[item];
            if (currItem.OrderQty__c == 0 ||
                currItem.OrderQty__c == '00' ||
                typeof currItem.OrderQty__c == 'undefined' ||
                currItem.isSuggested == true) {
                continue;
            }


            var itemNumber = 1;
            var price = (currItem.NetValue__c == null || currItem.NetValue__c == '') ? 0 : currItem.NetValue__c;
            var discount = (currItem.Discount__c == null || currItem.Discount__c == '') ? 0 : currItem.Discount__c;

            _log.d("TRANSLATING ITEM : " + JSON.stringify(currItem));

            var apexItem = {
                "OrderNumber": orderObj.OrderNumber + "",
                "OrderItemName": itemNumber + "",
                "SFDC_OrderId": orderObj.SFDC_OrderId,
                "SFDC_OrderItemId": ( currItem.Id.indexOf('_') > -1 ) ? "" : currItem.Id,
                "OrderQty": currItem.OrderQty__c + "",
                "SAP_ProductId": currItem.SKU,
                "Net_Price": price + "",
                "Discount": discount + ""

            }

            _log.d("TRANSLETED TO : " + JSON.stringify(apexItem));

            orderObj.LineItems.push(apexItem);

        }

        _log.d("Adding order to queue : ");
        _log.d(JSON.stringify(orderObj));

        var ordList = {'lst_OrdHeaders': [orderObj]};

        var jobName = "Order Submission";
        var jobDesc = _customer.model.Name;
        var jobData = {action: 'submitOrder', data: ordList};
        jobQueue.addJob(jobName, jobDesc, jobData, true, false, false);

    },


    getOnlinePricing: function () {
        _log.d("_order.getOnlinePricing");

        //Iterate through order and check.

        if (client.connectionState != 2) { // Need to be connected all the way through to the BaseProvider

            _modal.show('warning', 'NOT ONLINE', 'Your device needs to be online in order to get pricing.');
            return;

        }

        var model = _order.currRecord;
        var check = false;
        for (var a in _order.currRecord.groups) {
            for (var b in _order.currRecord.groups[a].records) {
                if (_order.currRecord.groups[a].records[b].OrderQty__c > 0)  {
                    _log.d("RECORD : " + _order.currRecord.groups[a].records[b].OrderQty__c);
                    if (_order.currRecord.groups[a].records[b].accepted) {
                        check = true;
                    }
                }
                if (check) {
                    break;
                }
            }
        }
        if ((model.Order_Items__r.records.length > 0) && (check)) {
            _modal.show('warning', "ONLINE PRICING",
                "You are about to add the pricing request to your Job Queue. When the pricing request is done, it will be displayed on the order screen and alongside the particular customer on your routes list",
                true,
                function () {
                    _modal.hide();

                    // Create the mobile order id here, so we can map it back to this order on return from the pricing request

                    var now = new Date();
                    model.MobileOrderId = $.md5(_order.customerID + now.getTime());

                    _model.set("orders", model, function (order) {

                        _order.addOnlinePricing(order, _order.customerID);

                    });

                },
                function () {
                    _modal.hide();
                }
            );

        }
        else {

            _modal.show('warning', 'NO ORDER TAKEN', 'You need to order at least one item to get pricing.');

        }

    },


    addOnlinePricing: function (order, customerID) {

        _log.d("_order.addOnlinePricing " + JSON.stringify(order).substring(0, 2000) + "... FOR " + customerID);

        //proccess date
        var date = order.ScheduledDeliveryDate__c;   // YYYY-MM-DD
        date = moment(date).format("DD/MM/YYYY");

        var priceObj = {
            OrderNumber: "1",
            SAP_CustomerId: customerID + "",
            SFDC_OrderId: "",
            ScheduledDeliveryDate: date,
            MobileOrderId: order.MobileOrderId,
            OrderStatus: 'New',//obj.Order_Status__c;
            LineItems: []
        }

        // LDP - Just leaving these comments here, for future reference.
        // Paul - 2013-10-02: Night before go-live.
        //
        // These are commented out and OrderStatus set to New, because
        // on additional orders we accidentally pass "Additional" as order status
        // and the Salesforce web service defaults to... wait for it...
        // "Finalized" if it doesn't recognise the Order Status, which sends
        // it through to SAP as an additional order...
        //
        // Holy crap. FML.
        // curr.PurchaseOrderNo        = obj.Purchase_Order_No__c;
        // curr.PlannerMessage         = obj.Planner_Message__c;
        // curr.ReasonforNoOrder       = obj.Reason_For_No_Order__c;


        _log.d("Pricing object created: " + JSON.stringify(priceObj));

        var itemNumber = 1;

        for (var item in order.Order_Items__r.records) {

            var currItem = order.Order_Items__r.records[item];

            if (currItem.OrderQty__c == 0 ||
                currItem.OrderQty__c == '00' ||
                typeof currItem.OrderQty__c == 'undefined' ||
                currItem.isSuggested == true) {
                continue;
            }

            var price = (currItem.NetValue__c == null || currItem.NetValue__c == '') ? 0 : currItem.NetValue__c;
            var discount = (currItem.Discount__c == null || currItem.Discount__c == '') ? 0 : currItem.Discount__c;

            _log.d("TRANSLATING PRICING ITEM : " + JSON.stringify(currItem));

            var apexItem = {
                "OrderNumber": priceObj.OrderNumber + "",
                "OrderItemName": itemNumber,
                "SFDC_OrderId": priceObj.SFDC_OrderId,
                "SFDC_OrderItemId": "",
                "OrderQty": currItem.OrderQty__c + "",
                "SAP_ProductId": currItem.SKU,
                "Net_Price": price + "",
                "Discount": discount + ""

            }

            itemNumber++;

            _log.d("TRANSLATED PRICING ITME TO  : " + JSON.stringify(apexItem));

            priceObj.LineItems.push(apexItem);

        }

        _log.d("Sending pricing obj to queue: " + JSON.stringify(priceObj));

        var priceList = {'OrderHeader': priceObj};

        var jobName = "Pricing Request";
        var jobDesc = _customer.model.Name;
        var jobData = {action: 'submitOnlinePricing', data: priceList};


        jobQueue.addJob(jobName, jobDesc, jobData, true, false, false);

        // Subscribe to job queue update events, so we can handle online pricing requests...

        _order.priceMutationSubscriber = $.pubsub('subscribe', 'jobQueueUpdate', function (topic, data) {

            // status == BUSY|DELIVERED|DONE|FAILED

            var jobId = data.jobId;
            var jobStatus = data.status;

            _log.d("JOBQUEUE STATUS UPDATE : " + jobId + " / " + jobStatus);

            var jobData = jobQueue.jobs[jobId];

            if (jobData.jobStatus == "DONE" && jobData.data.action == "submitOnlinePricing") {

                _log.d("jobData is: " + JSON.stringify(jobData));

                var mobileId = jobData.data.data.OrderHeader.MobileOrderId;
                var price = jobData.result.res[0].Live_Price__c;

                _log.d("Pricing request returned for mobileId: " + mobileId + " ,and order price : " + price);

                if ((mobileId == _order.currRecord.MobileOrderId) && (!_order.navigatedAway)) {

                    //_order.currRecord.Live_Price__c = price;
                    _order.currRecord.Live_Price__c = parseFloat(price).toFixed(2);


                    //alert("Hey that is the current order, but of course we don't know if this screen is showing so remember to save it anyway");
                    $.pubsub('unsubscribe', _order.priceMutationSubscriber);
                    _model.set("orders", _order.currRecord, function (order) {

                        layout.attach('#orderFront');

                    });


                } else {
                    //_model.get("orders", {MobileOrderId: mobileId}, function (order) {
                    var retVal = true;
                    _model.getAll("orders", function (order) {
                        for (var i in order) {
                            _log.d("Order[i] : " + JSON.stringify(order[i]));
                            if(order[i].MobileOrderId) {
                                if(order[i].MobileOrderId == mobileId) {
                                    order[i].Live_Price__c = parseFloat(price).toFixed(2);;

                                    _model.set("orders", order[i], function (orderObj) {
                                        _log.d("Saved order for incoming pricing request: " + mobileId);
                                        _log.d("Order.Customer__c : " + orderObj.Customer__c);
                                        _model.get("accounts", orderObj.Customer__c, function (account) {

                                            _log.d("Found account so we can notify user of incoming pricing request");
                                            _modal.show(
                                                'warning',
                                                'ONLINE PRICE REQUEST',
                                                'Your online pricing request has been received for customer: ' + account.Name + ' as ' + orderObj.Live_Price__c,
                                                false,
                                                function () {
                                                    _modal.hide();
                                                });
                                            $.pubsub('unsubscribe', _order.priceMutationSubscriber);

                                        });

                                    });
                                }
                            }
                        }
                    });

                }

            }

        });


    },


    NoOrderCtrl: function ($scope) {

        _log.d("_order.NoOrderCtrl: " + _order.noOrderReasons.length);

        $scope.noOrderReasons = _order.noOrderReasons;
        $scope.customerName = _customer.model.Name;

        $scope.selectReason = function (reason) {

            _log.d("Setting no order with reason: " + reason.Name);


            // _order.currRecord.Reason_For_No_Order__c = reason.Id;
            if(!_order.reasonSubmitted) {
                _order.reasonSubmitted = true;
                _order.confirmOrder(false, reason.Name);
            }
/*
            _model.set("order", _order.currRecord, function(order) {

                layout.sendMessage("customer", { CustomerId__c : _inventory.customerID , Id: _inventory.Id } );

             });
*/

        }

    },
    orderHistoryCtrl : function($scope) {
        $scope.history = _order.orderHistory;
    },
    loadPromotionInfo : function (Customer_Id__c) {
        var returnObj = [];
        _model.getAll("promotions", function(promoObj){
            for(var a in promoObj) {
                if (promoObj[a].Pricing__r) {
                    for (var b in promoObj[a].Pricing__r.records) {
                        if(promoObj[a].Pricing__r.records[b].Customer_Id__c == Customer_Id__c) {
                            returnObj.push(promoObj[a].Pricing__r.records[b]);
                        }
                    }
                }
            }
        });
        _order.promotionDetails = returnObj;
    },
    loadPromotionItem : function(Product_Id__c) {
        _order.promotionItem = [];
        for (var a in _order.promotionDetails) {
            if(_order.promotionDetails[a].Product_Id__c == Product_Id__c) {
                _order.promotionItem =  _order.promotionDetails[a];
            }
            if(_order.promotionItem.length > 0) {
                break;
            }
        }
        _log.d("Keypad go bye bye");
        _cardEngine.flip("order", "orderPromotion");
        layout.attach('#orderPromotion');
    },
    repositionScroll : function () {
        _.currScrolls[0].scrollToElement($(_order.mypos.currentTarget)[0]);
    },
    mergeOrder : function (orderObj, cb) {
        /*  SHAHID : TODO TEST LOGIC ON SUGGESTED VS STRATEGIC SYNC SITUATION
        _log.d("Getting products");

        _model.getAll("products", function (products) {

            _log.d("Got products: " + products.length);

            //productModel = pModel.records;
            dummyID = new Date().getTime();

            _log.d("Adding products to current order");

            for (var p = 0; p < products.length; p++) {

                var newOrdItem =
                {
                    Id: (dummyID++) + "_",
                    OrderQty__c: "",
                    ProductId__c: products[p].Id,
                    SKU: products[p].ProductId__c,
                    Product_Name__c: products[p].LongDescription__c,
                    Discount__c: "0",
                    Product_Group__c: ( (products[p].ProductGroup__r == null) ? '' : products[p].ProductGroup__r.Name),
                    Name: "OrdIt-" + p,  //because everything needs a name... and... used as identifier for function qtyChanged
                    Previous_Inventory__c: 0,
                    Previous_Delivery__c: 0,
                    Previous_Order__c: 0,
                    On_Promo__c: "N",
                    Is_Strategic_Pack__c: false,
                    Product_on_Hold__c: false,
                    New_Product__c: "N",
                    OrderNumber__c: _order.generatedOrderNumber,
                    isSuggested: false,
                    Base_Price__c: products[p].Base_Price__c // Shahid : Needs to be present in additional as well


                };

                newOrdItem.key = newOrdItem.Id;

                orderObj.Order_Items__r.records.push(newOrdItem);

            }

            // Save all the data to orders in one go...
            _model.set("orders", orderObj, function (order) {

                _log.d("Finished additional order, with order items added: " + order.Order_Items__r.records.length);

                cb(order);

            });
        });*/
        cb(orderObj);
    },
    finalize : function () {
        //Before we check show the loader
        //layout.showLoader(); // not this one.  it breaks everything...

        $("#finaliseText").hide();
        $("#finaliseLoader").show();

        _order.checkForDuplicates(_order.currRecord, function (hasDuplicate) {

            if (hasDuplicate) {

                // As in the old code this doesn't do anything, it just pops up the modal but no action is taken

                _modal.show(
                    'warning',
                    'DUPLICATE ORDER',
                    'You have already placed an identical order for this customer today',
                    true,
                    function () {
                        _modal.hide();

                        _order.continueFinalize();

                    },
                    function () {

                      $("#finaliseText").show();
                      $("#finaliseLoader").hide();

                        _modal.hide();
                    }
                );

            }
            else
            {

                _order.continueFinalize();

            }



        });

    },

    continueFinalize : function() {


      _keypad.hide();
      //CHECK IF ANYTHING IS ORDERED
      _order.hasQuantity(_order.currRecord, function (hasQuantity) {

          _log.d("ORDER HAS QUANTITY : "+hasQuantity);

          if(hasQuantity)
          {

              //_cardEngine.flip("order", "orderFinalize");
              _cardEngine.flip("order", "orderFinalize", function(release) {
                  release();
                  layout.attach('#orderFinalize');
                  _order.continueFinalize = true;
              });

          }
          else
          {

              //_cardEngine.flip("order", "noOrder");
              //layout.attach('#orderFinalize');
              _cardEngine.flip("order", "noOrder", function(release) {
                  release();
              });
          }
          _order.finaliseLoader = false;
          $("#finaliseText").show();
          $("#finaliseLoader").hide();
      });



    }
};
;

;;

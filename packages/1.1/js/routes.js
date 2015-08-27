_routes = {

    model: null,
    noVisitReasons: null,
    currCustomerId: '',
    currId: '',
    currInv: '',
    currOrder: '',
    currEquip: '',
    accounts:'',
    noVisitReason: '',
    noInventoryReasons: null,
    todaysCustomers: [],
    dayfunction: "END DAY",
    navigatedAway : false,
    flippedAway : false,


    onExit : function(view, state) { var _ = this;


          if(state == 'fg') {
              _routes.model = null;
              _routes.todaysCustomers = [];
              _routes.noVisitReasons = null;
              _routes.noInventoryReasons = null;
              _routes.navigatedAway = true;
          }






    },

    onLoaded: function (view, card, lock) { var _ = this;


        lock('lock');



        _routes.navigatedAway = false;
        _routes.flippedAway = false;
        _routes.visitCount = {};

       $("#routesFront__FACE ul.collapseme").unbind("closed");
       $("#routesFront__FACE ul.collapseme").unbind("opened");

        var d = new Date();
        var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        var n = d.getDay(); //Sunday is 0, Monday is 1, and so on.
        var today = days[n];
        _routes.today = today;


        _model.getAll("routes", function (routes) {
            _routes.model = routes;

      /*
            for (var i = 0; i < data.length; i++) {
                var route = data[i].Customers__r.records;
                for (var j = 0; j < route.length; j++) {
                    //_routes.model[i].Customers__r.records[j].Name = route[j].Name.replace(/'/g, "\\'");
                    _routes.model[i].Customers__r.records[j].Name = route[j].Name.substring(route[j].Name.indexOf("-") + 1);
                    _routes.model[i].Customers__r.records[j].casesTotal = 0;
                    _routes.model[i].Customers__r.records[j].orderTotal = 0;
                }

            }
*/


            _model.getAll("noVisitReasons", function (noVisitReasons) {
                _routes.noVisitReasons = noVisitReasons;
                if (_routes.flippedAway === false) {
                    layout.attach("#routesFront");
                }



                setTimeout(function() {
                var cnt = 0;

                $('#routesFront__FACE').find('.tabSetTab').each(function() {
                      _log.d("FINDING TODAY "+cnt+" == "+(n-1));
                    n = d.getDay(); //Sunday is 0, Monday is 1, and so on.
                    if( cnt == (n-1)) {

                      _log.d("TRIGGERING "+$(this).html());

                        _cardEngine.switchTab($(this)[0], 'routes', 'routesFront__FACE', _routes.onTabChange);

                        if (_routes.flippedAway === false) {
                            layout.attach("#routesFront");


                        }

                       }
                    cnt++;

                });
              }, 200);





                lock('release');



              }, 500);
            });







    },

    onTabChange : function(name)
    {
        _log.d("ROUTE TAB CHANGE "+name);


          //routes_day_template_monday
          var day = name.split('_');
              day = _util.ucFirst(day[day.length-1]);


          _log.d("ROUTE TAB DAY IS "+day);


          _routes.routeIdxVisitStatuses = 0;
          _routes.routeIdxCaseTotals    = 0;


          _routes.currRoutes = _routes.model;

          _routes.calcVisitStatuses();




    },

    currRouteIdx : 0,
    currRoutes   : {},
    calcVisitStatuses : function() { var _ = this;

          var routes    = _.currRoutes;
          var route     = routes[_.currRouteIdx].Customers__r.records;
          var routeName = routes[_.currRouteIdx].RouteId__c;

          _log.d("PROCESSING ROUTE "+routeName+" WITH "+route.length+" RECORDS");
/*
          for(var c in route)
          {
             _log.d(routeName+" ==> "+route[c].Id+" ==> ORDERTOTAL "+route[c].orderTotal+" / CASESTOTAL "+route[c].casesTotal+" / LIVEPRICE "+route[c].Live_Price__c);
          }
*/
                  if(typeof _routes.visitCount[routeName] == 'undefined')
                  {
                    _routes.visitCount[routeName] = 0;
                  }
                  else
                  {
                    _routes.visitCount[routeName] = 0;
                  }

          _.routeIdxVisitStatuses = 0;
          _routes.loadVisitStatuses( route, routeName, function() {

            _routes.currRouteIdx++;

            if(typeof _routes.currRoutes[_routes.currRouteIdx] == 'undefined')
            {
              _routes.currRouteIdx = 0;
              _routes.currRoutes   = null;
              if (!_routes.flippedAway) {
                  layout.attach("#routesFront");
              }

              _log.d("VISIT PROCESSING DONE : ");
              console.log(_routes.visitCount);

              return;

            }
            else
            {
              _routes.calcVisitStatuses();
            }


          });
        //  if(_routes.today !== dat) { _routes.loadCaseTotals( route, day ); }
        //  _routes.model[i].routeready = true;



    },

    routeIdxVisitStatuses : 0,
    visitCount : {},
    currRouteCB : null,
    loadVisitStatuses : function(route, routeName, cb) { var _ = this;


        _.currRouteCB = cb;

        if(_routes.navigatedAway) {
            _log.d("Stopping Route Processing!");
            return;
        }

        var cust = null;
        if( typeof route[_.routeIdxVisitStatuses] == 'undefined') {
            _.routeIdxVisitStatuses = 0;
            _.currRouteCB();
            return;

        }
        else { cust = route[_.routeIdxVisitStatuses];  }





        //  _log.d(" loadVisitStatuses FOR CUSTOMER "+cust.CustomerId__c);

        _model.get("salesVisits", {
            "CustomerId__c": cust.CustomerId__c
        }, function(visit) {



            visit = visit[0];
            if (typeof visit.Sales_Visits__r != 'undefined' && visit.Sales_Visits__r !== null && typeof visit.Sales_Visits__r.records != 'undefined')
            {
                var _visit = visit.Sales_Visits__r.records[ visit.Sales_Visits__r.records.length - 1  ];
                var _status =  _visit.Status__c;

                _status = ( _status == "New" )  ? "Not Started"        : _status;
                _status = ( _status == "Open" ) ? "Started"            : _status;
                _status = ( _status == "No Visit" ) ? "No Visit"       : _status;
                _status = ( _status == "Completed" ) ? "Completed"     : _status;

                if(_status == "Started" || _status == "Completed" || _status == "No Visit")
                {
                   cust.visitTime = moment(_visit.Visit_Start_Time__c).fromNow();
                }

                cust.visitStatus = _status;

                //DONT COUNT OUT OF SEQUENCE
                if(_visit.Id.indexOf('visit-') == -1)
                {
                 _routes.visitCount[routeName] += 1;
                }




            }
            else
            {
                cust.visitStatus = "Not Started";
            }

          //  _log.d(" CUSTOMER "+cust.CustomerId__c+" VISIT STATUS IS "+cust.visitStatus);



            visit = null;

            _.routeIdxVisitStatuses++;
            _.loadVisitStatuses(route, routeName, _routes.currRouteCB);

        });
    },





    routeIdxCaseTotals : 0,
    loadCaseTotals : function(route, day) { var _ = this;


      _log.d("LOADING ORDER TOTALS ON ROUTE FOR DAY "+day+" - IDX ON "+_.routeIdxCaseTotals);

      if(_.navigatedAway) {  return;  }




      if( _.routeIdxCaseTotals >= route.length)
      {
        _log.d("ORDER STATUSES DONE");

        if (_routes.flippedAway === false) {
            layout.attach("#routesFront");
        }
        return;
      }

      for(var r = _.routeIdxCaseTotals; r < route.length; r++)
      {
        // _log.d(" VISIT TOTAL ROUTE DAY IS ("+ (day+'__c') +") - ("+r+" / "+route.length+") "+route[r][ day+'__c' ]);
         if(route[r][ day+'__c' ] || route[r][  day+'__c' ] == 'true' )
         {
           _.routeIdxCaseTotals = r;
          // _log.d("   =======> GOT CUSTOMER FOR  ("+ (day+'__c') +") - ("+r+" / "+route.length+") "+route[r][ day+'__c' ]);
           cust = route[ _.routeIdxCaseTotals ];
           break;
         }
      }


      _log.d(" FETCHING ORDERS FOR "+cust.CustomerId__c+" / "+cust.Id);

    _model.get("orders", {Customer__c: cust.Id}, function (orders) {


      _log.d(" GOT "+orders.length+" ORDERS FOR "+cust.CustomerId__c+" / "+cust.Id);


      var _total = 0;
          var _orders = 0;
          for(var o in orders)
          {
              if(orders[o].Order_Status__c == 'Finalized')
               {
                  _orders++;

                //  try
                //  {
                   if(
                     typeof orders[o].Order_Items__r == 'undefined' ||
                     orders[o].Order_Items__r === null ||
                     typeof orders[o].Order_Items__r.records == 'undefined' ||
                     orders[o].Order_Items__r.records === null ||
                     orders[o].Order_Items__r.records.length === 0
                     )
                     {
                      continue;
                     }

                      var _curr = orders[o].Order_Items__r.records;


                      for(var i in _curr )
                      {
                          _log.d("ORDER SUGGESTED : " + _curr[i].isSuggested);
                          if(_curr[i].isSuggested === false || typeof _curr[i].isSuggested === 'undefined') {
                              _total += parseInt(_curr[i].OrderQty__c);
                          }
                      }


                //  }
                //  catch (e)
                //  {
                //      _log.d("COULD NOT PROCESS ORDER TOTALS FOR : "+cust.Id+" --> "+e);
                //  }



               }



          }
          if (orders.length > 0) {
              cust.Live_Price__c = orders[orders.length - 1].Live_Price__c;
          }

          cust.casesTotal = _total;
          cust.orderTotal = _orders;






        _.routeIdxCaseTotals++;
        _.loadCaseTotals(route, day);

    });











    },


    nav : function(elm) {

        var CustomerId__c = $(elm).closest('tr').attr('CustomerId__c');

        _model.get("accounts", {
            "CustomerId__c": CustomerId__c
        }, function(account) {

            var customer = account[0];
            var geo = customer.GPS_Coordinates__c;
            if(geo.indexOf(',') > -1)
            {
                geo = geo.split(',');
                var lat = geo[0];
                var lon = geo[1];

                _location.navigate(lat, lon, true);

            }

        });


    },


    onMessage : function() {

    },




    routesCtrl: function($scope) {

        _log.d("ROUTESCTRL");

        $scope.routes    = _routes.model;
        $scope.tabFooter = '';

        _log.d("ROUTES CTRL CALLED WITH "+$scope.routes.length+" ROUTES CONTAINING");
        for(var i in $scope.routes)
        {
           _log.d("    "+$scope.routes[i].RouteId__c+"  =====> "+$scope.routes[i].Customers__r.records.length+" CUSTOMERS");
        }

        _log.d("ROUTES CACHE = "+JSON.stringify($scope.routes));



        $scope.todayTitle = function(day) {

            if (day == _routes.today) {

                return "TODAY";

            } else  {

                return day;

            }

        };


        $scope.isToday = function(day) {

          var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
          var d = new Date();

          var n = d.getDay(); //Sunday is 0, Monday is 1, and so on.

        //  _log.d("IS TODAY : "+day+" / "+days.indexOf(day)+" / "+n);

          var i = false;
          if(days.indexOf(day) > -1)
          {
             i = days.indexOf(day);
             if(i == n) { return true; }

          }

          return false;





        };

        $scope.daysNotEmpty = {};

        $scope.totalcases = function (route, day) {
            var returnVal = 0;

            if(day == "all") {
                for (var a in route.Customers__r.records){
                    returnVal = returnVal + route.Customers__r.records[a].casesTotal;
                }
            } else {
                for (var a in route.Customers__r.records){


                    if(eval("route.Customers__r.records[a]."+day) && (typeof route.Customers__r.records[a].casesTotal != 'undefined') ) {

                      _log.d("CALCULATING TOTAL CASES : "+returnVal + " + " + route.Customers__r.records[a].casesTotal);

                        returnVal += route.Customers__r.records[a].casesTotal;
                    }
                }
            }



            return (!returnVal || returnVal === null) ? 0 : returnVal;
        };

        $scope.totalorders = function (route, day) {
            var returnVal = 0;
            if(day == "all") {
                for (var a in route.Customers__r.records){
                    returnVal = returnVal + route.Customers__r.records[a].orderTotal;
                }
            } else {
                for (var a in route.Customers__r.records){
                    if(eval("route.Customers__r.records[a]."+day) && (typeof route.Customers__r.records[a].orderTotal != 'undefined')) {
                        returnVal += route.Customers__r.records[a].orderTotal;
                    }
                }
            }
            return (!returnVal || returnVal === null) ? 0 : returnVal;
        };

        $scope.completed = function(route, day) {
            var returnVal = 0;
            if(day == "all") {
                for (var a in route.Customers__r.records){
                    if(route.Customers__r.records[a].visitStatus == "Complete") {
                        returnVal = returnVal + 1;
                    }
                }
            } else {
                for (var a in route.Customers__r.records){
                    if(eval("route.Customers__r.records[a]."+day)) {
                        if(route.Customers__r.records[a].visitStatus == "Complete") {
                            returnVal = returnVal + 1;
                        }
                    }
                }
            }
            return returnVal;
        };

        $scope.totalcustomers = function(route, day) {

            _log.d("DOES DAY "+day+" == "+_routes.today+"__c FOR ROUTE "+route.RouteId__c);


            var returnVal = 0;
            if(day == _routes.today+"__c")
            {
               _log.d("DAY FOUND");
              returnVal = typeof( _routes.visitCount[route.RouteId__c] != 'undefined' ) ? _routes.visitCount[route.RouteId__c] : 0;
            }

            return returnVal;
/*
            if(day == "all") {
                returnVal = route.Customers__r.records.length;
            } else {
                for (var a in route.Customers__r.records){
                    if(eval("route.Customers__r.records[a]."+day) && route.Customers__r.records[a].) {
                        returnVal = returnVal + 1;
                    }
                }
            }
            return returnVal;
            */
        };

        $scope.trackDay = function(route, day)
        {
            if(typeof route == 'undefined' || typeof day == 'undefined') { return; }

            if(typeof $scope.daysNotEmpty == 'undefined')
            {
               $scope.daysNotEmpty = {};
            }

            if(typeof $scope.daysNotEmpty[route] == 'undefined')
             {
               $scope.daysNotEmpty[route] = {};
             }

            $scope.daysNotEmpty[route][day] = true;

        };

        $scope.isEmpty = function(route, day) {

          if(typeof $scope.daysNotEmpty == 'undefined')
          {
             $scope.daysNotEmpty = {};
          }

            if(  typeof $scope.daysNotEmpty[route] == 'undefined' ||  typeof $scope.daysNotEmpty[route][day] == 'undefined' || !$scope.daysNotEmpty[route][day] )
            {
            //  _log.d("ISEMPTY "+route+" / "+day+" --> TRUE ");

              return true;
            }
            else
            {
              //_log.d("ISEMPTY "+route+" / "+day+" --> FALSE ");

              return false;
            }



        };




    },





    processRoutes: function(data, day) {
        // Processing of the model
        //Cleanup smelly names

        for (var i = 0; i < data.length; i++) {
            var route = data[i].Customers__r.records;
            _routes.loadVisitStatuses( route, day );
            _routes.loadCaseTotals( route, day );
            _routes.model[i].routeready = true;
        }
    },


    cases: function() {

    },


    loadCustomer : function(elm) {

        _log.d("LOAD CUSTOMER");
        _routes.navigatedAway = true;
        layout.showLoader();


        setTimeout(function() {

        var customer_id = $(elm).attr("CustomerId__c");
        var DeliveryBlockStatusCode__c = $(elm).attr("DeliveryBlockStatusCode__c");
        var OrderBlockStatusCode__c = $(elm).attr("OrderBlockStatusCode__c");
        var id = $(elm).attr("Id");
        layout.sendMessage('customer', { CustomerId__c : customer_id , Id: id, DeliveryBlockStatusCode__c : DeliveryBlockStatusCode__c, OrderBlockStatusCode__c : OrderBlockStatusCode__c } );


      }, 200);





    },


    routesEndOfDayCtrl: function($scope) {

        _log.d("routes.routesEndOfDayCtrl");
        $scope.noVisitReasons = _routes.noVisitReasons;


        _routes.todaysCustomers = [];
        // Build the list of customers for today.
        for (var r in _routes.model) {

            for (var c in _routes.model[r].Customers__r.records) {

                if ((_routes.model[r].Customers__r.records[c][_routes.today + "__c"]) && (_routes.model[r].Customers__r.records[c]["visitStatus"] != "Complete")) {
                    _routes.model[r].Customers__r.records[c].endmode = false;
                    _routes.model[r].Customers__r.records[c].noVisitReason = _routes.noVisitReasons[0].Name;
                    _routes.model[r].Customers__r.records[c].alignType = "w-2-16";
                    _routes.model[r].Customers__r.records[c].r = r;
                    _routes.model[r].Customers__r.records[c].c = c;
                    _routes.todaysCustomers.push(_routes.model[r].Customers__r.records[c]);

                } else if (_routes.model[r].Customers__r.records[c]["visitStatus"] == "Started") { //Cater for out of sequence
                    _routes.model[r].Customers__r.records[c].endmode = false;
                    _routes.model[r].Customers__r.records[c].noVisitReason = _routes.noVisitReasons[0].Name;
                    _routes.model[r].Customers__r.records[c].alignType = "w-2-16";
                    _routes.model[r].Customers__r.records[c].r = r;
                    _routes.model[r].Customers__r.records[c].c = c;
                    _routes.todaysCustomers.push(_routes.model[r].Customers__r.records[c]);
                } else if (_routes.model[r].Customers__r.records[c]["visitStatus"] == "Complete") { //Cater for No Visit
                    _routes.model[r].Customers__r.records[c].endmode = false;
                    _routes.model[r].Customers__r.records[c].noVisitReason = _routes.noVisitReasons[0].Name;
                    _routes.model[r].Customers__r.records[c].alignType = "w-5-16";
                    _routes.model[r].Customers__r.records[c].r = r;
                    _routes.model[r].Customers__r.records[c].c = c;
                    _routes.todaysCustomers.push(_routes.model[r].Customers__r.records[c]);
                }

            }

        }

        _log.d("There are " + _routes.todaysCustomers.length + " customer visits that must be completed today.");

        $scope.customers = _routes.todaysCustomers;

        $scope.selected = function (customer) {
            customer.endmode = true;
        }
        $scope.submitSingle = function (customer) {
            customer.endmode = false;
            customer.visitStatus = "Complete";
            customer.alignType = "w-5-16";
            _routes.endDay(customer, false, true);
        }
        $scope.checkCompleted = function (customer) {
            if ((customer.endmode != true) && (customer.visitStatus != "Complete") && (customer.visitStatus != "No Visit")) {
                return true;
            } else {
                return false;
            }
        }

        $scope.view = function (customer) {
            layout.sendMessage('customer', {CustomerId__c: customer.CustomerId__c, Id: customer.Id});
        }

        $scope.isOutOfSequence = function (customer) {
            if ((customer.visitStatus == "Started") && (!customer[_routes.today + "__c"])) {
                return true;
            } else {
                return false;
            }
        }
        $scope.dayfunction = _routes.dayfunction;
    },


    endDay: function (customer, flag, reload) {
        _scroll.add($("#scrollWrapper_endDay__FACE")[0]);
        if (!flag) {

            _log.d("STARTED ENDING DAY FOR : " + customer.Name);

            //Single endDay

            _log.d("STARTED ENDING TASKS");

            //TASKS

            var tasks = [];

            _model.get("tasks", {CustomerId__c: customer.CustomerId__c}, function (tasksResponse) {

                if (tasksResponse.length && tasksResponse.length > 0) {

                    _log.d("tasksResponse.length : " + tasksResponse.length);
                    if (tasksResponse[0].Tasks != null) {
                        tasks = tasksResponse[0].Tasks.records;
                    } else {
                        tasks = null;
                    }
                }

                var hasTasks = false;

                for(var task in tasks) {

                    _log.d("Got task with status: " + tasks[task].Status);

                    hasTasks = true;

                    var _task = tasks[task];

                    if(_task.Status.toLowerCase() == 'not started')
                    {

                        _log.d("PROCESSING TASK");

                        //send an empty task....
                        taskData =
                        {
                            SFDC_TaskId	   : _task.Id,
                            CustomerId     : customer.CustomerId__c,
                            TaskType	   : _task.RecordTypeId,
                            Subject		   : _task.Subject,
                            Status  	   : "No Visit",
                            Priority       : _task.Priority,
                            Brand          : _task.Brand__c,
                            SOVICompetitor : _task.SOVI_Competitor__c,
                            SOVI 		   : _task.SOVI_Forbes__c,
                            PackSize       : _task.Pack_size__c,
                            DueDate        : _task.ActivityDate,
                            CompetitorEquipment : _task.Competitor_Equipment__c,
                            Price               : _task.Pricing__c,
                            Comment             : _task.Description,
                            StockShortDated     : _task.Stock_short_dated__c,
                            StockExpired        : _task.Stock_expired__c,
                            CoolerCondition     : _task.Cooler_Condition__c,
                            SignageCondition    : _task.SignageCondition,
                            Allequipmentasperpictureofsuccess : _task.All_equipment_as_per_picture_of_success__c,
                            Iscoolermerchandisedasperplanogram : _task.Is_cooler_merchandised_as_per_planogram__c,
                            IsPOSasperlookofSuccess 		   : _task.Is_POS_as_per_look_of_Success__c,
                            Strategicpacksatrecommendedprice   : _task.Strategic_packs_at_recommended_price__c,
                            ResolutionComments                 : _task.Resolution_Comments__c,
                            IsyourOutletPromoCompliant         : _task.Is_your_Outlet_Promo_compliant__c,
                        }

                        _log.d("Sending task to jobqueue");

                        //send to SF
                        var taskData = [taskData];
                        var curr = {'lst_Task': taskData};
                        jobName = "Add Task";
                        jobDesc = customer.Name;
                        jobData = {action: 'submitTask', data: curr};
                        jobQueue.addJob(jobName, jobDesc, jobData, true, false, false);

                    }

                }

                _log.d("DONE ENDING TASKS");
                _log.d("STARTED SUBMITTING ORDERS");

                var orders = [];
                _model.get("orders", {Customer__c: customer.Id}, function (ordersResponse) {
                    if(ordersResponse !== null) {
                        for(var order in ordersResponse) {
                            if((ordersResponse[order].Order_Status__c != "Finalized") && (ordersResponse[order].Order_Status__c != "No Order")) {
                                ordersResponse[order].Order_Status__c = 'No Order';
                                ordersResponse[order].Reason_For_No_Order__c = customer.noVisitReason.Name;
                                _log.d("Saving order");
                                _model.set("orders", ordersResponse[order], function (orderset) {
                                    _log.d("Sending order");
                                    _customer.model.Name = customer.CustomerId__c + " - " + customer.Name;
                                    _order.addOrderToQueue(ordersResponse[order], customer.CustomerId__c);
                                });
                            }
                        }
                    } else {
                        _log.d("NO ORDERS FOUND");
                    }
                    _log.d("DONE SUBMITTING ORDERS");
                    _log.d("STARTED SUBMITTING INVENTORY");
                    var inventory = [];
                    _model.get("inventory", {Customer__c: customer.Id}, function (inventoryResponse) {
                        if(inventoryResponse != null) {
                            for(var item in inventoryResponse) {
                                if((inventoryResponse[item].Status__c != "Complete") && (inventoryResponse[item].Status__c != "No inventory Counted")) {
                                    inventoryResponse[item].Status__c = "No inventory Counted";
                                    inventoryResponse[item].Reason_for_no_Inventory_count__c = customer.noVisitReason.Name;
                                    _log.d("Saving inventory");
                                    _model.set("inventory", inventoryResponse[item], function (inventoryset) {
                                        _log.d("Sending inventory");
                                        //_customer.model.Name = customer.CustomerId__c + " - " + customer.Name;
                                        _order.addInventoryToQueue(inventoryResponse[item], customer.CustomerId__c);
                                    });
                                }
                            }
                        } else {
                            _log.d("NO INVENTORY FOUND");
                        }
                        _log.d("DONE SUBMITTING INVENTORY");
                        _log.d("STARTED SUBMITTING VISITS");

                        _model.get("salesVisits", {
                            "CustomerId__c": customer.CustomerId__c
                        }, function(visit) {
                            //TODO: check for undefined
                            visit = visit[0];

                            if (typeof visit.Sales_Visits__r != 'undefined' && visit.Sales_Visits__r !== null && typeof visit.Sales_Visits__r.records != 'undefined')
                            {
                                if(visit.Sales_Visits__r.records[0].Status__c == "Complete")
                                {
                                    return;
                                }
                            }

                            var lat = _location.currLat;
                            var lon = _location.currLon;

                            var _visit = {};

                            if (typeof visit.Sales_Visits__r != 'undefined' && visit.Sales_Visits__r !== null && typeof visit.Sales_Visits__r.records != 'undefined') {

                                //VISIT EXISTS
                                _visit = visit.Sales_Visits__r.records[0];

                            } else {
                                _log.d("NO VISIT RECORD FOUND!!! ");

                                _visit.Start_Visit_Long__c = lon;
                                _visit.Start_Visit_Latitude__c = lat;
                                _visit.Visit_Start_Time__c = moment().format('YYYY-MM-DD HH:mm:ss');
                            }
                            if(_visit.Start_Visit_Long__c == null) {
                                _visit.Start_Visit_Long__c = lon;
                                _visit.Start_Visit_Latitude__c = lat;
                                _visit.Visit_Start_Time__c = moment().format('YYYY-MM-DD HH:mm:ss');
                            }
                            if(_visit.CustomerId__c == null) {
                                _visit.CustomerId__c = customer.CustomerId__c;
                            }

                            _visit.End_Visit_Latitude__c = lat;
                            _visit.End_Visit_Longitude__c = lon;
                            _visit.End_Visit_Time__c = moment().format('YYYY-MM-DD HH:mm:ss');
                            _visit.Status__c = "Complete";
                            customer.visitStatus = "Complete";
                            visit.Sales_Visits__r.records[0] = _visit;
                            //SAVE THE DATA
                            _model.batch("salesVisits", [visit], function(visits) {
                                //var newvisit = visits[0].Sales_Visits__r.records[0];
                                var newvisit = visits[0];
                                var newdate = moment(newvisit.Scheduled_Visit_Date__c).format('DD/MM/YYYY');
                                var jobData = {
                                    "lst_ClientVisit": [{
                                        SFDC_ClientVisitId: newvisit.Sales_Visits__r.records[0].Id,
                                        CustomerId: customer.CustomerId__c,
                                        Start_Visit_Long: newvisit.Start_Visit_Long__c,
                                        Start_Visit_Latitude: newvisit.Start_Visit_Latitude__c,
                                        Scheduled_Visit_Date: newdate.replace("-", "/"),
                                        Visit_Start_Time: moment(newvisit.Visit_Start_Time__c).format('YYYY-MM-DD HH:mm:ss'),  //funny bug on the date coming from SF
                                        End_Visit_Latitude: newvisit.End_Visit_Latitude__c,
                                        End_Visit_Longitude: newvisit.End_Visit_Longitude__c,
                                        Status: "Complete",
                                        No_Visit_Reason: customer.noVisitReason.Name,
                                        End_Visit_Time : moment(newvisit.End_Visit_Time__c).format('YYYY-MM-DD HH:mm:ss'),
                                        Summary: ""
                                    }]
                                };

                                jobName = "End Visit";
                                jobDesc = customer.Name;;
                                jobData = {
                                    action: 'submitVisit',
                                    data: jobData
                                };
                                jobQueue.addJob(jobName, jobDesc, jobData, true, false, false);
                                _log.d("DONE SUBMITTING VISITS");
                                //_routes.model[customer.r].Customers__r.records[customer.c].Status__c = "No Visit";

                                _log.d("DONE ENDING DAY FOR : " + customer.Name);
                                if (reload) {
                                    for(var i in _routes.model)
                                    {
                                        var route = _routes.model[i].Customers__r.records;
                                        _routes.loadVisitStatuses( route );
                                    }
                                }
                            });
                        });
                    });
                });
            });
        } else {
            //REASON FOR NO VISIT MODAL
            xml = "<div id='modalScroll' style='height:250px; width: 60%; margin-left: 20%; margin-right: 20%;'>"
            + "<p id='noVisitReasonDescription'>Please select a reason below and tap OK to submit.</p><ul class='noVisitReason'>";
            for (var i in _routes.noVisitReasons) {
                xml += "<li><table style='border-bottom: 1px solid rgba(0,0,0,0.2); padding: 5px;'><tr style='color:#000;' onclick=\"_routes.changeReason(\'"+_routes.noVisitReasons[i].Name+"\', this);\"><td width='80%' class='reason'>" + _routes.noVisitReasons[i].Name + "</td><td class='gui-extra reasonGui' width='20%' align='right'>&#xf00d;</td></tr></table></li>";
            }
            xml + "</ul>"
            + "</div>";

            _modal.show('warning', 'REASON FOR NO VISIT', xml, true, function () {
                if (_routes.noVisitReason != "") {
                    _modal.hide();
                    for (var a in customer) {
                        _routes.endDay(customer[a],false, false);
                    }
                    for(var i in _routes.model)
                    {
                        var route = _routes.model[i].Customers__r.records;
                        _routes.loadVisitStatuses( route );
                        _routes.loadCaseTotals( route );
                    }
                    if (_routes.flippedAway == false) {
                        layout.attach("#routesFront");
                    }
                } else {
                    $('p#noVisitReasonDescription').css({color: '#aa2222'}).animate({
                        color: "#000000"
                    }, 1500 );
                }
            }, function () {
                _log.d("ERROR");
                _routes.noVisitReason = "";
                _modal.hide();
            }, false);
        }
    },
    flipSummary: function (elm) {

        _log.d("_routes.flipSummary");
        _routes.flippedAway = true;
        _cardEngine.flip("routes", "customerSummary", function(release) {


          _routes.currEquip = [];
          _routes.currOrder=[];
          _routes.accounts=[];
          _routes.visit = [];
          _routes.currCustomerId = $(elm).closest('tr').attr("CustomerId__c");
          _routes.currId = $(elm).closest('tr').attr("Id");

          _model.get("inventory",{Customer__c: _routes.currId}, function (inv) {

              _routes.currInv = inv;
              _model.getKey("equipment", _routes.currCustomerId, function (equipment) {

                  _routes.currEquip = [equipment];

                  _model.get("orders", {Customer__c: _routes.currId}, function (orders) {

                      _routes.currOrder = orders;

                      _model.get("accounts", {"CustomerId__c": _routes.currCustomerId}, function (account) {
                          _routes.accounts = account[0];

                          _model.get("salesVisits", {"CustomerId__c": _routes.currCustomerId}, function (visits) {

                              _routes.visits = visits;
                              _model.getAll("noInventoryReasons", function (reasons) {
                                  _routes.noInventoryReasons = reasons;
                                  for(var a in _routes.currInv) {
                                      if(_routes.currInv[a].Reason_for_no_Inventory_count__c) {
                                          _routes.currInv[a].Reason_for_no_Inventory_count__c_Name = _routes.translateNoInventoryReason(_routes.currInv[a].Reason_for_no_Inventory_count__c);
                                      }
                                  }
                                     release();
                                  _.currScrolls[0].refresh();
                                  $("img#startVisitImg_placeholder").on( "load", function() {
                                      _.currScrolls[0].refresh();
                                      _log.d("Image loaded. Refreshing scroll...");
                                      $("img#startVisitImg_placeholder").off( "load");
                                  });
                                  $("img#endVisitImg_placeholder").on( "load", function() {
                                      _.currScrolls[0].refresh();
                                      _log.d("Image loaded. Refreshing scroll...");
                                      $("img#endVisitImg_placeholder").off( "load");
                                  });
                                  $("img#startVisitImg").on( "load", function() {
                                      _.currScrolls[0].refresh();
                                      _log.d("Image loaded. Refreshing scroll...");
                                      $("img#startVisitImg").off( "load");
                                  });
                                  $("img#endVisitImg").on( "load", function() {
                                      _.currScrolls[0].refresh();
                                      _log.d("Image loaded. Refreshing scroll...");
                                      $("img#endVisitImg ").off( "load");
                                  });
                                  //Error handelling for images
                                  $("img#startVisitImg_placeholder").on( "error", function() {
                                      _.currScrolls[0].refresh();
                                      _log.d("Image error. Refreshing scroll...");
                                      $("img#startVisitImg_placeholder").off( "error");
                                  });
                                  $("img#endVisitImg_placeholder").on( "error", function() {
                                      _.currScrolls[0].refresh();
                                      _log.d("Image error. Refreshing scroll...");
                                      $("img#endVisitImg_placeholder").off( "error");
                                  });
                                  $("img#startVisitImg").on( "error", function() {
                                      _.currScrolls[0].refresh();
                                      _log.d("Image error. Refreshing scroll...");
                                      $("img#startVisitImg").off( "error");
                                  });
                                  $("img#endVisitImg").on( "error", function() {
                                      _.currScrolls[0].refresh();
                                      _log.d("Image error. Refreshing scroll...");
                                      $("img#endVisitImg ").off( "error");
                                  });
                              });


                          });

                      });

                  });

              });

          });



        });






    },
    summaryCtrl: function ($scope) {

        _log.d("_routes.summaryCtrl");

        var ini = 0;
        $scope.totalInv = ini;
        $scope.totalOrder = 0;
        $scope.startVisitImg = false;
        $scope.endVisitImg   = false;


        $scope.showOrder = function (quantity, last) {

            if (quantity > 0) {
                return true;
            } else {
                return false;
            }

        };


        $scope.hasSummaryInv = function(item) {

          if(item.Status__c == "Complete" && typeof item.Inventory_Items__r != 'undefined' && typeof item.Inventory_Items__r.records != 'undefined' && item.Inventory_Items__r.records.length > 0 )
           {
             for(var i in item.Inventory_Items__r.records )
             {
              // _log.d("----> "+item.Inventory_Items__r.records[i].Quantity__c);

               if(  item.Inventory_Items__r.records[i].Quantity__c > 0 ) { return true; }
             }

           }

          return false;


        };



        $scope.hasSummaryOrd = function(order) {
            if(order.Order_Status__c != 'Finalized') {
                return false;
            }
          if(typeof order.Order_Items__r != 'undefined' && typeof order.Order_Items__r.records != 'undefined' && order.Order_Items__r.records.length > 0 )
           {
             for(var i in order.Order_Items__r.records )
             {
               if(order.Order_Items__r.records[i].OrderQty__c > 0 ) { return true; }
             }

           }

          return false;



        };
        $scope.orderTotals = function (orderTotals) {
            var retVal = 0;
            for(var a in orderTotals.Order_Items__r.records) {
                if((orderTotals.Order_Items__r.records[a].isSuggested == false) || (orderTotals.Order_Items__r.records[a].isSuggested == null)) {
                    retVal = retVal + parseInt(orderTotals.Order_Items__r.records[a].OrderQty__c);
                }
            }
            return retVal;
        };


        $scope.orders = _routes.currOrder;
        $scope.equipments = _routes.currEquip;
        $scope.inventoryData = _routes.currInv;
        $scope.accounts = _routes.accounts;
        $scope.visits = _routes.visits;

        $scope.customerName = "- " + _routes.accounts.Name;



        for (var k = 0; k < $scope.inventoryData.length; k++) {

          if(typeof $scope.inventoryData[k].Inventory_Items__r == 'undefined' || typeof $scope.inventoryData[k].Inventory_Items__r.records == 'undefined') { continue; }

            for (var j = 0; j < $scope.inventoryData[k].Inventory_Items__r.records.length; j++) {
                $scope.totalInv = parseInt($scope.totalInv) + parseInt($scope.inventoryData[k].Inventory_Items__r.records[j].Quantity__c)
            }
        }

        for (var k = 0; k < $scope.orders.length; k++) {


          if(typeof $scope.orders[k].Order_Items__r == 'undefined' || typeof $scope.orders[k].Order_Items__r.records == 'undefined') { continue; }


            for (var j = 0; j < $scope.orders[k].Order_Items__r.records.length; j++) {
              //  _log.d("COUNTING "+parseInt($scope.totalOrder)+" + "+parseInt($scope.orders[k].Order_Items__r.records[j].OrderQty__c));
                $scope.totalOrder = parseInt($scope.totalOrder) + parseInt($scope.orders[k].Order_Items__r.records[j].OrderQty__c)
            }
        }



        var visit = $scope.visits[0];

        var startLat = '';
        var startLon = '';
        var endLat = '';
        var endLon = '';
        var timeStart = '';
        var timeStop  = '';

        if (typeof visit.Sales_Visits__r != 'undefined' && visit.Sales_Visits__r !== null && typeof visit.Sales_Visits__r.records != 'undefined') {

            var record = visit.Sales_Visits__r.records[0];

            startLat = record.Start_Visit_Latitude__c;
            startLon = record.Start_Visit_Long__c;

            endLat = record.End_Visit_Latitude__c;
            endLon = record.End_Visit_Longitude__c;

            $scope.timeStart = moment(record.Visit_Start_Time__c).fromNow();
            $scope.timeStop  = moment(record.End_Visit_Time__c).fromNow();

            if(record.Status__c == 'Complete')
            {
              $scope.visitEnded = true;
            }



        }


        if (startLat !== '' && startLon !== '') {


            $scope.startVisitImg = 'http://maps.googleapis.com/maps/api/staticmap?center=' + startLat + ',' + startLon + '&zoom=16&size=640x320&sensor=true&markers=color:red%7C' + startLat + ',' + startLon;

        }
        else {

            $scope.startVisitImg = '../img/placeholder.png';

        }

        if (endLat !== '' && endLon !== '') {

            $scope.endVisitImg = 'http://maps.googleapis.com/maps/api/staticmap?center=' + endLat + ',' + endLon + '&zoom=16&size=640x320&sensor=true&markers=color:red%7C' + endLat + ',' + endLon;

        }
        else {

            $scope.endVisitImg = '../img/placeholder.png';

        }


    },
    changeReason : function (reason, elm) {

        _routes.noVisitReason =  reason;
        $("td.reasonGui").html("&#xf00d;");
        $(elm).children("td.gui-extra").html("&#xf00c;");

    },
    translateNoInventoryReason : function (id) {
        for(var reason in _routes.noInventoryReasons) {
            if (id == _routes.noInventoryReasons[reason].Id) {
                return _routes.noInventoryReasons[reason].Name;
            }
        }
    },
    allCustomersComplete : function() {
        var returnval = true;
        for (var a in _routes.todaysCustomers) {
            if (_routes.todaysCustomers[a].visitStatus != "Complete") {
                returnval = false;
            }
        }
        return returnval;
    },
    backtoRouteList : function() {
        layout.attach("#routesFront");
    },
    flipEndofDay : function () {
        _routes.flippedAway = true;
        _cardEngine.flip("routes", "endDay", function(release) {
            release();
        });

    },
    endDayAll : function () {
        if (_routes.dayfunction != "DAY ENDED") {
            //_routes.endDay(this.customers, true);
            if(_routes.allCustomersComplete()) {
                var xml = "<p>Are you sure you want to end your current day?</p>";
                _modal.show('warning', 'END DAY', xml, true, function () {
                    //change status and restrict button
                    _routes.dayfunction = "DAY ENDED";
                    for(var r in _routes.model ) {
                        //add end day to job queue
                        var jobData = {
                            "lst_DayComp": [{
                                SAP_RouteId: _routes.model[r].RouteId__c,
                                Status : 'Complete'
                            }]
                        };

                        jobName = "End Of Day";
                        jobDesc = _routes.model[r].Name;
                        jobData = {
                            action: 'submitDayComplete',
                            data: jobData
                        };
                        jobQueue.addJob(jobName, jobDesc, jobData, true, false, false);
                        _log.d("DONE SUBMITTING END DAY");
                    }
                    //change status and restrict button
                    _routes.dayfunction = "DAY ENDED";
                    layout.attach("#endDay");
                    _modal.hide();
                }, function () {
                    _modal.hide();
                }, false);
            } else {
                var xml = "Please complete all visits before you end your day.";
                _modal.show('warning', 'NOT ALL VISITS COMPLETED', xml);
            }
        }
    }
};
;;

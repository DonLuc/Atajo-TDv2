_accounts = {

    model: null,


    onExit : function() { var _ = this;




    },


    onLoaded: function () { var _ = this;


        /*
        _model.getAll("accounts", function(results) {

            _log.d("getAll on accounts: " + JSON.stringify(results));

        })
        */


        //"ShippingState":"WC"


        //_model.get("accounts", { "CustomerId__c" : "151960"}, function(results) {
        _model.get("accounts", {"ShippingState":"WC", "CustomerId__c" : "159040"}, function(results) {

            _log.d("Results length: " + results.length);
            _log.d("get query on accounts: " + JSON.stringify(results));

        })


        _model.getKey("accounts", "0011100000H8QwSAAV", function(result) {

            _log.d("getKey on accounts: " + JSON.stringify(result));

            result.Name = "tootsie";

            _log.d("We are going to try and save some data");

            _model.set("accounts", result, function(obj) {

                _log.d("save with name: " + obj.Name);

            });

        });



        /*
        _model.del("accounts", "0011100000H8QwSAAV", function() {

            _log.d("delete on accounts");

        });
        */

    },


    onMessage : function() {



    }

};;;



_calendar = {

    getOptions : function (cb) {

        var disabledDays = [];
        var firstFreeDay = '';
        var firstFreeDate = false;

        _log.d("CALENDAR.GETOPTIONS");

        var _YEAR  = moment().format('YYYY');
        var _MONTH = moment().format('MM');
        var _DAY   = moment().format('DD');


        _model.getAll('calendar', function(records) {

          useTomorrow = false;

            for(var day in records) {

                var date = records[day].Date__c;

              //  _log.d("CALENDAR DATE - "+date);

                date = date.split('-'); //2014-01-05

                var currYEAR  = date[0];
                var currMONTH = date[1];
                var currDAY   = date[2];

                if(currYEAR < _YEAR || currMONTH < _MONTH )
                {
                  // _log.d("YEAR / MONTH IN THE PAST. CONTINUING");
                   continue;
                }


                if(records[day].Status__c == "FREE") {

                  if(currMONTH.charAt(0) == '0') { currMONTH = currMONTH.substring(1); }
                  if(currDAY.charAt(0)   == '0') { currDAY   = currDAY.substring(1);   }



                     var _date = new Date(date[0], date[1]-1, date[2], 0, 0, 0, 0);

                  //  _log.d("DATE IS FREE -> ADDING TO DISABLED DAYS : "+date);

                    disabledDays.push(_date);

                } else {


                    if(useTomorrow)
                    {
                      //USE THIS DATE
                      if(currMONTH.charAt(0) == '0') { currMONTH = currMONTH.substring(1); }
                      if(currDAY.charAt(0)   == '0') { currDAY   = currDAY.substring(1);   }

                      firstFreeDay = currDAY;
                      firstFreeDate = new Date(currYEAR, currMONTH-1, currDAY, 0, 0, 0, 0);
                      _log.d("CALENDAR FIRST FREE DAY FOUND - "+firstFreeDay+" / "+firstFreeDate);
                      useTomorrow = false;
                      break;
                    }

                  //  _log.d(" if "+date[0]+" >= "+_YEAR+" && "+date[1]+" >= "+_MONTH+" && "+ date[2] + " >= "+_DAY);

                    if(currDAY >= _DAY && currMONTH >= _MONTH && currYEAR >= _YEAR)
                    {
                      // _log.d("USING NEXT AVAILABLE DAY");
                       useTomorrow = true;
                    }






                }

            }

            if(!firstFreeDate) { //DATE NOT FOUND.. TRY NEXT MONTH / YEAR

            //    _log.d("CALENDAR -> FIRST FREE DAY NOT FOUND - DEFAULTING TO TOMORROW");

                var today    = moment();
                var tomorrow = today.add('days', 1);
                var rawDate  = moment(tomorrow).format("YYYY-MM-DD").split('-');

                var _currYEAR  = rawDate[0];
                var _currMONTH = rawDate[1];
                var _currDAY   = rawDate[2];

                 firstFreeDay = _currDAY;
                 firstFreeDate = new Date(_currYEAR, _currMONTH, _currDAY, 0, 0, 0, 0);
                 _log.d("CALENDAR DEFAULT FFREE DAY SET @ "+firstFreeDay+" / "+firstFreeDate);


/*
                for(var day in records) {

                    var date = records[day].Date__c;
                    date = date.split('-'); //2014-01-05


                    if(records[day].Status__c != "FREE")
                    {
                        var now = new Date();
                        var _date = new Date();

                        if (now.getMonth() == 11) {
                            var _date = new Date(now.getFullYear() + 1, 0, 1);
                        } else {
                            var _date = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                        }
                        _date = moment(_date).format('L');
                        _date = _date.split('/');


                        if(date[0] == _date[2] && date[1] == _date[0]) {


                            if(firstFreeDay == '') {

                                firstFreeDay = date[2];
                                firstFreeDate = new Date(date[0], date[1], date[2], 0, 0, 0, 0);

                            }

                        }

                    }

                }
*/
            }


            //var defaultDate = new Date();
            //defaultDate.setDate(firstFreeDay);

            firstFreeDate = moment(firstFreeDate).toDate();

            _log.d("First free date: " + firstFreeDate);

            var now = new Date();

            var options = {

                minDate: now,
                reposition: false,
                position: "bottom",
                disabledDays : disabledDays,
                setDefaultDate : true,
                defaultDate : firstFreeDate,

                highlightDayFn : function(date) {


                    for (var d in this.disabledDays) {

                        var check = this.disabledDays[d];

                        if (check.getYear() == date.getYear() && check.getMonth() == date.getMonth() && check.getDate() == date.getDate()) {

                            return true;

                        }

                    }

                    return false;

                }

            };

            cb(options);

        });

    }


}
;;

_checklist = {

    model: [],
    brands: [],
    customerID: undefined,


    onExit : function() {



    },


    onLoaded: function (view, card, lock) {  var _ = this;

        _.lockCB = lock;
        _.lockCB('lock');

        _log.d("checklist - onLoaded");

    },


    onMessage : function(data) {


        _log.d("checklist - onMessage");

        _model.get("tasks", { "CustomerId__c" : data.CustomerId__c}, function(tasks) {

            _log.d("tasks found: " + tasks.length);

            _checklist.customerId = data.CustomerId__c;
            _checklist.model = tasks;
            _model.getAll("brands", function (brands) {

                _checklist.brands = brands;
                _checklist.extendTasks(_checklist.model);
                layout.attach('#checklistFront', true);

               setTimeout(function() {   _checklist.lockCB('release'); }, 1000);  


            });
        });


    },


    Ctrl : function ($scope) {
        $scope.customerName = _customer.model.Name;
        $scope.tasks = _checklist.model;
    },


    extendTasks : function(taskModel) { _log.d("_checklist.extendTasks");

        _log.d("checklist - extendTasks");

        // Add the constants for the tasks.
        for (var c = 0; c < taskModel.length; c++) {

            _log.d("c >> " + c);

            if (taskModel[c].Tasks && taskModel[c].Tasks.records) {

                for (var t = 0; t < taskModel[c].Tasks.records.length; t++) {


                    _log.d('Task: ' + JSON.stringify(taskModel[c].Tasks.records[t]));

                    //Initialize utility methods on task
                    var task = taskModel[c].Tasks.records[t];

                    // Clone our constants.
                    var taskTypeMappings = $.extend(true, {}, _checklist.taskTypeMappings);


                    // Add brands for Competitor: RecordTypeId is '012g00000000BeJAAU'.
                    taskTypeMappings['012g00000000BeJAAU'].inputs[0].values = []; // Reset

                    for (var i = 0; i < _checklist.brands.length; i++){

                        var input_value = {
                            name : _checklist.brands[i].Name,
                            value : _checklist.brands[i].Name
                        }

                        taskTypeMappings['012g00000000BeJAAU'].inputs[0].values.push(input_value);

                    }

                    // Update: 2013-10-03: For Production app, use '012b0000000ThgzAAC'.
                    taskTypeMappings['012b0000000ThgzAAC'].inputs[0].values = []; // Reset

                    for (var i = 0; i < _checklist.brands.length; i++){

                        var input_value = {
                            name : _checklist.brands[i].Name,
                            value : _checklist.brands[i].Name
                        }

                        taskTypeMappings['012b0000000ThgzAAC'].inputs[0].values.push(input_value);

                    }

                    // Add selects
                    task.inputs = []; // Init
                    if (typeof taskTypeMappings[task.RecordTypeId] != 'undefined' && typeof taskTypeMappings[task.RecordTypeId].inputs != 'undefined'){
                        task.inputs = taskTypeMappings[task.RecordTypeId].inputs;
                    }

                    // Add text inputs
                    task.textInputs = []; // Init
                    if (typeof taskTypeMappings[task.RecordTypeId] != 'undefined' && typeof taskTypeMappings[task.RecordTypeId].textInputs != 'undefined'){

                        task.textInputs = taskTypeMappings[task.RecordTypeId].textInputs;

                    }

                    task.mandatory = task.Mandatory__c; // Added in the SOQL now.
                    task.completed = (task.Status == 'Completed') ? true : false;

                    // Try to find the selected value:
                    for (var input_index = 0; input_index < task.inputs.length; input_index++){

                        var input = task.inputs[input_index];

                        // Only do this check for Selects.
                        if (input.isSelect){

                            // Do we have the field?
                            var field_name = input.salesforceField;
                            if (typeof(task[field_name]) != 'undefined' && task[field_name] != null){

                                // We have a value. Loop through the inputs and set the correct one
                                // as selected.
                                for (var select_index = 0; select_index < input.values.length; select_index++){

                                    //input.values[select_index].selected = false; // Stupid javascript object references!!!!

                                    if (input.values[select_index].value == task[field_name]){

                                        _log.d("Settings selected value to: " + input.values[select_index].value);

                                        input.selected = input.values[select_index];

                                        break;

                                    }

                                }

                            }

                        }

                    }

                    // Add values for text inputs.
                    for (var input_index = 0; input_index < task.textInputs.length; input_index++){

                        var input = task.textInputs[input_index];

                        input.value = ''; // Init

                        var field_name = input.salesforceField;

                        if (typeof(task[field_name]) != 'undefined' && task[field_name] != null){

                            input.value = task[field_name];

                        }

                    }

                }

            }

        }


        _log.d("Replacing with extended model");
        _checklist.model = taskModel;

    },


    validate : function(task, cb) {


// To check if all text fields and select boxes are populated for both mandatory and non-mandatory tasks before updating them
        for (var i in task.inputs) {

            if (task.inputs[i].isSelect) {

                if (!task.inputs[i].selected) {

                    if (cb) cb(false, false);
                    return false;

                }

            }

        }

        for (var i in task.textInputs) {

            if (task.textInputs[i].isTextarea ) {
                var value = $.trim(task.textInputs[i].value);

                if (value.length == 0) {

                    if (cb) cb(false, false);
                    return false;

                }
            }
        }





        // If there are mandatory_value fields, and they are not set to the correct value,
        // we need a resolution comment.
        for (var i in task.inputs) {

            if (task.inputs[i].isSelect) {

                if (task.inputs[i].mandatory_value == task.inputs[i].selected.value) {

                    var resolution_comment = $.trim(task.Resolution_Comments__c);
                    if (!resolution_comment || resolution_comment.length == 0){

                        task.Resolution_Comments__c = "";
                        if (cb) cb(false, "Please provide Resolution Comments.");
                        return false;

                    }

                }

            }
            else if (task.inputs[i].textInputs) {

                // Text inputs all seem to be mandatory, when looking at the old code

                var value = $.trim(task.inputs[i].value);

                if (value && value.length > 0) {

                    if (cb) cb(false, false);
                    return false;

                }


            }

        }

        // If we can't find any reason to return false, the model must be valid.
        if (cb) cb(true);
        return true;

    },


    updateTask : function(taskid) {
        var task = [];
        var count = 0;
        for (var a in _checklist.model[0].Tasks.records) {
            if (_checklist.model[0].Tasks.records[a].Id == $(taskid).attr('task')) {
                task = _checklist.model[0].Tasks.records[a];
                count = a;
                break;
            }
        }
        if (task.length == 0) {
            return;
        }
        _log.d("Current task status: " + task.Status);

        if (task.Status != "Completed") {

            _checklist.validate(task, function (pass, error) {


                if (pass) {

                    // The model has passed validation

                    var taskData = [];

                    task.Status = "Completed";

                    var taskItem = {
                        SFDC_TaskId: task.Id,
                        CustomerId: _checklist.customerId, // SAP Customer ID
                        SFDC_ContactId: '', // SF Account User ID - Not mandatory. In fact it won't work if you add it...
                        TaskType: task.RecordTypeId, // This is not a match to the original service spec, but there is nothing else _checklist can fill this gap
                        Subject: task.Subject,
                        Comment: task.Description,
                        Status: task.Status, // Because we only submit complete tasks.
                        ResolutionComments: task.Resolution_Comments__c
                    }

                    for (var i in task.inputs) {

                        if (task.inputs[i].isSelect) {

                            taskItem[task.inputs[i].field] = task.inputs[i].selected.value;

                        } else {

                            taskItem[task.inputs[i].field] = task.inputs[i].value;

                        }

                    }
                    for (var i in task.textInputs) {
                        taskItem[task.textInputs[i].field] = task.textInputs[i].value;
                    }

                    taskData.push(taskItem);

                    _log.d("Task output: " + JSON.stringify(taskData));

                    _checklist.addTaskToQueue(_checklist.customerId, taskData);

                    var taskModel = _checklist.mapToModel(taskData, task.Id);
                    task.completed = true;
                    _checklist.model[0].Tasks.records[count].completed = true;
                    var e = document.getElementById('checklistFront__FACE');
                    var scope = angular.element(e).scope();

                    scope.$apply(function() { scope.tasks = _checklist.model; });
                    if (taskModel) {

                        _model.set("tasks", taskModel, function (task) {

                            _log.d("Updated task: " + task.Id + " in the database");

                        });


                    }


                } else {

                    // If the model did not pass validation...

                    error = !error ? 'The task is incomplete.' : error;
                    _modal.show('warning', 'Could not update task', error,
                        false,
                        function () {
                            _modal.hide();

                        },
                        function () {
                            _modal.hide();
                        }
                    );

                }

            });

        }

    },


    addTaskToQueue : function (customerId, taskData) {

        _log.d("Adding task to jobqueue: " + customerId);

        // Add it to the list
        var taskList = { 'lst_Task' : taskData };

        var jobName =  "Task Update";
        var jobDesc =  _customer.model.Name + " : " +taskData[0].Subject;
        var jobData = { action:'submitTask', data : taskList};
        jobQueue.addJob(jobName, jobDesc, jobData, false, false, false);


    },


    mapToModel : function(taskData, taskId) {

        var taskModel = false;
        var taskObj = {}

        for (var m in _checklist.model) {

            taskModel = _checklist.model[m];

            for (var t in taskModel.Tasks.records) {

                if (taskModel.Tasks.records[t].Id == taskId) {

                    taskObj = taskModel.Tasks.records[t]

                    _log.d("Task found, updating its data");

                }

            }

        }

        for (var SAP_field_name in taskData[0]){

            var SF_field_name = false;

            switch (SAP_field_name){

                case 'SFDC_TaskId' 							: SF_field_name = 'Id'; break;
                //case 'CustomerId' 						: SF_field_name = 'CustomerId__c'; break;
                //case 'TaskType' 							: SF_field_name = 'RecordTypeId'; break;
                //case 'Subject'							: SF_field_name = 'Subject'; break;
                case 'Status' 								: SF_field_name = 'Status'; break;
                //case 'Priority'							: SF_field_name = 'Priority'; break;
                //case 'SFDC_ContactId'						: SF_field_name = 'SFDC_ContactId'; break;
                case 'Brand'								: SF_field_name = 'Brand__c'; break;
                case 'SOVICompetitor' 						: SF_field_name = 'SOVI_Competitor__c'; break;
                case 'SOVI'									: SF_field_name = 'SOVI_Forbes__c'; break;
                case 'PackSize' 							: SF_field_name = 'Pack_size__c'; break;
                case 'DueDate' 								: SF_field_name = 'ActivityDate'; break;
                case 'CompetitorEquipment' 					: SF_field_name = 'Competitor_Equipment__c'; break;
                case 'Price' 								: SF_field_name = 'Pricing__c'; break;
                case 'Comment' 								: SF_field_name = 'Description'; break;
                case 'StockShortDated' 						: SF_field_name = 'Stock_short_dated__c'; break;
                case 'StockExpired'							: SF_field_name = 'Stock_expired__c'; break;
                case 'CoolerCondition'						: SF_field_name = 'Cooler_Condition__c'; break;
                case 'SignageCondition'						: SF_field_name = 'SignageCondition'; break;
                case 'Allequipmentasperpictureofsuccess' 	: SF_field_name = 'All_equipment_as_per_picture_of_success__c'; break;
                case 'Iscoolermerchandisedasperplanogram'	: SF_field_name = 'Is_cooler_merchandised_as_per_planogram__c'; break;
                case 'IsPOSasperlookofSuccess' 				: SF_field_name = 'Is_POS_as_per_look_of_Success__c'; break;
                case 'Strategicpacksatrecommendedprice'		: SF_field_name = 'Strategic_packs_at_recommended_price__c'; break;
                case 'ResolutionComments'					: SF_field_name = 'Resolution_Comments__c'; break;
                case 'IsyourOutletPromoCompliant'			: SF_field_name = 'Is_your_Outlet_Promo_compliant__c'; break;
                default 									: SF_field_name = false; break;
            }

            if (SF_field_name) {

                _log.d("Mapping SAP Field: " + SAP_field_name + " TO SF Field: " + SF_field_name);

                taskObj[SF_field_name] = taskData[0][SAP_field_name];


            }

        }

        return taskModel;

    },



    taskTypeMappings : {

        "012b0000000ThP7AAK" : { //Signage Task
            //mandatory : true,
            inputs:
                [
                    {
                        name: "Signage Condition", salesforceField : "Signage_Condition__c", field : "SignageCondition", isSelect : true,
                        mandatory_value : "Not Satisfactory",
                        values : [
                            {name : "Satisfactory" , 			value : "Satisfactory"},
                            {name : "Not Satisfactory *", 		value : "Not Satisfactory"},
                        ]
                    }
                ]
        },


        "012g00000000Cw4AAE" : { // Promo Compliance Tracker (causals)
            //mandatory : true,
            inputs :
                [
                    {
                        name: "Is Your Outlet Promo Compliant?", salesforceField : "Is_your_Outlet_Promo_compliant__c", field : "IsyourOutletPromoCompliant", isSelect : true,
                        mandatory_value : "N",
                        values : [
                            {name : "Yes", 				value : "Y"},
                            {name : "No *", 			value : "N"},
                        ]
                    }
                ]
        },



        "012g00000000CumAAE" : { // Look of Success (RED blueprints)
            //mandatory : true,
            inputs :
                [

                    {
                        name: "Is POS as per look of success?", salesforceField : "Is_POS_as_per_look_of_Success__c", field : "IsPOSasperlookofSuccess", isSelect : true,
                        mandatory_value : "N",
                        values : [
                            {name : "Yes", 				value : "Y"},
                            {name : "No *", 			value : "N"},
                        ]
                    },
                    {
                        name: "Is cooler merchandised as per planogram?", salesforceField : "Is_cooler_merchandised_as_per_planogram__c", field : "Iscoolermerchandisedasperplanogram", isSelect : true,
                        mandatory_value : "N",
                        values : [
                            {name : "Yes", 				value : "Y"},
                            {name : "No *", 			value : "N"},
                        ]
                    },
                    {
                        name: "All Equipment as per picture of success?", salesforceField : "All_equipment_as_per_picture_of_success__c", field : "Allequipmentasperpictureofsuccess", isSelect : true,
                        mandatory_value : "N",
                        values : [
                            {name : "Yes", 				value : "Y"},
                            {name : "No *", 			value : "N"},
                        ]
                    },
                    {
                        name: "Strategic packs at recommended price?", salesforceField : "Strategic_packs_at_recommended_price__c", field : "Strategicpacksatrecommendedprice", isSelect : true,
                        mandatory_value : "N",
                        values : [
                            {name : "Yes", 				value : "Y"},
                            {name : "No *", 			value : "N"},
                        ]
                    },

                ]
        },



        "012g00000000CzSAAU" : { // Clean and inspect cooler working condition
            //mandatory : true,
            inputs :
                [
                    {
                        name: "Cooler Condition", salesforceField : "Cooler_Condition__c", field : "CoolerCondition", isSelect : true,
                        mandatory_value : "Not Satisfactory",
                        values : [
                            {name : "Satisfactory", 		value : "Satisfactory"},
                            {name : "Not Satisfactory *", 	value : "Not Satisfactory"},

                        ]
                    }
                ]
        },


        "012g00000000BuCAAU" : { // Standard
            //mandatory : false,
            inputs :
                [
                    // For standard tasks, only the Resolution Comment is necessary now,
                    // so I leave this out.
                    /*
                     {
                     name: "Status", field : "Status", isSelect : true,
                     values : [
                     {name : "Not Started", 				value : "Not Started"},
                     {name : "In Progress", 				value : "In Progress"},
                     {name : "Completed", 				value : "Completed"},
                     {name : "Waiting on Someone else", 	value : "Waiting on Someone else"},
                     {name : "Deferred", 				value : "Deferred"},
                     ]
                     }
                     */
                ]
        },


        "012g00000000C8xAAE" : { // Merchandise and Stock Rotation
            //mandatory : false,
            inputs :
                [
                    {
                        name: "Stock Short Dated", salesforceField : "Stock_short_dated__c", field : "StockShortDated", isSelect : true,
                        mandatory_value : "Y",
                        values : [
                            {name : "Yes *", 	value : "Y"},
                            {name : "No", 		value : "N"},
                        ]
                    },

                    {
                        name: "Stock Expired", salesforceField : "Stock_expired__c", field : "StockExpired", isSelect : true,
                        mandatory_value : "Y",
                        values : [
                            {name : "Yes *", 	value : "Y"},
                            {name : "No", 		value : "N"},
                        ]
                    }


                ]
        },

        /*

         Competitor:
         - Brand: Select
         - Pulled in from SF.
         - Must be in alphabetical order.
         - Pack Size: Text
         - Pricing: Text
         - SOVI Competitor: Text
         - SOVI Forbes: Text
         - Competitor Equipment: Text Area

         */
        "012g00000000BeJAAU" : { // Competitor
            //mandatory : false,
            inputs :
                [
                    // Brand list
                    { // Must be at index 0. See _checklist.init().
                        name: "Brand", salesforceField : "Brand__c", field : "Brand", isSelect : true,
                        values : [
                            // Brands are populated later.
                            // See _checklist.init().
                        ]
                    },

                ],

            textInputs :
                [

                    // Text inputs - I'll use Textareas because Salesforce does.
                    // Pack Size
                    {
                        name: "Pack Size", salesforceField : "Pack_size__c", field : "PackSize", isTextarea : true
                    },

                    // Pricing
                    {
                        name: "Pricing", salesforceField : "Pricing__c", field : "Price", isTextarea : true
                    },

                    // SOVI Competitor
                    {
                        name: "SOVI Competitor", salesforceField : "SOVI_Competitor__c", field : "SOVICompetitor", isTextarea : true
                    },

                    // SOVI Forbes
                    {
                        name: "SOVI Forbes", salesforceField : "SOVI_Forbes__c", field : "SOVI", isTextarea : true
                    },

                    // Competitor Equipment
                    {
                        name: "Competitor Equipment", salesforceField : "Competitor_Equipment__c", field : "CompetitorEquipment", isTextarea : true
                    },

                ]
        },


        //},

        /*

         ===========
         PRODUCTION
         ===========

         Stephen Moore has confirmed that the Salesforce IDs will not overlap
         between production and sandbox environments.
         */
        "012b0000000ThP7AAK" : { //Signage Task
            //mandatory : true,
            inputs:
                [
                    {
                        name: "Signage Condition", salesforceField : "Signage_Condition__c", field : "SignageCondition", isSelect : true,
                        mandatory_value : "Not Satisfactory",
                        values : [
                            {name : "Satisfactory" , 			value : "Satisfactory"},
                            {name : "Not Satisfactory *", 		value : "Not Satisfactory"},
                        ]
                    }
                ]
        },


        "012b0000000ToakAAC" : { // Promo Compliance Tracker (causals)
            //mandatory : true,
            inputs :
                [
                    {
                        name: "Is Your Outlet Promo Compliant?", salesforceField : "Is_your_Outlet_Promo_compliant__c", field : "IsyourOutletPromoCompliant", isSelect : true,
                        mandatory_value : "N",
                        values : [
                            {name : "Yes", 				value : "Y"},
                            {name : "No *", 			value : "N"},
                        ]
                    }
                ]
        },



        "012b0000000ToaiAAC" : { // Look of Success (RED blueprints)
            //mandatory : true,
            inputs :
                [

                    {
                        name: "Is POS as per look of success?", salesforceField : "Is_POS_as_per_look_of_Success__c", field : "IsPOSasperlookofSuccess", isSelect : true,
                        mandatory_value : "N",
                        values : [
                            {name : "Yes", 				value : "Y"},
                            {name : "No *", 			value : "N"},
                        ]
                    },
                    {
                        name: "Is cooler merchandised as per planogram?", salesforceField : "Is_cooler_merchandised_as_per_planogram__c", field : "Iscoolermerchandisedasperplanogram", isSelect : true,
                        mandatory_value : "N",
                        values : [
                            {name : "Yes", 				value : "Y"},
                            {name : "No *", 			value : "N"},
                        ]
                    },
                    {
                        name: "All Equipment as per picture of success?", salesforceField : "All_equipment_as_per_picture_of_success__c", field : "Allequipmentasperpictureofsuccess", isSelect : true,
                        mandatory_value : "N",
                        values : [
                            {name : "Yes", 				value : "Y"},
                            {name : "No *", 			value : "N"},
                        ]
                    },
                    {
                        name: "Strategic packs at recommended price?", salesforceField : "Strategic_packs_at_recommended_price__c", field : "Strategicpacksatrecommendedprice", isSelect : true,
                        mandatory_value : "N",
                        values : [
                            {name : "Yes", 				value : "Y"},
                            {name : "No *", 			value : "N"},
                        ]
                    },

                ]
        },



        "012b0000000ToagAAC" : { // Clean and inspect cooler working condition
            //mandatory : true,
            inputs :
                [
                    {
                        name: "Cooler Condition", salesforceField : "Cooler_Condition__c", field : "CoolerCondition", isSelect : true,
                        mandatory_value : "Not Satisfactory",
                        values : [
                            {name : "Satisfactory", 		value : "Satisfactory"},
                            {name : "Not Satisfactory *", 	value : "Not Satisfactory"},

                        ]
                    }
                ]
        },


        "012b0000000ToalAAC" : { // Standard
            //mandatory : false,
            inputs :
                [
                    // For standard tasks, only the Resolution Comment is necessary now,
                    // so I leave this out.
                    /*
                     {
                     name: "Status", field : "Status", isSelect : true,
                     values : [
                     {name : "Not Started", 				value : "Not Started"},
                     {name : "In Progress", 				value : "In Progress"},
                     {name : "Completed", 				value : "Completed"},
                     {name : "Waiting on Someone else", 	value : "Waiting on Someone else"},
                     {name : "Deferred", 				value : "Deferred"},
                     ]
                     }
                     */
                ]
        },


        "012b0000000ToajAAC" : { // Merchandise and Stock Rotation
            //mandatory : false,
            inputs :
                [
                    {
                        name: "Stock Short Dated", salesforceField : "Stock_short_dated__c", field : "StockShortDated", isSelect : true,
                        mandatory_value : "Y",
                        values : [
                            {name : "Yes *", 	value : "Y"},
                            {name : "No", 		value : "N"},
                        ]
                    },

                    {
                        name: "Stock Expired", salesforceField : "Stock_expired__c", field : "StockExpired", isSelect : true,
                        mandatory_value : "Y",
                        values : [
                            {name : "Yes *", 	value : "Y"},
                            {name : "No", 		value : "N"},
                        ]
                    }


                ]
        },

        /*

         Competitor:
         - Brand: Select
         - Pulled in from SF.
         - Must be in alphabetical order.
         - Pack Size: Text
         - Pricing: Text
         - SOVI Competitor: Text
         - SOVI Forbes: Text
         - Competitor Equipment: Text Area

         */
        "012b0000000ThgzAAC" : { // Competitor
            //mandatory : false,
            inputs :
                [
                    // Brand list
                    { // Must be at index 0. See _checklist.init().
                        name: "Brand", salesforceField : "Brand__c", field : "Brand", isSelect : true,
                        values : [
                            // Brands are populated later.
                            // See _checklist.init().
                        ]
                    },

                ],

            textInputs :
                [

                    // Text inputs - I'll use Textareas because Salesforce does.
                    // Pack Size
                    {
                        name: "Pack Size", salesforceField : "Pack_size__c", field : "PackSize", isTextarea : true
                    },

                    // Pricing
                    {
                        name: "Pricing", salesforceField : "Pricing__c", field : "Price", isTextarea : true
                    },

                    // SOVI Competitor
                    {
                        name: "SOVI Competitor", salesforceField : "SOVI_Competitor__c", field : "SOVICompetitor", isTextarea : true
                    },

                    // SOVI Forbes
                    {
                        name: "SOVI Forbes", salesforceField : "SOVI_Forbes__c", field : "SOVI", isTextarea : true
                    },

                    // Competitor Equipment
                    {
                        name: "Competitor Equipment", salesforceField : "Competitor_Equipment__c", field : "CompetitorEquipment", isTextarea : true
                    },

                ]

        }

    }

};

;;

_customer = {

    model: null,
    customerNavigation: null,
    CustomerId__c: null,
    Id: null,

    currentVisit: false,
    buttonMenu : null,

    inSequence : true,
    DeliveryBlockStatusCode__c : false,
    OrderBlockStatusCode__c : false,

    onExit: function(view, state) {
        var _ = this;

        _model.batch('accounts', [_customer.model], function() {


              if(state == 'fg')
              {
                _customer.customerNavigation = null;
                _customer.CustomerId__c = null;
                _customer.Id = null;
                _customer.buttonMenu = null;
              }



            _log.d("CUSTOMER SAVED");

        });

    },


    onLoaded: function() {

    },

    onMessage: function(msg, lock) {

        lock('lock');

        _customer.contactsOpen = false;
        _customer.OrderBlockStatusCode__c = msg.OrderBlockStatusCode__c;
        _customer.DeliveryBlockStatusCode__c = msg.DeliveryBlockStatusCode__c;
        _customer.CustomerId__c = msg.CustomerId__c;

        _log.d("CUSTOMER, ONMESSAGE : " + JSON.stringify(msg));
        _customer.model = null;
        _model.get("accounts", {
            "CustomerId__c": msg.CustomerId__c
        }, function(account) {

            account = account[0];
            _customer.model = account;
            _customer.Id = account.Id;



            _log.d("LOADING CUSTOMER : " + JSON.stringify(account));





            //CHECK IF CUSTOMER IS IN SEQUENCE

            _model.get("salesVisits", {
                "CustomerId__c": _customer.model.CustomerId__c
            }, function(visit) {

                _log.d("VISIT IS : " + JSON.stringify(visit));


                visit = visit[0];


                if (typeof visit.Sales_Visits__r != 'undefined' && visit.Sales_Visits__r !== null && typeof visit.Sales_Visits__r.records != 'undefined' && visit.Sales_Visits__r.records[0].Id.indexOf('visit-') == -1)
                {
                    _customer.inSequence = true;

                }
                else
                {
                    _customer.inSequence = false;
                }


                _model.getAll("equipmentVerificationFrequency", function(equipmentVerificationFrequency) {
                    _log.d("GOT EQUIPMENT VERIFICATION FREQUENCY: " + JSON.stringify(equipmentVerificationFrequency));
                    if (equipmentVerificationFrequency[0].Frequency__c) {
                        _customer.Frequency__c = equipmentVerificationFrequency[0].Frequency__c;
                    } else {
                        _customer.Frequency__c =  "4";
                    }
                });


                /*
                 [
                 {
                 "attributes": {
                 "type": "Account",
                 "url": "\/services\/data\/v23.0\/sobjects\/Account\/0011100000H8US9AAN"
                 },
                 "Id": "0011100000H8US9AAN",
                 "CustomerId__c": "128302",
                 "OwnerId": "005b0000000YOIvAAO",
                 "Name": "128302 - BP OAKVLEI",
                 "ShippingStreet": "343",
                 "ShippingState": "WC",
                 "Purchase_Order_No_Required__c": false,
                 "OrderBlockStatusCode__c": null,
                 "DeliveryBlockStatusCode__c": null,
                 "GPS_Coordinates__c": "-33.889170000000 ,18.667250000000",
                 "Delation_Flag_Company_Code__c": false,
                 "Contacts": {
                 "totalSize": 1,
                 "done": true,
                 "records": [
                 {
                 "attributes": {
                 "type": "Contact",
                 "url": "\/services\/data\/v23.0\/sobjects\/Contact\/0031100000Hc1uaAAB"
                 },
                 "Id": "0031100000Hc1uaAAB",
                 "Title": null,
                 "FirstName": "ANESH",
                 "LastName": "HURRIBUNCE",
                 "Email": "ps@penbev.co.za",
                 "MobilePhone": null,
                 "Phone": "219101085",
                 "Birthdate": "1900-01-01",
                 "Fax": null,
                 "FaxExt__c": "219191615",
                 "Twitter__c": null
                 }
                 ]
                 },
                 "AR_Contact_Name__c": "Chantal Meyer",
                 "AR_Contact_Telephone__c": "021 9365543",
                 "key": "0011100000H8US9AAN",
                 "_at": 1425452689160,
                 "READONLY": false
                 }
                 ]
                 */

                _customer.contact = (typeof account.Contacts.records[0] != 'undefined') ? account.Contacts.records[0] : {};


                //SAVE THE CURRENT CONTACT TO DETECT CHANGE
                _customer.originalContact = $.extend({}, _customer.contact);


                $("img#customerImage").attr('src', 'http://maps.googleapis.com/maps/api/staticmap?center=' + _customer.model.GPS_Coordinates__c + '&zoom=14&size=900x420&sensor=false&markers=color:red%7C' + _customer.model.GPS_Coordinates__c);


                _customer.contactScroller = _scroll.add($('#customer-contact-details-scroll')[0]);


                //BUTTON MODEL
                _customer.buttonMenu = {
                    startVisit : { enabled : true , qty : false, status : false },
                    checklist  : { enabled : false, qty : false, status : false },
                    equipment  : { enabled : false, qty : false, status : false },
                    order      : { enabled : false, qty : false, status : false },
                    ullages    : { enabled : false, qty : false, status : false },
                    signage    : { enabled : false, qty : false, status : false },
                    endVisit   : { enabled : false, qty : false, status : false }

                }


                //CHECK VISIT AND ENABLE ACCORDINGLY
                _customer.checkStatus();


                _customer.refresh();

                lock('release');





            });





        });

    },
    loadChecklist: function() {
        layout.sendMessage('checklist', {
            CustomerId__c: _customer.model.CustomerId__c
        });
    },
    loadSignageRequest: function() {
        layout.sendMessage('signageRequest', {
            CustomerId__c: _customer.model.CustomerId__c
        });
    },
    loadEquipment: function() {
        layout.sendMessage('equipment', {
            CustomerId__c: _customer.model.CustomerId__c
        });
    },
    loadInventory: function() {
        layout.sendMessage('inventory', {
            CustomerId__c: _customer.model.CustomerId__c,
            Id: _customer.Id
        });
    },
    loadUllages: function() {
        layout.sendMessage('ullages', {
            CustomerId__c: _customer.model.CustomerId__c,
            Id: _customer.Id
        });
    },
    startVisit: function() {
        var _ = this;

        _log.d('_customer.startVisit()');

        //CHECK IF VISIT EXISTS
        _model.get("salesVisits", {
            "CustomerId__c": _customer.model.CustomerId__c
        }, function(visit) {

            visit = visit[0];

            _log.d("VISIT IS : " + JSON.stringify(visit));

            if (typeof visit.Sales_Visits__r != 'undefined' && visit.Sales_Visits__r !== null && typeof visit.Sales_Visits__r.records != 'undefined')
            {
                if(visit.Sales_Visits__r.records[0].Status__c == "Started")
                {
                    _modal.show("warning", "ALREADY STARTED", "You have already started this visit", false, function() {

                        _modal.hide();

                    })
                    return;
                }
            }



            var lat = _location.currLat;
            var lon = _location.currLon;

            if (lat == 0 || lon == 0) {
                title = 'LOCATION NOT AVAILABLE';
                xml = "Press CANCEL and move around until your location is determined,<br /> or press OK if you are sure you want to start the visit with no location.";
            } else {
                title = "START VISIT";
                xml = "You are about to start your customer visit.";
            }





            _modal.show('warning', title, xml, true, function() {

                var _visit = null;

                if (typeof visit.Sales_Visits__r != 'undefined' && visit.Sales_Visits__r !== null && typeof visit.Sales_Visits__r.records != 'undefined') {

                    if(visit.Sales_Visits__r.records[visit.Sales_Visits__r.records.length - 1].Status__c != "Complete") {
                     //VISIT EXISTS
                     _visit = visit.Sales_Visits__r.records[visit.Sales_Visits__r.records.length - 1];
                    } else { //Account for an out of sequence visit that needs to be created
                        _visit = {
                            Id: "visit-"+guid(),
                            End_Visit_Latitude__c: null,
                            Start_Visit_Latitude__c: "",
                            Status__c: "New",
                            Customer__c: _customer.model.CustomerId__c,
                            Start_Visit_Long__c: "",
                            End_Visit_Longitude__c: null,
                            No_Visit_Reason__c: null,
                            Visit_Start_Time__c: "",
                            End_Visit_Time__c: null

                        };

                        //visit.Sales_Visits__r = { records : [] };
                        visit.Sales_Visits__r.records.push(_visit);
                    }

                } else {
                    //VISIT DOESNT EXIST --> CREATE THE OBJECT
                    _visit = {
                        Id: "visit-"+guid(),
                        End_Visit_Latitude__c: null,
                        Start_Visit_Latitude__c: "",
                        Status__c: "New",
                        Customer__c: _customer.model.CustomerId__c,
                        Start_Visit_Long__c: "",
                        End_Visit_Longitude__c: null,
                        No_Visit_Reason__c: null,
                        Visit_Start_Time__c: "",
                        End_Visit_Time__c: null

                    };

                    visit.Sales_Visits__r = { records : [] };
                    visit.Sales_Visits__r.records.push(_visit);

                    //SUBMIT LATER

                }


                _visit.Start_Visit_Latitude__c = lat;
                _visit.Start_Visit_Long__c = lon;
                _visit.Visit_Start_Time__c = moment().format('YYYY-MM-DD HH:mm:ss');
                _visit.Scheduled_Visit_Date__c = moment().format('DD/MM/YYYY');
                _visit.Status__c = "Open";







                                //SAVE THE DATA
                                _model.batch("salesVisits", [visit], function(visits) {

                                    _log.d("BATCHING DONE FOR VISIT");

                                    var visit = visits[0].Sales_Visits__r.records[visits[0].Sales_Visits__r.records.length - 1];

                                    if(visit.Id.indexOf("visit-") == -1)
                                    {
                                        var jobData = {
                                            "lst_ClientVisit": [{
                                                SFDC_ClientVisitId: visit.Id,
                                                CustomerId: _customer.model.CustomerId__c,
                                                Start_Visit_Long: visit.Start_Visit_Long__c,
                                                Start_Visit_Latitude: visit.Start_Visit_Latitude__c,
                                                Scheduled_Visit_Date: visit.Scheduled_Visit_Date__c,
                                                Visit_Start_Time: moment(visit.Visit_Start_Time__c).format('YYYY-MM-DD HH:mm:ss'),
                                                End_Visit_Latitude: '',
                                                End_Visit_Longitude: '',
                                                Status: "Open",
                                                No_Visit_Reason: "",
                                                Summary: ""
                                            }]
                                        };



                                        jobName = "Start Visit";
                                        jobDesc = _customer.model.Name;
                                        jobData = {
                                            action: 'submitVisit',
                                            data: jobData
                                        };
                                        jobQueue.addJob(jobName, jobDesc, jobData, false, false, false);

                                    }

                                    _modal.hide();


                                    setTimeout(function() { _customer.checkStatus(); } , 500);




                                });



                });










            });













    },
    endVisit: function() {

        //CHECK IF ALL COMPLETE
        msg = '';

        for(var i in _customer.buttonMenu)
        {
            var elm = _customer.buttonMenu[i];
            if(elm.status && elm.status != 'DONE' && elm.status != 'OPTIONAL') {

                //NOT DONE
                lbl = '';
                switch(i) {

                    case 'checklist' : lbl = 'Checklist'; break;
                    case 'order'     : lbl = 'Order';     break;
                    case 'equipment' : lbl = 'Equipment'; break;


                }

                msg += elm.qty+' items for '+lbl+'<br /><br />';


            }


        }


        if(msg !== '')
        {

            _modal.show("warning", "NOT COMPLETE", "Please complete the following : <br /><br /> "+msg, false, function() {

                _modal.hide();

            });

            return;

        }
        else
        {
            /// CAN END VISIT

            _model.get("salesVisits", {
                "CustomerId__c": _customer.model.CustomerId__c
            }, function(visit) {

                visit = visit[0];

                _log.d("VISIT IS : " + JSON.stringify(visit));

                if (typeof visit.Sales_Visits__r != 'undefined' && visit.Sales_Visits__r !== null && typeof visit.Sales_Visits__r.records != 'undefined')
                {
                    if(visit.Sales_Visits__r.records[visit.Sales_Visits__r.records.length - 1].Status__c == "Complete")
                    {
                        _modal.show("warning", "ALREADY STARTED", "You have already ended this visit", false, function() {

                            _modal.hide();

                        });
                        return;
                    }
                }




                var lat = _location.currLat;
                var lon = _location.currLon;

                if (lat === 0 || lon === 0) {
                    title = 'LOCATION NOT AVAILABLE';
                    xml = "Press CANCEL and move around until your location is determined,<br /> or press OK if you are sure you want to end the visit with no location.";
                } else {
                    title = "END VISIT";
                    xml = "You are about to end your customer visit.";
                }





                _modal.show('warning', title, xml, true, function() {

                    var _visit = null;

                    if (typeof visit.Sales_Visits__r != 'undefined' && visit.Sales_Visits__r !== null && typeof visit.Sales_Visits__r.records != 'undefined') {

                        //VISIT EXISTS
                        _visit = visit.Sales_Visits__r.records[visit.Sales_Visits__r.records.length-1];



                    } else {

                        alert("NO VISIT RECORD FOUND!!!");
                        return;

                        //SUBMIT LATER

                    }

                    /*
                     "Id": "a0I11000004fI0zEAE",
                     "IsDeleted": false,
                     "Name": "SV-0972553",
                     "CreatedDate": "2015-03-04T03:31:01.000+0000",
                     "CreatedById": "005b0000000YrkJAAS",
                     "LastModifiedDate": "2015-03-04T07:35:55.000+0000",
                     "LastModifiedById": "005b0000000YOIvAAO",
                     "SystemModstamp": "2015-03-04T07:35:55.000+0000",
                     "Summary__c": null,
                     "End_Visit_Latitude__c": null,
                     "Start_Visit_Latitude__c": "-26.04103867347496",
                     "Scheduled_Visit_Date__c": "2015-03-04",
                     "Status__c": "Open",
                     "Customer__c": "0011100000H8ZGPAA3",
                     "Start_Visit_Long__c": "28.02227591432701",
                     "End_Visit_Longitude__c": null,
                     "No_Visit_Reason__c": null,
                     "Visit_Start_Time__c": "2015-03-04T07:35:51.000+0000",
                     "End_Visit_Time__c": null
                     */


                    _visit.End_Visit_Latitude__c = lat;
                    _visit.End_Visit_Longitude__c = lon;
                    _visit.End_Visit_Time__c = moment().format('YYYY-MM-DD HH:mm:ss');
                    _visit.Status__c = "Complete";

                    _modal.hide();


                    visit.Sales_Visits__r.records[visit.Sales_Visits__r.records.length-1] = _visit;

                    //SAVE THE DATA
                    _model.batch("salesVisits", [visit], function(visits) {

                        _log.d("BATCHING DONE FOR VISIT");





                        var visit = visits[0].Sales_Visits__r.records[visits[0].Sales_Visits__r.records.length-1];

                        if(visit.Id.indexOf("visit-") != -1){
                            visit.Id = "";
                        }

                            if (visit.Scheduled_Visit_Date__c) {
                                var newdate = moment().format('DD/MM/YYYY');
                            } else {
                                var newdate = moment(visit.Scheduled_Visit_Date__c).format('DD/MM/YYYY');
                            }

                            var jobData = {
                                "lst_ClientVisit": [{
                                    SFDC_ClientVisitId: visit.Id,
                                    CustomerId: _customer.model.CustomerId__c,
                                    Start_Visit_Long: visit.Start_Visit_Long__c,
                                    Start_Visit_Latitude: visit.Start_Visit_Latitude__c,
                                    Scheduled_Visit_Date: newdate.replace("-", "/"),
                                    Visit_Start_Time: moment(visit.Visit_Start_Time__c).format('YYYY-MM-DD HH:mm:ss'),
                                    End_Visit_Latitude: visit.End_Visit_Latitude__c,
                                    End_Visit_Longitude: visit.End_Visit_Longitude__c,
                                    Status: "Complete",
                                    No_Visit_Reason: "",
                                    End_Visit_Time : moment(visit.End_Visit_Time__c).format('YYYY-MM-DD HH:mm:ss'),
                                    Summary: ""
                                }]
                            };



                            jobName = "End Visit";
                            jobDesc = _customer.model.Name;
                            jobData = {
                                action: 'submitVisit',
                                data: jobData
                            };
                            jobQueue.addJob(jobName, jobDesc, jobData, true, false, false);


                        layout.goBack();




                    });





                });

            });


        }




    },


    customerCtrl: function($scope) {

        $scope.customer = _customer.model;
        $scope.contact  = _customer.contact;
        $scope.menu     = _customer.buttonMenu;
        $scope.inSequence = _customer.inSequence;

        $scope.showARContact = function() {

            _cardEngine.flip("customer", "customerARContact");
            layout.attach('#customerARContact');

        }

    },


    customerARContactCtrl: function($scope) {

        $scope.customer = _customer.model;

    },

    customerDetailsPlaceholder: '',
    showCustomerDetail: function(elm) {

        _customer.customerDetailsPlaceholder = $(elm).html();

        $(elm).html('<img src=\'img/loader_black.gif\' width=\'20\' /> ');
        var currentCredentials = JSON.parse(window.localStorage.getItem('credentials'));
        var sessionId = currentCredentials.sessionId;

        //https://eu2.salesforce.com/secur/frontdoor.jsp
        var instanceUrl = encodeURI(currentCredentials.instanceUrl);

        var url = instanceUrl + '/secur/frontdoor.jsp?sid=' + sessionId + "&retURL=" + _customer.Id;

        var url_args = "location=yes,clearcache=yes,clearsessioncache=yes";
        var target = "_blank";
        _log.d('showCustomerDetail with ' + url + " args : " + url_args);
        if (client.connectionState == 0) {
            var xml = "Your device must be online for this request";
            $(elm).html(_customer.customerDetailsPlaceholder);
            _modal.show("warning", "NOT ONLINE", xml, false, function() {
                _modal.hide();
            });
        } else {
            _loginStrategies['SALESFORCE'].refreshToken(function(data) {
                var token = data.access_token;
                var ref = window.open(url, target, url_args);
                ref.addEventListener("exit", function() {
                    $(elm).html(_customer.customerDetailsPlaceholder);
                });
                /*ref.addEventListener("loaderror", function(event) {
                    var xml = "There was an error fetching the page from Salesforce.<br /><br />  Error Message: " + event.message;
                    _log.d("ERROR Message: " + JSON.stringify(event));
                    ref.close();
                    _modal.show("warning", "ERROR LOADING SALESFORCE", xml, false, function() {
                        _modal.hide();
                        ref.close();
                    });

                });*/
            }, function(data) {
                _log.d("ERROR REFRESHING TOKEN : " + data);
                $(elm).html(_customer.customerDetailsPlaceholder);
            });

        }
    },
    loadMap: function() {
        var ref = window.open(encodeURI('https://maps.google.co.za/maps?q=' + _customer.model.GPS_Coordinates__c + ''), '_blank', 'location=yes');
    },
    contactsOpen: false,
    validateContacts : function () {
        if((_customer.contact.FirstName == "") || (_customer.contact.LastName == "") || (!_customer.validateEmail(_customer.contact.Email)) ) {
            return false;
        } else {
            return true;
        }
    },
    validateEmail: function(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(email);
    },
    toggleContacts: function() {

        if (_customer.contactsOpen) {
            //SAVE IF DIFFERENT
            var originalContact = JSON.stringify(_customer.originalContact);
            var currentContact = JSON.stringify(_customer.contact);

            if ((currentContact != originalContact) && (_customer.validateContacts())) {

                //SEND THE JOB
                _log.d("SAVING CONTACT");

                // Add it to the list

                // Pretty much a copy of what we send to SF.

                /*
                 curr.SFDC_ContactId   = obj.Id;
                 curr.CustomerId       = (obj.Id == "") ? customerID : ""; // We must have a customer ID present when creating a new contact.
                 curr.title            = obj.Title;
                 curr.FirstName        = obj.FirstName;
                 curr.LastName         = obj.LastName;
                 curr.EmailId          = obj.Email;
                 curr.LandlineNo       = obj.Phone;
                 curr.MobileNo         = obj.MobilePhone;
                 curr.Fax              = obj.FaxExt__c;
                 curr.TwitterId        = obj.Twitter__c;
                 curr.DateOfBirth      = (!obj.Birthdate) ? "" : moment(obj.Birthdate).format('DD/MM/YYYY');
                 */

                /*  note remember to add customer id when intergrating*/

                var contact = _customer.contact;

                var jobData = {

                    'lst_Contact': [{

                        SFDC_ContactId: contact.Id,
                        CustomerId: (contact.Id == "") ? contact.CustomerId__c : "",
                        title: contact.Title,
                        FirstName: contact.FirstName,
                        LastName: contact.LastName,
                        EmailId: contact.Email,
                        LandlineNo: contact.Phone,
                        MobileNo: contact.MobilePhone,
                        Fax: contact.FaxExt__c,
                        TwitterId: contact.Twitter__c,
                        DateOfBirth: (!contact.Birthdate) ? "" : moment(contact.Birthdate).format('DD/MM/YYYY')

                    }]
                };


                jobName = "Contact Update";
                jobDesc = _customer.model.Name;
                jobData = {
                    action: 'submitContact',
                    data: jobData
                };
                jobQueue.addJob(jobName, jobDesc, jobData, true, false, false);



            }



        }



        L1 = _customer.contactsOpen ? -420 : 0;
        _customer.contactsOpen = _customer.contactsOpen ? false : true;
        btnChar = _customer.contactsOpen ? '&#xf00d;' : '&#xf007;';
        $('#customer-contact-details-simple-view').animate({
            left: L1,
            duration: 300
        });
        $('#btnContactToggle').find('.gui-extra').html(btnChar);
    },


    checkStatus : function() {

        _log.d("CHECKING CUSTOMER STATUS");

        _model.get("salesVisits", {
            "CustomerId__c": _customer.model.CustomerId__c
        }, function(visit) {

            visit = visit[0];

            _log.d("CHECKSTATUS GOT VISIT "+JSON.stringify(visit));



            if (typeof visit.Sales_Visits__r != 'undefined' && visit.Sales_Visits__r !== null && typeof visit.Sales_Visits__r.records != 'undefined')
            {
                ///alert(visit.Sales_Visits__r.records[0].Status__c);

                if((visit.Sales_Visits__r.records[visit.Sales_Visits__r.records.length-1].Status__c == "Open") || (visit.Sales_Visits__r.records[visit.Sales_Visits__r.records.length-1].Status__c == "New") && (visit.Sales_Visits__r.records[visit.Sales_Visits__r.records.length-1].Visit_Start_Time__c != null))
                {

                    //K THE VISIT HAS BEEN STARTED... ADJUST AND CALC BUTTONS
                    // alert("has started");
                    _log.d("VISIT HAS STARTED");

                    var btnMenu = _customer.buttonMenu;

                    //ENABLE ALL
                    for(var i in btnMenu) { btnMenu[i].enabled = true; }

                    //DISABLE START VISIT
                    btnMenu.startVisit.enabled = false;

                    //COUNT THE OUTSTANDING CHECKLIST ITEMS
                    _model.get("tasks", { "CustomerId__c" :  _customer.model.CustomerId__c}, function(tasks) {


                        _log.d("TASKS : "+JSON.stringify(tasks));



                        var tasks = tasks[0].Tasks;


                        if(tasks === null || tasks.records.length == 0)
                        {
                            btnMenu.checklist.enabled = false;
                        }
                        else
                        {
                            //   _log.d("tasks found: " + tasks.length);


                            btnMenu.checklist.enabled  = true;
                            btnMenu.checklist.qty      = 0;
                            btnMenu.checklist.status   = _customer.inSequence ? "COMPULSORY" : "OPTIONAL";
                            var mandatoryFound = false;
                            var mandatoryCount = 0;
                            for(var t in tasks.records)
                            {
                                var _task = tasks.records[t];
                                if(_task.Status != 'Completed' && _task.Mandatory__c)
                                {
                                    btnMenu.checklist.qty++;
                                    mandatoryCount++;
                                    mandatoryFound = true;
                                }
                                else if(_task.Status != 'Completed' && !_task.Mandatory__c && !mandatoryFound)
                                {
                                    btnMenu.checklist.qty++;
                                    btnMenu.checklist.status   = "OPTIONAL";
                                }
                            }
                            if (mandatoryFound) {
                                btnMenu.checklist.status   = _customer.inSequence ? "COMPULSORY" : "OPTIONAL";
                            }
                            if(mandatoryCount != btnMenu.checklist.qty) {
                                btnMenu.checklist.qty = mandatoryCount;
                            }

                            if(btnMenu.checklist.qty === 0) { btnMenu.checklist.status = "DONE"; }


                        }


                        _customer.refresh();



                    });


                    //COUNT THE OUTSTANDING EQUIPMENT ITEMS
                    _model.getKey("equipment", _customer.model.CustomerId__c, function(equipment) {


                        _log.d("EQUIPMENT : "+JSON.stringify(equipment));

                        equipment = equipment.Equipment__r;

                        if(equipment === null || equipment.records.length === 0 )
                        {
                            btnMenu.equipment.enabled = true;
                            menu.equipment.status = false;

                        }
                        else
                        {

                            btnMenu.equipment.enabled  = true;
                            btnMenu.equipment.qty      = 0;

                            btnMenu.equipment.status = _customer.inSequence ? "COMPULSORY" : "OPTIONAL";

                            for(var e in equipment.records)
                            {
                                var _equipment = equipment.records[e];
                                if(_equipment.EquipmentStatus__c == 'INST' || _equipment.EquipmentStatus__c == 'Broken')
                                {
                                    if (_equipment.Last_Verified_Date__c) {
                                        var now = moment();
                                        var last_verified = moment(_equipment.Last_Verified_Date__c);
                                        var difference = now.diff(last_verified, 'weeks');
                                        _log.d("-- Asset found: Last verified: " + _equipment.Last_Verified_Date__c + " Difference: " + difference);
                                        if (difference >= _customer.Frequency__c){
                                            btnMenu.equipment.qty++;
                                        }
                                    } else {
                                        btnMenu.equipment.qty++;
                                    }
                                }


                            }

                            if(btnMenu.equipment.qty === 0) { btnMenu.equipment.status = "DONE"; }


                        }







                        _customer.refresh();



                    });



                    //COUNT THE OUTSTANDING ORDER ITEMS

                    _model.get("inventory", {"Customer__c": _customer.Id}, function (inventory) {

                        //  _log.d("INV LEN: "+inventory.length+" --> "+JSON.stringify(inventory));

                        btnMenu.order.enabled  = true;
                        btnMenu.order.qty      = 0;
                        btnMenu.order.status   = _customer.inSequence ? "COMPULSORY" : false;


                        //IF THERE ARE NO INVENTORY HEADERS OR HEADER IS IN DEFAULT STATE
                        if(inventory.length === 0 || inventory[inventory.length-1].Status__c === 'Load Inventory Item') { btnMenu.order.qty++; }
                        if(inventory[inventory.length-1].AdditionalInv && inventory[inventory.length-1].Status__c != "Complete") {
                            btnMenu.order.qty = 1;
                            btnMenu.order.status = "OPTIONAL";
                        }

                        _model.get("orders", {"Customer__c": _customer.Id}, function (orders) {

                            //  alert("ORD LEN: "+orders.length);                   _log.d(JSON.stringify(order));
                            //  _log.d("ORD LEN: "+orders.length+" --> "+JSON.stringify(orders));


                            if(orders.length === 0 || orders[orders.length-1].Order_Status__c === 'Load Order Item') { btnMenu.order.qty++; }


                            if(btnMenu.order.qty === 0) { btnMenu.order.status = "DONE"; }


                            //SHAHID : HACK TO DISCARD Additional Orders, as requested by Wikus
                            if(orders[orders.length-1].Order_Status__c == "Out Of Sequence") {
                                btnMenu.order.qty      = 2;
                                btnMenu.order.status = "OPTIONAL";
                            }
                            _customer.refresh();


                        });



                    });





                }
            }



        });


        //CHECK IF VISIT IS STARTED AND ENABLE BUTTONS


    },

    handleEvent : function(e) {

        //  _log.d("EVENT TARGET "+$(e.target).html());

    },

    refresh : function() {



        //Logic for order block
        /*SHAHID : 15/05/2015 Perhaps we should only use this if it's locked and not out of sequence?
        if(!_customer.inSequence) {
            _customer.buttonMenu.order.enabled = false;
            _customer.buttonMenu.ullages.enabled = false;
        }*/
      //   if(_customer.DeliveryBlockStatusCode__c || _customer.OrderBlockStatusCode__c) {
      if( _customer.OrderBlockStatusCode__c ) {
             _customer.buttonMenu.order.enabled = false;
             _customer.buttonMenu.ullages.enabled = false;
         }
        layout.attach("#customerFront");
    },
    nav : function() {
        var geo = _customer.model.GPS_Coordinates__c;
        if(geo.indexOf(',') > -1)
        {
            geo = geo.split(',');
            var lat = geo[0];
            var lon = geo[1];

            _location.navigate(lat, lon, true);

        }
    }
};
;;

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

/*
 * Copyright (c) 2011, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/* JavaScript library to wrap REST API on Visualforce. Leverages Ajax Proxy
 * (see http://bit.ly/sforce_ajax_proxy for details).
 *
 * Note that you must add the REST endpoint hostname for your instance (i.e.
 * https://na1.salesforce.com/ or similar) as a remote site - in the admin
 * console, go to Your Name | Setup | Security Controls | Remote Site Settings
 */

var forcetk = window.forcetk;

if (forcetk === undefined) {
    forcetk = {};
}

if (forcetk.Client === undefined) {

    // We use $j rather than $ for jQuery so it works in Visualforce
    if (window.$j === undefined) {
        $j = $;
    }

    /**
     * The Client provides a convenient wrapper for the Force.com REST API,
     * allowing JavaScript in Visualforce pages to use the API via the Ajax
     * Proxy.
     * @param [clientId=null] 'Consumer Key' in the Remote Access app settings
     * @param [loginUrl='https://login.salesforce.com/'] Login endpoint
     * @param [proxyUrl=null] Proxy URL. Omit if running on Visualforce or
     *                  Cordova etc
     * @constructor
     */
    forcetk.Client = function(clientId, loginUrl, proxyUrl) {
        this.clientId = clientId;
        this.loginUrl = loginUrl || 'https://login.salesforce.com/';
        if (typeof proxyUrl === 'undefined' || proxyUrl === null) {
         /*
           // ORIGINAL SF CODE
            if (location.protocol === 'file:') {
                // In Cordova
                this.proxyUrl = null;
            } else {
                // In Visualforce
                this.proxyUrl = location.protocol + "//" + location.hostname
                    + "/services/proxy";
            }
          */
          // ADDED BY WERNER
          if (location.protocol === 'file:') {
                // In Cordova
                this.proxyUrl = null;
            } else {
                // PHP Proxy
                this.proxyUrl = location.protocol + "//" + location.hostname + "/penbevwww/prox/prox.php";
            }

            this.authzHeader = "Authorization";
        } else {
            // On a server outside VF
            this.proxyUrl = proxyUrl;
            this.authzHeader = "X-Authorization";
        }
        this.refreshToken = null;
        this.sessionId = null;
        this.apiVersion = null;
        this.instanceUrl = null;
        this.asyncAjax = true;
        this.userAgentString = null;
    }

    /**
    * Set a User-Agent to use in the client.
    * @param uaString A User-Agent string to use for all requests.
    */
    forcetk.Client.prototype.setUserAgentString = function(uaString) {
        this.userAgentString = uaString;
    }
    /**
     * Set a refresh token in the client.
     * @param refreshToken an OAuth refresh token
     */
    forcetk.Client.prototype.setRefreshToken = function(refreshToken) {
        this.refreshToken = refreshToken;
    }

    /**
     * Refresh the access token.
     * @param callback function to call on success
     * @param error function to call on failure
     */
    forcetk.Client.prototype.refreshAccessToken = function(callback, error) {

        var that = this;
        var url = this.loginUrl + '/services/oauth2/token';

        //alert('refreshing with : '+url);

        data = 'grant_type=refresh_token&client_id=' + this.clientId + '&refresh_token=' + this.refreshToken;

       // alert('refreshing with : '+data);

        $.ajax({
            type: 'POST',
            url: (this.proxyUrl !== null) ? this.proxyUrl: url,
            cache: false,
            processData: false,
            data: data,
            success: callback,
            error: error,
            dataType: "json",
            beforeSend: function(xhr) {
                if (that.proxyUrl !== null) {
                    xhr.setRequestHeader('SalesforceProxy-Endpoint', url);
                }
            }
        });
    }

    /**
     * Set a session token and the associated metadata in the client.
     * @param sessionId a salesforce.com session ID. In a Visualforce page,
     *                   use '{!$Api.sessionId}' to obtain a session ID.
     * @param [apiVersion="21.0"] Force.com API version
     * @param [instanceUrl] Omit this if running on Visualforce; otherwise
     *                   use the value from the OAuth token.
     */
    forcetk.Client.prototype.setSessionToken = function(sessionId, apiVersion, instanceUrl) {
        this.sessionId = sessionId;
        app.sessionId = sessionId;
        this.apiVersion = (typeof apiVersion === 'undefined' || apiVersion === null)
        ? 'v23.0': apiVersion;
        if (typeof instanceUrl === 'undefined' || instanceUrl == null) {
            // location.hostname can be of the form 'abc.na1.visual.force.com' or
            // 'na1.salesforce.com'. Split on '.', and take the [1] or [0] element
            // as appropriate
            var elements = location.hostname.split(".");
            var instance = (elements.length == 3) ? elements[0] : elements[1];
            this.instanceUrl = "https://" + instance + ".salesforce.com";
            INSTANCE_URL = this.instanceUrl; //global in config.js
        } else {
            this.instanceUrl = instanceUrl;
        }
    }

    /*
     * Low level utility function to call the Salesforce endpoint.
     * @param path resource path relative to /services/data
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     * @param [method="GET"] HTTP method for call
     * @param [payload=null] payload for POST/PATCH etc
     */
    forcetk.Client.prototype.ajax = function(path, callback, error, method, payload, retry) {
        var that = this;
        var url = this.instanceUrl + '/services/data' + path;

                                      //  var ref = window.open(url, '_blank', 'location=yes');

        _log.e("forcetk.Client.ajax calling : "+url);

        //ADDED BY WERNER :
         if(this.proxyUrl != null)
             {

                pURL = this.proxyUrl+'?qry='+url;
               // alert(this.proxyUrl);
                _log.d("URL IS : "+pURL);

             }
          else { pURL = null; }


        $.ajax({
            type: method || "GET",
            async: this.asyncAjax,
            url: (pURL !== null) ? pURL : url,
            contentType: 'application/json',
            cache: false,
            processData: false,
            data: payload,
            success: callback,
            error: (!this.refreshToken || retry ) ? error : function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.status === 401) {
                    that.refreshAccessToken(function(oauthResponse) {
                        that.setSessionToken(oauthResponse.access_token, null,
                        oauthResponse.instance_url);
                        that.ajax(path, callback, error, method, payload, true);
                    },
                    error);
                } else {
                  //  alert('poo');
                   // alert(errorThrown);
                    error(jqXHR, textStatus, errorThrown);
                }
            },
            dataType: "json",
            beforeSend: function(xhr) {
                if (that.proxyUrl !== null) {
                    xhr.setRequestHeader('SalesforceProxy-Endpoint', url);
                }
                app.sessionId = that.sessionId;
                xhr.setRequestHeader(that.authzHeader, "Bearer " + that.sessionId);
                xhr.setRequestHeader('X-User-Agent', 'salesforce-toolkit-rest-javascript/' + that.apiVersion);

                if (that.userAgentString !== null) {
                    xhr.setRequestHeader('User-Agent',that.userAgentString);
                }
            }
        });
    }


    forcetk.Client.prototype.apex = function(path, callback, error, payload, retry) {
        var that = this;
        var url = this.instanceUrl + '/services/apexrest' + path;

                                      //  var ref = window.open(url, '_blank', 'location=yes');


        if(typeof payload == 'object') { payload = JSON.stringify(payload); }

                _log.e("forcetk.Client.apex calling : "+url+" with payload ---> ");
                _log.e(payload);


        $.ajax({
            type: "POST",
            async: this.asyncAjax,
            url: (this.proxyUrl !== null) ? this.proxyUrl : url,  //ORIGINAL SF CODE
            contentType: 'application/json',
            cache: false,
            processData: false,
            data: payload,
            success: callback,
            error: (!this.refreshToken || retry ) ? error : function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.status === 401) {
                    that.refreshAccessToken(function(oauthResponse) {
                        that.setSessionToken(oauthResponse.access_token, null,
                        oauthResponse.instance_url);
                        that.ajax(path, callback, error, method, payload, true);
                    },
                    error);
                } else {
                  //  alert('poo');
                   // alert(errorThrown);
                    error(jqXHR, textStatus, errorThrown);
                }
            },
            dataType: "json",
            beforeSend: function(xhr) {
                if (that.proxyUrl !== null) {
                    xhr.setRequestHeader('SalesforceProxy-Endpoint', url);
                }
                app.sessionId = that.sessionId;
                xhr.setRequestHeader(that.authzHeader, "Bearer " + that.sessionId);
                xhr.setRequestHeader('X-User-Agent', 'salesforce-toolkit-rest-javascript/' + that.apiVersion);

                if (that.userAgentString !== null) {
                    xhr.setRequestHeader('User-Agent',that.userAgentString);
                }
            }
        });
    }



    /*
     * Lists summary information about each Salesforce.com version currently
     * available, including the version, label, and a link to each version's
     * root.
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in ca0 of error
     */
    forcetk.Client.prototype.versions = function(callback, error) {
        this.ajax('/', callback, error);
    }

    /*
     * Lists available resources for the client's API version, including
     * resource name and URI.
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */
    forcetk.Client.prototype.resources = function(callback, error) {
        this.ajax('/' + this.apiVersion + '/', callback, error);
    }

    /*
     * Lists the available objects and their metadata for your organization's
     * data.
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */
    forcetk.Client.prototype.describeGlobal = function(callback, error) {
        this.ajax('/' + this.apiVersion + '/sobjects/', callback, error);
    }

    /*
     * Describes the individual metadata for the specified object.
     * @param objtype object type; e.g. "Account"
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */
    forcetk.Client.prototype.metadata = function(objtype, callback, error) {
        this.ajax('/' + this.apiVersion + '/sobjects/' + objtype + '/'
        , callback, error);
    }

    /*
     * Completely describes the individual metadata at all levels for the
     * specified object.
     * @param objtype object type; e.g. "Account"
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */
    forcetk.Client.prototype.describe = function(objtype, callback, error) {
        this.ajax('/' + this.apiVersion + '/sobjects/' + objtype
        + '/describe/', callback, error);
    }

    /*
     * Creates a new record of the given type.
     * @param objtype object type; e.g. "Account"
     * @param fields an object containing initial field names and values for
     *               the record, e.g. {:Name "salesforce.com", :TickerSymbol
     *               "CRM"}
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */
    forcetk.Client.prototype.create = function(objtype, fields, callback, error) {
        this.ajax('/' + this.apiVersion + '/sobjects/' + objtype + '/'
        , callback, error, "POST", JSON.stringify(fields));
    }

    /*
     * Retrieves field values for a record of the given type.
     * @param objtype object type; e.g. "Account"
     * @param id the record's object ID
     * @param [fields=null] optional comma-separated list of fields for which
     *               to return values; e.g. Name,Industry,TickerSymbol
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */
    forcetk.Client.prototype.retrieve = function(objtype, id, fieldlist, callback, error) {
        if (!arguments[4]) {
            error = callback;
            callback = fieldlist;
            fieldlist = null;
        }
        var fields = fieldlist ? '?fields=' + fieldlist : '';
        this.ajax('/' + this.apiVersion + '/sobjects/' + objtype + '/' + id
        + fields, callback, error);
    }

    /*
     * Upsert - creates or updates record of the given type, based on the
     * given external Id.
     * @param objtype object type; e.g. "Account"
     * @param externalIdField external ID field name; e.g. "accountMaster__c"
     * @param externalId the record's external ID value
     * @param fields an object containing field names and values for
     *               the record, e.g. {:Name "salesforce.com", :TickerSymbol
     *               "CRM"}
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */
    forcetk.Client.prototype.upsert = function(objtype, externalIdField, externalId, fields, callback, error) {
        this.ajax('/' + this.apiVersion + '/sobjects/' + objtype + '/' + externalIdField + '/' + externalId
        + '?_HttpMethod=PATCH', callback, error, "POST", JSON.stringify(fields));
    }

    /*
     * Updates field values on a record of the given type.
     * @param objtype object type; e.g. "Account"
     * @param id the record's object ID
     * @param fields an object containing initial field names and values for
     *               the record, e.g. {:Name "salesforce.com", :TickerSymbol
     *               "CRM"}
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */
    forcetk.Client.prototype.update = function(objtype, id, fields, callback, error) {
        this.ajax('/' + this.apiVersion + '/sobjects/' + objtype + '/' + id
        + '?_HttpMethod=PATCH', callback, error, "POST", JSON.stringify(fields));
    }

    /*
     * Deletes a record of the given type. Unfortunately, 'delete' is a
     * reserved word in JavaScript.
     * @param objtype object type; e.g. "Account"
     * @param id the record's object ID
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */
    forcetk.Client.prototype.del = function(objtype, id, callback, error) {
        this.ajax('/' + this.apiVersion + '/sobjects/' + objtype + '/' + id
        , callback, error, "DELETE");
    }

    /*
     * Executes the specified SOQL query.
     * @param soql a string containing the query to execute - e.g. "SELECT Id,
     *             Name from Account ORDER BY Name LIMIT 20"
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */

    forcetk.Client.prototype.query = function(soql, callback, error,more) {
          if(typeof more == 'undefined') { more = false; }
          if(more)
            { q = '/' + this.apiVersion + '/query/' + escape(soql);  }
          else
            { q = '/' + this.apiVersion + '/query?q=' + escape(soql); }

       //  alert("QUERYING WITH : "+q);

        this.ajax(q, callback, error);
    }




    /*
     * Executes the specified SOSL search.
     * @param sosl a string containing the search to execute - e.g. "FIND
     *             {needle}"
     * @param callback function to which response will be passed
     * @param [error=null] function to which jqXHR will be passed in case of error
     */
    forcetk.Client.prototype.search = function(sosl, callback, error) {
        this.ajax('/' + this.apiVersion + '/search?q=' + escape(sosl)
        , callback, error);
    }
}
;;

_home = {

    model: null,
    calOptions : {},


    onExit : function() {

    },


    onLoaded: function () {


        layout.attach("#homeFront", false);
        $("#footerContainer").off("touchstart");
        $("#footerContainer").on("touchstart", false);
        /*
        _calendar.getOptions(function(options) {

            _home.calOptions = options;

            layout.attach("#homeFront", false);

        });
        */

    },


    Ctrl : function($scope) {




    },


    onMessage : function() {

    },


    test : function() {

      var modal = atajo.modal;
/*
      var init =  {
                     icon 	: 'fa-warning',  	// icon which will appear top left  - default : fa-warning
                     title 	: 'example',     	// title which will appear top right - default : notice

                     canCancel : 'true', 		// show cancel button - default: false
                     onOk      	: function(data) { _log.d("GOT SIG "+data); },	// callback function when OK button tapped
                     onCancel   : function() { alert('cancel'); },

                     content : 'Signature Of : Joe Blogs'

                  };

      modal.signature(init);
*/

var init =  {
               icon 	: 'fa-warning',  	// icon which will appear top left  - default : fa-warning
               title 	: 'example',     	// title which will appear top right - default : notice

               canCancel : 'true', 		// show cancel button - default: false
               onOk      	: function() { alert('ok'); },	// callback function when OK button tapped
               onCancel   : function() { alert('cancel'); },

               content : 'homeFront'

            };

modal.bind(init);


    }

};
;;

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

_keypad = {


    visible : false,
    currX   : 100,
    currY   : 100,

    currInputElm : null,
    nextInputElm : null,

    currDX : 0,
    currDY : 0,

    canMove : false,

    currFace: "",

    total : 0,

    delayedproccessing: null,
    inputs: null,

    show : function(e) {

        _keypad.hide();

        if(typeof e.target == 'undefined')
        {
            _elm = e;
        }
        else
        {
            _elm = $(e.target);
        }


        //return if disabled.
        //if(_elm.attr('inactive') == 'true') {  return; }



        //set the input as current...
        //_elm.closest('tr').find('td').each(function() { $(this).css({ background: 'rgba(255,60,60,0.6)'});  })

        _elm.css({background: 'rgba(255,60,60,0.6)'});

        //show the keypad...
        xml = $('#buffKeypad').html();

        //add to doc.
        $(xml).attr('id', 'currKeypad')
            .css({opacity:1,
                zIndex:1000000,
                position: 'absolute',
                top:_keypad.currY - _keypad.currDY,
                left:_keypad.currX - _keypad.currDX
            })
            .appendTo('body');


        //move button
        $('#currKeypad').on('touchstart', function(e) {

            setTimeout(function() {

                _keypad.canMove = true;

            }, 200);



            var touch = e.originalEvent.touches[0];
            pos = $('#currKeypad').position();
            _keypad.currDX =  ( touch.pageX - pos.left );
            _keypad.currDY =  ( touch.pageY - pos.top );

            //_log.d(pos.left+ '  '+_keypad.currDX + ' : '+pos.top+"  "+_keypad.currDY );

            $('body').on('touchmove', function(e) {  if(!_keypad.canMove) { return; }

                var touch = e.originalEvent.touches[0];
                _keypad.isMoving = true;
                // _log.d('cc -> '+touch.pageX + " - " + touch.pageY);

                $('#currKeypad').css({top:touch.pageY - _keypad.currDY,left:touch.pageX - _keypad.currDX});
                _keypad.currX = touch.pageX - _keypad.currDX;
                _keypad.currY = touch.pageY - _keypad.currDY;


            }).on('touchend', function() {
                _keypad.isMoving = false;
                $('body').off('touchmove').off('touchend');

                _keypad.canMove = false;

                // _keypad.currDX =  0;
                // _keypad.currDY =  0;

                return false;



            })

        });

        if(_elm.attr('isSuggested')) {

            _elm.attr('isSuggested', 'false');
            _elm.trigger('change');
            $('#currKeypad').find('.keypadScreen').val('');

        }




        _keypad.currInputElm = _elm;
        //SHAHID: DO THIS ON REBUILD AS REFERENCES CHANGE!
        //var inputs = $("#contentContainerContent .tabSetContentContainer > div.selected input.activeKey");



        $('#currKeypad').find('td').each(function(){

            td = $(this);

            td.on('touchstart', function(e) { e.preventDefault(); if(_keypad.isMoving) { return; }



                currVal = $(e.target).html();
                kScreen = $('#currKeypad').find('.keypadScreen');
                screenVal =  ( kScreen.val()  == '' ) ? '0' : kScreen.val();

                if(currVal == "CLOSE")
                {
                    _elm.trigger('change');
                    kScreen.val('0');
                    _keypad.hide();
                    if(_elm.hasClass('strategicQuantity')) {
                        _elm.css("background", "poop");
                    }


                }
                else if(currVal == "=") {  total = ( parseInt(screenVal) + ( _elm.val() == '' ? 0 : parseInt(_elm.val()) ) ); _elm.val(total); _elm.attr('value', total); kScreen.val('0'); _elm.trigger('change');   }
                else if(currVal == "CLEAR") {  kScreen.val('0');  }
                else if(currVal == "RESET") {  _elm.val('0'); _elm.attr('value', '0'); _elm.trigger('change'); total = 0;   }
                else if(currVal == "ENTER")
                {

                    //add the figure.
                  //  _log.d("SCREENVAL IS >"+screenVal+"<");
                    //total = ( parseInt(screenVal) + ( _elm.val() == '' ? 0 : parseInt(_elm.val()) ) );
                    if(kScreen.val() === '')
                    {
                        _log.d("NO VALUE. DO NOTHING");
                    }
                    else
                    {

                    total = parseInt(screenVal);
                    if((screenVal !== 0) && (total !== 0))
                    {
                        total = parseInt(screenVal);  // Only update the current... dont add.
                        _elm.val(total);
                        _elm.attr('value', total);
                        kScreen.val('0');
                        _elm.trigger('change');
                    } else if ((screenVal !== 0) && (total === 0)) {
                        total = parseInt(screenVal);  // Only update the current... dont add.
                        _elm.val(total);
                        _elm.attr('value', total);
                        kScreen.val('0');
                        _elm.trigger('change');
                    }

                    }




                    _keypad.currDX =  0;
                    _keypad.currDY =  0;

                    //var inputs = $("input.activeKey");
                    //Had to mod this to work with new tab struct
                    var currentIndex = _keypad.inputs.index(_elm);

                    if(currentIndex < 0) { currentIndex = 0; }
                  //  _log.d("CURRENT INDEX IS : "+currentIndex);

                    var next = null;

                    if ((currentIndex + 1) < _keypad.inputs.length) {
                         next = _keypad.inputs.filter(function (index) {
                            return index == currentIndex + 1;
                        });

                      //  _log.d("NEXT IS --> "+next);
                    } else {
                        if(_keypad.currFace == "#ullagesFront__FACE") {
                             next = _elm;
                        } else {
                             next = _keypad.inputs[0];
                          //  _log.d("NEXT IS -> "+next);

                        }
                    }
                    if (_elm.attr('SKU')) {

                        var a = _elm;
                        _keypad.nextInputElm = next;
                        _.currScrolls[0].scrollToElement($(next)[0], null, null, true);
                        _keypad.show($(_keypad.nextInputElm));
                        a.removeClass('strategicQuantity');
                        a = null;
                    } else {
                        _elm.removeClass('strategicQuantity');

                        _keypad.nextInputElm = next;
                      //  _log.d("SHOWING NEXT : "+currentIndex+ " / "+next);

                        try { _.currScrolls[0].scrollToElement($(next)[0], null, null, true); } catch (e) { _log.d("COULD NOT AUTO SCROLL");  }


                        _keypad.show($(_keypad.nextInputElm));

                    }


                }
                else {

                    if(kScreen.val() == '0') { kScreen.val(currVal); }
                    else
                    {
                        if(kScreen.val().length >= 4) { return; }
                        kScreen.val(kScreen.val() + '' +currVal);

                    }



                }

            });
        });
    },

    hide : function() {
        _keypad.currDX = 0;
        _keypad.currDY = 0;
        if(_keypad.currInputElm != null) {
            // _keypad.currInputElm.closest('tr').find('td').each(function() { $(this).css({background: 'rgba(255,255,255,1)'});  })
            //_keypad.currInputElm.css({ background: 'rgba(0,0,0,0.4)'});
            _keypad.currInputElm.css({background: 'rgba(0,0,0,0.4)'});
        };
        _keypad.currInputElm = null;
        $('#currKeypad').remove();
    },
    buildNumpad : function(_elm) {
        $(_elm).attr('readonly', 'true');
        $(_elm).addClass("activeKey");
        if($(_elm).attr("isSuggested") == 'true') {
            $(_elm).addClass("strategicQuantity");
        }
        $(_elm).on('touchstart', function(e) {
            if(e.target.tagName == "INPUT") {
                e.preventDefault();
                _keypad.show(e);
            }
        });
    },
    currNumpadElm : '',
    killNumpad : function(cb) {
        var elms = $(_keypad.currFace);
        $(elms).find(".keypadEnabled").each(function( index ) {
            $(this).off('touchstart');
        });
        if ($('#currKeypad').length) {
            //$('#currKeypad').transition({opacity:0,duration:200,complete:function() {  $('#currKeypad').remove(); cb(); }})
            $('#currKeypad').remove();
            //_keypad.currNumpadElm.css({background:"rgba(0,0,0,0.2)"}).closest('td').css({background: 'rgba(0,0,0,0)', borderTopRightRadius:0, borderBottomRightRadius:0});
            //if( _keypad.currNumpadElm.val() == '') {  _keypad.currNumpadElm.val('0'); }
            cb();
        } else { cb(); }
    },
    buildFaceKeypad: function(faceid) {
        var elms = $('#'+faceid+"__FACE");
        _keypad.currFace = "#"+faceid+"__FACE";
      //  _log.d("ATTACHING KEYPAD TO #"+faceid+"__FACE");

      //  _log.d("WITH "+$(elms).find(".keypadEnabled").length+" ELEMENTS");

        $(elms).find(".keypadEnabled").each(function( index ) {

        //  _log.d("ATTACHING TRIGGER TO "+index);

            _keypad.buildNumpad(this);
        });
        _keypad.inputs = $(elms).find('input.activeKey');
        var cardMutationSubscriber = $.pubsub('subscribe', 'cardMutation', function (topic, data) {
            //_log.d("Keypad Mutation Possible?  Build " + data.id + " blindly!");
            var me = data.id;
            $.pubsub('unsubscribe', cardMutationSubscriber);
            if(me == "orderFront__FACE") {
                var element = angular.element($('#orderFront__FACE'));
                element.scope().$apply();
                _.currScrolls[0].refresh();
            }
            if(me == "inventoryFront__FACE") {
                var element = angular.element($('#inventoryFront__FACE'));
                element.scope().$apply();
                _.currScrolls[0].refresh();
            }
            if(me == "ullagesFront__FACE") {
                var element = angular.element($('#ullagesFront__FACE'));
                element.scope().$apply();
                _.currScrolls[0].refresh();
            }
            _keypad.buildFaceKeypad(me.replace("__FACE", ""));

        });
    }
};;;




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

_sfHandler = {

    query : function(model, query, cb) {


        _sf.query(query,

            function(response) {

                _log.d(model + "items: " + response.totalSize);
                obj.RESPONSE = response.records;
                cb(obj);

            },

            function(jqXHR, textStatus, errorThrown) {

                _log.e("Error getting: " + model);
                _log.d("textStatus: " + textStatus);
                _log.d("errorThrown: " + errorThrown);
                obj.RESPONSE = false;
                cb(obj);

            }


        );

    },


    openSalesforce : function() {

      var currentCredentials = JSON.parse(window.localStorage.getItem('credentials'));
      var sessionId = currentCredentials.sessionId;

      //https://eu2.salesforce.com/secur/frontdoor.jsp
      var instanceUrl = encodeURI(currentCredentials.instanceUrl);

      var url = instanceUrl + '/secur/frontdoor.jsp?sid=' + sessionId;

      var url_args = "location=yes,clearcache=yes,clearsessioncache=yes";
      var target = "_blank";
      _log.d('openSalesforce with ' + url + " args : " + url_args);
      if (client.connectionState === 0) {
        var xml = "Your device must be online to open Salesforce.com";
        $(elm).html(_customer.customerDetailsPlaceholder);
        _modal.show("warning", "NOT ONLINE", xml, false, function() {
          _modal.hide();
        });
      } else {
        _loginStrategies.SALESFORCE.refreshToken(function(data) {
          var token = data.access_token;
          var ref = window.open(url, target, url_args);
          ref.addEventListener("exit", function() {

          });
          /*ref.addEventListener("loaderror", function() {
            var xml = "There was an error fetching the page from Salesforce";
            ref.close();
            _modal.show("warning", "ERROR LOADING SALESFORCE", xml, false, function() {
              _modal.hide();
              ref.close();
            });
          }); */
        }, function(data) {

          _log.d("ERROR REFRESHING TOKEN : " + data);
          var xml = "There was an error fetching refreshing your access token";
          ref.close();
          _modal.show("warning", "ERROR LOADING SALESFORCE", xml, false, function() {
            _modal.hide();
            ref.close();
          });

        });

      }


    },




}
;;

_signageRequest = {

    model: null,
    signageReasons: '',
    signageMaterial: '',
    signageBrand: '',
    image: false,
    signageUrgentReasons: [
        { Name: "Yes", value: true },
        { Name: "No", value: false }
    ],

    onExit: function (view, state) {
        if(state == 'fg') {
            _signageRequest.image = null;
            _signageRequest.model = null;
        }
    },


    onLoaded: function () {

    },


    onMessage: function (data) {

        _log.d(JSON.stringify(data));
        _signageRequest.model = data;

        _model.getAll("signageReasons", function (reasons) {

            _signageRequest.signageReasons = reasons;

            _model.getAll("signageMaterials", function (material) {

                _signageRequest.signageMaterial = material;

                _model.getAll("signageBrands", function (brand) {

                    _signageRequest.signageBrand = brand;
                    console.log(" materials : " + JSON.stringify(brand));

                    layout.attach('#signageRequestFront', true);
                    _signageRequest.formScroller = _scroll.add($('#signage-request-details-scroll')[0]);

                });

            });

        });
        /*
        var formToggleTimer = setTimeout(function () {

            _signageRequest.toggleForm();

        }, 4000);
        */


    },

    Ctrl: function ($scope) {
        $scope.sigUrgentShow = "hidden";

        $scope.customerName = _customer.model.Name;
        $scope.UrgentShow = function () {
            if ($scope.sigReason.Name == "Redo") {
                $scope.sigUrgentShow = "visible";
            } else {
                $scope.sigUrgentShow = "hidden";
            }
        }


        $scope.signageBrands = _signageRequest.signageBrand;
        $scope.signageMaterials = _signageRequest.signageMaterial;
        $scope.signageReasons = _signageRequest.signageReasons;
        $scope.signageUrgentReasons = _signageRequest.signageUrgentReasons;
        // $scope.updateTask = _checklist.updateTask;


        $scope.submitSignage = function () {

            if ($scope.sigReason == undefined || $scope.sigReason == '') {
                _modal.show("warning", "Signage", "Please select a reason. ", true, function () {
                    //do something when ok is pressed

                    _modal.hide();

                })
            } else if ($scope.sigMaterial == undefined || $scope.sigMaterial == '') {
                _modal.show("warning", "Signage", "Please select material. ", true, function () {
                    //do something when ok is pressed

                    _modal.hide();

                })
            } else if ($scope.sigBrand == undefined || $scope.sigBrand == '') {
                _modal.show("warning", "Signage", "Please select a brand. ", true, function () {
                    //do something when ok is pressed

                    _modal.hide();

                })
            } else if ($scope.signageSubject == undefined || $scope.signageSubject == '') {
                _modal.show("warning", "Signage", "Please enter a subject. ", true, function () {
                    //do something when ok is pressed

                    _modal.hide();

                })
            } else {

                _log.d("Adding task to signage: " + JSON.stringify($scope.sigMaterial));
                var tmp_date = new Date();
                var sr = {

                    SignNumber: "1",
                    CustomerId: _signageRequest.model.CustomerId__c,
                    SignageReason: $scope.sigReason.Code__c,
                    MaterialCode: $scope.sigMaterial.Code__c,
                    BrandCode: $scope.sigBrand.Code__c,
                    SubjectLine: $scope.signageSubject,
                    Comments: $scope.comments

                }

                var signageList = {'lst_SignWriting': [sr]};

                var imageJob = {
                    CustomerId: _signageRequest.model.CustomerId__c,
                    imageData: _signageRequest.image,
                    listType: 'lst_SignWriting',
                    imageUriField: 'SFDC_ImageId',
                    data: signageList
                }

                var jobName = "Add Signage Request";
                var jobDesc = _customer.model.Name;
                var jobData = {action: 'submitSignage', data: imageJob};
                jobQueue.addJob(jobName, jobDesc, jobData, true, false, false);

                layout.goBack();

            }


        };


        $scope.currImg = _signageRequest.image;

        $scope.addPic = function () {
            _camera.getPic(function (imageData) {

                _signageRequest.image = imageData;
                layout.attach('#signageRequestFront');
            }, 480, 620);
        };

        $scope.delPic = function () {
            var xml = "<p>Discard the current image?</p>";
            _modal.show('warning', 'DISCARD CAPTURED IMAGE', xml, true, function () {
                _signageRequest.image = null;
                layout.attach('#signageRequestFront');
                _modal.hide();
            }, function () {
                _modal.hide();
            }, false);
        }


    },

    formOpen: true,
    toggleForm: function () {
        var _ = _signageRequest;


        L1 = _.formOpen ? -420 : 0;
        _.formOpen = _.formOpen ? false : true;
        btnChar = _.formOpen ? '&#xf00d;' : '&#xf03a;';
        $('#signage-request-details-simple-view').animate({
            left: L1,
            duration: 300
        });
        $('#btnFormToggle').find('.gui-extra').html(btnChar);
    },


};
;
;
;;

_standardTask = {

    model: null,
    users: '',
    accounts: "",
    currUser:"",


    onExit: function (view, state) {


        if(state == 'fg') {
            var _ = this;
            _standardTask.model = null;
            _standardTask.users = null;
            _standardTask.accounts = "";
            _standardTask.formScrollerA = null;
            _standardTask.formScrollerB = null;
        }


    },

    lockCB : null,
    onLoaded: function (view, card, lock) { var _ = this;

        _.lockCB = lock;
        _.lockCB('lock');

        var currentCredentials = JSON.parse(window.localStorage.getItem('credentials'));
        _log.d("User details:" + JSON.stringify(currentCredentials));

        _calendar.getOptions(function(options) {

            _standardTask.calOptions = options;

            _model.getAll("users", function (users) {
                _standardTask.users = users;
                _log.d("USERS : " + JSON.stringify(users));


                for (var i in _standardTask.users) {

                    
                   if(typeof _standardTask.users[i].Id == 'undefined') { continue; }

                   _log.d(_standardTask.users[i].Id + ' ('+_standardTask.users[i].FirstName+' '+_standardTask.users[i].LastName+') == '+currentCredentials.userId);

                    if(_standardTask.users[i].Id == currentCredentials.userId){
                        //var currUser = user.FirstName;

                        _log.d("user.FirstName :" + _standardTask.users[i].FirstName);
                        _.currUser = _standardTask.users[i].LastName + ", " +_standardTask.users[i].FirstName;
                    }
                }


                _model.getAll("accounts", function (accounts) {
                    // console.log("accounts :"+JSON.stringify(accounts));
                    _standardTask.accounts = accounts;
                    layout.attach('#standardTaskFront', true);

                    _.lockCB('release');

                    _log.d("Start binding new scrollers");
                    setTimeout(function () {
                        _standardTask.formScrollerA = new iScroll($('div#scrollableAutoCompleteWrapper')[0], {
                            onBeforeScrollStart: function (e) {
                                e.stopPropagation();
                            },
                            preventDefaultException: {tagName: /.*/},
                            mouseWheel: true,
                            scrollbars: true,
                            keyBindings: false,
                            deceleration: 0.0002
                        });
                        _standardTask.formScrollerB = new iScroll($('div#scrollableAutoCompleteWrapper')[1], {
                            onBeforeScrollStart: function (e) {
                                e.stopPropagation();
                            },
                            preventDefaultException: {tagName: /.*/},
                            mouseWheel: true,
                            scrollbars: true,
                            keyBindings: false,
                            deceleration: 0.0002
                        });
                    }, 4000);

                });

            });

        });

    },


    onMessage: function () {


    },

    Ctrl: function ($scope) { var _ = _standardTask;

        _.calOptions.position = "bottom right";
        $scope.calOptions = _.calOptions;


        $scope.users = _.users;
        $scope.userNames = [];
        $scope.accountNames = [];
        $scope.accounts = _.accounts;
        $scope.selectedUserIndex = '';


        $scope.priority = [{"Name": "High"}, {"Name": "Normal"}, {"Name": "Low"}];
        $scope.selectedPriority = $scope.priority[1];



        _log.d("currUser in ctrl:" + _.currUser);
        $scope.selectedUser = _.currUser;


        for (var k = 0; k < $scope.users.length; k++) {
            // _log.d("Name--:"+$scope.users[k].FirstName);
            $scope.userNames.push($scope.users[k].LastName + ", " + $scope.users[k].FirstName);

        }
        //console.log("TTTT"+JSON.stringify($scope.accounts));
        for (var j = 0; j < $scope.accounts.length; j++) {
          //  _log.d("accounts Name--:"+JSON.stringify($scope.accounts[j]));
            $scope.accountNames.push($scope.accounts[j].Name);

        }
        $scope.submitTask = function () {


            if ($scope.subject == undefined || $scope.subject == '') {
                _modal.show("warning", "Standard Task", "Please enter a subject. ", true, function () {
                    //do something when ok is pressed

                    _modal.hide();

                })
            } else if ($scope.comments == undefined || $scope.comments == '') {
                _modal.show("warning", "Standard Task", "Please enter a comment. ", true, function () {
                    //do something when ok is pressed

                    _modal.hide();

                })
            } else if ($scope.dueDate == undefined || $scope.dueDate == '') {
                _modal.show("warning", "Standard Task", "Please select a date. ", true, function () {
                    //do something when ok is pressed

                    _modal.hide();

                })
            } else if ($scope.selectedAcc == undefined || $scope.selectedAcc == '') {
                _modal.show("warning", "Standard Task", "Please enter an account. ", true, function () {
                    //do something when ok is pressed

                    _modal.hide();

                })
            } else if ($scope.selectedUser == undefined || $scope.selectedUser == '') {
                _modal.show("warning", "Standard Task", "Please enter user. ", true, function () {
                    //do something when ok is pressed

                    _modal.hide();

                })
            } else {


                $scope.validateAccount(function (rt) {

                    if (rt !== -1) {
                        //alert("found match:");
                        $scope.validateUser(function (rtU) {
                            if (rtU !== -1) {
                                //alert("found match: user");

                                var jobData = {
                                    SFDC_TaskId: "",
                                    SFDC_OwnerId: $scope.users[rtU].Id,
                                    CustomerId: $scope.accounts[rt].CustomerId__c,
                                    //SFDC_ContactId 	: '', // Can be left out.
                                    Subject: $scope.subject,
                                    Comments: $scope.comments,
                                    DueDate: $scope.dueDate,
                                    Priority: $scope.selectedPriority.Name

                                };
                                var taskData = [jobData];
                                var curr = {'lst_Task': taskData};
                                jobName = "Standard task";
                                jobDesc = $scope.accounts[rt].Name;
                                jobData = {action: 'submitStandardTask', data: curr};
                                jobQueue.addJob(jobName, jobDesc, jobData, true, false, false);

                                layout.sendMessage('home', {});


                            }
                        })

                    }
                });


            }

        }


        $scope.validateAccount = function (callBack) {
            for (var j = 0; j < $scope.accounts.length; j++) {
                //   console.log("accounts Name--:"+JSON.stringify($scope.accounts[j]));
                if ($scope.accounts[j].Name == $scope.selectedAcc) {
                    // alert("found match:"+$scope.accounts[j].Name);
                    callBack(j);
                    break;
                }
                if (j == $scope.accounts.length - 1) {
                    callBack(-1);
                    _modal.show("warning", "Standard Task", "Invalid Account entered, Please re enter. ", true, function () {
                        //do something when ok is pressed
                        _modal.hide();
                    })
                }
            }
        }


        $scope.validateUser = function (callBack) {
            for (var k = 0; k < $scope.users.length; k++) {
                // console.log("Name--:"+$scope.users[k].FirstName);
                //if ($scope.users[k].FirstName == $scope.selectedUser) {
                    if(($scope.users[k].LastName + ", " +$scope.users[k].FirstName) == $scope.selectedUser){
                    //alert("found match:"+$scope.users[k].FirstName);
                    callBack(k);
                    break;
                }
                if (k == $scope.users.length - 1) {
                    callBack(-1);
                    _modal.show("warning", "Standard Task", "Invalid User entered, Please re enter. ", true, function () {
                        //do something when ok is pressed
                        _modal.hide();
                    })
                }
            }
        }


        $scope.clearCust=function(){
            $scope.selectedAcc='';
        }


        $scope.clearUser=function(){
            $scope.selectedUser='';
        }


        $scope.doSomething = function (typedthings) {
            setTimeout(function() {
                _standardTask.formScrollerA.refresh();
                _standardTask.formScrollerB.refresh();
            }, 2000);
            _log.d("REFRESH SCROLLBARS");
        }

        $scope.doSomethingElse = function (suggestion) {
            //_standardTask.formScrollerA.refresh();
            //_standardTask.formScrollerB.refresh();
        }

    }

};
;
;
;;

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

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

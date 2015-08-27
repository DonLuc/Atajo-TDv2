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

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

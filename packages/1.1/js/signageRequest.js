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

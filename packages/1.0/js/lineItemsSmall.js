_lineItemsSmall = {

    model: null,
    records: [],

    onExit: function () {
        var _ = this;

    },

    onLoaded: function () {
        var _ = this;

    },

    onMessage: function (data) {
        _lineItemsSmall.model = data;
        var target = $('#lineItemsSmallFront__FACE').find('.moduleHeader');
       // target.html("<h2>hello header {{test}}</h2>");
        target.html(data.htmlHeader);

        // var target1 = $('#lineItemsSmallFront__FACE').find('.moduleLine');
        //target1.html("<h2>hello line {{test}}</h2>");

        var target2 = $('#lineItemsSmallFront__FACE').find('.moduleFooter');
        target2.html("<h2>hello footer {{test}}</h2>");
        target2.html(data.htmlFooter);

        //setTimeout
        layout.attach("#lineItemsSmallFront");
    },

    Ctrl: function ($scope) {

        $scope.test = "hello world 222";
        $scope.lineItems = _lineItemsSmall.model.items;
        $scope.headerItems=_lineItemsSmall.model.modelHeader;
        $scope.footerItems=_lineItemsSmall.model.modelFooter;
        $scope.showCat = true;
        $scope.showLine = _moduleContainer.showLine;
        $scope.showHeader = _moduleContainer.showHeader;
        $scope.showFooter = _moduleContainer.showFooter;
        $scope.hasFooter = _moduleContainer.hasFooter
        $scope.hasLine = _moduleContainer.hasLine;
        $scope.hasHeader = _moduleContainer.hasHeader;


        var currCat = [];
        for (var j = 0; j < _lineItemsSmall.model.categories.length; j++) {
            var currObj = _lineItemsSmall.model.categories[j];
            if (!currObj.hasOwnProperty("parent")) {
                currCat.push(currObj);
            }
            if (j == _lineItemsSmall.model.categories.length - 1)
                $scope.categories = currCat;
        }

        $scope.nextCat = function (parent, items,id) {

            console.log("prev7");
            console.log("next cat ...");
            var subCat = [];
            for (var j = 0; j < _lineItemsSmall.model.categories.length; j++) {
                var currObj = _lineItemsSmall.model.categories[j];
                if (currObj.hasOwnProperty("parent") && currObj.parent == parent) {
                    subCat.push(currObj);
                }
                if (j == _lineItemsSmall.model.categories.length - 1)
                    if (subCat.length == 0) {

                        $scope.showCat = false;
                        _moduleContainer.currCatName = parent;

                        console.log("show line items list");
                        $(".lineItems").hide();
                        $(".cat_"+id).show();
                        //var e = document.getElementById('lineItemsSmallFront__FACE');
                        //var scope = angular.element(e).scope();
                        //scope.$apply();
                    } else {
                        $scope.categories = subCat;
                    }
            }
        }


        $scope.prevCat = function () {
            console.log("prev");
            var subCat = [];

            if ($scope.categories[0].hasOwnProperty("parent")) {
                var parent = $scope.categories[0].parent;
                console.log("prev name:" + parent);

                for (var j = 0; j < _lineItemsSmall.model.categories.length; j++) {
                    var currObj = _lineItemsSmall.model.categories[j];
                    if (currObj.name == parent) {
                        subCat.push(currObj);
                    }
                    if (j == _lineItemsSmall.model.categories.length - 1)
                        if (subCat.length == 0) {
                            //$scope.lineItems = items;
                            //$scope.showCat = false;
                        } else {
                            $scope.categories = subCat;
                        }
                }
            }
        }


        $scope.backToCat = function () {
            $scope.showCat = true;
        }
        $scope.openLineItem = function (idx) {
            _cardEngine.flip("lineItemsSmall", "lineItemsModule");
            var target1 = $('#lineItemsModule__FACE').find('.moduleLine');
            target1.html(_lineItemsSmall.model.htmlLine);
          //  _lineItemsSmall.items = _lineItemsSmall.model.items;
          //  _lineItemsSmall.items = _lineItemsSmall.model.items;
            layout.attach("#lineItemsModule");
        }
        console.log("angular loaded");
        $scope.showNext = function () {
            console.log("Show next");

            if (!_moduleContainer.showLine && _moduleContainer.hasLine) {
                console.log("Show line");
                _moduleContainer.showLine = true;
                _moduleContainer.showHeader = false;
                $scope.showLine = true;
                $scope.showHeader = false;

            } else if (!_moduleContainer.showFooter && _moduleContainer.hasFooter) {
                console.log("Show footer");
                _moduleContainer.showFooter = true;
                _moduleContainer.showHeader = false;
                _moduleContainer.showLine = false;
                $scope.showFooter = true;
                $scope.showLine = false;
                $scope.showHeader = false;

            }


        };

        $scope.showPrev = function () {
            console.log("Show prev");


            if (_moduleContainer.showLine && _moduleContainer.hasLine) {
                _moduleContainer.showLine = false;
                _moduleContainer.showHeader = true;
                $scope.showFooter = false;
                $scope.showLine = false;
                $scope.showHeader = true;
            } else if (_moduleContainer.showFooter && _moduleContainer.hasFooter) {

                _moduleContainer.showFooter = false;
                _moduleContainer.showLine = true;
                $scope.showFooter = false;
                $scope.showLine = true;
                $scope.showHeader = false;
            }
        };


        $scope.nextVisible=function(){
            console.log("show next button");
            if(_moduleContainer.showHeader==true && _moduleContainer.hasLine==true){
                console.log("show next button 1");
                return true;
            }else if(_moduleContainer.showLine==true && _moduleContainer.hasFooter==true ){
                console.log("show next button 2");
                return true;
            }else if(_moduleContainer.showHeader==true && _moduleContainer.hasFooter==true){
                console.log("show next button 3");
                return true;
            }else {
                console.log("show next button5");
                return false

            };
        }
        $scope.prevVisible=function(){
            console.log("show prev button");
            if(_moduleContainer.showLine==true && _moduleContainer.hasHeader==true){
                console.log("show prev button1");
                return true;
            }else if(_moduleContainer.showFooter==true && _moduleContainer.hasLine==true ){
                console.log("show prev button2");
                return true;
            }else if(_moduleContainer.showFooter==true && _moduleContainer.hasHeader==true){
                console.log("show prev button3");
                return true;
            }else {
                console.log("show prev button4");
                return false;

            };
        }

    },

    lineCtrl: function ($scope) {
        $scope.lineItems = _lineItemsSmall.items;

    }


};
;
;
;
;
;
;
;
;
;
;;;
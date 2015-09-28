_moduleListSmall = {

    model: null,
    entityId: null,
    itemsModel: "Nothing to Display",
    id: null,
    moduleModel: [],

    onExit: function () {
        var _ = this;

    },

    onLoaded: function () {
        var _ = this;

    },

    onMessage: function (data) {


        _moduleListSmall.entityId = data.entityId;
        _model.get("Modules", {"entityId": _moduleListSmall.entityId}, function (moduleData) {
            if (moduleData) {
                _moduleListSmall.model = moduleData[0].data.modules;
            } else {
                _moduleListSmall.model = [];
            }
            layout.attach('#moduleListSmallFront');
        });
    },

    moduleCtrl: function ($scope) {
        $scope.modules = _moduleListSmall.model;
    },
    moduleViewerCtrl: function ($scope) {

        $scope.records = [{"name": "test1 record"}, {"name": "test2 record"}, {"name": "test3 record"}];
        $scope.test = "hello world 222";
        //   $scope.itemsHTML = _moduleListSmall.itemsModel;
        $scope.headerItems = _moduleListSmall.moduleModel;
        //   $scope.moduleName=_moduleListSmall.moduleName;

        if (_moduleContainer.showHeader) {
            $scope.moduleHeader = _moduleContainer.moduleHeadingH;
        } else if (_moduleContainer.showLine) {
            $scope.moduleHeader = _moduleContainer.moduleHeadingL;
        } else if (_moduleContainer.showFooter) {
            $scope.moduleHeader = _moduleContainer.moduleHeadingF;
        } else {
            $scope.moduleHeader = "No data";
        }


    },
    loadModuleView: function (data) {
        _cardEngine.flip("moduleListSmall", "moduleListSmallViewer");

        _moduleListSmall.id = $(data).attr("module_id");
        _model.get("moduleItems", {"moduleId": _moduleListSmall.id}, function (d) {
            console.log("found module data");
            _moduleListSmall.moduleName = '';
            _moduleListSmall.itemsModel = d[0];
            _moduleListSmall.moduleModel = d[0].model;
            _moduleListSmall.moduleName = d[0].moduleName;


            if (d[0].htmlHeader == "") {
                _moduleContainer.hasHeader = true;
                _moduleContainer.showHeader = true;
                _moduleContainer.showLine = false;
                _moduleContainer.showFooter = false;
                _moduleContainer.moduleHeadingH = d[0].moduleName + "-Header";

            } else if (d[0].htmlLine != "") {
                _moduleContainer.showHeader = false;
                _moduleContainer.showLine = true;
                _moduleContainer.showFooter = false;
            } else if (d[0].htmlFooter != "") {
                _moduleContainer.showHeader = false;
                _moduleContainer.showLine = false;
                _moduleContainer.showFooter = true;
            }


            if (d[0].htmlLine != "") {
                _moduleContainer.hasLine = true;
            }

            if (d[0].htmlFooter == "") {
                _moduleContainer.hasFooter = true;
            }
            layout.attach("#moduleListSmallViewer");

            _log.d("FLIPPING TO : ");

        });
    },
    flip: function (flipTarget, before, cb) {
        if (before) {
            before(function () {
                _cardEngine.flip("moduleListSmall", flipTarget, function (release) {
                    release();
                    layout.attach('#' + flipTarget);
                    if (cb) {
                        cb();
                    }
                });
            });
        } else {
            _cardEngine.flip("moduleListSmall", flipTarget, function (release) {
                release();
                layout.attach('#' + flipTarget);
                if (cb) {
                    cb();
                }
            });
        }
    },

    next: function () {
        layout.sendMessage("lineItemsSmall", _moduleListSmall.itemsModel);
    }
};
;
;
;
;;;
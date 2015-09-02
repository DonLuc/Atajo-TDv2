_moduleListSmall = {

    model: null,
    entityId : null,
    itemsModel : "Nothing to Display",
    id : null,
    moduleModel:[],

    onExit : function() { var _ = this;

    },

    onLoaded: function () { var _ = this;

    },

    onMessage : function(data) {


        _moduleListSmall.entityId = data.entityId;
        _model.get("Modules", { "entityId" : _moduleListSmall.entityId }, function (moduleData) {
            if (moduleData) {
                _moduleListSmall.model = moduleData[0].data.modules;
            } else {
                _moduleListSmall.model = [];
            }
            layout.attach('#moduleListSmallFront');
        });
    },

    moduleCtrl: function($scope) {
        $scope.modules    = _moduleListSmall.model;
    },
    moduleViewerCtrl : function($scope) {
        $scope.test="hello world";
        //   $scope.itemsHTML = _moduleListSmall.itemsModel;
        $scope.items=_moduleListSmall.moduleModel;

    },
    loadModuleView : function(data) {
        _cardEngine.flip("moduleListSmall","moduleListSmallViewer");

        _moduleListSmall.id = $(data).attr("module_id");
        _model.get("moduleItems",{"moduleId": _moduleListSmall.id},function(d) {

            _moduleListSmall.itemsModel = d[0].html;
            _moduleListSmall.moduleModel=d[0].model;
            _log.d("FLIPPING TO : ");
            var newxml =_cardEngine.processTagsFromXML(d[0].html, 'moduleListSmallViewer');
            var target = $('#moduleListSmallViewer__FACE').find('.moduleSection');
            target.html(newxml);
            layout.attach("#moduleListSmallViewer",true);


            //_moduleListSmall.flip("moduleListSmallViewer",
            //    function (cb) {
            //        _moduleListSmall.itemsModel = d[0].html;
            //        _moduleListSmall.moduleModel=d[0].model;
            //         _log.d("FLIPPING TO : ");
            //        cb();
            //    },
            //    function () {
            //        _log.d("FLIPPED TO : ");
            //    }
            //);
        });
    },
    flip : function(flipTarget, before, cb) {
        if(before) {
            before(function () {
                _cardEngine.flip("moduleListSmall", flipTarget, function(release) {
                    release();
                    layout.attach('#'+flipTarget);
                    if(cb) {
                        cb();
                    }
                });
            });
        } else {
            _cardEngine.flip("moduleListSmall", flipTarget, function(release) {
                release();
                layout.attach('#'+flipTarget);
                if(cb) {
                    cb();
                }
            });
        }
    }
};;;
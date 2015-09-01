_moduleListSmall = {

    model: null,
    entityId : null,
    itemsModel : "Nothing to Display",

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
        $scope.itemsHTML = _moduleListSmall.itemsModel;
    },
    loadModuleView : function(data) {
        var id = $(data).attr("module_id");
        _moduleListSmall.flip("moduleListSmallViewer",
            function (cb) {
                _moduleListSmall.itemsModel = "Some bullshit!";
                _log.d("FLIPPING TO : ");
                cb();
            },
            function () {
                _log.d("FLIPPED TO : ");
            }
        );
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
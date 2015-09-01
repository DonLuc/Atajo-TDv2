_moduleListSmall = {

    model: null,
    entityId : null,

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
    }
};;;
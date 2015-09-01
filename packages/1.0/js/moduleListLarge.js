_moduleListLarge = {

    model: null,
    entityId : null,

    onExit : function() { var _ = this;

    },

    onLoaded: function () { var _ = this;

    },

    onMessage : function(data) {
        _moduleListLarge.entityId = data.entityId;
        _model.get("Modules", { "entityId" : _moduleListLarge.entityId }, function (moduleData) {
            if (moduleData) {
                _moduleListLarge.model = moduleData[0].data.modules;
            } else {
                _moduleListLarge.model = [];
            }
            layout.attach('#moduleListLargeFront');
        });
    },

    moduleCtrl: function($scope) {
        $scope.modules    = _moduleListLarge.model;
    }
};;;
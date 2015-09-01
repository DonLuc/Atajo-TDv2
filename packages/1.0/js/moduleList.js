_moduleList = {

    model: null,
    entityId : null,

    onExit : function() { var _ = this;

    },

    onLoaded: function () { var _ = this;

    },

    onMessage : function(data) {
        _moduleList.entityId = data.entityId;
        _model.get("Modules", { "entityId" : _moduleList.entityId }, function (moduleData) {
            if (moduleData) {
                _moduleList.model = moduleData[0].data.modules;
            } else {
                _moduleList.model = [];
            }
            layout.attach('#moduleFront');
        });
    },

    moduleCtrl: function($scope) {
        $scope.modules    = _moduleList.model;
    }
};;;
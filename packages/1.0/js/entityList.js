_entityList = {

    model: null,

    onExit : function() { var _ = this;

    },

    onLoaded: function () { var _ = this;
        _model.getAll("callCycles", function (entities) {
            if (entities) {
                _entityList.model = entities;
            } else {
                _entityList.model = [];
            }
            layout.attach('#entityFront');
        });
    },

    onMessage : function() {

    },

    entityCtrl: function($scope) {
        $scope.entities    = _entityList.model;
    },
    loadModule : function (data) {
        layout.sendMessage("moduleList", { entityId : $(data).attr("entityId") });
    }
};;;
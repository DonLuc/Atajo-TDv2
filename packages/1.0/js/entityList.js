_entityList = {

    model: null,

    onExit : function() { var _ = this;

    },

    onLoaded: function () { var _ = this;


        _model.getAll("callCycles", function (entities) {
            _entityList.model = entities;

            //alert("_entityList.model" + JSON.stringify(_entityList.model));

            if (_entityList.model.length > 0) {
                //alert("entities" + JSON.stringify(_entityList.model[0]));

                layout.attach('#entityFront');
            }

        });




    },

    onMessage : function() {

    },

    entityCtrl: function($scope) {

        //alert("inside entityCtrl!!!");

        $scope.entities    = _entityList.model;


    }
};;;
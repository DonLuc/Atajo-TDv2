_moduleViewerLarge = {

    model: null,
    itemsModel : "Nothing to Display",

    onExit : function() { var _ = this;

    },

    onLoaded: function () { var _ = this;

    },

    onMessage : function(data) {
        _moduleViewerLarge.id = data.module_id;
        // layout.attach('#moduleViewerLargeFront');

        _model.get("moduleItems",{"moduleId": _moduleViewerLarge.id},function(d){
            _moduleViewerLarge.itemsModel=d[0].html;
            layout.attach('#moduleViewerLargeFront');
        });
    },
    Ctrl : function($scope) {
        $scope.itemsHTML = _moduleViewerLarge.itemsModel;

    }
};;;